"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, Plus, ArrowUpRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ECOSYSTEM_APPS, ECOSYSTEM_CATEGORIES } from "@/lib/ecosystem-data";
import PageHero from "@/components/ui/PageHero";
import Container from "@/components/ui/Container";

import FilterPills from "@/components/ui/FilterPills";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

const BATCH_SIZE = 12;

export default function EcosystemPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [visible, setVisible] = useState(BATCH_SIZE);

  useEffect(() => {
    setVisible(BATCH_SIZE);
  }, [activeCategory, search]);

  const filtered = useMemo(() => {
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
    <PageHero>
      <div className="min-h-screen">
        <Container>
          <div className="flex flex-col gap-4">
            <p className="font-mono text-xs font-medium tracking-wider text-white/30 uppercase">
              Ecosystem
            </p>
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl text-balance">
                Built on Livepeer
              </h2>
              <Button
                href="/ecosystem/submit"
                variant="secondary"
                size="sm"
                className="shrink-0 backdrop-blur-sm text-white/60 hover:text-white/80"
              >
                <Plus className="h-3 w-3" />
                Submit App
              </Button>
            </div>
            <p className="text-lg leading-relaxed text-white/50">
              Explore what developers and teams are building with real-time video and AI inference on Livepeer.
            </p>
          </div>

          {/* Filter bar */}
          <div className="mt-8 flex flex-col gap-4 sm:mt-12 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <FilterPills
              items={ECOSYSTEM_CATEGORIES}
              active={activeCategory}
              onChange={setActiveCategory}
            />

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
                      <Badge key={cat} variant="tag">
                        {cat}
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
                    setActiveCategory("All");
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
