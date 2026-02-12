"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LivepeerTextmark } from "@/components/icons/LivepeerLogo";
import { NAV_ITEMS, EXTERNAL_LINKS } from "@/lib/constants";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed top-0 z-50 w-full">
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
            <LivepeerTextmark className="h-3.5 w-auto text-white" />
          </Link>

          {/* Separator */}
          <div className="mx-1 h-5 w-px bg-white/10" />

          {/* Desktop nav links */}
          <nav className="hidden items-center gap-0.5 md:flex" aria-label="Main">
            {NAV_ITEMS.filter((item) => item.href !== "/").map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-full px-3.5 py-1.5 text-sm transition-all ${
                    active
                      ? "bg-white/10 text-white font-medium"
                      : "text-white/50 hover:text-white hover:bg-white/[0.06]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Separator */}
          <div className="hidden mx-1 h-5 w-px bg-white/10 md:block" />

          {/* CTA */}
          <a
            href={EXTERNAL_LINKS.docs}
            className="hidden md:inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-sm font-medium text-dark transition-all hover:bg-white/90 active:bg-white/80"
          >
            Start Building
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 12 12"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                d="M2 6h8m0 0L7 3m3 3L7 9"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>

          {/* Mobile hamburger */}
          <button
            className="relative flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-white/5 md:hidden"
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

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-dark/95 backdrop-blur-xl pt-20 md:hidden">
          <nav className="flex flex-col gap-1 px-6" aria-label="Mobile">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-xl px-4 py-3 text-lg transition-colors ${
                    active
                      ? "bg-white/10 text-white font-medium"
                      : "text-white/50 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <div className="mt-4">
              <a
                href={EXTERNAL_LINKS.docs}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-medium text-dark transition-colors hover:bg-white/90"
              >
                Start Building
                <span aria-hidden="true">&rarr;</span>
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
