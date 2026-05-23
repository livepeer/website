"use client";

import { useEffect, useState } from "react";

type ThemeChoice = "system" | "light" | "dark";

function readChoice(): ThemeChoice {
  if (typeof localStorage === "undefined") return "dark";
  try {
    const s = localStorage.getItem("theme");
    if (s === "system" || s === "light" || s === "dark") return s;
  } catch {}
  return "dark";
}

function applyChoice(choice: ThemeChoice) {
  const resolved: "light" | "dark" =
    choice === "system"
      ? window.matchMedia("(prefers-color-scheme: light)").matches
        ? "light"
        : "dark"
      : choice;
  document.documentElement.setAttribute("data-theme", resolved);
}

function SystemIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="h-3.5 w-3.5"
      aria-hidden="true"
    >
      <rect x="2" y="3" width="12" height="9" rx="1.5" />
      <path d="M5 14h6" strokeLinecap="round" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="h-3.5 w-3.5"
      aria-hidden="true"
    >
      <circle cx="8" cy="8" r="2.5" />
      <path
        d="M8 1.5v1.5M8 13v1.5M1.5 8h1.5M13 8h1.5M3.4 3.4l1 1M11.6 11.6l1 1M3.4 12.6l1-1M11.6 4.4l1-1"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="h-3.5 w-3.5"
      aria-hidden="true"
    >
      <path
        d="M12.5 9.7A5.5 5.5 0 0 1 6.3 3.5 5.5 5.5 0 1 0 12.5 9.7z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Segment({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Use ${label} theme`}
      aria-pressed={active}
      className={`relative flex h-7 w-7 cursor-pointer select-none items-center justify-center rounded-full transition-colors ${
        active
          ? "bg-foreground/10 text-foreground"
          : "text-foreground/40 hover:text-foreground/70"
      }`}
    >
      {children}
    </button>
  );
}

export default function ThemeToggle({
  className = "",
}: {
  className?: string;
}) {
  const [choice, setChoice] = useState<ThemeChoice>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const c = readChoice();
    setChoice(c);
    setMounted(true);
    // Re-apply the resolved theme to <html> after React hydrates. In
    // production builds React can reconcile attributes on <html> away
    // even with suppressHydrationWarning (the warning is suppressed but
    // the attribute reconciliation isn't always), which silently reverts
    // the data-theme that the inline pre-paint script set. Re-applying
    // here closes that race.
    applyChoice(c);
  }, []);

  // If user chose "system", track OS changes live.
  useEffect(() => {
    if (choice !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const handler = () => applyChoice("system");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [choice]);

  const select = (next: ThemeChoice) => {
    setChoice(next);
    try {
      localStorage.setItem("theme", next);
    } catch {}
    applyChoice(next);
  };

  // Use 'dark' as the highlighted segment until mounted to avoid SSR/CSR mismatch.
  const active = mounted ? choice : "dark";

  return (
    <div
      className={`inline-flex items-center gap-0 rounded-full border border-foreground/10 bg-foreground/[0.03] p-0.5 ${className}`}
      role="group"
      aria-label="Theme"
    >
      <Segment
        active={active === "system"}
        onClick={() => select("system")}
        label="system"
      >
        <SystemIcon />
      </Segment>
      <Segment
        active={active === "light"}
        onClick={() => select("light")}
        label="light"
      >
        <SunIcon />
      </Segment>
      <Segment
        active={active === "dark"}
        onClick={() => select("dark")}
        label="dark"
      >
        <MoonIcon />
      </Segment>
    </div>
  );
}
