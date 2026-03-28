"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { Search, Plus, ArrowUpRight, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ECOSYSTEM_APPS, ECOSYSTEM_CATEGORIES } from "@/lib/ecosystem-data";
import PageHero from "@/components/ui/PageHero";
import Container from "@/components/ui/Container";
import SectionHeader from "@/components/ui/SectionHeader";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

const BATCH_SIZE = 12;

/* Collect tags grouped by category */
const TAGS_BY_CATEGORY: Record<string, string[]> = {};
for (const app of ECOSYSTEM_APPS) {
  for (const cat of app.categories) {
    if (!TAGS_BY_CATEGORY[cat]) TAGS_BY_CATEGORY[cat] = [];
    for (const tag of app.tags ?? []) {
      if (!TAGS_BY_CATEGORY[cat].includes(tag)) {
        TAGS_BY_CATEGORY[cat].push(tag);
      }
    }
  }
}

/* Categories that have tags get a dropdown chevron */
const CATEGORIES_WITH_TAGS = ECOSYSTEM_CATEGORIES.filter(
  (cat) => cat !== "All" && TAGS_BY_CATEGORY[cat]?.length > 0
);

function CategoryPill({
  category,
  isActive,
  activeTags,
  onToggle,
  onTagToggle,
}: {
  category: string;
  isActive: boolean;
  activeTags: string[];
  onToggle: () => void;
  onTagToggle: (tag: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const tags = TAGS_BY_CATEGORY[category];
  const hasTags = tags && tags.length > 0;
  const activeCount = activeTags.filter((t) => tags?.includes(t)).length;

  const closeDropdown = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        closeDropdown();
      }
    };
    /* Delay adding the listener so the opening click doesn't immediately close it */
    const frame = requestAnimationFrame(() => {
      document.addEventListener("mousedown", handler);
    });
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("mousedown", handler);
    };
  }, [open, closeDropdown]);

  /* "All" is a simple pill */
  if (category === "All") {
    return (
      <button
        type="button"
        onClick={onToggle}
        className={`cursor-pointer rounded-full px-4 py-1.5 font-mono text-xs font-medium transition-colors ${
          isActive
            ? "border border-green bg-green text-white"
            : "border border-white/10 text-white/50 hover:text-white/80"
        }`}
      >
        All
      </button>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={(e) => {
          /* If the click is on the chevron area (right 28px), toggle dropdown instead */
          if (hasTags) {
            const rect = (e.currentTarget as HTMLButtonElement).getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const chevronZone = rect.width - 28;
            if (clickX > chevronZone) {
              setOpen((prev) => !prev);
              return;
            }
          }
          onToggle();
        }}
        className={`cursor-pointer rounded-full py-1.5 pl-4 font-mono text-xs font-medium transition-colors flex items-center gap-1 ${
          hasTags ? "pr-2.5" : "pr-4"
        } ${
          isActive
            ? "border border-green bg-green text-white"
            : "border border-white/10 text-white/50 hover:text-white/80"
        }`}
      >
        <span>{category}</span>
        {activeCount > 0 && (
          <span className="inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-white/20 px-1 text-[10px]">
            {activeCount}
          </span>
        )}
        {hasTags && (
          <ChevronDown
            className={`ml-0.5 h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`}
          />
        )}
      </button>

      <AnimatePresence>
        {open && hasTags && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full z-50 mt-2 min-w-[180px] rounded-lg border border-dark-border bg-dark-card p-2 shadow-xl shadow-black/40"
          >
            {tags.map((tag) => {
              const checked = activeTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => onTagToggle(tag)}
                  className="flex w-full cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-1.5 text-xs font-mono transition-colors hover:bg-white/[0.04]"
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
                    {tag}
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

export default function EcosystemPage() {
  const [activeCategories, setActiveCategories] = useState<string[]>([]);
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [visible, setVisible] = useState(BATCH_SIZE);

  const isAllActive = activeCategories.length === 0;

  useEffect(() => {
    setVisible(BATCH_SIZE);
  }, [activeCategories, activeTags, search]);

  const handleCategoryToggle = (cat: string) => {
    if (cat === "All") {
      setActiveCategories([]);
      setActiveTags([]);
      return;
    }
    setActiveCategories((prev) => {
      const next = prev.includes(cat)
        ? prev.filter((c) => c !== cat)
        : [...prev, cat];
      /* If all specific categories are deselected, clear tags too */
      if (next.length === 0) setActiveTags([]);
      return next;
    });
  };

  const handleTagToggle = (tag: string) => {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const filtered = useMemo(() => {
    return ECOSYSTEM_APPS.filter((app) => {
      const matchesCategory =
        isAllActive || activeCategories.some((c) => app.categories.includes(c));
      const matchesTags =
        activeTags.length === 0 ||
        activeTags.some((t) => app.tags?.includes(t));
      const matchesSearch =
        !search ||
        app.name.toLowerCase().includes(search.toLowerCase()) ||
        app.description.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesTags && matchesSearch;
    });
  }, [activeCategories, activeTags, search, isAllActive]);

  const shown = filtered.slice(0, visible);
  const hasMore = visible < filtered.length;

  return (
    <PageHero>
      <div className="min-h-screen">
        <Container>
          <SectionHeader
            label="Ecosystem"
            title="Built on Livepeer"
            description="Explore what developers and teams are building with real-time video and AI inference on Livepeer."
            align="left"
            action={
              <Button
                href="/ecosystem/submit"
                variant="secondary"
                size="sm"
                className="shrink-0 backdrop-blur-sm text-white/60 hover:text-white/80"
              >
                <Plus className="h-3 w-3" />
                Submit App
              </Button>
            }
          />

          {/* Filter bar */}
          <div className="mt-8 flex flex-col gap-4 sm:mt-12 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <div
              className="flex flex-wrap gap-2 select-none"
              role="group"
              aria-label="Filter by category"
            >
              <CategoryPill
                category="All"
                isActive={isAllActive}
                activeTags={activeTags}
                onToggle={() => handleCategoryToggle("All")}
                onTagToggle={handleTagToggle}
              />
              {CATEGORIES_WITH_TAGS.map((cat) => (
                <CategoryPill
                  key={cat}
                  category={cat}
                  isActive={activeCategories.includes(cat)}
                  activeTags={activeTags}
                  onToggle={() => handleCategoryToggle(cat)}
                  onTagToggle={handleTagToggle}
                />
              ))}
            </div>

            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-white/50" />
              <input
                type="text"
                placeholder="Search"
                aria-label="Search ecosystem apps"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-md border border-white/[0.12] bg-white/[0.03] backdrop-blur-sm py-1.5 pl-9 pr-8 text-sm text-white/60 placeholder:text-white/30 transition-colors duration-200 focus:bg-white/[0.05] focus:border-white/20 focus:outline-none sm:w-56 select-none"
              />
              <AnimatePresence>
                {search && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, transition: { duration: 0.2 } }}
                    exit={{ opacity: 0, transition: { duration: 0.5 } }}
                    onClick={() => setSearch("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer text-white/50 transition-colors hover:text-white/80"
                    aria-label="Clear search"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      className="block"
                    >
                      <path
                        d="M5 5L15 15M15 5L5 15"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* App grid */}
          {shown.length > 0 ? (
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {shown.map((app, index) => (
                <motion.a
                  key={app.id}
                  href={app.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.5,
                    delay: (index % BATCH_SIZE) * 0.1,
                  }}
                  className="group flex flex-col rounded-2xl border border-dark-border bg-dark-card p-5 transition-colors hover:border-white/10 sm:p-6 select-none"
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl bg-white/[0.06]">
                      {app.logo ? (
                        <img
                          src={`/ecosystem/${app.logo}`}
                          alt={`${app.name} logo`}
                          className="h-10 w-10 object-contain"
                        />
                      ) : (
                        <span className="text-2xl font-semibold text-white/30">
                          {app.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-white/0 transition-colors group-hover:text-white/40" />
                  </div>
                  <h3 className="text-base font-semibold text-white transition-colors group-hover:text-green-light">
                    {app.name}
                  </h3>
                  <p className="mt-0.5 font-mono text-xs text-white/25">
                    {app.hostname}
                  </p>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-white/40">
                    {app.description}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {app.categories.map((cat) => (
                      <Badge key={cat} variant="category">
                        {cat}
                      </Badge>
                    ))}
                    {app.tags?.map((tag) => (
                      <Badge key={tag} variant="tag">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </motion.a>
              ))}
            </div>
          ) : (
            <div className="mt-16">
              <h3 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                No results found{search ? ` for \u201c${search}\u201d` : ""}
              </h3>
              <p className="mt-3 flex items-center gap-3 text-sm text-white/40">
                Try searching for another term.
                <button
                  onClick={() => {
                    setSearch("");
                    setActiveCategories([]);
                    setActiveTags([]);
                  }}
                  className="cursor-pointer rounded border border-white/10 px-3 py-1 text-xs font-medium text-white/50 transition-colors hover:border-white/20 hover:text-white/80"
                >
                  Clear search
                </button>
              </p>
              <motion.img
                src="/ecosystem/no-results.png"
                alt=""
                loading="eager"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.35 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mt-12 w-full max-w-sm select-none pointer-events-none"
              />
            </div>
          )}

          {hasMore && (
            <div className="mt-6 text-center">
              <button
                onClick={() => setVisible((v) => v + BATCH_SIZE)}
                className="cursor-pointer rounded-sm border border-white/10 px-6 py-2.5 text-sm font-medium text-white/50 transition-colors hover:border-white/20 hover:text-white/80"
              >
                View more
              </button>
            </div>
          )}
        </Container>
      </div>
    </PageHero>
  );
}
