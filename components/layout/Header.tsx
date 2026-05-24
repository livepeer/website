"use client";

import { useState, useEffect, useRef, useLayoutEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LivepeerWordmark } from "@/components/icons/LivepeerLogo";
import { NAV_ITEMS } from "@/lib/constants";
import type { NavItem } from "@/lib/constants";

/**
 * Shared-dropdown desktop nav (x.ai/Vercel style).
 *
 * A single floating panel is rendered at the nav root and animated
 * between trigger positions when the user moves between items with
 * dropdowns. The panel's horizontal position, width, and height are
 * tweened via Framer Motion; content cross-fades when switching
 * triggers, so it never reads as two separate menus appearing/dismissing.
 *
 * Layout: triggers live in a horizontal flex row. We measure each
 * trigger's offset/width relative to the nav root, then drive the
 * panel's transform/width from the currently-active key.
 */
function DesktopNav({
  items,
  pathname,
  forceBlack,
}: {
  items: NavItem[];
  pathname: string;
  forceBlack: boolean;
}) {
  const navRef = useRef<HTMLDivElement>(null);
  const triggerRefs = useRef<Record<string, HTMLElement | null>>({});
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [activeRect, setActiveRect] = useState<{
    left: number;
    width: number;
  } | null>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const measure = (key: string | null) => {
    if (!key || !navRef.current) {
      setActiveRect(null);
      return;
    }
    const btn = triggerRefs.current[key];
    if (!btn) return;
    const nav = navRef.current.getBoundingClientRect();
    const r = btn.getBoundingClientRect();
    setActiveRect({ left: r.left - nav.left, width: r.width });
  };

  const openKey = (key: string) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setActiveKey(key);
    measure(key);
  };

  const scheduleClose = () => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    closeTimeoutRef.current = setTimeout(() => setActiveKey(null), 150);
  };

  // Clear any pending close-timeout when the component unmounts, so the
  // setState callback doesn't fire against a destroyed component.
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  // Re-measure when the active item changes layout (e.g. font-load reflow).
  useLayoutEffect(() => {
    if (activeKey) measure(activeKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeKey]);

  const activeItem = items.find((i) => i.label === activeKey);

  // Primer renders against pastel backgrounds — nav text must stay black.
  const activeColor = forceBlack
    ? "text-black font-medium"
    : "text-foreground font-medium";
  const idleColor = forceBlack
    ? "text-black/60 hover:text-black"
    : "text-foreground/60 hover:text-foreground";
  const openColor = forceBlack ? "text-black" : "text-foreground";

  return (
    <div
      ref={navRef}
      className="relative hidden md:block"
      onMouseLeave={scheduleClose}
    >
      <nav className="flex items-center gap-1" aria-label="Main">
        {items.map((item) => {
          const isActive = pathname === item.href;
          const isOpen = activeKey === item.label;

          if (!item.children) {
            return (
              <Link
                key={item.label}
                href={item.href}
                ref={(el) => {
                  triggerRefs.current[item.label] = el;
                }}
                onMouseEnter={() => {
                  if (closeTimeoutRef.current) {
                    clearTimeout(closeTimeoutRef.current);
                    closeTimeoutRef.current = null;
                  }
                  setActiveKey(null);
                }}
                className={`select-none px-3 py-1.5 text-sm transition-colors ${
                  isActive ? activeColor : idleColor
                }`}
              >
                {item.label}
              </Link>
            );
          }

          return (
            <button
              key={item.label}
              ref={(el) => {
                triggerRefs.current[item.label] = el;
              }}
              onMouseEnter={() => openKey(item.label)}
              onClick={() =>
                isOpen ? setActiveKey(null) : openKey(item.label)
              }
              aria-expanded={isOpen}
              className={`cursor-pointer select-none flex items-center gap-1 px-3 py-1.5 text-sm transition-colors ${
                isOpen ? openColor : idleColor
              }`}
            >
              {item.label}
              <svg
                className={`h-3 w-3 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 12 12"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  d="M3 5l3 3 3-3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          );
        })}
      </nav>

      <AnimatePresence>
        {activeItem && activeItem.children && activeRect && (
          <motion.div
            key="nav-dropdown"
            initial={{ opacity: 0, y: 4 }}
            animate={{
              opacity: 1,
              y: 0,
              x: activeRect.left + activeRect.width / 2,
            }}
            exit={{ opacity: 0, y: 4 }}
            transition={{
              opacity: { duration: 0.15 },
              y: { duration: 0.15 },
              x: { type: "spring", stiffness: 380, damping: 32 },
            }}
            onMouseEnter={() => openKey(activeItem.label)}
            onMouseLeave={scheduleClose}
            className="pointer-events-none absolute left-0 top-full z-50"
          >
            <div className="-translate-x-1/2 pt-2 pointer-events-auto">
            <motion.div
              layout
              transition={{
                layout: { type: "spring", stiffness: 380, damping: 32 },
              }}
              className="overflow-hidden rounded-xl border border-foreground/10 bg-background/95 shadow-xl shadow-black/30 backdrop-blur-xl"
            >
              <motion.div
                key={activeItem.label}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.12 }}
                className="min-w-[220px] p-1.5"
              >
                {activeItem.children.map((child) => {
                  const isExternal = child.external;
                  const Tag = isExternal ? "a" : Link;
                  const extraProps = isExternal
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {};

                  return (
                    <Tag
                      key={child.label}
                      href={child.href}
                      onClick={() => setActiveKey(null)}
                      className="select-none flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground/60 transition-colors hover:bg-foreground/[0.06] hover:text-foreground"
                      {...extraProps}
                    >
                      {child.label}
                      {isExternal && (
                        <svg
                          className="ml-auto h-3 w-3 text-foreground/30"
                          fill="none"
                          viewBox="0 0 12 12"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        >
                          <path
                            d="M3.5 2H10v6.5M10 2L2 10"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </Tag>
                  );
                })}
              </motion.div>
            </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [headerHidden, setHeaderHidden] = useState(false);
  const lastScrollY = useRef(0);
  const pathname = usePathname();
  const isPrimer = pathname === "/primer";

  useEffect(() => {
    if (!isPrimer) {
      setHeaderHidden(false);
      lastScrollY.current = 0;
    }
  }, [isPrimer]);

  useEffect(() => {
    const onScroll = () => {
      const currentY = window.scrollY;
      setScrolled(currentY > 20);

      if (isPrimer) {
        if (currentY < 50) {
          setHeaderHidden(false);
        } else if (currentY > lastScrollY.current + 5) {
          setHeaderHidden(true);
        } else if (currentY < lastScrollY.current - 5) {
          setHeaderHidden(false);
        }
        lastScrollY.current = currentY;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [isPrimer]);

  return (
    <>
      {/* x.ai-style fading backdrop blur — single layer pinned to the top
          edge with a multi-stop mask gradient so the blur tapers smoothly
          to nothing without a visible cutoff band. Lives OUTSIDE the
          <header> so the header's `translate-y-*` transform doesn't
          confine the backdrop-filter to its own box. */}
      <div
        aria-hidden="true"
        className={`pointer-events-none fixed inset-x-0 top-0 z-40 h-24 transition-opacity duration-200 ${
          headerHidden ? "opacity-0" : scrolled ? "opacity-100" : "opacity-70"
        }`}
        style={{
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          maskImage:
            "linear-gradient(to bottom, black 0%, black 40%, rgba(0,0,0,0.6) 65%, rgba(0,0,0,0.2) 85%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, black 0%, black 40%, rgba(0,0,0,0.6) 65%, rgba(0,0,0,0.2) 85%, transparent 100%)",
        }}
      />

      <header
        className={`fixed top-0 z-50 w-full transition-transform duration-300 ${headerHidden ? "-translate-y-full" : "translate-y-0"}`}
      >
        {/* Flat full-width header row — no pill, no background, no border.
            Logo + nav on the LEFT, Join Discord CTA on the RIGHT. Row
            height shrinks on scroll (x.ai pattern) so the content tucks
            closer to the top edge as you scroll. */}
        <div className="relative">
          <div
            className={`mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 transition-[height,padding] duration-200 lg:px-8 ${
              scrolled ? "py-2 lg:h-14" : "py-4 lg:h-20"
            }`}
          >
            {/* Left group — Logo + Nav */}
            <div className="flex items-center gap-10">
              <Link
                href="/"
                className="flex flex-shrink-0 items-center"
                aria-label="Livepeer home"
              >
                <LivepeerWordmark
                  className={`h-3.5 w-auto ${isPrimer ? "text-black" : "text-foreground"}`}
                />
              </Link>

              <DesktopNav
                items={NAV_ITEMS.filter((item) => item.href !== "/")}
                pathname={pathname}
                forceBlack={isPrimer}
              />
            </div>

            {/* Right group — CTA + mobile hamburger. The Discord CTA is
                hidden on the primer page, which has its own fixed
                "Chapters" button anchored to the right edge. */}
            <div className="flex items-center">
              {!isPrimer && (
                <a
                  href="https://discord.gg/livepeer"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden md:inline-flex items-center gap-1.5 rounded-full bg-foreground px-3.5 py-1.5 text-sm font-medium text-background transition-colors hover:bg-foreground/90 active:bg-foreground/80 select-none"
                >
                  Join Discord
                  <svg
                    className="h-3 w-3"
                    fill="none"
                    viewBox="0 0 12 12"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path
                      d="M3.5 2H10v6.5M10 2L2 10"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
              )}

              {/* Mobile hamburger */}
              <button
                className="cursor-pointer select-none relative flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-foreground/5 md:hidden"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileOpen}
              >
                <div className="flex flex-col items-center gap-[5px]">
                  <span
                    className={`block h-[1.5px] w-4 bg-foreground/70 transition-all duration-200 ${
                      mobileOpen ? "translate-y-[6.5px] rotate-45" : ""
                    }`}
                  />
                  <span
                    className={`block h-[1.5px] w-4 bg-foreground/70 transition-all duration-200 ${
                      mobileOpen ? "opacity-0" : ""
                    }`}
                  />
                  <span
                    className={`block h-[1.5px] w-4 bg-foreground/70 transition-all duration-200 ${
                      mobileOpen ? "-translate-y-[6.5px] -rotate-45" : ""
                    }`}
                  />
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile overlay — rendered outside header to avoid translate containing block */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[45] bg-background/95 backdrop-blur-xl pt-20 md:hidden">
          <nav className="flex flex-col gap-1 px-6" aria-label="Mobile">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href;

              if (item.children) {
                const expanded = mobileExpanded === item.label;
                return (
                  <div key={item.label}>
                    <button
                      onClick={() =>
                        setMobileExpanded(expanded ? null : item.label)
                      }
                      className={`cursor-pointer select-none flex w-full items-center justify-between rounded-xl px-4 py-3 text-lg transition-colors ${
                        expanded
                          ? "bg-foreground/10 text-foreground font-medium"
                          : "text-foreground/50 hover:bg-foreground/5 hover:text-foreground"
                      }`}
                    >
                      {item.label}
                      <svg
                        className={`h-4 w-4 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
                        fill="none"
                        viewBox="0 0 12 12"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          d="M3 5l3 3 3-3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                    {expanded && (
                      <div className="ml-4 mt-1 flex flex-col gap-0.5">
                        {item.children.map((child) => {
                          const isExternal = child.external;
                          const Tag = isExternal ? "a" : Link;
                          const extraProps = isExternal
                            ? {
                                target: "_blank" as const,
                                rel: "noopener noreferrer",
                              }
                            : {};

                          return (
                            <Tag
                              key={child.label}
                              href={child.href}
                              onClick={() => setMobileOpen(false)}
                              className="select-none flex items-center gap-2 rounded-lg px-4 py-2.5 text-base text-foreground/50 transition-colors hover:bg-foreground/5 hover:text-foreground"
                              {...extraProps}
                            >
                              {child.label}

                              {isExternal && (
                                <svg
                                  className="h-3 w-3 text-foreground/30"
                                  fill="none"
                                  viewBox="0 0 12 12"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                >
                                  <path
                                    d="M3.5 2H10v6.5M10 2L2 10"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              )}
                            </Tag>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`select-none rounded-xl px-4 py-3 text-lg transition-colors ${
                    active
                      ? "bg-foreground/10 text-foreground font-medium"
                      : "text-foreground/50 hover:bg-foreground/5 hover:text-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}

            {/* Mobile CTA */}
            <div className="mt-6 px-4">
              <a
                href="https://discord.gg/livepeer"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileOpen(false)}
                className="cta-primary flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-base font-medium text-white transition-all hover:brightness-110 active:brightness-95 select-none"
              >
                Join Discord
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 12 12"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path
                    d="M3.5 2H10v6.5M10 2L2 10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
