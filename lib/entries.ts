import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

import { renderMarkdown } from "./blog";
import { parsePeriod } from "./period";

/**
 * The changelog's entries: one row per period someone has published, in
 * the _Changelog entries_ database. A row is the act of publishing — the
 * site composes the entry's rows from the register and the updates
 * inside the row's period, and shows the row's headline over them, if
 * one was written. No row, no entry. See lib/changelog.ts.
 *
 * The row's page body is the entry's **intro**, optional: a few
 * sentences in a person's words about the period, set between the
 * headline and the generated rows. It is the one place on the changelog
 * for prose — the rows stay the leads' own lines — and it is read only
 * for the entries a page shows in full (`getEntryBody`), since the index
 * lists the rest as links and a body per row would be a round-trip each.
 *
 * The markdown copy is the no-token fallback, one file per period in
 * content/changelog, named for its key, with `headline` and `draft` in
 * its frontmatter, both optional, and the intro as the file's body.
 */
export type Entry = {
  /** The period's key, which is also the entry's address. */
  period: string;
  headline?: string;
  draft: boolean;
};

const DIR = path.join(process.cwd(), "content", "changelog");

/** The intro of one entry, rendered, or nothing when the file has no body. */
export async function getMarkdownEntryBody(
  period: string
): Promise<string | undefined> {
  const file = path.join(DIR, `${period}.md`);
  if (!fs.existsSync(file)) return undefined;
  const body = matter(fs.readFileSync(file, "utf8")).content.trim();
  return body ? await renderMarkdown(body) : undefined;
}

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
