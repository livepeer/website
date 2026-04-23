"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { House, LayoutGrid, BarChart3, BookOpen, ExternalLink, Search, ChevronDown, Settings, Key, LogOut, Menu } from "lucide-react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { LivepeerWordmark, LivepeerSymbol } from "@/components/icons/LivepeerLogo";
import { PORTAL_NAV_ITEMS } from "@/lib/constants";
import { useAuth } from "@/components/dashboard/AuthContext";
import DashboardSearch from "@/components/dashboard/DashboardSearch";
import DashboardMobileDrawer from "@/components/dashboard/DashboardMobileDrawer";
import Drawer from "@/components/ui/Drawer";
import Badge from "@/components/ui/Badge";
import { getModelById } from "@/lib/dashboard/mock-data";

/**
 * Developer Dashboard header — full-width app bar, zero props.
 * Consumes AuthContext directly.
 *
 * Scroll states:
 *   0–20px   : default glass  (bg-dark/40 backdrop-blur-md border-b border-white/[0.06])
 *   20-100px : scrolled glass (bg-dark/80 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/20)
 *   >100px   : Row 1 hidden (-translate-y-full max-h-0 opacity-0),
 *              Row 2 morphs: prepends LivepeerSymbol + appends compact utility cluster
 */

// ─── Collapse animation configs ───

const COLLAPSE_SPRING = { type: "spring" as const, stiffness: 400, damping: 30, mass: 0.8 };

const utilitiesVariants = {
  hidden: { opacity: 0, x: 16 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 16 },
};

// ─── Avatar ───

function Avatar({ initials, size = "sm" }: { initials: string; size?: "sm" | "md" }) {
  const dims = size === "md" ? "h-8 w-8 text-xs" : "h-5 w-5 text-[10px]";
  return (
    <span
      className={`inline-flex items-center justify-center rounded-md bg-green-bright/15 font-semibold text-green-bright ring-1 ring-green-bright/25 ${dims}`}
      aria-hidden="true"
    >
      {initials || "?"}
    </span>
  );
}

// ─── AvatarMenu — self-contained dropdown, renders the trigger button + panel ───
// Accepts connect/disconnect from parent; keeps its own open/ref state.

interface MockUser {
  name: string;
  email: string;
  initials: string;
}

interface AvatarMenuProps {
  user: MockUser;
  disconnect: () => void;
  /** compact=true → smaller trigger (no name label) for Row 2 */
  compact?: boolean;
  /** mobileMinimal=true → just a circle avatar, no chevron, no padding */
  mobileMinimal?: boolean;
}

const dropdownVariants = {
  hidden: { opacity: 0, scale: 0.95, y: -4 },
  visible: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: -4 },
};

function AvatarMenu({ user, disconnect, compact = false, mobileMinimal = false }: AvatarMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onMouseDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-label={`Account menu for ${user.name}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={
          mobileMinimal
            ? `relative flex h-9 w-9 items-center justify-center rounded-full transition-all duration-150 ${
                open ? "ring-2 ring-green-bright/30" : ""
              }`
            : `group flex items-center gap-2 rounded-lg px-2 py-1.5 transition-all duration-150 ${
                open ? "bg-white/[0.08]" : "hover:bg-white/[0.06]"
              }`
        }
      >
        {mobileMinimal ? (
          <Avatar initials={user.initials} size="md" />
        ) : (
          <>
            <Avatar initials={user.initials} />
            {!compact && (
              <span className="hidden lg:inline text-[13px] font-medium text-white/90">
                {user.name}
              </span>
            )}
            <ChevronDown
              className={`h-3.5 w-3.5 text-white/40 transition-transform duration-200 ${
                open ? "rotate-180" : ""
              }`}
            />
          </>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            aria-orientation="vertical"
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-full right-0 mt-2 w-64 origin-top-right rounded-xl border border-white/10 bg-dark/95 backdrop-blur-xl shadow-2xl shadow-black/40 z-[100] overflow-hidden"
          >
            {/* User info header */}
            <div className="px-4 py-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-3">
                <Avatar initials={user.initials} size="md" />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-white truncate">{user.name}</div>
                  <div className="text-xs text-white/55 truncate">{user.email}</div>
                </div>
              </div>
            </div>

            {/* Account links — Settings + API Tokens (high-frequency dev shortcut, Replicate pattern) */}
            <div className="py-1.5 px-1.5">
              {[
                { label: "Settings", href: "/dashboard/settings", icon: Settings },
                { label: "API Tokens", href: "/dashboard/settings?tab=tokens", icon: Key },
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-white/[0.06] hover:text-white transition-colors"
                >
                  <item.icon className="h-4 w-4 text-white/40" />
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-white/[0.06] py-1.5 px-1.5">
              <button
                type="button"
                role="menuitem"
                onClick={() => { disconnect(); setOpen(false); }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/50 hover:bg-red-500/10 hover:text-red-400 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Breadcrumb — Zone 1 left cluster ───

function Breadcrumb({ pathname }: { pathname: string }) {
  const segments = pathname.split("/").slice(2).filter(Boolean);

  // Special case: /dashboard/models/[id] → Explore / <Model name>
  let crumbs: { href: string; label: string; preserveCase?: boolean }[];
  if (segments[0] === "models" && segments[1]) {
    const model = getModelById(segments[1]);
    crumbs = [
      { href: "/dashboard/explore", label: "Explore" },
      {
        href: `/dashboard/models/${segments[1]}`,
        label: model?.name ?? segments[1].replace(/-/g, " "),
        preserveCase: !!model,
      },
    ];
  } else {
    crumbs = segments.map((segment, i) => ({
      href: "/dashboard/" + segments.slice(0, i + 1).join("/"),
      label: segment.replace(/-/g, " "),
    }));
  }

  return (
    <div className="flex items-center">
      {/* Crumb 1: Livepeer wordmark → / */}
      <Link
        href="/"
        aria-label="Livepeer home"
        className="flex items-center text-white"
      >
        <LivepeerWordmark className="h-3.5 w-auto" aria-hidden="true" />
      </Link>

      <span className="mx-2 select-none text-white/50">/</span>

      {/* Crumb 2: Developer Dashboard green pill → /dashboard */}
      <Link href="/dashboard">
        <Badge variant="app">Developer Dashboard</Badge>
      </Link>

      {/* Crumb 3+: nested route segments */}
      {crumbs.map((crumb) => (
        <span key={crumb.href} className="flex items-center">
          <span className="mx-2 select-none text-white/50">/</span>
          <Link
            href={crumb.href}
            className={`text-sm text-white/50 hover:text-white transition-colors ${
              crumb.preserveCase ? "" : "capitalize"
            }`}
          >
            {crumb.label}
          </Link>
        </span>
      ))}
    </div>
  );
}

// ─── Tab strip items ───

const TAB_ICONS = { House, LayoutGrid, BarChart3 } as const;

function getTabActive(itemHref: string, pathname: string): boolean {
  if (itemHref === "/dashboard") return pathname === "/dashboard";
  if (itemHref === "/dashboard/explore")
    return (
      pathname === "/dashboard/explore" ||
      pathname.startsWith("/dashboard/explore/") ||
      pathname.startsWith("/dashboard/models/")
    );
  return pathname.startsWith(itemHref);
}

function TabItems({ pathname }: { pathname: string }) {
  return (
    <>
      {PORTAL_NAV_ITEMS.map((item) => {
        const active = getTabActive(item.href, pathname);
        const Icon = TAB_ICONS[item.icon];
        return (
          <Link
            key={item.label}
            href={item.href}
            className={`flex items-center gap-2 select-none text-[15px] py-3 -mb-px border-b-2 transition-colors ${
              active
                ? "text-white border-green-bright font-medium"
                : "text-white/60 border-transparent hover:text-white"
            }`}
          >
            <Icon
              className={`h-4 w-4 ${active ? "text-white" : "text-white/40"}`}
              aria-hidden="true"
            />
            {item.label}
          </Link>
        );
      })}
      <a
        href="https://docs.livepeer.org"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 select-none text-[15px] py-3 -mb-px border-b-2 border-transparent text-white/60 transition-colors hover:text-white"
      >
        <BookOpen className="h-4 w-4 text-white/40" aria-hidden="true" />
        Docs
        <ExternalLink className="h-3 w-3 text-white/30" aria-hidden="true" />
      </a>
    </>
  );
}

// ─── Main Header ───

export default function DashboardHeader() {
  const { isConnected, user, disconnect } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const [scrollY, setScrollY] = useState(0);
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [accountDrawerOpen, setAccountDrawerOpen] = useState(false);

  // Scroll listener with hysteresis — collapse at 60px (Row 1 height), expand at 20px.
  // Row 1 is h-14 (56px) in normal flow. Once it scrolls off, collapse fires
  // and Row 2 gains the icon + utility cluster.
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrollY(y);
      setCollapsed((prev) => {
        if (!prev && y > 60) return true;    // scrolling DOWN past Row 1 → collapse
        if (prev && y < 20) return false;    // scrolling UP near top → expand
        return prev;                         // inside dead zone → stay
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrolled = scrollY > 20;
  // `collapsed` is now managed with hysteresis above

  // Row 1 fades out as it scrolls, cross-fading with the symbol in Row 2
  const row1Opacity = Math.max(0, Math.min(1, 1 - scrollY / 80));

  const glassHeavy = "bg-shell/85 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/20";
  const glassLight = "bg-shell/70 backdrop-blur-md border-b border-white/[0.08]";

  return (
    <>
      {/* Skip navigation — outside sticky rows so it's always reachable */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-green focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to main content
      </a>

      {/* ─── Row 1: identity / search / utility (desktop only, normal flow) ─── */}
      {/* NOT sticky — scrolls away naturally with the page. No collapse animation needed.
          z-20 so its dropdowns render above Row 2's z-10. */}
      <div
        style={{ opacity: row1Opacity }}
        className={`relative z-50 hidden lg:flex items-center gap-6 px-6 h-14 w-full transition-opacity duration-200 ${
          row1Opacity === 0 ? "pointer-events-none" : ""
        } ${scrolled ? glassHeavy : glassLight}`}
      >
        {/* Zone 1: Breadcrumb */}
        <Breadcrumb pathname={pathname} />

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right cluster: search + auth */}
        <div className="flex items-center gap-3">
          <DashboardSearch />
          {!isConnected ? (
            <>
              <button
                type="button"
                onClick={() => router.push("/dashboard/login")}
                className="text-sm text-white/60 transition-colors hover:text-white"
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => router.push("/dashboard/login")}
                className="select-none rounded-full bg-green px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-green-light active:bg-green-dark"
              >
                Sign up
              </button>
            </>
          ) : (
            user && <AvatarMenu user={user} disconnect={disconnect} />
          )}
        </div>
      </div>

      {/* ─── Row 2: tab strip — self-sticky, always glued to viewport top:0 ─── */}
      {/* When collapsed (scrollY > 150): gains LivepeerSymbol + compact utility cluster.
          z-10 keeps it below Row 1's dropdowns when both are visible at scroll top. */}
      <nav
        aria-label="Developer Dashboard"
        className={`sticky top-0 z-40 hidden lg:flex items-center px-6 h-12 w-full transition-[background-color,border-color,box-shadow,backdrop-filter] duration-300 ${
          scrolled || collapsed ? glassHeavy : glassLight
        }`}
      >
        <LayoutGroup>
          {/* Logo mark — fades in as Row 1 scrolls away, creating a brand handoff */}
          <motion.div
            animate={collapsed
              ? { opacity: 1, width: 28, marginRight: 16 }
              : { opacity: 0, width: 0, marginRight: 0 }
            }
            initial={false}
            transition={COLLAPSE_SPRING}
            className="flex items-center shrink-0 overflow-hidden"
          >
            <Link
              href="/"
              aria-label="Livepeer home"
              className="flex items-center shrink-0"
            >
              <LivepeerSymbol className="h-5 w-5 text-white" aria-hidden="true" />
            </Link>
          </motion.div>

          {/* Tabs — shift horizontally as a side effect of the logo's width
              interpolation (flex sibling reflow). No `layout` prop: it fought
              with the route-change reverse-collapse and caused visible slides. */}
          <div className="flex items-center gap-6">
            <TabItems pathname={pathname} />
          </div>

          {/* Compact utility cluster — slides in from right when collapsed */}
          <AnimatePresence initial={false}>
            {collapsed && (
              <motion.div
                key="collapsed-utilities"
                variants={utilitiesVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ ...COLLAPSE_SPRING, delay: 0.03 }}
                className="ml-auto flex items-center gap-3 shrink-0"
              >
                <button
                  type="button"
                  aria-label="Search"
                  onClick={() => {
                    const isMac = navigator.platform.toUpperCase().includes("MAC");
                    document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", [isMac ? "metaKey" : "ctrlKey"]: true }));
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-white/60 transition-colors hover:bg-white/[0.08] hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/20 focus-visible:ring-offset-1 focus-visible:ring-offset-dark"
                >
                  <Search className="h-4 w-4" />
                </button>

                {!isConnected ? (
                  <>
                    <button
                      type="button"
                      onClick={() => router.push("/dashboard/login")}
                      className="text-[13px] text-white/60 transition-colors hover:text-white"
                    >
                      Sign in
                    </button>
                    <button
                      type="button"
                      onClick={() => router.push("/dashboard/login")}
                      className="select-none rounded-full border border-white/15 bg-white/[0.04] px-3.5 py-1 text-[13px] font-medium text-white/70 transition-colors hover:bg-white/[0.08] hover:text-white"
                    >
                      Sign up
                    </button>
                  </>
                ) : (
                  user && <AvatarMenu user={user} disconnect={disconnect} compact />
                )}

              </motion.div>
            )}
          </AnimatePresence>
        </LayoutGroup>
      </nav>

      {/* ─── Mobile top bar: [symbol] [search] [avatar] [hamburger] ─── */}
      <div
        className={`sticky top-0 z-40 flex lg:hidden items-center gap-2 px-4 h-16 w-full ${
          scrolled ? glassHeavy : glassLight
        }`}
      >
        <Link
          href="/dashboard"
          aria-label="Developer Dashboard"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-white/[0.06]"
        >
          <LivepeerSymbol className="h-5 w-5 text-white" aria-hidden="true" />
        </Link>

        <div className="flex-1 min-w-0">
          <DashboardSearch mobile />
        </div>

        {/* Avatar — opens account drawer (only when signed in) */}
        {isConnected && user && (
          <button
            type="button"
            aria-label="Account"
            aria-expanded={accountDrawerOpen}
            aria-controls="dashboard-account-drawer"
            onClick={() => setAccountDrawerOpen(true)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-green-bright/15 text-sm font-semibold text-green-bright transition-colors hover:bg-green-bright/25 active:bg-green-bright/30"
          >
            {user.initials}
          </button>
        )}

        <button
          type="button"
          aria-label={drawerOpen ? "Close menu" : "Open menu"}
          aria-expanded={drawerOpen}
          aria-controls="dashboard-mobile-drawer"
          onClick={() => setDrawerOpen(true)}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-white/70 transition-colors hover:border-white/20 hover:bg-white/[0.05] hover:text-white active:bg-white/[0.1]"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      {/* ─── Mobile bottom-sheet drawer ─── */}
      <DashboardMobileDrawer
        id="dashboard-mobile-drawer"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        isConnected={isConnected}
        onSignIn={() => router.push("/dashboard/login")}
      />

      {/* ─── Mobile account drawer (avatar trigger) ─── */}
      {isConnected && user && (
        <Drawer
          id="dashboard-account-drawer"
          open={accountDrawerOpen}
          onClose={() => setAccountDrawerOpen(false)}
          ariaLabel="Account"
        >
          {/* User info */}
          <div className="border-b border-white/[0.06] px-5 py-4">
            <div className="flex items-center gap-3">
              <span
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-bright/15 text-sm font-semibold text-green-bright ring-1 ring-green-bright/25"
                aria-hidden="true"
              >
                {user.initials}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">{user.name}</p>
                <p className="truncate text-xs text-white/55">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Account links */}
          <nav className="px-3 py-2" aria-label="Account">
            <ul className="space-y-0.5">
              {[
                { label: "Settings", href: "/dashboard/settings", icon: Settings },
                { label: "API Tokens", href: "/dashboard/settings?tab=tokens", icon: Key },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    onClick={() => setAccountDrawerOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] text-white/80 transition-colors hover:bg-white/[0.06] hover:text-white active:bg-white/[0.1]"
                  >
                    <item.icon className="h-4 w-4 shrink-0 text-white/40" aria-hidden="true" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Sign out */}
          <div className="border-t border-white/[0.06] px-3 py-2">
            <button
              type="button"
              onClick={() => { disconnect(); setAccountDrawerOpen(false); }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] text-white/60 transition-colors hover:bg-red-500/10 hover:text-red-400 active:bg-red-500/15"
            >
              <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
              Sign out
            </button>
          </div>
        </Drawer>
      )}
    </>
  );
}
