import fs from "node:fs";
import path from "node:path";

import readingTime from "reading-time";

import { blocksToHtml } from "./notion-blocks";
import { resolveMediaSource } from "./notion-media";
import {
  assertCategory,
  byNewest,
  SLUG,
  type BlogPost,
  type BlogSummary,
} from "./blog";
import {
  checkLadder,
  toFundingPath,
  type FundingBody,
  type FundingPath,
} from "./contribute";
import {
  WORKSTREAMS,
  targetSortKey,
  type Commitment,
  type CommitmentLink,
  type CommitmentState,
  type Person,
  type Workstream,
} from "./roadmap";
import {
  ORG_TYPES,
  slugify,
  type Organization,
  type OrgType,
} from "./organizations";
import type { PersonRecord } from "./people";

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
 * "Lead". The card face still names the organisation, because that is who
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
const BLOG_DB =
  process.env.NOTION_BLOG_DB ?? "ed74ac33f630497d8c3cf23599de462b";
const FUNDING_DB =
  process.env.NOTION_FUNDING_DB ?? "e2a8b7e07c92459f81e06af6e15a3440";

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
const LOGO_DIR = path.join(process.cwd(), "public", "organizations");

/** Whether the register can be read from Notion at all. */
export function hasNotionCredentials(): boolean {
  return Boolean(process.env.NOTION_TOKEN);
}

type Json = Record<string, unknown>;

/**
 * A build reads Notion two dozen times — three database queries and a body for
 * every commitment and organisation — and until this, any one of them failing
 * failed the deploy. That is what happened: a single ETIMEDOUT prerendering
 * /roadmap, with nothing wrong at either end but the connection.
 *
 * Retried, then. Failing loudly on a Notion outage is deliberate and stays —
 * a build that quietly served month-old markdown would publish a roadmap that
 * looks current and is not — but one flaky socket is not an outage, and the
 * register was not stale.
 *
 * Only what a retry can fix: a transport error, a 429, a 5xx. A 401 or a
 * "Could not find database" is a configuration mistake, and repeating it three
 * times only delays the message that says so.
 */
const ATTEMPTS = 3;
const REQUEST_TIMEOUT_MS = 15_000;
const BACKOFF_MS = [500, 1500];

function retryable(res: Response): boolean {
  return res.status === 429 || res.status >= 500;
}

async function withRetries(
  endpoint: string,
  send: () => Promise<Response>
): Promise<Response> {
  let last: unknown;

  for (let attempt = 0; attempt < ATTEMPTS; attempt++) {
    if (attempt > 0) {
      await new Promise((r) =>
        setTimeout(r, BACKOFF_MS[attempt - 1] ?? BACKOFF_MS.at(-1))
      );
    }
    try {
      const res = await send();
      if (!retryable(res) || attempt === ATTEMPTS - 1) return res;
      last = new Error(`Notion ${res.status} on ${endpoint}`);
    } catch (err) {
      // Network-level: a timeout, a reset, a DNS blip. Nothing to read.
      last = err;
    }
  }

  throw new Error(
    `Notion request to ${endpoint} failed ${ATTEMPTS} times. The register is ` +
      `read from Notion and the build fails rather than serving the stale ` +
      `markdown fallback, which would publish a roadmap that looks current ` +
      `and is not.`,
    { cause: last }
  );
}

async function notion(endpoint: string, init?: RequestInit): Promise<Json> {
  const token = process.env.NOTION_TOKEN;
  if (!token) {
    throw new Error(
      "NOTION_TOKEN is not set. The roadmap register is read from Notion; " +
        "set the internal integration token in the deployment environment."
    );
  }

  const res = await withRetries(endpoint, () =>
    fetch(`${API}${endpoint}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        "Notion-Version": NOTION_VERSION,
        "Content-Type": "application/json",
        ...init?.headers,
      },
      // Without this a hung connection hangs the build rather than failing it.
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      next: { revalidate: REVALIDATE },
    })
  );

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
 * The filename off the end of a Portrait link.
 *
 * The property is a Files entry holding an external URL, which is the only
 * shape that does two things at once: Notion previews the image in the
 * property, and the API returns the link verbatim rather than as a signed URL
 * that expires within the hour.
 *
 * The site does not load that URL. It takes the last path segment and serves
 * the copy committed to public/people — so production never depends on the
 * host the link points at, and next/image needs no extra allowlist entry.
 * The link is how Notion shows a face; the repo is where the face comes from.
 *
 * An uploaded file is ignored: those come back signed and expiring, and the
 * name alone is not enough to trust that the same image is in the repo.
 */
function portraitFilename(prop: Json | undefined): string | undefined {
  const files = prop?.files as
    | { type?: string; external?: { url?: string } }[]
    | undefined;
  const url = files?.find((f) => f.type === "external")?.external?.url;
  if (!url) return undefined;
  try {
    const name = decodeURIComponent(
      new URL(url).pathname.split("/").pop() ?? ""
    );
    return name || undefined;
  } catch {
    return undefined;
  }
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

    const avatar = portraitFilename(p.Portrait);
    if (avatar && /[/\\:]/.test(avatar)) {
      throw new Error(
        `${where}: Portrait resolves to "${avatar}", which is not a plain ` +
          `filename. Link straight to the file in public/people.`
      );
    }
    // A filename that resolves to nothing would render a broken image where a
    // monogram would have been fine, so an unmatched name is a build failure
    // rather than a silent hole. The portrait lives in the repo because a
    // Notion-hosted one is a signed URL that expires within the hour.
    if (avatar && !fs.existsSync(path.join(AVATAR_DIR, avatar))) {
      throw new Error(
        `${where}: Portrait points at "${avatar}", which is not in ` +
          `public/people. Commit the portrait, or clear the field and the ` +
          `face renders as a monogram.`
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

    people.set(row.id as string, {
      name,
      slug: slugify(name),
      avatar,
      profile,
    });
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
async function readDetail(
  pageId: string,
  where: string
): Promise<string | undefined> {
  const html = await blocksToHtml(
    await childrenOf(pageId),
    (block) => childrenOf(block.id as string),
    where
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
  const leadIds = relationIds(p.Lead);
  if (leadIds.length > 1) {
    throw new Error(
      `${where}: Lead names ${leadIds.length} people. One at ` +
        `most — the others belong in Contributors.`
    );
  }
  const lead = leadIds[0]
    ? people.get(leadIds[0])
    : undefined;
  if (leadIds[0] && !lead) {
    throw new Error(
      `${where}: Lead relates to ${leadIds[0]}, which is not ` +
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
    ownerSlug: slugify(owner),
    contributors: roster.length > 0 ? roster : undefined,
    lead,
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
    rows.map((row) =>
      readDetail(row.id as string, `Roadmap commitments → ${text(props(row).Name)}`)
    )
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

/**
 * The organisations, in full.
 *
 * A second pass over the same table `readOrganizations` reads for owner names —
 * that one resolves a relation and needs nothing but the name, this one builds
 * the pages. Kept separate rather than merged so the register does not pay for
 * the bodies it never renders.
 *
 * What each organisation owns is not read here. A commitment names its own
 * owner, and the pages derive the list by filtering the register, so the two
 * cannot disagree.
 */
export async function getNotionOrganizations(): Promise<Organization[]> {
  // The people table too, because Affiliated is a relation into it — the same
  // read the register does for contributors, so a face is described once.
  const [rows, people] = await Promise.all([queryAll(ORGS_DB), readPeople()]);

  const orgs = await Promise.all(
    rows.map(async (row): Promise<Organization> => {
      const p = props(row);
      const name = text(p.Name);
      const where = `Organizations row ${row.url as string}`;
      if (!name) {
        throw new Error(
          `${where} has no name. A body with no name is not one anyone can be ` +
            `referred to.`
        );
      }

      const type = selectName(p.Type) as OrgType | undefined;
      if (!type || !ORG_TYPES.includes(type)) {
        throw new Error(
          `${where} (${name}): Type is ${type ?? "empty"}, not one of ` +
            `${ORG_TYPES.join(", ")}.`
        );
      }

      const description = text(p.Description);
      if (!description) {
        throw new Error(
          `${where} (${name}): Description is empty. It is the card line and ` +
            `the page's share description, so a body without one reaches the ` +
            `site unreadable away from its own page.`
        );
      }

      // Same treatment as a portrait: the link is how Notion previews the
      // mark, and the repo is where the site serves it from.
      const logo = portraitFilename(p.Logo);
      if (logo && !fs.existsSync(path.join(LOGO_DIR, logo))) {
        throw new Error(
          `${where} (${name}): Logo names ${logo}, which is not committed to ` +
            `public/organizations. Commit the file before linking it.`
        );
      }

      const coverProp = row.cover as
        | { type?: string; external?: { url?: string } }
        | undefined;

      return {
        slug: slugify(name),
        name,
        description,
        type,
        link: (p.Link?.url as string | undefined) || undefined,
        people: (() => {
          const roster = relationIds(p.Affiliated)
            .map((id) => people.get(id))
            .filter((person) => person !== undefined);
          return roster.length > 0 ? roster : undefined;
        })(),
        logo,
        cover:
          coverProp?.type === "external" ? coverProp.external?.url : undefined,
        detail: await readDetail(row.id as string, where),
      };
    })
  );

  const seen = new Map<string, string>();
  for (const o of orgs) {
    const first = seen.get(o.slug);
    if (first) {
      throw new Error(
        `Organizations: "${first}" and "${o.name}" both reduce to the id ` +
          `"${o.slug}". Two bodies cannot share one.`
      );
    }
    seen.set(o.slug, o.name);
  }

  return orgs.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * The people, as pages.
 *
 * A second pass over the table `readPeople` reads for credited faces: that one
 * resolves a relation and needs a name, a portrait and a handle, this one adds
 * the bio, the banner and the affiliation a page shows. Kept apart so the
 * register does not fetch a body for every contributor it renders as a face.
 *
 * What each person has worked on is not read here. Commitments name their own
 * contributors, and the page derives the list by filtering the register.
 */
export async function getNotionPeople(): Promise<PersonRecord[]> {
  const [rows, orgs] = await Promise.all([
    queryAll(PEOPLE_DB),
    readOrganizations(),
  ]);

  const people = await Promise.all(
    rows.map(async (row): Promise<PersonRecord> => {
      const p = props(row);
      const name = text(p.Name);
      const where = `Livepeer people row ${row.url as string}`;
      if (!name) {
        throw new Error(
          `${where} has no name. A credited face with no name is a face ` +
            `nobody can check.`
        );
      }

      // One affiliation or none. Two would make "who are they with" a question
      // with no answer, which is the shape the owner relation already rejects.
      const affiliations = relationIds(p.Affiliation);
      if (affiliations.length > 1) {
        throw new Error(
          `${where} (${name}): Affiliation names ${affiliations.length} ` +
            `organizations. One or none — association is singular here, and ` +
            `work is credited through a commitment's own Owner.`
        );
      }
      const affiliationName = affiliations[0]
        ? orgs.get(affiliations[0])
        : undefined;

      const coverProp = row.cover as
        | { type?: string; external?: { url?: string } }
        | undefined;

      return {
        slug: slugify(name),
        name,
        avatar: portraitFilename(p.Portrait),
        profile: text(p["Forum handle"]) || undefined,
        x: text(p["X handle"]).replace(/^@/, "") || undefined,
        email: (p.Email?.email as string | undefined) || undefined,
        affiliation: affiliationName
          ? { name: affiliationName, slug: slugify(affiliationName) }
          : undefined,
        cover:
          coverProp?.type === "external" ? coverProp.external?.url : undefined,
        detail: await readDetail(row.id as string, where),
      };
    })
  );

  const seen = new Map<string, string>();
  for (const person of people) {
    const first = seen.get(person.slug);
    if (first) {
      throw new Error(
        `Livepeer people: "${first}" and "${person.name}" both reduce to the ` +
          `id "${person.slug}". Two people cannot share one.`
      );
    }
    seen.set(person.slug, person.name);
  }

  return people.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * A multi-select property as the names it holds, in the order Notion has them.
 */
function multiSelectNames(prop: Json | undefined): string[] {
  const options = (prop as { multi_select?: { name?: string }[] } | undefined)
    ?.multi_select;
  return (options ?? []).map((option) => option.name ?? "").filter(Boolean);
}

/**
 * One row of the blog table, without its body.
 *
 * Everything the index and the metadata need, and nothing that costs another
 * request — see BlogSummary. The body is fetched only by getNotionPost, for
 * the one post being read.
 */
function toSummary(row: Json, people: Map<string, Person>): BlogSummary {
  const p = props(row);
  const title = text(p.Name);
  const where = `Blog posts → ${title || (row.url as string)}`;

  if (!title) {
    throw new Error(
      `Blog posts row ${row.url as string} has no headline. Every other field ` +
        `describes a post that does not exist yet.`
    );
  }

  // Not derived from the title, unlike the register's ids. A post's URL is
  // published the day it goes out and quoted back by everyone who links to it,
  // while its headline gets edited — deriving one from the other would mean a
  // copy fix silently breaking every inbound link.
  const slug = text(p.Slug);
  if (!slug) {
    throw new Error(
      `${where}: no slug. It is the post's URL, so it has to be chosen rather ` +
        `than guessed.`
    );
  }
  if (!SLUG.test(slug)) {
    throw new Error(
      `${where}: slug is "${slug}". Lowercase words joined by single hyphens — ` +
        `it goes straight into livepeer.org/blog/.`
    );
  }

  const date = dateStart(p["Published on"]);
  if (!date) {
    throw new Error(
      `${where}: no publication date. The index is ordered by it, so a post ` +
        `without one has nowhere to sit.`
    );
  }

  const status = selectName(p.Status);
  if (status !== "Draft" && status !== "Published") {
    throw new Error(
      `${where}: Status is ${JSON.stringify(status)}. It must be Draft or ` +
        `Published.`
    );
  }

  // The page cover, not a property — the same place a commitment keeps its
  // banner. Art held in a property as well as a cover is two visible copies of
  // one fact: change the cover, and the site would go on serving the property.
  const cover = row.cover as
    | { type?: string; external?: { url?: string }; file?: { url?: string } }
    | null
    | undefined;
  if (!cover) {
    throw new Error(
      `${where}: no cover. The index card, the post's header and the share ` +
        `image are all built on it, and none of them has a fallback. Add one ` +
        `at the top of the page.`
    );
  }

  const authors = relationIds(p.Author);
  if (authors.length > 1) {
    throw new Error(
      `${where}: Author names ${authors.length} people. A byline is one name ` +
        `or none.`
    );
  }
  const author = authors[0] ? people.get(authors[0]) : undefined;
  if (authors[0] && !author) {
    throw new Error(
      `${where}: the author is a page that is not in Livepeer people.`
    );
  }

  return {
    slug,
    title,
    description: text(p.Description),
    date,
    author: author
      ? { name: author.name, slug: author.slug, avatar: author.avatar }
      : undefined,
    category: assertCategory(selectName(p.Category), where),
    tags: multiSelectNames(p.Tags),
    // Checked here rather than where it is rendered, so a bad address fails
    // the build with the post's name attached to it.
    image: resolveMediaSource(cover, `${where} → cover`),
    imageAlt: text(p["Image alt"]),
    draft: status === "Draft",
  };
}

/** The index, read from Notion. Throws rather than degrading. */
export async function getNotionPosts(): Promise<BlogSummary[]> {
  const [rows, people] = await Promise.all([queryAll(BLOG_DB), readPeople()]);
  const posts = byNewest(rows.map((row) => toSummary(row, people)));

  const seen = new Map<string, string>();
  for (const post of posts) {
    const first = seen.get(post.slug);
    if (first) {
      throw new Error(
        `Blog posts: "${first}" and "${post.title}" are both at ` +
          `/blog/${post.slug}. Two posts cannot share a URL.`
      );
    }
    seen.set(post.slug, post.title);
  }

  return posts;
}

/**
 * One post, with its body.
 *
 * The table is queried again rather than threaded down from the index: the
 * post page is its own route and may be built without the index ever being
 * rendered. Next dedupes the request inside a render and caches it for
 * NOTION_REVALIDATE across them, so the second read is not a second call.
 */
export async function getNotionPost(slug: string): Promise<BlogPost | null> {
  const [rows, people] = await Promise.all([queryAll(BLOG_DB), readPeople()]);

  const row = rows.find((candidate) => text(props(candidate).Slug) === slug);
  if (!row) return null;

  const summary = toSummary(row, people);
  const html =
    (await readDetail(row.id as string, `Blog posts → ${summary.title}`)) ?? "";
  if (!html) {
    throw new Error(
      `Blog posts → ${summary.title}: the page is empty. The post is the page ` +
        `body — write it in Notion, under the properties.`
    );
  }

  return {
    ...summary,
    // From the rendered text rather than the blocks, so the count matches what
    // is actually on the page: captions in, property values out.
    readingTime: readingTime(html.replace(/<[^>]*>/g, " ")).text,
    html,
  };
}

/** A URL property's value. Not rich text, so `text` reads it as empty. */
function urlOf(prop: Json | undefined): string {
  return (prop as { url?: string | null } | undefined)?.url ?? "";
}

/** A number property's value, or undefined when it is blank. */
function numberOf(prop: Json | undefined): number | undefined {
  const value = (prop as { number?: number | null } | undefined)?.number;
  return typeof value === "number" ? value : undefined;
}

/**
 * The funding ladder, read from Notion. Throws rather than degrading.
 *
 * Every rule lives in `toFundingPath`, shared with the markdown reader; this
 * is the mapping from Notion's property shapes onto the raw record, plus the
 * one thing only this source has to do — turn the "Decided by" relation into
 * a body, through the same organisations read the register uses for owners.
 */
export async function getNotionFundingPaths(): Promise<FundingPath[]> {
  const [rows, orgs] = await Promise.all([
    queryAll(FUNDING_DB),
    readOrganizations(),
  ]);

  const paths = rows.map((row) => {
    const p = props(row);
    const name = text(p.Name);
    const where = `Funding paths → ${name || (row.url as string)}`;

    let decidedBy: FundingBody | undefined;
    const ids = relationIds(p["Decided by"]);
    if (ids.length > 1) {
      throw new Error(
        `${where}: "Decided by" names ${ids.length} organizations. Exactly ` +
          `one body says yes.`
      );
    }
    if (ids[0]) {
      const orgName = orgs.get(ids[0]);
      if (!orgName) {
        throw new Error(
          `${where}: "Decided by" is a page that is not in Organizations.`
        );
      }
      decidedBy = { name: orgName, slug: slugify(orgName) };
    }

    return toFundingPath(
      {
        name,
        bestFor: text(p["Best for"]),
        ceiling: text(p.Ceiling),
        decidedBy,
        link: urlOf(p.Link),
        linkLabel: selectName(p["Link label"]),
        order: numberOf(p.Order),
        status: selectName(p.Status),
      },
      where
    );
  });

  return checkLadder(paths, "Funding paths");
}
