"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FilterPillProps {
  label: string;
  isActive: boolean;
  onToggle: () => void;
  /** If provided, renders a chevron split-button and a dropdown with checkable items */
  dropdown?: {
    items: string[];
    activeItems: string[];
    onItemToggle: (item: string) => void;
  };
}

export default function FilterPill({
  label,
  isActive,
  onToggle,
  dropdown,
}: FilterPillProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const closeDropdown = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        closeDropdown();
      }
    };
    const frame = requestAnimationFrame(() => {
      document.addEventListener("mousedown", handler);
    });
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("mousedown", handler);
    };
  }, [open, closeDropdown]);

  const activeCount = dropdown
    ? dropdown.activeItems.filter((t) => dropdown.items.includes(t)).length
    : 0;

  const pillBase =
    "cursor-pointer font-mono text-xs font-medium transition-colors";
  const pillColors = isActive
    ? "border border-green bg-green text-white"
    : "border border-white/10 text-white/50 hover:text-white/80";

  /* Simple pill — no dropdown */
  if (!dropdown) {
    return (
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={isActive}
        className={`${pillBase} ${pillColors} rounded-full px-4 py-1.5`}
      >
        {label}
      </button>
    );
  }

  /* Split-button pill with dropdown */
  return (
    <div ref={ref} className="relative">
      <div className={`${pillColors} flex items-center rounded-full`}>
        <button
          type="button"
          onClick={onToggle}
          aria-pressed={isActive}
          className={`${pillBase} flex items-center gap-1 rounded-l-full py-1.5 pl-4 pr-2`}
        >
          <span>{label}</span>
          {activeCount > 0 && (
            <span className="inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-white/20 px-1 text-[10px]">
              {activeCount}
            </span>
          )}
        </button>
        <span
          className={`h-3 w-px ${isActive ? "bg-white/25" : "bg-white/10"}`}
          aria-hidden="true"
        />
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
          aria-haspopup="true"
          aria-label={`${label} tags`}
          className={`${pillBase} rounded-r-full py-1.5 pl-1.5 pr-2.5`}
        >
          <ChevronDown
            className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full z-50 mt-2 min-w-[180px] rounded-lg border border-dark-border bg-dark-card p-2 shadow-xl shadow-black/40"
          >
            {dropdown.items.map((item) => {
              const checked = dropdown.activeItems.includes(item);
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => dropdown.onItemToggle(item)}
                  className="flex w-full cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-1.5 font-mono text-xs transition-colors hover:bg-white/[0.04]"
                >
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                      checked
                        ? "border-green bg-green"
                        : "border-white/20 bg-white/[0.04]"
                    }`}
                  >
                    {checked && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path
                          d="M1 4L3.5 6.5L9 1"
                          stroke="white"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </span>
                  <span className={checked ? "text-white/80" : "text-white/50"}>
                    {item}
                  </span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
