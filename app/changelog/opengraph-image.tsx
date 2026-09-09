import { renderTitledCard, ogArt, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const alt = "Livepeer Changelog — what shipped, by day";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OpengraphImage() {
  return renderTitledCard(
    ogArt.changelog,
    "What shipped, by day.",
    "Changelog"
  );
}
