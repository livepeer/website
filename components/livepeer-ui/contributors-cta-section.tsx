import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";

import { ContributorFaces } from "@/components/livepeer-ui/contribute-sections";
import { Button } from "@/components/ui/button";
import { SectionRule } from "@/components/ui/section-rule";
import type { ContributorSet } from "@/lib/contributors";

/**
 * The home page's last word: who builds this, and how to be one of them.
 *
 * The page pitches the network to people who use it (the Agent) and people
 * who supply it (the Orchestrator band), and said nothing to people who want
 * to build it; Contribute was reachable from the footer and nowhere else.
 * It is also the one place on the page with people in it. Below the posts
 * rather than above: above would sit between the Orchestrator band and
 * Latest updates and break the arc that joins them, and a page that ends on
 * an invitation closes better than one that ends on a list.
 *
 * Centred, like the hero it bookends; every section between them is set to
 * one side. The faces are the Contribute page's own (ContributorFaces), with
 * the count beneath them as the hero there sets its Discord count, so the
 * heading has people over it rather than an eyebrow. One sentence and one
 * button — the path and the ladder are the Contribute page's to explain.
 *
 * Not the contribution graph from that page's hero: it would be a third
 * canvas on a page that runs two, and a grid says "activity" where
 * photographs say "people".
 */
export function ContributorsCtaSection({
  contributors,
  heading,
  description,
  cta,
}: {
  contributors: ContributorSet;
  heading: string;
  description: string;
  cta: { label: string; href: string };
}) {
  return (
    <section className="bg-background">
      <SectionRule />
      <div className="mx-auto flex w-full max-w-page flex-col items-center px-4 py-20 text-center sm:px-6 sm:py-24 lg:px-10 lg:py-28">
        <ContributorFaces {...contributors} />
        <p className="mt-4 font-mono text-xs text-muted-foreground tabular-nums">
          {contributors.count.toLocaleString()} contributors
        </p>
        {/* The Orchestrator heading's classes, like Latest updates: one
            scale for the page's sections. */}
        <h2 className="mt-8 text-4xl font-normal tracking-tight text-balance sm:text-6xl">
          {heading}
        </h2>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-pretty text-foreground/65">
          {description}
        </p>
        <Button
          size="lg"
          nativeButton={false}
          render={<Link href={cta.href} />}
          className="mt-6 h-16 rounded-sm px-4"
        >
          {cta.label}
          <ArrowRightIcon />
        </Button>
      </div>
    </section>
  );
}
