"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRightIcon } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import type {
  EditorialLink,
  LivepeerOrgSite,
} from "@/components/livepeer-ui/contracts";
import { Button } from "@/components/ui/button";
import { agentApp } from "@/lib/site";
import { cn } from "@/lib/utils";
import type { LivepeerOrgNavigationImages } from "@/sanity/lib/livepeer-org-navigation";

export const livepeerOrgHeaderGroups = [
  "Network",
  "Agent",
  "Resources",
] as const;

const headerItems = [...livepeerOrgHeaderGroups, "Foundation"] as const;

const linkDescriptions: Record<string, string> = {
  Ecosystem: "Explore apps built on Livepeer",
  "Livepeer Token": "Learn how LPT coordinates the network",
  "Delegate LPT": "Stake LPT with network operators",
  "Provide GPUs": "Run an orchestrator and earn fees",
  Roadmap: "See what’s next for the network",
  Blog: "Updates from across the ecosystem",
  Foundation: "Meet the organization supporting Livepeer",
  Brand: "Logos, guidelines, and brand assets",
  Documentation: "Technical guides and reference",
  "Livepeer Agent": "Create and edit media with your agent",
  "Agent Playbooks": "Run production-ready workflows in Agent Console",
  "Agent Documentation": "Build with Livepeer AI tools and APIs",
};

const localLinkMatches: Record<
  string,
  (label: string, href: string) => boolean
> = {
  Ecosystem: (label, href) =>
    label === "Ecosystem" || href.includes("/ecosystem"),
  "Livepeer Token": (label, href) =>
    label === "Livepeer Token" || href.includes("/token"),
  "Provide GPUs": (label, href) => label === "GPU" || href.includes("/compute"),
  Blog: (label, href) =>
    label === "Blog" || href.includes("/latest") || href.includes("/blog"),
  Foundation: (label, href) =>
    label === "Foundation" || href.includes("/foundation"),
  "Livepeer Agent": (label, href) =>
    label === "Livepeer Agent" || href.includes("/agent"),
};

const resourceOrder: Record<string, number> = {
  Blog: 0,
  Brand: 1,
  Roadmap: 2,
  Documentation: 3,
};

const networkOrder: Record<string, number> = {
  Ecosystem: 0,
  "Provide GPUs": 1,
  "Livepeer Token": 2,
  "Delegate LPT": 3,
  Roadmap: 4,
};

function resolveHref(site: LivepeerOrgSite, label: string, href: string) {
  const matches = localLinkMatches[label];
  const resolvedHref = matches
    ? (site.menuLinks.find((link) => matches(link.label, link.href))?.href ??
      href)
    : href;

  if (label === "Provide GPUs") {
    return resolvedHref.replace(/\/earn(?=\/|$)/, "/compute");
  }

  return label === "Blog"
    ? resolvedHref.replace(/\/blog(?=\/|$)/, "/latest")
    : resolvedHref;
}

export function getLivepeerOrgHeaderGroup(
  site: LivepeerOrgSite,
  title: (typeof livepeerOrgHeaderGroups)[number]
) {
  if (title === "Agent") {
    const matchesAgent = localLinkMatches["Livepeer Agent"];
    const agentHref =
      site.menuLinks.find((link) => matchesAgent(link.label, link.href))
        ?.href ?? `${site.homeHref}/agent`;

    return {
      _key: "agent",
      title: "Agent",
      links: [
        { label: "Livepeer Agent", href: agentHref },
        // The playbook library, which lives in the Agent console rather than
        // on this site — hence agentApp.playbooks and the jump-out arrow
        // LivepeerOrgNavItem already special-cases for this label.
        { label: "Agent Playbooks", href: agentApp.playbooks },
        {
          label: "Agent Documentation",
          href: "https://docs.livepeer.org/v1/ai/builders/get-started",
        },
      ],
    };
  }

  if (title === "Resources") {
    const resources = site.footerGroups.find((item) => item.title === title);
    const roadmap = site.footerGroups
      .find((item) => item.title === "Network")
      ?.links.find((item) => item.label === "Roadmap");

    return resources
      ? {
          ...resources,
          links: roadmap ? [...resources.links, roadmap] : resources.links,
        }
      : undefined;
  }

  return site.footerGroups.find((item) => item.title === title);
}

export function getLivepeerOrgHeaderLinks(
  group: NonNullable<ReturnType<typeof getLivepeerOrgHeaderGroup>>
) {
  return [...group.links]
    .filter(
      (item) =>
        item.label !== "Primer" &&
        item.label !== "Foundation" &&
        !(group.title === "Network" && item.label === "Roadmap")
    )
    .sort((a, b) => {
      const order =
        group.title === "Resources"
          ? resourceOrder
          : group.title === "Network"
            ? networkOrder
            : null;

      return order ? (order[a.label] ?? 99) - (order[b.label] ?? 99) : 0;
    });
}

export function getLivepeerOrgFoundationHref(site: LivepeerOrgSite) {
  return resolveHref(site, "Foundation", "https://livepeer.org/foundation");
}

export function LivepeerOrgNavItem({
  site,
  item,
  navigationImages,
  onNavigate,
  onPointerEnter,
  onFocus,
  className,
}: {
  site: LivepeerOrgSite;
  item: EditorialLink;
  navigationImages?: LivepeerOrgNavigationImages;
  onNavigate?: () => void;
  /** Reported to the grid so one shared highlight can follow the pointer. */
  onPointerEnter?: React.PointerEventHandler<HTMLElement>;
  onFocus?: React.FocusEventHandler<HTMLElement>;
  className?: string;
}) {
  const href = resolveHref(site, item.label, item.href);
  const jumpOut = href.startsWith("http") || item.label === "Agent Playbooks";
  const label =
    item.label === "Blog"
      ? "Latest Updates"
      : item.label === "Provide GPUs"
        ? "Provide Compute"
        : item.label;
  const image = navigationImages?.[item.label];
  const content = (
    <>
      <span className="relative aspect-[3/4] h-full shrink-0 overflow-hidden rounded-xs bg-muted">
        {image && (
          <Image
            src={image}
            alt=""
            fill
            sizes="96px"
            // The menu panel renders at opacity-0 until opened, so lazy images
            // are never fetched; load eagerly so thumbnails are ready on hover.
            loading="eager"
            className="object-cover"
          />
        )}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1 pt-1">
        <span className="flex items-start gap-1.5 text-sm text-foreground">
          <span className="min-w-0 truncate">{label}</span>
          {jumpOut && (
            <ArrowUpRightIcon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
          )}
        </span>
        <span className="text-xs leading-snug text-pretty text-muted-foreground">
          {linkDescriptions[item.label]}
        </span>
      </span>
    </>
  );
  const itemClassName = cn(
    // A fraction of the foreground rather than bg-muted. The panel behind
    // these is bg-background/95, and muted sits close enough to it in both
    // themes that the hover barely registered — in light it is 0.97 against a
    // white panel. A relative lift is a visible step from whatever the panel
    // resolves to, and moves the right way in both themes.
    "group flex h-full min-w-0 items-stretch gap-3 rounded-sm bg-transparent p-2 font-normal shadow-none transition-colors outline-none hover:bg-foreground/[0.1] focus-visible:bg-foreground/[0.1] focus-visible:ring-2 focus-visible:ring-ring",
    className
  );

  return jumpOut ? (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={itemClassName}
      onClick={onNavigate}
      onPointerEnter={onPointerEnter}
      onFocus={onFocus}
    >
      {content}
    </a>
  ) : (
    <Link
      href={href}
      className={itemClassName}
      onClick={onNavigate}
      onPointerEnter={onPointerEnter}
      onFocus={onFocus}
    >
      {content}
    </Link>
  );
}

/**
 * The panel's item grid, with one highlight that travels between the cards.
 *
 * Per-item `hover:bg-*` cross-fades: the card you left dims while the card you
 * arrived at lifts, and two adjacent cards fading in opposite directions reads
 * as a blink rather than a movement. A single element that moves gives the
 * hover continuity — the same device as the login dropdown, which slides
 * vertically between two rows.
 *
 * Both axes are tracked, not just x. The grid is 3 columns at `lg` and 4 at
 * `xl`, so a four-item group wraps: moving along a row is the lateral slide,
 * and moving to the row below travels down as well.
 *
 * Position is written to the node rather than held in state, and the transition
 * is unconditional. A CSS transition only runs if the property was already
 * transitionable in the previous computed style, so toggling a transition class
 * in the same commit that moves the element makes it teleport — React renders
 * both together, which no amount of tuning fixes.
 */
function LivepeerOrgNavItemGrid({
  site,
  links,
  navigationImages,
  onNavigate,
}: {
  site: LivepeerOrgSite;
  links: EditorialLink[];
  navigationImages?: LivepeerOrgNavigationImages;
  onNavigate?: () => void;
}) {
  const highlightRef = React.useRef<HTMLDivElement>(null);
  const highlightShown = React.useRef(false);
  const [highlightOn, setHighlightOn] = React.useState(false);

  const trackHighlight = React.useCallback((element: HTMLElement) => {
    const node = highlightRef.current;
    if (!node) return;
    // First card placed without travelling to it: otherwise the highlight
    // flies in from the panel's top-left corner.
    const place = !highlightShown.current;
    if (place) node.style.transition = "none";
    node.style.transform = `translate(${element.offsetLeft}px, ${element.offsetTop}px)`;
    node.style.width = `${element.offsetWidth}px`;
    node.style.height = `${element.offsetHeight}px`;
    if (place) {
      void node.offsetWidth;
      node.style.transition = "";
    }
    highlightShown.current = true;
    setHighlightOn(true);
  }, []);

  return (
    <div
      className="relative grid grid-cols-3 gap-2 xl:grid-cols-4"
      onPointerLeave={() => {
        highlightShown.current = false;
        setHighlightOn(false);
      }}
    >
      <div
        ref={highlightRef}
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute top-0 left-0 h-0 w-0 rounded-sm bg-foreground/[0.1] transition-[transform,width,height,opacity] duration-200 ease-out",
          highlightOn ? "opacity-100" : "opacity-0"
        )}
      />
      {links.map((item) => (
        <LivepeerOrgNavItem
          key={`${item.label}-${item.href}`}
          site={site}
          item={item}
          navigationImages={navigationImages}
          onNavigate={onNavigate}
          onPointerEnter={(event) => trackHighlight(event.currentTarget)}
          onFocus={(event) => trackHighlight(event.currentTarget)}
          // The card's own fill is disabled — with both, the static one paints
          // over the moving one and the travel is invisible underneath it.
          className="relative h-36 hover:bg-transparent focus-visible:bg-transparent"
        />
      ))}
    </div>
  );
}

export function LivepeerOrgHeaderNav({
  site,
  navigationImages,
  onOpenChange,
}: {
  site: LivepeerOrgSite;
  navigationImages?: LivepeerOrgNavigationImages;
  onOpenChange?: (open: boolean) => void;
}) {
  const reduceMotion = useReducedMotion();
  const [activeTitle, setActiveTitle] = React.useState<string | null>(null);
  const [renderedTitle, setRenderedTitle] = React.useState("Network");

  // One highlight that slides along the trigger row, horizontally — the same
  // device as the login dropdown, which moves vertically between two items.
  // Per-trigger backgrounds would cross-fade, and with four triggers side by
  // side that reads as a flicker; a single element that travels gives the
  // highlight continuity, so the eye follows it instead of re-finding it.
 const closeTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const switchTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  // Mirrors activeTitle so openMenu can branch on the current state without
  // taking it as a dependency (which would re-create the handler each open).
  const activeRef = React.useRef<string | null>(null);
  // Full-bleed panel: one menu spans the viewport under the header and eases
  // its height to fit whichever group is active.
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [panelHeight, setPanelHeight] = React.useState<number | null>(null);
  // Gates the switch from an "auto" height target to the measured pixel one —
  // see the panel's `animate` prop. Reset on close so the next open unrolls to
  // "auto" again rather than to a height measured for a different group.
  const [openSettled, setOpenSettled] = React.useState(false);
  const renderedGroup = getLivepeerOrgHeaderGroup(
    site,
    renderedTitle as (typeof livepeerOrgHeaderGroups)[number]
  );
  const renderedLinks = renderedGroup
    ? getLivepeerOrgHeaderLinks(renderedGroup)
    : [];

  // Height is animated from a measured value rather than framer's `layout`
  // prop: `layout` morphs via transform scale, which visibly distorts the
  // contents mid-animation.
  const measureHeight = React.useCallback(() => {
    if (contentRef.current) setPanelHeight(contentRef.current.offsetHeight);
  }, []);

  React.useLayoutEffect(() => {
    activeRef.current = activeTitle;
    if (activeTitle) measureHeight();
    else setOpenSettled(false);
  }, [activeTitle, renderedTitle, measureHeight]);

  React.useEffect(() => {
    if (!activeTitle) return;
    window.addEventListener("resize", measureHeight);
    return () => window.removeEventListener("resize", measureHeight);
  }, [activeTitle, measureHeight]);

  const cancelClose = React.useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  // Opening from closed is immediate; switching between groups while the panel
  // is already open waits out a short hover-intent delay so sweeping the cursor
  // across the triggers settles on the final one instead of firing a
  // transition per trigger passed.
  const openMenu = React.useCallback(
    (title: string) => {
      cancelClose();
      if (switchTimer.current) {
        clearTimeout(switchTimer.current);
        switchTimer.current = null;
      }
      if (activeRef.current === title) return;
      if (activeRef.current === null) {
        setRenderedTitle(title);
        setActiveTitle(title);
        return;
      }
      switchTimer.current = setTimeout(() => {
        setRenderedTitle(title);
        setActiveTitle(title);
      }, 60);
    },
    [cancelClose]
  );

  const scheduleClose = React.useCallback(() => {
    cancelClose();
    if (switchTimer.current) {
      clearTimeout(switchTimer.current);
      switchTimer.current = null;
    }
    closeTimer.current = setTimeout(() => setActiveTitle(null), 100);
  }, [cancelClose]);

  React.useEffect(() => {
    return () => {
      cancelClose();
      if (switchTimer.current) clearTimeout(switchTimer.current);
    };
  }, [cancelClose]);

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveTitle(null);
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  React.useEffect(() => {
    if (!activeTitle) return;

    const onScroll = () => setActiveTitle(null);

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [activeTitle]);

  React.useLayoutEffect(() => {
    onOpenChange?.(activeTitle !== null);
  }, [activeTitle, onOpenChange]);

  return (
    <>
      <nav
        // -my-6/py-6: the triggers are 16px of text, so without this the row
        // that responds to the pointer is a 16px strip inside a 64px header,
        // with ~25px of dead space below it. The highlight pill is 32px tall,
        // so the thing you can see was twice the height of the thing you could
        // hover — and drifting a few pixels vertically while moving sideways
        // left the nav, which reset the highlight and turned the next move into
        // a fresh placement instead of a slide. Padding makes the hit area the
        // full header row; the negative margin keeps layout unchanged.
        className="relative z-10 -my-6 hidden items-center gap-0 py-6 lg:flex"
        aria-label="Site sections"
        onPointerEnter={cancelClose}
        onPointerLeave={scheduleClose}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) scheduleClose();
        }}
      >
        {headerItems.map((title) => {
          if (title === "Foundation") {
            return (
              <Button
                key={title}
                variant="ghost"
                nativeButton={false}
                render={<Link href={getLivepeerOrgFoundationHref(site)} />}
                onPointerEnter={() => setActiveTitle(null)}
                onFocus={() => setActiveTitle(null)}
                className="h-auto rounded-sm px-3 py-0 leading-none font-normal text-muted-foreground transition-colors hover:bg-transparent hover:text-foreground active:translate-y-0 dark:hover:bg-transparent"
              >
                Foundation
              </Button>
            );
          }

          const group = getLivepeerOrgHeaderGroup(site, title);
          if (!group) return null;

          return (
            <Button
              key={group._key}
              variant="ghost"
              aria-haspopup="true"
              aria-controls="livepeer-header-menu"
              aria-expanded={activeTitle === title}
              onPointerEnter={() => openMenu(title)}
              onFocus={() => openMenu(title)}
              onClick={() => openMenu(title)}
              className="h-auto rounded-sm px-3 py-0 leading-none font-normal text-muted-foreground transition-colors hover:bg-transparent hover:text-foreground active:translate-y-0 aria-expanded:bg-transparent aria-expanded:text-foreground dark:hover:bg-transparent"
            >
              {group.title}
            </Button>
          );
        })}
      </nav>

      {/* Full-bleed panel: spans the viewport under the header, revealing by
          height and cross-fading its contents between groups. Anchored at
          top-0 so the panel background sits behind the header too; content is
          padded past the 4rem header row. */}
      <AnimatePresence>
        {activeTitle && (
          <motion.div
            key="livepeer-nav-panel"
            // The panel is welded to the header edge, so it reveals by
            // unrolling rather than fading or flying in. Height is the single
            // animated property throughout — it opens, resizes between groups,
            // and closes — so one gesture always means "this is how much
            // content there is". Opacity is front-loaded (120ms) so the surface
            // is solid while it unrolls; fading and growing at once reads mushy.
            initial={{ opacity: 0, height: 0 }}
            // "auto" until the opening animation has finished, then the
            // measured pixel height. panelHeight is null on the very first
            // open — nothing has been measured yet — so this used to animate
            // toward "auto" and then get re-targeted to a number the moment
            // the layout effect measured, mid-flight. Framer restarts the
            // animation on a changed target, and that restart is the stutter
            // you only ever see the first time. Switching to pixels after the
            // open lands keeps group-to-group resizing animated, which is what
            // the measurement is for.
            animate={{
              opacity: 1,
              height: openSettled && panelHeight !== null ? panelHeight : "auto",
            }}
            onAnimationComplete={() => setOpenSettled(true)}
            exit={{
              opacity: 0,
              height: 0,
              transition: reduceMotion
                ? { duration: 0 }
                : { duration: 0.18, ease: [0.4, 0, 1, 1] },
            }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : {
                    height: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
                    opacity: { duration: 0.12 },
                  }
            }
            onPointerEnter={cancelClose}
            onPointerLeave={scheduleClose}
            id="livepeer-header-menu"
            aria-label={`${renderedTitle} menu`}
            className="absolute top-0 left-1/2 z-0 hidden w-screen -translate-x-1/2 overflow-hidden border-b border-border bg-background/95 text-foreground backdrop-blur-xl lg:block"
          >
            {/* Max width and gutter on the same element, as elsewhere — with
                the constraint on the inner grid instead, the menu measured the
                full padded width and ran wider than the rest of the page. */}
            <div
              ref={contentRef}
              className="relative mx-auto w-full max-w-page px-4 pt-20 pb-8 sm:px-6 lg:px-10"
            >
              {/* mode="popLayout" pulls the outgoing group out of the layout
                    flow so it can cross-fade under the incoming one instead of
                    hard-cutting, and without inflating the measured height. */}
              <AnimatePresence initial={false} mode="popLayout">
                <motion.div
                  key={renderedTitle}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : { duration: 0.2, ease: [0.22, 1, 0.36, 1] }
                  }
                >
                  <LivepeerOrgNavItemGrid
                    site={site}
                    links={renderedLinks}
                    navigationImages={navigationImages}
                    onNavigate={() => setActiveTitle(null)}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
