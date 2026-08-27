import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

import { renderMarkdown } from "./blog";
import type { Person } from "./roadmap";

/**
 * The bodies the register credits.
 *
 * A sibling of the commitment register rather than a part of it: the same rows
 * are meant to credit organisations elsewhere on the site later, which is why
 * they live in their own table in Notion and their own reader here.
 *
 * What an organisation *owns* is deliberately not stored on it. A commitment
 * names its own owner, and the pages derive the list by filtering the register
 * — so the two can never disagree about who is answerable for what. Storing it
 * twice is the drift this whole structure exists to remove.
 */

/**
 * What kind of body this is.
 *
 * The distinction the register actually turns on: an SPE is funded for a
 * defined piece of network work, a DAO is governed on-chain by its token
 * holders, and a Collective takes engagements rather than employing staff.
 * Kept in step with the Type options in Notion — a value outside this list
 * fails the build rather than rendering an unlabelled row.
 */
export const ORG_TYPES = [
  "Foundation",
  "Company",
  "SPE",
  "Collective",
  "DAO",
] as const;
export type OrgType = (typeof ORG_TYPES)[number];

export type Organization = {
  slug: string;
  name: string;
  /**
   * One sentence, ~140 chars. Metadata, not page copy: this is the description
   * a search result and a link unfurl carry, so it has to read away from the
   * page entirely. The record does not print it — the body says the same thing
   * at length to anyone who has arrived.
   *
   * Named to match the rest of the site: blog posts and ecosystem projects
   * carry a `description` doing exactly this job, and all three feed the same
   * metadata. A commitment's `outcome` is the deliberate exception — it names
   * what will land rather than describing the record.
   */
  description: string;
  type: OrgType;
  /**
   * Their one official page, where they have one.
   *
   * Singular on purpose. A field that takes several fills up with shared
   * Livepeer destinations — the forum and the org's GitHub belong to everyone
   * and say nothing about the body they sit on. Optional, and genuinely so:
   * both SPEs have no site of their own, and empty is more honest than sending
   * a reader somewhere generic and calling it theirs.
   */
  link?: string;
  /**
   * A bare filename in public/organizations, never a path or a URL.
   *
   * The portrait rule, applied to marks: the file is committed to this repo and
   * served from it, so production never depends on a host we do not control.
   * In Notion the Logo property holds an external link to that same committed
   * file, which lets Notion preview the mark while the site serves its own
   * copy. Optional — a body with no logo renders its name.
   */
  logo?: string;
  /**
   * The people associated with this body — `Affiliated` in Notion.
   *
   * Association, not accountability. Someone can be affiliated with an
   * organisation that owns none of the work they do, and a commitment names
   * its own contributors; neither is inferred from the other. Optional, and
   * empty for most: five of the seven name nobody.
   */
  people?: Person[];
  /** The banner, as Notion sets it — an absolute URL on the image CDN. */
  cover?: string;
  /** The write-up, as HTML, from whichever source produced it. */
  detail?: string;
};

/** The one slug function, so an owner's link and its page cannot disagree. */
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[’'"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Covers come from one host, which is the only one next/image allows. */
const IMAGE_HOST = "cdn.sanity.io";
const LOGO_DIR = path.join(process.cwd(), "public", "organizations");
const AVATAR_DIR = path.join(process.cwd(), "public", "people");
const dir = path.join(process.cwd(), "content", "organizations");

function readCover(value: unknown, file: string): string | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  const url = String(value);
  let host: string;
  try {
    host = new URL(url).host;
  } catch {
    throw new Error(
      `content/organizations/${file}: cover ${JSON.stringify(url)} is not a URL.`
    );
  }
  if (host !== IMAGE_HOST) {
    throw new Error(
      `content/organizations/${file}: cover is on ${host}. next.config.ts ` +
        `allows ${IMAGE_HOST} and nothing else, so this would fail to render.`
    );
  }
  return url;
}

/**
 * The roster, in the register's own shape.
 *
 * A portrait is a bare filename in public/people — the same rule a commitment's
 * contributors keep, and enforced here for the same reason: a link to a file
 * that is not committed renders as a hole rather than an error.
 */
function readPeople(value: unknown, file: string): Person[] | undefined {
  if (!value) return undefined;
  if (!Array.isArray(value)) {
    throw new Error(`content/organizations/${file}: people is not a list.`);
  }
  const people = value.map((entry) => {
    const p = entry as { name?: unknown; avatar?: unknown; profile?: unknown };
    if (!p.name) {
      throw new Error(`content/organizations/${file}: a person has no name.`);
    }
    const avatar = p.avatar ? String(p.avatar) : undefined;
    if (avatar && !fs.existsSync(path.join(AVATAR_DIR, avatar))) {
      throw new Error(
        `content/organizations/${file}: avatar ${JSON.stringify(avatar)} is ` +
          `not in public/people.`
      );
    }
    return {
      name: String(p.name),
      avatar,
      profile: p.profile ? String(p.profile) : undefined,
    };
  });
  return people.length > 0 ? people : undefined;
}

/**
 * Parsed once per build, and loudly — the same contract the register keeps.
 *
 * A logo naming a file that is not committed is the failure worth catching
 * here: it renders as a hole rather than an error, and nobody notices until
 * someone looks at the page.
 */
function parse(file: string): Organization {
  const slug = file.replace(/\.md$/, "");
  const { data, content } = matter(
    fs.readFileSync(path.join(dir, file), "utf-8")
  );
  const at = (field: string, value: unknown) => {
    if (value === undefined || value === null || value === "") {
      throw new Error(`content/organizations/${file}: ${field} is required.`);
    }
    return value;
  };

  const name = String(at("name", data.name));
  if (slugify(name) !== slug) {
    throw new Error(
      `content/organizations/${file}: name ${JSON.stringify(name)} slugifies ` +
        `to "${slugify(name)}" but the file is "${slug}.md". A commitment's ` +
        `owner is linked by that slug, so the two have to match.`
    );
  }

  const type = at("type", data.type) as OrgType;
  if (!ORG_TYPES.includes(type)) {
    throw new Error(
      `content/organizations/${file}: type ${JSON.stringify(type)} is not one of ${ORG_TYPES.join(", ")}.`
    );
  }

  const logo = data.logo ? String(data.logo) : undefined;
  if (logo && (logo.includes("/") || logo.includes(":"))) {
    throw new Error(
      `content/organizations/${file}: logo ${JSON.stringify(logo)} is a path ` +
        `or a URL. It is a bare filename in public/organizations.`
    );
  }
  if (logo && !fs.existsSync(path.join(LOGO_DIR, logo))) {
    throw new Error(
      `content/organizations/${file}: logo ${JSON.stringify(logo)} is not in ` +
        `public/organizations. Commit the file before naming it.`
    );
  }

  return {
    slug,
    name,
    description: String(at("description", data.description)),
    type,
    link: data.link ? String(data.link) : undefined,
    people: readPeople(data.people, file),
    logo,
    cover: readCover(data.cover, file),
    detail: content.trim() || undefined,
  };
}

/**
 * The fallback copy, read only when there is no Notion credential.
 *
 * Alphabetical rather than by size: an index ordered by how much each body
 * owns would rank organisations by their share of the register, which is a
 * claim this page has no business making.
 */
export async function getOrganizations(): Promise<Organization[]> {
  if (!fs.existsSync(dir)) return [];
  const records = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md") && f !== "README.md")
    .map(parse)
    .sort((a, b) => a.name.localeCompare(b.name));

  // HTML by the time it leaves here, matching what the Notion reader produces,
  // so nothing downstream has to know which source it came from.
  return Promise.all(
    records.map(async (o) => ({
      ...o,
      detail: o.detail ? await renderMarkdown(o.detail) : undefined,
    }))
  );
}
