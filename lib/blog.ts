import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import rehypeHighlight from "rehype-highlight";
import rehypeExternalLinks from "rehype-external-links";
import readingTime from "reading-time";

const BLOG_DIR = path.join(process.cwd(), "content/blog");

/**
 * The blog's taxonomy — declared here, not inferred from whatever the posts
 * happen to say.
 *
 * A derived list drifts: one post typed "News" and another "Network" and the
 * filter grows a category nobody chose. This is the closed set a post must
 * pick from, and both readers reject anything else, so a typo fails the build
 * instead of quietly splitting the archive in two.
 *
 * Order is the order they appear in the filter panel, and it is editorial
 * rather than alphabetical: what the network did, then the two product
 * surfaces, then the people and the governance around them.
 */
export const BLOG_CATEGORIES = [
  "Network",
  "Agent",
  "Community",
  "Proposals",
  "Engineering",
] as const;

export type BlogCategory = (typeof BLOG_CATEGORIES)[number];

export type BlogAuthor = {
  name: string;
  avatar?: string;
  /** Set when the author is a record in the people register, so the byline
      can link to them; absent for a name that only exists in frontmatter. */
  slug?: string;
};

/**
 * What the index needs, which is everything except the piece itself.
 *
 * Split from the post deliberately. Twelve posts on the index means twelve
 * bodies fetched and converted to render a list of cards that show none of
 * them, and against Notion that is twelve extra round-trips per build.
 */
export type BlogSummary = {
  slug: string;
  title: string;
  description: string;
  date: string;
  author?: BlogAuthor;
  category: BlogCategory;
  tags: string[];
  /**
   * The one piece of art: the index card, the post's header and the base of
   * the share image are all built from it. In Notion it is the page cover —
   * the same place a roadmap commitment keeps its banner, rather than a
   * property beside a cover that would be a second visible copy of it.
   */
  image: string;
  imageAlt: string;
  draft: boolean;
};

/** A summary and the piece it belongs to, rendered. */
export type BlogPost = BlogSummary & {
  readingTime: string;
  html: string;
};

/**
 * Whether a post is public here.
 *
 * Drafts are hidden only on the production deployment. They stay visible on
 * Vercel previews and in local dev, which is the point of marking something a
 * draft rather than leaving it unwritten — it can be read and linked to for
 * review, on a URL that is not the public one.
 */
export function isPublished(post: { draft: boolean }): boolean {
  if (process.env.VERCEL_ENV === "production") return !post.draft;
  return true;
}

/** Newest first, which is the only order the index ever shows. */
export function byNewest<T extends { date: string }>(posts: T[]): T[] {
  return [...posts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

/**
 * The taxonomy, in declared order, narrowed to categories that have posts.
 *
 * Declared-but-empty categories are held back rather than shown: a filter
 * option that can only ever return "No posts match that search" is a dead end
 * dressed as a choice. Engineering appears the moment a post uses it — no code
 * change needed.
 */
export function categoriesInUse(posts: BlogSummary[]): string[] {
  const used = new Set(posts.map((post) => post.category));
  return BLOG_CATEGORIES.filter((name) => used.has(name));
}

/** The shape a slug has to have to be a URL, checked by both readers. */
export const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function assertCategory(value: unknown, where: string): BlogCategory {
  if (!BLOG_CATEGORIES.includes(value as BlogCategory)) {
    throw new Error(
      `${where}: category ${JSON.stringify(value)} is not one of ${BLOG_CATEGORIES.join(", ")}.`
    );
  }
  return value as BlogCategory;
}

// -- The markdown copy -------------------------------------------------------
//
// Kept for the same reason content/roadmap is: a clone with no workspace
// credential still runs. See lib/register.ts.

function slugsOnDisk(): string[] {
  return fs
    .readdirSync(BLOG_DIR)
    // README.md documents the archive; it is not a post in it.
    .filter((file) => file.endsWith(".md") && file !== "README.md")
    .map((file) => file.replace(/\.md$/, ""));
}

function readFile(slug: string): { summary: BlogSummary; body: string } {
  const where = `content/blog/${slug}.md`;
  const { data, content } = matter(
    fs.readFileSync(path.join(BLOG_DIR, `${slug}.md`), "utf8")
  );

  return {
    summary: {
      slug,
      title: data.title ?? "",
      description: data.description ?? "",
      date: data.date ?? "",
      author: data.author
        ? typeof data.author === "string"
          ? { name: data.author }
          : data.author
        : undefined,
      category: assertCategory(data.category, where),
      tags: data.tags ?? [],
      image: data.image ?? "",
      imageAlt: data.imageAlt ?? "",
      draft: data.draft ?? false,
    },
    body: content,
  };
}

export function getMarkdownPosts(): BlogSummary[] {
  return byNewest(slugsOnDisk().map((slug) => readFile(slug).summary));
}

export async function getMarkdownPost(slug: string): Promise<BlogPost | null> {
  if (!slugsOnDisk().includes(slug)) return null;
  const { summary, body } = readFile(slug);
  return {
    ...summary,
    readingTime: readingTime(body).text,
    html: await renderMarkdown(body),
  };
}

export async function renderMarkdown(content: string): Promise<string> {
  const result = await unified()
    .use(remarkParse)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeExternalLinks, {
      target: "_blank",
      rel: ["noopener", "noreferrer"],
    })
    .use(rehypeHighlight)
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(content);

  return result.toString();
}
