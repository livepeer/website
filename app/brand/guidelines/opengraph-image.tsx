import { renderTitledCard, ogArt, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const alt = "Livepeer Brand — Design guidelines";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

// The page declares its own `openGraph`, which drops the card it would
// otherwise inherit from /brand; this is the brand art under its own title.
export default function OpengraphImage() {
  return renderTitledCard(ogArt.brand, "Design guidelines", "Brand");
}
