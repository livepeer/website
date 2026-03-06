"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Container from "@/components/ui/Container";
import SectionHeader from "@/components/ui/SectionHeader";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

/* ── Comparative vis: cost bars ── */
function CostVis() {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center gap-2.5">
        <span className="w-14 font-mono text-[10px] text-white/25">Cloud</span>
        <div className="h-2 flex-1 rounded-full bg-white/[0.04]">
          <motion.div
            className="h-full rounded-full bg-white/10"
            initial={{ width: 0 }}
            whileInView={{ width: "100%" }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
        <span className="font-mono text-[10px] text-white/25">$1.00</span>
      </div>
      <div className="flex items-center gap-2.5">
        <span className="w-14 font-mono text-[10px] text-emerald-400/50">
          Livepeer
        </span>
        <div className="h-2 flex-1 rounded-full bg-white/[0.04]">
          <motion.div
            className="h-full rounded-full bg-emerald-500/40"
            initial={{ width: 0 }}
            whileInView={{ width: "10%" }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.5 }}
          />
        </div>
        <span className="font-mono text-[10px] text-emerald-400/50">$0.10</span>
      </div>
    </div>
  );
}

/* ── Comparative vis: latency bars ── */
function LatencyVis() {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center gap-2.5">
        <span className="w-14 font-mono text-[10px] text-white/25">Cloud</span>
        <div className="h-2 flex-1 rounded-full bg-white/[0.04]">
          <motion.div
            className="h-full rounded-full bg-white/10"
            initial={{ width: 0 }}
            whileInView={{ width: "70%" }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
        <span className="font-mono text-[10px] text-white/25">2-5s</span>
      </div>
      <div className="flex items-center gap-2.5">
        <span className="w-14 font-mono text-[10px] text-emerald-400/50">
          Livepeer
        </span>
        <div className="h-2 flex-1 rounded-full bg-white/[0.04]">
          <motion.div
            className="h-full rounded-full bg-emerald-500/40"
            initial={{ width: 0 }}
            whileInView={{ width: "15%" }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.5 }}
          />
        </div>
        <span className="font-mono text-[10px] text-emerald-400/50">
          &lt;1s
        </span>
      </div>
    </div>
  );
}

/* ── Comparative vis: cold start indicators ── */
function ColdStartVis() {
  return (
    <div className="flex items-center gap-3">
      <motion.div
        className="flex items-center gap-2 rounded-md border border-white/[0.06] bg-white/[0.02] px-3 py-2"
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
      >
        <div className="h-2 w-2 rounded-full border border-white/20 border-t-transparent animate-spin" />
        <div className="flex flex-col">
          <span className="font-mono text-[10px] text-white/25">Cloud GPU</span>
          <span className="font-mono text-[10px] text-white/15">30-60s</span>
        </div>
      </motion.div>
      <motion.div
        className="flex items-center gap-2 rounded-md border border-emerald-500/15 bg-emerald-500/[0.04] px-3 py-2"
        initial={{ opacity: 0, scale: 0.5 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 25,
          delay: 0.6,
        }}
      >
        <motion.div
          className="h-2 w-2 rounded-full bg-emerald-400/70"
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 25,
            delay: 0.8,
          }}
        />
        <div className="flex flex-col">
          <span className="font-mono text-[10px] text-emerald-400/60">
            Livepeer
          </span>
          <span className="font-mono text-[10px] text-emerald-400/40">
            Instant
          </span>
        </div>
      </motion.div>
    </div>
  );
}

/* ── Comparative vis: elastic scale indicators ── */
function ScaleVis() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 rounded-md border border-white/[0.06] bg-white/[0.02] px-3 py-2">
        <div className="flex gap-[3px]">
          {[1, 1, 1, 1].map((_, i) => (
            <div key={i} className="h-3 w-1.5 rounded-sm bg-white/10" />
          ))}
        </div>
        <div className="flex flex-col">
          <span className="font-mono text-[10px] text-white/25">Cloud</span>
          <span className="font-mono text-[10px] text-white/15">Fixed</span>
        </div>
      </div>
      <div className="flex items-center gap-2 rounded-md border border-emerald-500/15 bg-emerald-500/[0.04] px-3 py-2">
        <div className="flex items-end gap-[3px]">
          {[1, 2, 3, 4, 5, 6].map((h, i) => (
            <motion.div
              key={i}
              className="w-1.5 rounded-sm"
              style={{
                background: `rgba(64,191,134,${0.25 + i * 0.08})`,
              }}
              initial={{ height: 0 }}
              whileInView={{ height: `${h * 2.5}px` }}
              viewport={{ once: true }}
              transition={{
                duration: 0.4,
                delay: 0.4 + i * 0.08,
                ease: "easeOut",
              }}
            />
          ))}
        </div>
        <div className="flex flex-col">
          <span className="font-mono text-[10px] text-emerald-400/60">
            Livepeer
          </span>
          <span className="font-mono text-[10px] text-emerald-400/40">
            Elastic
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Card wrapper ── */
function AdvantageCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={fadeUp}
      transition={{ duration: 0.4 }}
      className={`group relative flex flex-col overflow-hidden rounded-xl border border-white/[0.07] bg-[#1a1a1a] p-7 transition-colors duration-200 hover:border-white/[0.12] ${className}`}
    >
      {children}
    </motion.div>
  );
}

export default function WhyLivepeer() {
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      <div className="divider-gradient absolute top-0 left-0 right-0" />

      <Container className="relative">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          transition={{ staggerChildren: 0.06 }}
        >
          <motion.div variants={fadeUp} transition={{ duration: 0.4 }}>
            <SectionHeader
              label="Why Livepeer"
              title="Purpose-built for live AI inference"
              description="Where generic GPU clouds optimize for batch workloads, Livepeer is built from the ground up for continuous inference on live video streams."
              align="split"
            />
          </motion.div>

          <div className="mt-20 grid gap-4 sm:grid-cols-2">
            <AdvantageCard>
              <div className="font-mono text-5xl font-bold tracking-tight text-gradient lg:text-6xl">
                10x
              </div>
              <h3 className="mt-2 text-base font-medium">Cost Reduction</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-white/50">
                Usage-based GPU pricing with no reserved instances or idle capacity.
              </p>
              <div className="mt-5">
                <CostVis />
              </div>
            </AdvantageCard>

            <AdvantageCard>
              <div className="font-mono text-5xl font-bold tracking-tight text-gradient lg:text-6xl">
                &lt;1s
              </div>
              <h3 className="mt-2 text-base font-medium">
                Real-Time Latency
              </h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-white/50">
                Purpose-built for continuous, frame-by-frame AI inference on
                live video.
              </p>
              <div className="mt-5">
                <LatencyVis />
              </div>
            </AdvantageCard>

            <AdvantageCard>
              <div className="font-mono text-5xl font-bold tracking-tight text-gradient lg:text-6xl">
                0s
              </div>
              <h3 className="mt-2 text-base font-medium">Cold Start</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-white/50">
                Warm GPUs 24/7 — inference starts immediately on every stream.
              </p>
              <div className="mt-5">
                <ColdStartVis />
              </div>
            </AdvantageCard>

            <AdvantageCard>
              <div className="font-mono text-5xl font-bold tracking-tight text-gradient lg:text-6xl">
                ∞
              </div>
              <h3 className="mt-2 text-base font-medium">Elastic Scale</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-white/50">
                Go from 1 to 10,000 streams without provisioning a single GPU.
              </p>
              <div className="mt-5">
                <ScaleVis />
              </div>
            </AdvantageCard>
          </div>

          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.4 }}
            className="mt-10 text-center text-sm text-white/40"
          >
            Curious how it all works?{" "}
            <Link
              href="/primer"
              className="text-white/60 underline underline-offset-2 hover:text-white/80 transition-colors"
            >
              Read the 10-minute primer &rarr;
            </Link>
          </motion.p>
        </motion.div>
      </Container>
    </section>
  );
}
