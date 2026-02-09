"use client";

import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import { EXTERNAL_LINKS } from "@/lib/constants";

export default function Hero() {
  return (
    <section className="relative flex min-h-[90vh] items-center overflow-hidden">
      {/* Subtle radial gradient */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 40%, rgba(24,121,78,0.08) 0%, transparent 70%)",
        }}
      />

      <Container className="relative py-32">
        <motion.div
          className="mx-auto max-w-4xl text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h1 className="text-5xl font-bold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
            Open real-time video
            <br />
            infrastructure
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/60 sm:text-xl">
            Livepeer is the leading open AI infrastructure for real-time
            video&nbsp;&mdash; powering transcoding, livestreaming, and AI video
            processing with sub-second latency at a fraction of the cost.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button href={EXTERNAL_LINKS.docs} variant="primary">
              Start Building <span aria-hidden="true">&rarr;</span>
            </Button>
            <Button href="/network" variant="secondary">
              Explore the Network
            </Button>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
