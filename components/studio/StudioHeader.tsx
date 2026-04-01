"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ExternalLink,
  Home,
  Grid2X2,
  Code,
  BarChart3,
  Search,
  LogOut,
  ChevronDown,
  Key,
  Settings,
} from "lucide-react";
import { LivepeerWordmark } from "@/components/icons/LivepeerLogo";
import { useAuth } from "@/components/studio/AuthContext";

// ─── Tabs ───

const TABS = [
  { id: "home", label: "Home", icon: Home },
  { id: "explore", label: "Explore", icon: Grid2X2 },
  { id: "api", label: "API", icon: Code },
  { id: "statistics", label: "Statistics", icon: BarChart3 },
];

// ─── Tab label for breadcrumb ───

function getTabLabel(tabId: string): string {
  const tab = TABS.find((t) => t.id === tabId);
  return tab?.label ?? tabId;
}

// ─── Breadcrumb ───

function Breadcrumb({
  activeTab,
  modelName,
}: {
  activeTab: string;
  modelName?: string;
}) {
  const Separator = () => (
    <span className="mx-3 text-lg text-white/40 select-none">/</span>
  );

  return (
    <div className="flex items-center text-sm">
      <Link
        href="/"
        aria-label="Livepeer home"
        className="transition-colors text-white hover:text-white focus:outline-none rounded"
      >
        <LivepeerWordmark className="h-3.5 w-auto" aria-hidden="true" />
      </Link>
      <Separator />
      <Link
        href="/studio"
        className="transition-colors text-green-bright font-medium hover:text-green-bright"
      >
        Studio
      </Link>
      {modelName ? (
        <>
          <Separator />
          <Link
            href="/studio?tab=explore"
            className="transition-colors text-white/40 hover:text-white"
          >
            Explore
          </Link>
          <Separator />
          <span className="text-white/60 truncate max-w-[200px]">
            {modelName}
          </span>
        </>
      ) : (
        <>
          <Separator />
          <span className="text-white/60">
            {getTabLabel(activeTab)}
          </span>
        </>
      )}
    </div>
  );
}

// ─── Search (cmd+K) ───

function SearchInput({ onSearch }: { onSearch?: (query: string) => void }) {
  const [focused, setFocused] = useState(false);
  const [query, setQuery] = useState("");

  // cmd+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        document.getElementById("studio-search")?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="relative hidden md:block">
      <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/40" />
      <input
        id="studio-search"
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          onSearch?.(e.target.value);
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        aria-label="Search models"
        placeholder="Search models..."
        className={`w-64 rounded-lg border bg-white/[0.03] py-2 pl-9 pr-12 text-sm text-white placeholder:text-white/40 transition-all focus:outline-none ${
          focused
            ? "border-white/15 bg-white/[0.05] w-80"
            : "border-white/[0.08]"
        }`}
      />
      {!focused && (
        <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5 font-mono text-[10px] text-white/40">
          <span className="hidden mac:inline">⌘</span>
          <span className="mac:hidden">Ctrl+</span>K
        </kbd>
      )}
    </div>
  );
}

// ─── User Menu ───

function UserMenu({
  onTabChange,
}: {
  onTabChange: (tab: string) => void;
}) {
  const { isConnected, user, connect, disconnect } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleQuickConnect = useCallback(() => {
    connect({
      name: "Demo User",
      email: "demo@livepeer.org",
      initials: "DU",
    });
  }, [connect]);

  if (isConnected && user) {
    return (
      <div className="relative flex items-center gap-2">
        {/* Credits badge */}
        <div className="hidden sm:flex items-center gap-1 rounded-md border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-xs">
          <span className="text-white/50">Credits:</span>
          <span className="font-mono text-white/60">$0.00</span>
        </div>

        {/* Avatar */}
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          aria-expanded={showDropdown}
          aria-haspopup="true"
          aria-label="User menu"
          className="flex items-center gap-1.5 rounded-lg px-1.5 py-1 transition-colors hover:bg-white/[0.06] focus:outline-none"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-green-bright/20 text-[10px] font-bold text-green-bright">
            {user.initials}
          </div>
          <ChevronDown className="h-3 w-3 text-white/40" />
        </button>

        {/* Dropdown */}
        {showDropdown && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowDropdown(false)}
            />
            <div role="menu" className="absolute right-0 top-full z-50 mt-2 w-52 rounded-xl border border-white/[0.08] bg-dark-card/95 p-1 shadow-xl backdrop-blur-xl">
              <div className="px-3 py-2">
                <p className="text-xs font-medium text-white/70">{user.name}</p>
                <p className="text-[11px] text-white/50">{user.email}</p>
              </div>
              <div className="h-px bg-white/[0.06] mx-1" />
              <button
                role="menuitem"
                onClick={() => {
                  onTabChange("api");
                  setShowDropdown(false);
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-white/60 transition-colors hover:bg-white/[0.06] focus:outline-none"
              >
                <Key className="h-3.5 w-3.5" />
                API Keys
              </button>
              <button
                role="menuitem"
                onClick={() => setShowDropdown(false)}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-white/60 transition-colors hover:bg-white/[0.06] focus:outline-none"
              >
                <Settings className="h-3.5 w-3.5" />
                Settings
              </button>
              <div className="h-px bg-white/[0.06] mx-1" />
              <button
                role="menuitem"
                onClick={() => {
                  disconnect();
                  setShowDropdown(false);
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-red-400/80 transition-colors hover:bg-white/[0.06] focus:outline-none"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign out
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleQuickConnect}
        className="rounded-lg px-3 py-1.5 text-sm text-white/60 transition-colors hover:bg-white/[0.06] hover:text-white/70 focus:outline-none"
      >
        Log in
      </button>
      <button
        onClick={handleQuickConnect}
        className="rounded-lg border border-green-bright/30 bg-green-bright/10 px-4 py-1.5 text-sm font-medium text-green-bright transition-all hover:border-green-bright/50 hover:bg-green-bright/20 hover:shadow-md hover:shadow-green-bright/10"
      >
        Get Started
      </button>
    </div>
  );
}

// ─── Main Header ───

export default function StudioHeader({
  activeTab,
  onTabChange,
  modelName,
  onSearch,
}: {
  activeTab: string;
  onTabChange: (tab: string) => void;
  modelName?: string;
  onSearch?: (query: string) => void;
}) {
  return (
    <header className="sticky top-0 z-40">
      {/* Skip navigation */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-green focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to main content
      </a>
      {/* ── Row 1: Identity bar ── */}
      <div className="relative flex h-[58px] items-center justify-between border-b border-white/[0.06] bg-dark/60 px-5 backdrop-blur-xl">
        {/* Left: Breadcrumb */}
        <Breadcrumb activeTab={activeTab} modelName={modelName} />

        {/* Right: Search + Actions */}
        <div className="flex items-center gap-2">
          <SearchInput onSearch={onSearch} />
          <a
            href="https://docs.livepeer.org"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-white/50 transition-colors hover:bg-white/[0.06] hover:text-white/70 focus:outline-none"
          >
            Docs
            <ExternalLink className="h-2.5 w-2.5 opacity-60" />
          </a>
          <UserMenu onTabChange={onTabChange} />
        </div>
      </div>

      {/* ── Row 2: Tab navigation ── */}
      <div className="relative border-b border-white/[0.06] bg-dark/40 backdrop-blur-md">
        <nav className="flex gap-0.5 px-5" role="tablist" aria-label="Studio sections">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                aria-controls={`tabpanel-${tab.id}`}
                onClick={() => onTabChange(tab.id)}
                className={`relative flex items-center gap-1.5 px-4 py-2.5 text-sm transition-all duration-200 focus:outline-none rounded ${
                  isActive
                    ? "font-medium text-white"
                    : "text-white/50 hover:text-white/70"
                }`}
              >
                <tab.icon
                  className={`h-3.5 w-3.5 ${
                    isActive ? "text-green-bright" : ""
                  }`}
                />
                {tab.label}
                {isActive && (
                  <span className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full bg-green-bright" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom glow line */}
      <div className="h-px bg-gradient-to-r from-transparent via-green-bright/15 to-transparent" />
    </header>
  );
}
