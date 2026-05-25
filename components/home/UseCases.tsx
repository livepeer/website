"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import Container from "@/components/ui/Container";
import SectionHeader from "@/components/ui/SectionHeader";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

/* ── Illustration: AI-Generated World ── */
function WorldsVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false, margin: "-50px" });

  return (
    <div
      ref={ref}
      className="relative h-full overflow-hidden bg-surface"
    >
      {/* Sky gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#080f0c] via-[#060d0a] to-[#0a0a0a] light:from-[#eef8f1] light:via-[#e5f2e9] light:to-[#daede1]" />

      {/* Stars */}
      {[
        [12, 8],
        [28, 14],
        [45, 6],
        [62, 18],
        [78, 10],
        [88, 22],
        [18, 24],
        [52, 20],
        [70, 12],
        [35, 16],
      ].map(([x, y], i) => (
        <div
          key={i}
          className="absolute h-px w-px rounded-full bg-foreground/50"
          style={{
            left: `${x}%`,
            top: `${y}%`,
            animation: `twinkle 4s ease-in-out infinite`,
            animationDelay: `${i * 0.4}s`,
          }}
        />
      ))}

      {/* Terrain layers — revealed L→R by cursor, plays once */}
      <div
        className="absolute bottom-0 left-0 w-full h-[60%]"
        style={{
          clipPath: "inset(0 102% 0 0)",
          animation: inView ? "revealTerrain 4.5s linear forwards" : "none",
        }}
      >
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 400 120"
          preserveAspectRatio="none"
          fill="none"
        >
          {/* Far mountains */}
          <path
            d="M0 80 L40 45 L80 65 L130 30 L180 55 L220 25 L270 50 L320 35 L360 55 L400 40 V120 H0Z"
            fill="var(--vis-green-soft)"
          />
          {/* Mid hills */}
          <path
            d="M0 95 L50 70 L100 85 L160 60 L210 78 L260 65 L320 80 L370 70 L400 82 V120 H0Z"
            fill="var(--vis-green-mid)"
          />
          {/* Foreground */}
          <path
            d="M0 105 L60 92 L120 100 L180 88 L240 98 L300 90 L360 96 L400 92 V120 H0Z"
            fill="var(--vis-green-strong)"
          />
          {/* Grid lines overlaying terrain */}
          {[0, 50, 100, 150, 200, 250, 300, 350, 400].map((x) => (
            <line
              key={`v${x}`}
              x1={x}
              y1="0"
              x2={x}
              y2="120"
              stroke="color-mix(in srgb, currentColor 7%, transparent)"
              strokeWidth="0.5"
            />
          ))}
          {[0, 30, 60, 90, 120].map((y) => (
            <line
              key={`h${y}`}
              x1="0"
              y1={y}
              x2="400"
              y2={y}
              stroke="color-mix(in srgb, currentColor 7%, transparent)"
              strokeWidth="0.5"
            />
          ))}
        </svg>
      </div>

      {/* Generation cursor — sweeps once then disappears */}
      <div
        className="pointer-events-none absolute inset-y-0 w-[2px]"
        style={{
          left: 0,
          background:
            "linear-gradient(to bottom, transparent, color-mix(in srgb, var(--vis-accent-green) 60%, transparent) 30%, var(--vis-accent-green) 50%, color-mix(in srgb, var(--vis-accent-green) 60%, transparent) 70%, transparent)",
          boxShadow:
            "0 0 8px color-mix(in srgb, var(--vis-accent-green) 50%, transparent), 0 0 20px color-mix(in srgb, var(--vis-accent-green) 25%, transparent)",
          opacity: inView ? 1 : 0,
          animation: inView ? "generateSweep 4.5s linear forwards" : "none",
        }}
      />

      {/* HUD */}
      <div
        className="absolute left-3 top-2.5 font-mono text-[9px] text-emerald-400/70"
        style={{ animation: "breathe 3s ease-in-out infinite" }}
      >
        GENERATING
      </div>
      <div className="absolute right-3 top-2.5 font-mono text-[9px] text-foreground/35">
        60 FPS
      </div>
      <div className="absolute bottom-2.5 left-3 font-mono text-[9px] text-foreground/35">
        Frame 1,847 &middot; 12ms
      </div>
    </div>
  );
}

/* ── Illustration: AI Avatars & Agents ── */
function AvatarsVisual() {
  const pts: [number, number][] = [
    [35, 28],
    [65, 28],
    [50, 23],
    [30, 40],
    [42, 38],
    [58, 38],
    [70, 40],
    [50, 48],
    [44, 46],
    [56, 46],
    [38, 58],
    [50, 60],
    [62, 58],
    [35, 48],
    [65, 48],
    [50, 68],
  ];
  const lines: [number, number][] = [
    [0, 2],
    [2, 1],
    [0, 3],
    [3, 4],
    [4, 5],
    [5, 6],
    [6, 1],
    [4, 8],
    [5, 9],
    [8, 7],
    [9, 7],
    [3, 13],
    [6, 14],
    [10, 11],
    [11, 12],
    [13, 10],
    [14, 12],
    [11, 15],
  ];
  return (
    <div className="relative h-full overflow-hidden bg-surface">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0d0d0d] via-[#0a0a0a] to-[#0d0d0d] light:from-[#f0f3f8] light:via-[#e7ecf3] light:to-[#f0f3f8]" />
      <div className="relative flex h-full items-center justify-center gap-4 px-4 py-5">
        {/* Input */}
        <div className="relative h-[110px] w-[80px] flex-shrink-0 overflow-hidden rounded-md border border-foreground/[0.1] bg-card">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-[55%] w-[45%] rounded-[50%] bg-foreground/[0.05]" />
          </div>
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="xMidYMid meet"
          >
            {lines.map(([a, b], i) => (
              <line
                key={i}
                x1={pts[a][0]}
                y1={pts[a][1]}
                x2={pts[b][0]}
                y2={pts[b][1]}
                stroke="var(--vis-blue-soft)"
                strokeWidth="0.5"
              />
            ))}
            {pts.map(([x, y], i) => (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="1"
                fill="var(--vis-blue-mid)"
                style={{
                  animation: "breathe 4s ease-in-out infinite",
                  animationDelay: `${i * 0.15}s`,
                }}
              />
            ))}
          </svg>
          <div className="absolute left-1.5 top-1 font-mono text-[8px] text-blue-400/70">
            INPUT
          </div>
        </div>

        {/* Arrow */}
        <svg
          className="h-3 w-4 flex-shrink-0 text-foreground/25"
          viewBox="0 0 16 12"
          fill="none"
          style={{ animation: "arrowFlow 2.5s ease-in-out infinite" }}
        >
          <path
            d="M0 6h12m0 0l-3-3m3 3l-3 3"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {/* Output */}
        <div className="relative h-[110px] w-[80px] flex-shrink-0 overflow-hidden rounded-md border border-foreground/[0.1] bg-card">
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="relative h-[55%] w-[45%] rounded-[50%] bg-gradient-to-b from-purple-500/[0.12] to-emerald-500/[0.08]"
              style={{ animation: "breathe 4s ease-in-out infinite" }}
            >
              <div className="absolute left-[20%] top-[30%] h-[8%] w-[18%] rounded-full bg-purple-400/30" />
              <div className="absolute right-[20%] top-[30%] h-[8%] w-[18%] rounded-full bg-purple-400/30" />
              <div className="absolute bottom-[26%] left-1/2 h-[3%] w-[28%] -translate-x-1/2 rounded-full bg-purple-400/20" />
            </div>
          </div>
          <div className="absolute left-1.5 top-1 font-mono text-[8px] text-purple-400/70">
            OUTPUT
          </div>
        </div>
      </div>

      {/* Bottom label */}
      <div className="absolute bottom-2.5 left-3 font-mono text-[9px] text-foreground/35">
        Style: Anime &middot; 22ms
      </div>
    </div>
  );
}

/* ── Tracking box — smooth drift + micro-jitter + detection lifecycle ── */
interface Detection {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  color: string;
  conf: number;
  drift: { freqX: number; freqY: number; amtX: number; amtY: number };
  sil: { left: string; top: string; w: string; h: string; opacity: number };
}

function TrackingBox({
  d,
  active,
  entered,
}: {
  d: Detection;
  active: boolean;
  entered: boolean;
}) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [conf, setConf] = useState(d.conf);
  const t0 = useRef(Date.now());

  useEffect(() => {
    const tick = setInterval(() => {
      const t = (Date.now() - t0.current) / 1000;

      const dx =
        Math.sin(t * d.drift.freqX) * d.drift.amtX +
        Math.sin(t * d.drift.freqX * 2.3 + 1.2) * d.drift.amtX * 0.3;
      const dy =
        Math.sin(t * d.drift.freqY + 0.7) * d.drift.amtY +
        Math.cos(t * d.drift.freqY * 1.7 + 0.4) * d.drift.amtY * 0.3;

      setPos({ x: dx, y: dy });
      setConf(
        Math.min(0.99, Math.max(0.68, d.conf + (Math.random() - 0.5) * 0.1))
      );
    }, 200);

    return () => clearInterval(tick);
  }, [d]);

  return (
    <AnimatePresence>
      {entered && (
        <motion.div
          className="absolute"
          style={{
            left: `${d.x}%`,
            top: `${d.y}%`,
            width: `${d.w}%`,
            height: `${d.h}%`,
          }}
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{
            x: pos.x,
            y: pos.y,
            scale: active ? 1 : 0.95,
            opacity: active ? 1 : 0,
          }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{
            x: { duration: 0.3, ease: "easeOut" },
            y: { duration: 0.3, ease: "easeOut" },
            scale: { duration: 0.3, ease: [0.34, 1.4, 0.64, 1] },
            opacity: { duration: active ? 0.2 : 0.1 },
          }}
        >
          {/* Silhouette */}
          <div
            className="absolute rounded"
            style={{
              left: d.sil.left,
              top: d.sil.top,
              width: d.sil.w,
              height: d.sil.h,
              background: `rgba(255,255,255,${d.sil.opacity})`,
            }}
          />
          {/* Border with glow */}
          <div
            className="absolute inset-0 rounded-sm"
            style={{
              border: `1.5px solid color-mix(in srgb, ${d.color} 60%, transparent)`,
              boxShadow: `0 0 6px color-mix(in srgb, ${d.color} 25%, transparent), 0 0 14px color-mix(in srgb, ${d.color} 12%, transparent)`,
            }}
          />
          {/* Label + confidence */}
          <div
            className="absolute -top-3.5 left-0 flex items-center gap-1 rounded-sm px-1 py-px font-mono text-[7px]"
            style={{
              background: `color-mix(in srgb, ${d.color} 18%, transparent)`,
              color: `color-mix(in srgb, ${d.color} 90%, transparent)`,
            }}
          >
            <span>{d.label}</span>
            <span style={{ opacity: 0.6 }}>{conf.toFixed(2)}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ── Illustration: Real-Time Video Analysis ── */
const analysisDetections: Detection[] = [
  {
    x: 10,
    y: 15,
    w: 20,
    h: 40,
    label: "person",
    color: "var(--vis-accent-green)",
    conf: 0.94,
    drift: { freqX: 0.3, freqY: 0.18, amtX: 8, amtY: 12 },
    sil: { left: "15%", top: "7.5%", w: "35%", h: "95%", opacity: 0.06 },
  },
  {
    x: 55,
    y: 25,
    w: 16,
    h: 32,
    label: "person",
    color: "var(--vis-accent-green)",
    conf: 0.87,
    drift: { freqX: 0.22, freqY: 0.28, amtX: 6, amtY: 10 },
    sil: { left: "12.5%", top: "9.4%", w: "37.5%", h: "87.5%", opacity: 0.045 },
  },
  {
    x: 35,
    y: 58,
    w: 30,
    h: 18,
    label: "vehicle",
    color: "var(--vis-accent-blue)",
    conf: 0.91,
    drift: { freqX: 0.15, freqY: 0.35, amtX: 14, amtY: 3 },
    sil: { left: "6.7%", top: "11.1%", w: "86.7%", h: "66.7%", opacity: 0.03 },
  },
];

function AnalysisVisual() {
  const [active, setActive] = useState([true, true, true]);
  const [entered, setEntered] = useState([false, false, false]);

  useEffect(() => {
    const timers = analysisDetections.map((_, i) =>
      setTimeout(
        () => {
          setEntered((prev) => {
            const n = [...prev];
            n[i] = true;
            return n;
          });
        },
        400 + i * 500
      )
    );

    const flicker = setInterval(() => {
      const idx = Math.floor(Math.random() * analysisDetections.length);
      if (Math.random() < 0.22) {
        setActive((prev) => {
          const n = [...prev];
          n[idx] = false;
          return n;
        });
        setTimeout(
          () => {
            setActive((prev) => {
              const n = [...prev];
              n[idx] = true;
              return n;
            });
          },
          120 + Math.random() * 200
        );
      }
    }, 2800);

    return () => {
      timers.forEach(clearTimeout);
      clearInterval(flicker);
    };
  }, []);

  const personCount = analysisDetections.filter(
    (d, i) => d.label === "person" && active[i] && entered[i]
  ).length;
  const vehicleCount = analysisDetections.filter(
    (d, i) => d.label === "vehicle" && active[i] && entered[i]
  ).length;

  return (
    <div className="relative h-full overflow-hidden bg-surface">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0d1117] via-[#0a0a0a] to-[#0d1117] light:from-[#f3f5f8] light:via-[#eceff2] light:to-[#f3f5f8]" />
      {analysisDetections.map((d, i) => (
        <TrackingBox key={i} d={d} active={active[i]} entered={entered[i]} />
      ))}
      <div className="absolute left-3 top-2.5 flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" />
        <span className="font-mono text-[9px] text-foreground/40">LIVE</span>
      </div>
      <div className="absolute right-3 top-2.5 font-mono text-[9px] text-foreground/35">
        YOLOv8 &middot; 8ms
      </div>
      <div className="absolute bottom-2.5 left-3 flex gap-3 font-mono text-[9px]">
        {personCount > 0 && (
          <span className="text-emerald-400/60">
            {personCount} {personCount === 1 ? "person" : "persons"}
          </span>
        )}
        {vehicleCount > 0 && (
          <span className="text-blue-400/60">
            {vehicleCount} {vehicleCount === 1 ? "vehicle" : "vehicles"}
          </span>
        )}
      </div>
    </div>
  );
}

/* ── Illustration: Composable AI Pipelines (3 nodes) ── */
function PipelinesVisual() {
  const nodes = [
    { label: "Ingest", x: 20 },
    { label: "Model", x: 120, active: true },
    { label: "Output", x: 220 },
  ];
  const nodeW = 64;
  const nodeH = 26;
  const nodeY = 14;
  return (
    <div className="relative h-full overflow-hidden bg-surface">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0d0d0d] via-[#0a0a0a] to-[#0d0d0d] light:from-[#eef6f0] light:via-[#e5efe8] light:to-[#eef6f0]" />

      {/* Pipeline node graph */}
      <div className="absolute inset-x-3 top-3 bottom-10 flex items-center justify-center">
        <svg
          viewBox="0 0 304 54"
          className="w-full max-w-[320px] h-auto"
          fill="none"
        >
          {/* Connection lines + flowing data packets */}
          {nodes.slice(0, -1).map((node, i) => {
            const next = nodes[i + 1];
            const x1 = node.x + nodeW;
            const x2 = next.x;
            const cy = nodeY + nodeH / 2;
            return (
              <g key={`conn-${i}`}>
                <line
                  x1={x1}
                  y1={cy}
                  x2={x2}
                  y2={cy}
                  stroke="color-mix(in srgb, currentColor 15%, transparent)"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                  style={{ animation: "dashFlow 1.5s linear infinite" }}
                />
                {/* Data packet */}
                <circle r="2.5" cy={cy} fill="var(--vis-accent-green)">
                  <animate
                    attributeName="cx"
                    from={x1}
                    to={x2}
                    dur="1.8s"
                    begin={`${i * 0.6}s`}
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0;0.9;0.9;0"
                    keyTimes="0;0.15;0.85;1"
                    dur="1.8s"
                    begin={`${i * 0.6}s`}
                    repeatCount="indefinite"
                  />
                </circle>
                {/* Second staggered packet */}
                <circle r="2" cy={cy} fill="var(--vis-accent-green)">
                  <animate
                    attributeName="cx"
                    from={x1}
                    to={x2}
                    dur="1.8s"
                    begin={`${i * 0.6 + 0.9}s`}
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0;0.6;0.6;0"
                    keyTimes="0;0.15;0.85;1"
                    dur="1.8s"
                    begin={`${i * 0.6 + 0.9}s`}
                    repeatCount="indefinite"
                  />
                </circle>
              </g>
            );
          })}

          {/* Nodes */}
          {nodes.map((node) => (
            <g key={node.label}>
              <rect
                x={node.x}
                y={nodeY}
                width={nodeW}
                height={nodeH}
                rx="5"
                fill={
                  node.active
                    ? "var(--vis-green-mid)"
                    : "color-mix(in srgb, currentColor 5%, transparent)"
                }
                stroke={
                  node.active ? "var(--vis-green-strong)" : "color-mix(in srgb, currentColor 12%, transparent)"
                }
                strokeWidth="1"
                style={
                  node.active
                    ? { animation: "breathe 4s ease-in-out infinite" }
                    : undefined
                }
              />
              <text
                x={node.x + nodeW / 2}
                y={nodeY + nodeH / 2 + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                className="font-mono"
                fontSize="9"
                fill={
                  node.active ? "var(--vis-accent-green)" : "color-mix(in srgb, currentColor 50%, transparent)"
                }
              >
                {node.label}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Bottom HUD */}
      <div className="absolute bottom-2.5 left-3 font-mono text-[9px] text-foreground/35">
        Pipeline: img2img &middot; 3 stages
      </div>
      <div className="absolute bottom-2.5 right-3 font-mono text-[9px] text-emerald-400/60">
        Active
      </div>
    </div>
  );
}

/* ── Illustration: Live Transcoding & Streaming (ABR Ladder) ── */
function TranscodingVisual() {
  const renditions = [
    { res: "1080p", fps: "60fps", width: "100%" },
    { res: "720p", fps: "30fps", width: "78%" },
    { res: "480p", fps: "30fps", width: "58%" },
    { res: "360p", fps: "30fps", width: "42%" },
  ];
  return (
    <div className="relative h-full overflow-hidden bg-surface">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0d0d0d] via-[#0a0a0a] to-[#0d0d0d] light:from-[#f5f3eb] light:via-[#efece2] light:to-[#f5f3eb]" />

      {/* Mini player chrome */}
      <div className="absolute inset-x-3 top-3 bottom-10 rounded-md border border-foreground/[0.1] bg-card overflow-hidden">
        {/* Video area gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent" />

        {/* LIVE badge */}
        <div className="absolute left-2.5 top-2 flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
          <span className="font-mono text-[8px] font-medium text-red-400/80">
            LIVE
          </span>
        </div>

        {/* ABR Ladder */}
        <div className="absolute inset-x-4 top-10 bottom-8 flex flex-col justify-center gap-2.5">
          {renditions.map((r, i) => (
            <div key={r.res} className="flex items-center gap-3">
              <div
                className="relative h-[6px] overflow-hidden rounded-full bg-gradient-to-r from-green/80 to-green/30"
                style={{ width: r.width }}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent 30%, color-mix(in srgb, currentColor 12%, transparent) 50%, transparent 70%)",
                    backgroundSize: "200% 100%",
                    animation: "shimmer 3s ease-in-out infinite",
                    animationDelay: `${i * 0.4}s`,
                  }}
                />
              </div>
              <span className="font-mono text-[10px] text-foreground/50 whitespace-nowrap">
                {r.res} {r.fps}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom stats */}
      <div className="absolute bottom-2.5 left-3 font-mono text-[9px] text-foreground/35">
        Bitrate: 4.2 Mbps &middot; Latency: 85ms
      </div>
    </div>
  );
}

/* ── Use Cases data ── */
const useCases: {
  title: string;
  description: string;
  tag: string;
  attribution: string;
  Visual: React.ComponentType;
  colSpan: 2 | 4 | 6;
}[] = [
  {
    title: "AI-Generated Worlds",
    description:
      "Live environments inferred in real time from user inputs. Not pre-rendered, not pre-recorded. The world itself is the model's output.",
    tag: "Generative",
    attribution: "Powered by Daydream on Livepeer.",
    Visual: WorldsVisual,
    colSpan: 4,
  },
  {
    title: "AI Avatars",
    description:
      "Video representations of AI agents that respond in real time, for tutoring, telepresence, and conversational interfaces.",
    tag: "Avatars",
    attribution: "Powered by Embody on Livepeer.",
    Visual: AvatarsVisual,
    colSpan: 2,
  },
  {
    title: "Live Video Intelligence",
    description:
      "Real-time analysis of live streams: sports broadcasts, security feeds, manufacturing lines. Processed during, not after.",
    tag: "Intelligence",
    attribution: "Emerging on Livepeer.",
    Visual: AnalysisVisual,
    colSpan: 2,
  },
  {
    title: "Prompt-Driven Live Transformation",
    description:
      "A creator goes live and the stream adapts: lighting, environment, visual style, based on a text prompt, in real time.",
    tag: "Pipelines",
    attribution: "Powered by Daydream on Livepeer.",
    Visual: PipelinesVisual,
    colSpan: 4,
  },
  {
    title: "Live Transcoding & Streaming",
    description:
      "Adaptive bitrate transcoding across a global GPU network with sub-second latency.",
    tag: "Streaming",
    attribution: "Live on Livepeer.",
    Visual: TranscodingVisual,
    colSpan: 6,
  },
];

const colSpanClass: Record<number, string> = {
  2: "lg:col-span-2",
  4: "lg:col-span-4",
  6: "lg:col-span-6",
};

export default function UseCases() {
  return (
    <section className="relative py-24 lg:py-32">
      <Container>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          transition={{ staggerChildren: 0.06 }}
        >
          {/* Sub-section A: Use Cases */}
          <motion.div variants={fadeUp} transition={{ duration: 0.4 }}>
            <SectionHeader
              label="Use Cases"
              title={
                <>
                  What you can build with{" "}
                  <span className="text-foreground/50">real-time AI video</span>
                </>
              }
              description="Build live generated worlds, AI avatars, real-time style transfer, and more — powered by Livepeer's open GPU network."
              align="split"
            />
          </motion.div>

          <div className="mt-20 grid grid-cols-1 gap-x-4 gap-y-5 md:grid-cols-2 lg:grid-cols-6 lg:gap-y-6">
            {useCases.map((useCase) => (
              <motion.div
                key={useCase.title}
                variants={fadeUp}
                transition={{ duration: 0.4 }}
                className={`md:col-span-1 ${colSpanClass[useCase.colSpan]}`}
              >
                <div className="relative block h-full overflow-hidden rounded-xl border border-foreground/[0.07] bg-card">
                  {/* Dark visual — edge-to-edge specimen frame */}
                  <div
                    className={`relative ${
                      useCase.colSpan === 6
                        ? "h-[200px] lg:h-[240px]"
                        : useCase.colSpan === 4
                          ? "h-[200px] lg:h-[290px]"
                          : "h-[200px] lg:h-[220px]"
                    }`}
                  >
                    <useCase.Visual />
                    {/* Hairline divider where screen meets body */}
                    <div
                      className="pointer-events-none absolute inset-x-0 bottom-0 h-px"
                      aria-hidden="true"
                      style={{ background: "var(--card-hairline)" }}
                    />
                  </div>

                  {/* Body */}
                  <div className="px-5 py-6 lg:px-6 lg:py-7">
                    <h3 className="text-[19px] font-bold tracking-tight text-foreground lg:text-[21px]">
                      {useCase.title}
                    </h3>
                    <p className="mt-2.5 text-[13.5px] leading-[1.65] text-foreground/65">
                      {useCase.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
