import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

import { renderMarkdown } from "./blog";

/**
 * The site's legal pages: the Terms of Service and the Privacy Policy.
 *
 * The text is counsel's, not the site's voice, so it lives in Notion — one
 * row each in _Legal pages_ under _Livepeer.org content_, the page body being
 * the text — where it can change without a pull request. A row is Draft until
 * counsel signs it off: livepeer.org shows Published rows only, and previews
 * show drafts so the text can be reviewed where it will be read.
 *
 * Questions for counsel are written into the text itself, in square brackets
 * opening "[Confirm", so a reviewer sees them where they apply. A Published
 * page that still has one is held back from livepeer.org and logged rather
 * than shown, because a legal page that says "[Confirm: the operator's legal
 * name]" is worse than none. The same goes for a Published page with no
 * effective date, which the page states as "Last updated".
 *
 * content/legal/<slug>.md is the no-token fallback, as for every Notion
 * surface: frontmatter `title`, `draft` and `effective`, the body as the page.
 */

/** The pages there are, by the address each has on the site. */
export const LEGAL_SLUGS = ["terms-of-service", "privacy-policy"] as const;
export type LegalSlug = (typeof LEGAL_SLUGS)[number];

export type LegalPage = {
  slug: LegalSlug;
  title: string;
  /** ISO yyyy-mm-dd, shown as "Last updated". Required once published. */
  effective?: string;
  draft: boolean;
  html: string;
};

/** A question left for counsel in the text: "[Confirm: …]". */
const OPEN_QUESTION = /\[\s*Confirm\b/i;

/** How many questions for counsel the text still holds. */
export function openQuestions(html: string): number {
  return html.split(OPEN_QUESTION).length - 1;
}

/**
 * Whether a page may be shown where only finished pages are: published,
 * dated, and with every question for counsel answered. Logs why not, since
 * the page is otherwise simply absent and nobody would know to look.
 */
export function isReady(page: LegalPage): boolean {
  if (page.draft) return false;
  const where = `Legal pages → ${page.slug}`;
  if (!page.effective) {
    console.error(
      `${where}: Published without an effective date, so it is held back. ` +
        `Set the Effective date to the day the text takes effect.`
    );
    return false;
  }
  const open = openQuestions(page.html);
  if (open > 0) {
    console.error(
      `${where}: Published with ${open} question(s) for counsel still in ` +
        `the text ("[Confirm: …]"), so it is held back. Resolve them first.`
    );
    return false;
  }
  return true;
}

const DIR = path.join(process.cwd(), "content", "legal");

export async function getMarkdownLegalPage(
  slug: LegalSlug
): Promise<LegalPage | null> {
  const file = path.join(DIR, `${slug}.md`);
  if (!fs.existsSync(file)) return null;
  const where = `content/legal/${slug}.md`;
  const { data, content } = matter(fs.readFileSync(file, "utf8"));
  const title = String(data.title ?? "").trim();
  if (!title) throw new Error(`${where}: no title.`);
  const body = content.trim();
  if (!body) throw new Error(`${where}: the body is empty.`);
  const effective =
    data.effective instanceof Date
      ? data.effective.toISOString().slice(0, 10)
      : data.effective
        ? String(data.effective)
        : undefined;
  return {
    slug,
    title,
    effective,
    draft: data.draft !== false,
    html: await renderMarkdown(body),
  };
}
