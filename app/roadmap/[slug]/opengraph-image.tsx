import { notFound } from "next/navigation";

import { renderTitledCard, ogArt, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";
import { getRegister } from "@/lib/register";

export const alt = "Livepeer Roadmap";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export async function generateStaticParams() {
  return (await getRegister()).map((c) => ({ slug: c.slug }));
}

/**
 * The record's own cover with its title over it — the same card a blog post
 * gets, because a write-up shared into a forum thread is read the same way.
 *
 * Without this file a record has no share image at all: the page's
 * generateMetadata declares an `openGraph` object with no `images`, which
 * drops the card it would otherwise inherit from /roadmap. A record with no
 * cover falls back to the roadmap's own frame rather than to no picture.
 */
export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = (await getRegister()).find((c) => c.slug === slug);
  if (!c) notFound();
  return renderTitledCard(c.cover ?? ogArt.roadmap, c.title, "Roadmap");
}
