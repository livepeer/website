import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

import { renderMarkdown } from "./blog";

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

const DIR = path.join(process.cwd(), "content", "guides");

/** The only image host next/image is configured for; see next.config.ts. */
const IMAGE_HOST = "cdn.sanity.io";

/** A cover as either source states it: absolute, on the one allowed host. */
export function readGuideCover(
  value: string | undefined,
  where: string
): string | undefined {
  const url = value?.trim();
  if (!url) return undefined;
  let host: string;
  try {
    host = new URL(url).hostname;
  } catch {
    throw new Error(`${where}: cover ${JSON.stringify(url)} is not a URL.`);
  }
  if (host !== IMAGE_HOST) {
    throw new Error(
      `${where}: cover is on ${host}, and next/image is only configured for ` +
        `${IMAGE_HOST}. Use an image from the stock library.`
    );
  }
  return url;
}

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
    cover: readGuideCover(
      data.cover === undefined ? undefined : String(data.cover),
      where
    ),
    html: await renderMarkdown(body),
  };
}
