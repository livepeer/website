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
  searchPlaceholder: "Search posts",
  emptyMessage: "No posts match that search.",
  /**
   * Surfaces that sit in the rail beside the categories without being one.
   * Empty until there is something real to put here: the changelog goes in
   * as `{ label: "Changelog", href: "/changelog" }` the day that page ships,
   * and not a day before, because a rail link to a page that does not exist
   * is a dead end dressed as a destination.
   */
  siblings: [] as BlogListingLink[],
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
