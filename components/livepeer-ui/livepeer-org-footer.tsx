import { ArrowUpRightIcon, GlobeIcon } from "lucide-react"

import { LivepeerLogo } from "@/components/brand"
import { DiscordIcon, GitHubIcon, XIcon } from "@/components/brand-social-icons"
import type { LivepeerOrgSite } from "@/components/livepeer-ui/contracts"
import { ThemeToggle } from "@/components/theme-toggle"

const socialIcons = {
  discord: DiscordIcon,
  x: XIcon,
  github: GitHubIcon,
  website: GlobeIcon,
}

export function LivepeerOrgFooter({ site }: { site: LivepeerOrgSite }) {
  return (
    <footer className="bg-background">
      <div className="mx-auto w-full max-w-page px-4 pt-12 pb-6 sm:px-6 lg:px-10">
        <div className="grid gap-12 sm:grid-cols-3 lg:gap-10">
          {site.footerGroups.map((group) => (
            <div key={group.title}>
              <h2 className="text-sm font-medium">{group.title}</h2>
              <nav className="mt-4 flex flex-col items-start gap-3">
                {group.links.map((link) => {
                  const isLatest = link.label === "Blog"
                  const href = isLatest ? "/latest" : link.href
                  const external = href.startsWith("http")

                  return (
                    <a
                      key={link.label}
                      href={href}
                      target={external ? "_blank" : undefined}
                      rel={external ? "noreferrer" : undefined}
                      className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {isLatest ? "Latest Updates" : link.label}
                      {external && (
                        <ArrowUpRightIcon
                          className="size-3.5"
                          aria-hidden="true"
                        />
                      )}
                    </a>
                  )
                })}
              </nav>
            </div>
          ))}
        </div>

        <div className="mt-16 flex items-center justify-between gap-6 sm:grid sm:grid-cols-3 sm:justify-normal sm:gap-12 lg:gap-10">
          <a
            href={site.homeHref}
            className="inline-flex items-center text-foreground sm:col-start-1 sm:row-start-1"
            aria-label="Livepeer home"
          >
            <LivepeerLogo />
          </a>
          <div className="flex items-center gap-4 sm:col-start-2 sm:row-start-1">
            {site.socialLinks.map((social) => {
              const Icon = socialIcons[social.service]

              return (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={social.label}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Icon className="size-5" aria-hidden="true" />
                </a>
              )
            })}
          </div>
        </div>

        {/* Copyright and theme on one line — the toggle is a site-wide
            setting, not page content, so it belongs in the same quiet band as
            the legal notice rather than up with the navigation. */}
        <div className="mt-12 flex flex-wrap items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">{site.copyright}</p>
          <ThemeToggle />
        </div>
      </div>
    </footer>
  )
}
