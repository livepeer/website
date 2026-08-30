import { notFound } from "next/navigation";

import { renderTitledCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";
import { getBlogRegister } from "@/lib/register";

export const alt = "Livepeer";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export async function generateStaticParams() {
  const posts = await getBlogRegister();
  return posts.map((post) => ({ slug: post.slug }));
}

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  // The index rather than getBlogPost: the card is drawn from the art and the
  // headline, and fetching the body to throw it away is a request per post.
  const post = (await getBlogRegister()).find((p) => p.slug === slug);
  if (!post) notFound();
  return renderTitledCard(post.image, post.title);
}
