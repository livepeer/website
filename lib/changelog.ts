import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

import { byNewest, renderMarkdown, SLUG } from "./blog";
import { getCommitments, type Person } from "./roadmap";

const CHANGELOG_DIR = path.join(process.cwd(), "content/changelog");
const AVATAR_DIR = path.join(process.cwd(), "public", "people");

/**
 * One thing that shipped: on the network, the Agent, the protocol or the
 * site. What the list needs, which is everything except the write-up.
 *
 * Split from the entry for the same reason the blog is: the list shows a
 * headline, a summary and some faces, and fetching every body to render it
 * would be a round-trip per entry against Notion.
 */
export type ChangelogSummary = {
  slug: string;
  title: string;
  /** One or two sentences under the headline on the list. */
  summary: string;
  /** ISO yyyy-mm-dd: the day it shipped. The list groups entries by it. */
  date: string;
  /** Who shipped it. Any number, or none for a change credited to a team. */
  authors: Person[];
  /**
   * The roadmap commitment this change delivers, if it was one. One or
   * none: a site fix ships without ever being a commitment. Both readers
   * check the commitment is Shipped — an entry announcing something the
   * roadmap still calls Building is a contradiction, and fails the build.
   */
  commitment?: { slug: string; title: string };
  draft: boolean;
};

/** A summary and its write-up, rendered. */
export type ChangelogEntry = ChangelogSummary & {
  html: string;
};

// -- The markdown copy -------------------------------------------------------
//
// The no-token fallback, exactly like content/blog: the changelog as it stood
// when the site was built, kept so a clone without a workspace credential has
// real entries to develop the list against. See lib/register.ts.

function slugsOnDisk(): string[] {
  return fs
    .readdirSync(CHANGELOG_DIR)
    .filter((file) => file.endsWith(".md") && file !== "README.md")
    .map((file) => file.replace(/\.md$/, ""));
}

function readAuthors(value: unknown, where: string): Person[] {
  if (value === undefined) return [];
  if (!Array.isArray(value)) {
    throw new Error(`${where}: authors must be a list.`);
  }
  return value.map(
    (author: { name?: string; slug?: string; avatar?: string }) => {
      if (!author?.name || !author.slug) {
        throw new Error(`${where}: every author needs a name and a slug.`);
      }
      if (
        author.avatar &&
        !fs.existsSync(path.join(AVATAR_DIR, author.avatar))
      ) {
        throw new Error(
          `${where}: avatar ${JSON.stringify(author.avatar)} is not in public/people.`
        );
      }
      return { name: author.name, slug: author.slug, avatar: author.avatar };
    }
  );
}

/** The shipped commitments in the markdown register, by slug. */
async function shippedCommitments(): Promise<Map<string, string>> {
  const shipped = new Map<string, string>();
  for (const c of await getCommitments()) {
    if (c.state === "shipped") shipped.set(c.slug, c.title);
  }
  return shipped;
}

function readFile(
  slug: string,
  shipped: Map<string, string>
): { summary: ChangelogSummary; body: string } {
  const where = `content/changelog/${slug}.md`;
  const { data, content } = matter(
    fs.readFileSync(path.join(CHANGELOG_DIR, `${slug}.md`), "utf8")
  );
  if (!SLUG.test(slug)) {
    throw new Error(
      `${where}: the filename is the slug and must be lowercase words joined by hyphens.`
    );
  }
  if (!data.title) throw new Error(`${where}: no title.`);
  if (!data.date) throw new Error(`${where}: no date.`);

  let commitment: ChangelogSummary["commitment"];
  if (data.commitment !== undefined) {
    const title = shipped.get(String(data.commitment));
    if (!title) {
      throw new Error(
        `${where}: commitment ${JSON.stringify(data.commitment)} is not a ` +
          `shipped commitment in content/roadmap. An entry announces ` +
          `something that shipped.`
      );
    }
    commitment = { slug: String(data.commitment), title };
  }

  return {
    summary: {
      slug,
      title: String(data.title),
      summary: String(data.summary ?? ""),
      date: String(data.date),
      authors: readAuthors(data.authors, where),
      commitment,
      draft: data.draft ?? false,
    },
    body: content,
  };
}

export async function getMarkdownChangelog(): Promise<ChangelogSummary[]> {
  const shipped = await shippedCommitments();
  return byNewest(slugsOnDisk().map((slug) => readFile(slug, shipped).summary));
}

export async function getMarkdownChangelogEntry(
  slug: string
): Promise<ChangelogEntry | null> {
  if (!slugsOnDisk().includes(slug)) return null;
  const { summary, body } = readFile(slug, await shippedCommitments());
  return { ...summary, html: await renderMarkdown(body) };
}
