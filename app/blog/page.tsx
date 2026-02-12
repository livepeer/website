"use client";

import { motion } from "framer-motion";
import Container from "@/components/ui/Container";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const posts = [
  {
    title: "A Real-Time Update to the Livepeer Network Vision",
    excerpt:
      "Livepeer is evolving from video transcoding infrastructure to AI infrastructure for real-time video — targeting world models, robotics, and interactive AI experiences.",
    date: "2025-01-15",
    category: "Vision",
    href: "https://blog.livepeer.org/a-real-time-update-to-the-livepeer-network-vision/",
  },
  {
    title: "AI Video Processing on the Livepeer Network",
    excerpt:
      "Introducing support for custom AI model deployment on the Livepeer network, enabling real-time object detection, generative overlays, and scene understanding on live video.",
    date: "2024-11-20",
    category: "Product",
    href: "#",
  },
  {
    title: "Livepeer Network Performance Report Q4 2024",
    excerpt:
      "A look at network growth, transcoding volume, orchestrator performance, and ecosystem development over the last quarter.",
    date: "2024-10-30",
    category: "Network",
    href: "#",
  },
  {
    title: "Building for Open Social: Livepeer and Farcaster",
    excerpt:
      "How Livepeer is powering video infrastructure for the next generation of open, programmable social networks.",
    date: "2024-09-15",
    category: "Ecosystem",
    href: "#",
  },
  {
    title: "Introducing Sub-Second Latency for AI Workflows",
    excerpt:
      "New optimizations to the orchestrator pipeline enable sub-second latency for AI inference on live video streams.",
    date: "2024-08-22",
    category: "Product",
    href: "#",
  },
  {
    title: "Community Treasury: First Year in Review",
    excerpt:
      "An overview of how the Livepeer community treasury has funded grants, bounties, and ecosystem growth in its first year.",
    date: "2024-07-10",
    category: "Community",
    href: "#",
  },
];

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function BlogPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative flex items-center overflow-hidden py-32 lg:py-40">
        <Container className="relative">
          <motion.div
            className="mx-auto max-w-3xl text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <p className="mb-3 font-mono text-sm font-medium tracking-wider text-white/40 uppercase">
              Blog
            </p>
            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-7xl">
              Blog
            </h1>
            <p className="mt-6 text-lg text-white/60">
              Updates, announcements, and insights from the Livepeer ecosystem.
            </p>
          </motion.div>
        </Container>
      </section>

      {/* Posts grid */}
      <section className="relative pb-24 lg:pb-32">
        <div className="divider-gradient absolute top-0 left-0 right-0" />
        <Container>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            transition={{ staggerChildren: 0.08 }}
            className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {posts.map((post) => (
              <motion.a
                key={post.title}
                href={post.href}
                target={post.href.startsWith("http") ? "_blank" : undefined}
                rel={
                  post.href.startsWith("http")
                    ? "noopener noreferrer"
                    : undefined
                }
                variants={fadeUp}
                transition={{ duration: 0.5 }}
                className="block"
              >
                <Card className="flex h-full flex-col transition-colors hover:border-green/20">
                  <div className="flex items-center justify-between">
                    <Badge>{post.category}</Badge>
                    <span className="font-mono text-xs text-white/30">
                      {formatDate(post.date)}
                    </span>
                  </div>
                  <h2 className="mt-4 text-lg font-medium leading-snug">
                    {post.title}
                  </h2>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-white/50">
                    {post.excerpt}
                  </p>
                  <span className="mt-4 text-sm text-green">
                    Read more <span aria-hidden="true">&rarr;</span>
                  </span>
                </Card>
              </motion.a>
            ))}
          </motion.div>
        </Container>
      </section>
    </>
  );
}
