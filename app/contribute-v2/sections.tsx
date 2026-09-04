import { ArrowUpRightIcon } from "lucide-react";
import Link from "next/link";

/* ------------------------------------------------------------------ *
 * Types
 * ------------------------------------------------------------------ */

export type Ref = { label: string; href: string };

export type Move = {
  heading: string;
  body: React.ReactNode;
  /** Absent when the move's action is the thing that follows it. */
  refs?: Ref[];
};

export type Path = {
  name: string;
  /** Who says yes. Two answers on this page, and they are not interchangeable. */
  decidedBy: string;
  bestFor: string;
  /** The one column a reader scans. Kept short enough to never wrap. */
  ceiling: string;
  refs: Ref[];
};

/* ------------------------------------------------------------------ *
 * Links
 * ------------------------------------------------------------------ */

/**
 * External links get the arrow and a new tab; internal ones get neither.
 * The arrow means "this leaves the site", so putting one on /roadmap would
 * make it mean nothing.
 */
function Ref({ label, href }: Ref) {
  const external = !href.startsWith("/");
  // Inline, and the arrow inline too. As a flex item the arrow becomes its
  // own box, so a label that wraps leaves it stranded on the right, centred
  // against the whole block instead of sitting after the last word.
  const className =
    "underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground";

  if (!external) {
    return (
      <Link href={href} className={className}>
        {label}
      </Link>
    );
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {label}
      <ArrowUpRightIcon
        className="ml-1 inline size-3.5 -translate-y-px align-middle text-muted-foreground"
        aria-hidden="true"
      />
    </a>
  );
}

function Refs({ refs }: { refs: Ref[] }) {
  return (
    <p className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
      {refs.map((ref) => (
        <Ref key={ref.href} {...ref} />
      ))}
    </p>
  );
}

/* ------------------------------------------------------------------ *
 * Hero
 * ------------------------------------------------------------------ */

export function Hero({
  eyebrow,
  heading,
  description,
}: {
  eyebrow: string;
  heading: string;
  description: string;
}) {
  return (
    <header className="pt-12 text-center lg:pt-16">
      <p className="font-mono text-ui-caption tracking-wide text-muted-foreground uppercase">
        {eyebrow}
      </p>
      <h1 className="mt-6 text-display-sm text-balance sm:text-display-fluid">
        {heading}
      </h1>
      <p className="mx-auto mt-5 max-w-prose text-sm leading-relaxed text-balance text-muted-foreground">
        {description}
      </p>
    </header>
  );
}

/* ------------------------------------------------------------------ *
 * The three moves
 * ------------------------------------------------------------------ */

/**
 * An ordered list because the order is real: least commitment first.
 *
 * Not cards. A card grid says "here are some resources"; a numbered list says
 * "do this, then this", which is what a page answering "how do I get
 * involved?" owes the reader. The numeral sits in its own column so the
 * headings line up with each other rather than with the digit.
 */
export function Moves({ moves }: { moves: Move[] }) {
  return (
    <ol className="mt-20 grid gap-14 sm:mt-24 sm:gap-16">
      {moves.map((move, index) => (
        <li
          key={move.heading}
          className="grid gap-x-8 gap-y-3 sm:grid-cols-[3rem_1fr]"
        >
          <span
            className="font-mono text-ui-caption text-muted-foreground sm:pt-3"
            aria-hidden="true"
          >
            {index + 1}
          </span>
          <div>
            <h2 className="text-page-title text-balance sm:text-display-sm">
              {move.heading}
            </h2>
            <div className="mt-4 max-w-[62ch] text-reading-body text-pretty text-muted-foreground [&_a]:text-foreground [&_a]:underline [&_a]:decoration-border [&_a]:underline-offset-4 [&_a]:transition-colors hover:[&_a]:decoration-foreground">
              {move.body}
            </div>
            {move.refs && (
              <div className="mt-5">
                <Refs refs={move.refs} />
              </div>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}

/* ------------------------------------------------------------------ *
 * The funding table
 * ------------------------------------------------------------------ */

/**
 * A table, because the data is tabular.
 *
 * Five paths, and the question a reader brings is "which one is mine" — which
 * is answered by scanning one column (ceiling) against one other (what it is
 * for). A list of paragraphs makes them read all five; a table lets them read
 * one column and stop.
 *
 * Below sm every row stacks into a block and the header row goes to screen
 * readers only. The display changes flip the table roles off in Chrome and
 * Safari, so the roles are set explicitly and survive the reflow.
 */
export function FundingTable({
  caption,
  paths,
}: {
  caption: string;
  paths: Path[];
}) {
  const head =
    "py-2.5 pr-6 text-left text-xs font-normal tracking-wide text-muted-foreground";
  const cell = "block sm:table-cell sm:py-5 sm:pr-6 sm:align-top";

  return (
    <table role="table" className="mt-10 w-full border-collapse text-sm">
      <caption className="mb-5 text-left font-mono text-ui-caption tracking-wide text-muted-foreground uppercase">
        {caption}
      </caption>
      <thead role="rowgroup" className="sr-only sm:not-sr-only">
        <tr role="row" className="border-b border-border">
          <th role="columnheader" scope="col" className={head}>
            Path
          </th>
          <th role="columnheader" scope="col" className={head}>
            Best for
          </th>
          <th role="columnheader" scope="col" className={head}>
            Ceiling
          </th>
          <th role="columnheader" scope="col" className={`${head} pr-0`}>
            Apply
          </th>
        </tr>
      </thead>
      <tbody role="rowgroup">
        {paths.map((path) => (
          <tr
            key={path.name}
            role="row"
            className="block border-t border-border py-5 last:border-b sm:table-row sm:py-0"
          >
            <th
              role="rowheader"
              scope="row"
              className={`${cell} text-left font-medium sm:w-[11rem]`}
            >
              {path.name}
              <span className="mt-1 block font-mono text-xs font-normal text-muted-foreground">
                {path.decidedBy}
              </span>
            </th>
            <td
              role="cell"
              className={`${cell} mt-3 leading-relaxed text-muted-foreground sm:mt-0`}
            >
              {path.bestFor}
            </td>
            <td
              role="cell"
              className={`${cell} mt-3 whitespace-nowrap sm:mt-0 sm:w-[7.5rem]`}
            >
              <span className="mr-2 font-mono text-xs text-muted-foreground sm:hidden">
                Ceiling
              </span>
              {path.ceiling}
            </td>
            <td
              role="cell"
              className={`${cell} mt-4 sm:mt-0 sm:w-[12rem] sm:pr-0`}
            >
              <div className="flex flex-wrap gap-x-4 gap-y-1.5 sm:flex-col sm:gap-y-2">
                {path.refs.map((ref) => (
                  <Ref key={ref.href} {...ref} />
                ))}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* ------------------------------------------------------------------ *
 * Notes
 * ------------------------------------------------------------------ */

/**
 * The two things that are true of the table as a whole and would be wrong to
 * repeat in five rows. Plain paragraphs, deliberately not a section: a rule
 * and a heading would promise more than two sentences deliver.
 */
export function Notes({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-8 grid max-w-[62ch] gap-4 text-sm leading-relaxed text-muted-foreground [&_a]:underline [&_a]:decoration-border [&_a]:underline-offset-4 hover:[&_a]:decoration-foreground [&_a]:transition-colors">
      {children}
    </div>
  );
}
