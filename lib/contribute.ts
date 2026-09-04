import fs from "fs";
import path from "path";
import matter from "gray-matter";

import { getOrganizations, slugify } from "./organizations";

/**
 * The funding ladder on /contribute — every way work on the network gets paid
 * for, one record each, ordered by size.
 *
 * Record-shaped on purpose. The page's design survives only because this is
 * five rows with five fixed fields rather than a page of prose: the ceiling
 * column lines up, the group captions are a relation, and retiring a
 * programme is flipping a status. Notion holds the live rows (see
 * lib/notion.ts); the markdown under content/contribute is the ladder as it
 * stood when Notion took over, read only without a token. Both readers come
 * through `toFundingPath`, so a rule is enforced once.
 */

/**
 * The body that says yes — a row in Organizations, so the caption above a
 * group of rungs can link to that body's page rather than just name it.
 */
export type FundingBody = { name: string; slug: string };

/** The verb on the row's link. Three, so nobody invents a fourth. */
export const LINK_LABELS = ["Apply", "Board", "Propose"] as const;

export type LinkLabel = (typeof LINK_LABELS)[number];

export type ActiveFundingPath = {
  retired: false;
  name: string;
  /**
   * One line the reader can say yes or no to — "You already shipped
   * something the network uses" — not a description of the programme. The
   * row then reads as a sentence: situation, path, ceiling, where to go.
   */
  bestFor: string;
  /** Short and scannable — the one column a reader runs down. */
  ceiling: string;
  decidedBy: FundingBody;
  link: string;
  linkLabel: LinkLabel;
  /** Position on the ladder, ascending by size. */
  order: number;
};

/**
 * A retired programme is not a rung. It renders as one line at the foot of
 * the page for the reader who followed an old link, and needs only a name
 * and somewhere to send them — asking for a ceiling on a programme that no
 * longer has one would be asking someone to invent it.
 */
export type RetiredFundingPath = {
  retired: true;
  name: string;
  link: string;
};

export type FundingPath = ActiveFundingPath | RetiredFundingPath;

export function isActive(path: FundingPath): path is ActiveFundingPath {
  return !path.retired;
}

/**
 * What either reader hands in before it is checked. `decidedBy` arrives
 * already resolved to a body, because how a body is looked up is the one
 * thing the two sources genuinely differ on — a relation id in Notion, a
 * name in markdown.
 */
export type RawFundingPath = {
  name?: unknown;
  bestFor?: unknown;
  ceiling?: unknown;
  decidedBy?: FundingBody;
  link?: unknown;
  linkLabel?: unknown;
  order?: unknown;
  status?: unknown;
};

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/** One record, checked. Throws with `where` so the failure names the row. */
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

  if (retired) return { retired, name, link };

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

  if (!raw.decidedBy) {
    throw new Error(
      `${where}: no "Decided by". Every active path is decided by one body ` +
        `in Organizations.`
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

  return {
    retired,
    name,
    bestFor,
    ceiling,
    decidedBy: raw.decidedBy,
    link,
    linkLabel,
    order,
  };
}

/**
 * The ladder as a whole, checked and sorted: active rungs by order, retired
 * ones after them by name.
 *
 * Two rungs at the same height would render in whichever order the source
 * returned them, which is the kind of thing that changes between builds
 * without anyone editing anything — so it fails instead.
 */
export function checkLadder(paths: FundingPath[], where: string): FundingPath[] {
  const active = paths.filter(isActive);
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

  const height = (p: FundingPath) =>
    isActive(p) ? p.order : Number.MAX_SAFE_INTEGER;
  return [...paths].sort(
    (a, b) => height(a) - height(b) || a.name.localeCompare(b.name)
  );
}

// -- The markdown copy -------------------------------------------------------
//
// Kept for the same reason content/roadmap is: a clone with no workspace
// credential still runs. See lib/register.ts.

const DIR = path.join(process.cwd(), "content", "contribute");

export async function getMarkdownFundingPaths(): Promise<FundingPath[]> {
  // The same organisations the rest of the fallback credits, so a caption
  // links to a page that exists in this copy too.
  const bodies = new Map(
    (await getOrganizations()).map((org) => [org.slug, org.name] as const)
  );

  const paths = fs
    .readdirSync(DIR)
    // README.md documents the ladder; it is not a rung on it.
    .filter((file) => file.endsWith(".md") && file !== "README.md")
    .map((file) => {
      const where = `content/contribute/${file}`;
      const { data } = matter(fs.readFileSync(path.join(DIR, file), "utf8"));

      let decidedBy: FundingBody | undefined;
      const bodyName = str(data.decidedBy);
      if (bodyName) {
        const slug = slugify(bodyName);
        const name = bodies.get(slug);
        if (!name) {
          throw new Error(
            `${where}: decidedBy is ${JSON.stringify(bodyName)}, which is ` +
              `not in content/organizations. The caption links to that ` +
              `body's page, so the body has to exist.`
          );
        }
        decidedBy = { name, slug };
      }

      return toFundingPath({ ...data, decidedBy }, where);
    });

  return checkLadder(paths, "content/contribute");
}
