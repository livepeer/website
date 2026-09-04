import fs from "fs";
import path from "path";
import matter from "gray-matter";

/**
 * The funding ladder on /contribute — every way work on the network gets paid
 * for, one record each, ordered by size.
 *
 * Record-shaped on purpose. The page's design survives only because this is
 * five rows with five fixed fields rather than a page of prose: the ceiling
 * column lines up, the group captions are a select, and retiring a programme
 * is flipping one. Notion holds the live rows (see lib/notion.ts); the
 * markdown under content/contribute is the ladder as it stood when Notion
 * took over, read only without a token. Both readers come through
 * `toFundingPath`, so a rule is enforced once.
 */

/** Who says yes. Rendered as the group captions, in this order. */
export const FUNDING_BODIES = [
  "Network Engineering SPE",
  "Livepeer Treasury",
] as const;

export type FundingBody = (typeof FUNDING_BODIES)[number];

/** The verb on the row's link. Three, so nobody invents a fourth. */
export const LINK_LABELS = ["Apply", "Board", "Propose"] as const;

export type LinkLabel = (typeof LINK_LABELS)[number];

export type FundingPath = {
  name: string;
  /** One phrase: the kind of work, not the kind of applicant. */
  bestFor: string;
  /** Short and scannable — the one column a reader runs down. */
  ceiling: string;
  decidedBy: FundingBody;
  link: string;
  linkLabel: LinkLabel;
  /** Position on the ladder, ascending by size. */
  order: number;
  /**
   * A retired path renders as one line at the foot of the page rather than
   * as a rung, for the reader who followed an old link. Only `name` and
   * `link` are read from it.
   */
  retired: boolean;
};

/** What either reader hands in before it is checked. */
export type RawFundingPath = {
  name?: unknown;
  bestFor?: unknown;
  ceiling?: unknown;
  decidedBy?: unknown;
  link?: unknown;
  linkLabel?: unknown;
  order?: unknown;
  status?: unknown;
};

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * One record, checked. Throws with `where` so the failure names the row.
 *
 * A retired row is held to less: it is a name and somewhere to send people,
 * and asking for a ceiling on a programme that no longer has one would be
 * asking someone to invent it.
 */
export function toFundingPath(raw: RawFundingPath, where: string): FundingPath {
  const name = str(raw.name);
  if (!name) {
    throw new Error(`${where}: no name. A rung with no name is not a rung.`);
  }

  const status = str(raw.status);
  if (status !== "Active" && status !== "Retired") {
    throw new Error(
      `${where}: Status is ${JSON.stringify(status)}. It must be Active or ` +
        `Retired.`
    );
  }
  const retired = status === "Retired";

  const link = str(raw.link);
  if (!link) {
    throw new Error(
      `${where}: no link. ${retired ? "A retired row still needs somewhere to send the reader who followed an old link." : "The row's whole job is to send someone somewhere."}`
    );
  }
  if (!link.startsWith("https://")) {
    throw new Error(`${where}: link is ${JSON.stringify(link)}, not https.`);
  }

  if (retired) {
    return {
      name,
      bestFor: str(raw.bestFor),
      ceiling: str(raw.ceiling),
      decidedBy: FUNDING_BODIES[0],
      link,
      linkLabel: "Apply",
      order: Number.MAX_SAFE_INTEGER,
      retired,
    };
  }

  const bestFor = str(raw.bestFor);
  if (!bestFor) {
    throw new Error(
      `${where}: "Best for" is empty. It is the line a reader decides from.`
    );
  }

  const ceiling = str(raw.ceiling);
  if (!ceiling) {
    throw new Error(
      `${where}: no ceiling. Write "No ceiling" if there is none — the column ` +
        `is what gets scanned, and a blank reads as an omission.`
    );
  }

  const decidedBy = str(raw.decidedBy) as FundingBody;
  if (!FUNDING_BODIES.includes(decidedBy)) {
    throw new Error(
      `${where}: "Decided by" is ${JSON.stringify(decidedBy)}. It must be ` +
        `one of ${FUNDING_BODIES.join(", ")}.`
    );
  }

  const linkLabel = str(raw.linkLabel) as LinkLabel;
  if (!LINK_LABELS.includes(linkLabel)) {
    throw new Error(
      `${where}: "Link label" is ${JSON.stringify(linkLabel)}. It must be ` +
        `one of ${LINK_LABELS.join(", ")}.`
    );
  }

  const order = typeof raw.order === "number" ? raw.order : NaN;
  if (!Number.isFinite(order)) {
    throw new Error(
      `${where}: no order. Every active path needs a position on the ladder.`
    );
  }

  return { name, bestFor, ceiling, decidedBy, link, linkLabel, order, retired };
}

/**
 * The ladder as a whole, checked and sorted.
 *
 * Two rungs at the same height would render in whichever order the source
 * returned them, which is the kind of thing that changes between builds
 * without anyone editing anything — so it fails instead.
 */
export function checkLadder(paths: FundingPath[], where: string): FundingPath[] {
  const active = paths.filter((p) => !p.retired);
  if (active.length === 0) {
    throw new Error(
      `${where}: no active paths. The page would render an empty ladder.`
    );
  }

  const seen = new Map<number, string>();
  for (const p of active) {
    const other = seen.get(p.order);
    if (other) {
      throw new Error(
        `${where}: "${other}" and "${p.name}" are both at order ${p.order}. ` +
          `Two rungs cannot share a height.`
      );
    }
    seen.set(p.order, p.name);
  }

  return [...paths].sort(
    (a, b) => a.order - b.order || a.name.localeCompare(b.name)
  );
}

// -- The markdown copy -------------------------------------------------------
//
// Kept for the same reason content/roadmap is: a clone with no workspace
// credential still runs. See lib/register.ts.

const DIR = path.join(process.cwd(), "content", "contribute");

export function getMarkdownFundingPaths(): FundingPath[] {
  const paths = fs
    .readdirSync(DIR)
    // README.md documents the ladder; it is not a rung on it.
    .filter((file) => file.endsWith(".md") && file !== "README.md")
    .map((file) => {
      const { data } = matter(fs.readFileSync(path.join(DIR, file), "utf8"));
      return toFundingPath(data, `content/contribute/${file}`);
    });
  return checkLadder(paths, "content/contribute");
}
