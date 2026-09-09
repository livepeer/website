"use client";

import Image from "next/image";
import Link from "next/link";
import { SearchIcon } from "lucide-react";
import { useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

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

export type BlogListingLink = { label: string; href: string };

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
 * A row and a grid, after Vercel's blog. The row is a list of places: every
 * category as its own URL, then any sibling surface that is not a category
 * (the changelog, when it exists), with a search box at its right end.
 * Categories used to live inside the search popover with the query, which
 * made one control do two jobs and left nowhere to put a page that was
 * neither. A category is a route now, so it can be linked to and indexed,
 * and search does one thing: it narrows the posts on the page you are on, by
 * title and description.
 *
 * A row rather than a sidebar, which this had for a day: with three to five
 * places a sidebar leaves a column mostly empty and takes width from the
 * covers, and the row is the same shape on every screen.
 *
 * The grid stays. Vercel runs a dense date-and-title list because it ships
 * several posts a week; this blog has a dozen posts, each with a required
 * cover, and the contact sheet of covers is the point of the index.
 */
export function BlogListing({
  posts,
  heading,
  allHref,
  categories,
  active,
  siblings,
  searchPlaceholder,
  emptyMessage,
}: {
  posts: BlogListingPost[];
  heading: string;
  /** Where "All" goes — the unfiltered index. */
  allHref: string;
  /** The categories in use, each with its route. */
  categories: BlogListingLink[];
  /** The category this page is filtered to, or null on the index. */
  active: string | null;
  /** Surfaces that sit beside the categories without being one. */
  siblings: BlogListingLink[];
  searchPlaceholder: string;
  emptyMessage: string;
}) {
  const [query, setQuery] = useState("");

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return posts;
    return posts.filter((post) =>
      `${post.title} ${post.description}`.toLowerCase().includes(q)
    );
  }, [posts, query]);

  const railLink = (label: string, href: string, current: boolean) => (
    <Link
      key={href}
      href={href}
      aria-current={current ? "page" : undefined}
      className={cn(
        "shrink-0 rounded-sm text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
        current
          ? "text-foreground"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      {label}
    </Link>
  );

  // Gutter and max-width on one element — see the note in app/brand/page.tsx.
  // Split across two, max-w-page bounds the content box instead of the padded
  // box and the column runs 40px wider each side than the header and footer.
  return (
    <div className="pt-6 pb-24 sm:pt-8">
      <div className="mx-auto w-full max-w-page px-4 sm:px-6 lg:px-10">
        {/* A step up from the page-title utility on both axes, by request: the
            display-sm size with the regular weight rather than the 300 the
            display utilities carry, so the heading holds its own over a row
            of links and a search field. */}
        <h1 className="text-display-sm font-normal">{heading}</h1>

        {/* One row, on every screen: the places on the left, the search on
            the right. On a phone the row wraps, so the search drops under the
            categories at full width; the categories themselves scroll
            sideways rather than wrap, so the row stays one line tall. The
            sibling surfaces follow a hairline so they read as a second group
            rather than more categories. */}
        <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
          <nav
            aria-label="Categories"
            className="-mx-4 flex min-w-0 gap-x-5 overflow-x-auto px-4 whitespace-nowrap [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden"
          >
            {railLink("All", allHref, active === null)}
            {categories.map((category) =>
              railLink(category.label, category.href, active === category.label)
            )}
            {siblings.length > 0 && (
              <>
                <span
                  aria-hidden="true"
                  className="w-px shrink-0 self-stretch bg-border"
                />
                {siblings.map((link) => railLink(link.label, link.href, false))}
              </>
            )}
          </nav>

          <label className="relative block w-full sm:ml-auto sm:w-64">
            <SearchIcon
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              className="pl-9"
            />
          </label>
        </div>

        <div className="mt-12">
          <p className="sr-only" role="status" aria-live="polite">
            {matches.length} of {posts.length} posts shown
          </p>

          {matches.length === 0 ? (
            <p className="py-16 text-center text-reading-body text-muted-foreground">
              {emptyMessage}
            </p>
          ) : (
            // Two columns from the smallest screen, not one. Post art is the
            // point of this grid and a single column of square images turns
            // the index into a scroll; paired, the covers read as a contact
            // sheet.
            <ul className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-3">
              {matches.map((post) => (
                <li key={post.slug} className="contents">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="group flex min-w-0 flex-col gap-2"
                  >
                    {/* Square, and the same tile whether or not the post
                          has art: the bordered muted panel is the placeholder,
                          so a post without a cover leaves a considered gap
                          rather than a collapsed card. */}
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
                    {/* font-medium: at 20px Inter's 300 goes thin and the
                          title stops out-weighing the body copy beneath it.
                          Matches the ecosystem card title. */}
                    <h2 className="text-xl leading-snug font-medium tracking-tight text-pretty">
                      {post.title}
                    </h2>
                    {/* whitespace-nowrap with a truncating date: at 390px a
                          two-column card is ~180px wide, and letting this row
                          wrap would stagger every card in the row by a line.
                          The category holds its width; the date gives way. */}
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
    </div>
  );
}
