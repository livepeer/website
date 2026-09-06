import fs from "fs";
import path from "path";

/**
 * Where a picture on a Notion-authored page is allowed to come from.
 *
 * Notion will happily hold the file itself, and that is the one thing it must
 * not do here. An uploaded image comes back from the API as a signed S3 link
 * that expires within the hour, so a page built at noon serves a broken figure
 * by one — silently, because the build succeeded and the URL was valid when it
 * was written. It is the same reason portraits are committed to the repo
 * rather than hosted in Notion.
 *
 * So the rule is: paste a link, do not drag a file. This is where that rule is
 * enforced, and it is deliberately an allowlist rather than a check for the
 * one bad case — a stable-looking URL on somebody else's host is a broken
 * image waiting for them to reorganise their bucket, and the failure would
 * again be silent.
 */

/**
 * Ours. The URL is written whole so it previews in Notion, and the site then
 * strips the origin and serves the committed file from its own public/ — the
 * page never fetches livepeer.org to draw itself.
 */
const SITE_HOSTS = new Set(["livepeer.org", "www.livepeer.org"]);

/**
 * Not ours, but stable enough to point at.
 *
 * Sanity is Peace Node's stock library, which the roadmap's covers already
 * use. Mirror hosts the art of one 2024 post that was published there first;
 * it is grandfathered, not an invitation — new art belongs on one of the other
 * two.
 */
const REMOTE_HOSTS = new Set(["cdn.sanity.io", "images.mirror-media.xyz"]);

const PUBLIC_DIR = path.join(process.cwd(), "public");

/**
 * An allowed URL, resolved to what the page should actually load.
 *
 * Throws otherwise, which fails the build. That is the intended outcome: the
 * alternative is publishing a post with a hole in it and finding out from a
 * reader.
 */
export function resolveMediaUrl(url: string, where: string): string {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error(
      `${where}: ${JSON.stringify(url)} is not a URL. Images and video must be ` +
        `pasted as links.`
    );
  }

  if (parsed.protocol !== "https:") {
    throw new Error(`${where}: ${url} is not https.`);
  }

  if (REMOTE_HOSTS.has(parsed.hostname)) return url;

  if (!SITE_HOSTS.has(parsed.hostname)) {
    throw new Error(
      `${where}: ${parsed.hostname} is not a host this site serves media from. ` +
        `Use a livepeer.org address for a file committed to public/, or ` +
        `cdn.sanity.io for stock art.`
    );
  }

  // Ours, so serve our own copy. new URL has already flattened any ".." out of
  // the path; the containment check below is what makes that guarantee ours
  // rather than the URL parser's.
  const pathname = decodeURIComponent(parsed.pathname);
  const file = path.join(PUBLIC_DIR, pathname);
  if (!file.startsWith(PUBLIC_DIR + path.sep)) {
    throw new Error(`${where}: ${pathname} resolves outside public/.`);
  }
  if (!fs.existsSync(file)) {
    throw new Error(
      `${where}: ${pathname} is not in public/. A livepeer.org address is ` +
        `served from the repo, so the file has to be committed before the ` +
        `post can build.`
    );
  }
  return pathname;
}

/**
 * The same rule for a Notion file-or-external property value.
 *
 * `file` is Notion holding the bytes — the expiring case, rejected with the
 * reason rather than a URL error, because "cdn.sanity.io is not a host" would
 * be a baffling thing to read after dragging a picture into a page.
 */
export function resolveMediaSource(
  source: { type?: string; external?: { url?: string }; file?: { url?: string } },
  where: string
): string {
  if (source.type === "file" || source.file) {
    throw new Error(
      `${where}: this file is uploaded to Notion. Notion hands the API a link ` +
        `that expires within the hour, so the page would break by itself. ` +
        `Paste an address instead — see the database description.`
    );
  }
  const url = source.external?.url;
  if (!url) throw new Error(`${where}: no image address.`);
  return resolveMediaUrl(url, where);
}
