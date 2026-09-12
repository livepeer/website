import type {
  BlogListingLink,
  BlogListingPost,
} from "@/components/livepeer-ui/blog-listing";
import {
  type BlogCategory,
  type BlogSummary,
  categoriesInUse,
  categorySlug,
} from "@/lib/blog";

/**
 * What the index and every category page share: the copy, the rail, and the
 * shape a register entry takes on a card. Both routes render BlogListing;
 * this is the one place their inputs are built, so they cannot drift.
 */
export const blog = {
  // Sentence case, like every page heading on the site. The nav and the
  // footer say "Latest Updates" because their labels are all title case.
  heading: "Latest updates",
  allHref: "/blog",
  feedHref: "/blog/feed.xml",
  searchPlaceholder: "Search posts",
  emptyMessage: "No posts match that search.",
  /**
   * Surfaces that sit in the row beside the categories without being one.
   * The changelog is a different shape of record with its own page, not a
   * sixth category; it sits after a hairline so the row says so.
   */
  siblings: [{ label: "Changelog", href: "/changelog" }] as BlogListingLink[],
};

export function categoryHref(category: BlogCategory): string {
  return `/blog/category/${categorySlug(category)}`;
}

/** The categories in use, each as a rail link. */
export function categoryLinks(register: BlogSummary[]): BlogListingLink[] {
  return categoriesInUse(register).map((name) => ({
    label: name,
    href: categoryHref(name),
  }));
}

export function toListingPosts(register: BlogSummary[]): BlogListingPost[] {
  return register.map((post) => ({
    slug: post.slug,
    title: post.title,
    description: post.description,
    category: post.category,
    date: post.date,
    image: post.image,
    imageAlt: post.imageAlt || undefined,
  }));
}
