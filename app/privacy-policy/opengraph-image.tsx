import { notFound } from "next/navigation";

import { renderTitledCard, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";
import { getLegalPage } from "@/lib/register";

export const alt = "Livepeer — Legal";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

// The page's title on the plain canvas, with no art: no two pages share a
// frame (lib/og.tsx), and a legal page has no picture of its own. Without
// this file the page would unfurl with the home page's card. A page not
// shown (see getLegalPage) has no card either.
export default async function OpengraphImage() {
  const page = await getLegalPage("privacy-policy");
  if (!page) notFound();
  return renderTitledCard(undefined, page.title, "Legal");
}
