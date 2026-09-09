import { ChangelogListing } from "@/components/livepeer-ui/changelog-listing";
import { getBlogRegister, getChangelog } from "@/lib/register";

import { changelog, changelogRow } from "./listing";

// The entries come from the register — Notion when there is a token,
// content/changelog when there is not (see CLAUDE.md → Content). The blog
// register is read too, only for the row: the categories beside Changelog
// are the blog's, and the row is the same one /blog shows.
export default async function ChangelogPage() {
  const [entries, posts] = await Promise.all([
    getChangelog(),
    getBlogRegister(),
  ]);

  return (
    <ChangelogListing
      entries={entries}
      heading={changelog.heading}
      intro={changelog.intro}
      {...changelogRow(posts)}
      current={changelog.href}
      searchPlaceholder={changelog.searchPlaceholder}
      emptyMessage={changelog.emptyMessage}
    />
  );
}
