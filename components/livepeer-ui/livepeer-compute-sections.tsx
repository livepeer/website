import Link from "next/link";
import {
  ArrowRightIcon,
  CircleDollarSignIcon,
  CpuIcon,
  NetworkIcon,
  ServerIcon,
} from "lucide-react";

import { LivepeerSymbol } from "@/components/brand";
import { ComputeMetrics } from "@/components/livepeer-ui/compute-metrics";
import type { LivepeerOrgPage } from "@/components/livepeer-ui/contracts";
import { LivepeerCubeStream } from "@/components/livepeer-ui/livepeer-cube-stream";
import { sanityStaticAssets } from "@/components/static-assets";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type EarnContent = NonNullable<LivepeerOrgPage["earnContent"]>;

const baselineIcons = {
  cpu: CpuIcon,
  server: ServerIcon,
  network: NetworkIcon,
  dollar: CircleDollarSignIcon,
} as const;

export function ComputeHeroSection({
  content,
  earnings,
  metrics,
}: {
  content: EarnContent["hero"];
  earnings: EarnContent["earnings"];
  /** Omitted when the 24h figures can't be established — see lib/compute-metrics. */
  metrics?: { servicePayoutsUsd: string; protocolRewardsUsd: string } | null;
}) {
  return (
    // min-h fills the viewport below the sticky 4rem header, and the flex
    // centring puts the block in that band. svh rather than vh so mobile
    // browser chrome doesn't push the bottom past the viewport; the inner
    // padding stays as a floor for short screens.
    //
    // Full-bleed so the field can run edge to edge — the max-w-page measure
    // moves to the content wrapper instead.
    <section className="relative isolate flex min-h-[calc(100svh-4rem)] w-full items-center overflow-hidden">
      {/* The field is mirrored, matching the Orchestrator band on the home
          page that links here — you arrive to the same arc you clicked from.
          It also distinguishes this hero from the home hero, which runs the
          same stream unflipped. Fades toward the Baseline section rather than
          being cut at the boundary.

          The component finds the h1's parent to hold particles clear of the
          copy, so the canvas has to be a sibling of the content wrapper. */}
      <LivepeerCubeStream className="z-0 -scale-x-100 opacity-80 [mask-image:linear-gradient(to_bottom,black_0%,black_72%,transparent_100%)]" />
      <div className="relative z-10 mx-auto flex w-full max-w-page flex-col items-center px-4 py-20 text-center sm:px-6 sm:py-24 lg:px-10">
        {/* This inner measure is load-bearing, not just typographic. The canvas
            reads the h1's *parent* to work out how wide a berth to give the
            copy, so leaving the h1 directly inside the max-w-page wrapper made
            the exclusion zone 1408px and pushed almost the whole field off
            canvas — 31 particles rendered where home shows ~561. Constraining
            it here matches home's max-w-3xl block. */}
        <div className="flex w-full max-w-3xl flex-col items-center">
          {/* The mockup's arbitrary clamp is clamp(2.5rem,4.5vw,4rem), which is
              text-display-fluid exactly — same ramp, tracking, and weight. */}
          <h1 className="text-display-fluid text-balance">{content.heading}</h1>
          <p className="mt-6 max-w-2xl text-reading-body text-pretty text-muted-foreground">
            {content.description}
          </p>
          {/* Rendered only when real numbers came back. There is deliberately
              no placeholder or zero state: an empty metric card would still
              read as a claim about what the network paid out. */}
          {metrics && (
            <div className="mt-10">
              <ComputeMetrics
                align="center"
                stats={[
                  {
                    label: earnings.servicePayoutsLabel,
                    period: earnings.periodLabel,
                    value: metrics.servicePayoutsUsd,
                  },
                  {
                    label: earnings.protocolRewardsLabel,
                    period: earnings.periodLabel,
                    value: metrics.protocolRewardsUsd,
                  },
                ]}
              />
            </div>
          )}
          {/* Primary: this is the page's opening action, and it was carrying
              the weakest button on the page while two lesser CTAs below it ran
              primary. One primary opens the page, one closes it. */}
          <Button
            size="lg"
            nativeButton={false}
            render={<Link href={content.cta.href} />}
            className="mt-10 h-12 rounded-sm px-5"
          >
            {content.cta.label}
            <ArrowRightIcon className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </section>
  );
}

export function ComputeBaselineSection({
  content,
  cta,
}: {
  content: Pick<
    EarnContent,
    "baselineHeading" | "baselineDescription" | "baseline"
  >;
  cta: { label: string; href: string };
}) {
  return (
    <section className="mx-auto max-w-page px-4 py-16 sm:px-6 sm:py-24 lg:px-10">
      {/* items-center at md+: the heading column is much shorter than the
          table, and top-aligning left it stranded against a tall block. */}
      <div className="grid gap-10 md:grid-cols-[0.7fr_1.3fr] md:items-center">
        <div>
          <h2 className="text-page-title sm:text-display-sm">
            {content.baselineHeading}
          </h2>
          <p className="mt-4 max-w-md text-reading-body text-pretty text-muted-foreground">
            {content.baselineDescription}
          </p>
          {/* The requirements answer "can I run this?"; this answers "how do I
              start?". It sits in the heading column rather than after the grid
              so it reads as the next step from the description, and stays
              beside the requirements on desktop instead of below them.
              Secondary: the hero opens the page and the stake panel closes it,
              so this supporting step shouldn't compete with either. */}
          <Button
            size="lg"
            variant="secondary"
            nativeButton={false}
            render={<Link href={cta.href} />}
            className="mt-8 h-12 rounded-sm px-5"
          >
            {cta.label}
            <ArrowRightIcon className="size-4" aria-hidden="true" />
          </Button>
        </div>
        {/* border-t on the grid, border-b on every cell: together they rule off
            each row, so the block reads as a table rather than four loose
            paragraphs. The two columns are not symmetric — the left cell also
            carries the vertical rule between them and closes its outer gutter,
            the right cell closes the other side and has no rule to its right,
            which is what keeps the rules inside the block instead of boxing
            it. Both revert to a single stacked column below sm.

            No colour class: --border is the default and now carries the
            weight these rules need, so every rule on the page — this table,
            the panel dividers, the section and footer rules — resolves to one
            value.

            No outer rules, top or bottom: the block is bounded by the section's
            own whitespace, and boxing it in made it read as a card rather than
            as structure. Only the rules *between* rows survive, which are the
            ones doing work. */}
        <div className="grid sm:grid-cols-2">
          {content.baseline.map((item, index) => {
            const Icon = baselineIcons[item.icon];
            const isLast = index === content.baseline.length - 1;
            // Stacked, every item but the last is ruled off. In two columns the
            // final *pair* closes the block, so the second-to-last drops its
            // rule too — otherwise a stray line hangs under the left column.
            const isSecondLast = index === content.baseline.length - 2;
            return (
              <div
                key={item._key}
                className={cn(
                  "py-7",
                  !isLast && "border-b",
                  isSecondLast && "sm:border-b-0",
                  index % 2 === 0
                    ? "sm:border-r sm:px-7 sm:pl-0"
                    : "sm:px-7 sm:pr-0"
                )}
              >
                <Icon className="size-5 stroke-[1.5]" aria-hidden="true" />
                <h3 className="mt-6 text-lg font-light">{item.heading}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/**
 * The closing split: what an orchestrator needs on-chain before they can run.
 *
 * Marked [data-header-solid] for the same reason as the Agent page's band —
 * one half is near-black and the other is the muted surface, and a translucent
 * header cannot serve both.
 *
 * Two things about the layout are deliberate, and both were wrong before:
 *
 * Height comes from the content. These were aspect-square, inherited from the
 * Agent page where the left half holds a 3x2 logo grid that earns it. Here the
 * stake panel held 177px of content in a 720px square — a 25% fill, which read
 * as a hole rather than as space. Grid siblings stretch to the tallest, so the
 * denser Arbitrum panel now sets the height and the other matches it.
 *
 * Content is left-aligned, not centred. The page had three alignment logics in
 * three sections — centred hero, left/right Baseline split, centred squares.
 * Everything below the hero now hangs off one left edge, so the eye tracks a
 * single axis down the page. The band still bleeds full width: that is the
 * shared language with the Agent page, and it gives the page its one
 * full-width moment.
 */
export function ComputeOnchainSection({
  content,
}: {
  content: Pick<EarnContent, "arbitrum" | "stake">;
}) {
  return (
    // border-t closes the section off from the Baseline block above it, full
    // width. Left at the default --border so it matches the rule above the
    // footer and the Baseline table — every rule on the page is one value.
    <section data-header-solid className="grid border-t md:grid-cols-2">
      {/* The panel bleeds, but its content sits on the page grid. Half the
          page measure, pushed to the panel's inner edge, then the standard
          gutters — so this copy starts on exactly the same axis as the
          Baseline heading above. A fixed padding cannot do this: the page
          gutter grows with the viewport once it exceeds max-w-page, so the two
          would drift apart (232px at 1920). Derived from --container-page so
          it stays tied to the one measure rather than a magic number. */}
      {/* The divider lives on this panel's right edge, not the next panel's
          left. Both carry the same --border, but a border composites over its
          own element's background: on the muted panel that lightened it, so it
          read brighter than the section's top rule. Drawn here it sits over the
          same black the top rule does, and the two match. */}
      <div className="flex border-b bg-black py-20 text-white sm:py-24 md:border-r md:border-b-0">
        <div className="ml-auto flex w-full max-w-[calc(var(--container-page)/2)] flex-col items-start px-4 sm:px-6 lg:px-10">
          {/* Raw <img>: brand SVG on a fixed black panel, no variants to serve
            and nothing for the optimiser to do. */}
          <img
            src={sanityStaticAssets.arbitrum}
            alt={content.arbitrum.imageAlt}
            className="size-10 sm:size-14"
          />
          <h2 className="mt-8 max-w-md text-page-title text-balance sm:text-display-sm">
            {content.arbitrum.heading}
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-pretty text-white/60">
            {content.arbitrum.description}
          </p>
          <Button
            size="lg"
            variant="secondary"
            nativeButton={false}
            render={<Link href={content.arbitrum.cta.href} />}
            className="mt-8 h-12 rounded-sm px-5"
          >
            {content.arbitrum.cta.label}
            <ArrowRightIcon className="size-4" aria-hidden="true" />
          </Button>
          {/* Custody warning. mt-auto pins it to the foot of the panel rather
            than letting it trail the button, so it reads as a standing caveat
            on the whole panel — and it keeps its body weight rather than being
            shrunk to fine print, since it is the one thing on this page that
            can cost someone money if they skip it. */}
          <p className="mt-auto max-w-md pt-10 text-xs leading-relaxed text-pretty text-white/45">
            {content.arbitrum.disclaimer}
          </p>
        </div>
      </div>
      <div className="flex bg-muted py-20 sm:py-24">
        {/* Mirror of the left panel: half the page measure held to the inner
            edge, so this column starts where the page's right half does. */}
        <div className="mr-auto flex w-full max-w-[calc(var(--container-page)/2)] flex-col items-start justify-center px-4 sm:px-6 lg:px-10">
          {/* The Livepeer symbol in brand green, answering the Arbitrum mark
              opposite — the mockup pairs the two networks this way. Green is
              legitimate here because the mark is non-interactive brand
              expression, never an affordance (design.md). text-brand rather
              than the mockup's emerald-500, which is a raw palette value. */}
          <LivepeerSymbol
            className="size-10 text-brand sm:size-14"
            aria-hidden="true"
          />
          <h2 className="mt-8 max-w-md text-page-title text-balance sm:text-display-sm">
            {content.stake.heading}
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-pretty text-muted-foreground">
            {content.stake.description}
          </p>
          <Button
            size="lg"
            nativeButton={false}
            render={<Link href={content.stake.cta.href} />}
            className="mt-8 h-12 rounded-sm px-5"
          >
            {content.stake.cta.label}
            <ArrowRightIcon className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </section>
  );
}
