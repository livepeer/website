import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

import { MONTH } from "./changelog";

/**
 * The changelog's headlines: one per published entry, written by a model
 * when the period closes and stored in the _Changelog entries_ database,
 * where anyone can rewrite it. The site reads them; it never writes one
 * at render time, so a headline cannot change under a reader.
 *
 * Keyed by period — today a month, yyyy-mm. An entry with no headline has
 * no line: the month heading and the tally carry it, as they did before.
 *
 * The markdown copy is the no-token fallback, one file per period in
 * content/changelog with a `headline` in its frontmatter, exactly like the
 * other registers' fallbacks.
 */
export type Headlines = Map<string, string>;

const DIR = path.join(process.cwd(), "content", "changelog");

export function getMarkdownHeadlines(): Headlines {
  const headlines: Headlines = new Map();
  if (!fs.existsSync(DIR)) return headlines;
  for (const file of fs.readdirSync(DIR)) {
    if (!file.endsWith(".md") || file === "README.md") continue;
    const period = file.replace(/\.md$/, "");
    if (!MONTH.test(period)) {
      throw new Error(
        `content/changelog/${file}: the file is named for its period, yyyy-mm.`
      );
    }
    const { data } = matter(fs.readFileSync(path.join(DIR, file), "utf8"));
    const headline = String(data.headline ?? "").trim();
    if (!headline) {
      throw new Error(`content/changelog/${file}: headline is empty.`);
    }
    headlines.set(period, headline);
  }
  return headlines;
}
