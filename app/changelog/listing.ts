import type { LatestLink } from "@/components/livepeer-ui/latest-nav";
import type { BlogSummary } from "@/lib/blog";

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
    "What shipped on the network, the Agent, the protocol and this site, by day.",
  searchPlaceholder: "Search changes",
  emptyMessage: "No changes match that search.",
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
