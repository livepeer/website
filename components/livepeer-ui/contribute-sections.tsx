import { ArrowUpRightIcon } from "lucide-react";
import Link from "next/link";

import { ContributeGraph } from "@/components/livepeer-ui/contribute-graph";
import { Button } from "@/components/ui/button";
import {
  isActive,
  type ActiveFundingPath,
  type FundingPath,
} from "@/lib/contribute";
import type { ContributorSet } from "@/lib/contributors";

/* ------------------------------------------------------------------ *
 * Links
 * ------------------------------------------------------------------ */

export type Ref = { label: string; href: string };

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
 *
 * Behind it, a contribution graph as the ground: the picture of people
 * doing work in the open, which is what the page is asking the reader to
 * join. It costs no height — a cover above the title was tried once and
 * pushed the answer below the fold, and a strip above the eyebrow read as a
 * widget — and the text sits in a clearing the canvas's mask cuts for it.
 * Full-bleed, so the section is the positioning box rather than the padded
 * column; the header is `relative` so it paints over the canvas.
 *
 * -mt-16 pulls the section up under the site header, which is transparent
 * at rest, the way the home hero and the record pages do; pt-32 puts the
 * eyebrow back where the page's own padding had it. The ground then runs to
 * the top of the window instead of stopping at a line under the nav — and
 * data-header-glass asks the header for its glass from rest, so it is a
 * surface you can see the grid through rather than nothing at all.
 */
export function ContributeHero({
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
    <section className="relative -mt-16 pt-32" data-header-glass="">
      <ContributeGraph />
      <header className="relative mx-auto w-full max-w-page px-4 pt-12 text-center sm:px-6 lg:px-10 lg:pt-16">
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
    </section>
  );
}

/* ------------------------------------------------------------------ *
 * Contributors
 * ------------------------------------------------------------------ */

const GITHUB = "https://github.com/livepeer";

/**
 * The page's last word: twelve faces — the year's most active on GitHub —
 * stacked the way the roadmap stacks a card's credits, a count of everyone
 * else, and one line. Lifted from the old home page's network section,
 * which closed on it the same way.
 *
 * At the foot, not in the hero. It was under the buttons first, and there
 * it competed with the hero's one job: a sentence and a button became a
 * button, a row of photographs, a second sentence and a second link, on top
 * of the moving ground. Here the order is the answer, then how work gets
 * funded, then who builds it and where — and the reader who has just read
 * the ladder is exactly who "Contribute on GitHub" is for. A rule on the
 * ladder's column, so the two sections are set the same way.
 *
 * Greyscale until hovered, so twelve photographs read as one thing rather
 * than twelve. Five on a phone, eight from sm, all twelve from lg: a row of
 * twelve at 375px is the whole width. The first face sits on top, as the
 * original had it, so the stack reads left to right.
 *
 * A raw <img>, not next/image: GitHub serves avatars at any size on request,
 * so there is nothing for the optimizer to do but proxy twelve small files.
 */
export function ContributeContributors({ count, spotlight }: ContributorSet) {
  const remaining = count - spotlight.length;
  const face =
    "relative block size-10 shrink-0 overflow-hidden rounded-full ring-2 ring-background transition duration-200 outline-none motion-reduce:transition-none hover:z-10 hover:-translate-y-1 hover:scale-110 focus-visible:z-10 focus-visible:ring-ring";
  const shown = (i: number) =>
    i < 5 ? "" : i < 8 ? "hidden sm:block" : "hidden lg:block";

  return (
    <section className="mt-20 sm:mt-24">
      <div className="mx-auto w-full max-w-page px-4 sm:px-6 lg:px-10">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 border-t border-border pt-12 sm:pt-16">
          <div className="flex -space-x-2">
            {spotlight.map((c, i) => (
              <a
                key={c.login}
                href={`https://github.com/${c.login}`}
                target="_blank"
                rel="noopener noreferrer"
                title={`${c.name} · ${c.yearly.toLocaleString()} contributions this year`}
                style={{ zIndex: spotlight.length - i }}
                className={`${face} ${shown(i)}`}
              >
                <img
                  src={`${c.avatar}&s=80`}
                  alt={c.name}
                  width={40}
                  height={40}
                  loading="lazy"
                  className="size-full object-cover grayscale transition duration-200 motion-reduce:transition-none hover:grayscale-0"
                />
              </a>
            ))}
            <a
              href={GITHUB}
              target="_blank"
              rel="noopener noreferrer"
              title={`${remaining.toLocaleString()} more contributors`}
              style={{ zIndex: 0 }}
              className={`${face} flex items-center justify-center bg-muted font-mono text-[0.625rem] font-medium text-muted-foreground hover:text-foreground`}
            >
              +{remaining}
            </a>
          </div>
          {/* Balanced, so a phone breaks it after the count rather than in
              the middle of the link. */}
          <p className="text-center text-sm text-balance text-muted-foreground">
            Built in the open by{" "}
            <span className="font-medium whitespace-nowrap text-foreground tabular-nums">
              {count.toLocaleString()} contributors
            </span>
            .{" "}
            <Ref
              label="Contribute on GitHub"
              href={GITHUB}
              className="text-foreground"
            />
          </p>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ *
 * The ladder
 * ------------------------------------------------------------------ */

/**
 * "The GovWorks SPE and Livepeer Grants" — names joined the way a sentence
 * joins them, each a link to wherever the programme's record now lives.
 */
function RetiredNames({ paths }: { paths: FundingPath[] }) {
  return (
    <>
      {paths.map((path, i) => (
        <span key={path.name}>
          {i > 0 && (i === paths.length - 1 ? " and " : ", ")}
          <a href={path.link} target="_blank" rel="noopener noreferrer">
            {path.name}
          </a>
        </span>
      ))}
    </>
  );
}

/**
 * Every way work gets paid for, ordered by size.
 *
 * The order is the design. A newcomer's real question is "how big is my
 * thing", and a list that climbs from a bounty to a treasury vote lets them
 * read down the ceiling column and stop at their rung — which is why that
 * column is set in mono and right-aligned, so the figures line up under each
 * other. Everything that explains the process (discussion windows, quorum)
 * is behind the link on the row, where it is read by the one person who has
 * already chosen that path.
 *
 * Grouped by the body that decides, each group placed by its lowest rung, so
 * the ladder climbs across groups as well as within them and needs no third
 * axis. The caption is that body's name, linked to its page in Organizations
 * — "who is the Network Engineering SPE" is a fair question to have here.
 * Retired programmes are not rungs: they render as one line at the foot, for
 * the reader who followed an old link and would otherwise wait on a dead end.
 *
 * A rule and space above it, not a tinted band. A band was tried: it is the
 * most generic device a page can reach for, and in dark it vanished against
 * the page anyway. The h2, the captions and the ruled rows are what set this
 * apart, and they work in both themes. Below sm the rows stack; the header
 * goes to screen readers. The display change strips table semantics in
 * Chrome and Safari, so the roles are set explicitly and survive the reflow.
 */
export function ContributeLadder({
  title,
  intro,
  paths,
  note,
}: {
  title: string;
  intro: React.ReactNode;
  paths: FundingPath[];
  /** The one thing true of every rung, which would be wrong to say five times. */
  note: React.ReactNode;
}) {
  const active = paths.filter(isActive);
  const retired = paths.filter((p) => p.retired);
  // Paths arrive sorted by order, so the first rung seen for a body is its
  // lowest, and groups fall into ladder order by being created as they are
  // met.
  const groups: {
    body: ActiveFundingPath["decidedBy"];
    rungs: ActiveFundingPath[];
  }[] = [];
  for (const rung of active) {
    const group = groups.find((g) => g.body.slug === rung.decidedBy.slug);
    if (group) group.rungs.push(rung);
    else groups.push({ body: rung.decidedBy, rungs: [rung] });
  }

  const cell = "block sm:table-cell sm:py-5 sm:align-baseline";
  const prose =
    "[&_a]:underline [&_a]:decoration-border [&_a]:underline-offset-4 [&_a]:transition-colors [&_a:hover]:decoration-foreground";

  return (
    // Close under the hero: its ground fades out to exactly this section's
    // rule (the canvas reaches the same 3rem/4rem past the hero), so the fade
    // and the rule are one seam rather than a fade, dead air, and a rule.
    <section className="mt-12 sm:mt-16">
      <div className="mx-auto w-full max-w-page px-4 sm:px-6 lg:px-10">
        {/* 4xl, not 3xl: the "best for" column needs ~470px for every rung to
            stay on one line, and one line per rung is the whole point. The
            rule sits on this column, not the page, so it is as wide as what
            it introduces. */}
        <div className="mx-auto max-w-4xl border-t border-border pt-12 sm:pt-16">
          <h2 className="text-page-title text-balance sm:text-display-sm">
            {title}
          </h2>
          <p
            className={`mt-4 max-w-[52ch] text-reading-body text-pretty text-muted-foreground [&_a]:text-foreground ${prose}`}
          >
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
              <tbody key={group.body.slug} role="rowgroup">
                <tr role="row" className="block sm:table-row">
                  <th
                    role="rowheader"
                    scope="rowgroup"
                    colSpan={4}
                    className="block pt-8 pb-3 text-left font-mono text-ui-caption font-normal tracking-wide text-muted-foreground uppercase sm:table-cell"
                  >
                    <Link
                      href={`/organizations/${group.body.slug}`}
                      className="underline-offset-4 transition-colors hover:text-foreground hover:underline"
                    >
                      {group.body.name}
                    </Link>
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
                      className={`${cell} pr-6 text-left font-medium sm:w-[12rem]`}
                    >
                      {/* The rung's height on the ladder, counted across
                          groups. Not an icon: it is the Order field, rendered,
                          and it makes the climb literal. Hidden from readers
                          who would otherwise hear "one Bounties". */}
                      <span
                        aria-hidden="true"
                        className="mr-3 inline-block w-4 font-mono text-xs text-muted-foreground tabular-nums"
                      >
                        {active.indexOf(rung) + 1}
                      </span>
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
                      <Ref
                        label={rung.linkLabel}
                        href={rung.link}
                        className="text-foreground"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            ))}
          </table>

          {/* Small, and not a section: a rule and a heading would promise
              more than two lines deliver. */}
          <div
            className={`mt-8 grid max-w-[60ch] gap-2 text-xs leading-relaxed text-muted-foreground ${prose}`}
          >
            <p>{note}</p>
            {retired.length > 0 && (
              <p>
                <RetiredNames paths={retired} />{" "}
                {retired.length === 1 ? "no longer takes" : "no longer take"}{" "}
                requests.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
