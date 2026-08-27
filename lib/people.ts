import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

import { renderMarkdown } from "./blog";
import { slugify } from "./organizations";
import type { Person } from "./roadmap";

/**
 * The people the site credits, as pages.
 *
 * `Person` is the shape a face needs on a card — a name, a portrait, a handle.
 * This is the shape a page needs, and it is deliberately a superset rather
 * than a second type: a contributor on a commitment and the person whose page
 * it links to are the same row, and giving them separate types is how two
 * records of one human start to disagree.
 *
 * What a person has worked on is not stored here. Commitments name their own
 * contributors, and the page derives the list by filtering the register — the
 * same rule organisations follow, for the same reason.
 */

export type PersonRecord = Person & {
  /**
   * The bio, as HTML.
   *
   * Optional, and honestly so. A row with nothing verifiable to say renders a
   * page without a bio rather than a page with an invented one — these are
   * real people, and a wrong sentence here is published under their face.
   */
  detail?: string;
  /** The banner, as Notion sets it — an absolute URL on the image CDN. */
  cover?: string;
  /**
   * The organisation they are associated with, if any.
   *
   * Association, not accountability: a commitment names the party answerable
   * for it in its own `owner`, and it is often not the body a contributor
   * belongs to. Neither is inferred from the other.
   */
  affiliation?: { name: string; slug: string };
};

const IMAGE_HOST = "cdn.sanity.io";
const AVATAR_DIR = path.join(process.cwd(), "public", "people");
const dir = path.join(process.cwd(), "content", "people");
const PROFILE_HANDLE = /^[a-zA-Z0-9_.-]{2,20}$/;

function readCover(value: unknown, file: string): string | undefined {
  if (!value) return undefined;
  const url = String(value);
  let host: string;
  try {
    host = new URL(url).host;
  } catch {
    throw new Error(
      `content/people/${file}: cover ${JSON.stringify(url)} is not a URL.`
    );
  }
  if (host !== IMAGE_HOST) {
    throw new Error(
      `content/people/${file}: cover is on ${host}. next.config.ts allows ` +
        `${IMAGE_HOST} and nothing else, so this would fail to render.`
    );
  }
  return url;
}

function parse(file: string): PersonRecord {
  const slug = file.replace(/\.md$/, "");
  const { data, content } = matter(
    fs.readFileSync(path.join(dir, file), "utf-8")
  );

  const name = data.name ? String(data.name) : "";
  if (!name) {
    throw new Error(`content/people/${file}: name is required.`);
  }
  if (slugify(name) !== slug) {
    throw new Error(
      `content/people/${file}: name ${JSON.stringify(name)} slugifies to ` +
        `"${slugify(name)}" but the file is "${slug}.md". A credited face is ` +
        `linked by that slug, so the two have to match.`
    );
  }

  const avatar = data.avatar ? String(data.avatar) : undefined;
  if (avatar && /[/\\:]/.test(avatar)) {
    throw new Error(
      `content/people/${file}: avatar ${JSON.stringify(avatar)} is a path or ` +
        `a URL. It is a bare filename in public/people.`
    );
  }
  if (avatar && !fs.existsSync(path.join(AVATAR_DIR, avatar))) {
    throw new Error(
      `content/people/${file}: avatar ${JSON.stringify(avatar)} is not in ` +
        `public/people. Commit the portrait, or clear it for a monogram.`
    );
  }

  const profile = data.profile ? String(data.profile) : undefined;
  // Never a URL: the site builds the href, so this field cannot smuggle a
  // protocol or a second host into it.
  if (profile && !PROFILE_HANDLE.test(profile)) {
    throw new Error(
      `content/people/${file}: profile ${JSON.stringify(profile)} must be the ` +
        `bare handle from a forum.livepeer.org/u/... URL, not the URL.`
    );
  }

  const affiliation = data.affiliation
    ? {
        name: String(data.affiliation),
        slug: slugify(String(data.affiliation)),
      }
    : undefined;

  return {
    slug,
    name,
    avatar,
    profile,
    affiliation,
    cover: readCover(data.cover, file),
    detail: content.trim() || undefined,
  };
}

/** The fallback copy, read only when there is no Notion credential. */
export async function getPeople(): Promise<PersonRecord[]> {
  if (!fs.existsSync(dir)) return [];
  const records = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md") && f !== "README.md")
    .map(parse)
    .sort((a, b) => a.name.localeCompare(b.name));

  return Promise.all(
    records.map(async (r) => ({
      ...r,
      detail: r.detail ? await renderMarkdown(r.detail) : undefined,
    }))
  );
}
