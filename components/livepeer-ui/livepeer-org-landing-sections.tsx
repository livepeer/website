import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { AgentWordmark, LivepeerWordmark } from "@/components/brand";
import { AgentCompatibility } from "@/components/livepeer-ui/agent-compatibility";
import type { LivepeerOrgPage } from "@/components/livepeer-ui/contracts";
import { LivepeerCubeStream } from "@/components/livepeer-ui/livepeer-cube-stream";
import { AgentRuntimePreview } from "@/components/livepeer-ui/agent-runtime-preview";
import { Button } from "@/components/ui/button";
import { CtaArrow } from "@/components/ui/cta-arrow";
import { ExternalArrow } from "@/components/ui/external-arrow";
import { cn } from "@/lib/utils";

type HomeContent = NonNullable<LivepeerOrgPage["homeContent"]>;

type HeroCta = { label: string; href: string; newTab?: boolean };

/**
 * A hero CTA, with the affordance matched to what the link actually does.
 *
 * `newTab` is declared per CTA rather than inferred from the href. It used to
 * be inferred — every off-site link opened in a new tab — but that conflates
 * two different things: the Agent console is off-site and is still the product,
 * so it takes over the tab, while Discord is a genuine aside and does not.
 *
 * The arrow follows the same distinction. ExternalArrow annotates "this opens
 * elsewhere"; CtaArrow is the chevron-into-arrow that just means "go".
 */
function renderCta(cta: HeroCta, className: string, variant?: "outline") {
  const offSite = cta.href.startsWith("http");

  return (
    <Button
      size="lg"
      variant={variant}
      nativeButton={false}
      render={
        offSite ? (
          // No Link: there is nothing for Next to prefetch across origins.
          <a
            href={cta.href}
            target={cta.newTab ? "_blank" : undefined}
            rel={cta.newTab ? "noreferrer" : undefined}
          />
        ) : (
          <Link href={cta.href} />
        )
      }
      className={cn("group/cta", className)}
    >
      {cta.label}
      {cta.newTab ? (
        // size-4, not the default 3.5: these are 64px hero buttons, and the
        // annotation should scale with the type it sits beside.
        <ExternalArrow className="size-4" />
      ) : (
        <CtaArrow />
      )}
    </Button>
  );
}

export function NetworkHeroSection({
  content,
}: {
  content: HomeContent["hero"] & {
    description?: string;
    banner?: {
      label: string;
      title: string;
      description: string;
      href: string;
    };
  };
}) {
  return (
    // -mt-16 pulls the hero up under the transparent header (which sits in flow
    // at h-16) so the canvas bleeds to the top of the viewport and the nav
    // floats in it, matching the mockup. pt-16 on the inner container keeps the
    // content optically centred in the area below the header.
    // Just under a full screen, so the section rule and the top edge of the
    // next panel break the fold and signal that the page continues. svh (not
    // vh) keeps mobile browser chrome from pushing that past the viewport;
    // -mt-16 starts the hero at the top of the window and pt-16 keeps its
    // content optically centred below the header.
    <section className="relative isolate -mt-16 flex min-h-svh w-full items-center overflow-hidden bg-background pt-16">
      {/* The canvas is atmosphere, so it dissolves toward the section boundary
          instead of being clipped at it. Only the bottom fades; the top
          deliberately bleeds under the header. */}
      {/* Full strength to 89%, out over the last ~100px. It can't go as short
          as the Orchestrator's 34px: that one lands on the footer rule and so
          has a real edge to be cropped by, whereas the left half of this
          boundary is open black, where a hard stop would show as a line drawn
          across nothing. The eased midpoint keeps density late. */}
      <LivepeerCubeStream className="z-0 [mask-image:linear-gradient(to_bottom,black_0%,black_89%,rgba(0,0,0,0.5)_96%,transparent_100%)]" />
      <div className="relative z-10 mx-auto w-full max-w-page px-4 py-28 sm:px-6 sm:py-32 lg:px-10">
        {/* Optical centering: the flex box centres the whole block, banner
            included, which pushes the headline and CTAs visibly low. Lifting by
            half the banner's occupied height puts the body back where it would
            sit without one. A transform, not a margin, so the section's height
            is unaffected. Only applied when there is a banner to compensate. */}
        <div
          className={cn(
            "mx-auto flex max-w-3xl flex-col items-center text-center",
            content.banner && "-translate-y-8"
          )}
        >
          {/* Announcement pill. The green chip is a label, not a control — the
              link's affordance is the title and arrow — so it stays inside
              design.md's rule that green is brand expression only. The
              descriptor drops away below sm, where the full line would wrap. */}
          {content.banner && (
            <Link
              href={content.banner.href}
              // Measured off x.ai's banner, which is asymmetric: on white the
              // pill is background: transparent with a 1px rgba(10,10,10,0.08)
              // border; on their #0a0a0a page it gains a rgba(26,26,26,0.6)
              // fill under the same 1px rgba(255,255,255,0.08) border. So the
              // border is 0.08 of the foreground in both themes, and only the
              // fill is conditional — without it the pill has nothing to hold
              // it off the hero canvas and the edge alone is too faint to find.
              // card/60 over black lands at rgb(23) against their rgb(20).
              className="group mb-7 inline-flex animate-stagger-in items-center gap-2.5 rounded-full border border-foreground/[0.08] py-1.5 pr-1.5 pl-2.5 text-[13px] transition-colors hover:border-foreground/20 focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:outline-none sm:mb-8 dark:bg-card/60"
            >
              {/* Brand green is tuned for black. On this near-white pill it
                  measured 1.04:1 — the chip was effectively unreadable in
                  light mode. Same correction as the token page's diagram:
                  mix the one brand token toward black in light only, and leave
                  dark alone. */}
              <span className="shrink-0 rounded-full border border-[color-mix(in_oklch,var(--color-brand),black_32%)]/45 px-2 py-0.5 text-[10px] leading-[10px] font-semibold tracking-[0.25px] text-[color-mix(in_oklch,var(--color-brand),black_32%)] uppercase dark:border-brand/45 dark:text-brand">
                {content.banner.label}
              </span>
              {/* Three tones, as in the source: the title at full strength, the
                  separator dimmest so it recedes between them, and the
                  descriptor in between. */}
              <span className="text-foreground">
                <span className="font-medium">{content.banner.title}</span>
                <span className="hidden font-normal sm:inline">
                  {" "}
                  <span className="text-foreground/30" aria-hidden="true">
                    •
                  </span>{" "}
                  <span className="text-foreground/55">
                    {content.banner.description}
                  </span>
                </span>
              </span>
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-foreground/[0.06] text-muted-foreground transition-colors group-hover:bg-foreground/10">
                <ArrowRightIcon className="size-3" aria-hidden="true" />
              </span>
            </Link>
          )}

          {/* Two-line headline, both lines in the foreground colour. The
              display scale bakes in a 300 weight; 400 gives it a little more
              presence at hero size without tipping into a heavier voice.

              Inter, matching every page title on the site. The display scale
              utilities set size, weight and tracking only — they do not imply a
              typeface, so text-display-* in font-sans is the normal case. */}
          <h1 className="animate-stagger-in text-display-md font-normal text-balance [animation-delay:120ms] sm:text-display-fluid">
            {content.heading}
            <br />
            {content.accent}
          </h1>
          {/* max-w-lg is chosen against the headline, not the column: on one
              line the two fragments ran 736px under a 516px h1, so the sub
              out-measured the thing it sits beneath. 512px is just inside the
              headline and — because the first fragment is 456px and adding the
              next word reaches 552px — it forces the break onto the full stop,
              putting each sentence on its own line rather than splitting one
              mid-clause. */}
          {content.description && (
            <p className="mt-4 max-w-lg animate-stagger-in text-reading-body text-pretty text-foreground/45 [animation-delay:240ms] sm:mt-5 sm:text-xl">
              {content.description}
            </p>
          )}
          {/* Wider than the gaps above it: the banner, headline and subheading
              are one thought, while the buttons are a change of register. Our
              CTAs are also 64px tall against x.ai's 44px, so the same gap would
              read tighter here than it does there. */}
          <div className="mt-9 flex w-full animate-stagger-in flex-col justify-center gap-2 [animation-delay:360ms] sm:mt-11 sm:w-auto sm:flex-row">
            {/* Both of these leave the site, so both take the ExternalArrow the header
                uses rather than the → that means "next step, still here".
                renderCta picks <a target="_blank"> for an external href and
                keeps <Link> + ArrowRight for an internal one, so the affordance
                always matches where the button actually goes. */}
            {renderCta(content.primaryCta, "h-16 rounded-sm px-4")}
            {/* An explicit hover fill. The outline variant's own is
                dark:hover:bg-input/30 — --input is white at 15%, so a third of
                that is ~4% and vanishes against the hero canvas. */}
            {renderCta(
              content.secondaryCta,
              "h-16 rounded-sm bg-transparent px-4 hover:bg-foreground/[0.08] dark:hover:bg-foreground/[0.08]",
              "outline"
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export function LivepeerAgentFeatureSection({
  content,
}: {
  content: HomeContent["agentFeature"];
}) {
  return (
    // The runtime is the product surface — an agent mid-task, calling the
    // network — so it is shown upright and sharp rather than tilted and faded
    // into the background.
    //
    // Deliberately transparent: on the home page this section shares the
    // Orchestrator section's particle field, which bleeds up past the boundary
    // (see app/page.tsx). An opaque background here would hide it.
    //
    // z-20 against the Orchestrator's z-10: that section is the later sibling,
    // so at equal z-index its canvas would paint over this one. The card has to
    // outrank it for the particles to pass *behind* the UI rather than across
    // it. Nothing here is opaque except the card itself, so the field still
    // shows through everywhere around it.
    //
    // No overflow-hidden: the card's bottom scrim has to reach past the section
    // boundary into the Orchestrator, which is where the particles it dims
    // actually are. The wrapper around both sections still crops the overflow
    // at the outer edges.
    <section className="relative z-20">
      {/* No vertical padding at lg — the card's own edges carry both
          boundaries. On top, the copy is centred against a much taller card,
          which already leaves ~200px of air, and the hero above contributes its
          own centring slack. On the bottom, the next section's particle field
          starts at full strength, so any pad here just opens a black gap
          between the card and the particles instead of letting them meet. */}
      <div className="mx-auto grid max-w-page gap-14 px-4 pt-12 sm:px-6 lg:grid-cols-[43fr_57fr] lg:items-center lg:gap-16 lg:px-10 lg:pt-0">
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
          <h2
            className="flex w-full min-w-0 flex-nowrap items-end justify-center gap-2 lg:w-auto lg:justify-start lg:gap-3"
            aria-label="Livepeer Agent"
          >
            <LivepeerWordmark
              className="h-5 w-auto shrink-0 min-[320px]:h-6 sm:h-10"
              aria-hidden="true"
            />
            <AgentWordmark
              className="h-4 w-auto shrink-0 translate-y-[0.05em] min-[320px]:h-5 sm:h-8"
              aria-hidden="true"
            />
          </h2>
          <p className="mt-5 max-w-md text-reading-body text-pretty text-foreground/65">
            {content.description}
          </p>
          <Button
            size="lg"
            nativeButton={false}
            render={<Link href={content.installCta.href} />}
            className="mt-8 h-14 rounded-sm px-5"
          >
            {content.installCta.label}
            <ArrowRightIcon />
          </Button>
          <AgentCompatibility className="mt-10" responsiveAlignment />
        </div>

        {/* The card fills its column, so its right edge lands on the same
            gutter line as the section rules and the header's underline. */}
        <div className="relative min-w-0">
          {/* The Orchestrator field passes behind this card, and the card's
              border cut the arc off in straight lines — occlusion that read as
              clipping. These two scrims dim the particles over the last 112px
              of their approach so they thin out into the edges instead of
              stopping at them. Both are black-to-black gradients, invisible
              except where there are particles to darken, and both are hidden
              below lg, where the card stacks under the copy and nothing passes
              behind it.

              Left: sized to the bleed strip, the only band where the canvas and
              the card overlap above the boundary.

              Bottom: reaches past the section edge into the Orchestrator, which
              is where the particles below the card live.

              The two share one 112px ramp and meet continuously at the corner —
              the bottom scrim extends 112px to the left and masks itself out
              over exactly that distance, so along the corner its strength
              matches what the left scrim is already applying. That is also why
              the left scrim has no vertical taper: it needed one only while the
              region below the card was undimmed, and now it isn't. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-28 bottom-0 hidden h-[220px] w-28 bg-gradient-to-r from-transparent to-background lg:block"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-28 -left-28 right-0 hidden h-28 bg-gradient-to-t from-transparent to-background [mask-image:linear-gradient(to_right,transparent_0px,black_112px)] lg:block"
          />
          <AgentRuntimePreview />
        </div>
      </div>
    </section>
  );
}

export function OrchestratorCtaSection({
  content,
}: {
  content: HomeContent["providerCta"];
}) {
  return (
    // 40rem rather than the mockup's 56rem: there the band is a bright inverted
    // slab where the height reads as a deliberate pause. On the shared black
    // background it's just empty space, and a closing CTA should sit below the
    // hero (684px) in the hierarchy, not tower over it.
    // Transparent: the shared background is supplied by the wrapper around this
    // and the Agent section (see app/page.tsx), which is also what lets the
    // canvas overflow upward instead of being clipped at this section's edge.
    <section className="relative z-10 flex min-h-[32rem] sm:min-h-[40rem]">
      {/* The field is composed against this section's own height — that layout
          is the one we want — but the arc it describes is a circle whose crown
          sits ~180px above the section, and the canvas edge used to cut it off
          in a hard line right where the Agent card ends. The 220px bleed strip
          gives the crown somewhere to go; it passes behind the card, which is
          opaque, so it reads as the field continuing under the UI.
          bottom-auto releases inset-0's bottom so the height is the one set
          here. Only the outer edges fade: the top dissolves under the card, and
          the bottom clears the footer rule.

          The bottom fade is as short as it can be and still be a fade: full
          strength to 96%, dissolving over the last ~34px. It only takes the
          hard edge off the particles landing on the footer rule — any longer
          and it starts dimming the field on approach, which is the thing that
          kept reading as too much. The top dissolves over a much longer run,
          where it has to disappear under the card without an edge. */}
      <LivepeerCubeStream
        bleedTop={220}
        className="-top-[220px] bottom-auto h-[calc(100%+220px)] -scale-x-100 opacity-80 [mask-image:linear-gradient(to_bottom,transparent_0%,black_20%,black_96%,rgba(0,0,0,0.5)_98.5%,transparent_100%)]"
      />
      {/* max-w-page and the standard gutters, so the right edge lands on the
          same line as the header, the section rules and the footer. Padding
          alone pinned the copy to the viewport edge, which only showed up once
          the viewport got wider than the page measure. */}
      <div className="relative z-10 mx-auto flex w-full max-w-page flex-col justify-center px-4 py-6 sm:px-6 sm:py-10 lg:px-10">
        <div className="ml-auto max-w-3xl text-right">
          <h2 className="text-4xl font-normal tracking-tight text-balance sm:text-6xl">
            {content.heading}
          </h2>
          <p className="mt-4 ml-auto max-w-xl text-base leading-relaxed text-foreground/65">
            {content.description}
          </p>
          <Button
            size="lg"
            nativeButton={false}
            render={<Link href={content.cta.href} />}
            className="mt-6 h-16 rounded-sm px-4"
          >
            {content.cta.label}
            <ArrowRightIcon />
          </Button>
        </div>
      </div>
    </section>
  );
}
