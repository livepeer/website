"use client";

import { Suspense, useState, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  LayoutGrid,
  List,
  Flame,
  Snowflake,
  X,
  ArrowDown,
  ArrowUp,
  Star,
  Search,
  SlidersHorizontal,
  Zap,
} from "lucide-react";
import { MODELS } from "@/lib/dashboard/mock-data";
import Button from "@/components/ui/Button";
import SearchInput from "@/components/ui/SearchInput";
import Drawer from "@/components/ui/Drawer";
import Select from "@/components/ui/Select";
import { getModelIcon, formatRuns, formatPrice } from "@/lib/dashboard/utils";
import { useStarredModels } from "@/lib/dashboard/useStarredModels";
import DashboardFooter from "@/components/dashboard/DashboardFooter";
import ModelCard from "@/components/dashboard/ModelCard";
import type { Model, ModelCategory } from "@/lib/dashboard/types";

const VALID_CATEGORIES: ModelCategory[] = [
  "Video Generation",
  "Video Editing",
  "Video Understanding",
  "Live Transcoding",
  "Image Generation",
  "Speech",
  "Language",
];

// ─── Constants ───

type AvailabilityFilter = "all" | "warm" | "cold";

const VIDEO_CATEGORIES: { label: ModelCategory; icon: ReturnType<typeof getModelIcon> }[] = [
  { label: "Video Generation", icon: getModelIcon("Video Generation") },
  { label: "Video Editing", icon: getModelIcon("Video Editing") },
  { label: "Video Understanding", icon: getModelIcon("Video Understanding") },
  { label: "Live Transcoding", icon: getModelIcon("Live Transcoding") },
];

const OTHER_CATEGORIES: { label: ModelCategory; icon: ReturnType<typeof getModelIcon> }[] = [
  { label: "Image Generation", icon: getModelIcon("Image Generation") },
  { label: "Speech", icon: getModelIcon("Speech") },
  { label: "Language", icon: getModelIcon("Language") },
];

const SORT_OPTIONS = [
  { value: "recommended", label: "Recommended" },
  { value: "latency", label: "Latency" },
  { value: "uptime", label: "Uptime" },
  { value: "price", label: "Price" },
  { value: "recent", label: "New" },
];

const PRICE_BUCKETS = 20;

// ─── Badges ───

function StatusBadge({ status }: { status: "hot" | "cold" }) {
  if (status === "hot") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-warm-subtle px-2 py-0.5 text-[11px] font-medium text-warm">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-warm opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-warm" />
        </span>
        Warm
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-blue/10 px-2 py-0.5 text-[11px] font-medium text-blue-bright">
      <Snowflake className="h-2.5 w-2.5" />
      Cold
    </span>
  );
}

// ─── Empty State ───

function ExploreEmptyState({
  onClearFilters,
}: {
  onClearFilters: () => void;
}) {
  return (
    <div className="flex flex-col items-center py-24 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.02]">
        <Search className="h-5 w-5 text-white/30" />
      </div>
      <h3 className="mt-6 text-xl font-semibold tracking-tight text-white">
        No capabilities match your filters
      </h3>
      <p className="mt-2 max-w-sm text-sm text-white/50">
        Try loosening your filters — the network is open.
      </p>
      <div className="mt-6 flex flex-col items-center gap-3">
        <Button onClick={onClearFilters} variant="secondary" size="sm">
          Clear filters
        </Button>
        <div className="font-mono text-xs">
          <span className="text-white/40">Missing something? </span>
          <a
            href="https://docs.livepeer.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-bright underline decoration-green-bright/40 underline-offset-4 transition-colors hover:text-green-light hover:decoration-green-bright"
          >
            Publish a capability
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── List Item ───

function ModelListItem({ model }: { model: Model }) {
  const Icon = getModelIcon(model.category);

  return (
    <Link
      href={`/dashboard/models/${model.id}`}
      className="group flex w-full items-center gap-4 border-b border-white/[0.04] px-5 py-4 text-left transition-colors hover:bg-dark-surface"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] transition-colors group-hover:bg-white/[0.08]">
        {model.coverImage ? (
          <img
            src={model.coverImage}
            alt=""
            className="h-full w-full rounded-xl object-cover"
          />
        ) : (
          <Icon className="h-5 w-5 text-white/40" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-semibold text-white group-hover:text-green-bright transition-colors">
          {model.name}
          {model.precision && (
            <span className="ml-1.5 rounded bg-white/[0.06] px-1.5 py-0.5 text-[11px] font-normal text-white/50">
              {model.precision}
            </span>
          )}
        </p>
        <p className="text-xs text-white/50 truncate">
          {model.provider}
        </p>
      </div>

      <div className="hidden items-center gap-2 sm:flex">
        <span className="inline-flex items-center gap-1.5 rounded-md bg-white/[0.05] px-2.5 py-1 text-xs text-white/50">
          <span className="h-1.5 w-1.5 rounded-full bg-white/30" />
          {model.category}
        </span>
        <StatusBadge status={model.status} />
      </div>

      <div className="w-40 shrink-0 text-right">
        <p className="font-mono text-xs font-medium text-white/60">{formatPrice(model)}</p>
        <p className="font-mono text-[11px] text-white/40">
          {formatRuns(model.runs7d)} runs
        </p>
      </div>
    </Link>
  );
}

// ─── Price Range Filter ───

function buildPriceHistogram(models: Model[]) {
  const prices = models.map((m) => m.pricing.amount);
  const maxPrice = Math.max(...prices, 0.01);
  const bucketSize = maxPrice / PRICE_BUCKETS;
  const buckets = Array.from({ length: PRICE_BUCKETS }, (_, i) => ({
    range: +(bucketSize * (i + 1)).toFixed(4),
    count: 0,
  }));
  for (const p of prices) {
    const idx = Math.min(Math.floor(p / bucketSize), PRICE_BUCKETS - 1);
    buckets[idx].count++;
  }
  return { buckets, maxPrice };
}

function PriceRangeFilter({
  min,
  max,
  onChange,
  models,
}: {
  min: number;
  max: number;
  onChange: (min: number, max: number) => void;
  models: Model[];
}) {
  const { buckets, maxPrice } = useMemo(() => buildPriceHistogram(models), [models]);
  const minPrice = (min / 100) * maxPrice;
  const maxPriceValue = (max / 100) * maxPrice;

  const minBucketIdx = Math.min(
    Math.floor((min / 100) * PRICE_BUCKETS),
    PRICE_BUCKETS - 1,
  );
  const maxBucketIdx = Math.min(
    Math.floor((max / 100) * PRICE_BUCKETS),
    PRICE_BUCKETS - 1,
  );

  const isFiltered = min > 0 || max < 100;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between px-3">
        <p className="text-xs font-medium uppercase tracking-wider text-white/30">
          Price Range
        </p>
        {isFiltered && (
          <button
            type="button"
            onClick={() => onChange(0, 100)}
            className="flex items-center gap-1 text-[11px] text-white/50 transition-colors hover:text-white/60"
          >
            <X className="h-3 w-3" />
            Clear
          </button>
        )}
      </div>
      <div className="px-3">
      <div className="flex h-12 items-end gap-px">
        {buckets.map((bucket, i) => {
          const maxCount = Math.max(...buckets.map((b) => b.count), 1);
          const height = bucket.count > 0 ? Math.max((bucket.count / maxCount) * 100, 8) : 0;
          const active = i >= minBucketIdx && i <= maxBucketIdx;
          return (
            <div
              key={i}
              className="flex-1 transition-colors duration-150"
              style={{
                height: `${height}%`,
                backgroundColor: active
                  ? "rgba(64, 191, 134, 0.5)"
                  : "rgba(255, 255, 255, 0.06)",
              }}
            />
          );
        })}
      </div>
      <div className="relative mt-1 h-5">
        <div className="absolute inset-x-0 top-1/2 h-[2px] -translate-y-1/2 rounded-full bg-white/[0.08]" />
        <div
          className="absolute top-1/2 h-[2px] -translate-y-1/2 rounded-full"
          style={{
            left: `${min}%`,
            right: `${100 - max}%`,
            backgroundColor: "rgba(64, 191, 134, 0.5)",
          }}
        />
        <input
          type="range"
          min={0}
          max={100}
          value={min}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (v < max) onChange(v, max);
          }}
          className="price-range-thumb pointer-events-none absolute inset-0 w-full appearance-none bg-transparent [&::-moz-range-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:pointer-events-auto"
          style={{ zIndex: min > 90 ? 4 : 3 }}
        />
        <input
          type="range"
          min={0}
          max={100}
          value={max}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (v > min) onChange(min, v);
          }}
          className="price-range-thumb pointer-events-none absolute inset-0 w-full appearance-none bg-transparent [&::-moz-range-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:pointer-events-auto"
          style={{ zIndex: 3 }}
        />
      </div>
      <div className="flex justify-between text-[11px] text-white/50">
        <span>${minPrice.toFixed(3)}</span>
        <span>${maxPriceValue.toFixed(3)}</span>
      </div>
      </div>
    </div>
  );
}

// ─── Explore Page ───

export default function ExplorePage() {
  return (
    <Suspense fallback={null}>
      <ExplorePageInner />
    </Suspense>
  );
}

function ExplorePageInner() {
  const searchParams = useSearchParams();
  const initialCategory = (() => {
    const qp = searchParams.get("category");
    return qp && VALID_CATEGORIES.includes(qp as ModelCategory)
      ? (qp as ModelCategory)
      : null;
  })();
  const initialFavorites = searchParams.get("starred") === "1";
  const { isStarred, starredIds } = useStarredModels();
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [category, setCategory] = useState<ModelCategory | null>(initialCategory);
  const [sort, setSort] = useState("recommended");
  const [sortDir, setSortDir] = useState<"desc" | "asc">("desc");
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [availabilityFilter, setAvailabilityFilter] = useState<AvailabilityFilter>("all");
  const [favoritesOnly, setFavoritesOnly] = useState(initialFavorites);
  const [realtimeOnly, setRealtimeOnly] = useState(searchParams.get("realtime") === "1");
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(100);
  const dataMaxPrice = useMemo(
    () => Math.max(...MODELS.map((m) => m.pricing.amount), 0.01),
    [],
  );

  const filtered = useMemo(() => {
    const result = MODELS.filter((m) => {
      if (availabilityFilter === "warm" && m.status !== "hot") return false;
      if (availabilityFilter === "cold" && m.status !== "cold") return false;
      if (favoritesOnly && !isStarred(m.id)) return false;
      if (realtimeOnly && !m.realtime) return false;
      const matchesSearch =
        !search ||
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.provider.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = !category || m.category === category;
      const price = m.pricing.amount;
      const matchesPrice = price >= (priceMin / 100) * dataMaxPrice && price <= (priceMax / 100) * dataMaxPrice;
      return matchesSearch && matchesCategory && matchesPrice;
    });

    result.sort((a, b) => {
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      const dir = sortDir === "asc" ? 1 : -1;
      switch (sort) {
        case "latency":
          return (a.latency - b.latency) * dir;
        case "price":
          return (a.pricing.amount - b.pricing.amount) * dir;
        case "uptime":
          return (b.uptime - a.uptime) * dir;
        case "recent": {
          const aTs = a.releasedAt ? new Date(a.releasedAt).getTime() : 0;
          const bTs = b.releasedAt ? new Date(b.releasedAt).getTime() : 0;
          return (bTs - aTs) * dir;
        }
        default: {
          // Recommended: tier by (realtime, warm), then by runs7d. Tier is always
          // best-first regardless of direction; only the popularity tiebreaker flips
          // when the user toggles asc/desc.
          const tier = (m: Model) => (m.realtime ? 0 : 2) + (m.status === "hot" ? 0 : 1);
          const tierDiff = tier(a) - tier(b);
          if (tierDiff !== 0) return tierDiff;
          return (b.runs7d - a.runs7d) * dir;
        }
      }
    });

    return result;
  }, [search, category, sort, sortDir, availabilityFilter, favoritesOnly, realtimeOnly, isStarred, priceMin, priceMax, dataMaxPrice]);

  const activeFilters = [
    ...(category
      ? [{ label: category, onClear: () => setCategory(null) }]
      : []),
    ...(availabilityFilter !== "all"
      ? [{ label: availabilityFilter === "warm" ? "Warm" : "Cold", onClear: () => setAvailabilityFilter("all") }]
      : []),
    ...(favoritesOnly
      ? [{ label: "Starred", onClear: () => setFavoritesOnly(false) }]
      : []),
    ...(realtimeOnly
      ? [{ label: "Realtime", onClear: () => setRealtimeOnly(false) }]
      : []),
  ];

  return (
    <main id="main-content" className="flex flex-1 flex-col">
      <div className="flex flex-1 min-h-[calc(100vh-3rem-2.75rem)]">
        {/* Filter sidebar */}
        <div className="hidden w-[260px] flex-shrink-0 self-stretch border-r border-white/10 bg-shell lg:block">
        <div className="sticky top-12 max-h-[calc(100vh-3rem)] overflow-y-auto space-y-4 px-5 pt-6 pb-5">
          {/* Source filter */}
          <div>
            {/* Capability type */}
            <p className="mb-1.5 px-3 text-xs font-medium uppercase tracking-wider text-white/50">
              Tasks
            </p>
            <div className="space-y-1">
              <button
                onClick={() => setCategory(null)}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                  !category
                    ? "bg-white/[0.08] font-medium text-white"
                    : "text-white/50 hover:bg-white/[0.04] hover:text-white/70"
                }`}
              >
                All
              </button>

              <div className="my-1.5 h-px bg-white/[0.08]" />

              {VIDEO_CATEGORIES.map(({ label: cat, icon: CatIcon }) => (
                <button
                  key={cat}
                  onClick={() => setCategory(category === cat ? null : cat)}
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                    category === cat
                      ? "bg-white/[0.08] font-medium text-white"
                      : "text-white/50 hover:bg-white/[0.04] hover:text-white/70"
                  }`}
                >
                  <CatIcon className="h-3.5 w-3.5" />
                  {cat}
                </button>
              ))}

              <div className="my-1.5 h-px bg-white/[0.08]" />

              {OTHER_CATEGORIES.map(({ label: cat, icon: CatIcon }) => (
                <button
                  key={cat}
                  onClick={() => setCategory(category === cat ? null : cat)}
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                    category === cat
                      ? "bg-white/[0.08] font-medium text-white"
                      : "text-white/50 hover:bg-white/[0.04] hover:text-white/70"
                  }`}
                >
                  <CatIcon className="h-3.5 w-3.5" />
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="h-px bg-white/[0.08]" />

          {/* Availability */}
          <div>
            <p className="mb-1.5 px-3 text-xs font-medium uppercase tracking-wider text-white/50">
              Availability
            </p>
            <div className="flex gap-1.5">
              <button
                onClick={() => setAvailabilityFilter(availabilityFilter === "warm" ? "all" : "warm")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] transition-colors ${
                  availabilityFilter === "warm"
                    ? "bg-warm-subtle font-medium text-warm"
                    : "text-white/50 hover:bg-white/[0.04] hover:text-white/70"
                }`}
              >
                <Flame className="h-3 w-3" />
                Warm
              </button>
              <button
                onClick={() => setAvailabilityFilter(availabilityFilter === "cold" ? "all" : "cold")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] transition-colors ${
                  availabilityFilter === "cold"
                    ? "bg-blue/10 font-medium text-blue-bright"
                    : "text-white/50 hover:bg-white/[0.04] hover:text-white/70"
                }`}
              >
                <Snowflake className="h-3 w-3" />
                Cold
              </button>
            </div>
          </div>

          <div className="h-px bg-white/[0.08]" />

          {/* Realtime — capability filter, Livepeer moat */}
          <div>
            <p className="mb-1.5 px-3 text-xs font-medium uppercase tracking-wider text-white/50">
              Realtime
            </p>
            <button
              onClick={() => setRealtimeOnly(!realtimeOnly)}
              className={`flex w-full items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] transition-colors ${
                realtimeOnly
                  ? "bg-green-bright/10 font-medium text-green-bright"
                  : "text-white/50 hover:bg-white/[0.04] hover:text-white/70"
              }`}
            >
              <Zap
                className="h-3 w-3"
                fill={realtimeOnly ? "currentColor" : "none"}
              />
              Realtime only
            </button>
          </div>

          <div className="h-px bg-white/[0.08]" />

          {/* Starred */}
          <div>
            <p className="mb-1.5 px-3 text-xs font-medium uppercase tracking-wider text-white/50">
              Starred
            </p>
            <button
              onClick={() => setFavoritesOnly(!favoritesOnly)}
              disabled={starredIds.length === 0}
              className={`flex w-full items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] transition-colors ${
                favoritesOnly
                  ? "bg-warm-subtle font-medium text-warm"
                  : "text-white/50 hover:bg-white/[0.04] hover:text-white/70 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-white/50"
              }`}
            >
              <Star
                className={`h-3 w-3 ${favoritesOnly ? "fill-warm" : ""}`}
              />
              Starred only
              {starredIds.length > 0 && (
                <span
                  className={`ml-auto font-mono text-[11px] ${
                    favoritesOnly ? "text-warm/70" : "text-white/30"
                  }`}
                >
                  {starredIds.length}
                </span>
              )}
            </button>
          </div>

          <div className="h-px bg-white/[0.08]" />

          <PriceRangeFilter
            min={priceMin}
            max={priceMax}
            onChange={(min, max) => { setPriceMin(min); setPriceMax(max); }}
            models={MODELS}
          />

          {activeFilters.length > 0 && (
            <>
              <div className="h-px bg-white/[0.08]" />
              <button
                onClick={() => {
                  setCategory(null);
                  setAvailabilityFilter("all");
                  setFavoritesOnly(false);
                  setRealtimeOnly(false);
                  setPriceMin(0);
                  setPriceMax(100);
                }}
                className="text-xs text-white/50 hover:text-white/60"
              >
                Clear all filters
              </button>
            </>
          )}
        </div>
        </div>

        {/* Content + Footer */}
        <div className="flex min-w-0 flex-1 flex-col bg-dark">
          {/* Toolbar — the page header is intentionally omitted; the active nav tab
              + breadcrumb already establish "Explore" context on both breakpoints */}
          <div className="sticky top-16 lg:top-12 z-30 flex flex-col gap-2.5 border-b border-white/10 bg-dark-surface/95 backdrop-blur-xl px-4 py-2 lg:flex-row lg:items-center lg:gap-3 lg:px-5 lg:py-2">
            {/* Search — full-width on mobile, capped on desktop */}
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search capabilities..."
              ariaLabel="Search capabilities"
              size="md"
              className="w-full lg:max-w-xs lg:flex-1"
            />

            {/* Active filter pills — inline next to Search on desktop; stacks below on mobile */}
            {activeFilters.length > 0 && (
              <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                {activeFilters.map((f) => (
                  <button
                    key={f.label}
                    onClick={f.onClear}
                    className="inline-flex items-center gap-1 rounded-full bg-white/[0.06] px-2.5 py-1 text-xs text-white/60 transition-colors hover:bg-white/[0.1] hover:text-white"
                  >
                    {f.label}
                    <X className="h-3 w-3" />
                  </button>
                ))}
              </div>
            )}

            {/* Controls — data controls (filter, sort, dir) then display (view). All uniform h-9 mobile / h-8 desktop. */}
            <div className="flex flex-wrap items-center gap-2 lg:flex-nowrap lg:ml-auto">
              {/* Filters button — mobile only (desktop has sidebar) */}
              <button
                type="button"
                onClick={() => setFilterDrawerOpen(true)}
                aria-label="Filters"
                className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 text-xs text-white/70 transition-colors hover:border-white/20 hover:bg-white/[0.05] hover:text-white sm:px-3 lg:hidden"
              >
                <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Filters</span>
                {activeFilters.length > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-green-bright/15 px-1 font-mono text-[11px] font-medium text-green-bright">
                    {activeFilters.length}
                  </span>
                )}
              </button>

              {/* Sort + direction paired so they wrap together when tight */}
              <div className="flex min-w-0 flex-1 basis-40 items-center gap-2 lg:flex-initial lg:basis-auto">
                <Select
                  size="sm"
                  ariaLabel="Sort"
                  value={sort}
                  options={SORT_OPTIONS}
                  onChange={setSort}
                  className="min-w-0 flex-1"
                  triggerClassName="lg:h-8"
                />

                <button
                  onClick={() => setSortDir(sortDir === "desc" ? "asc" : "desc")}
                  aria-label={
                    sortDir === "desc"
                      ? "Sort direction: descending, tap to ascend"
                      : "Sort direction: ascending, tap to descend"
                  }
                  aria-pressed={sortDir === "desc"}
                  className="flex h-9 w-9 lg:h-8 lg:w-8 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] transition-colors hover:border-white/20 hover:bg-white/[0.05] focus:outline-none"
                >
                  {sortDir === "desc" ? (
                    <ArrowDown className="h-4 w-4 text-white/70" />
                  ) : (
                    <ArrowUp className="h-4 w-4 text-white/70" />
                  )}
                </button>
              </div>

              {/* View toggle — display preference, anchored last */}
              <div className="flex shrink-0 rounded-lg border border-white/[0.08] bg-white/[0.03]">
                <button
                  onClick={() => setView("grid")}
                  aria-label="Grid view"
                  aria-pressed={view === "grid"}
                  className={`flex h-9 w-9 lg:h-8 lg:w-8 items-center justify-center rounded-l-lg transition-colors focus:outline-none ${
                    view === "grid"
                      ? "bg-white/[0.08] text-white"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setView("list")}
                  aria-label="List view"
                  aria-pressed={view === "list"}
                  className={`flex h-9 w-9 lg:h-8 lg:w-8 items-center justify-center rounded-r-lg transition-colors focus:outline-none ${
                    view === "list"
                      ? "bg-white/[0.08] text-white"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>

          </div>

          {/* Grid / List */}
          <div className="flex-1 p-4">
            {filtered.length === 0 ? (
              <ExploreEmptyState
                onClearFilters={() => {
                  setSearch("");
                  setCategory(null);
                  setAvailabilityFilter("all");
                  setFavoritesOnly(false);
                  setRealtimeOnly(false);
                  setPriceMin(0);
                  setPriceMax(100);
                }}
              />
            ) : view === "grid" ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {filtered.map((model) => (
                  <ModelCard key={model.id} model={model} />
                ))}
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-dark-surface">
                {filtered.map((model) => (
                  <ModelListItem key={model.id} model={model} />
                ))}
              </div>
            )}
          </div>
          {filtered.length > 0 && (
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 px-6 py-3 font-mono text-xs">
              <span className="text-white/65">
                Showing {filtered.length}{" "}
                {filtered.length === 1 ? "capability" : "capabilities"}
              </span>
              <span className="text-white/30" aria-hidden="true">·</span>
              <span className="text-white/55">Missing something?</span>
              <a
                href="https://docs.livepeer.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-bright underline decoration-green-bright/40 underline-offset-4 transition-colors hover:text-green-light hover:decoration-green-bright"
              >
                Publish a capability
              </a>
            </div>
          )}
          <DashboardFooter />
        </div>
      </div>

      {/* Mobile filter drawer */}
      <Drawer
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        title="Filters"
        ariaLabel="Filters"
      >
        <div className="space-y-4 px-5 py-4">
          {/* Capability type */}
          <div>
            <p className="mb-1.5 px-3 text-xs font-medium uppercase tracking-wider text-white/60">
              Tasks
            </p>
            <div className="space-y-0.5">
              <button
                onClick={() => { setCategory(null); setFilterDrawerOpen(false); }}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-[15px] transition-colors ${
                  !category
                    ? "bg-white/[0.08] font-medium text-white"
                    : "text-white/70 hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                All
              </button>

              <div className="my-1.5 h-px bg-white/[0.06]" />

              {VIDEO_CATEGORIES.map(({ label: cat, icon: CatIcon }) => (
                <button
                  key={cat}
                  onClick={() => { setCategory(category === cat ? null : cat); setFilterDrawerOpen(false); }}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-[15px] transition-colors ${
                    category === cat
                      ? "bg-white/[0.08] font-medium text-white"
                      : "text-white/70 hover:bg-white/[0.06] hover:text-white"
                  }`}
                >
                  <CatIcon className="h-4 w-4 text-white/40" aria-hidden="true" />
                  {cat}
                </button>
              ))}

              <div className="my-1.5 h-px bg-white/[0.06]" />

              {OTHER_CATEGORIES.map(({ label: cat, icon: CatIcon }) => (
                <button
                  key={cat}
                  onClick={() => { setCategory(category === cat ? null : cat); setFilterDrawerOpen(false); }}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-[15px] transition-colors ${
                    category === cat
                      ? "bg-white/[0.08] font-medium text-white"
                      : "text-white/70 hover:bg-white/[0.06] hover:text-white"
                  }`}
                >
                  <CatIcon className="h-4 w-4 text-white/40" aria-hidden="true" />
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="h-px bg-white/[0.06]" />

          {/* Availability */}
          <div>
            <p className="mb-1.5 px-3 text-xs font-medium uppercase tracking-wider text-white/60">
              Availability
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setAvailabilityFilter(availabilityFilter === "warm" ? "all" : "warm")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  availabilityFilter === "warm"
                    ? "bg-warm-subtle font-medium text-warm"
                    : "text-white/70 hover:bg-white/[0.06]"
                }`}
              >
                <Flame className="h-3.5 w-3.5" />
                Warm
              </button>
              <button
                onClick={() => setAvailabilityFilter(availabilityFilter === "cold" ? "all" : "cold")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  availabilityFilter === "cold"
                    ? "bg-blue/10 font-medium text-blue-bright"
                    : "text-white/70 hover:bg-white/[0.06]"
                }`}
              >
                <Snowflake className="h-3.5 w-3.5" />
                Cold
              </button>
            </div>
          </div>

          <div className="h-px bg-white/[0.06]" />

          {/* Realtime — capability filter */}
          <div>
            <p className="mb-1.5 px-3 text-xs font-medium uppercase tracking-wider text-white/60">
              Realtime
            </p>
            <button
              onClick={() => setRealtimeOnly(!realtimeOnly)}
              className={`flex w-full items-center gap-1.5 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                realtimeOnly
                  ? "bg-green-bright/10 font-medium text-green-bright"
                  : "text-white/70 hover:bg-white/[0.06]"
              }`}
            >
              <Zap
                className="h-3.5 w-3.5"
                fill={realtimeOnly ? "currentColor" : "none"}
              />
              Realtime only
            </button>
          </div>

          <div className="h-px bg-white/[0.06]" />

          {/* Starred */}
          <div>
            <p className="mb-1.5 px-3 text-xs font-medium uppercase tracking-wider text-white/60">
              Starred
            </p>
            <button
              onClick={() => setFavoritesOnly(!favoritesOnly)}
              disabled={starredIds.length === 0}
              className={`flex w-full items-center gap-1.5 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                favoritesOnly
                  ? "bg-warm-subtle font-medium text-warm"
                  : "text-white/70 hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-40"
              }`}
            >
              <Star className={`h-3.5 w-3.5 ${favoritesOnly ? "fill-warm" : ""}`} />
              Starred only
              {starredIds.length > 0 && (
                <span className={`ml-auto font-mono text-[11px] ${favoritesOnly ? "text-warm/70" : "text-white/40"}`}>
                  {starredIds.length}
                </span>
              )}
            </button>
          </div>

          <div className="h-px bg-white/[0.06]" />

          {/* Price range */}
          <PriceRangeFilter
            min={priceMin}
            max={priceMax}
            onChange={(min, max) => { setPriceMin(min); setPriceMax(max); }}
            models={MODELS}
          />
        </div>

        {/* Sticky footer — always visible, no layout shift */}
        <div className="sticky bottom-0 flex items-center justify-between gap-3 border-t border-white/[0.06] bg-dark px-5 py-3">
          <button
            type="button"
            onClick={() => {
              setCategory(null);
              setAvailabilityFilter("all");
              setFavoritesOnly(false);
              setRealtimeOnly(false);
              setPriceMin(0);
              setPriceMax(100);
            }}
            disabled={activeFilters.length === 0}
            className="text-sm text-white/60 underline decoration-white/30 underline-offset-2 transition-colors hover:text-white disabled:no-underline disabled:text-white/30 disabled:cursor-default"
          >
            Clear all
          </button>
          <button
            type="button"
            onClick={() => setFilterDrawerOpen(false)}
            className="rounded-lg bg-green px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-light active:bg-green-dark"
          >
            Show {filtered.length} {filtered.length === 1 ? "result" : "results"}
          </button>
        </div>
      </Drawer>
    </main>
  );
}
