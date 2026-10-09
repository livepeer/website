import { renderTitledCard, ogArt, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const alt = "Livepeer Ecosystem — Submit your project";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

// The ecosystem's frame with the page's own title on it, so a link to this
// page and a link to the catalogue are not the same picture in a timeline.
// Without this file the page has no share image at all: its metadata declares
// an `openGraph` object with no `images`, which drops the card it would
// otherwise inherit from /ecosystem.
export default function OpengraphImage() {
  return renderTitledCard(ogArt.ecosystem, "Submit your project", "Ecosystem");
}
