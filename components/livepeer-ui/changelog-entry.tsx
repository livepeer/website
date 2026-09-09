import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

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

          {/* The summary is the list's paragraph, not the entry's opening,
              so it is not repeated above a write-up that says the same thing
              at length — the blog omits a post's description the same way.
              It stands in only where there is no write-up, so an entry that
              is a headline and a sentence is not a headline over nothing. */}
          {!entry.html && entry.summary && (
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

        {/* The commitment this delivers, when it was one, after the write-up
            rather than under the byline: it is where the reader goes next,
            not what the entry is about. An object rather than a sentence,
            because a reference to another record wants the treatment records
            get on this site — a plate with an eyebrow, a title and an arrow.
            Hairlined, because muted sits a few steps off the background in
            dark and a plate with no edge all but vanished there. */}
        {entry.commitment && (
          <Link
            href={`/roadmap/${entry.commitment.slug}`}
            className="group mt-12 flex items-center justify-between gap-6 rounded-lg border border-border bg-muted p-5 transition-colors hover:bg-[color-mix(in_oklch,var(--muted),var(--foreground)_4%)]"
          >
            <span className="min-w-0">
              <span className="block font-mono text-xs text-muted-foreground">
                Roadmap · Shipped
              </span>
              <span className="mt-1.5 block text-base font-medium text-pretty">
                {entry.commitment.title}
              </span>
            </span>
            <ArrowRightIcon
              className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
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
