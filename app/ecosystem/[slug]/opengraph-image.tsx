import { renderArtCard, ogArt, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";
import { getAppSlugs } from "@/lib/ecosystem";

export const alt = "Livepeer Ecosystem";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export function generateStaticParams() {
  return getAppSlugs().map((slug) => ({ slug }));
}

// Without this file a project page has no share image at all: the page's
// generateMetadata declares an `openGraph` object with no `images`, which drops
// the card it would otherwise inherit from /ecosystem.
export default function OpengraphImage() {
  return renderArtCard(ogArt.ecosystem);
}
