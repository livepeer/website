"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LivepeerWordmark } from "@/components/icons/LivepeerLogo";
import { NAV_ITEMS } from "@/lib/constants";
import type { NavItem } from "@/lib/constants";

function NavLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  const active = pathname === item.href;

  if (!item.children) {
    return (
      <Link
        href={item.href}
        className={`select-none rounded-full px-3.5 py-1.5 text-sm transition-all ${
          active
            ? "bg-white/10 text-white font-medium"
            : "text-white/50 hover:text-white hover:bg-white/[0.06]"
        }`}
      >
        {item.label}
      </Link>
    );
  }

  const handleEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  };

  const handleLeave = () => {
    timeoutRef.current = setTimeout(() => setOpen(false), 150);
  };

  return (
    <div
      className="relative"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <button
        className={`cursor-pointer select-none flex items-center gap-1 rounded-full px-3.5 py-1.5 text-sm transition-all ${
          open
            ? "text-white bg-white/[0.06]"
            : "text-white/50 hover:text-white hover:bg-white/[0.06]"
        }`}
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        {item.label}
        <svg
          className={`h-3 w-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 12 12"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M3 5l3 3 3-3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-1/2 top-full z-50 pt-2 -translate-x-1/2">
          <div className="min-w-[220px] rounded-xl border border-white/10 bg-dark/95 p-1.5 shadow-xl shadow-black/30 backdrop-blur-xl">
            {item.children.map((child) => {
              const isExternal = child.external;
              const Tag = isExternal ? "a" : Link;
              const extraProps = isExternal
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {};

              return (
                <Tag
                  key={child.label}
                  href={child.href}
                  onClick={() => setOpen(false)}
                  className="select-none flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/60 transition-colors hover:bg-white/[0.06] hover:text-white"
                  {...extraProps}
                >
                  {child.label}
                  {isExternal && (
                    <svg
                      className="ml-auto h-3 w-3 text-white/30"
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
        </div>
      )}
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
      <header
        className={`fixed top-0 z-50 w-full transition-transform duration-300 ${headerHidden ? "-translate-y-full" : "translate-y-0"}`}
      >
        {/* Floating pill nav — Raycast-inspired */}
        <div className="mx-auto flex max-w-7xl items-center justify-center px-4 pt-4">
          <div
            className={`flex items-center gap-1.5 rounded-full border px-3 py-2 transition-all duration-300 ${
              scrolled
                ? "border-white/10 bg-dark/80 shadow-lg shadow-black/20 backdrop-blur-xl"
                : "border-white/[0.06] bg-dark/40 backdrop-blur-md"
            }`}
          >
            {/* Logo */}
            <Link
              href="/"
              className="flex flex-shrink-0 items-center rounded-full px-2 py-1 transition-colors hover:bg-white/5"
              aria-label="Livepeer home"
            >
              <LivepeerWordmark className="h-3.5 w-auto text-white" />
            </Link>

            {/* Separator */}
            <div className="mx-1 h-5 w-px bg-white/10" />

            {/* Desktop nav links */}
            <nav
              className="hidden items-center gap-0.5 md:flex"
              aria-label="Main"
            >
              {NAV_ITEMS.filter((item) => item.href !== "/").map((item) => (
                <NavLink key={item.label} item={item} pathname={pathname} />
              ))}
            </nav>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center ml-1">
              <Link
                href="/#early-access"
                className="inline-flex items-center rounded-full bg-white px-3.5 py-1.5 text-sm font-medium text-dark transition-colors hover:bg-white/90 active:bg-white/80 select-none"
              >
                Get Early Access
              </Link>
            </div>

            {/* Mobile hamburger */}
            <button
              className="cursor-pointer select-none relative flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-white/5 md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              <div className="flex flex-col items-center gap-[5px]">
                <span
                  className={`block h-[1.5px] w-4 bg-white/70 transition-all duration-200 ${
                    mobileOpen ? "translate-y-[6.5px] rotate-45" : ""
                  }`}
                />
                <span
                  className={`block h-[1.5px] w-4 bg-white/70 transition-all duration-200 ${
                    mobileOpen ? "opacity-0" : ""
                  }`}
                />
                <span
                  className={`block h-[1.5px] w-4 bg-white/70 transition-all duration-200 ${
                    mobileOpen ? "-translate-y-[6.5px] -rotate-45" : ""
                  }`}
                />
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile overlay — rendered outside header to avoid translate containing block */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[45] bg-dark/95 backdrop-blur-xl pt-20 md:hidden">
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
                          ? "bg-white/10 text-white font-medium"
                          : "text-white/50 hover:bg-white/5 hover:text-white"
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
                              className="select-none flex items-center gap-2 rounded-lg px-4 py-2.5 text-base text-white/50 transition-colors hover:bg-white/5 hover:text-white"
                              {...extraProps}
                            >
                              {child.label}
                              {isExternal && (
                                <svg
                                  className="h-3 w-3 text-white/30"
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
                      ? "bg-white/10 text-white font-medium"
                      : "text-white/50 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}

            {/* Mobile CTA */}
            <div className="mt-6 px-4">
              <Link
                href="/#early-access"
                onClick={() => setMobileOpen(false)}
                className="flex w-full items-center justify-center rounded-xl bg-green px-5 py-3 text-base font-medium text-white transition-colors hover:bg-green-light active:bg-green-dark select-none"
              >
                Get Early Access
              </Link>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
