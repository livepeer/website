import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

import { byNewest, renderMarkdown } from "./blog";
import { slugify } from "./organizations";
import type { Person } from "./roadmap";
import type { Health, Post, PostSummary } from "./health";

export * from "./health";

// -- The markdown copy -------------------------------------------------------
//
// The no-token fallback, exactly like content/roadmap: a few updates as they
// stood when the site was built, kept so a clone without a workspace
// credential has a health on its cards and a trail on a record. See
// lib/register.ts.

const UPDATES_DIR = path.join(process.cwd(), "content", "updates");
const AVATAR_DIR = path.join(process.cwd(), "public", "people");
const ROADMAP_DIR = path.join(process.cwd(), "content", "roadmap");

const HEALTH_BY_NAME: Record<string, Health> = {
  "on track": "on-track",
  "at risk": "at-risk",
  "off track": "off-track",
};

function filesOnDisk(): string[] {
  if (!fs.existsSync(UPDATES_DIR)) return [];
  return fs
    .readdirSync(UPDATES_DIR)
    .filter((file) => file.endsWith(".md") && file !== "README.md")
    .sort();
}

function readAuthor(value: unknown, where: string): Person | undefined {
  if (value === undefined || value === null) return undefined;
  const author = value as { name?: string; avatar?: string };
  if (!author.name) throw new Error(`${where}: author needs a name.`);
  if (author.avatar && !fs.existsSync(path.join(AVATAR_DIR, author.avatar))) {
    throw new Error(
      `${where}: avatar ${JSON.stringify(author.avatar)} is not in public/people.`
    );
  }
  return {
    name: author.name,
    slug: slugify(author.name),
    avatar: author.avatar,
  };
}

function readFile(file: string): { summary: PostSummary; body: string } {
  const where = `content/updates/${file}`;
  const { data, content } = matter(
    fs.readFileSync(path.join(UPDATES_DIR, file), "utf8")
  );

  const commitment = String(data.commitment ?? "");
  if (!commitment) throw new Error(`${where}: no commitment.`);
  if (!fs.existsSync(path.join(ROADMAP_DIR, `${commitment}.md`))) {
    throw new Error(
      `${where}: commitment ${JSON.stringify(commitment)} is not a record in ` +
        `content/roadmap. An update reports on something on the roadmap.`
    );
  }

  if (!data.date) throw new Error(`${where}: no date.`);
  const date = new Date(data.date).toISOString().slice(0, 10);

  const summary = String(data.summary ?? "").trim();
  if (!summary) throw new Error(`${where}: no summary.`);

  const kindName = String(data.kind ?? "update").toLowerCase();
  if (!["update", "retrospective", "retro"].includes(kindName)) {
    throw new Error(
      `${where}: kind ${JSON.stringify(data.kind)} is not update or ` +
        `retrospective.`
    );
  }
  const base = {
    commitment,
    date,
    summary,
    author: readAuthor(data.author, where),
    draft: data.draft ?? false,
  };
  const body = content.trim();

  // A retrospective carries no health; see RetroSummary.
  if (kindName !== "update") {
    return { summary: { ...base, kind: "retro" }, body };
  }

  const health = HEALTH_BY_NAME[String(data.health ?? "").toLowerCase()];
  if (!health) {
    throw new Error(
      `${where}: health ${JSON.stringify(data.health)} is not one of ` +
        `on track, at risk, off track.`
    );
  }
  return { summary: { ...base, kind: "update", health }, body };
}

export function getMarkdownUpdates(): PostSummary[] {
  return byNewest(filesOnDisk().map((file) => readFile(file).summary));
}

/** One commitment's updates with their write-ups, newest first. */
export async function getMarkdownCommitmentUpdates(
  slug: string
): Promise<Post[]> {
  const mine = filesOnDisk()
    .map(readFile)
    .filter(({ summary }) => summary.commitment === slug);
  const withBodies = await Promise.all(
    mine.map(async ({ summary, body }) => ({
      ...summary,
      html: body ? await renderMarkdown(body) : "",
    }))
  );
  return byNewest(withBodies);
}
