import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ChangelogListing } from "@/components/livepeer-ui/changelog-listing";
import { MONTH, monthTitle, roundups } from "@/lib/changelog";
import { getBlogRegister, getRegister, getUpdates } from "@/lib/register";

import { changelog, changelogRow, toView } from "../listing";

type Props = {
  params: Promise<{ month: string }>;
};

/**
 * One month, at its own address, so a roundup can be linked from the forum
 * or a call the way a written wrap-up used to be.
 *
 * No `dynamicParams = false`: a new month begins without a deploy, and the
 * first update posted in it has to give the month a page. A month with
 * nothing in it still 404s, because the list below is only the months with
 * something to say.
 */
async function months() {
  const [commitments, updates] = await Promise.all([
    getRegister(),
    getUpdates(),
  ]);
  return roundups(commitments, updates, new Date());
}

export async function generateStaticParams() {
  return (await months()).map((r) => ({ month: r.month }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { month } = await params;
  if (!MONTH.test(month)) return { title: "Not Found — Livepeer Changelog" };
  const title = `${monthTitle(month)} | Livepeer Changelog`;
  const description = `What shipped on the Livepeer roadmap in ${monthTitle(month)}, how the work under way was going, and who did not report.`;
  return {
    title,
    description,
    openGraph: { title, description, type: "article" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function ChangelogMonthPage({ params }: Props) {
  const { month } = await params;
  if (!MONTH.test(month)) notFound();

  const [all, posts] = await Promise.all([months(), getBlogRegister()]);
  const at = all.findIndex((r) => r.month === month);
  if (at < 0) notFound();

  // Newest first, so the month before this one is the next index along.
  const link = (r?: (typeof all)[number]) =>
    r && { month: r.month, title: r.title };

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
