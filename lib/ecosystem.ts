import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";

const ECOSYSTEM_DIR = path.join(process.cwd(), "content/ecosystem");

export type EcosystemApp = {
  slug: string;
  name: string;
  url: string;
  hostname: string;
  description: string;
  categories: string[];
  logo?: string;
  logoBg?: string;
  madeBy?: string;
  twitter?: string;
  github?: string;
  contact?: string;
  docs?: string;
  support?: string;
  terms?: string;
  privacy?: string;
  order?: number;
  content: string;
};

function normalize(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function getAppSlugs(): string[] {
  return fs
    .readdirSync(ECOSYSTEM_DIR)
    .filter((file) => file.endsWith(".md"))
    .map((file) => file.replace(/\.md$/, ""));
}

export function getAppBySlug(slug: string): EcosystemApp {
  const filePath = path.join(ECOSYSTEM_DIR, `${slug}.md`);
  const fileContents = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(fileContents);

  const url: string = data.url ?? "";
  let hostname = "";
  try {
    hostname = new URL(url).hostname.replace(/^www\./, "");
  } catch {
    hostname = url;
  }

  return {
    slug,
    name: data.name ?? slug,
    url,
    hostname,
    description: data.description ?? "",
    categories: Array.isArray(data.categories) ? data.categories : [],
    logo: normalize(data.logo),
    logoBg: normalize(data.logoBg),
    madeBy: normalize(data.madeBy),
    twitter: normalize(data.twitter),
    github: normalize(data.github),
    contact: normalize(data.contact),
    docs: normalize(data.docs),
    support: normalize(data.support),
    terms: normalize(data.terms),
    privacy: normalize(data.privacy),
    order: typeof data.order === "number" ? data.order : undefined,
    content,
  };
}

export function getAllApps(): EcosystemApp[] {
  const slugs = getAppSlugs();
  const apps = slugs.map((slug) => getAppBySlug(slug));
  return apps.sort((a, b) => {
    const ao = a.order ?? Number.MAX_SAFE_INTEGER;
    const bo = b.order ?? Number.MAX_SAFE_INTEGER;
    if (ao !== bo) return ao - bo;
    return a.name.localeCompare(b.name);
  });
}

export function getEcosystemCategories(): string[] {
  const apps = getAllApps();
  const cats = new Set<string>();
  for (const app of apps) {
    for (const c of app.categories) cats.add(c);
  }
  return ["All", ...Array.from(cats).sort()];
}

export async function renderEcosystemMarkdown(
  content: string
): Promise<string> {
  const result = await unified()
    .use(remarkParse)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(content);

  return result.toString();
}
