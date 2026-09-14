import { ArrowUpRightIcon } from "lucide-react";
import Link from "next/link";

import { ContributeGraph } from "@/components/livepeer-ui/contribute-graph";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { isActive, type FundingPath } from "@/lib/contribute";
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
function Ref({ label, href, className = "" }: Ref & { className?: string }) {
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
  online,
}: {
  eyebrow: string;
  heading: string;
  description: string;
  primary: Ref;
  secondary: Ref[];
  /** Members online in the Discord right now; omitted when unknown. */
  online?: number | null;
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
        {/* Who is there right now, read from the server's widget with the
            invite. Real, free and changing; the button above is the promise
            and this is the proof. Nothing when the widget could not be read. */}
        {typeof online === "number" && online > 0 && (
          <p className="mt-4 font-mono text-xs text-muted-foreground tabular-nums">
            {online.toLocaleString()} online right now
          </p>
        )}
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
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 border-t border-border pt-12 sm:pt-16">
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
 * The ladder as a table, and nothing around it: the page sets the heading
 * and the sentences as prose and embeds this where a Notion page would
 * embed a database — which Notion, too, would show as a table.
 *
 * Four columns, not five: the "best for" line sits under the name, since
 * it describes the path rather than measuring it, and the three measures
 * — who decides, the ceiling, where to go — read across. Smallest rung
 * first, so the eye climbs. Hairlines between rows and none around, the
 * header in the small muted caps the record pages use for a label.
 *
 * Below sm the columns cannot fit, so each row folds into a stack — name
 * and description, then the two facts with their labels, then the link —
 * which is roughly the cell the ladder used to be drawn as. That earlier
 * form, a two-column grid of cells with the treasury spanning the width,
 * was the pricing-tier idiom: right for three options weighed against
 * each other, odd for five rungs read in order, where the spanning cell
 * made the top rung look like a special case and the reading order ran
 * left-to-right then down. A table was the very first form and was cut
 * for spending "a lot of typography on five facts" — under a page-title
 * heading as a section of its own; inside a document it is the quiet one.
 */
export function LadderTable({
  paths,
  className,
}: {
  paths: FundingPath[];
  className?: string;
}) {
  const active = paths.filter(isActive);
  const label =
    "text-[0.6875rem] leading-4 font-medium tracking-[0.09em] text-muted-foreground uppercase";
  return (
    <table className={cn("block w-full sm:table", className)}>
      <thead className="hidden sm:table-header-group">
        <tr className="border-b border-border">
          <th scope="col" className={cn("pb-3 text-left", label)}>
            Path
          </th>
          <th scope="col" className={cn("pb-3 pl-6 text-left", label)}>
            Decided by
          </th>
          <th scope="col" className={cn("pb-3 pl-6 text-left", label)}>
            Ceiling
          </th>
          <th scope="col" className="pb-3">
            <span className="sr-only">Where to go</span>
          </th>
        </tr>
      </thead>
      <tbody className="block sm:table-row-group">
        {active.map((rung) => (
          <tr
            key={rung.name}
            className="block border-b border-border py-5 sm:table-row sm:py-0 last:border-b-0"
          >
            <th
              scope="row"
              className="block text-left font-normal sm:table-cell sm:py-5 sm:pr-6 sm:align-top"
            >
              <span className="block text-base">{rung.name}</span>
              <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
                {rung.bestFor}
              </span>
            </th>
            <td className="mt-4 block text-sm sm:mt-0 sm:table-cell sm:py-5 sm:pl-6 sm:align-top sm:whitespace-nowrap">
              <span className={cn("mr-3 inline-block w-20 sm:hidden", label)}>
                Decided by
              </span>
              <Link
                href={`/organizations/${rung.decidedBy.slug}`}
                className="underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
              >
                {rung.decidedBy.name}
              </Link>
            </td>
            <td className="mt-1 block text-sm sm:mt-0 sm:table-cell sm:py-5 sm:pl-6 sm:align-top sm:whitespace-nowrap">
              <span className={cn("mr-3 inline-block w-20 sm:hidden", label)}>
                Ceiling
              </span>
              {rung.ceiling}
            </td>
            <td className="mt-4 block text-sm sm:mt-0 sm:table-cell sm:py-5 sm:pl-6 sm:text-right sm:align-top sm:whitespace-nowrap">
              <Ref
                label={rung.linkLabel}
                href={rung.link}
                className="text-foreground"
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/**
 * "X and Y no longer take requests", for the reader who followed an old
 * link; nothing when nothing is retired.
 */
export function RetiredLine({ paths }: { paths: FundingPath[] }) {
  const retired = paths.filter((p) => p.retired);
  if (retired.length === 0) return null;
  return (
    <>
      <RetiredNames paths={retired} />{" "}
      {retired.length === 1 ? "no longer takes" : "no longer take"} requests.
    </>
  );
}
