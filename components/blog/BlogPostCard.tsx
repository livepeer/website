"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { BlogPost } from "@/lib/blog";

/**
 * Editorial card — image panel + caption below on the page background.
 * Shares the rhythm of the ecosystem "Discover applications built on
 * Livepeer" cards: thin-ring poster panel, mono category line, large
 * title, body description, hover lift.
 */
export default function BlogPostCard({
  post,
  index = 0,
}: {
  post: BlogPost;
  index?: number;
}) {
  const formattedDate = new Date(post.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link
        href={`/blog/${post.slug}`}
        className="group block select-none"
      >
        {post.image && (
          <div className="relative aspect-[16/10] overflow-hidden rounded-xl transition-transform duration-300 group-hover:-translate-y-0.5">
            <img
              src={post.image}
              alt={post.imageAlt || post.title}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            />
          </div>
        )}
        <p className="mt-5 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-foreground/45">
          <span>{post.category}</span>
          <span className="mx-2 text-foreground/15">·</span>
          <time dateTime={post.date}>{formattedDate}</time>
        </p>
        <h3 className="mt-2 text-[19px] font-medium leading-snug tracking-tight text-foreground transition-colors group-hover:text-green-light lg:text-[21px]">
          {post.title}
        </h3>
        {post.description && (
          <p className="mt-3 line-clamp-2 text-[14.5px] leading-relaxed text-foreground/50">
            {post.description}
          </p>
        )}
        <div className="mt-4 flex items-center gap-2 font-mono text-[11px] text-foreground/30">
          {post.author && (
            <>
              <span className="truncate">{post.author.name}</span>
              <span>·</span>
            </>
          )}
          <span className="whitespace-nowrap">{post.readingTime}</span>
        </div>
      </Link>
    </motion.article>
  );
}
