"use client";

import { motion } from "framer-motion";
import Container from "@/components/ui/Container";
import ImageMask from "@/components/ui/ImageMask";
import { useCountUp } from "@/lib/useCountUp";

function StatCard({
  target,
  prefix,
  suffix,
  label,
  description,
}: {
  target: number;
  prefix?: string;
  suffix?: string;
  label: string;
  description: string;
}) {
  const { ref, display } = useCountUp(target, { prefix, suffix, duration: 2500 });

  return (
    <motion.div
      ref={ref}
      variants={{
        hidden: { opacity: 0, y: 24 },
        visible: { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.5 }}
      className="group rounded-2xl border border-dark-border bg-dark-card/80 p-6 text-center backdrop-blur-sm transition-all hover:border-green/20"
    >
      <div className="font-mono text-5xl font-bold text-gradient lg:text-6xl">
        {display}
      </div>
      <div className="mt-3 text-sm font-medium text-white/90">{label}</div>
      <p className="mt-1 text-xs text-white/40">{description}</p>
    </motion.div>
  );
}

export default function NetworkStats() {
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      <div className="divider-gradient absolute top-0 left-0 right-0" />

      {/* B&W circuit board photo behind tile mask — section-level background */}
      <div className="pointer-events-none absolute inset-0 opacity-25" aria-hidden="true">
        <ImageMask
          video="/videos/ai-world.mp4"
          cols={5}
          rows={4}

          seed={99}
          className="h-full w-full"
        />
      </div>

      <Container className="relative">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          transition={{ staggerChildren: 0.1 }}
        >
          <motion.div
            variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <p className="mb-3 font-mono text-sm font-medium tracking-wider text-white/40 uppercase">
              Network
            </p>
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Proven at scale
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-white/60">
              The Livepeer network is live, battle-tested, and growing every day.
            </p>
          </motion.div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              target={100}
              suffix="K+"
              label="GPUs on network"
              description="Distributed globally across independent operators"
            />
            <StatCard
              target={40}
              prefix="$"
              suffix="M+"
              label="Total stake"
              description="LPT staked securing the network"
            />
            <StatCard
              target={150}
              suffix="M+"
              label="Minutes transcoded"
              description="Video processed through the network to date"
            />
            <StatCard
              target={10}
              suffix="x"
              label="Cost reduction"
              description="Compared to centralized cloud alternatives"
            />
          </div>
        </motion.div>
      </Container>

      <div className="divider-gradient absolute bottom-0 left-0 right-0" />
    </section>
  );
}
