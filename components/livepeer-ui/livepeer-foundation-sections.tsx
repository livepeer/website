import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { LivepeerGradientSymbol } from "@/components/brand";
import { Button } from "@/components/ui/button";

export type FoundationContent = {
  hero: {
    eyebrow: string;
    heading: string;
    description: string;
    cta: { label: string; href: string };
  };
  mandate: {
    heading: string;
    description: string;
    cta: { label: string; href: string };
  };
  /** Sign-off under the mandate section. */
  lockup: string;
};

/**
 * A sheen travelling around one ring.
 *
 * A short arc of the circle, drawn in currentColor fading to nothing, spun by
 * its wrapper. Because it is currentColor rather than a fixed near-black, it
 * reads as a highlight on dark and as a shadow on light — the same gesture in
 * both themes instead of one that only works on black.
 */
function OrbitSheen({ id }: { id: string }) {
  return (
    <svg
      // The rotation is on the <g>, not on a wrapping div as in the mockup.
      // A rotated square div reports a bounding box up to √2 larger than
      // itself, and the rings sit flush against the drawing's edges — so the
      // mockup's version pushes ~26px of horizontal page scroll at 390. SVG
      // content never affects HTML layout, so spinning it in here is free.
      className="absolute inset-0 size-full overflow-visible text-foreground/25"
      viewBox="0 0 100 100"
      fill="none"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id={id}
          x1="50"
          y1="0.1"
          x2="88.23"
          y2="17.92"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="currentColor" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* SVG elements default to transform-box: view-box, so 50px 50px is the
          centre of this 100x100 viewBox. */}
      <g className="origin-[50px_50px] animate-foundation-orbit">
        <path
          d="M 50 0.1 A 49.9 49.9 0 0 1 88.23 17.92"
          stroke={`url(#${id})`}
          strokeLinecap="round"
          strokeWidth="0.55"
        />
      </g>
    </svg>
  );
}

/**
 * Two overlapping rings, lit where they meet.
 *
 * The one place on this page that argues rather than states: the Foundation's
 * whole job is the overlap — between independent teams, between the network's
 * participants and its long-term direction — and the drawing puts nothing
 * inside either circle so that the intersection is the only thing lit.
 *
 * Green only, where the mockup layers a second blue gradient into the lens.
 * The registry has exactly one non-neutral colour; adding a blue would be a
 * second token layer arriving by the back door, and the blue reads as texture
 * rather than meaning — both gradients sit inside the same clip. Green here is
 * non-interactive brand expression, which is the only footing it gets.
 */
function FoundationVenn() {
  return (
    // 158:100 — two circles of diameter 100 whose centres are 58 apart, so the
    // lens is 42 units wide. The ratio is the drawing; everything below is a
    // fraction of it, and it scales from 390px to a wide desktop untouched.
    <div className="relative aspect-[158/100] w-full" aria-hidden="true">
      <div className="absolute top-0 left-0 aspect-square w-[63.2911%] rounded-full border border-dashed border-foreground/30">
        <OrbitSheen id="foundation-sheen-left" />
      </div>
      {/* rotate-180 so the second ring's sheen starts on the opposite side —
          the two chase each other rather than moving in lockstep. */}
      <div className="absolute top-0 right-0 aspect-square w-[63.2911%] rotate-180 rounded-full border border-dashed border-foreground/30">
        <OrbitSheen id="foundation-sheen-right" />
      </div>

      <svg
        className="pointer-events-none absolute inset-0 size-full"
        viewBox="0 0 158 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          {/* Fine 45° hatch. Gives the lens a material — without it the glow
              floats, with it the overlap reads as a surface.

              0.05, not the mockup's 0.34: the mockup hatches in a near-black
              that barely lifts off its background, and currentColor at the
              same alpha is full-strength white here. Matched by eye to the
              same weight, which is a texture you notice second, not stripes. */}
          <pattern
            id="foundation-lens-hatch"
            width="1.6"
            height="1.6"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="1.6"
              stroke="currentColor"
              strokeOpacity="0.05"
              strokeWidth="0.35"
            />
          </pattern>
          {/* Same correction: the mockup's green is a dark forest tone at 52%,
              where --color-brand is the bright network green. Carried at
              roughly a third the alpha so the lens glows at the mockup's
              value rather than twice it. */}
          <radialGradient
            id="foundation-lens-glow"
            cx="79"
            cy="50"
            r="24"
            gradientUnits="userSpaceOnUse"
          >
            <stop
              offset="0%"
              stopColor="var(--color-brand)"
              stopOpacity="0.26"
            />
            <stop
              offset="45%"
              stopColor="var(--color-brand)"
              stopOpacity="0.1"
            />
            <stop offset="100%" stopColor="var(--color-brand)" stopOpacity="0" />
          </radialGradient>
          {/* Nested clips: the fill is drawn across the whole box and then cut
              to the part inside both circles, which is what makes the lens a
              lens rather than a shape someone drew. */}
          <clipPath id="foundation-clip-left">
            <circle cx="50" cy="50" r="48.2" />
          </clipPath>
          <clipPath id="foundation-clip-right">
            <circle cx="108" cy="50" r="48.2" />
          </clipPath>
        </defs>

        <g clipPath="url(#foundation-clip-left)">
          <g clipPath="url(#foundation-clip-right)">
            <rect
              width="158"
              height="100"
              fill="url(#foundation-lens-glow)"
              className="origin-[79px_50px] animate-foundation-lens"
            />
            <rect
              width="158"
              height="100"
              fill="url(#foundation-lens-hatch)"
              className="text-foreground"
            />
          </g>
        </g>
      </svg>
    </div>
  );
}

/** What the Foundation is. */
export function FoundationHeroSection({
  content,
}: {
  content: FoundationContent["hero"];
}) {
  return (
    <section className="flex items-center px-4 pt-32 pb-12 sm:px-6 sm:pt-36 sm:pb-16 lg:px-10">
      <div className="mx-auto flex w-full max-w-page flex-col items-center text-center">
        <div className="flex items-center justify-center gap-2">
          <LivepeerGradientSymbol
            className="h-2.5 w-auto shrink-0 sm:h-3"
            aria-hidden="true"
          />
          <p className="text-xs text-muted-foreground">{content.eyebrow}</p>
        </div>

        <h1 className="mt-6 max-w-[22ch] font-display text-display-sm text-balance sm:text-display-fluid">
          {content.heading}
        </h1>
        <p className="mt-5 max-w-prose text-sm leading-relaxed text-balance text-muted-foreground">
          {content.description}
        </p>

        <Button
          size="lg"
          variant="outline"
          nativeButton={false}
          render={<Link href={content.cta.href} />}
          className="mt-10 h-14 rounded-sm bg-transparent px-5 sm:mt-12"
        >
          {content.cta.label}
          <ArrowRightIcon className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </section>
  );
}

/** What the Foundation does — the drawing first, then the claim. */
export function FoundationMandateSection({
  content,
  lockup,
}: {
  content: FoundationContent["mandate"];
  lockup: string;
}) {
  return (
    <section className="flex min-h-[32rem] items-center px-4 py-12 sm:min-h-[42rem] sm:px-6 sm:py-16 lg:px-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center text-center">
        {/* max-w-xl: the Venn is an argument, not a backdrop. At full page
            width the lens becomes a smear across the screen and the two rings
            stop reading as circles at all. */}
        <div className="mb-12 w-full max-w-xl sm:mb-16">
          <FoundationVenn />
        </div>

        <h2 className="max-w-[22ch] font-display text-display-sm text-balance sm:text-display-fluid">
          {content.heading}
        </h2>
        <p className="mt-5 max-w-prose text-sm leading-relaxed text-balance text-muted-foreground">
          {content.description}
        </p>

        <Button
          size="lg"
          variant="outline"
          nativeButton={false}
          render={<Link href={content.cta.href} />}
          className="mt-10 h-14 rounded-sm bg-transparent px-5 sm:mt-12"
        >
          {content.cta.label}
          <ArrowRightIcon className="size-4" aria-hidden="true" />
        </Button>

        {/* Sign-off. The page opens with the Foundation named as an eyebrow and
            closes with it named again — the whole page sits between the two. */}
        <div className="mt-12 flex items-center justify-center gap-2 py-12 sm:mt-16 sm:gap-3 sm:py-16">
          <LivepeerGradientSymbol
            className="h-2.5 w-auto shrink-0 sm:h-3"
            aria-hidden="true"
          />
          <p className="text-xs text-muted-foreground">{lockup}</p>
        </div>
      </div>
    </section>
  );
}
