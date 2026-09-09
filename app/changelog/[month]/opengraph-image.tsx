import { notFound } from "next/navigation";

import { MONTH, monthTitle } from "@/lib/changelog";
import { renderTitledCard, ogArt, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const alt = "Livepeer Changelog";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ month: string }>;
}) {
  const { month } = await params;
  if (!MONTH.test(month)) notFound();
  // The month over the changelog's own art: a roundup has no cover of its
  // own, and one is not wanted for a page generated from the register.
  return renderTitledCard(ogArt.changelog, monthTitle(month), "Changelog");
}
