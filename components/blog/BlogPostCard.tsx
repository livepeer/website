"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Badge from "@/components/ui/Badge";
import type { BlogPost } from "@/lib/blog";

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
      className="h-full"
    >
      <Link
        href={`/blog/${post.slug}`}
        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-dark-border bg-dark-card transition-colors hover:border-white/10 select-none"
      >
        {post.image && (
          <div className="aspect-[16/9] overflow-hidden border-b border-white/[0.06]">
            <img
              src={post.image}
              alt={post.imageAlt || post.title}
              className="h-full w-full scale-110 object-cover transition-transform duration-500 group-hover:scale-[1.12]"
            />
          </div>
        )}

        <div className="flex flex-1 flex-col p-6">
          <div className="mb-3">
            <Badge>{post.category}</Badge>
          </div>

          <h3 className="text-xl font-bold tracking-tight text-white transition-colors group-hover:text-green-light">
            {post.title}
          </h3>

          {post.description && (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-white/40">
              {post.description}
            </p>
          )}

          <div className="mt-auto flex items-center gap-2 pt-4 font-mono text-xs text-white/25">
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
        </div>
      </Link>
    </motion.article>
  );
}
