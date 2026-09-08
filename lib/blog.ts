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

function sanitizeSlug(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

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
    .map((file) => sanitizeSlug(file.replace(/\.md$/, "")))
    .filter((slug) => slug.length > 0);
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
    imageAlt: data.imageAlt ?? "",
    draft: data.draft ?? false,
    readingTime: stats.text,
    content,
  };
}

// Drafts are hidden on production only; previews and local dev show them.
export function isPublished(post: BlogPost): boolean {
  return !(post.draft && process.env.VERCEL_ENV === "production");
}

// Single lookup for URL slugs so the page and its metadata agree on drafts.
export function getPublishedPost(slug: string): BlogPost | null {
  if (!getPostSlugs().includes(slug)) return null;
  const post = getPostBySlug(slug);
  return isPublished(post) ? post : null;
}

export function getAllPosts(): BlogPost[] {
  const slugs = getPostSlugs();
  const posts = slugs
    .map((slug) => getPostBySlug(slug))
    .filter(isPublished)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return posts;
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
