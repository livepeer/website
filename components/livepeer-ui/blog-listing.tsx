"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import {
  ALL_CATEGORIES,
  CatalogueSearch,
} from "@/components/livepeer-ui/catalogue-search";

export type BlogListingPost = {
  slug: string;
  title: string;
  description: string;
  category: string;
  /** ISO yyyy-mm-dd, straight from the markdown frontmatter. */
  date: string;
  image?: string;
  imageAlt?: string;
};

/**
 * Frontmatter dates are plain yyyy-mm-dd, which Date parses as UTC midnight.
 * Formatted in any timezone west of UTC that renders as the day before — so
 * the zone is pinned rather than left to the server's locale.
 */
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * The blog index — "Latest" in the nav, /blog in the URL.
 *
 * Same shape as the ecosystem catalogue by design: one title, one search
 * control, one grid. The two share CatalogueSearch outright, so filtering
 * behaves identically on both.
 */
export function BlogListing({
  posts,
  categories,
  heading,
  searchPlaceholder,
  emptyMessage,
}: {
  posts: BlogListingPost[];
  categories: string[];
  heading: string;
  searchPlaceholder: string;
  emptyMessage: string;
}) {
  const [query, setQuery] = useState("");
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
    return posts.filter((post) => {
      // Union across categories, intersection with the query — the same rule
      // the ecosystem catalogue uses. A post carries exactly one category, so
      // AND across two would always return nothing.
      const inCategory =
        selected.length === 0 || selected.includes(post.category);
      if (!inCategory) return false;
      if (!q) return true;
      return [post.title, post.description, post.category]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [posts, query, selected]);

  return (
    <div className="px-4 pt-16 pb-24 sm:px-6 lg:px-10">
      <div className="mx-auto w-full max-w-page">
        <header className="pt-12 text-center lg:pt-16">
          <h1 className="text-display-sm text-balance sm:text-display-fluid">
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

        <p className="sr-only" role="status" aria-live="polite">
          {matches.length} of {posts.length} posts shown
        </p>

        {matches.length === 0 ? (
          <p className="mt-16 text-center text-reading-body text-muted-foreground">
            {emptyMessage}
          </p>
        ) : (
          // Two columns from the smallest screen, not one. Post art is the
          // point of this grid and a single column of square images turns the
          // index into a scroll; paired, the covers read as a contact sheet.
          <ul className="mt-16 grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-3">
            {matches.map((post) => (
              <li key={post.slug} className="contents">
                <Link
                  href={`/blog/${post.slug}`}
                  className="group flex min-w-0 flex-col gap-2"
                >
                  {/* Square, and the same tile whether or not the post has
                      art: the bordered muted panel is the placeholder, so a
                      post without a cover leaves a considered gap rather than
                      a collapsed card. */}
                  <div className="relative aspect-square overflow-hidden rounded-sm border bg-muted">
                    {post.image && (
                      <Image
                        src={post.image}
                        alt={post.imageAlt ?? ""}
                        fill
                        sizes="(min-width: 1024px) 33vw, 50vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                      />
                    )}
                  </div>
                  {/* font-medium, not the font-light this carried under
                      Favorit: at 20px Inter's 300 goes thin and the title stops
                      out-weighing the body copy beneath it. Matches the
                      ecosystem card title, which is Inter at font-medium. */}
                  <h2 className="text-xl leading-snug font-medium tracking-tight text-pretty">
                    {post.title}
                  </h2>
                  {/* whitespace-nowrap with a truncating date: at 390px a
                      two-column card is ~180px wide, and letting this row wrap
                      would stagger every card in the row by a line. The
                      category holds its width; the date gives way. */}
                  <div className="flex items-center gap-2 overflow-hidden pl-[1px] whitespace-nowrap">
                    <span className="shrink-0 text-xs text-foreground">
                      {post.category}
                    </span>
                    <time
                      dateTime={post.date}
                      className="min-w-0 truncate text-xs text-muted-foreground"
                    >
                      {formatDate(post.date)}
                    </time>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
