"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";

import { ChevronDownIcon } from "lucide-react";

import { LivepeerLogo } from "@/components/brand";
import { LivepeerOrgHeaderNav } from "@/components/livepeer-ui/livepeer-org-header-nav";
import { LivepeerOrgMenu } from "@/components/livepeer-ui/livepeer-org-menu";
import type { LivepeerOrgSite } from "@/components/livepeer-ui/contracts";
import type { LivepeerOrgNavigationImages } from "@/sanity/lib/livepeer-org-navigation";
import { Button } from "@/components/ui/button";
import { CtaArrow } from "@/components/ui/cta-arrow";
import { ExternalArrow } from "@/components/ui/external-arrow";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { agentApp, loginLinks } from "@/lib/site";
import { cn } from "@/lib/utils";

/** Height of the header row (h-16), in px — the strip a section must reach to
 *  count as sitting behind the header. */
const HEADER_HEIGHT = 64;

/**
 * The login menu's items, with a single highlight that slides between them.
 *
 * Per-item backgrounds cross-fade: the old one dims while the new one lifts,
 * and with two items 44px apart that reads as a flicker. One shared element
 * that moves instead gives the highlight continuity — you follow it rather
 * than re-finding it. This is x.ai's behaviour in the same control.
 *
 * The slide is suppressed on first appearance. Animating position from a
 * standing start means the highlight flies in from wherever it was left,
 * which looks like a bug; it snaps into place under the first item and only
 * animates for moves after that.
 */
function LoginMenuItems({
  links,
}: {
  links: readonly { label: string; href: string }[];
}) {
  const [rect, setRect] = React.useState<{ top: number; height: number } | null>(
    null
  );
  const wasVisible = React.useRef(false);
  const slides = rect !== null && wasVisible.current;

  React.useEffect(() => {
    wasVisible.current = rect !== null;
  }, [rect]);

  const track = (element: HTMLElement) =>
    setRect({ top: element.offsetTop, height: element.offsetHeight });

  return (
    <div className="relative" onPointerLeave={() => setRect(null)}>
      <div
        aria-hidden="true"
        className={cn(
          // bg-foreground/[0.06], not bg-accent. --accent and --secondary hold
          // the same value in both themes (0.97 light, 0.269 dark), and this
          // popup is bg-secondary — so an accent highlight painted the panel's
          // own colour onto itself and the hover looked like it was missing.
          // A fraction of the foreground always lifts off whatever is beneath.
          "pointer-events-none absolute inset-x-0 top-0 rounded-sm bg-foreground/[0.06] transition-opacity duration-150",
          slides && "transition-[transform,height,opacity] ease-out",
          rect ? "opacity-100" : "opacity-0"
        )}
        style={
          rect
            ? { transform: `translateY(${rect.top}px)`, height: rect.height }
            : undefined
        }
      />
      {links.map((link) => (
        <DropdownMenuItem
          key={link.label}
          // relative, so the label sits above the moving highlight.
          // focus:bg-transparent disables the component's own instant fill —
          // otherwise both highlights render and the moving one is invisible
          // under the static one. Keyboard navigation drives the same
          // indicator through onFocus, so nothing is lost by removing it.
          className="relative cursor-pointer rounded-sm px-2.5 py-2 focus:bg-transparent"
          onPointerEnter={(event) => track(event.currentTarget)}
          onFocus={(event) => track(event.currentTarget)}
          render={<a href={link.href} target="_blank" rel="noreferrer" />}
        >
          <span>{link.label}</span>
          <ExternalArrow />
        </DropdownMenuItem>
      ))}
    </div>
  );
}

export function LivepeerOrgHeader({
  site,
  navigationImages,
  consoleHref,
  playbooksHref,
  action,
  showMenu = true,
}: {
  site: LivepeerOrgSite;
  navigationImages?: LivepeerOrgNavigationImages;
  consoleHref?: string;
  playbooksHref?: string;
  action?: {
    label: string;
    href: string;
  };
  showMenu?: boolean;
}) {
  const mounted = React.useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false
  );
  const [desktopMenuOpen, setDesktopMenuOpen] = React.useState(false);
  // Controlled so the wrapper's pointer handlers can drive it — see the
  // "Log in" block below for why the close is deferred rather than immediate.
  const [loginMenuOpen, setLoginMenuOpen] = React.useState(false);
  const loginCloseTimer = React.useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const cancelLoginClose = React.useCallback(() => {
    if (loginCloseTimer.current) {
      clearTimeout(loginCloseTimer.current);
      loginCloseTimer.current = null;
    }
  }, []);

  const scheduleLoginClose = React.useCallback(() => {
    cancelLoginClose();
    loginCloseTimer.current = setTimeout(() => setLoginMenuOpen(false), 100);
  }, [cancelLoginClose]);

  React.useEffect(() => () => cancelLoginClose(), [cancelLoginClose]);
  // The header is transparent over the hero and earns a translucent, blurred
  // background once the page scrolls underneath it — otherwise nav text has to
  // sit on whatever content happens to be passing behind.
  const [scrolled, setScrolled] = React.useState(false);

  // Sections marked [data-header-invert] render as a near-white band. A black
  // translucent header over one composites to a muddy grey, so the header flips
  // to light tokens while such a section sits behind it.
  const [inverted, setInverted] = React.useState(false);
  // [data-header-solid] is for bands that are light in one part of their width
  // and dark in another. Neither token scope serves both — flipping to light
  // fixes the pale half and breaks the dark one — and a translucent header over
  // near-white composites to a grey that leaves the muted nav links at about
  // 1.7:1. Such sections opt the header into an opaque background instead, so
  // it renders on its own ground regardless of what is passing underneath.
  const [solid, setSolid] = React.useState(false);
  const pathname = usePathname();

  React.useEffect(() => {
    const behindHeader = (target: Element) => {
      const rect = target.getBoundingClientRect();
      return rect.top < HEADER_HEIGHT && rect.bottom > 0;
    };
    const invertTargets = Array.from(
      document.querySelectorAll("[data-header-invert]")
    );
    const solidTargets = Array.from(
      document.querySelectorAll("[data-header-solid]")
    );

    const update = () => {
      setScrolled(window.scrollY > 8);
      // Only the strip actually behind the header counts, so the flip happens
      // as the band reaches the header, not when it enters the viewport.
      setInverted(invertTargets.some(behindHeader));
      setSolid(solidTargets.some(behindHeader));
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
    // Re-query on navigation: the header lives in the root layout and persists
    // across routes, so the marked sections change beneath it.
  }, [pathname]);

  return (
    <>
      {mounted &&
        showMenu &&
        createPortal(
          <>
            <div
              aria-hidden="true"
              data-livepeer-nav-overlay
              className={cn(
                "pointer-events-none fixed inset-0 z-[72] bg-black/5 backdrop-blur-sm transition-opacity duration-75 ease-out",
                desktopMenuOpen ? "opacity-100" : "opacity-0"
              )}
            />
          </>,
          document.body
        )}
      <header
        className={cn(
          // sticky (not fixed): stays in flow so pages that don't opt into a
          // full-bleed hero start below it, while the hero pulls itself up
          // under the header with -mt-16.
          "sticky top-0 z-[80] w-full text-foreground transition-[background-color,backdrop-filter] duration-200",
          // Flipping the token scope re-resolves every child — nav text,
          // borders, the CTA button — instead of recolouring each one.
          inverted && !desktopMenuOpen && "theme-light",
          // While the mega-menu is open it supplies its own backdrop behind the
          // header, so the header stays clear to avoid a doubled blur.
          //
          // The scrim is asymmetric, and it has to be. Nav links are
          // muted-foreground: rgb(161) in dark, rgb(115) in light. A black
          // scrim pushes the backdrop *away* from light text, so dark mode can
          // stay see-through — at 80% the worst case (a bright image passing
          // underneath) measures 5.26:1. A white scrim pushes the backdrop
          // *toward* dark text, so light mode gets worse the more you add:
          // measured 1.19:1 over dark content at 50%, and still only 3.78:1 at
          // 90%. Nothing short of opaque clears AA there — at which point it is
          // 4.60:1. Hence opaque in light, 80% in dark.
          //
          // Measured on /blog, whose grid of arbitrary photographic covers is
          // the worst case the header has to survive.
          scrolled && !desktopMenuOpen
            ? solid
              ? "bg-background"
              : "bg-background backdrop-blur-xl dark:bg-background/80"
            : "bg-transparent"
        )}
      >
        <div className="relative z-10 mx-auto w-full max-w-page px-4 sm:px-6 lg:px-10">
          {/* The background/blur is full-bleed but the hairline is inset to the
              content gutter, so the rule aligns with the logo and nav rather
              than running edge to edge. */}
          {/* The hairline is opaque in dark, not `border-border`.
              --border is 15% white there, and this is the one rule on the site
              that does not sit on an opaque surface: the header behind it is
              bg-background/50 with a backdrop blur, so a translucent line
              composites straight through to the page scrolling underneath and
              samples it. Measured, the same rule rendered at sRGB 0.167 over a
              dark section and 0.722 under a bright blurred post cover — plus a
              discrete step whenever a [data-header-solid] band flipped the
              header opaque.

              color-mix here is not a new colour: 15% foreground over
              background is precisely what border-border flattens to everywhere
              else on the site, so the header rule now matches the footer and
              section rules instead of drifting around them. Light mode keeps
              border-border, which is already opaque and already stable. */}
          <div
            className={cn(
              "flex h-16 items-center justify-between gap-2 border-b transition-colors duration-200 sm:gap-6",
              scrolled && !desktopMenuOpen
                ? "border-border dark:border-[color-mix(in_srgb,var(--foreground)_15%,var(--background))]"
                : "border-transparent"
            )}
          >
            <div className="flex min-w-0 items-center gap-5">
              <Link
                href={site.homeHref}
                className="relative z-10 flex shrink-0 items-center gap-3"
                aria-label="Livepeer.org home"
              >
                <LivepeerLogo />
              </Link>
              {showMenu && (
                <LivepeerOrgHeaderNav
                  site={site}
                  navigationImages={navigationImages}
                  onOpenChange={setDesktopMenuOpen}
                />
              )}
            </div>
            <div className="relative z-10 flex items-center gap-2 sm:gap-3">
              {/* Log in, not "Get early access". A dropdown rather than a
                  plain link because it is the entry point to signed-in
                  surfaces, and there will be more than one — today the Agent
                  console is the only one, so the menu holds exactly that.
                  Matches the mockup's trigger: secondary, rounded-sm, chevron. */}
              {/* hidden lg:block, matching the mockup — which hides its
                  trigger with a wrapper rather than a class on the button, so
                  checking the button's own classes says otherwise. On a phone
                  these same destinations live in the menu's login panel, both
                  fed by loginLinks. */}
              {/* Hover is driven from this wrapper rather than Base UI's
                  openOnHover, matching the registry's own implementation: a
                  controlled open state, opened on pointer enter and closed on
                  a 100ms delay. The delay is the point — it is what lets the
                  pointer cross the 8px gap from trigger to menu without the
                  menu closing underneath it. The content carries the same pair
                  so the menu stays open while you are inside it.

                  hidden lg:block matches the mockup, which hides the trigger
                  with a wrapper rather than a class on the button. On a phone
                  these destinations live in the menu's login panel instead —
                  both fed by loginLinks. */}
              {showMenu && (
                <div
                  className="hidden lg:block"
                  onPointerEnter={() => {
                    cancelLoginClose();
                    setLoginMenuOpen(true);
                  }}
                  onPointerLeave={scheduleLoginClose}
                >
                  <DropdownMenu
                    open={loginMenuOpen}
                    onOpenChange={setLoginMenuOpen}
                  >
                    <DropdownMenuTrigger
                      render={
                        <Button variant="secondary" className="rounded-sm" />
                      }
                    >
                      Log in
                      <ChevronDownIcon className="size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      sideOffset={8}
                      positionerClassName="z-[90]"
                      className="w-max min-w-0 rounded-sm bg-secondary p-1"
                      onPointerEnter={cancelLoginClose}
                      onPointerLeave={scheduleLoginClose}
                    >
                      <LoginMenuItems links={loginLinks} />
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
              {/* The primary action, in the registry's "Use Livepeer" slot.
                  Same tab: this is the product, not a reference — sending it
                  to a new tab would treat it as an aside. A plain <a> rather
                  than <Link> because the host is off-site, so there is nothing
                  for Next to prefetch. CtaArrow, not ExternalArrow: the arrow
                  now distinguishes "go" from "opens elsewhere", and only the
                  dropdown items are the latter. Desktop-only, like the Log in
                  trigger beside it. */}
              {showMenu && (
                <Button
                  nativeButton={false}
                  render={<a href={agentApp.console} />}
                  className="group/cta hidden rounded-sm lg:inline-flex"
                >
                  Use Livepeer
                  <CtaArrow />
                </Button>
              )}
              {playbooksHref && (
                <Button
                  variant="secondary"
                  size="lg"
                  nativeButton={false}
                  render={<Link href={playbooksHref} />}
                  className="h-12 rounded-sm px-4"
                >
                  Playbooks
                </Button>
              )}
              {consoleHref && (
                <Button
                  size="lg"
                  nativeButton={false}
                  render={<Link href={consoleHref} />}
                  className="h-12 rounded-sm px-4"
                >
                  Console
                </Button>
              )}
              {action && (
                <Button
                  variant="link"
                  nativeButton={false}
                  render={<Link href={action.href} />}
                  className="px-2 font-medium"
                >
                  {action.label} →
                </Button>
              )}
              {showMenu && (
                <div className="lg:hidden">
                  <LivepeerOrgMenu site={site} />
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
