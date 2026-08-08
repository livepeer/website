"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import {
  ALL_CATEGORIES,
  CatalogueSearch,
} from "@/components/livepeer-ui/catalogue-search";
import { Badge } from "@/components/ui/badge";

export type EcosystemListingApp = {
  slug: string;
  name: string;
  hostname: string;
  description: string;
  categories: string[];
  logo?: string;
  /** Submitter-supplied tile colour, for marks that need one to read. */
  logoBg?: string;
};

/**
 * The ecosystem catalogue: every project built on Livepeer, searchable and
 * filterable.
 *
 * User-facing copy says "project", not "app" — the catalogue carries SDKs,
 * plugins, and open-source engines alongside consumer products. The props and
 * the EcosystemApp type keep their names; those are internal.
 *
 * Cards link to the local detail page rather than straight out to the app, as
 * the mockup does — /ecosystem/[slug] is part of the IA and carries the longer
 * write-up, links, and maker credits that the card can't.
 *
 * Search and filtering live behind one control, as in the mockup: a single
 * button that opens a panel holding the query field and the category list.
 * That keeps the resting page to a title and one affordance, and means the
 * category list costs nothing until someone wants it.
 */
export function EcosystemListing({
  apps,
  categories,
  heading,
  searchPlaceholder,
  emptyMessage,
  submitLabel,
  submitHref,
}: {
  apps: EcosystemListingApp[];
  categories: string[];
  heading: string;
  searchPlaceholder: string;
  emptyMessage: string;
  submitLabel: string;
  submitHref: string;
}) {
  const [query, setQuery] = useState("");
  // Empty means "All" — no category is stored for the unfiltered state, so
  // there is one representation of it rather than two.
  const [selected, setSelected] = useState<string[]>([]);

  const toggleCategory = (name: string) => {
    if (name === ALL_CATEGORIES) {
      setSelected([]);
      return;
    }
    setSelected((current) =>
      current.includes(name)
        ? current.filter((value) => value !== name)
        : [...current, name]
    );
  };

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    return apps.filter((app) => {
      // Categories union (OR), not intersection. With this catalogue's shape —
      // 12 apps over 9 categories — 56% of two-category intersections are
      // empty and most of the rest return a single app, so AND would blank the
      // grid on the second click. Union means each added category can only
      // widen the set, never dead-end it.
      const inCategory =
        selected.length === 0 ||
        app.categories.some((name) => selected.includes(name));
      if (!inCategory) return false;
      if (!q) return true;
      // The query still narrows (AND) within that union.
      return [app.name, app.hostname, app.description, ...app.categories]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [apps, query, selected]);

  return (
    <div className="px-4 pt-16 pb-24 sm:px-6 lg:px-10">
      <div className="mx-auto w-full max-w-page">
        <header className="pt-12 text-center lg:pt-16">
          {/* font-display (Favorit Pro) is opt-in per design.md — reserved for
              major editorial statements. A catalogue title is one of the few
              places on the site that qualifies. */}
          <h1 className="font-display text-display-sm text-balance sm:text-display-fluid">
            {heading}
          </h1>
        </header>

        <div className="mt-10">
          <CatalogueSearch
            label={searchPlaceholder}
            categories={categories}
            query={query}
            onQueryChange={setQuery}
            selected={selected}
            onToggleCategory={toggleCategory}
            onClearAll={() => {
              setQuery("");
              setSelected([]);
            }}
          />
        </div>

        {/* Announced rather than shown: it changes on every keystroke, and a
            visible tally would compete with the grid. */}
        <p className="sr-only" role="status" aria-live="polite">
          {matches.length} of {apps.length} projects shown
        </p>

        {matches.length === 0 ? (
          <p className="mt-16 text-center text-reading-body text-muted-foreground">
            {emptyMessage}
          </p>
        ) : (
          <ul className="mt-12 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {matches.map((app) => (
              <li key={app.slug} className="contents">
                {/* No border: the card is defined by its hover fill and the
                    grid gap, which keeps a dozen cards from reading as a wall
                    of boxes. min-h holds the row height steady when
                    descriptions run short.

                    The hover fill is a fraction of foreground, not a surface
                    token: `card` is oklch(1 0 0) in light — identical to
                    `background` — so a card fill painted white on white and
                    there was no hover state at all. An alpha over foreground
                    is relative to whatever the page is, so it lifts either way.

                    The two alphas are deliberately different. Equal sRGB steps
                    are not equal perceptual steps — oklch L is steep near black
                    and flat near white — so one shared value cannot serve both:
                    at 0.08 dark lifts ΔL 0.191 while light manages only 0.060,
                    and light reads as having no hover. 0.15 puts light at ΔL
                    0.112. Dark stays at 0.08, just under the 0.205 that `card`
                    used to give it. These cards carry no border, so the fill is
                    the only thing that materialises them — it has to register. */}
                <Link
                  href={`/ecosystem/${app.slug}`}
                  className="group flex min-h-72 flex-col rounded-sm p-6 transition-colors hover:bg-foreground/[0.15] dark:hover:bg-foreground/[0.08]"
                >
                  {app.logo ? (
                    // The mockup uses object-cover because its images are
                    // full-bleed 512px tiles. Ours are contributor logo marks
                    // in public/ecosystem — cover would crop them — so the
                    // mark is contained inside a tile of the same size, on the
                    // submitter's own background when they gave one.
                    <span
                      className="flex size-14 items-center justify-center overflow-hidden rounded-sm bg-secondary"
                      style={
                        app.logoBg ? { backgroundColor: app.logoBg } : undefined
                      }
                    >
                      <Image
                        src={`/ecosystem/${app.logo}`}
                        alt=""
                        width={40}
                        height={40}
                        className="size-10 object-contain"
                      />
                    </span>
                  ) : (
                    // Monogram fallback — the catalogue is contributor-supplied
                    // markdown, so a missing logo is a normal state, not an
                    // error. Sized identically so the grid never shifts.
                    <span
                      aria-hidden="true"
                      className="flex size-14 items-center justify-center rounded-sm bg-secondary text-lg font-medium text-muted-foreground"
                    >
                      {app.name.charAt(0)}
                    </span>
                  )}
                  <div className="mt-6">
                    <h2 className="text-lg font-medium">{app.name}</h2>
                    {/* Mono: a hostname is an identifier, not prose. */}
                    <p className="mt-1 font-mono text-xs text-muted-foreground">
                      {app.hostname}
                    </p>
                  </div>
                  <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
                    {app.description}
                  </p>
                  {/* mt-auto pins the categories to the card's foot so they
                      line up across a row regardless of description length. */}
                  <div className="mt-auto flex flex-wrap gap-1.5 pt-6">
                    {app.categories.map((name) => (
                      <Badge
                        key={name}
                        variant="secondary"
                        className="rounded-sm font-mono text-[0.6875rem] font-normal uppercase"
                      >
                        {name}
                      </Badge>
                    ))}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {/* Below the grid and set as a link, not a button. Submitting is a
            contributor action taken by a handful of people, so it belongs
            after the catalogue rather than competing with search at the top of
            the page. */}
        <p className="mt-16 text-center text-sm text-muted-foreground">
          <Link
            href={submitHref}
            className="underline underline-offset-4 transition-colors hover:text-foreground"
          >
            {submitLabel}
          </Link>
        </p>
      </div>
    </div>
  );
}
