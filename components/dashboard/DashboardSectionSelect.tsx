"use client";

import { useEffect, useRef, useState, type ElementType } from "react";
import { Check, ChevronDown } from "lucide-react";

interface SectionOption<T extends string> {
  key: T;
  label: string;
  icon: ElementType;
}

interface DashboardSectionSelectProps<T extends string> {
  sections: readonly SectionOption<T>[];
  activeKey: T;
  onChange: (key: T) => void;
  ariaLabel?: string;
  /** Only render below this breakpoint. Defaults to lg. */
  hideAt?: "md" | "lg";
  className?: string;
}

/**
 * Mobile section-picker — tab-style trigger that expands into a menu.
 *
 * Reads as a nav tab (icon + label + chevron, baseline underline) rather
 * than a form dropdown. Matches the inline-tab pattern on the model detail
 * page so the three mobile nav surfaces share the same visual language.
 *
 * The trigger is minimal; the menu below is a framed card for clear
 * affordance when selecting.
 */
export default function DashboardSectionSelect<T extends string>({
  sections,
  activeKey,
  onChange,
  ariaLabel = "Section",
  hideAt = "lg",
  className = "",
}: DashboardSectionSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const active = sections.find((s) => s.key === activeKey) ?? sections[0];
  const ActiveIcon = active.icon;
  const hideClass = hideAt === "lg" ? "lg:hidden" : "md:hidden";

  const handleSelect = (key: T) => {
    onChange(key);
    setOpen(false);
  };

  return (
    <nav
      aria-label={ariaLabel}
      className={`${hideClass} border-b border-white/[0.08] ${className}`}
    >
      <div ref={rootRef} className="relative">
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label={ariaLabel}
          onClick={() => setOpen((v) => !v)}
          className="flex h-11 w-full items-center gap-2 px-5 text-left text-sm text-white transition-colors hover:text-white/80 focus:outline-none"
        >
          <ActiveIcon
            className="h-4 w-4 shrink-0 text-green-bright"
            aria-hidden="true"
          />
          <span className="min-w-0 flex-1 truncate font-semibold">
            {active.label}
          </span>
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-white/40 transition-transform duration-150 ${
              open ? "rotate-180" : ""
            }`}
            aria-hidden="true"
          />
        </button>

        {open && (
          <ul
            role="listbox"
            aria-label={ariaLabel}
            className="absolute left-3 right-3 top-full z-50 mt-1 max-h-80 overflow-auto rounded-lg border border-white/[0.08] bg-dark-card/95 p-1 shadow-lg shadow-black/30 backdrop-blur-xl"
          >
            {sections.map(({ key, label, icon: Icon }) => {
              const selected = key === activeKey;
              return (
                <li key={key}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => handleSelect(key)}
                    className={`flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-sm transition-colors ${
                      selected
                        ? "bg-white/[0.06] text-white"
                        : "text-white/70 hover:bg-white/[0.04] hover:text-white"
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 shrink-0 ${
                        selected ? "text-green-bright" : "text-white/40"
                      }`}
                      aria-hidden="true"
                    />
                    <span className="flex-1 text-left font-medium">{label}</span>
                    {selected && (
                      <Check className="h-3.5 w-3.5 shrink-0 text-green-bright" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </nav>
  );
}
