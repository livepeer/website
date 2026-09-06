import Image from "next/image"

import { cn } from "@/lib/utils"
import { sanityStaticAssets } from "@/components/static-assets"

const agents = [
  {
    name: "Claude",
    src: sanityStaticAssets.agentCompatibility.claude,
  },
  {
    name: "Claude Code",
    src: sanityStaticAssets.agentCompatibility.claudeCode,
  },
  {
    name: "Codex",
    src: sanityStaticAssets.agentCompatibility.codex,
    monochrome: true,
    opticalScale: true,
  },
  {
    name: "Hermes",
    src: sanityStaticAssets.agentCompatibility.hermes,
    monochrome: true,
  },
  {
    name: "OpenClaw",
    src: sanityStaticAssets.agentCompatibility.openClaw,
  },
  {
    name: "Pi",
    src: sanityStaticAssets.agentCompatibility.pi,
    monochrome: true,
  },
]

function AgentCompatibility({
  className,
  inverted = false,
  large = false,
  responsiveAlignment = false,
}: {
  className?: string
  inverted?: boolean
  large?: boolean
  responsiveAlignment?: boolean
}) {
  return (
    <div
      className={cn(
        "text-center",
        responsiveAlignment && "sm:text-left",
        className
      )}
    >
      <p
        className={cn(
          "text-sm",
          inverted ? "text-background/45" : "text-foreground/45"
        )}
      >
        Compatible with
      </p>
      <ul
        className={cn(
          large
            ? "mt-8 grid grid-cols-3 place-items-center gap-8"
            : "mt-4 flex flex-wrap items-center justify-center gap-6",
          responsiveAlignment && "sm:justify-start"
        )}
      >
        {agents.map((agent) => (
          <li key={agent.name}>
            <Image
              src={agent.src}
              alt={agent.name}
              width={large ? 64 : 32}
              height={large ? 64 : 32}
              className={cn(
                "size-8 object-contain",
                large && "size-16",
                agent.opticalScale && "scale-[1.75]",
                // These marks are flattened to a single tone. brightness-0
                // alone renders them black, which disappears on a dark
                // surface — so the tone follows the theme (and flips again on
                // an inverted band, where the surface is opposite the theme).
                agent.monochrome &&
                  (inverted
                    ? "brightness-0 invert dark:invert-0"
                    : "brightness-0 dark:invert")
              )}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}

export { AgentCompatibility }
