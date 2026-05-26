"use client";

import { useEffect } from "react";

/**
 * Forces `data-theme="dark"` on `<html>` for the entire Foundation route,
 * regardless of the user's theme preference. The Foundation page is an
 * editorial composition built around a green→blue aurora, halftone overlay,
 * and dark Venn glow — atmospheric design that doesn't gracefully invert.
 *
 * The page body itself is wrapped in `theme-dark` so its content always
 * renders dark, but the global Header and Footer live outside the page
 * component (in the root layout), so they need this html-level override
 * to stay dark alongside the rest of the page.
 *
 * On unmount (when the user navigates away), the previous theme is
 * restored from localStorage / system preference so other routes resume
 * the user's chosen theme.
 *
 * Initial-paint coverage is handled by a check in the pre-paint inline
 * script in `app/layout.tsx`, so there's no light-mode flash on first
 * load. This effect handles client-side navigation into the route.
 */
export default function ForceDarkTheme() {
  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute("data-theme", "dark");

    // ThemeToggle re-applies the user's stored theme on mount as a
    // production hydration safeguard, which would race with our
    // pre-paint script and silently flip the foundation page back to
    // light. A MutationObserver lets us actively enforce dark — if
    // anything (ThemeToggle, user clicking the toggle, etc.) writes a
    // different value while we're on /foundation, we put it back.
    const observer = new MutationObserver(() => {
      if (html.getAttribute("data-theme") !== "dark") {
        html.setAttribute("data-theme", "dark");
      }
    });
    observer.observe(html, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => {
      observer.disconnect();
      // Restore the user's preferred theme on unmount.
      try {
        const stored = localStorage.getItem("theme");
        let restored: string;
        if (stored === "system") {
          restored = window.matchMedia("(prefers-color-scheme: light)").matches
            ? "light"
            : "dark";
        } else if (stored === "light" || stored === "dark") {
          restored = stored;
        } else {
          restored = "dark";
        }
        html.setAttribute("data-theme", restored);
      } catch {
        html.setAttribute("data-theme", "dark");
      }
    };
  }, []);

  return null;
}
