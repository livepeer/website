import { renderPageCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

// alt describes what the card shows: the lockup, then the page title.
export const alt = "Livepeer — Latest";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OpengraphImage() {
  return renderPageCard("Latest");
}
