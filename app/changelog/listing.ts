import type { LatestLink } from "@/components/livepeer-ui/latest-nav";
import type { RoundupView } from "@/components/livepeer-ui/changelog-listing";
import type { BlogSummary } from "@/lib/blog";
import type { Roundup } from "@/lib/changelog";

import { blog, categoryLinks } from "../blog/listing";

/**
 * The changelog's copy, and the row it shares with the blog. The row is built
 * from the blog's categories and siblings so the two pages cannot drift; only
 * which place reads as pressed differs.
 */
export const changelog = {
  heading: "Changelog",
  href: "/changelog",
  feedHref: "/changelog/feed.xml",
  intro:
    "Month by month: what shipped on the roadmap, how the work under way is going, and who has not reported.",
  searchPlaceholder: "Search commitments",
  emptyMessage: "Nothing matches that search.",
  noMonthsMessage:
    "The first roundup is published when this month ends. Until then, the roadmap shows how each commitment is going.",
  /** How many months the index shows in full before listing the rest. */
  recentMonths: 3,
};

export function changelogRow(register: BlogSummary[]): {
  allHref: string;
  categories: LatestLink[];
  siblings: LatestLink[];
} {
  return {
    allHref: blog.allHref,
    categories: categoryLinks(register),
    siblings: blog.siblings,
  };
}

/**
 * A roundup as the client component needs it: titles, owners and one line
 * each, and none of the write-ups the register carries. A commitment's HTML
 * body is the largest thing on a record and the list shows none of it.
 */
export function toView(r: Roundup): RoundupView {
  const row = (c: Roundup["quiet"][number]) => ({
    slug: c.slug,
    title: c.title,
    owner: c.owner,
    ownerSlug: c.ownerSlug,
  });
  return {
    month: r.month,
    title: r.title,
    shipped: r.shipped.map(({ commitment: c, update }) => ({
      ...row(c),
      shippedAt: c.shippedAt!,
      summary: update?.summary,
    })),
    reported: r.reported.map(({ commitment, update }) => ({
      ...row(commitment),
      health: update.health,
      date: update.date,
      summary: update.summary,
    })),
    quiet: r.quiet.map(row),
  };
}
