import { getPostBySlug, getPublicPostSlugs } from "@/lib/blog";
import { renderThumbnail } from "@/lib/og-card";

/**
 * The post's artwork on its own — the same dither as the share card, with none
 * of its furniture. Used for the listing thumbnail, where the title, category
 * and date already appear as text beneath the image.
 */
export function generateStaticParams() {
  return getPublicPostSlugs().map((slug) => ({ slug }));
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  // Match `app/blog/[slug]/page.tsx`: a draft is a 404 in production, so a
  // direct request can't surface unpublished artwork. Visible in preview/dev.
  if (post.draft && process.env.VERCEL_ENV === "production") {
    return new Response(null, { status: 404 });
  }
  return renderThumbnail(post.cardArt);
}
