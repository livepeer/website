"use client";

import { motion } from "framer-motion";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { EXTERNAL_LINKS } from "@/lib/constants";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const guides = [
  {
    title: "Video Transcoding",
    description:
      "Transcode video on demand or in real-time with adaptive bitrate output. Integrate in minutes with a simple API.",
    badge: "Core",
    href: EXTERNAL_LINKS.docs,
  },
  {
    title: "Livestreaming",
    description:
      "Deliver low-latency live video at scale. RTMP ingest, HLS output, global distribution built in.",
    badge: "Core",
    href: EXTERNAL_LINKS.docs,
  },
  {
    title: "AI Video Processing",
    description:
      "Deploy custom AI models on real-time video streams — object detection, generative overlays, scene understanding, and more.",
    badge: "AI",
    href: EXTERNAL_LINKS.docs,
  },
  {
    title: "World Models & Robotics",
    description:
      "Run world model inference on video feeds for gaming, robotics, and synthetic data generation with sub-second latency.",
    badge: "AI",
    href: EXTERNAL_LINKS.docs,
  },
];

const sdks = [
  {
    name: "JavaScript SDK",
    description: "Full-featured client for Node.js and browser environments.",
    icon: "JS",
  },
  {
    name: "Go SDK",
    description: "Native Go client for backend services and infrastructure.",
    icon: "Go",
  },
  {
    name: "REST API",
    description: "Language-agnostic HTTP API for any platform.",
    icon: "{}",
  },
];

export default function DevelopersPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative flex items-center overflow-hidden py-32 lg:py-40">
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 40%, rgba(24,121,78,0.08) 0%, transparent 70%)",
          }}
        />
        <Container className="relative">
          <motion.div
            className="mx-auto max-w-3xl text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <p className="mb-3 font-mono text-sm font-medium tracking-wider text-green uppercase">
              Developers
            </p>
            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Build with Livepeer
            </h1>
            <p className="mt-6 text-lg text-white/60">
              Everything you need to integrate real-time video transcoding, livestreaming, and AI
              processing into your application.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button href={EXTERNAL_LINKS.docs} variant="primary">
                Read the Docs <span aria-hidden="true">&rarr;</span>
              </Button>
              <Button href={EXTERNAL_LINKS.github} variant="secondary">
                View on GitHub
              </Button>
            </div>
          </motion.div>
        </Container>
      </section>

      {/* Use cases */}
      <section className="border-t border-white/5 bg-dark-lighter py-24 lg:py-32">
        <Container>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            transition={{ staggerChildren: 0.1 }}
          >
            <motion.div variants={fadeUp} transition={{ duration: 0.5 }} className="text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                What you can build
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-white/60">
                From traditional video streaming to cutting-edge AI — all on open infrastructure.
              </p>
            </motion.div>

            <div className="mt-16 grid gap-6 sm:grid-cols-2">
              {guides.map((guide) => (
                <motion.a
                  key={guide.title}
                  href={guide.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  variants={fadeUp}
                  transition={{ duration: 0.5 }}
                  className="block"
                >
                  <Card className="h-full transition-colors hover:border-green/20">
                    <Badge>{guide.badge}</Badge>
                    <h3 className="mt-4 text-lg font-medium">{guide.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/50">
                      {guide.description}
                    </p>
                  </Card>
                </motion.a>
              ))}
            </div>
          </motion.div>
        </Container>
      </section>

      {/* SDKs */}
      <section className="py-24 lg:py-32">
        <Container>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            transition={{ staggerChildren: 0.1 }}
          >
            <motion.div variants={fadeUp} transition={{ duration: 0.5 }} className="text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                SDKs & tools
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-white/60">
                Client libraries and developer tools to get you building fast.
              </p>
            </motion.div>

            <div className="mt-16 grid gap-6 md:grid-cols-3">
              {sdks.map((sdk) => (
                <motion.div key={sdk.name} variants={fadeUp} transition={{ duration: 0.5 }}>
                  <Card className="h-full text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-dark-border bg-dark font-mono text-sm font-bold text-green">
                      {sdk.icon}
                    </div>
                    <h3 className="mt-4 text-lg font-medium">{sdk.name}</h3>
                    <p className="mt-2 text-sm text-white/50">{sdk.description}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </Container>
      </section>

      {/* Grants CTA */}
      <section className="border-t border-white/5 bg-dark-lighter py-24 lg:py-32">
        <Container>
          <motion.div
            className="mx-auto max-w-2xl text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="mb-3 font-mono text-sm font-medium tracking-wider text-green uppercase">
              Grants
            </p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Get funded to build
            </h2>
            <p className="mt-4 text-lg text-white/60">
              The Livepeer Grants program funds teams and individuals building
              applications, tooling, and infrastructure on the network.
            </p>
            <div className="mt-8">
              <Button href={EXTERNAL_LINKS.grants} variant="primary">
                Apply for a Grant <span aria-hidden="true">&rarr;</span>
              </Button>
            </div>
          </motion.div>
        </Container>
      </section>
    </>
  );
}
