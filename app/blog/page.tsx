import {
  BlogListing,
  type BlogListingPost,
} from "@/components/livepeer-ui/blog-listing";
import { categoriesInUse } from "@/lib/blog";
import { getBlogRegister } from "@/lib/register";
import { ALL_CATEGORIES } from "@/components/livepeer-ui/catalogue-search";

// Copy mirrors the public-beta mockup. The posts come from the register —
// Notion when there is a token, content/blog when there is not (see CLAUDE.md →
// Content). Metadata lives in layout.tsx, which this route already had.
const blog = {
  heading: "Latest Updates",
  searchPlaceholder: "Search articles",
  emptyMessage: "No posts match that search.",
};

export default async function BlogPage() {
  const register = await getBlogRegister();

  const posts: BlogListingPost[] = register.map((post) => ({
    slug: post.slug,
    title: post.title,
    description: post.description,
    category: post.category,
    date: post.date,
    image: post.image,
    imageAlt: post.imageAlt || undefined,
  }));

  // Only the categories in use; the unfiltered option is the control's own, so
  // it is prepended here rather than baked into lib.
  const categories = [ALL_CATEGORIES, ...categoriesInUse(register)];

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
