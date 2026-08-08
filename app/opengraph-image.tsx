import { renderBrandCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const alt = "Livepeer — The open inference network";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

// The site card is the brand card: livepeer.org is the thing being shared, so
// it gets the lockup rather than a page title.
export default function OpengraphImage() {
  return renderBrandCard();
}
