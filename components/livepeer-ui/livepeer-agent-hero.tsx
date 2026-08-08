import Link from "next/link"

import { CopyButton } from "@/components/copy-button"
import { AgentWordmark, LivepeerWordmark } from "@/components/brand"
import { LivepeerAgentDeltaStream } from "@/components/livepeer-ui/livepeer-agent-delta-stream"

export function LivepeerAgentHero({
  content,
}: {
  content: {
    heading: string
    description: string
    serverUrl: string
    signInCta: { label: string; href: string }
    createAccountCta: { label: string; href: string }
  }
}) {
  return (
    <section className="w-full overflow-hidden bg-background px-4 pb-24 sm:px-6 sm:pb-32">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center text-center">
        <div className="relative h-64 w-full sm:h-72 lg:h-80">
          <LivepeerAgentDeltaStream contained />
        </div>
        <div className="flex w-full max-w-4xl flex-col items-center gap-7">
          {/* The same two-wordmark lockup the home page uses: no symbol, and
              "AGENT" as the AgentWordmark SVG rather than type set in
              font-agent as the registry ships it. Agent runs at 0.8x the
              Livepeer wordmark, matching the ratio there, with the same
              optical nudge onto the baseline. */}
          <div
            className="flex max-w-full items-end gap-2 text-foreground lg:gap-3"
            aria-label="Livepeer Agent"
          >
            <LivepeerWordmark
              className="h-[clamp(1.125rem,5.5vw,1.5rem)] w-auto shrink-0 lg:h-10"
              aria-hidden="true"
            />
            <AgentWordmark
              className="h-[clamp(0.9rem,4.4vw,1.2rem)] w-auto shrink-0 translate-y-[0.05em] lg:h-8"
              aria-hidden="true"
            />
          </div>
          <h1 className="max-w-3xl text-display-sm text-balance sm:text-display-lg">
            {content.heading}
          </h1>
          <div className="flex max-w-full flex-col items-center">
            <p className="mb-7 text-sm text-muted-foreground">
              {content.description}
            </p>
            <div className="inline-flex max-w-full items-center gap-4 rounded-sm bg-secondary px-5 py-4 text-left text-secondary-foreground">
              <code className="min-w-0 font-mono text-xs leading-relaxed break-all sm:text-sm">
                {content.serverUrl}
              </code>
              <CopyButton
                value={content.serverUrl}
                className="size-8 shrink-0 rounded-none bg-transparent text-secondary-foreground/40 transition-colors hover:bg-transparent hover:text-secondary-foreground"
              />
            </div>
          </div>
          <nav className="flex items-center gap-5 text-sm" aria-label="Account">
            <Link
              href={content.signInCta.href}
              className="text-foreground underline underline-offset-4 transition-opacity hover:opacity-60"
            >
              {content.signInCta.label}
            </Link>
            <Link
              href={content.createAccountCta.href}
              className="text-foreground underline underline-offset-4 transition-opacity hover:opacity-60"
            >
              {content.createAccountCta.label}
            </Link>
          </nav>
        </div>
      </div>
    </section>
  )
}
