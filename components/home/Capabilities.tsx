"use client";

import { motion } from "framer-motion";
import Container from "@/components/ui/Container";
import SectionHeader from "@/components/ui/SectionHeader";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

/* ── Illustration: AI-Generated World ── */
function WorldsVisual() {
  return (
    <div className="relative min-h-[180px] overflow-hidden rounded-lg bg-[#070b0a]">
      {/* Sky gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a1a14] via-[#071210] to-[#0d0d0d]" />

      {/* Stars */}
      {[
        [12, 8], [28, 14], [45, 6], [62, 18], [78, 10], [88, 22],
        [18, 24], [52, 20], [70, 12], [35, 16],
      ].map(([x, y], i) => (
        <div
          key={i}
          className="absolute h-px w-px rounded-full bg-white/30"
          style={{ left: `${x}%`, top: `${y}%` }}
        />
      ))}

      {/* Terrain layers — SVG landscape */}
      <svg
        className="absolute bottom-0 left-0 right-0 h-[60%]"
        viewBox="0 0 400 120"
        preserveAspectRatio="none"
        fill="none"
      >
        {/* Far mountains */}
        <path
          d="M0 80 L40 45 L80 65 L130 30 L180 55 L220 25 L270 50 L320 35 L360 55 L400 40 V120 H0Z"
          fill="rgba(24,121,78,0.08)"
        />
        {/* Mid hills */}
        <path
          d="M0 95 L50 70 L100 85 L160 60 L210 78 L260 65 L320 80 L370 70 L400 82 V120 H0Z"
          fill="rgba(24,121,78,0.12)"
        />
        {/* Foreground */}
        <path
          d="M0 105 L60 92 L120 100 L180 88 L240 98 L300 90 L360 96 L400 92 V120 H0Z"
          fill="rgba(24,121,78,0.18)"
        />
        {/* Grid lines overlaying terrain */}
        {[0, 50, 100, 150, 200, 250, 300, 350, 400].map((x) => (
          <line key={`v${x}`} x1={x} y1="0" x2={x} y2="120" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
        ))}
        {[0, 30, 60, 90, 120].map((y) => (
          <line key={`h${y}`} x1="0" y1={y} x2="400" y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
        ))}
      </svg>

      {/* Generation scan line */}
      <div
        className="pointer-events-none absolute inset-x-0 h-px"
        style={{
          top: "52%",
          background: "linear-gradient(to right, transparent, rgba(52,211,153,0.2) 30%, rgba(52,211,153,0.3) 50%, rgba(52,211,153,0.2) 70%, transparent)",
        }}
      />

      {/* HUD */}
      <div className="absolute left-3 top-2.5 font-mono text-[9px] text-emerald-400/50">
        GENERATING
      </div>
      <div className="absolute right-3 top-2.5 font-mono text-[9px] text-white/20">
        60 FPS
      </div>
      <div className="absolute bottom-2.5 left-3 font-mono text-[9px] text-white/20">
        Frame 1,847 &middot; 12ms
      </div>
    </div>
  );
}

/* ── Illustration: Real-Time Video Analysis ── */
function AnalysisVisual() {
  const boxes = [
    { x: 10, y: 15, w: 20, h: 40, label: "person", color: "#34d399" },
    { x: 55, y: 25, w: 16, h: 32, label: "person", color: "#34d399" },
    { x: 35, y: 58, w: 30, h: 18, label: "vehicle", color: "#60a5fa" },
  ];
  return (
    <div className="relative min-h-[180px] overflow-hidden rounded-lg bg-[#0a0a0a]">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0d1117] via-[#0a0a0a] to-[#0d1117]" />
      <div className="absolute inset-0 opacity-15">
        <div className="absolute left-[13%] top-[18%] h-[38%] w-[7%] rounded bg-white/20" />
        <div className="absolute left-[57%] top-[28%] h-[28%] w-[6%] rounded bg-white/15" />
        <div className="absolute left-[37%] top-[60%] h-[12%] w-[26%] rounded bg-white/10" />
      </div>
      {boxes.map((d, i) => (
        <div
          key={i}
          className="absolute"
          style={{ left: `${d.x}%`, top: `${d.y}%`, width: `${d.w}%`, height: `${d.h}%` }}
        >
          <div className="h-full w-full rounded-sm border" style={{ borderColor: `${d.color}55` }} />
          <div
            className="absolute -top-3 left-0 rounded-sm px-1 font-mono text-[7px]"
            style={{ background: `${d.color}18`, color: `${d.color}cc` }}
          >
            {d.label}
          </div>
        </div>
      ))}
      <div className="absolute left-3 top-2.5 flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" />
        <span className="font-mono text-[9px] text-white/25">LIVE</span>
      </div>
      <div className="absolute right-3 top-2.5 font-mono text-[9px] text-white/20">
        YOLOv8 &middot; 8ms
      </div>
      <div className="absolute bottom-2.5 left-3 flex gap-3 font-mono text-[9px]">
        <span className="text-emerald-400/40">2 persons</span>
        <span className="text-blue-400/40">1 vehicle</span>
      </div>
    </div>
  );
}

/* ── Illustration: AI Avatars & Agents ── */
function AvatarsVisual() {
  const pts: [number, number][] = [
    [35, 28], [65, 28], [50, 23],
    [30, 40], [42, 38], [58, 38], [70, 40],
    [50, 48], [44, 46], [56, 46],
    [38, 58], [50, 60], [62, 58],
    [35, 48], [65, 48], [50, 68],
  ];
  const lines: [number, number][] = [
    [0, 2], [2, 1], [0, 3], [3, 4], [4, 5], [5, 6], [6, 1],
    [4, 8], [5, 9], [8, 7], [9, 7],
    [3, 13], [6, 14], [10, 11], [11, 12], [13, 10], [14, 12], [11, 15],
  ];
  return (
    <div className="relative min-h-[180px] overflow-hidden rounded-lg bg-[#0a0a0a]">
      <div className="flex h-full items-center justify-center gap-4 px-4 py-5">
        {/* Input */}
        <div className="relative h-[110px] w-[80px] flex-shrink-0 overflow-hidden rounded-md border border-white/[0.06] bg-[#111]">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-[55%] w-[45%] rounded-[50%] bg-white/[0.03]" />
          </div>
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
            {lines.map(([a, b], i) => (
              <line key={i} x1={pts[a][0]} y1={pts[a][1]} x2={pts[b][0]} y2={pts[b][1]} stroke="rgba(96,165,250,0.2)" strokeWidth="0.4" />
            ))}
            {pts.map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r="0.8" fill="rgba(96,165,250,0.5)" />
            ))}
          </svg>
          <div className="absolute left-1.5 top-1 font-mono text-[7px] text-blue-400/50">INPUT</div>
        </div>

        {/* Arrow */}
        <svg className="h-3 w-4 flex-shrink-0 text-white/10" viewBox="0 0 16 12" fill="none">
          <path d="M0 6h12m0 0l-3-3m3 3l-3 3" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        </svg>

        {/* Output */}
        <div className="relative h-[110px] w-[80px] flex-shrink-0 overflow-hidden rounded-md border border-white/[0.06] bg-[#111]">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative h-[55%] w-[45%] rounded-[50%] bg-gradient-to-b from-purple-500/[0.06] to-emerald-500/[0.04]">
              <div className="absolute left-[20%] top-[30%] h-[8%] w-[18%] rounded-full bg-purple-400/15" />
              <div className="absolute right-[20%] top-[30%] h-[8%] w-[18%] rounded-full bg-purple-400/15" />
              <div className="absolute bottom-[26%] left-1/2 h-[3%] w-[28%] -translate-x-1/2 rounded-full bg-purple-400/10" />
            </div>
          </div>
          <div className="absolute left-1.5 top-1 font-mono text-[7px] text-purple-400/50">OUTPUT</div>
        </div>
      </div>

      {/* Bottom label */}
      <div className="absolute bottom-2.5 left-3 font-mono text-[9px] text-white/20">
        Style: Anime &middot; 22ms
      </div>
    </div>
  );
}

const capabilities = [
  {
    title: "AI-Generated Worlds",
    description:
      "Interactive environments produced frame-by-frame with real-time inference on live video.",
    Visual: WorldsVisual,
  },
  {
    title: "Real-Time Video Analysis",
    description:
      "Computer vision and object detection running as always-on AI pipelines with low latency.",
    Visual: AnalysisVisual,
  },
  {
    title: "AI Avatars & Agents",
    description:
      "Motion capture and style transfer powering persistent digital identities in real time.",
    Visual: AvatarsVisual,
  },
];

export default function Capabilities() {
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      <div className="divider-gradient absolute top-0 left-0 right-0" />

      <Container className="relative">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          transition={{ staggerChildren: 0.12 }}
        >
          <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
            <SectionHeader
              label="Use Cases"
              title="What you can build"
              description="Real-time AI video workloads on open, elastic GPU infrastructure."
            />
          </motion.div>

          {/* 3-column bento grid */}
          <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {capabilities.map((cap) => (
              <motion.div
                key={cap.title}
                variants={fadeUp}
                transition={{ duration: 0.5 }}
                className="group overflow-hidden rounded-2xl border border-dark-border bg-dark-card/50 transition-colors hover:border-green/20"
              >
                <div className="p-2.5 pb-0">
                  <cap.Visual />
                </div>
                <div className="px-5 py-4">
                  <h3 className="text-base font-medium">{cap.title}</h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-white/40">
                    {cap.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
