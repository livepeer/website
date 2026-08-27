import fs from "node:fs";
import path from "node:path";

import { blocksToHtml } from "./notion-blocks";
import {
  WORKSTREAMS,
  targetSortKey,
  type Commitment,
  type CommitmentLink,
  type CommitmentState,
  type Person,
  type Workstream,
} from "./roadmap";

/**
 * The commitment register, read from Notion.
 *
 * Notion is the source of truth for the roadmap — the one place the site takes
 * content from a CMS. It earns the exception: the register is edited by people
 * across several organisations who do not open pull requests, and a commitment
 * whose state is a week stale is worse than no page at all. Everything else on
 * the site stays in-repo (see CLAUDE.md → Content).
 *
 * Three databases: Roadmap commitments, Livepeer people, and Organizations.
 * People and owners are relations rather than repeated text so that a name,
 * portrait or handle is stated once — the markdown register had eight copies
 * of the same person, and they had already drifted.
 *
 * Both sit beside the register rather than inside it, and are named for
 * everyone rather than for the roadmap, because the same rows are meant to be
 * pointed at from elsewhere on the site later.
 *
 * `Accountable` is the person to ask, rendered in the expanded panel as
 * "Contact". The card face still names the organisation, because that is who
 * committed — but a reader whose date has moved needs a human, and an
 * organisation cannot answer a question.
 *
 * The mapping is deliberately strict. Every rule the markdown reader enforced
 * is enforced here too, and a record that breaks one fails the build rather
 * than rendering a card that quietly claims less than it should. The error
 * names the row and links to it, because the person who has to fix it is
 * looking at Notion, not at this file.
 */

const API = "https://api.notion.com/v1";

/**
 * Pinned, not floating. Notion versions its API by date and changes response
 * shapes between them; an unpinned client breaks on someone else's schedule.
 */
const NOTION_VERSION = "2022-06-28";

/**
 * The three databases, overridable for a staging copy.
 *
 * Defaulted rather than required: the ids are not secret — they appear in
 * every Notion URL — and a required env var for a constant that changes once
 * a year is a deployment failure waiting to happen. The token is the secret,
 * and it has no default.
 */
const COMMITMENTS_DB =
  process.env.NOTION_ROADMAP_DB ?? "0a51970884f44514a405f63d6bdb68db";
const PEOPLE_DB =
  process.env.NOTION_PEOPLE_DB ?? "cdaf4aff05034435aed838eb2a8676ab";
const ORGS_DB =
  process.env.NOTION_ORGS_DB ?? "728d4f42db6d4ba4925ae177c08b1d70";

/**
 * How stale the page may be, in seconds.
 *
 * Nothing runs on this timer. Next regenerates on request, so a quiet site
 * makes no Notion calls at all — this is how stale a page a visitor may be
 * served before it is refreshed behind them, not a polling interval. Which is
 * why five minutes costs approximately nothing: the busier the page, the more
 * it matters, and the quieter it is, the less it runs.
 *
 * A minute, because this is the only mechanism that serves the people we
 * actually asked to maintain the register. They edit the board in Notion and
 * then look at the site; a wait long enough to doubt reads as a broken
 * integration, and the habit we want does not survive that.
 *
 * A minute of continuous traffic is around 960 Notion requests an hour, or
 * 0.27/sec against a limit near 3 — an order of magnitude of headroom, and
 * far less on a quiet page. Zero is the value that would not work: it makes
 * every visitor's request fetch the register sixteen times over.
 *
 * What no window fixes is the stale serve. The first request after one
 * expires still gets the old page while the new one builds behind it, so an
 * editor reloads twice regardless. Only the webhook removes that, because a
 * purge has no stale phase.
 *
 * So this is a stopgap with a known end: the Notion webhook needs the site on
 * its production domain and an admin to subscribe it, and until then it is
 * the only thing serving anyone without a secret. Once it is live and proven
 * to fire on API edits, put this back up — it becomes a backstop.
 */
const REVALIDATE = Number(process.env.NOTION_REVALIDATE ?? 60);

/** Where a person's profile lives; the card builds the URL from a handle. */
const PROFILE_HOST = "forum.livepeer.org";

/** Portraits are served from the repo, so the filename must resolve to one. */
const AVATAR_DIR = path.join(process.cwd(), "public", "people");

/** Whether the register can be read from Notion at all. */
export function hasNotionCredentials(): boolean {
  return Boolean(process.env.NOTION_TOKEN);
}

type Json = Record<string, unknown>;

async function notion(endpoint: string, init?: RequestInit): Promise<Json> {
  const token = process.env.NOTION_TOKEN;
  if (!token) {
    throw new Error(
      "NOTION_TOKEN is not set. The roadmap register is read from Notion; " +
        "set the internal integration token in the deployment environment."
    );
  }

  const res = await fetch(`${API}${endpoint}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": NOTION_VERSION,
      "Content-Type": "application/json",
      ...init?.headers,
    },
    next: { revalidate: REVALIDATE },
  });

  if (!res.ok) {
    // Notion's own message is the useful part — "Could not find database with
    // ID" means the integration was never shared with it, which is the single
    // most common way this fails and is invisible from the status code alone.
    const body = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(
      `Notion ${res.status} on ${endpoint}: ${body.message ?? res.statusText}`
    );
  }
  return (await res.json()) as Json;
}

/** Every row, following Notion's cursor rather than assuming one page. */
async function queryAll(databaseId: string): Promise<Json[]> {
  const rows: Json[] = [];
  let cursor: string | undefined;
  do {
    const page = await notion(`/databases/${databaseId}/query`, {
      method: "POST",
      body: JSON.stringify({
        page_size: 100,
        ...(cursor ? { start_cursor: cursor } : {}),
      }),
    });
    rows.push(...((page.results as Json[]) ?? []));
    cursor = page.has_more ? (page.next_cursor as string) : undefined;
  } while (cursor);
  return rows;
}

type RichText = { plain_text?: string; href?: string | null };

function props(row: Json): Record<string, Json> {
  return (row.properties as Record<string, Json>) ?? {};
}

/**
 * The runs behind a title, a rich text property, or a block's inline content —
 * all three of which Notion shapes the same way under a different key.
 */
function richText(prop: Json | undefined): RichText[] {
  if (!prop) return [];
  const key = typeof prop.type === "string" ? prop.type : "rich_text";
  const value = prop[key] ?? prop.rich_text;
  return Array.isArray(value) ? (value as RichText[]) : [];
}

/** A rich text or title property flattened to the string it reads as. */
function text(prop: Json | undefined): string {
  return richText(prop)
    .map((run) => run.plain_text ?? "")
    .join("")
    .trim();
}

function selectName(prop: Json | undefined): string | undefined {
  const value = prop?.select as { name?: string } | null | undefined;
  return value?.name;
}

function dateStart(prop: Json | undefined): string | undefined {
  const value = prop?.date as { start?: string } | null | undefined;
  return value?.start ? value.start.slice(0, 10) : undefined;
}

function relationIds(prop: Json | undefined): string[] {
  const value = prop?.relation as { id?: string }[] | undefined;
  return Array.isArray(value) ? value.flatMap((r) => (r.id ? [r.id] : [])) : [];
}

/**
 * Notion's labels, mapped to the keys the type has always used.
 *
 * The labels and the page's badges now read the same — Committed, In progress,
 * Shipped. The keys underneath do not, because they predate Notion and are
 * what the markdown register, the URL's ?state= filter and the component all
 * spell. Renaming them would be a data migration to win nothing.
 */
const STATE_BY_NOTION: Record<string, CommitmentState> = {
  Committed: "next",
  "In progress": "building",
  Shipped: "shipped",
};

/**
 * The link list, taken from Notion's own link runs rather than parsed.
 *
 * The property holds one markdown link per line, which Notion stores as rich
 * text with an href on the linked run — so the hrefs are already structured
 * and there is nothing to parse. A regex over the plain text would re-derive,
 * less reliably, what the API is handing over.
 */
function readLinks(prop: Json | undefined, where: string): CommitmentLink[] {
  const links = richText(prop).flatMap((run) => {
    const label = (run.plain_text ?? "").trim();
    return run.href && label ? [{ label, href: run.href }] : [];
  });

  const seen = new Set<string>();
  for (const link of links) {
    if (seen.has(link.href)) {
      throw new Error(
        `${where}: Links names ${link.href} twice. One entry per destination ` +
          `— a second label on the same URL reads as two places to look when ` +
          `there is one.`
      );
    }
    seen.add(link.href);
  }
  return links;
}

/**
 * The organisations, by id, so an owner relation resolves to a name.
 *
 * A relation rather than the select it replaced: an owner is now a record with
 * a type and a link, which is what lets the same organisation be pointed at
 * from anywhere else on the site later. The cost is this lookup, and the
 * benefit is that "RaidGuild" cannot be typed into existence twice.
 */
async function readOrganizations(): Promise<Map<string, string>> {
  const rows = await queryAll(ORGS_DB);
  const orgs = new Map<string, string>();
  for (const row of rows) {
    const name = text(props(row).Name);
    if (!name) {
      throw new Error(
        `Organizations row ${row.url as string} has no name. An owner with no ` +
          `name is not a party anyone can be referred to.`
      );
    }
    orgs.set(row.id as string, name);
  }
  return orgs;
}

/**
 * The people register, read once and shared.
 *
 * Every commitment relates to two or three people and the same handful recur,
 * so fetching the relation per row would ask Notion for the same page a dozen
 * times. One query for the whole table costs less than the first three.
 */
async function readPeople(): Promise<Map<string, Person>> {
  const rows = await queryAll(PEOPLE_DB);
  const people = new Map<string, Person>();

  for (const row of rows) {
    const p = props(row);
    const name = text(p.Name);
    const where = `Livepeer people → ${name || (row.id as string)}`;
    if (!name) {
      throw new Error(
        `Livepeer people row ${row.url as string} has no name. A credited face ` +
          `with no name is a face nobody can check.`
      );
    }

    const avatar = text(p.Avatar) || undefined;
    if (avatar && /[/\\:]/.test(avatar)) {
      throw new Error(
        `${where}: Avatar is "${avatar}" — it must be a bare filename in ` +
          `public/people, not a path or a URL.`
      );
    }
    // A filename that resolves to nothing would render a broken image where a
    // monogram would have been fine, so an unmatched name is a build failure
    // rather than a silent hole. The portrait lives in the repo because a
    // Notion-hosted one is a signed URL that expires within the hour.
    if (avatar && !fs.existsSync(path.join(AVATAR_DIR, avatar))) {
      throw new Error(
        `${where}: Avatar is "${avatar}", which is not in ` +
          `public/people. Commit the portrait, or clear the field and ` +
          `the face renders as a monogram.`
      );
    }

    const profile = text(p["Forum handle"]) || undefined;
    // A forum handle, not a path or a URL: enforced so the field cannot
    // smuggle a protocol or a second host into the href the card builds.
    if (profile && !/^[a-zA-Z0-9_.-]{2,20}$/.test(profile)) {
      throw new Error(
        `${where}: Profile is "${profile}" — it must be the bare handle from ` +
          `a ${PROFILE_HOST}/u/... URL, not the URL itself. The site builds ` +
          `the link from it.`
      );
    }

    people.set(row.id as string, { name, avatar, profile });
  }

  return people;
}

/** Every child of a block, following the cursor — bodies run past one page. */
async function childrenOf(blockId: string): Promise<Json[]> {
  const blocks: Json[] = [];
  let cursor: string | undefined;
  do {
    const page = await notion(
      `/blocks/${blockId}/children?page_size=100` +
        (cursor ? `&start_cursor=${cursor}` : "")
    );
    blocks.push(...((page.results as Json[]) ?? []));
    cursor = page.has_more ? (page.next_cursor as string) : undefined;
  } while (cursor);
  return blocks;
}

/**
 * The record's body, as HTML — the long-form write-up behind a commitment.
 *
 * Converted from Notion's blocks rather than fetched as markdown, because
 * markdown is not what Notion stores. See lib/notion-blocks.ts.
 */
async function readDetail(pageId: string): Promise<string | undefined> {
  const html = await blocksToHtml(await childrenOf(pageId), (block) =>
    childrenOf(block.id as string)
  );
  return html || undefined;
}

/**
 * A stable id for a commitment, derived from its title.
 *
 * Notion's page id would be stabler still, but it is a UUID: it appears in the
 * DOM as a card's key and in any anchor built from it, and a register whose
 * records are named 3c766022-2d08-813d is one nobody can link to by hand.
 * Titles change rarely and this is not a URL, so the trade is worth it.
 */
function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[’'"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function toCommitment(
  row: Json,
  people: Map<string, Person>,
  orgs: Map<string, string>,
  detail: string | undefined
): Commitment {
  const p = props(row);
  const title = text(p.Name);
  const url = row.url as string;
  // Named by row and linked, because whoever fixes this is in Notion.
  const where = `Roadmap commitments → ${title || (row.id as string)} (${url})`;

  if (!title) {
    throw new Error(`Roadmap commitments row ${url} has no name.`);
  }

  const workstream = selectName(p.Workstream) as Workstream | undefined;
  if (!workstream || !WORKSTREAMS.includes(workstream)) {
    throw new Error(
      `${where}: Workstream is ${JSON.stringify(workstream ?? null)}, not one ` +
        `of ${WORKSTREAMS.join(", ")}.`
    );
  }

  const stateName = selectName(p.Status);
  const state = stateName ? STATE_BY_NOTION[stateName] : undefined;
  if (!state) {
    throw new Error(
      `${where}: Status is ${JSON.stringify(stateName ?? null)}, not one of ` +
        `${Object.keys(STATE_BY_NOTION).join(", ")}.`
    );
  }

  const shippedAt = dateStart(p["Shipped on"]);
  // The two must agree, or Shipped and Roadmap would disagree about the same
  // record — precisely the split-brain one register exists to avoid. The
  // automation fills the date when a person drags the card, but it does not
  // run for API edits, so this is the check that catches an agent that moved
  // the card and forgot the date.
  if ((state === "shipped") !== Boolean(shippedAt)) {
    throw new Error(
      `${where}: Status is "${stateName}" but Shipped on is ` +
        `${shippedAt ?? "empty"}. A shipped commitment needs a date, and a ` +
        `dated one is shipped.`
    );
  }

  const ownerIds = relationIds(p.Owner);
  if (ownerIds.length === 0) {
    throw new Error(
      `${where}: Owner is empty. Nothing reaches the page without one party ` +
        `answerable for it.`
    );
  }
  // Notion cannot cap a relation at one, so the rule is enforced here rather
  // than by the field. Two owners is the state this register exists to avoid:
  // a reader whose date has moved would have nobody in particular to ask.
  if (ownerIds.length > 1) {
    throw new Error(
      `${where}: Owner names ${ownerIds.length} parties. Exactly one is ` +
        `answerable — put joint funding in Funding and contributors in People.`
    );
  }
  const owner = orgs.get(ownerIds[0]!);
  if (!owner) {
    throw new Error(
      `${where}: Owner relates to ${ownerIds[0]}, which is not in ` +
        `Organizations. The integration may not be shared with that database.`
    );
  }

  const target = text(p.Target);
  if (!target) {
    throw new Error(`${where}: Target is empty.`);
  }

  const related = readLinks(p.Links, where);
  if (related.length === 0) {
    throw new Error(
      `${where}: Links is empty. At least one, so the record can be checked.`
    );
  }

  const roster = relationIds(p.Contributors).map((id) => {
    const person = people.get(id);
    if (!person) {
      throw new Error(
        `${where}: Contributors relates to ${id}, which is not in Livepeer ` +
          `people. ` +
          `The integration may not be shared with that database.`
      );
    }
    return person;
  });

  // At most one: "who do I ask" has one answer or none. Two would be the
  // same diffusion the single-owner rule exists to prevent, one layer down.
  const accountableIds = relationIds(p.Accountable);
  if (accountableIds.length > 1) {
    throw new Error(
      `${where}: Accountable names ${accountableIds.length} people. One at ` +
        `most — the others belong in Contributors.`
    );
  }
  const accountable = accountableIds[0]
    ? people.get(accountableIds[0])
    : undefined;
  if (accountableIds[0] && !accountable) {
    throw new Error(
      `${where}: Accountable relates to ${accountableIds[0]}, which is not ` +
        `in Livepeer people.`
    );
  }

  // Notion returns an external cover as the URL that was set and an uploaded
  // one as a signed URL that expires within the hour. Only the first is worth
  // rendering, so an upload is ignored rather than baked into a page that
  // would break by lunchtime.
  const coverProp = row.cover as
    | { type?: string; external?: { url?: string } }
    | null
    | undefined;
  const cover =
    coverProp?.type === "external" ? coverProp.external?.url : undefined;

  return {
    slug: slugify(title),
    cover,
    title,
    outcome: text(p.Outcome),
    workstream,
    state,
    owner,
    contributors: roster.length > 0 ? roster : undefined,
    accountable,
    target,
    targetSort: targetSortKey(target, where),
    shippedAt,
    related,
    funding: text(p.Funding) || undefined,
    issued: dateStart(p["Committed on"]),
    // Notion's own edit stamp. The field it replaced was a date a human bumped
    // by hand, and every record carried the same one.
    lastUpdated: (row.last_edited_time as string | undefined)?.slice(0, 10),
    detail,
  };
}

/** The register, read from Notion. Throws rather than degrading. */
export async function getNotionCommitments(): Promise<Commitment[]> {
  const [rows, people, orgs] = await Promise.all([
    queryAll(COMMITMENTS_DB),
    readPeople(),
    readOrganizations(),
  ]);

  // One body per row, in parallel: fourteen small requests that would
  // otherwise run end to end.
  const details = await Promise.all(
    rows.map((row) => readDetail(row.id as string))
  );

  const commitments = rows.map((row, i) =>
    toCommitment(row, people, orgs, details[i])
  );

  const seen = new Map<string, string>();
  for (const c of commitments) {
    const first = seen.get(c.slug);
    if (first) {
      throw new Error(
        `Roadmap commitments: "${first}" and "${c.title}" both reduce to the ` +
          `id "${c.slug}". Two records cannot share one.`
      );
    }
    seen.set(c.slug, c.title);
  }

  return commitments.sort((a, b) =>
    (b.shippedAt ?? "").localeCompare(a.shippedAt ?? "")
  );
}
