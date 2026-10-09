import { getNotionBlogCover, hasNotionCredentials } from "@/lib/notion";

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
 */

const PAGE_ID =
  /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; version: string }> }
) {
  const { id } = await params;
  if (!PAGE_ID.test(id) || !hasNotionCredentials()) {
    return new Response(null, { status: 404 });
  }
  const file = await getNotionBlogCover(id).catch(() => null);
  if (!file) return new Response(null, { status: 404 });
  const image = await fetch(file).catch(() => null);
  if (!image?.ok || !image.body) return new Response(null, { status: 502 });

  return new Response(image.body, {
    headers: {
      "Content-Type": image.headers.get("content-type") ?? "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
