import { renderPostCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";
import { getPostBySlug, getPostSlugs } from "@/lib/blog";

export const alt = "Livepeer";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export function generateStaticParams() {
  return getPostSlugs().map((slug) => ({ slug }));
}

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  return renderPostCard(post.image, post.title);
}
