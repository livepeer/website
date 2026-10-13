import { BlogListing } from "@/components/livepeer-ui/blog-listing";
import { getBlogRegister } from "@/lib/register";

import { blog, categoryLinks, toListingPosts } from "./listing";

// The posts come from the register — Notion when there is a token,
// content/blog when there is not (see CLAUDE.md → Content). Metadata lives in
// layout.tsx, which this route already had; the copy and the rail are built
// in listing.ts, shared with the category pages.
export default async function BlogPage() {
  const register = await getBlogRegister();

  return (
    <BlogListing
      posts={toListingPosts(register)}
      heading={blog.heading}
      allHref={blog.allHref}
      categories={categoryLinks(register)}
      active={null}
      siblings={blog.siblings}
      feedHref={blog.feedHref}
      searchPlaceholder={blog.searchPlaceholder}
      emptyMessage={blog.emptyMessage}
    />
  );
}
