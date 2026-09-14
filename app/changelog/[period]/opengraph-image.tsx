import { notFound } from "next/navigation";

import { PERIOD, parsePeriod } from "@/lib/period";
import { renderTitledCard, ogArt, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const alt = "Livepeer Changelog";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ period: string }>;
}) {
  const { period } = await params;
  if (!PERIOD.test(period)) notFound();
  // The period over the changelog's own art: an entry has no cover of its
  // own, and one is not wanted for a page generated from the register.
  return renderTitledCard(
    ogArt.changelog,
    parsePeriod(period).label,
    "Changelog"
  );
}
