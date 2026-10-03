import { renderTitledCard, ogArt, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const alt =
  "Livepeer Changelog — what shipped, and how the rest is going";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OpengraphImage() {
  return renderTitledCard(
    ogArt.changelog,
    "What shipped, and how the rest is going.",
    "Changelog"
  );
}
