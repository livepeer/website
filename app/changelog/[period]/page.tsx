import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ChangelogListing } from "@/components/livepeer-ui/changelog-listing";
import { roundups } from "@/lib/changelog";
import { PERIOD, parsePeriod } from "@/lib/period";
import {
  getBlogRegister,
  getEntries,
  getRegister,
  getUpdates,
} from "@/lib/register";

import { changelog, changelogRow, toView } from "../listing";

type Props = {
  params: Promise<{ period: string }>;
};

/**
 * One entry, at its own address, so it can be linked from the forum or a
 * call the way a written wrap-up used to be.
 *
 * No `dynamicParams = false`: a row added in Notion after the last build
 * has to give its period a page on first request. A period with no row,
 * or one still under way, 404s.
 */
async function months() {
  const [entries, commitments, updates] = await Promise.all([
    getEntries(),
    getRegister(),
    getUpdates(),
  ]);
  return roundups(entries, commitments, updates, new Date());
}

export async function generateStaticParams() {
  return (await months()).map((r) => ({ period: r.key }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { period } = await params;
  if (!PERIOD.test(period)) return { title: "Not Found — Livepeer Changelog" };
  const label = parsePeriod(period).label;
  const title = `${label} | Livepeer Changelog`;
  const description = `What shipped on the Livepeer roadmap in ${label}, how the work under way was going, and who did not report.`;
  return {
    title,
    description,
    openGraph: { title, description, type: "article" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function ChangelogMonthPage({ params }: Props) {
  const { period } = await params;
  if (!PERIOD.test(period)) notFound();

  const [all, posts] = await Promise.all([months(), getBlogRegister()]);
  const at = all.findIndex((r) => r.key === period);
  if (at < 0) notFound();

  // Newest first, so the entry before this one is the next index along.
  const link = (r?: (typeof all)[number]) =>
    r && { period: r.key, title: r.label };

  return (
    <ChangelogListing
      roundups={[toView(all[at]!)]}
      neighbours={{ previous: link(all[at + 1]), next: link(all[at - 1]) }}
      heading={changelog.heading}
      intro={changelog.intro}
      {...changelogRow(posts)}
      current={changelog.href}
      feedHref={changelog.feedHref}
      searchPlaceholder={changelog.searchPlaceholder}
      emptyMessage={changelog.emptyMessage}
      noMonthsMessage={changelog.noMonthsMessage}
    />
  );
}
