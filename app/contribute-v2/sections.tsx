import { ArrowUpRightIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

/* ------------------------------------------------------------------ *
 * Types
 * ------------------------------------------------------------------ */

export type Ref = { label: string; href: string };

export type Rung = {
  name: string;
  /** One phrase. The reader decides from this and the ceiling, nothing else. */
  bestFor: string;
  /** The column that gets scanned. Short enough never to wrap. */
  ceiling: string;
  apply: Ref;
};

export type RungGroup = {
  /** The body that says yes. */
  name: string;
  rungs: Rung[];
};

/* ------------------------------------------------------------------ *
 * Links
 * ------------------------------------------------------------------ */

/**
 * External links get the arrow and a new tab; internal ones get neither.
 * The arrow means "this leaves the site", so putting one on /roadmap would
 * make it mean nothing. The arrow is inline, not a flex item, so a label that
 * wraps keeps it after the last word.
 */
function Ref({
  label,
  href,
  className = "",
}: Ref & { className?: string }) {
  const external = !href.startsWith("/");
  const base =
    "underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground";

  if (!external) {
    return (
      <Link href={href} className={`${base} ${className}`}>
        {label}
      </Link>
    );
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${base} ${className}`}
    >
      {label}
      <ArrowUpRightIcon
        className="ml-1 inline size-3.5 -translate-y-px align-middle text-muted-foreground"
        aria-hidden="true"
      />
    </a>
  );
}

/* ------------------------------------------------------------------ *
 * Hero
 * ------------------------------------------------------------------ */

/**
 * The hero is the answer to "how do I get involved", not the introduction to
 * it. One sentence, and the one thing to do — a real button, because the
 * action really is "go and say hello", and the two quieter doors beside it.
 */
export function Hero({
  eyebrow,
  heading,
  description,
  primary,
  secondary,
}: {
  eyebrow: string;
  heading: string;
  description: string;
  primary: Ref;
  secondary: Ref[];
}) {
  return (
    <header className="mx-auto w-full max-w-page px-4 pt-12 text-center sm:px-6 lg:px-10 lg:pt-16">
      <p className="font-mono text-ui-caption tracking-wide text-muted-foreground uppercase">
        {eyebrow}
      </p>
      <h1 className="mt-6 text-display-sm text-balance sm:text-display-fluid">
        {heading}
      </h1>
      <p className="mx-auto mt-5 max-w-[46ch] text-reading-body text-balance text-muted-foreground">
        {description}
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-4">
        <Button
          size="lg"
          nativeButton={false}
          render={
            <a
              href={primary.href}
              target="_blank"
              rel="noopener noreferrer"
            />
          }
          className="h-12 rounded-sm px-5"
        >
          {primary.label}
          <ArrowUpRightIcon className="size-4" aria-hidden="true" />
        </Button>
        <p className="flex items-center gap-x-5 text-sm">
          {secondary.map((ref) => (
            <Ref key={ref.href} {...ref} />
          ))}
        </p>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ *
 * The ladder
 * ------------------------------------------------------------------ */

/**
 * Five ways work gets paid for, ordered by size.
 *
 * The order is the design. A newcomer's real question is "how big is my
 * thing", and a list that climbs from a bounty to a treasury vote lets them
 * read down the ceiling column and stop at their rung — which is why that
 * column is set in mono and right-aligned, so the figures line up under each
 * other. Everything that used to explain the process (seven days, quorum) is
 * behind the link on the row, where it is read by the one person who has
 * already chosen that path.
 *
 * On a muted band so it reads as a reference card, distinct from the prose
 * above it. Below sm the rows stack; the header goes to screen readers. The
 * display change strips table semantics in Chrome and Safari, so the roles
 * are set explicitly and survive the reflow.
 */
export function Ladder({
  title,
  intro,
  groups,
  notes,
}: {
  title: string;
  intro: React.ReactNode;
  groups: RungGroup[];
  notes: React.ReactNode[];
}) {
  const cell = "block sm:table-cell sm:py-5 sm:align-baseline";

  return (
    <section className="mt-20 bg-muted py-16 sm:mt-24 sm:py-20">
      <div className="mx-auto w-full max-w-page px-4 sm:px-6 lg:px-10">
        {/* 4xl, not 3xl: the "best for" column needs ~470px for every rung to
            stay on one line, and one line per rung is the whole point. */}
        <div className="mx-auto max-w-4xl">
          <h2 className="text-page-title text-balance sm:text-display-sm">
            {title}
          </h2>
          <p className="mt-4 max-w-[52ch] text-reading-body text-pretty text-muted-foreground [&_a]:text-foreground [&_a]:underline [&_a]:decoration-border [&_a]:underline-offset-4 [&_a]:transition-colors hover:[&_a]:decoration-foreground">
            {intro}
          </p>

          <table role="table" className="mt-6 w-full border-collapse text-sm">
            <caption className="sr-only">{title}</caption>
            <thead role="rowgroup" className="sr-only">
              <tr role="row">
                <th role="columnheader" scope="col">
                  Path
                </th>
                <th role="columnheader" scope="col">
                  Best for
                </th>
                <th role="columnheader" scope="col">
                  Ceiling
                </th>
                <th role="columnheader" scope="col">
                  Apply
                </th>
              </tr>
            </thead>
            {groups.map((group) => (
              <tbody key={group.name} role="rowgroup">
                <tr role="row" className="block sm:table-row">
                  <th
                    role="rowheader"
                    scope="rowgroup"
                    colSpan={4}
                    className="block pt-8 pb-3 text-left font-mono text-ui-caption font-normal tracking-wide text-muted-foreground uppercase sm:table-cell"
                  >
                    {group.name}
                  </th>
                </tr>
                {group.rungs.map((rung) => (
                  <tr
                    key={rung.name}
                    role="row"
                    className="block border-t border-border py-4 sm:table-row sm:py-0"
                  >
                    <th
                      role="rowheader"
                      scope="row"
                      className={`${cell} pr-6 text-left font-medium sm:w-[11rem]`}
                    >
                      {rung.name}
                    </th>
                    <td
                      role="cell"
                      className={`${cell} mt-1 pr-6 text-muted-foreground sm:mt-0`}
                    >
                      {rung.bestFor}
                    </td>
                    {/* Stacked, the ceiling and the link share a line — a
                        rung is three lines on a phone, not four. */}
                    <td
                      role="cell"
                      className="mt-3 inline-block font-mono whitespace-nowrap sm:mt-0 sm:table-cell sm:w-[9rem] sm:py-5 sm:pr-6 sm:text-right sm:align-baseline"
                    >
                      {rung.ceiling}
                    </td>
                    <td
                      role="cell"
                      className="mt-3 ml-5 inline-block sm:mt-0 sm:ml-0 sm:table-cell sm:w-[5rem] sm:py-5 sm:text-right sm:align-baseline"
                    >
                      <Ref {...rung.apply} className="text-foreground" />
                    </td>
                  </tr>
                ))}
              </tbody>
            ))}
          </table>

          {/* The two things true of the whole ladder, which would be wrong to
              repeat on five rows. Small, and not a section: a rule and a
              heading would promise more than two lines deliver. */}
          <div className="mt-8 grid max-w-[60ch] gap-2 text-xs leading-relaxed text-muted-foreground [&_a]:underline [&_a]:decoration-border [&_a]:underline-offset-4 [&_a]:transition-colors hover:[&_a]:decoration-foreground">
            {notes.map((note, index) => (
              <p key={index}>{note}</p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
