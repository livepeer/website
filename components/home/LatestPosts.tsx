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
              title={
                <>
                  Keep up with the{" "}
                  <span className="text-foreground/50">latest on Livepeer</span>
                </>
              }
              description="Protocol updates, ecosystem launches, and the thinking behind real-time AI video — straight from the people building the network."
              align="split"
            />
          </motion.div>

          {/* Editorial card grid — mirrors the ecosystem "Discover applications
              built on Livepeer" section. Image lives in a standalone rounded
              panel with a thin ring; metadata sits below on the page background
              (no container), so the page rhythm flows from posters → captions
              consistently across both sections. */}
          <div className="mt-20 grid gap-x-6 gap-y-10 md:grid-cols-2 md:gap-y-12 lg:grid-cols-3">
            {posts.map((post) => (
              <motion.article
                key={post.slug}
                variants={fadeUp}
                transition={{ duration: 0.4 }}
              >
                <Link href={`/blog/${post.slug}`} className="group block">
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
                    <time dateTime={post.date}>{formatDate(post.date)}</time>
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
                    <span className="whitespace-nowrap">
                      {post.readingTime}
                    </span>
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
              className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-all duration-200 hover:bg-foreground/90 active:bg-foreground/80"
            >
              Read all posts <span aria-hidden="true">→</span>
            </Link>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}
