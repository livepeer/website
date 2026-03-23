"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Search, Plus } from "lucide-react";
import Link from "next/link";
import { ECOSYSTEM_APPS, ECOSYSTEM_CATEGORIES } from "@/lib/ecosystem-data";

const PAGE_SIZE = 12;

export default function EcosystemPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [visible, setVisible] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    setVisible(PAGE_SIZE);
    return ECOSYSTEM_APPS.filter((app) => {
      const matchesCategory =
        activeCategory === "All" || app.categories.includes(activeCategory);
      const matchesSearch =
        !search ||
        app.name.toLowerCase().includes(search.toLowerCase()) ||
        app.description.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, search]);

  const shown = filtered.slice(0, visible);
  const hasMore = visible < filtered.length;

  return (
    <section className="mx-auto max-w-7xl px-6 pt-32 pb-24">
      {/* Submit your app — fixed top-right */}
      <Link
        href="/ecosystem/submit"
        className="fixed top-[19px] right-4 z-50 flex items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-2xl transition-all hover:bg-white/15 md:top-[18px] md:right-6 h-10 w-10 md:h-[40px] md:w-auto md:gap-2 md:rounded-full md:px-5"
      >
        <Plus className="h-4 w-4 text-white md:hidden" />
        <Plus className="hidden md:block h-3.5 w-3.5 text-white" />
        <span className="hidden md:inline text-sm font-medium text-white">
          Submit your app
        </span>
      </Link>

      {/* Header */}
      <h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl">
        Ecosystem
      </h1>

      {/* Filter bar */}
      <div className="mt-12 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5">
          {ECOSYSTEM_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-sm border px-3 py-1 text-sm transition-colors ${
                activeCategory === cat
                  ? "border-white/20 bg-white/10 font-medium text-white"
                  : "border-dark-border text-white/40 hover:border-white/10 hover:text-white/60"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/20" />
          <input
            type="text"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-56 rounded-sm border border-dark-border bg-transparent py-1.5 pl-9 pr-4 text-sm text-white placeholder:text-white/25 focus:border-white/15 focus:outline-none"
          />
        </div>
      </div>

      {/* App grid */}
      {shown.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((app) => (
            <a
              key={app.id}
              href={app.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col rounded-2xl border border-dark-border bg-dark-card p-6 transition-all hover:border-white/10 hover:bg-white/[0.02]"
            >
              <div className="mb-4 flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl bg-white/[0.06]">
                {app.logo ? (
                  <Image
                    src={`/ecosystem/${app.logo}`}
                    alt={`${app.name} logo`}
                    width={48}
                    height={48}
                    className="h-10 w-10 object-contain"
                  />
                ) : (
                  <span className="text-2xl font-semibold text-white/30">
                    {app.name.charAt(0)}
                  </span>
                )}
              </div>
              <h3 className="text-base font-semibold text-white">
                {app.name}
              </h3>
              <p className="mt-0.5 font-mono text-xs text-white/25">
                {app.domain}
              </p>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-white/40">
                {app.description}
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {app.categories.map((cat) => (
                  <span
                    key={cat}
                    className="border border-dark-border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-white/25"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </a>
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-xl border border-dark-border bg-dark-card py-16 text-center">
          <p className="text-sm text-white/40">
            No apps match your search.
          </p>
        </div>
      )}

      {/* View more */}
      {hasMore && (
        <div className="mt-6 text-center">
          <button
            onClick={() => setVisible((v) => v + PAGE_SIZE)}
            className="rounded-sm border border-dark-border px-6 py-2.5 text-sm font-medium text-white/50 transition-colors hover:border-white/15 hover:text-white"
          >
            View more
          </button>
        </div>
      )}
    </section>
  );
}
