"use client";

import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

export type ThemeChoice = "system" | "light" | "dark";

/** Written by both this component and the pre-paint script in the layout. */
export const THEME_STORAGE_KEY = "theme";

const OPTIONS: { value: ThemeChoice; label: string; Icon: typeof SunIcon }[] = [
  { value: "system", label: "System", Icon: MonitorIcon },
  { value: "light", label: "Light", Icon: SunIcon },
  { value: "dark", label: "Dark", Icon: MoonIcon },
];

function resolve(choice: ThemeChoice): "light" | "dark" {
  if (choice !== "system") return choice;
  return window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

/**
 * Both hooks, because the site runs two stylesheets during the migration: the
 * registry theme keys off the `dark` class, and the quarantined legacy CSS
 * (the primer, and anything not yet migrated) keys off `html[data-theme]`.
 * Setting only one leaves half the page in the other theme. The data attribute
 * retires with the legacy layer.
 */
function apply(choice: ThemeChoice) {
  const resolved = resolve(choice);
  const root = document.documentElement;
  root.setAttribute("data-theme", resolved);
  root.classList.toggle("dark", resolved === "dark");
}

function read(): ThemeChoice {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "system" || stored === "light" || stored === "dark") {
      return stored;
    }
  } catch {
    // Private mode, or storage disabled. Fall through to the default.
  }
  return "system";
}

/**
 * System / Light / Dark, as a segmented control.
 *
 * Three states rather than a two-way switch: "system" is a real preference,
 * not the absence of one, and a binary toggle silently opts everyone out of
 * following their OS the first time they touch it.
 *
 * No context and no provider — the component owns its own state and writes
 * straight to documentElement (CLAUDE.md → no global state). Nothing else on
 * the site needs to read the theme; the CSS does that.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const [choice, setChoice] = useState<ThemeChoice>("system");
  // The server cannot know what is in localStorage, so the selected segment is
  // unknown until after hydration. Rendering nothing as selected for that beat
  // is honest; guessing would flash the wrong pill.
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = read();
    setChoice(stored);
    setMounted(true);
    // Re-assert after hydration. React can reconcile away attributes the
    // pre-paint script set on <html> even with suppressHydrationWarning, which
    // would silently revert the theme a moment after load.
    apply(stored);
  }, []);

  // Follow the OS live while "system" is selected — otherwise the setting only
  // takes effect on the next page load, which reads as broken.
  useEffect(() => {
    if (choice !== "system") return;
    const query = window.matchMedia("(prefers-color-scheme: light)");
    const onChange = () => apply("system");
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, [choice]);

  const select = (next: ThemeChoice) => {
    setChoice(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Preference won't persist, but the page still changes. Better than
      // refusing to switch.
    }
    apply(next);
  };

  return (
    <div
      role="group"
      aria-label="Theme"
      className={cn(
        "inline-flex items-center gap-0.5 rounded-sm border border-border p-0.5",
        className
      )}
    >
      {OPTIONS.map(({ value, label, Icon }) => {
        const active = mounted && choice === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => select(value)}
            aria-pressed={active}
            aria-label={`${label} theme`}
            title={label}
            className={cn(
              "relative flex size-8 cursor-pointer items-center justify-center rounded-sm transition-colors",
              // The drawn control stays 32px so it sits in proportion to the
              // 12px copyright beside it, but the touch target is extended to
              // 44px tall by a transparent pseudo-element. The three buttons
              // tile horizontally, so only the vertical axis was short.
              "after:absolute after:inset-x-0 after:-inset-y-1.5 after:content-['']",
              "focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:outline-none",
              active
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="size-3.5" aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}
