import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

import { renderMarkdown } from "./blog";
import { readCoverUrl } from "./notion-media";

/**
 * A guide: one Notion page shown as one page on the site.
 *
 * The reporting rules for whoever owns something on the roadmap are the
 * first. They are the Foundation's policy rather than the site's voice, so
 * they live where the Foundation edits — a page under _Livepeer.org
 * content_, read like a record's write-up, with its cover — and change
 * without a pull request. The site adds the frame: where the page sits,
 * what links to it. See CLAUDE.md → Content.
 *
 * The markdown copy is the no-token fallback, exactly like the others:
 * content/guides/<name>.md, frontmatter `title` and `cover`, the body as
 * the page.
 */
export type Guide = {
  title: string;
  /** An external image on cdn.sanity.io, or none. */
  cover?: string;
  html: string;
};

/**
 * The guides there are, by the name that is also their address under
 * /roadmap. Stated once because two routes have to agree on it: the page at
 * /roadmap/<name>, and the roadmap's intercepting route, which catches every
 * client-side navigation to /roadmap/<anything> and has to know a guide from
 * a commitment's slug it should 404 on.
 */
export const GUIDE_NAMES = ["reporting"] as const;
export type GuideName = (typeof GUIDE_NAMES)[number];

export function isGuideName(name: string): name is GuideName {
  return (GUIDE_NAMES as readonly string[]).includes(name);
}

const DIR = path.join(process.cwd(), "content", "guides");

export async function getMarkdownGuide(name: string): Promise<Guide> {
  const file = path.join(DIR, `${name}.md`);
  const where = `content/guides/${name}.md`;
  if (!fs.existsSync(file)) throw new Error(`${where}: no such guide.`);
  const { data, content } = matter(fs.readFileSync(file, "utf8"));
  const title = String(data.title ?? "").trim();
  if (!title) throw new Error(`${where}: no title.`);
  const body = content.trim();
  if (!body) throw new Error(`${where}: the body is empty.`);
  return {
    title,
    cover: readCoverUrl(
      data.cover === undefined ? undefined : String(data.cover),
      where
    ),
    html: await renderMarkdown(body),
  };
}
