import { ChangelogListing } from "@/components/livepeer-ui/changelog-listing";
import { roundups } from "@/lib/changelog";
import {
  getBlogRegister,
  getEntries,
  getEntryBody,
  getRegister,
  getUpdates,
} from "@/lib/register";

import { changelog, changelogRow, toView } from "./listing";

// Generated, not written: every entry is composed from the roadmap register
// and the updates posted on it, for the periods the team has published (see
// lib/changelog.ts). The blog register is read only for the row — the
// categories beside Changelog are the blog's, and the row is the same one
// /blog shows.
export default async function ChangelogPage() {
  const [entries, commitments, updates, posts] = await Promise.all([
    getEntries(),
    getRegister(),
    getUpdates(),
    getBlogRegister(),
  ]);
  const months = roundups(entries, commitments, updates, new Date());
  // The intros of the entries shown in full, and no others.
  const shown = months.slice(0, changelog.recentMonths);
  const intros = await Promise.all(shown.map((r) => getEntryBody(r.key)));

  return (
    <ChangelogListing
      roundups={shown.map((r, i) => toView(r, intros[i]))}
      earlier={months
        .slice(changelog.recentMonths)
        .map(({ key, label }) => ({ period: key, title: label }))}
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
