import { NextResponse } from "next/server";

import { mediaSignatureMatches } from "@/lib/media-signature";
import { getNotionMediaUrl, hasNotionCredentials } from "@/lib/notion";

/**
 * An image or video uploaded into a Notion page body, served by redirect.
 *
 * Notion signs an uploaded file's address for about an hour, and a page is
 * served for longer than that, so a body cannot carry the address itself.
 * It links here instead (lib/notion-blocks.ts), and this asks Notion for a
 * fresh one on each request and sends the browser on to it. The redirect is
 * cached for no longer than the address it points at stays good.
 *
 * Only image and video blocks inside a page the site renders are served
 * (a row of one of its databases, or a guide; onTheSite in lib/notion.ts).
 * A block id alone is not enough: the integration can read pages the site
 * never shows, and an id that leaked from one must not get its file served.
 *
 * And the id must carry the signature the page rendered it with
 * (lib/media-signature.ts), checked before Notion is asked anything: an
 * unsigned route spent the shared Notion rate limit on any id sent to it.
 */

/**
 * Exactly the address lib/notion-blocks.ts writes: the block id as 32
 * lowercase hex and a query of `s=<24 hex>` and nothing else. Other
 * spellings of the id, or extra query parameters, pass the same signature as
 * distinct addresses, each a cache miss and a Notion call.
 */
const BLOCK_ID = /^[0-9a-f]{32}$/;
const QUERY = /^\?s=([0-9a-f]{24})$/;

/** At most half an hour, and five minutes short of the address expiring. */
const MAX_CACHE_SECONDS = 1800;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const signature = QUERY.exec(new URL(request.url).search)?.[1] ?? null;
  if (
    !BLOCK_ID.test(id) ||
    !hasNotionCredentials() ||
    !mediaSignatureMatches(id, signature)
  ) {
    return new NextResponse(null, { status: 404 });
  }

  const media = await getNotionMediaUrl(id).catch(() => null);
  if (!media) return new NextResponse(null, { status: 404 });

  const left = media.expires
    ? Math.floor((Date.parse(media.expires) - Date.now()) / 1000) - 300
    : MAX_CACHE_SECONDS;
  const seconds = Math.max(0, Math.min(MAX_CACHE_SECONDS, left));

  return NextResponse.redirect(media.url, {
    status: 307,
    headers: {
      "Cache-Control": seconds
        ? `public, max-age=${seconds}, s-maxage=${seconds}`
        : "no-store",
    },
  });
}
