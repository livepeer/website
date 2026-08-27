import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

import { renderMarkdown } from "./blog";

/**
 * The canonical commitment register.
 *
 * Markdown with YAML frontmatter in content/roadmap, read the same way the blog
 * and the ecosystem catalogue are read (see CLAUDE.md → Content: in-repo, no
 * CMS, deliberately). That choice is what makes this agent-updatable: an agent
 * that can open a pull request can update the register, with no CMS credentials
 * to hold and a human diff on every state change.
 *
 * Roadmap and Shipped are two projections of this one dataset. A commitment is
 * never copied when it lands — it gains `shippedAt` and changes view, so the
 * two surfaces cannot disagree.
 */

/**
 * Three, not five.
 *
 * Protocol is the chain — LPT, staking, delegation, validators, the economics
 * and the surfaces that report them. Network is the compute layer —
 * orchestrators, capabilities, routing, payments, and the programmes that fund
 * that work. Agent is everything a builder touches — the product, its SDKs and
 * its docs.
 *
 * "Developer Experience" and "Ecosystem" split badly against those: docs and an
 * SDK are the Agent surface, capability discovery is a network concern, the
 * explorer is a delegation surface, and grants fund network work. As separate
 * filters they held one and zero records in the roadmap view, which is a
 * taxonomy describing the org chart rather than the work.
 */
export const WORKSTREAMS = ["Protocol", "Network", "Agent"] as const;
export type Workstream = (typeof WORKSTREAMS)[number];

/** shipped is derived from `shippedAt`; the other two are declared. */
export const STATES = ["building", "next", "shipped"] as const;
export type CommitmentState = (typeof STATES)[number];

export type CommitmentLink = { label: string; href: string };

/**
 * Someone on the roster behind a commitment.
 *
 * `avatar` is a filename under public/people, not a URL: the register
 * is contributor-edited markdown, and a field that accepted arbitrary remote
 * images would be a hole in both the CSP and the next.config image allowlist.
 * It is optional — the card falls back to a monogram, which is the honest
 * treatment for the pseudonymous contributors this register credits.
 *
 * `profile` is the person's forum handle, and the URL is built here rather
 * than accepted whole. A register anyone can open a pull request against
 * should not be able to point a credited face at an arbitrary destination,
 * and the handle is the only thing the field actually needs.
 *
 * The forum rather than GitHub: it is where a commitment is proposed and
 * discussed, so a profile there is this register's own record of the person,
 * and it holds contributors who write proposals but never open a pull request.
 * It was the Featurebase board on the same reasoning, until that was retired.
 *
 * Optional, and a face that links nowhere is better than one that links at a
 * guess: a plausible handle resolves to a real stranger. Confirm it returns a
 * profile before writing it down —
 *   curl -sI https://forum.livepeer.org/u/HANDLE.json
 */
export type Person = { name: string; avatar?: string; profile?: string };

const MONTHS = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];

/**
 * A sortable key for a target window, so the roadmap can run chronologically
 * without the target itself pretending to more precision than it has.
 *
 * Targets are deliberately written at whatever precision is real — "Q4 2026",
 * "July 2026", "H1 2027", "2027" — which means they cannot be sorted as text:
 * "H1 2027" would land before "Q4 2026", and "July" before "March". This maps
 * each to the first month it could land in, and throws on anything it does not
 * recognise rather than silently sorting it to the top.
 */
export function targetSortKey(target: string, where = "a commitment"): number {
  const t = target.trim();
  const year = Number(t.match(/\b(20\d{2})\b/)?.[1]);
  if (!year) {
    throw new Error(`${where}: target ${JSON.stringify(target)} has no year.`);
  }
  const quarter = t.match(/\bQ([1-4])\b/i)?.[1];
  if (quarter) return year * 100 + (Number(quarter) - 1) * 3 + 1;

  const half = t.match(/\bH([12])\b/i)?.[1];
  if (half) return year * 100 + (Number(half) - 1) * 6 + 1;

  const month = MONTHS.findIndex((m) => t.toLowerCase().includes(m));
  if (month >= 0) return year * 100 + month + 1;

  // A bare year is a real commitment window — the loosest one we accept.
  if (/^20\d{2}$/.test(t)) return year * 100 + 1;

  throw new Error(
    `${where}: target ${JSON.stringify(target)} is not a window we can place. Use a month, quarter (Q4 2026), half (H1 2027) or year.`
  );
}

export type Commitment = {
  slug: string;
  title: string;
  outcome: string;
  workstream: Workstream;
  state: CommitmentState;
  /**
   * The one party answerable for delivering this — the card's "by".
   *
   * Exactly one, on the project-management convention that accountability
   * cannot be shared: two parties equally answerable means each can assume the
   * other has it, and a reader with a question about a slipped date has nobody
   * to ask. Contributors are `people`; joint funding is `funding`.
   */
  owner: string;
  /** The people doing the work, shown as faces beside the owner's name in the
   *  card's "by" line — `Contributors` in Notion. Optional: many records name
   *  an organisation and no individuals, and an empty roster is normal. */
  contributors?: Person[];
  /** The real precision — "Q4 2026", "July 2026", "H1 2027", "2027". */
  target: string;
  /** Derived from target, so the roadmap can run in chronological order. */
  targetSort: number;
  /**
   * The individual to ask about this — shown in the expanded panel as
   * "Contact".
   *
   * Distinct from `owner`, which is the organisation answerable for
   * delivering, and from `people`, who are doing the work. A reader whose
   * question is "when will this actually land" needs a person, and an
   * organisation cannot answer a question.
   *
   * Optional. A record with nobody named renders no row rather than a
   * placeholder, because inventing a contact is worse than admitting there
   * isn't one.
   */
  accountable?: Person;
  /** ISO yyyy-mm-dd. Present only when shipped. */
  shippedAt?: string;
  /** Where this record can be checked and where the work lives. At least one. */
  related: CommitmentLink[];
  /**
   * Where the money comes from — the board's "Funding Mechanism".
   *
   * Part of the definition, not a nice-to-have: the requirements doc calls a
   * commitment "a dated, owned undertaking to deliver a named outcome to the
   * network, with its funding source identified". The page was asserting the
   * first three and silently dropping the fourth.
   *
   * Free text, because the board's is: "Foundation & Inc funded + go-to-market
   * funding proposal", "Network Engineering SPE, Priority 2". Constraining it
   * to an enum would mean inventing categories the source does not have.
   *
   * Optional today because several records predate the board and nobody has
   * established how they were funded. It should become required once every
   * record carries one — that is the point at which the page's opening claim
   * is fully true.
   */
  funding?: string;
  /**
   * ISO yyyy-mm-dd — the board's "Opportunity Issued", when this was accepted
   * onto the roadmap. Distinct from `target` (when it lands) and `lastUpdated`
   * (when the record last changed): this is when the commitment was
   * made, which is what makes a slipped target legible as a slip.
   */
  issued?: string;
  /**
   * ISO yyyy-mm-dd — when the record last changed, not when it was last
   * checked.
   *
   * It was `lastVerified`, a date a human was supposed to bump whenever they
   * confirmed a record still held. Every record carried 2026-08-12: nine
   * identical dates set in one pass, which is what a field maintained by
   * remembering looks like after a month. The CMS knows when a row was edited
   * and never forgets, so this comes from Notion's own last-edited time.
   *
   * Named for what it now knows. "Verified" claimed a human re-read the record
   * and stood behind it; an edit is not a check, and a timestamp that moves on
   * a typo cannot make that claim.
   */
  lastUpdated?: string;
  /**
   * The commitment's write-up, as **HTML** — the long-form explanation behind
   * it, shown on its own page under the facts.
   *
   * HTML rather than markdown because the two sources disagree about what
   * they hold: the markdown register keeps a body, Notion keeps blocks.
   * Rendering in each reader means the page takes one thing and the
   * difference stops existing above this line.
   *
   * Distinct from `outcome`, which is the one-line promise on the card.
   */
  detail?: string;
};

const dir = path.join(process.cwd(), "content", "roadmap");

/** Where a person's profile lives; the card builds the URL from an id. */
const PROFILE_HOST = "forum.livepeer.org";

/**
 * One list, and no entry twice in it.
 *
 * `sources` and `links` were split on a distinction that reads well in the
 * abstract — where a claim is checked, versus where the work lives — and
 * collapses on contact with the register. A forum thread is both. A LIP is
 * both. The product page is evidence that the thing shipped. Two of the four
 * records that used `links` had simply repeated a source under it, which is
 * what a distinction nobody can apply reliably looks like from the outside.
 *
 * The duplicate check survives the merge, because that failure was never really
 * about the two fields: it was the same URL printed twice under two labels, and
 * one list can do that just as easily.
 */
function assertNoRepeats(related: CommitmentLink[], file: string) {
  const seen = new Set<string>();
  for (const link of related) {
    if (seen.has(link.href)) {
      throw new Error(
        `content/roadmap/${file}: related lists ${link.href} twice. One entry ` +
          `per destination — a second label on the same URL reads as two ` +
          `places to look when there is one.`
      );
    }
    seen.add(link.href);
  }
}

function readPeople(value: unknown, file: string): Person[] | undefined {
  if (value === undefined) return undefined;
  if (!Array.isArray(value)) {
    throw new Error(
      `content/roadmap/${file}: contributors must be a list. See content/roadmap-template.md.`
    );
  }
  return value.map((entry, i) => {
    const person = entry as Partial<Person>;
    if (!person?.name) {
      throw new Error(
        `content/roadmap/${file}: contributors[${i}] needs a name.`
      );
    }
    if (person.avatar && /[/\\:]/.test(person.avatar)) {
      throw new Error(
        `content/roadmap/${file}: contributors[${i}].avatar is "${person.avatar}" — ` +
          `it must be a bare filename in public/people, not a path or URL.`
      );
    }
    // A forum handle, not a path or a URL: enforced so the field cannot
    // smuggle a protocol or a second host into the href the card builds.
    if (
      person.profile !== undefined &&
      !/^[a-zA-Z0-9_.-]{2,20}$/.test(String(person.profile))
    ) {
      throw new Error(
        `content/roadmap/${file}: contributors[${i}].profile is "${person.profile}" — ` +
          `it must be the bare handle from a ${PROFILE_HOST}/u/... URL, not ` +
          `the URL itself. The card builds the link from it.`
      );
    }
    return {
      name: String(person.name),
      avatar: person.avatar,
      profile: person.profile ? String(person.profile) : undefined,
    };
  });
}

function readLinks(value: unknown, file: string, field: string) {
  if (!Array.isArray(value)) return [];
  return value.map((entry, i) => {
    const link = entry as Partial<CommitmentLink>;
    if (!link?.label || !link?.href) {
      throw new Error(
        `content/roadmap/${file}: ${field}[${i}] needs both a label and an href.`
      );
    }
    return { label: link.label, href: link.href };
  });
}

/**
 * Parsed once per build, and loudly. A register that silently accepts a
 * mistyped workstream or an undated commitment is how a roadmap goes stale
 * without anyone noticing — the same reason the blog validates its categories.
 */
function parse(file: string): Commitment {
  const slug = file.replace(/\.md$/, "");
  const { data, content } = matter(
    fs.readFileSync(path.join(dir, file), "utf-8")
  );
  const at = (field: string, value: unknown) => {
    if (value === undefined || value === null || value === "") {
      throw new Error(`content/roadmap/${file}: ${field} is required.`);
    }
    return value;
  };

  const workstream = at("workstream", data.workstream) as Workstream;
  if (!WORKSTREAMS.includes(workstream)) {
    throw new Error(
      `content/roadmap/${file}: workstream ${JSON.stringify(workstream)} is not one of ${WORKSTREAMS.join(", ")}.`
    );
  }

  const shippedAt = data.shippedAt
    ? new Date(data.shippedAt).toISOString().slice(0, 10)
    : undefined;
  const declared = at("state", data.state) as CommitmentState;
  if (!STATES.includes(declared)) {
    throw new Error(
      `content/roadmap/${file}: state ${JSON.stringify(declared)} is not one of ${STATES.join(", ")}.`
    );
  }
  // The two must agree, or Shipped and Roadmap would disagree about the same
  // record — precisely the split-brain this single dataset exists to avoid.
  if ((declared === "shipped") !== Boolean(shippedAt)) {
    throw new Error(
      `content/roadmap/${file}: state is ${declared} but shippedAt is ${shippedAt ?? "absent"}. A shipped commitment needs a date, and a dated one is shipped.`
    );
  }

  const owner = String(at("owner", data.owner));
  if (Array.isArray(data.owner)) {
    throw new Error(
      `content/roadmap/${file}: owner is a list. Exactly one party is ` +
        `answerable — credit the others under people, or state joint funding ` +
        `in funding.`
    );
  }
  const related = readLinks(at("related", data.related), file, "related");
  if (related.length === 0) {
    throw new Error(
      `content/roadmap/${file}: at least one related link, so the record can be checked.`
    );
  }
  assertNoRepeats(related, file);

  return {
    slug,
    title: String(at("title", data.title)),
    outcome: String(at("outcome", data.outcome)),
    workstream,
    state: declared,
    owner,
    contributors: readPeople(data.contributors, file),
    accountable: readPeople(
      data.accountable ? [data.accountable] : undefined,
      file
    )?.[0],
    target: String(at("target", data.target)),
    targetSort: targetSortKey(
      String(at("target", data.target)),
      `content/roadmap/${file}`
    ),
    shippedAt,
    related,
    funding: data.funding ? String(data.funding) : undefined,
    issued: data.issued
      ? new Date(data.issued).toISOString().slice(0, 10)
      : undefined,
    lastUpdated: data.lastUpdated
      ? new Date(data.lastUpdated).toISOString().slice(0, 10)
      : undefined,
    detail: content.trim() || undefined, // raw markdown; rendered in getCommitments
  };
}

export async function getCommitments(): Promise<Commitment[]> {
  if (!fs.existsSync(dir)) return [];
  const records = fs
    .readdirSync(dir)
    // README.md documents the register; it is not a record in it.
    .filter((f) => f.endsWith(".md") && f !== "README.md")
    .map(parse)
    .sort((a, b) => (b.shippedAt ?? "").localeCompare(a.shippedAt ?? ""));

  // `detail` is HTML by the time it leaves here, matching what the Notion
  // reader produces, so nothing downstream has to know which source it came
  // from.
  return Promise.all(
    records.map(async (c) => ({
      ...c,
      detail: c.detail ? await renderMarkdown(c.detail) : undefined,
    }))
  );
}

/** Workstreams actually in use, in canonical order — never an empty filter. */
export function getWorkstreamsInUse(commitments: Commitment[]): string[] {
  const used = new Set(commitments.map((c) => c.workstream));
  return WORKSTREAMS.filter((w) => used.has(w));
}

/** "2026-07-30" → "July 2026", for the Shipped view's period headings. */
export function shippedPeriod(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    timeZone: "UTC",
    month: "long",
    year: "numeric",
  });
}
