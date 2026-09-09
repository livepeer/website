import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BlogListing } from "@/components/livepeer-ui/blog-listing";
import { categoriesInUse, categoryFromSlug, categorySlug } from "@/lib/blog";
import { getBlogRegister } from "@/lib/register";

import { blog, categoryLinks, toListingPosts } from "../../listing";

type Props = {
  params: Promise<{ slug: string }>;
};

/**
 * One category of the blog, at its own address.
 *
 * The same index filtered to one category, so a category can be linked to
 * and found by a crawler, which a filter held in client state never can.
 * Only categories with a post get a page: a page whose only content is "no
 * posts" is a dead end, and the rail hides those categories for the same
 * reason.
 *
 * No `dynamicParams = false`, for the reason the post route gives: the first
 * post in a category can be published in Notion after the last build, and
 * its category page has to exist the moment the rail starts linking to it.
 * An unknown slug still 404s — the closed category set decides, below.
 */
export async function generateStaticParams() {
  const register = await getBlogRegister();
  return categoriesInUse(register).map((name) => ({
    slug: categorySlug(name),
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = categoryFromSlug(slug);
  if (!category) return { title: "Not Found — Livepeer Blog" };
  const title = `${category} | Livepeer Blog`;
  return {
    title,
    openGraph: { title },
    twitter: { title },
  };
}

export default async function BlogCategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = categoryFromSlug(slug);
  if (!category) notFound();

  const register = await getBlogRegister();
  const posts = register.filter((post) => post.category === category);
  if (posts.length === 0) notFound();

  return (
    <BlogListing
      posts={toListingPosts(posts)}
      heading={blog.heading}
      allHref={blog.allHref}
      categories={categoryLinks(register)}
      active={category}
      siblings={blog.siblings}
      searchPlaceholder={blog.searchPlaceholder}
      emptyMessage={blog.emptyMessage}
    />
  );
}
