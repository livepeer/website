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
 * pick from, and getPostBySlug rejects anything else, so a typo fails the
 * build instead of quietly splitting the archive in two.
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
};

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  date: string;
  author?: BlogAuthor;
  category: string;
  tags: string[];
  image: string;
  heroImage: string;
  imageAlt: string;
  draft: boolean;
  readingTime: string;
  content: string;
};

export function getPostSlugs(): string[] {
  return fs
    .readdirSync(BLOG_DIR)
    .filter((file) => file.endsWith(".md"))
    .map((file) => file.replace(/\.md$/, ""));
}

export function getPostBySlug(slug: string): BlogPost {
  const filePath = path.join(BLOG_DIR, `${slug}.md`);
  const fileContents = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(fileContents);

  const stats = readingTime(content);

  const category = data.category;
  if (!BLOG_CATEGORIES.includes(category)) {
    throw new Error(
      `content/blog/${slug}.md: category ${JSON.stringify(category)} is not one of ${BLOG_CATEGORIES.join(", ")}.`
    );
  }

  return {
    slug,
    title: data.title ?? "",
    description: data.description ?? "",
    date: data.date ?? "",
    author: data.author
      ? typeof data.author === "string"
        ? { name: data.author }
        : data.author
      : undefined,
    category,
    tags: data.tags ?? [],
    image: data.image ?? "",
    heroImage: data.heroImage ?? "",
    imageAlt: data.imageAlt ?? "",
    draft: data.draft ?? false,
    readingTime: stats.text,
    content,
  };
}

export function getAllPosts(): BlogPost[] {
  const slugs = getPostSlugs();
  const posts = slugs
    .map((slug) => getPostBySlug(slug))
    .filter((post) => {
      // Hide drafts only on the public production deployment; keep them visible
      // on Vercel preview deployments and in local dev for pre-publish review.
      if (process.env.VERCEL_ENV === "production") return !post.draft;
      return true;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return posts;
}

/**
 * The taxonomy, in declared order, narrowed to categories that have posts.
 *
 * Declared-but-empty categories are held back rather than shown: a filter
 * option that can only ever return "No posts match that search" is a dead end
 * dressed as a choice. Agent and Engineering appear the moment a post uses
 * them — no code change needed.
 */
export function getCategories(): string[] {
  const inUse = new Set(getAllPosts().map((post) => post.category));
  return BLOG_CATEGORIES.filter((name) => inUse.has(name));
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
