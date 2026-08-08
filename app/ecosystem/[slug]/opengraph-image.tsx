import { renderPageCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";
import { getAppBySlug, getAppSlugs } from "@/lib/ecosystem";

export const alt = "Livepeer Ecosystem";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export function generateStaticParams() {
  return getAppSlugs().map((slug) => ({ slug }));
}

// Without this file a project page has no share image at all: the page's
// generateMetadata declares an `openGraph` object with no `images`, and that
// drops the card it would otherwise inherit from /ecosystem. A per-project
// card is the better fix anyway — a link to Daydream should not share as the
// same picture as a link to the catalogue.
export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return renderPageCard(getAppBySlug(slug).name);
}
