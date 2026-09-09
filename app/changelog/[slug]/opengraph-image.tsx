import { notFound } from "next/navigation";

import { renderTitledCard, ogArt, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";
import { getChangelog } from "@/lib/register";

export const alt = "Livepeer Changelog";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export async function generateStaticParams() {
  const entries = await getChangelog();
  return entries.map((entry) => ({ slug: entry.slug }));
}

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  // The list rather than the entry: the card is the headline over the
  // changelog's own art, and an entry has no cover of its own to draw from.
  const entry = (await getChangelog()).find((e) => e.slug === slug);
  if (!entry) notFound();
  return renderTitledCard(ogArt.changelog, entry.title, "Changelog");
}
