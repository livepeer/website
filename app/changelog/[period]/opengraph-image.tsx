import { notFound } from "next/navigation";

import { roundups } from "@/lib/changelog";
import { periodOf } from "@/lib/period";
import { renderTitledCard, ogArt, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";
import { getEntries, getRegister, getUpdates } from "@/lib/register";

export const alt = "Livepeer Changelog";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ period: string }>;
}) {
  const { period } = await params;
  if (!periodOf(period)) notFound();
  // Only an entry the page shows has a card: published and closed, the same
  // lookup as the page, so a period that 404s there 404s here too.
  const [entries, commitments, updates] = await Promise.all([
    getEntries(),
    getRegister(),
    getUpdates(),
  ]);
  const entry = roundups(entries, commitments, updates, new Date()).find(
    (r) => r.key === period
  );
  if (!entry) notFound();
  // The period over the changelog's own art: an entry has no cover of its
  // own, and one is not wanted for a page generated from the register.
  return renderTitledCard(ogArt.changelog, entry.label, "Changelog");
}
