"use client";

import { CheckIcon, SearchIcon, XIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** The unfiltered pseudo-category. Never stored — empty selection means All. */
export const ALL_CATEGORIES = "All";

/**
 * The site's one search-and-filter control, shared by the ecosystem catalogue
 * and the blog index.
 *
 * Both mockups draw the same thing: a single button under the page title that
 * opens a panel holding the query field and the category list. Keeping it in
 * one place is not just deduplication — two catalogues on one site that filter
 * differently is a bug users feel before they can name it.
 *
 * Controlled: the parent owns query and selection, because it also owns the
 * filtering, the result count, and the empty state.
 */
export function CatalogueSearch({
  label,
  categories,
  query,
  onQueryChange,
  selected,
  onToggleCategory,
  onClearAll,
}: {
  /** Doubles as the trigger label, the panel's accessible name, and the
      field's placeholder — one control, one name. */
  label: string;
  categories: string[];
  query: string;
  onQueryChange: (value: string) => void;
  selected: string[];
  onToggleCategory: (name: string) => void;
  onClearAll: () => void;
}) {
  const [open, setOpen] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Open puts the caret straight in the field — the trigger says "Search", so
  // requiring a second click to type would be a broken promise.
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Escape and outside-click both close, and Escape returns focus to the
  // trigger so keyboard users aren't dropped at the top of the document.
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (
        !panelRef.current?.contains(target) &&
        !triggerRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  // Live filters, surfaced as removable chips beside the trigger so the
  // resting page still says what is being shown once the panel is closed —
  // and can be undone without reopening it. One chip per category, so any
  // single one can be dropped without clearing the rest.
  const activeFilters = useMemo(() => {
    const filters = selected.map((name) => ({
      key: `category:${name}`,
      label: name,
      clear: () => onToggleCategory(name),
    }));
    if (query.trim()) {
      filters.push({
        key: "query",
        label: query.trim(),
        clear: () => onQueryChange(""),
      });
    }
    return filters;
  }, [onQueryChange, onToggleCategory, query, selected]);

  return (
    // The panel is absolutely positioned so opening it overlays the content
    // below rather than pushing it down, as in the mockup. It is centred with
    // inset-x-0 + mx-auto rather than left-1/2 + -translate-x-1/2, because the
    // enter animation animates `transform` — a translate centring would be
    // overwritten mid-flight and the panel would jump sideways as it opened.
    <div
      className={cn(
        "relative z-30 flex items-center justify-center gap-2",
        open && "[&>*:not([role=dialog])]:opacity-0"
      )}
    >
      <Button
        ref={triggerRef}
        variant="ghost"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={label}
        // Once a filter is live the label gives way to the chips, leaving the
        // icon as the affordance — so the row reads as "search, and here is
        // what you filtered by" rather than repeating itself.
        className="h-11 w-auto justify-center gap-2 rounded-sm px-4"
      >
        <SearchIcon className="size-4" aria-hidden="true" />
        {activeFilters.length === 0 && (
          <span className="text-muted-foreground">{label}</span>
        )}
      </Button>

      {/* Each live filter as a removable chip. Separate buttons rather than
          one combined control: clearing the category shouldn't also throw away
          a typed query. */}
      {activeFilters.map((filter) => (
        <span
          key={filter.key}
          className="inline-flex h-8 max-w-56 items-center gap-1.5 rounded-sm bg-secondary pr-1.5 pl-3 text-sm text-secondary-foreground"
        >
          <span className="truncate">{filter.label}</span>
          <button
            type="button"
            onClick={filter.clear}
            aria-label={`Clear ${filter.label} filter`}
            className="flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <XIcon className="size-3.5" aria-hidden="true" />
          </button>
        </span>
      ))}

      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label={label}
          // Matches the mockup's reveal: opacity 0→1 with a 0.985 scale from
          // the top edge, ~150ms ease-out. Deliberately small — the panel
          // should appear, not spring.
          // The border is ours: the mockup is on white where shadow alone
          // reads, but on black a shadow is invisible and the panel would have
          // no edge.
          className="absolute inset-x-0 -top-4 mx-auto w-full max-w-2xl origin-top animate-in overflow-hidden rounded-sm border border-border bg-popover p-2 shadow-xl duration-150 ease-out fade-in-0 zoom-in-[0.985] sm:-top-5"
        >
          <div className="flex items-center gap-2 px-2">
            <SearchIcon
              className="size-4 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              // Enter commits and closes. Results already update as you type,
              // so the panel has nothing left to offer once you have finished
              // typing — and it is covering the results you just filtered.
              // Focus goes back to the trigger so the keyboard path continues
              // where it left off.
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  setOpen(false);
                  triggerRef.current?.focus();
                }
              }}
              placeholder={label}
              aria-label={label}
              className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <button
              type="button"
              onClick={() => {
                onClearAll();
                setOpen(false);
                triggerRef.current?.focus();
              }}
              aria-label="Close search"
              className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <XIcon className="size-4" aria-hidden="true" />
            </button>
          </div>

          {/* Three columns so the full set is visible without scrolling, which
              is the point of putting them here.

              Multi-select, so the panel stays open on click — closing after
              each pick would make choosing three categories cost three round
              trips. aria-pressed carries the toggle state, and the tick makes
              it visible rather than relying on weight alone, which is easy to
              miss across three columns. */}
          <ul className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 p-2 sm:grid-cols-3">
            {categories.map((name) => {
              const isAll = name === ALL_CATEGORIES;
              const active = isAll
                ? selected.length === 0
                : selected.includes(name);
              return (
                <li key={name}>
                  <button
                    type="button"
                    onClick={() => onToggleCategory(name)}
                    aria-pressed={active}
                    className={cn(
                      "flex w-full cursor-pointer items-center gap-1.5 rounded-sm py-1.5 text-left text-sm transition-colors hover:text-foreground",
                      active
                        ? "font-medium text-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    <CheckIcon
                      className={cn(
                        "size-3.5 shrink-0",
                        active ? "opacity-100" : "opacity-0"
                      )}
                      aria-hidden="true"
                    />
                    <span className="truncate">{name}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
