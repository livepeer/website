import fs from "node:fs";
import path from "node:path";

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
 * Two databases: Roadmap commitments, and Livepeer people. People are a
 * relation rather than repeated text so that a person's name, portrait and
 * profile id are stated once — the markdown register had eight copies of the
 * same person, and they had already drifted.
 *
 * People sits beside the register rather than inside it, and is named for
 * everyone rather than for the roadmap, because the same rows are meant to
 * credit people elsewhere on the site later.
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
 * The two databases, overridable for a staging copy.
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

/**
 * How stale the page may be, in seconds.
 *
 * Nothing runs on this timer. Next regenerates on request, so a quiet site
 * makes no Notion calls at all — this is how stale a page a visitor may be
 * served before it is refreshed behind them, not a polling interval. Which is
 * why five minutes costs approximately nothing: the busier the page, the more
 * it matters, and the quieter it is, the less it runs.
 *
 * Five rather than sixty because this is the only mechanism that serves the
 * people we actually asked to maintain the register. They edit the board in
 * Notion and then look at the site; an hour of seeing no change reads as a
 * broken integration, and the habit we want does not survive that.
 *
 * The two faster paths both have a reach problem, so neither replaces this:
 * /api/revalidate needs the caller to hold a secret, and the Notion webhook
 * needs an admin to subscribe it. Once the webhook is live and proven to fire
 * on API edits, this becomes a backstop and can go back up.
 */
const REVALIDATE = Number(process.env.NOTION_REVALIDATE ?? 300);

/** Where a person's profile lives; the card builds the URL from an id. */
const BOARD_HOST = "roadmap.livepeer.org";

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

function multiSelectNames(prop: Json | undefined): string[] {
  const value = prop?.multi_select as { name?: string }[] | undefined;
  return Array.isArray(value)
    ? value.flatMap((o) => (o.name ? [o.name] : []))
    : [];
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

    const profile = text(p["Profile ID"]) || undefined;
    // The board's own id shape: 24 hex characters. Enforced so the field
    // cannot smuggle a path, a protocol or a second host into the href the
    // card builds from it.
    if (profile && !/^[a-f0-9]{24}$/.test(profile)) {
      throw new Error(
        `${where}: Profile ID is "${profile}" — it must be the bare id from a ` +
          `${BOARD_HOST}/u/... URL, not the URL itself. The site builds the ` +
          `link from it.`
      );
    }

    people.set(row.id as string, { name, avatar, profile });
  }

  return people;
}

/**
 * The record's body, which the expanded card shows as "Context".
 *
 * Paragraphs only, joined as plain text, because that is exactly what the card
 * renders — it prints the string, so anything richer would arrive as markup in
 * a text node. Notion pages that grow headings or lists will lose that
 * structure here, which is the honest trade for a field that is two or three
 * sentences of background by design.
 */
async function readDetail(pageId: string): Promise<string | undefined> {
  const page = await notion(`/blocks/${pageId}/children?page_size=100`);
  const paragraphs = ((page.results as Json[]) ?? []).flatMap((block) => {
    if (block.type !== "paragraph") return [];
    const body = text(block.paragraph as Json);
    return body ? [body] : [];
  });
  return paragraphs.join("\n\n") || undefined;
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

  const stateName = selectName(p.State);
  const state = stateName ? STATE_BY_NOTION[stateName] : undefined;
  if (!state) {
    throw new Error(
      `${where}: State is ${JSON.stringify(stateName ?? null)}, not one of ` +
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
      `${where}: State is "${stateName}" but Shipped on is ` +
        `${shippedAt ?? "empty"}. A shipped commitment needs a date, and a ` +
        `dated one is shipped.`
    );
  }

  const owners = multiSelectNames(p.Owners);
  if (owners.length === 0) {
    throw new Error(
      `${where}: Owners is empty. Nothing reaches the page without an ` +
        `accountable party.`
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

  const roster = relationIds(p.People).map((id) => {
    const person = people.get(id);
    if (!person) {
      throw new Error(
        `${where}: People relates to ${id}, which is not in Livepeer people. ` +
          `The integration may not be shared with that database.`
      );
    }
    return person;
  });

  return {
    slug: slugify(title),
    title,
    outcome: text(p.Outcome),
    workstream,
    state,
    owners,
    people: roster.length > 0 ? roster : undefined,
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
  const [rows, people] = await Promise.all([
    queryAll(COMMITMENTS_DB),
    readPeople(),
  ]);

  // One body per row, in parallel: fourteen small requests that would
  // otherwise run end to end.
  const details = await Promise.all(
    rows.map((row) => readDetail(row.id as string))
  );

  const commitments = rows.map((row, i) =>
    toCommitment(row, people, details[i])
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
