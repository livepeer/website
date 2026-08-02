import { getPostBySlug, getPublicPostSlugs } from "@/lib/blog";
import { shareImageMetadata } from "@/lib/og-card";

// The Twitter card is the same artwork as the Open Graph card, so the renderer
// and its constants are re-exported. `generateStaticParams` and
// `generateImageMetadata`, however, are reserved exports that Next discovers
// per image-route file — a re-export can leave `/blog/[slug]/twitter-image`
// unmapped — so they're declared directly here over the shared helpers.
export { default, size, contentType } from "./opengraph-image";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getPublicPostSlugs().map((slug) => ({ slug }));
}

export async function generateImageMetadata({ params }: Props) {
  const { slug } = await params;
  return shareImageMetadata(getPostBySlug(slug));
}
