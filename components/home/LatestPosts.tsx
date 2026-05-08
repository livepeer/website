"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Container from "@/components/ui/Container";
import SectionHeader from "@/components/ui/SectionHeader";
import type { BlogPost } from "@/lib/blog";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function LatestPosts({ posts }: { posts: BlogPost[] }) {
  if (!posts.length) return null;

  return (
    <section className="relative py-24 lg:py-32">
      <div className="divider-gradient absolute top-0 right-0 left-0" />
      <Container>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          transition={{ staggerChildren: 0.06 }}
        >
          <motion.div variants={fadeUp} transition={{ duration: 0.4 }}>
            <SectionHeader
              label="Field Notes"
              title="Keep up with the latest on Livepeer"
              description="Protocol updates, ecosystem launches, and the thinking behind real-time AI video — straight from the people building the network."
              align="split"
            />
          </motion.div>

          <div className="mt-20 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <motion.article
                key={post.slug}
                variants={fadeUp}
                transition={{ duration: 0.4 }}
                className="h-full"
              >
                <Link
                  href={`/blog/${post.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-xl border border-white/[0.07] bg-[#1a1a1a] transition-colors hover:border-white/[0.14]"
                >
                  {post.image && (
                    <div className="relative aspect-[16/10] overflow-hidden border-b border-white/[0.06]">
                      <img
                        src={post.image}
                        alt={post.imageAlt || post.title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                      />
                      <div
                        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"
                        aria-hidden="true"
                      />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-6">
                    <div className="mb-3 flex items-center gap-2 font-mono text-[11px] tracking-wider uppercase">
                      <span className="text-green-light/70">
                        {post.category}
                      </span>
                      <span className="text-white/15">·</span>
                      <time dateTime={post.date} className="text-white/30">
                        {formatDate(post.date)}
                      </time>
                    </div>
                    <h3 className="line-clamp-3 text-[17px] leading-snug font-semibold tracking-tight text-white transition-colors group-hover:text-green-light">
                      {post.title}
                    </h3>
                    {post.description && (
                      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-white/40">
                        {post.description}
                      </p>
                    )}
                    <div className="mt-auto flex items-center gap-2 pt-5 font-mono text-[11px] text-white/25">
                      {post.author && (
                        <>
                          <span className="truncate">{post.author.name}</span>
                          <span>·</span>
                        </>
                      )}
                      <span className="whitespace-nowrap">
                        {post.readingTime}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>

          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.4 }}
            className="mt-12 text-center"
          >
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 rounded-lg px-5 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:brightness-110 active:brightness-95"
              style={{
                background:
                  "linear-gradient(135deg, #1E9960 0%, #18794E 60%, #115C3B 100%)",
              }}
            >
              Read all posts <span aria-hidden="true">→</span>
            </Link>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}
