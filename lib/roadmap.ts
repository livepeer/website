import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

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
 * `avatar` is a filename under public/roadmap/people, not a URL: the register
 * is contributor-edited markdown, and a field that accepted arbitrary remote
 * images would be a hole in both the CSP and the next.config image allowlist.
 * It is optional — the card falls back to a monogram, which is the honest
 * treatment for the pseudonymous contributors this register credits.
 *
 * `profile` is the person's id on roadmap.livepeer.org, and the URL is built
 * here rather than accepted whole. A register anyone can open a pull request
 * against should not be able to point a credited face at an arbitrary
 * destination, and the id is the only thing the field actually needs.
 *
 * The board rather than GitHub: it is where a commitment is proposed and
 * discussed, so a profile there is this register's own record of the person,
 * and it holds contributors who write proposals but never open a pull request.
 *
 * Optional, and a face that links nowhere is better than one that links at a
 * guess — the board exposes no profile links on its public pages, so an id has
 * to be confirmed by hand rather than derived.
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
export function targetSortKey(target: string, file = "a commitment"): number {
  const t = target.trim();
  const year = Number(t.match(/\b(20\d{2})\b/)?.[1]);
  if (!year) {
    throw new Error(
      `content/roadmap/${file}: target ${JSON.stringify(target)} has no year.`
    );
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
    `content/roadmap/${file}: target ${JSON.stringify(target)} is not a window we can place. Use a month, quarter (Q4 2026), half (H1 2027) or year.`
  );
}

export type Commitment = {
  slug: string;
  title: string;
  outcome: string;
  workstream: Workstream;
  state: CommitmentState;
  /** The accountable party — the card's "Owner". At least one. */
  owners: string[];
  /** The people behind the accountable party, shown as faces beside its name
   *  in the card's "Owner" line. Optional: many records name an
   *  organisation and no individuals, and an empty roster is a normal state. */
  people?: Person[];
  /** The real precision — "Q4 2026", "July 2026", "H1 2027", "2027". */
  target: string;
  /** Derived from target, so the roadmap can run in chronological order. */
  targetSort: number;
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
   * onto the roadmap. Distinct from `target` (when it lands) and `lastVerified`
   * (when someone last checked the record): this is when the commitment was
   * made, which is what makes a slipped target legible as a slip.
   */
  issued?: string;
  /** ISO yyyy-mm-dd — when a human or agent last confirmed it. */
  lastVerified?: string;
  /** The record's rendered markdown body — background on the commitment, shown
   *  in the expanded panel as "Context". Distinct from `outcome`, which is the
   *  one-line promise under the title on the closed card. */
  detail?: string;
};

const dir = path.join(process.cwd(), "content", "roadmap");

/** Where a person's profile lives; the card builds the URL from an id. */
const BOARD_HOST = "roadmap.livepeer.org";

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
      `content/roadmap/${file}: people must be a list. See content/roadmap-template.md.`
    );
  }
  return value.map((entry, i) => {
    const person = entry as Partial<Person>;
    if (!person?.name) {
      throw new Error(`content/roadmap/${file}: people[${i}] needs a name.`);
    }
    if (person.avatar && /[/\\:]/.test(person.avatar)) {
      throw new Error(
        `content/roadmap/${file}: people[${i}].avatar is "${person.avatar}" — ` +
          `it must be a bare filename in public/roadmap/people, not a path or URL.`
      );
    }
    // The board's own id shape: 24 hex characters. Enforced so the field cannot
    // smuggle a path, a protocol or a second host into the href the card builds
    // from it.
    if (
      person.profile !== undefined &&
      !/^[a-f0-9]{24}$/.test(String(person.profile))
    ) {
      throw new Error(
        `content/roadmap/${file}: people[${i}].profile is "${person.profile}" — ` +
          `it must be the bare id from a ${BOARD_HOST}/u/... URL, not the URL ` +
          `itself. The card builds the link from it.`
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

  const owners = at("owners", data.owners) as string[];
  if (!Array.isArray(owners) || owners.length === 0) {
    throw new Error(`content/roadmap/${file}: owners must list at least one.`);
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
    owners: owners.map(String),
    people: readPeople(data.people, file),
    target: String(at("target", data.target)),
    targetSort: targetSortKey(String(at("target", data.target)), file),
    shippedAt,
    related,
    funding: data.funding ? String(data.funding) : undefined,
    issued: data.issued
      ? new Date(data.issued).toISOString().slice(0, 10)
      : undefined,
    lastVerified: data.lastVerified
      ? new Date(data.lastVerified).toISOString().slice(0, 10)
      : undefined,
    detail: content.trim() || undefined,
  };
}

export function getCommitments(): Commitment[] {
  if (!fs.existsSync(dir)) return [];
  return (
    fs
      .readdirSync(dir)
      // README.md documents the register; it is not a record in it.
      .filter((f) => f.endsWith(".md") && f !== "README.md")
      .map(parse)
      .sort((a, b) => (b.shippedAt ?? "").localeCompare(a.shippedAt ?? ""))
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
