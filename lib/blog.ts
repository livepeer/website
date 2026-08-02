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
  /**
   * Opt-out from the generated share card (`app/blog/[slug]/opengraph-image`).
   * Set only when a post has bespoke social artwork worth shipping instead.
   */
  shareImage: string;
  /**
   * Photograph or artwork from the post to carry the share card. Set it when
   * the post has an image strong enough to stand on its own at thumbnail size —
   * a photo, a chart, a real screenshot; not a text slide or a banner that
   * already has the headline on it. Posts without one get a typographic card.
   */
  cardArt: string;
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
    category: data.category ?? "News",
    tags: data.tags ?? [],
    image: data.image ?? "",
    heroImage: data.heroImage ?? "",
    shareImage: data.shareImage ?? "",
    cardArt: data.cardArt ?? "",
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
 * Slugs that are publicly reachable. Applies the same production draft filter
 * as {@link getAllPosts}, so the static image and thumbnail routes never
 * pre-render or expose drafts that `app/blog/[slug]/page.tsx` hides in
 * production, while keeping every slug available in preview and local dev.
 */
export function getPublicPostSlugs(): string[] {
  return getPostSlugs().filter(
    (slug) =>
      process.env.VERCEL_ENV !== "production" || !getPostBySlug(slug).draft
  );
}

export function getCategories(): string[] {
  const posts = getAllPosts();
  const categories = new Set(posts.map((p) => p.category));
  return Array.from(categories);
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
