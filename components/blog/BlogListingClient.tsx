"use client";

import { useState } from "react";
import BlogCategoryFilter from "@/components/blog/BlogCategoryFilter";
import BlogPostCard from "@/components/blog/BlogPostCard";
import type { BlogPost } from "@/lib/blog";

export default function BlogListingClient({
  posts,
  categories,
}: {
  posts: BlogPost[];
  categories: string[];
}) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filteredPosts = activeCategory
    ? posts.filter((p) => p.category === activeCategory)
    : posts;

  return (
    <>
      <div className="mb-10">
        <BlogCategoryFilter
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredPosts.map((post, i) => (
          <BlogPostCard key={post.slug} post={post} index={i} />
        ))}
      </div>

      {filteredPosts.length === 0 && (
        <p className="py-16 text-center font-mono text-sm text-foreground/30">
          No posts in this category yet.
        </p>
      )}
    </>
  );
}
