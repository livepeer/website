"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Hammer,
  Globe,
  Plug,
  ChevronDown,
  ArrowUpRight,
} from "lucide-react";
import { LivepeerWordmark } from "@/components/icons/LivepeerLogo";
import { NAV_ITEMS } from "@/lib/constants";
import type { NavItem } from "@/lib/constants";
import Badge from "@/components/ui/Badge";

const APPS = [
  {
    label: "Explorer",
    subtitle: "Stake & Govern",
    href: "https://explorer.livepeer.org",
    external: true,
    icon: Globe,
    iconBg: "bg-blue/15",
    iconColor: "text-blue-bright",
  },
  {
    label: "Studio",
    subtitle: "Discover & Build",
    href: "/studio",
    external: false,
    icon: Hammer,
    iconBg: "bg-green/15",
    iconColor: "text-green-bright",
    badge: "Preview" as const,
  },
  {
    label: "Console",
    subtitle: "Operate & Extend",
    href: "https://naap-platform.vercel.app/login",
    external: true,
    icon: Plug,
    iconBg: "bg-purple/15",
    iconColor: "text-purple-bright",
    badge: "Preview" as const,
  },
];

function useHoverDropdown(delay = 150) {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  const handleEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  };

  const handleLeave = () => {
    timeoutRef.current = setTimeout(() => setOpen(false), delay);
  };

  return { open, setOpen, handleEnter, handleLeave };
}

function NavLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const { open, setOpen, handleEnter, handleLeave } = useHoverDropdown(150);
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
        <ChevronDown
          className={`h-3 w-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
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
                    <ArrowUpRight className="ml-auto h-3 w-3 text-white/30" />
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

const appsButtonStyle = (open: boolean) =>
  `outline-none transition-all duration-150 ${
    open
      ? "bg-white/90 text-dark scale-95"
      : "bg-white text-dark hover:bg-white/90 active:scale-95 active:bg-white/80"
  }`;

function AppsButton() {
  const { open, setOpen, handleEnter, handleLeave } = useHoverDropdown(200);

  return (
    <div
      className="relative"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium ${appsButtonStyle(open)}`}
      >
        <LayoutGrid className="h-3.5 w-3.5" />
        Apps
      </button>

      {open && (
        <div className="absolute left-1/2 top-full z-50 -translate-x-1/2 pt-2">
          <AppsDropdownContent onClose={() => setOpen(false)} />
        </div>
      )}
    </div>
  );
}

function MobileAppsButton() {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        buttonRef.current &&
        !buttonRef.current.contains(target) &&
        panelRef.current &&
        !panelRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <>
      <div className="relative ml-2" ref={buttonRef}>
        <button
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label="Apps"
          className={`flex h-8 w-8 items-center justify-center rounded-full ${appsButtonStyle(open)}`}
        >
          <LayoutGrid className="h-4 w-4" />
        </button>
      </div>

      {open &&
        createPortal(
          <div className="fixed left-4 right-4 top-[61px] z-50" ref={panelRef}>
            <AppsDropdownContent onClose={() => setOpen(false)} mobile />
          </div>,
          document.body,
        )}
    </>
  );
}

function AppsDropdownContent({
  onClose,
  mobile,
}: {
  onClose: () => void;
  mobile?: boolean;
}) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border border-white/10 bg-dark/95 shadow-2xl shadow-black/40 backdrop-blur-xl ${mobile ? "w-full" : "w-72"}`}
    >
      <div className="p-1.5">
        {APPS.map((app) => {
          const Tag = app.external ? "a" : Link;
          const extraProps = app.external
            ? { target: "_blank" as const, rel: "noopener noreferrer" }
            : {};

          return (
            <Tag
              key={app.label}
              href={app.href}
              onClick={onClose}
              className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-white/[0.06]"
              {...extraProps}
            >
              <div
                className={`flex ${mobile ? "h-10 w-10" : "h-8 w-8"} shrink-0 items-center justify-center rounded-lg ${app.iconBg} ${app.iconColor}`}
              >
                <app.icon className={mobile ? "h-5 w-5" : "h-4 w-4"} />
              </div>
              <div className="flex flex-1 flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-[13px] font-medium text-white">
                    {app.label}
                  </span>
                  {app.badge && <Badge variant="neutral">{app.badge}</Badge>}
                </div>
                <span className="text-[11px] text-white/50">
                  {app.subtitle}
                </span>
              </div>
              {app.external && (
                <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-white/20 transition-colors group-hover:text-white/40" />
              )}
            </Tag>
          );
        })}
      </div>
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
          {/* Desktop: standard pill nav */}
          <div
            className={`hidden md:flex items-center gap-1.5 rounded-full border px-3 py-2 transition-all duration-300 ${
              scrolled
                ? "border-white/10 bg-dark/80 shadow-lg shadow-black/20 backdrop-blur-xl"
                : "border-white/[0.06] bg-dark/40 backdrop-blur-md"
            }`}
          >
            <Link
              href="/"
              className="flex flex-shrink-0 items-center rounded-full px-2 py-1 transition-colors hover:bg-white/5"
              aria-label="Livepeer home"
            >
              <LivepeerWordmark className="h-3.5 w-auto text-white" />
            </Link>

            <div className="mx-1 h-5 w-px bg-white/10" />

            <nav className="flex items-center gap-0.5" aria-label="Main">
              {NAV_ITEMS.filter((item) => item.href !== "/").map((item) => (
                <NavLink key={item.label} item={item} pathname={pathname} />
              ))}
            </nav>

            <div className="flex items-center ml-1">
              <AppsButton />
            </div>
          </div>

          {/* Mobile: hamburger | logo | apps */}
          <div
            className={`flex md:hidden items-center justify-between rounded-full border px-2.5 py-1.5 transition-all duration-300 ${
              scrolled
                ? "border-white/10 bg-dark/80 shadow-lg shadow-black/20 backdrop-blur-xl"
                : "border-white/[0.06] bg-dark/40 backdrop-blur-md"
            }`}
          >
            <button
              className="cursor-pointer select-none relative flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-white/5"
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

            <div className="mx-1.5 h-5 w-px bg-white/10" />

            <Link
              href="/"
              className="flex flex-shrink-0 items-center rounded-full px-2 py-1 transition-colors hover:bg-white/5"
              aria-label="Livepeer home"
            >
              <LivepeerWordmark className="h-3.5 w-auto text-white" />
            </Link>

            <div className="mx-1.5 h-5 w-px bg-white/10" />

            <MobileAppsButton />
          </div>
        </div>
      </header>

      {/* Mobile overlay — nav only */}
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
                      <ChevronDown
                        className={`h-4 w-4 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
                      />
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
                                <ArrowUpRight className="h-3 w-3 text-white/30" />
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
          </nav>
        </div>
      )}
    </>
  );
}
