import { renderTitledCard, ogArt, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";
import { getGuide } from "@/lib/register";

export const alt = "Livepeer Roadmap — Reporting on a commitment";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

// The guide's cover and title, the way a record is drawn: the page shows a
// Notion page as a record shows its write-up, so its card is a record's card.
// Without this file the guide has no share image at all — its generateMetadata
// declares an `openGraph` object with no `images`, which drops the card it
// would otherwise inherit from /roadmap.
export default async function OpengraphImage() {
  const guide = await getGuide("reporting");
  return renderTitledCard(guide.cover ?? ogArt.roadmap, guide.title, "Roadmap");
}
