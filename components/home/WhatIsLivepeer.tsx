"use client";

import { motion } from "framer-motion";
import Container from "@/components/ui/Container";
import SectionHeader from "@/components/ui/SectionHeader";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

/* ── Panel 1: API Keys visual ── */

function SpotlightCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-lg p-px"
      style={{
        background:
          "radial-gradient(ellipse 80% 60% at 25% 0%, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.0) 100%)",
      }}
    >
      <div className="relative overflow-hidden rounded-[7px] bg-[#181818]">
        {/* Spotlight + vignette + bottom fade — single coherent overlay */}
        <div
          className="pointer-events-none absolute inset-0 z-10"
          aria-hidden="true"
          style={{
            background: [
              "radial-gradient(ellipse 60% 50% at 25% 20%, rgba(255,255,255,0.07) 0%, transparent 100%)",
              "radial-gradient(ellipse 100% 80% at 50% 40%, transparent 30%, rgba(0,0,0,0.55) 100%)",
              "linear-gradient(to top, #121212 0%, rgba(18,18,18,0.7) 20%, transparent 50%)",
            ].join(", "),
          }}
        />
        {children}
      </div>
    </div>
  );
}

function ApiKeysVisual() {
  return (
    <SpotlightCard>
      <div>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] bg-white/[0.03] px-5 py-3.5">
          <span className="text-[14px] font-medium text-white/90">
            Developer API Manager
          </span>
          <button className="flex items-center gap-1.5 rounded-md bg-emerald-500/20 px-3 py-1.5 text-[12px] font-medium text-emerald-400">
            <svg
              className="h-3 w-3"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M6 3v6M3 6h6" strokeLinecap="round" />
            </svg>
            Create Key
          </button>
        </div>

        {/* Key row */}
        <div className="border-b border-white/[0.06] px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-500/15">
              <svg
                className="h-4 w-4 text-emerald-400/80"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.3"
              >
                <circle cx="5.5" cy="7" r="3" />
                <path d="M8 8.5l5 5M11 11.5l2-2" strokeLinecap="round" />
              </svg>
            </span>
            <div className="flex-1">
              <div className="text-[13px] font-medium text-white/80">
                production
              </div>
              <div className="mt-0.5 font-mono text-[11px] text-white/30">
                lp_sk_1a2b•••c8d9
              </div>
            </div>
            <span className="rounded-full bg-emerald-400/15 px-2.5 py-0.5 text-[10px] font-medium text-emerald-400/80">
              Active
            </span>
          </div>
        </div>

        {/* Billing provider */}
        <div className="px-5 py-4">
          <div className="mb-3 text-[11px] font-medium tracking-wide text-white/25 uppercase">
            Billing Provider
          </div>
          <div className="flex gap-2.5">
            <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/[0.08] px-4 py-2.5">
              <div
                className="h-4 w-4 rounded-[4px]"
                style={{
                  background:
                    "linear-gradient(135deg, #F73B41, #FF982E, #2FBEC5, #36619D)",
                }}
              />
              <span className="text-[12px] font-medium text-white/80">
                Daydream
              </span>
              <svg
                className="ml-1 h-3.5 w-3.5 text-emerald-400/70"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  d="M4 8l3 3 5-5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-2.5">
              <div className="h-4 w-4 rounded-[4px] bg-white/15" />
              <span className="text-[12px] font-medium text-white/30">
                Livepeer Studio
              </span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex items-center justify-between border-t border-white/[0.08] bg-white/[0.02] px-5 py-2.5">
          <span className="font-mono text-[10px] text-white/25">
            3 keys · 2 active
          </span>
          <span className="font-mono text-[10px] text-white/25">
            CDN: Enabled
          </span>
        </div>
      </div>
    </SpotlightCard>
  );
}

/* ── Panel 2: Models / Workflows visual ── */

function ModelsVisual() {
  return (
    <SpotlightCard>
      <div>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] bg-white/[0.03] px-5 py-3.5">
          <span className="text-[14px] font-medium text-white/90">Models</span>
          <div className="flex items-center gap-1.5 rounded-md bg-white/[0.05] px-2.5 py-1 text-[11px] text-white/30">
            <svg
              className="h-3 w-3"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.3"
            >
              <circle cx="6" cy="6" r="4" />
              <path d="M9 9l2 2" strokeLinecap="round" />
            </svg>
            Search models...
          </div>
        </div>

        {/* Model rows */}
        {[
          {
            name: "GameNGen",
            desc: "Real-time world generation",
            type: "world",
            color: "#34d399",
            latency: "12ms",
            price: "$0.006/min",
          },
          {
            name: "Depth Anything v2",
            desc: "Monocular depth estimation",
            type: "vision",
            color: "#60a5fa",
            latency: "8ms",
            price: "$0.003/min",
          },
          {
            name: "StreamDiffusion",
            desc: "Real-time image generation",
            type: "gen",
            color: "#a78bfa",
            latency: "24ms",
            price: "$0.008/min",
          },
          {
            name: "Whisper v3",
            desc: "Speech-to-text transcription",
            type: "audio",
            color: "#fbbf24",
            latency: "45ms",
            price: "$0.002/min",
          },
        ].map((m, i) => (
          <div
            key={m.name}
            className={`flex items-center gap-4 px-5 py-3.5 ${
              i === 0 ? "bg-white/[0.03]" : ""
            } ${i < 3 ? "border-b border-white/[0.05]" : ""}`}
          >
            <div
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg"
              style={{ background: `${m.color}18` }}
            >
              <div
                className="h-3.5 w-3.5 rounded-[3px]"
                style={{ background: `${m.color}66` }}
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-medium text-white/80">
                {m.name}
              </div>
              <div className="mt-0.5 text-[11px] text-white/30">{m.desc}</div>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-[10px] text-white/20">
                {m.price}
              </span>
              <span className="font-mono text-[10px] text-white/25">
                {m.latency}
              </span>
              <span
                className="rounded-full px-2 py-0.5 text-[9px] font-medium"
                style={{ background: `${m.color}20`, color: `${m.color}cc` }}
              >
                {m.type}
              </span>
            </div>
          </div>
        ))}

        {/* Bottom bar */}
        <div className="flex items-center justify-between border-t border-white/[0.08] bg-white/[0.02] px-5 py-2.5">
          <span className="font-mono text-[10px] text-white/25">
            12 models available
          </span>
          <span className="font-mono text-[10px] text-white/25">4 regions</span>
        </div>
      </div>
    </SpotlightCard>
  );
}

/* ── Panel 3: Start streaming visual ── */

function StreamVisual() {
  return (
    <SpotlightCard>
      <div>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] bg-white/[0.03] px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <span className="text-[14px] font-medium text-white/90">
              Stream
            </span>
            <span className="rounded-full bg-emerald-400/15 px-2 py-0.5 text-[10px] font-medium text-emerald-400/80">
              Live
            </span>
          </div>
          <span className="font-mono text-[11px] text-white/25">
            stream_8f3k2m
          </span>
        </div>

        {/* Request snippet */}
        <div className="border-b border-white/[0.06] px-5 py-3">
          <div className="rounded-md bg-black/30 px-3 py-2.5 font-mono text-[10px] leading-relaxed">
            <span className="text-emerald-400/60">POST</span>{" "}
            <span className="text-white/35">/v1/stream/start</span>
            <br />
            <span className="text-white/20">{"{"} workflow: </span>
            <span className="text-amber-400/50">
              &quot;world-model-v1&quot;
            </span>
            <span className="text-white/20">{" }"}</span>
          </div>
        </div>

        {/* Input/output flow */}
        <div className="border-b border-white/[0.06] px-5 py-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="mb-1.5 font-mono text-[9px] font-medium tracking-wider text-white/25 uppercase">
                Input
              </div>
              <div className="flex items-center gap-2 rounded-md border border-white/[0.08] bg-white/[0.03] px-3 py-2.5">
                <div className="flex gap-1">
                  {[0.1, 0.15, 0.08, 0.12, 0.18, 0.1].map((o, j) => (
                    <div
                      key={j}
                      className="h-6 w-4 rounded-[2px]"
                      style={{ background: `rgba(245,158,11,${o + 0.08})` }}
                    />
                  ))}
                </div>
                <span className="ml-auto font-mono text-[9px] text-white/25">
                  30 fps
                </span>
              </div>
            </div>
            <svg
              className="h-4 w-6 flex-shrink-0 text-white/20"
              viewBox="0 0 24 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                d="M0 8h20M16 4l4 4-4 4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="flex-1">
              <div className="mb-1.5 font-mono text-[9px] font-medium tracking-wider text-white/25 uppercase">
                Output
              </div>
              <div className="flex items-center gap-2 rounded-md border border-white/[0.08] bg-white/[0.03] px-3 py-2.5">
                <div className="flex gap-1">
                  {[0.12, 0.18, 0.1, 0.15, 0.2, 0.12].map((o, j) => (
                    <div
                      key={j}
                      className="h-6 w-4 rounded-[2px]"
                      style={{ background: `rgba(52,211,153,${o + 0.08})` }}
                    />
                  ))}
                </div>
                <span className="ml-auto font-mono text-[9px] text-white/25">
                  30 fps
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Session stats */}
        <div className="grid grid-cols-3 divide-x divide-white/[0.05]">
          {[
            { label: "Latency", value: "14ms" },
            { label: "Uptime", value: "4m 32s" },
            { label: "Frames", value: "8,142" },
          ].map((s) => (
            <div key={s.label} className="px-4 py-3.5 text-center">
              <div className="font-mono text-[9px] text-white/25">
                {s.label}
              </div>
              <div className="mt-1 font-mono text-[14px] font-medium text-white/70">
                {s.value}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex items-center justify-between border-t border-white/[0.08] bg-white/[0.02] px-5 py-2.5">
          <span className="font-mono text-[10px] text-white/25">
            US East · GPU A100
          </span>
          <span className="font-mono text-[10px] text-emerald-400/50">
            ● Connected
          </span>
        </div>
      </div>
    </SpotlightCard>
  );
}

/* ── Panel 4: Usage & SLAs visual ── */

const sparklinePoints =
  "0,32 15,30 30,34 45,28 60,31 75,25 90,29 105,22 120,27 135,20 150,24 165,18 180,22 195,16 210,20 225,14 240,19 255,15 270,18 285,13 300,17";

function UsageVisual() {
  return (
    <SpotlightCard>
      <div>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] bg-white/[0.03] px-5 py-3.5">
          <span className="text-[14px] font-medium text-white/90">
            Usage & SLAs
          </span>
          <span className="rounded-md bg-white/[0.06] px-2.5 py-1 text-[11px] text-white/35">
            Last 24h
          </span>
        </div>

        {/* Chart area */}
        <div className="border-b border-white/[0.06] px-5 py-4">
          <div className="mb-2 flex items-baseline gap-3">
            <span className="font-mono text-[22px] font-semibold text-white/90">
              14ms
            </span>
            <span className="font-mono text-[11px] text-white/30">
              avg latency
            </span>
            <span className="ml-auto font-mono text-[11px] text-emerald-400/70">
              ↓ 12% vs yesterday
            </span>
          </div>
          <svg
            viewBox="0 0 300 40"
            className="h-[56px] w-full"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(52,211,153,0.15)" />
                <stop offset="100%" stopColor="rgba(52,211,153,0)" />
              </linearGradient>
            </defs>
            <polygon
              points={`0,40 ${sparklinePoints} 300,40`}
              fill="url(#chartFill)"
            />
            <polyline
              points={sparklinePoints}
              fill="none"
              stroke="rgba(52,211,153,0.55)"
              strokeWidth="1.5"
            />
          </svg>
        </div>

        {/* SLA rows */}
        {[
          { label: "Uptime", value: "99.97%", sla: "99.9%" },
          { label: "Failure Rate", value: "0.02%", sla: "<0.1%" },
          { label: "Swap Rate", value: "1.2%", sla: "<5%" },
        ].map((m, i) => (
          <div
            key={m.label}
            className={`flex items-center justify-between px-5 py-2.5 ${
              i < 2 ? "border-b border-white/[0.05]" : ""
            }`}
          >
            <span className="text-[12px] text-white/50">{m.label}</span>
            <div className="flex items-center gap-3">
              <span className="font-mono text-[12px] text-white/60">
                {m.value}
              </span>
              <span className="font-mono text-[10px] text-white/20">
                {m.sla}
              </span>
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400/15">
                <svg
                  className="h-3 w-3 text-emerald-400/80"
                  viewBox="0 0 12 12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    d="M3 6l2 2 4-4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </div>
          </div>
        ))}

        {/* Bottom bar */}
        <div className="flex items-center justify-between border-t border-white/[0.08] bg-white/[0.02] px-5 py-2.5">
          <span className="font-mono text-[10px] text-white/25">
            All SLAs passing
          </span>
          <span className="font-mono text-[10px] text-emerald-400/50">
            ● Healthy
          </span>
        </div>
      </div>
    </SpotlightCard>
  );
}

/* ── Section ── */

export default function WhatIsLivepeer() {
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      <div className="divider-gradient absolute top-0 left-0 right-0" />

      <Container className="relative">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          transition={{ staggerChildren: 0.08 }}
        >
          <motion.div variants={fadeUp} transition={{ duration: 0.4 }}>
            <SectionHeader
              label="About Livepeer"
              title="Real‑time AI video APIs for developers and agents alike"
              description="Get an API key, pick a model, start sending frames. The network handles GPU routing, billing, and SLA enforcement."
              align="split"
            />
          </motion.div>

          {/* Single surface — all 4 panels */}
          <motion.div
            className="mt-20 rounded-2xl border border-white/[0.06] bg-dark"
            variants={fadeUp}
            transition={{ duration: 0.4 }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2">
              {[
                {
                  Visual: ApiKeysVisual,
                  title: "Authenticate & connect",
                  description:
                    "Create an API key and choose a billing provider. Your key authenticates requests, your provider handles routing and payments.",
                  step: "1",
                },
                {
                  Visual: ModelsVisual,
                  title: "Pick a model",
                  description:
                    "Browse available models optimized for real-time inference. See latency, type, and health across the network.",
                  step: "2",
                },
                {
                  Visual: StreamVisual,
                  title: "Start streaming",
                  description:
                    "Open a session, send frames, receive outputs. The gateway routes your stream to the best-performing GPU provider.",
                  step: "3",
                },
                {
                  Visual: UsageVisual,
                  title: "Ship with confidence",
                  description:
                    "Published SLAs on latency, uptime, and failure rate. Track performance per workflow, region, and GPU provider.",
                  step: "4",
                },
              ].map((panel, i) => (
                <div
                  key={i}
                  className={`p-6 sm:p-8 ${
                    /* vertical dividers */
                    i % 2 === 0 ? "sm:border-r sm:border-white/[0.06]" : ""
                  } ${
                    /* horizontal dividers */
                    i < 2 ? "border-b border-white/[0.06]" : ""
                  }`}
                >
                  {/* Visual area — fixed height so all panels align */}
                  <div className="relative h-[300px] sm:h-[340px] overflow-hidden">
                    <div className="pt-6 sm:pt-8">
                      <panel.Visual />
                    </div>
                    {/* Bottom fade-out — sits above SpotlightCard to blend into panel bg */}
                    <div
                      className="pointer-events-none absolute bottom-0 left-0 right-0 z-20 h-28 sm:h-36"
                      style={{
                        background:
                          "linear-gradient(to top, #121212 0%, rgba(18,18,18,0.85) 30%, rgba(18,18,18,0.4) 60%, transparent 100%)",
                      }}
                    />
                  </div>
                  {/* Text */}
                  <div className="pt-8">
                    <h3 className="text-base font-semibold text-white/90">
                      <span className="mr-2.5 text-white/20">
                        {panel.step}.
                      </span>
                      {panel.title}
                    </h3>
                    <p className="mt-2 text-[14px] leading-relaxed text-white/40">
                      {panel.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}
