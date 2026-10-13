import { coverSignatureMatches } from "@/lib/media-signature";
import {
  coverVersion,
  getNotionBlogCover,
  hasNotionCredentials,
  uploadedCoverPath,
} from "@/lib/notion";

/**
 * A blog post's cover when it was uploaded into Notion rather than taken from
 * the stock library.
 *
 * Notion signs an upload's link for about an hour, and a cover outlives that
 * on the index, the post and every timeline it is shared to. So the site
 * serves the image itself, from an address that carries a version
 * (uploadedCover in lib/notion.ts): fetched fresh from Notion here, cached for
 * good, and replaced by a new address when the cover changes. The image
 * bytes, not a redirect, so next/image can optimize it like any other cover.
 * Only covers of rows in Blog posts are served (getNotionBlogCover).
 *
 * The version is checked against the cover as it is now. Unchecked, an old
 * address fetched the new cover and cached it for good under the old version,
 * so an address that claimed to name one image could serve another. An
 * address whose version is out of date is sent on to the current one, briefly
 * cached, rather than refused: it is still in timelines and caches.
 *
 * The last segment is `<version>.<signature>` (uploadedCoverPath), and the
 * signature is checked before Notion is asked anything, as the media route
 * does: unsigned, any well-formed page id or invented version spent the
 * Notion rate limit every Notion-backed page shares. A draft's cover is not
 * served on livepeer.org (getNotionBlogCover).
 */

/** `<version>.<signature>`: 12 hex from coverVersion, 24 from signCover. */
const SIGNED_VERSION = /^([0-9a-f]{12})\.([0-9a-f]{24})$/;

const PAGE_ID =
  /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; version: string }> }
) {
  const { id, version: segment } = await params;
  // The whole segment, exactly: a split on "." ignored anything after a
  // second dot, so one signed address could be made into endless distinct
  // ones (".sig.1", ".sig.2"), each a cache miss and a Notion call.
  const match = SIGNED_VERSION.exec(segment);
  const [, version = "", signature = null] = match ?? [];
  if (
    !PAGE_ID.test(id) ||
    !hasNotionCredentials() ||
    !coverSignatureMatches(id, version, signature)
  ) {
    return new Response(null, { status: 404 });
  }
  const file = await getNotionBlogCover(id).catch(() => null);
  if (!file) return new Response(null, { status: 404 });
  const current = coverVersion(file);
  if (version !== current) {
    return new Response(null, {
      status: 307,
      headers: {
        Location: uploadedCoverPath(id, current),
        "Cache-Control": "public, max-age=300, s-maxage=300",
      },
    });
  }
  const image = await fetch(file).catch(() => null);
  if (!image?.ok || !image.body) return new Response(null, { status: 502 });

  return new Response(image.body, {
    headers: {
      "Content-Type": image.headers.get("content-type") ?? "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
