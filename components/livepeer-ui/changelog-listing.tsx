"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

import {
  HealthIcon,
  HealthWord,
  ShippedIcon,
} from "@/components/livepeer-ui/health";
import {
  LatestNav,
  type LatestLink,
} from "@/components/livepeer-ui/latest-nav";
import { HEALTH_LABEL, HEALTHS, type Health } from "@/lib/health";

export type RoundupRow = {
  slug: string;
  title: string;
  owner: string;
  ownerSlug: string;
};

/** One month, as the list needs it. Built by app/changelog/listing.ts. */
export type RoundupView = {
  /** yyyy-mm. */
  month: string;
  /** "August 2026". */
  title: string;
  shipped: (RoundupRow & { shippedAt: string; summary?: string })[];
  reported: (RoundupRow & {
    health: Health;
    date: string;
    summary: string;
  })[];
  quiet: RoundupRow[];
};

export type MonthLink = { month: string; title: string };

function formatDay(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
  });
}

function matches(row: RoundupRow, q: string): boolean {
  return `${row.title} ${row.owner}`.toLowerCase().includes(q);
}

/**
 * A commitment in a roundup: the mark in a gutter on the left like a
 * bullet, the title with its state word beside it, and one muted line
 * beneath. No rules, no columns — the colour down the left and the order
 * of the list do the grouping. The line beneath always opens with who
 * owns it, then what the state has to say: the day it shipped and the
 * lead's last word, the update, or that nothing was posted.
 */
function Row({
  row,
  icon,
  word,
  children,
}: {
  row: RoundupRow;
  icon: React.ReactNode;
  word: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <li className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3">
      <span className="flex h-6 items-center">{icon}</span>
      <div className="min-w-0">
        <h3 className="text-pretty">
          <Link
            href={`/roadmap/${row.slug}`}
            className="font-medium transition-colors hover:text-muted-foreground"
          >
            {row.title}
          </Link>
          <span className="ml-2 text-sm whitespace-nowrap">{word}</span>
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-pretty text-muted-foreground">
          {children}
        </p>
      </div>
    </li>
  );
}

/**
 * The month's numbers, under its name in the rail: how many shipped, and
 * how many were on track, at risk, off track or silent. The same icons the
 * rows carry, so the tally is also the key. A month can be read from this
 * alone, which is what a rail beside a long list is for.
 */
function Tally({ r }: { r: RoundupView }) {
  const counts = HEALTHS.map((health) => ({
    health,
    n: r.reported.filter((row) => row.health === health).length,
  })).filter(({ n }) => n > 0);
  return (
    <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground md:flex-col md:gap-y-1.5">
      {r.shipped.length > 0 && (
        <li className="flex items-center gap-1.5 tabular-nums">
          <ShippedIcon />
          {r.shipped.length} shipped
        </li>
      )}
      {counts.map(({ health, n }) => (
        <li key={health} className="flex items-center gap-1.5 tabular-nums">
          <HealthIcon health={health} />
          {n} {HEALTH_LABEL[health].toLowerCase()}
        </li>
      ))}
      {r.quiet.length > 0 && (
        <li className="flex items-center gap-1.5 tabular-nums">
          <HealthIcon health="no-update" />
          {r.quiet.length} no update
        </li>
      )}
    </ul>
  );
}

/**
 * One month as a flat list: shipped first, then work under way with what
 * needs attention first, then the silent. Nothing labels the groups —
 * the marks do, and the tally in the rail carries the counts. A month
 * with nothing shipped simply opens on the work under way: with
 * quarter-sized targets that is most months, and a line announcing it
 * read as a confession rather than a calendar.
 */
function Month({ r }: { r: RoundupView }) {
  const owner = (row: RoundupRow) => (
    <Link
      href={`/organizations/${row.ownerSlug}`}
      className="text-foreground underline decoration-transparent underline-offset-4 transition-colors hover:decoration-border"
    >
      {row.owner}
    </Link>
  );
  return (
    <ol className="flex flex-col gap-6">
      {r.shipped.map((row) => (
        <Row key={row.slug} row={row} icon={<ShippedIcon />} word="Shipped">
          {owner(row)}
          {" · "}
          <time dateTime={row.shippedAt}>{formatDay(row.shippedAt)}</time>
          {row.summary && <> · {row.summary}</>}
        </Row>
      ))}
      {r.reported.map((row) => (
        <Row
          key={row.slug}
          row={row}
          icon={<HealthIcon health={row.health} />}
          word={<HealthWord health={row.health} />}
        >
          {owner(row)}
          {" · "}
          {row.summary}
        </Row>
      ))}
      {/* The accountability half: under way, and nothing said that month.
          The owner's line is the whole row. */}
      {r.quiet.map((row) => (
        <Row
          key={row.slug}
          row={row}
          icon={<HealthIcon health="no-update" />}
          word={<HealthWord health="no-update" />}
        >
          {owner(row)} did not post this month.
        </Row>
      ))}
    </ol>
  );
}

/**
 * The changelog: one roundup per month, newest first, generated from the
 * roadmap register and the updates posted on it (see lib/changelog.ts).
 *
 * The same shape as the blog's row over a dated list — Vercel's changelog
 * page — with the month where the day used to be: the month and its tally
 * in a column of its own on the left, its roundup beside it as one flat
 * list. Nothing here is written; a month is what the register and the
 * updates say it was.
 *
 * Search narrows the rows on the page by commitment title and owner, and
 * hides a month with nothing left in it.
 */
export function ChangelogListing({
  roundups,
  earlier = [],
  neighbours,
  heading,
  intro,
  allHref,
  categories,
  siblings,
  current,
  feedHref,
  searchPlaceholder,
  emptyMessage,
  noMonthsMessage,
}: {
  roundups: RoundupView[];
  /** Months not shown in full, as links. The index passes these. */
  earlier?: MonthLink[];
  /** The months either side, when this is one month's page. */
  neighbours?: { previous?: MonthLink; next?: MonthLink };
  heading: string;
  intro: string;
  allHref: string;
  categories: LatestLink[];
  siblings: LatestLink[];
  current: string;
  feedHref?: string;
  searchPlaceholder: string;
  emptyMessage: string;
  /** For a site with no finished month yet: when the first one lands. */
  noMonthsMessage: string;
}) {
  const [query, setQuery] = useState("");

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return roundups;
    return roundups
      .map((r) => ({
        ...r,
        shipped: r.shipped.filter((row) => matches(row, q)),
        reported: r.reported.filter((row) => matches(row, q)),
        quiet: r.quiet.filter((row) => matches(row, q)),
      }))
      .filter((r) => r.shipped.length + r.reported.length + r.quiet.length > 0);
  }, [roundups, query]);

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
            {shown.length} of {roundups.length} months shown
          </p>

          {shown.length === 0 ? (
            <p className="py-16 text-center text-reading-body text-muted-foreground">
              {roundups.length === 0 ? noMonthsMessage : emptyMessage}
            </p>
          ) : (
            <ol className="divide-y divide-border">
              {shown.map((r) => (
                // The month and its tally sit in a column of their own on
                // wide screens and stay put while the roundup scrolls past.
                // On a phone they are a block above it.
                <li
                  key={r.month}
                  className="grid gap-6 py-10 first:pt-0 md:grid-cols-[14rem_minmax(0,46rem)] md:gap-12 md:py-12 lg:grid-cols-[18rem_minmax(0,46rem)]"
                >
                  <div className="md:sticky md:top-24 md:self-start">
                    <h2 className="text-sm">
                      <Link
                        href={`/changelog/${r.month}`}
                        className="text-foreground transition-colors hover:text-muted-foreground"
                      >
                        {r.title}
                      </Link>
                    </h2>
                    <Tally r={r} />
                  </div>
                  <Month r={r} />
                </li>
              ))}
            </ol>
          )}

          {earlier.length > 0 && (
            <section className="mt-4 border-t border-border pt-8">
              <h2 className="text-sm text-muted-foreground">Earlier</h2>
              <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                {earlier.map((m) => (
                  <li key={m.month}>
                    <Link
                      href={`/changelog/${m.month}`}
                      className="transition-colors hover:text-muted-foreground"
                    >
                      {m.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {neighbours && (
            <nav
              aria-label="Months"
              className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-8 text-sm text-muted-foreground"
            >
              {neighbours.previous ? (
                <Link
                  href={`/changelog/${neighbours.previous.month}`}
                  className="group inline-flex items-center gap-2 transition-colors hover:text-foreground"
                >
                  <ArrowLeft
                    className="size-4 transition-transform group-hover:-translate-x-0.5 motion-reduce:transition-none"
                    aria-hidden
                  />
                  {neighbours.previous.title}
                </Link>
              ) : (
                <span />
              )}
              <Link
                href="/changelog"
                className="transition-colors hover:text-foreground"
              >
                All months
              </Link>
              {neighbours.next ? (
                <Link
                  href={`/changelog/${neighbours.next.month}`}
                  className="group inline-flex items-center gap-2 transition-colors hover:text-foreground"
                >
                  {neighbours.next.title}
                  <ArrowRight
                    className="size-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
                    aria-hidden
                  />
                </Link>
              ) : (
                <span />
              )}
            </nav>
          )}
        </div>
        <p className="sr-only">{intro}</p>
      </div>
    </div>
  );
}
