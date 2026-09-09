import Link from "next/link";

import { Authors } from "@/components/livepeer-ui/changelog-listing";
import type { ChangelogEntry as Entry } from "@/lib/changelog";

function formatDay(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    timeZone: "UTC",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * One change at its own address, so it can be linked from a release note, a
 * forum thread or a tweet. The same measure and prose as a blog post, without
 * a cover: the headline, the day, who shipped it, the summary, then the
 * write-up if there is one. A change can be a headline and a sentence, and
 * the page says so rather than padding it.
 */
export function ChangelogEntry({ entry }: { entry: Entry }) {
  return (
    <div className="px-4 pt-24 pb-24 sm:px-6 lg:px-10">
      <article className="mx-auto max-w-[680px]">
        <header className="mb-10">
          <nav
            aria-label="Breadcrumb"
            className="mb-8 flex items-center gap-2 text-sm text-muted-foreground"
          >
            <Link
              href="/changelog"
              className="transition-colors hover:text-foreground"
            >
              Changelog
            </Link>
            <span aria-hidden="true">›</span>
            <time dateTime={entry.date}>{formatDay(entry.date)}</time>
          </nav>

          <h1 className="text-3xl font-medium tracking-tight text-balance sm:text-4xl lg:text-[2.75rem] lg:leading-[1.15]">
            {entry.title}
          </h1>

          {entry.summary && (
            <p className="mt-5 text-reading-body text-pretty text-muted-foreground">
              {entry.summary}
            </p>
          )}

          <div className="mt-6">
            <Authors people={entry.authors} />
          </div>
        </header>

        {entry.html && (
          <div
            className="article-prose"
            dangerouslySetInnerHTML={{ __html: entry.html }}
          />
        )}

        <div className="mt-16 border-t pt-10 text-center">
          <Link
            href="/changelog"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            ← All changes
          </Link>
        </div>
      </article>
    </div>
  );
}
