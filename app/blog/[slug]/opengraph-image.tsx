import { getPostBySlug, getPublicPostSlugs } from "@/lib/blog";
import {
  OG_CONTENT_TYPE,
  OG_SIZE,
  renderOgCard,
  shareImageMetadata,
} from "@/lib/og-card";

type Props = { params: Promise<{ slug: string }> };

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

// Enumerate the publicly reachable slugs so the route is treated as static
// rather than fully dynamic. Drafts are filtered in production to match
// `app/blog/[slug]/page.tsx`, so a hidden post gets no pre-rendered card. Next
// still materialises the PNG on first request (metadata routes under a dynamic
// segment aren't written to disk at build), after which it is cached — crawlers
// pay the render once.
export function generateStaticParams() {
  return getPublicPostSlugs().map((slug) => ({ slug }));
}

// `alt` has to be static for a dynamic route, so the per-post description is
// supplied here instead — it becomes og:image:alt / twitter:image:alt.
export async function generateImageMetadata({ params }: Props) {
  const { slug } = await params;
  return shareImageMetadata(getPostBySlug(slug));
}

export default async function OGImage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  return renderOgCard({
    title: post.title,
    category: post.category,
    seed: slug,
    cardArt: post.cardArt || undefined,
    date: post.date,
    readingTime: post.readingTime,
    author: post.author?.name,
  });
}
