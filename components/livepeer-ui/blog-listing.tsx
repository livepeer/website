"use client";

import { useMemo, useState } from "react";

import {
  LatestNav,
  type LatestLink,
} from "@/components/livepeer-ui/latest-nav";
import {
  PostCard,
  type PostCardPost,
} from "@/components/livepeer-ui/post-card";

export type BlogListingPost = PostCardPost;

export type BlogListingLink = LatestLink;

/**
 * The blog index — "Latest" in the nav, /blog in the URL.
 *
 * A row and a grid, after Vercel's blog. The row (LatestNav) is a list of
 * places: every category as its own URL, then any sibling surface that is not
 * a category — the changelog — with a search box at its right end. Categories
 * used to live inside the search popover with the query, which made one
 * control do two jobs and left nowhere to put a page that was neither. A
 * category is a route now, so it can be linked to and indexed, and search
 * does one thing: it narrows the posts on the page you are on, by title and
 * description.
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
  feedHref,
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
  /** The blog's Atom feed, shown as an icon after the search. */
  feedHref?: string;
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

  const current =
    categories.find((category) => category.label === active)?.href ?? allHref;

  // Gutter and max-width on one element — see the note in app/brand/page.tsx.
  // Split across two, max-w-page bounds the content box instead of the padded
  // box and the column runs 40px wider each side than the header and footer.
  return (
    <div className="pt-16 pb-24">
      <div className="mx-auto w-full max-w-page px-4 sm:px-6 lg:px-10">
        {/* display-md at the regular weight rather than the 300 the display
            utilities carry, so the heading holds its own over a row of
            buttons and a search field. Vercel's heading measures the same. */}
        <h1 className="text-display-md font-normal">{heading}</h1>

        <LatestNav
          allHref={allHref}
          categories={categories}
          siblings={siblings}
          current={current}
          feedHref={feedHref}
          query={query}
          onQueryChange={setQuery}
          searchPlaceholder={searchPlaceholder}
        />

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
                  <PostCard
                    post={post}
                    sizes="(min-width: 1024px) 33vw, 50vw"
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
