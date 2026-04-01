"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { BlogPost } from "@/lib/blog";

export default function BlogPostHeader({ post }: { post: BlogPost }) {
  const formattedDate = new Date(post.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <motion.header
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mb-12"
    >
      {/* Breadcrumb */}
      <div className="mb-8 flex items-center gap-2 font-mono text-sm text-white/30">
        <Link href="/blog" className="transition-colors hover:text-white/60">
          Blog
        </Link>
        <span>›</span>
        <span className="text-white/50">{post.category}</span>
      </div>

      {/* Title */}
      <h1 className="max-w-2xl text-3xl font-bold tracking-tight text-balance sm:text-4xl lg:text-[2.75rem] lg:leading-[1.15]">
        {post.title}
      </h1>

      {/* Meta row */}
      <div className="mt-6 flex items-center gap-3 font-mono text-sm text-white/40">
        {post.author && (
          <>
            <span>{post.author.name}</span>
            <span>·</span>
          </>
        )}
        <time dateTime={post.date}>{formattedDate}</time>
        <span>·</span>
        <span>{post.readingTime}</span>
      </div>

      {/* Featured image */}
      {post.image && (
        <div className="mt-10 overflow-hidden rounded-xl border border-dark-border">
          <img
            src={post.image}
            alt={post.imageAlt || post.title}
            className="w-full"
          />
        </div>
      )}
    </motion.header>
  );
}
