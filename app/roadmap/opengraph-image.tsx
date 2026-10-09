import { renderTitledCard, ogArt, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const alt = "Livepeer Roadmap \u2014 what we\u2019re building, and when";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

/**
 * The page's own headline, not the word "Roadmap".
 *
 * A shared link is read in a timeline, next to things competing for the same
 * glance, and "Roadmap" says nothing a reader could not guess from the URL.
 * The headline is the claim the page opens on, and it is the reason to click.
 */
export default function OpengraphImage() {
  // The same curly apostrophe the page and the metadata use. A straight one
  // here rendered a different glyph in the card than in the og:title beside it.
  return renderTitledCard(
    ogArt.roadmap,
    "What we\u2019re building, and when.",
    "Roadmap"
  );
}
