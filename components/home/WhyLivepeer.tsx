"use client";

import { motion } from "framer-motion";
import Container from "@/components/ui/Container";
import SectionHeader from "@/components/ui/SectionHeader";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

/* ── Comparative vis: latency bars ── */
function LatencyVis() {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center gap-2.5">
        <span className="w-14 font-mono text-[10px] text-white/25">Cloud</span>
        <div className="h-2 flex-1 rounded-full bg-white/[0.04]">
          <div className="h-full w-[70%] rounded-full bg-white/10" />
        </div>
        <span className="font-mono text-[10px] text-white/25">2-5s</span>
      </div>
      <div className="flex items-center gap-2.5">
        <span className="w-14 font-mono text-[10px] text-emerald-400/50">Livepeer</span>
        <div className="h-2 flex-1 rounded-full bg-white/[0.04]">
          <div className="h-full w-[15%] rounded-full bg-emerald-500/40" />
        </div>
        <span className="font-mono text-[10px] text-emerald-400/50">&lt;1s</span>
      </div>
    </div>
  );
}

/* ── Comparative vis: cost bars ── */
function CostVis() {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center gap-2.5">
        <span className="w-14 font-mono text-[10px] text-white/25">Cloud</span>
        <div className="h-2 flex-1 rounded-full bg-white/[0.04]">
          <div className="h-full w-full rounded-full bg-white/10" />
        </div>
        <span className="font-mono text-[10px] text-white/25">$1.00</span>
      </div>
      <div className="flex items-center gap-2.5">
        <span className="w-14 font-mono text-[10px] text-emerald-400/50">Livepeer</span>
        <div className="h-2 flex-1 rounded-full bg-white/[0.04]">
          <div className="h-full w-[10%] rounded-full bg-emerald-500/40" />
        </div>
        <span className="font-mono text-[10px] text-emerald-400/50">$0.10</span>
      </div>
    </div>
  );
}

/* ── Comparative vis: cold start indicators ── */
function ColdStartVis() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 rounded-md border border-white/[0.06] bg-white/[0.02] px-3 py-2">
        <div className="h-2 w-2 rounded-full border border-white/20 border-t-transparent animate-spin" />
        <div className="flex flex-col">
          <span className="font-mono text-[10px] text-white/25">Cloud GPU</span>
          <span className="font-mono text-[10px] text-white/15">30-60s</span>
        </div>
      </div>
      <div className="flex items-center gap-2 rounded-md border border-emerald-500/15 bg-emerald-500/[0.04] px-3 py-2">
        <div className="h-2 w-2 rounded-full bg-emerald-400/70" />
        <div className="flex flex-col">
          <span className="font-mono text-[10px] text-emerald-400/60">Livepeer</span>
          <span className="font-mono text-[10px] text-emerald-400/40">Instant</span>
        </div>
      </div>
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
            <div
              key={i}
              className="w-1.5 rounded-sm"
              style={{
                height: `${h * 2.5}px`,
                background: `rgba(52,211,153,${0.25 + i * 0.08})`,
              }}
            />
          ))}
        </div>
        <div className="flex flex-col">
          <span className="font-mono text-[10px] text-emerald-400/60">Livepeer</span>
          <span className="font-mono text-[10px] text-emerald-400/40">Elastic</span>
        </div>
      </div>
    </div>
  );
}

export default function WhyLivepeer() {
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      <div className="divider-gradient absolute top-0 left-0 right-0" />

      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 60%, rgba(24,121,78,0.08) 0%, transparent 70%)",
        }}
      />

      <Container className="relative">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          transition={{ staggerChildren: 0.12 }}
        >
          <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
            <SectionHeader
              label="Why Livepeer"
              title="Built for real-time"
              description="Where generic GPU clouds optimize for batch jobs and static inputs, Livepeer is purpose-built for continuous AI inference on live video."
            />
          </motion.div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2">
            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="group flex flex-col rounded-2xl border border-dark-border bg-dark-card p-7 transition-all hover:border-green/20"
            >
              <div className="font-mono text-4xl font-bold text-gradient lg:text-5xl">
                10x
              </div>
              <h3 className="mt-2 text-base font-medium">Cost Reduction</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-white/50">
                Usage-based GPU pricing with no reserved instances or idle capacity.
              </p>
              <div className="mt-5">
                <CostVis />
              </div>
            </motion.div>
            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="group flex flex-col rounded-2xl border border-dark-border bg-dark-card p-7 transition-all hover:border-green/20"
            >
              <div className="font-mono text-4xl font-bold text-gradient lg:text-5xl">
                &lt;1s
              </div>
              <h3 className="mt-2 text-base font-medium">Real-Time Latency</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-white/50">
                Purpose-built for continuous, frame-by-frame AI inference on live video.
              </p>
              <div className="mt-5">
                <LatencyVis />
              </div>
            </motion.div>

            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="group flex flex-col rounded-2xl border border-dark-border bg-dark-card p-7 transition-all hover:border-green/20"
            >
              <div className="font-mono text-4xl font-bold text-gradient lg:text-5xl">
                0s
              </div>
              <h3 className="mt-2 text-base font-medium">Cold Start</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-white/50">
                Warm GPUs 24/7 — inference starts immediately on every stream.
              </p>
              <div className="mt-5">
                <ColdStartVis />
              </div>
            </motion.div>

            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="group flex flex-col rounded-2xl border border-dark-border bg-dark-card p-7 transition-all hover:border-green/20"
            >
              <div className="font-mono text-4xl font-bold text-gradient lg:text-5xl">
                ∞
              </div>
              <h3 className="mt-2 text-base font-medium">Elastic Scale</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-white/50">
                Go from 1 to 10,000 streams without provisioning a single GPU.
              </p>
              <div className="mt-5">
                <ScaleVis />
              </div>
            </motion.div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
