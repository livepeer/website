import {
  BlogListing,
  type BlogListingPost,
} from "@/components/livepeer-ui/blog-listing";
import { getAllPosts, getCategories } from "@/lib/blog";
import { ALL_CATEGORIES } from "@/components/livepeer-ui/catalogue-search";

// Copy mirrors the public-beta mockup. The posts are markdown in content/blog
// (see CLAUDE.md → Content), read at build time. Metadata lives in layout.tsx,
// which this route already had.
const blog = {
  heading: "Latest Updates",
  searchPlaceholder: "Search articles",
  emptyMessage: "No posts match that search.",
};

export default function BlogPage() {
  const posts: BlogListingPost[] = getAllPosts().map((post) => ({
    slug: post.slug,
    title: post.title,
    description: post.description,
    category: post.category,
    date: post.date,
    image: post.image || undefined,
    imageAlt: post.imageAlt || undefined,
  }));

  // getCategories returns only the categories in use; the unfiltered option is
  // the control's own, so it is prepended here rather than baked into lib.
  const categories = [ALL_CATEGORIES, ...getCategories()];

  return (
    <BlogListing
      posts={posts}
      categories={categories}
      heading={blog.heading}
      searchPlaceholder={blog.searchPlaceholder}
      emptyMessage={blog.emptyMessage}
    />
  );
}
