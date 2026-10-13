import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * A signature on the block id in an uploaded file's address
 * (/api/notion-media/[id]?s=…), so the route serves only ids the site itself
 * rendered into a page.
 *
 * Without it the route took any well-formed id and asked Notion about it,
 * which let anyone spend the integration's rate limit — the one every
 * Notion-backed page shares — with random ids, and served the file of any
 * block whose page sat in one of the site's databases, drafts included. Now
 * an unsigned or forged id is refused before Notion is called.
 *
 * Keyed from the site's Notion token, so there is no new secret to manage,
 * and from the environment, so a link rendered from a draft on a preview —
 * where drafts are shown — does not open on production, where they are not.
 */

function key(): string | null {
  const token = process.env.NOTION_TOKEN;
  if (!token) return null;
  return createHmac("sha256", token)
    .update(`notion-media:${process.env.VERCEL_ENV ?? "development"}`)
    .digest("hex");
}

const bare = (id: string) => id.replace(/-/g, "").toLowerCase();

function sign(subject: string, k: string): string {
  return createHmac("sha256", k).update(subject).digest("hex").slice(0, 24);
}

function matches(subject: string, signature: string | null): boolean {
  const k = key();
  if (!k || !signature) return false;
  const a = Buffer.from(signature);
  const b = Buffer.from(sign(subject, k));
  return a.length === b.length && timingSafeEqual(a, b);
}

/** The signature for a block id, or null when there is no token to sign with. */
export function signMediaId(id: string): string | null {
  const k = key();
  return k ? sign(bare(id), k) : null;
}

/** Whether a signature is the one this deployment gives that block id. */
export function mediaSignatureMatches(
  id: string,
  signature: string | null
): boolean {
  return matches(bare(id), signature);
}

/**
 * The same for an uploaded blog cover (/api/notion-cover/[id]/[version]),
 * over the page id and the version together, so neither a random page nor an
 * invented version of a real one reaches Notion. A subject of its own, so a
 * media signature can never stand in for a cover's.
 */
export function signCover(pageId: string, version: string): string | null {
  const k = key();
  return k ? sign(`cover:${bare(pageId)}/${version}`, k) : null;
}

export function coverSignatureMatches(
  pageId: string,
  version: string,
  signature: string | null
): boolean {
  return matches(`cover:${bare(pageId)}/${version}`, signature);
}
