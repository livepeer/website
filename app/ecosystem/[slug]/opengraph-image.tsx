import { notFound } from "next/navigation";

import { renderTitledCard, ogArt, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";
import { getAppBySlug, getAppSlugs } from "@/lib/ecosystem";

export const alt = "Livepeer Ecosystem";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export function generateStaticParams() {
  return getAppSlugs().map((slug) => ({ slug }));
}

// The project's name over the ecosystem's frame, the way an organization is
// drawn over its own: every project shared under the bare lockup was the
// same picture, and a link to one project should say which. The frame is
// shared rather than the project's logo, because a logo is drawn for a square
// on a card, not for a 1200 × 630 canvas.
//
// Without this file a project page has no share image at all: the page's
// generateMetadata declares an `openGraph` object with no `images`, which
// drops the card it would otherwise inherit from /ecosystem.
export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!getAppSlugs().includes(slug)) notFound();
  return renderTitledCard(
    ogArt.ecosystem,
    getAppBySlug(slug).name,
    "Ecosystem"
  );
}
