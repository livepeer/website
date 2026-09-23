import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeSanitize from "rehype-sanitize";
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

function isHttpUrl(value: string): boolean {
  try {
    return /^https?:$/.test(new URL(value).protocol);
  } catch {
    return false;
  }
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * A link field is an http(s) URL or nothing. Entries arrive by pull request
 * from outside, and every one of these becomes an anchor on the detail page,
 * so a scheme that runs rather than navigates is refused here with the file
 * and the field named, as the ecosystem body's own links are by sanitising.
 */
function readUrl(value: unknown, where: string): string | undefined {
  const url = normalize(value);
  if (!url) return undefined;
  if (!isHttpUrl(url)) {
    throw new Error(`${where}: ${JSON.stringify(url)} is not an http(s) URL.`);
  }
  return url;
}

/** Where to reach them: an address, or a page. Contact and support take both. */
function readContact(value: unknown, where: string): string | undefined {
  const contact = normalize(value);
  if (!contact) return undefined;
  if (!EMAIL.test(contact) && !isHttpUrl(contact)) {
    throw new Error(
      `${where}: ${JSON.stringify(contact)} is neither an email address nor ` +
        `an http(s) URL.`
    );
  }
  return contact;
}

export function getAppSlugs(): string[] {
  return fs
    .readdirSync(ECOSYSTEM_DIR)
    .filter((file) => file.endsWith(".md"))
    .map((file) => file.replace(/\.md$/, ""));
}

export function getAppBySlug(slug: string): EcosystemApp {
  // The slug names a file in the catalogue and nothing else. It comes off
  // the URL, so it is matched against the files that exist rather than
  // joined onto the directory and trusted to stay inside it.
  if (!getAppSlugs().includes(slug)) {
    throw new Error(`content/ecosystem/${slug}.md: no such entry.`);
  }
  const where = `content/ecosystem/${slug}.md`;
  const filePath = path.join(ECOSYSTEM_DIR, `${slug}.md`);
  const fileContents = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(fileContents);

  const url = readUrl(data.url, `${where}: url`);
  if (!url) {
    throw new Error(`${where}: url is required. It is the "Visit site" link.`);
  }
  const parsed = new URL(url);
  const urlPath = parsed.pathname.replace(/\/$/, "");
  const displayUrl = parsed.hostname.replace(/^www\./, "") + urlPath;

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
    madeByUrl: readUrl(data.madeByUrl, `${where}: madeByUrl`),
    twitter: readUrl(data.twitter, `${where}: twitter`),
    bluesky: readUrl(data.bluesky, `${where}: bluesky`),
    github: readUrl(data.github, `${where}: github`),
    contact: readContact(data.contact, `${where}: contact`),
    docs: readUrl(data.docs, `${where}: docs`),
    support: readContact(data.support, `${where}: support`),
    terms: readUrl(data.terms, `${where}: terms`),
    privacy: readUrl(data.privacy, `${where}: privacy`),
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
    .use(remarkRehype)
    // Entries are contributed by outside PRs: drop unsafe URL schemes and
    // any attribute or element outside the default allowlist.
    .use(rehypeSanitize)
    .use(rehypeStringify)
    .process(content);

  return result.toString();
}
