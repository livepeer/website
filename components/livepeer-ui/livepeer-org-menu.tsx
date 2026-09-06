"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowLeftIcon } from "lucide-react"

import { LivepeerLogo } from "@/components/brand"
import { getLivepeerOrgFoundationHref } from "@/components/livepeer-ui/livepeer-org-header-nav"
import { MobileNavigationMenu } from "@/components/livepeer-ui/mobile-navigation-menu"
import { ExternalArrow } from "@/components/ui/external-arrow"
import type { LivepeerOrgSite } from "@/components/livepeer-ui/contracts"
import { loginLinks } from "@/lib/site"

// Shared with the header's "Log in" dropdown (lib/site.ts). The list used to
// be local to this file and still pointed Agent Console at
// /mockups/livepeer-agent — a path that only exists on the registry site.

export function LivepeerOrgMenu({ site }: { site: LivepeerOrgSite }) {
  const [open, setOpen] = React.useState(false)
  const [showLoginLinks, setShowLoginLinks] = React.useState(false)
  const resetLoginLinksTimer = React.useRef<ReturnType<
    typeof setTimeout
  > | null>(null)
  const allLinks = [
    ...site.menuLinks,
    ...site.footerGroups.flatMap((group) => group.links),
  ]
  const findHref = (labels: string[], path: string, fallback: string) =>
    site.menuLinks.find(
      (link) => labels.includes(link.label) || link.href.includes(path)
    )?.href ??
    allLinks.find(
      (link) => labels.includes(link.label) || link.href.includes(path)
    )?.href ??
    fallback
  const mobileLinks = [
    { label: "Home", href: site.homeHref },
    { label: "Foundation", href: getLivepeerOrgFoundationHref(site) },
    {
      label: "Ecosystem",
      href: findHref(["Ecosystem"], "/ecosystem", `${site.homeHref}/ecosystem`),
    },
    {
      label: "Agent",
      href: findHref(
        ["Livepeer Agent", "Agent"],
        "/agent",
        `${site.homeHref}/agent`
      ),
    },
    {
      label: "$LPT",
      href: findHref(
        ["Livepeer Token", "$LPT"],
        "/token",
        `${site.homeHref}/token`
      ),
    },
    {
      label: "Provide Compute",
      href: findHref(
        ["GPU", "Provide GPUs", "Provide GPU", "Provide Compute"],
        "/compute",
        `${site.homeHref}/compute`
      ).replace(/\/earn(?=\/|$)/, "/compute"),
    },
    {
      label: "Latest Updates",
      href: findHref(
        ["Blog", "Latest Updates"],
        "/latest",
        `${site.homeHref}/latest`
      ).replace(/\/blog(?=\/|$)/, "/latest"),
    },
  ]

  const clearLoginLinksReset = React.useCallback(() => {
    if (resetLoginLinksTimer.current) {
      clearTimeout(resetLoginLinksTimer.current)
      resetLoginLinksTimer.current = null
    }
  }, [])

  React.useEffect(() => clearLoginLinksReset, [clearLoginLinksReset])

  const handleOpenChange = (nextOpen: boolean) => {
    clearLoginLinksReset()
    setOpen(nextOpen)
    if (!nextOpen) {
      resetLoginLinksTimer.current = setTimeout(() => {
        setShowLoginLinks(false)
        resetLoginLinksTimer.current = null
      }, 220)
    }
  }

  return (
    <MobileNavigationMenu
      title="site navigation"
      open={open}
      onOpenChange={handleOpenChange}
      header={
        <Link href={site.homeHref} aria-label="Livepeer.org home">
          <LivepeerLogo />
        </Link>
      }
    >
      {(close) => (
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pt-6 pb-6 sm:px-6 sm:pt-8 sm:pb-8">
          <nav
            className="relative -left-[0.04em] flex flex-col"
            aria-label="Mobile site sections"
          >
            {showLoginLinks ? (
              <>
                <button
                  type="button"
                  onClick={() => setShowLoginLinks(false)}
                  className="mb-6 flex w-fit items-center gap-2 rounded-sm py-2 font-sans text-sm text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <ArrowLeftIcon aria-hidden="true" className="size-4" />
                  Back
                </button>
                {loginLinks.map((item) => {
                  const className =
                    "flex items-center gap-2 rounded-sm py-2.5 font-display text-display-sm text-foreground outline-none transition-colors hover:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring sm:text-display-lg"
                  const content = (
                    <>
                      <span>{item.label}</span>
                      {/* These labels are display-sm/display-lg, so the arrow
                          scales with them rather than sitting at the 14px size
                          it takes in the header dropdown. */}
                      <ExternalArrow className="size-6 sm:size-8" />
                    </>
                  )

                  return item.href.startsWith("http") ? (
                    <a
                      key={item.label}
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      onClick={close}
                      className={className}
                    >
                      {content}
                    </a>
                  ) : (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={close}
                      className={className}
                    >
                      {content}
                    </Link>
                  )
                })}
              </>
            ) : (
              <>
                {mobileLinks.map((item) => {
                  const className =
                    "rounded-sm py-2.5 font-display text-display-sm text-foreground transition-colors outline-none hover:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring sm:text-display-lg"

                  return item.href.startsWith("http") ? (
                    <a
                      key={item.label}
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      onClick={close}
                      className={className}
                    >
                      {item.label}
                    </a>
                  ) : (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={close}
                      className={className}
                    >
                      {item.label}
                    </Link>
                  )
                })}
                <button
                  type="button"
                  onClick={() => setShowLoginLinks(true)}
                  className="mt-8 flex items-center gap-2 rounded-sm py-2.5 font-display text-display-sm text-foreground transition-colors outline-none hover:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring sm:text-display-lg"
                >
                  <span>Login</span>
                  <span aria-hidden="true">→</span>
                </button>
              </>
            )}
          </nav>
        </div>
      )}
    </MobileNavigationMenu>
  )
}
