"use client";

import { useEffect, useRef, useState, type ElementType } from "react";

export interface SubNavTab {
  key: string;
  label: string;
  icon?: ElementType;
}

interface DashboardSubNavProps {
  tabs: readonly SubNavTab[];
  activeKey: string;
  onChange: (key: string) => void;
  /** Label for aria-label on the nav element. */
  ariaLabel?: string;
  /** Only render below this breakpoint. Defaults to lg (matches existing sidebar pattern). */
  hideAt?: "md" | "lg";
  /** Extra classes merged onto the <nav> root (margins, padding, etc.). */
  className?: string;
}

/**
 * Compact mobile sub-navigation.
 *
 * Single-row tab strip with icon + label at every breakpoint. When the tab
 * set outgrows the viewport the strip scrolls horizontally, and fade
 * gradients on whichever edge(s) currently have hidden content signal the
 * overflow. The active tab auto-scrolls into view so the user never lands on
 * a hidden selection. Hidden above `hideAt:` — the desktop equivalent
 * (inline tabs or sidebar) takes over.
 */
export default function DashboardSubNav({
  tabs,
  activeKey,
  onChange,
  ariaLabel = "Section",
  hideAt = "lg",
  className = "",
}: DashboardSubNavProps) {
  const hideClass = hideAt === "lg" ? "lg:hidden" : "md:hidden";
  const activeTabRef = useRef<HTMLButtonElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  // Edge fades only appear when the corresponding side has hidden content. Tracking
  // both overflow + scroll position so we can drop a fade the moment the user reaches
  // that end — leaving a fade up at the boundary would falsely imply more to scroll.
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(false);

  // Scroll the active tab into view when it changes — covers both direct clicks
  // and route-driven activeKey changes (e.g. when ?tab= is set via URL).
  useEffect(() => {
    activeTabRef.current?.scrollIntoView({
      inline: "center",
      block: "nearest",
      behavior: "smooth",
    });
  }, [activeKey]);

  // Track scroll position + overflow to decide which edge fades render.
  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;

    const update = () => {
      const hasOverflow = strip.scrollWidth > strip.clientWidth + 1;
      // +1 tolerance for sub-pixel rounding at the ends
      setShowLeftFade(hasOverflow && strip.scrollLeft > 1);
      setShowRightFade(
        hasOverflow &&
          strip.scrollLeft < strip.scrollWidth - strip.clientWidth - 1,
      );
    };

    update();
    strip.addEventListener("scroll", update, { passive: true });
    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(strip);
    return () => {
      strip.removeEventListener("scroll", update);
      resizeObserver.disconnect();
    };
  }, [tabs]);

  return (
    <nav
      aria-label={ariaLabel}
      role="tablist"
      className={`${hideClass} relative border-b border-white/[0.08] ${className}`}
    >
      <div
        ref={stripRef}
        className="scrollbar-none flex items-center gap-x-1 overflow-x-auto sm:gap-x-5"
      >
        {tabs.map(({ key, label, icon: Icon }) => {
          const active = key === activeKey;
          return (
            <button
              key={key}
              ref={active ? activeTabRef : undefined}
              type="button"
              role="tab"
              aria-selected={active}
              aria-current={active ? "page" : undefined}
              onClick={() => onChange(key)}
              className={`-mb-px flex h-11 shrink-0 items-center gap-2 whitespace-nowrap border-b-2 px-3 text-sm transition-colors sm:px-0 ${
                active
                  ? "border-green-bright font-semibold text-white"
                  : "border-transparent font-medium text-white/55 hover:text-white/90"
              }`}
            >
              {Icon && (
                <Icon
                  className={`h-4 w-4 ${
                    active ? "text-green-bright" : "text-white/40"
                  }`}
                  aria-hidden="true"
                />
              )}
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      {/* Edge fade cues — only on the side(s) where content is currently hidden. */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute left-0 top-0 h-full w-8 bg-gradient-to-r from-dark to-transparent transition-opacity duration-150 sm:hidden ${
          showLeftFade ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-dark to-transparent transition-opacity duration-150 sm:hidden ${
          showRightFade ? "opacity-100" : "opacity-0"
        }`}
      />
    </nav>
  );
}
