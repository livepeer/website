"use client";

import Link from "next/link";
import { LayoutGrid, Hammer, Globe, Plug, ArrowUpRight } from "lucide-react";
import Badge from "@/components/ui/Badge";
import { useHoverDropdown } from "@/components/dashboard/useHoverDropdown";

/**
 * Dashboard-scoped duplicate of the marketing header's Apps launcher.
 * Duplicated (not imported) so the marketing header stays untouched.
 */

const appsButtonStyle = (open: boolean) =>
  `outline-none transition-all duration-150 ${
    open
      ? "bg-white/90 text-dark scale-95"
      : "bg-white text-dark hover:bg-white/90 active:scale-95 active:bg-white/80"
  }`;

export function AppsButton({ compact = false }: { compact?: boolean }) {
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
        aria-label="Apps"
        className={`inline-flex cursor-pointer items-center ${compact ? "gap-0 rounded-full p-1.5" : "gap-1.5 rounded-full px-3.5 py-1.5"} text-sm font-medium ${appsButtonStyle(open)}`}
      >
        <LayoutGrid className="h-3.5 w-3.5" />
        {!compact && "Apps"}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-3">
          <AppsDropdownContent onClose={() => setOpen(false)} />
        </div>
      )}
    </div>
  );
}

function AppsDropdownContent({ onClose }: { onClose: () => void }) {
  const apps = [
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
      label: "Developer Dashboard",
      subtitle: "Discover & Build",
      href: "/dashboard",
      external: false,
      icon: Hammer,
      iconBg: "bg-green/15",
      iconColor: "text-green-bright",
      badge: "Preview",
    },
    {
      label: "Console",
      subtitle: "Operate & Extend",
      href: "https://naap-platform.vercel.app/login",
      external: true,
      icon: Plug,
      iconBg: "bg-purple/15",
      iconColor: "text-purple-bright",
      badge: "Preview",
    },
  ];

  return (
    <div className="w-72 overflow-hidden rounded-2xl border border-white/10 bg-dark/95 shadow-2xl shadow-black/40 backdrop-blur-xl">
      <div className="p-1.5">
        {apps.map((app) => {
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
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${app.iconBg} ${app.iconColor}`}
              >
                <app.icon className="h-4 w-4" />
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
