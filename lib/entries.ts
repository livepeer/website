import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

import { parsePeriod } from "./period";

/**
 * The changelog's entries: one row per period someone has published, in
 * the _Changelog entries_ database. A row is the act of publishing — the
 * site composes the entry's body from the register and the updates
 * inside the row's period, and shows the row's headline over it, if one
 * was written. No row, no entry. See lib/changelog.ts.
 *
 * The markdown copy is the no-token fallback, one file per period in
 * content/changelog, named for its key, with `headline` and `draft` in
 * its frontmatter, both optional.
 */
export type Entry = {
  /** The period's key, which is also the entry's address. */
  period: string;
  headline?: string;
  draft: boolean;
};

const DIR = path.join(process.cwd(), "content", "changelog");

export function getMarkdownEntries(): Entry[] {
  if (!fs.existsSync(DIR)) return [];
  return fs
    .readdirSync(DIR)
    .filter((file) => file.endsWith(".md") && file !== "README.md")
    .map((file) => {
      const period = file.replace(/\.md$/, "");
      parsePeriod(period, `content/changelog/${file}`);
      const { data } = matter(fs.readFileSync(path.join(DIR, file), "utf8"));
      const headline = String(data.headline ?? "").trim();
      return {
        period,
        headline: headline || undefined,
        draft: data.draft === true,
      };
    });
}
