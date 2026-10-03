import { notFound } from "next/navigation";

import { categoriesInUse, categoryFromSlug, categorySlug } from "@/lib/blog";
import { renderTitledCard, ogArt, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";
import { getBlogRegister } from "@/lib/register";

export const alt = "Livepeer Blog";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export async function generateStaticParams() {
  return categoriesInUse(await getBlogRegister()).map((name) => ({
    slug: categorySlug(name),
  }));
}

// The blog's frame with the category named on it. Without this file a category
// has no share image at all: the page's generateMetadata declares an
// `openGraph` object with no `images`, which drops the card it would otherwise
// inherit from /blog. The closed category set decides what exists, as on the
// page; a slug outside it 404s here too.
export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = categoryFromSlug(slug);
  if (!category) notFound();
  return renderTitledCard(ogArt.blog, category, "Blog");
}
