"use client";

import Link from "next/link";
import {
  House,
  LayoutGrid,
  BarChart3,
  BookOpen,
  ExternalLink,
  MessageCircle,
  FileText,
} from "lucide-react";
import Drawer from "@/components/ui/Drawer";
import { EXTERNAL_LINKS } from "@/lib/constants";

interface DashboardMobileDrawerProps {
  id?: string;
  open: boolean;
  onClose: () => void;
  isConnected: boolean;
  onSignIn: () => void;
}

type Section = {
  label: string;
  items: Array<{
    label: string;
    href: string;
    icon: typeof House;
    external?: boolean;
    onClick?: () => void;
  }>;
};

const BROWSE_SECTION: Section = {
  label: "Browse",
  items: [
    { label: "Home", href: "/dashboard", icon: House },
    { label: "Explore", href: "/dashboard/explore", icon: LayoutGrid },
    { label: "Stats", href: "/dashboard/stats", icon: BarChart3 },
  ],
};

const RESOURCES_SECTION: Section = {
  label: "Resources",
  items: [
    {
      label: "Documentation",
      href: "https://docs.livepeer.org",
      icon: BookOpen,
      external: true,
    },
    {
      label: "Changelog",
      href: "https://docs.livepeer.org/changelog",
      icon: FileText,
      external: true,
    },
    {
      label: "Discord",
      href: EXTERNAL_LINKS.discord,
      icon: MessageCircle,
      external: true,
    },
  ],
};

export default function DashboardMobileDrawer({
  id,
  open,
  onClose,
  isConnected,
  onSignIn,
}: DashboardMobileDrawerProps) {
  // Account section moved to header avatar dropdown — drawer is nav-only
  const sections: Section[] = [BROWSE_SECTION, RESOURCES_SECTION];

  return (
    <Drawer id={id} open={open} onClose={onClose} ariaLabel="Menu">
      {/* Grouped navigation sections — account is handled by the header avatar */}
      <nav className="px-3 py-2" aria-label="Menu">
        {sections.map((section, idx) => (
          <div
            key={section.label}
            className={idx > 0 ? "mt-2 border-t border-white/[0.04] pt-2" : ""}
          >
            <p className="px-3 pb-1 pt-2 text-[10px] font-medium uppercase tracking-wider text-white/30">
              {section.label}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const content = (
                  <>
                    <Icon
                      className="h-4 w-4 shrink-0 text-white/40"
                      aria-hidden="true"
                    />
                    <span className="flex-1">{item.label}</span>
                    {item.external && (
                      <ExternalLink
                        className="h-3 w-3 shrink-0 text-white/20"
                        aria-hidden="true"
                      />
                    )}
                  </>
                );
                const className =
                  "flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] text-white/80 transition-colors hover:bg-white/[0.06] hover:text-white active:bg-white/[0.1]";
                return (
                  <li key={item.label}>
                    {item.external ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={onClose}
                        className={className}
                      >
                        {content}
                      </a>
                    ) : (
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className={className}
                      >
                        {content}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Sign in / Sign up — only when logged out */}
      {!isConnected && (
        <div className="border-t border-white/[0.06] px-3 py-3">
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onSignIn();
              }}
              className="flex w-full items-center justify-center rounded-lg bg-green px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-light active:bg-green-dark"
            >
              Sign up
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onSignIn();
              }}
              className="flex w-full items-center justify-center rounded-lg border border-white/[0.08] px-4 py-2.5 text-sm text-white/70 transition-colors hover:bg-white/[0.06] hover:text-white"
            >
              Sign in
            </button>
          </div>
        </div>
      )}
    </Drawer>
  );
}
