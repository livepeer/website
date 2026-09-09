"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

import {
  HealthIcon,
  HealthMark,
  ShippedIcon,
  ShippedMark,
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
  /** Still being written: the month `now` falls in. */
  current: boolean;
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
 * One group within a month — Shipped, In progress, No update — as a labelled
 * list of hairlined rows. The label is the register's eyebrow setting, so
 * the roundup reads as the roadmap re-sorted by month rather than as a new
 * kind of page.
 */
function Section({
  label,
  count,
  children,
}: {
  label: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="flex items-baseline justify-between gap-6 text-[0.6875rem] leading-4 font-medium tracking-[0.09em] text-muted-foreground uppercase">
        {label}
        <span className="font-mono tracking-normal tabular-nums">{count}</span>
      </h3>
      <ul className="mt-2 divide-y divide-border border-y border-border">
        {children}
      </ul>
    </section>
  );
}

/**
 * A commitment in a roundup, laid out after Linear's project list: the
 * health first, in a column of its own, so the eye can run down the colour
 * and stop where it changes; then the title and, beneath it, what its lead
 * said, clamped to two lines so a wordy update does not stall the scan;
 * then who owns it and, for shipped work, when, on the right. On a phone
 * the columns stack, health above the title.
 */
function Row({
  row,
  mark,
  date,
  children,
}: {
  row: RoundupRow;
  mark: React.ReactNode;
  date?: string;
  children?: React.ReactNode;
}) {
  return (
    <li className="grid gap-x-5 gap-y-1.5 py-3.5 md:grid-cols-[7.5rem_minmax(0,1fr)_auto] md:items-baseline">
      <div className="text-sm">{mark}</div>
      <div className="min-w-0">
        <Link
          href={`/roadmap/${row.slug}`}
          className="font-medium text-pretty transition-colors hover:text-muted-foreground"
        >
          {row.title}
        </Link>
        {children}
      </div>
      <div className="text-sm text-muted-foreground md:text-right">
        <Link
          href={`/organizations/${row.ownerSlug}`}
          className="underline decoration-transparent underline-offset-4 transition-colors hover:decoration-border"
        >
          {row.owner}
        </Link>
        {date && (
          <time dateTime={date} className="block font-mono text-xs">
            {formatDay(date)}
          </time>
        )}
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
          {r.quiet.length} {r.current ? "not yet reported" : "no update"}
        </li>
      )}
    </ul>
  );
}

function Month({ r }: { r: RoundupView }) {
  return (
    <div className="flex flex-col gap-9">
      {r.shipped.length > 0 && (
        <Section label="Shipped" count={r.shipped.length}>
          {r.shipped.map((row) => (
            <Row
              key={row.slug}
              row={row}
              mark={<ShippedMark />}
              date={row.shippedAt}
            >
              {/* The lead's last word on it before it shipped, where there
                  was one, so shipping is not only a title and a date. */}
              {row.summary && (
                <p className="mt-1 line-clamp-2 text-sm text-pretty text-muted-foreground">
                  {row.summary}
                </p>
              )}
            </Row>
          ))}
        </Section>
      )}

      {r.reported.length > 0 && (
        <Section label="In progress" count={r.reported.length}>
          {r.reported.map((row) => (
            <Row
              key={row.slug}
              row={row}
              mark={<HealthMark health={row.health} />}
            >
              <p className="mt-1 line-clamp-2 text-sm text-pretty text-muted-foreground">
                {row.summary}
              </p>
            </Row>
          ))}
        </Section>
      )}

      {/* The accountability half. Under way, and nothing said this month:
          the list Linear's rollup exists to surface. In the month under way
          it is softer, because the month is not over. When every commitment
          under way did post, the roundup says so rather than leaving a gap
          the reader has to interpret. */}
      {r.quiet.length > 0 ? (
        <Section
          label={r.current ? "No update yet" : "No update"}
          count={r.quiet.length}
        >
          {r.quiet.map((row) => (
            <Row
              key={row.slug}
              row={row}
              mark={<HealthMark health="no-update" />}
            />
          ))}
        </Section>
      ) : (
        r.reported.length > 0 &&
        !r.current && (
          <p className="text-sm text-muted-foreground">
            Everything under way posted an update.
          </p>
        )
      )}
    </div>
  );
}

/**
 * The changelog: one roundup per month, newest first, generated from the
 * roadmap register and the updates posted on it (see lib/changelog.ts).
 *
 * The same shape as the blog's row over a dated list — Vercel's changelog
 * page — with the month where the day used to be: the month and its tally
 * in a column of its own on the left, its roundup beside it in three
 * groups. Nothing here is written; a month is what the register and the
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
              {emptyMessage}
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
                      {r.current && (
                        <span className="text-muted-foreground"> so far</span>
                      )}
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
