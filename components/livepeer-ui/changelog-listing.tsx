"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import {
  LatestNav,
  type LatestLink,
} from "@/components/livepeer-ui/latest-nav";
import type { Person } from "@/lib/roadmap";

export type ChangelogListingEntry = {
  slug: string;
  title: string;
  summary: string;
  /** ISO yyyy-mm-dd: the day it shipped. */
  date: string;
  authors: Person[];
};

function formatDay(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    timeZone: "UTC",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function byDay<T extends { date: string }>(entries: T[]) {
  const days = new Map<string, T[]>();
  for (const entry of entries) {
    const day = days.get(entry.date);
    if (day) day.push(entry);
    else days.set(entry.date, [entry]);
  }
  return [...days].map(([date, entries]) => ({ date, entries }));
}

/**
 * Days gathered into months, each month keyed yyyy-mm so it can be linked
 * to as /changelog#2026-08 — the anchor a monthly wrap-up on the blog points
 * at when it says "everything that shipped in August".
 */
function byMonth<T extends { date: string }>(days: T[]) {
  const months = new Map<string, T[]>();
  for (const day of days) {
    const key = day.date.slice(0, 7);
    const month = months.get(key);
    if (month) month.push(day);
    else months.set(key, [day]);
  }
  return [...months].map(([key, days]) => ({ key, days }));
}

function formatMonth(key: string): string {
  return new Date(`${key}-01`).toLocaleDateString("en-US", {
    timeZone: "UTC",
    month: "long",
    year: "numeric",
  });
}

/**
 * Who shipped it: overlapping faces, then the names as one line. A monogram
 * where there is no portrait, so a row never mixes pictures and gaps. Each
 * face is a link to the person's page, the same as a credited face on a
 * roadmap card.
 */
export function Authors({ people }: { people: Person[] }) {
  if (people.length === 0) return null;
  const names =
    people.length <= 2
      ? people.map((p) => p.name).join(" and ")
      : `${people[0].name}, ${people[1].name}, and ${people.length - 2} other${people.length > 3 ? "s" : ""}`;
  return (
    <div className="flex items-center gap-3 text-sm text-muted-foreground">
      <span className="flex -space-x-1.5">
        {people.map((person) => (
          <Link
            key={person.slug}
            href={`/people/${person.slug}`}
            aria-label={person.name}
            className="relative flex size-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-[0.625rem] font-medium text-muted-foreground ring-2 ring-background transition hover:z-10 hover:-translate-y-0.5"
          >
            {person.avatar ? (
              <Image
                src={`/people/${person.avatar}`}
                alt=""
                width={48}
                height={48}
                className="size-full object-cover"
              />
            ) : (
              person.name.charAt(0)
            )}
          </Link>
        ))}
      </span>
      <span>{names}</span>
    </div>
  );
}

/**
 * The changelog: what shipped, by day, newest first. After Vercel's, which
 * is the same row as its blog over a list where the date is the rail the
 * entries hang from — said once per day, with the entries beside it. Where a
 * blog post is a cover and a headline, a change is a headline and a paragraph,
 * so this is a list rather than a grid, and no cover is asked for.
 *
 * The row is the blog's: the same places, with Changelog pressed. Search
 * narrows the entries on the page by headline and summary.
 */
export function ChangelogListing({
  entries,
  heading,
  intro,
  allHref,
  categories,
  siblings,
  current,
  feedHref,
  searchPlaceholder,
  emptyMessage,
}: {
  entries: ChangelogListingEntry[];
  heading: string;
  intro: string;
  allHref: string;
  categories: LatestLink[];
  siblings: LatestLink[];
  current: string;
  feedHref?: string;
  searchPlaceholder: string;
  emptyMessage: string;
}) {
  const [query, setQuery] = useState("");

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter((entry) =>
      `${entry.title} ${entry.summary}`.toLowerCase().includes(q)
    );
  }, [entries, query]);

  const days = byDay(matches);
  const months = byMonth(days);

  return (
    <div className="pt-16 pb-24">
      <div className="mx-auto w-full max-w-page px-4 sm:px-6 lg:px-10">
        <h1 className="text-display-md font-normal">{heading}</h1>

        <LatestNav
          allHref={allHref}
          categories={categories}
          siblings={siblings}
          current={current}
          feedHref={feedHref}
          query={query}
          onQueryChange={setQuery}
          searchPlaceholder={searchPlaceholder}
        />

        <div className="mt-12">
          <p className="sr-only" role="status" aria-live="polite">
            {matches.length} of {entries.length} entries shown
          </p>

          {days.length === 0 ? (
            <p className="py-16 text-center text-reading-body text-muted-foreground">
              {emptyMessage}
            </p>
          ) : (
            <ol>
              {months.map((month) => (
                <li key={month.key} className="mt-16 first:mt-0">
                  {/* A month marker only once the list spans more than one:
                      over a single month it would only repeat the dates
                      below it. The id is the anchor a wrap-up links to. */}
                  {months.length > 1 && (
                    <h2
                      id={month.key}
                      className="mb-8 scroll-mt-24 border-b border-border pb-3 font-mono text-xs text-muted-foreground"
                    >
                      {formatMonth(month.key)}
                    </h2>
                  )}
                  <ol className="divide-y divide-border">
                    {month.days.map((day) => (
                      // The date sits in a column of its own on wide screens
                      // and stays put while the day's entries scroll past it,
                      // so a day with three changes still reads as one day.
                      // On a phone it is a line above them.
                      <li
                        key={day.date}
                        className="grid gap-4 py-10 first:pt-0 md:grid-cols-[14rem_minmax(0,40rem)] md:gap-12 md:py-12 lg:grid-cols-[18rem_minmax(0,40rem)]"
                      >
                        <time
                          dateTime={day.date}
                          className="text-sm text-muted-foreground md:sticky md:top-24 md:self-start"
                        >
                          {formatDay(day.date)}
                        </time>
                        <ol className="flex flex-col gap-10">
                          {day.entries.map((entry) => (
                            <li
                              key={entry.slug}
                              className="flex flex-col gap-3"
                            >
                              <h3 className="text-xl leading-snug font-medium tracking-tight text-pretty">
                                <Link
                                  href={`/changelog/${entry.slug}`}
                                  className="transition-colors hover:text-muted-foreground"
                                >
                                  {entry.title}
                                </Link>
                              </h3>
                              {entry.summary && (
                                <p className="text-reading-body text-pretty text-muted-foreground">
                                  {entry.summary}
                                </p>
                              )}
                              <Authors people={entry.authors} />
                            </li>
                          ))}
                        </ol>
                      </li>
                    ))}
                  </ol>
                </li>
              ))}
            </ol>
          )}
        </div>
        <p className="sr-only">{intro}</p>
      </div>
    </div>
  );
}
