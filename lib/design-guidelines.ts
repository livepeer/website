import fs from "fs";
import path from "path";
import matter from "gray-matter";
import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

/**
 * Livepeer's design guidelines, kept in the repo (`content/design.md`) rather
 * than read from Peace Node's registry, where they began: the site's own
 * decisions (Inter for everything, Geist Mono, the green never on the mark)
 * now live in the same file as the rules, and change with the site.
 *
 * Served twice: as a page for people (/brand/guidelines) and as the raw file
 * for agents (/design.md), the way the registry served the original.
 */
const FILE = path.join(process.cwd(), "content", "design.md");

/** The file as written, frontmatter and all. */
export function getDesignGuidelinesSource() {
  return fs.readFileSync(FILE, "utf8");
}

/** The guidelines as HTML, with the title and its standfirst split off. */
export async function getDesignGuidelines() {
  const { data, content } = matter(getDesignGuidelinesSource());
  // The page sets the title and the paragraph under it itself.
  const [, title = "", intro = "", body = ""] =
    content.match(/^\s*#\s+(.+)\n+([^\n#][^\n]*)\n+([\s\S]*)$/) ?? [];
  const html = String(
    await unified()
      .use(remarkParse)
      .use(remarkRehype)
      .use(rehypeStringify)
      .process(body)
  );
  return {
    title,
    intro,
    description: String(data.description ?? ""),
    html,
  };
}
