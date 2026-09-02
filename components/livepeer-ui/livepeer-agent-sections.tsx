import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"

import { AgentCompatibility } from "@/components/livepeer-ui/agent-compatibility"
import type { LivepeerOrgPage } from "@/components/livepeer-ui/contracts"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

type AgentContent = NonNullable<LivepeerOrgPage["agentContent"]>

/**
 * The split band: compatible clients on an inverted panel, the API-key pitch on
 * a dark one. Two square halves that stack below md, as in the mockup.
 *
 * Marked [data-header-solid], not [data-header-invert]. Invert flips the header
 * to light tokens, which is right for a full-width white band but wrong here —
 * it would be light over the dark right half for exactly as long as it is light
 * over the pale left one. Left translucent, the header composites to a grey
 * that drops the muted nav links to roughly 1.7:1 against the pale panel. So
 * the header goes opaque over this band instead and renders on its own ground.
 *
 * The mockup never has to answer this: its header is not sticky.
 */
export function AgentAccessSection({
  content,
}: {
  content: AgentContent["access"]
}) {
  return (
    <section data-header-solid className="grid md:grid-cols-2">
      <div className="flex aspect-square items-center justify-center bg-foreground px-6 text-background sm:px-10">
        <AgentCompatibility large inverted />
      </div>
      <div className="flex aspect-square flex-col items-center justify-center bg-muted px-6 text-center sm:px-10">
        {/* The mockup sets this with an arbitrary clamp that lands on 36px at
            desktop — exactly text-display-sm. Using the semantic step instead
            keeps the page inside the registry's type roles (CLAUDE.md), at the
            cost of running 32px rather than 24px on small screens. */}
        <h2 className="max-w-xl text-page-title text-balance sm:text-display-sm">
          {content.heading}
        </h2>
        <p className="mt-3 max-w-lg text-sm leading-relaxed text-balance text-muted-foreground">
          {content.description}
        </p>
        {/* Optional: the band still says what it has to say without a button,
            and an empty one would be an arrow pointing at nothing. */}
        {content.cta && (
          <Button
            size="lg"
            nativeButton={false}
            render={<Link href={content.cta.href} />}
            className="mt-8 h-12 rounded-sm px-5"
          >
            {content.cta.label}
            <ArrowRightIcon className="size-4" aria-hidden="true" />
          </Button>
        )}
      </div>
    </section>
  )
}

/**
 * The capability index: one badge per tool the Agent can reach on the network.
 *
 * The list is the argument — its sheer length is the point being made — so it
 * is rendered in full rather than truncated behind the "see more" link, which
 * goes to the Agent app where each entry is actually documented.
 */
export function AgentCapabilitiesSection({
  content,
  capabilities,
}: {
  content: AgentContent["capabilities"]
  capabilities: readonly string[]
}) {
  return (
    <section className="bg-background px-4 py-24 sm:px-6 sm:py-32 lg:px-10">
      <div className="mx-auto flex max-w-page flex-col items-center text-center">
        <h2 className="max-w-3xl text-display-sm text-balance sm:text-display-md">
          {content.heading}
        </h2>
        {/* A plain list: it is an inventory, and screen readers should be able
            to skip it as one item rather than wade through 108 stray strings.
            The count is announced so that length is legible non-visually too. */}
        <ul
          aria-label={`${capabilities.length} available capabilities`}
          className="mt-10 flex max-w-5xl flex-wrap justify-center gap-2"
        >
          {capabilities.map((capability) => (
            <li key={capability}>
              <Badge
                variant="secondary"
                className="rounded-sm px-3 py-2 font-normal"
              >
                {capability}
              </Badge>
            </li>
          ))}
        </ul>
        <Button
          variant="secondary"
          size="lg"
          nativeButton={false}
          render={<Link href={content.cta.href} />}
          className="mt-10 h-12 rounded-sm px-5"
        >
          {content.cta.label}
          <ArrowRightIcon className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </section>
  )
}
