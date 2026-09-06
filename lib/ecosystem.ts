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
  /**
   * What the card and detail page print under the name: the host, plus the
   * path when the URL has one. Not just the host — an entry that lives at a
   * path (livepeer.org/foundation) would otherwise be shown as the bare
   * domain, which points somewhere it does not.
   */
  displayUrl: string;
  description: string;
  categories: string[];
  logo?: string;
  logoBg?: string;
  /**
   * Single-ink mark: supply it in black and it is inverted under .dark, so it
   * stays legible on the theme-aware tile without a fixed logoBg plate.
   */
  logoMonochrome?: boolean;
  madeBy?: string;
  /** Optional home for the maker, so the credit can be a link. */
  madeByUrl?: string;
  twitter?: string;
  bluesky?: string;
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
  let displayUrl = "";
  try {
    const parsed = new URL(url);
    const path = parsed.pathname.replace(/\/$/, "");
    displayUrl = parsed.hostname.replace(/^www\./, "") + path;
  } catch {
    displayUrl = url;
  }

  return {
    slug,
    name: data.name ?? slug,
    url,
    displayUrl,
    description: data.description ?? "",
    categories: Array.isArray(data.categories) ? data.categories : [],
    logo: normalize(data.logo),
    logoBg: normalize(data.logoBg),
    logoMonochrome: data.logoMonochrome === true,
    madeBy: normalize(data.madeBy),
    madeByUrl: normalize(data.madeByUrl),
    twitter: normalize(data.twitter),
    bluesky: normalize(data.bluesky),
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
