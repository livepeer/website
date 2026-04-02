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
      className="relative h-full overflow-hidden rounded-lg bg-[#070b0a]"
    >
      {/* Sky gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#080f0c] via-[#060d0a] to-[#0a0a0a]" />

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
          className="absolute h-px w-px rounded-full bg-white/50"
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
            fill="rgba(24,121,78,0.18)"
          />
          {/* Mid hills */}
          <path
            d="M0 95 L50 70 L100 85 L160 60 L210 78 L260 65 L320 80 L370 70 L400 82 V120 H0Z"
            fill="rgba(24,121,78,0.25)"
          />
          {/* Foreground */}
          <path
            d="M0 105 L60 92 L120 100 L180 88 L240 98 L300 90 L360 96 L400 92 V120 H0Z"
            fill="rgba(24,121,78,0.35)"
          />
          {/* Grid lines overlaying terrain */}
          {[0, 50, 100, 150, 200, 250, 300, 350, 400].map((x) => (
            <line
              key={`v${x}`}
              x1={x}
              y1="0"
              x2={x}
              y2="120"
              stroke="rgba(255,255,255,0.07)"
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
              stroke="rgba(255,255,255,0.07)"
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
            "linear-gradient(to bottom, transparent, rgba(64,191,134,0.5) 30%, rgba(64,191,134,0.8) 50%, rgba(64,191,134,0.5) 70%, transparent)",
          boxShadow:
            "0 0 8px rgba(64,191,134,0.4), 0 0 20px rgba(64,191,134,0.2)",
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
      <div className="absolute right-3 top-2.5 font-mono text-[9px] text-white/35">
        60 FPS
      </div>
      <div className="absolute bottom-2.5 left-3 font-mono text-[9px] text-white/35">
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
    <div className="relative h-full overflow-hidden rounded-lg bg-[#0a0a0a]">
      <div className="flex h-full items-center justify-center gap-4 px-4 py-5">
        {/* Input */}
        <div className="relative h-[110px] w-[80px] flex-shrink-0 overflow-hidden rounded-md border border-white/[0.1] bg-[#131313]">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-[55%] w-[45%] rounded-[50%] bg-white/[0.05]" />
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
                stroke="rgba(96,165,250,0.35)"
                strokeWidth="0.5"
              />
            ))}
            {pts.map(([x, y], i) => (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="1"
                fill="rgba(96,165,250,0.7)"
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
          className="h-3 w-4 flex-shrink-0 text-white/25"
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
        <div className="relative h-[110px] w-[80px] flex-shrink-0 overflow-hidden rounded-md border border-white/[0.1] bg-[#131313]">
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
      <div className="absolute bottom-2.5 left-3 font-mono text-[9px] text-white/35">
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
  i,
  active,
  entered,
}: {
  d: Detection;
  i: number;
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
              border: `1.5px solid ${d.color}66`,
              boxShadow: `0 0 6px ${d.color}25, 0 0 14px ${d.color}10`,
            }}
          />
          {/* Label + confidence */}
          <div
            className="absolute -top-3.5 left-0 flex items-center gap-1 rounded-sm px-1 py-px font-mono text-[7px]"
            style={{ background: `${d.color}25`, color: `${d.color}cc` }}
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
    color: "#34d399",
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
    color: "#34d399",
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
    color: "#60a5fa",
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
    <div className="relative h-full overflow-hidden rounded-lg bg-[#0a0a0a]">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0d1117] via-[#0a0a0a] to-[#0d1117]" />
      {analysisDetections.map((d, i) => (
        <TrackingBox
          key={i}
          d={d}
          i={i}
          active={active[i]}
          entered={entered[i]}
        />
      ))}
      <div className="absolute left-3 top-2.5 flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" />
        <span className="font-mono text-[9px] text-white/40">LIVE</span>
      </div>
      <div className="absolute right-3 top-2.5 font-mono text-[9px] text-white/35">
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
    <div className="relative h-full overflow-hidden rounded-lg bg-[#0a0a0a]">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0d0d0d] via-[#0a0a0a] to-[#0d0d0d]" />

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
                  stroke="rgba(255,255,255,0.15)"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                  style={{ animation: "dashFlow 1.5s linear infinite" }}
                />
                {/* Data packet */}
                <circle r="2.5" cy={cy} fill="#40bf86">
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
                <circle r="2" cy={cy} fill="#40bf86">
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
                    ? "rgba(24,121,78,0.25)"
                    : "rgba(255,255,255,0.05)"
                }
                stroke={
                  node.active ? "rgba(24,121,78,0.7)" : "rgba(255,255,255,0.12)"
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
                  node.active ? "rgba(64,191,134,0.9)" : "rgba(255,255,255,0.5)"
                }
              >
                {node.label}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Bottom HUD */}
      <div className="absolute bottom-2.5 left-3 font-mono text-[9px] text-white/35">
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
    <div className="relative h-full overflow-hidden rounded-lg bg-[#0a0a0a]">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0d0d0d] via-[#0a0a0a] to-[#0d0d0d]" />

      {/* Mini player chrome */}
      <div className="absolute inset-x-3 top-3 bottom-10 rounded-md border border-white/[0.1] bg-[#131313] overflow-hidden">
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
                      "linear-gradient(90deg, transparent 30%, rgba(255,255,255,0.12) 50%, transparent 70%)",
                    backgroundSize: "200% 100%",
                    animation: "shimmer 3s ease-in-out infinite",
                    animationDelay: `${i * 0.4}s`,
                  }}
                />
              </div>
              <span className="font-mono text-[10px] text-white/50 whitespace-nowrap">
                {r.res} {r.fps}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom stats */}
      <div className="absolute bottom-2.5 left-3 font-mono text-[9px] text-white/35">
        Bitrate: 4.2 Mbps &middot; Latency: 85ms
      </div>
    </div>
  );
}

/* ── Solution Visual: Daydream — Live Canvas ── */
function DaydreamSolutionVisual() {
  return (
    <div className="relative h-full overflow-hidden rounded-lg bg-[#070b0a]">
      <div className="absolute inset-0 bg-gradient-to-br from-[#080f0c] via-[#060d0a] to-[#0a0a0a]" />

      {/* Wireframe flower (left/raw side) */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 200 120"
        preserveAspectRatio="xMidYMid meet"
        fill="none"
      >
        <g stroke="rgba(255,255,255,0.15)" strokeWidth="0.5">
          {/* Stem */}
          <path d="M100,95 C100,75 98,65 100,50" />
          {/* Leaves */}
          <path d="M100,80 C90,72 82,74 80,70" />
          <path d="M100,70 C110,62 118,64 120,60" />
          {/* Leaf veins */}
          <line x1="100" y1="80" x2="88" y2="73" />
          <line x1="100" y1="70" x2="112" y2="63" />
          {/* Flower petals */}
          <ellipse
            cx="100"
            cy="38"
            rx="6"
            ry="12"
            transform="rotate(0 100 38)"
          />
          <ellipse
            cx="100"
            cy="38"
            rx="6"
            ry="12"
            transform="rotate(60 100 38)"
          />
          <ellipse
            cx="100"
            cy="38"
            rx="6"
            ry="12"
            transform="rotate(120 100 38)"
          />
          {/* Flower center */}
          <circle cx="100" cy="38" r="5" />
          <circle cx="100" cy="38" r="2.5" />
          {/* Stamen dots */}
          <circle cx="98" cy="36" r="0.8" />
          <circle cx="102" cy="36" r="0.8" />
          <circle cx="100" cy="40" r="0.8" />
        </g>
      </svg>

      {/* AI-generated glow side — revealed by wipe */}
      <div
        className="absolute inset-0"
        style={{
          clipPath: "inset(0 100% 0 0)",
          animation: "revealTerrain 8s ease-in-out infinite",
        }}
      >
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 200 120"
          preserveAspectRatio="xMidYMid meet"
          fill="none"
        >
          {/* Glowing AI flower */}
          <g stroke="rgba(64,191,134,0.7)" strokeWidth="1">
            {/* Stem */}
            <path d="M100,95 C100,75 98,65 100,50" />
            {/* Leaves */}
            <path d="M100,80 C90,72 82,74 80,70" fill="rgba(64,191,134,0.06)" />
            <path
              d="M100,70 C110,62 118,64 120,60"
              fill="rgba(64,191,134,0.06)"
            />
            {/* Leaf veins */}
            <line x1="100" y1="80" x2="88" y2="73" />
            <line x1="100" y1="70" x2="112" y2="63" />
            {/* Flower petals */}
            <ellipse
              cx="100"
              cy="38"
              rx="6"
              ry="12"
              transform="rotate(0 100 38)"
              fill="rgba(64,191,134,0.08)"
            />
            <ellipse
              cx="100"
              cy="38"
              rx="6"
              ry="12"
              transform="rotate(60 100 38)"
              fill="rgba(64,191,134,0.08)"
            />
            <ellipse
              cx="100"
              cy="38"
              rx="6"
              ry="12"
              transform="rotate(120 100 38)"
              fill="rgba(64,191,134,0.08)"
            />
            {/* Flower center */}
            <circle cx="100" cy="38" r="5" fill="rgba(64,191,134,0.12)" />
          </g>
          {/* Glow particles — pollen/sparkles */}
          {[
            [92, 28],
            [108, 30],
            [88, 45],
            [112, 42],
            [95, 50],
            [105, 48],
            [85, 72],
            [115, 62],
            [90, 85],
            [110, 78],
          ].map(([x, y], i) => (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="1.5"
              fill="rgba(64,191,134,0.5)"
              style={{
                animation: "breathe 3s ease-in-out infinite",
                animationDelay: `${i * 0.3}s`,
              }}
            />
          ))}
          {/* Ambient glow */}
          <circle cx="100" cy="50" r="35" fill="rgba(64,191,134,0.04)" />
          <circle cx="100" cy="38" r="18" fill="rgba(64,191,134,0.06)" />
        </svg>
      </div>

      {/* Sweep line */}
      <div
        className="pointer-events-none absolute inset-y-0 w-[2px]"
        style={{
          left: 0,
          background:
            "linear-gradient(to bottom, transparent, rgba(64,191,134,0.6) 30%, rgba(64,191,134,0.9) 50%, rgba(64,191,134,0.6) 70%, transparent)",
          boxShadow:
            "0 0 12px rgba(64,191,134,0.4), 0 0 24px rgba(64,191,134,0.2)",
          animation: "generateSweep 8s ease-in-out infinite",
        }}
      />

      {/* HUD */}
      <div
        className="absolute left-3 top-2.5 font-mono text-[9px] text-emerald-400/70"
        style={{ animation: "breathe 3s ease-in-out infinite" }}
      >
        LIVE CANVAS
      </div>
      <div className="absolute right-3 top-2.5 font-mono text-[9px] text-white/35">
        Real-time
      </div>
    </div>
  );
}

/* ── Solution Visual: Frameworks — Signal Flow ── */
function FrameworksSolutionVisual() {
  const endpoints = [
    { x: 240, y: 15, label: "1080p" },
    { x: 240, y: 37, label: "720p" },
    { x: 240, y: 59, label: "480p" },
    { x: 240, y: 81, label: "360p" },
    { x: 240, y: 103, label: "CDN" },
  ];

  return (
    <div className="relative h-full overflow-hidden rounded-lg bg-[#0a0a0a]">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0d0d0d] via-[#0a0a0a] to-[#0d0d0d]" />

      <div className="absolute inset-3 flex items-center justify-center">
        <svg
          viewBox="0 0 280 120"
          className="w-full max-w-[300px] h-auto"
          fill="none"
        >
          {/* Source node */}
          <rect
            x="10"
            y="45"
            width="50"
            height="26"
            rx="5"
            fill="rgba(24,121,78,0.25)"
            stroke="rgba(24,121,78,0.7)"
            strokeWidth="1"
            style={{ animation: "breathe 4s ease-in-out infinite" }}
          />
          <text
            x="35"
            y="61"
            textAnchor="middle"
            dominantBaseline="middle"
            className="font-mono"
            fontSize="8"
            fill="rgba(64,191,134,0.9)"
          >
            Source
          </text>

          {/* Fork node */}
          <rect
            x="110"
            y="45"
            width="40"
            height="26"
            rx="5"
            fill="rgba(255,255,255,0.05)"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="1"
          />
          <text
            x="130"
            y="61"
            textAnchor="middle"
            dominantBaseline="middle"
            className="font-mono"
            fontSize="7"
            fill="rgba(255,255,255,0.5)"
          >
            ABR
          </text>

          {/* Source → Fork connection */}
          <line
            x1="60"
            y1="58"
            x2="110"
            y2="58"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="1"
            strokeDasharray="4 4"
            style={{ animation: "dashFlow 1.5s linear infinite" }}
          />
          <circle r="2.5" cy="58" fill="#40bf86">
            <animate
              attributeName="cx"
              from="60"
              to="110"
              dur="1.2s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0;0.9;0.9;0"
              keyTimes="0;0.1;0.9;1"
              dur="1.2s"
              repeatCount="indefinite"
            />
          </circle>

          {/* Fork → Endpoints */}
          {endpoints.map((ep, i) => (
            <g key={i}>
              <line
                x1="150"
                y1="58"
                x2="230"
                y2={ep.y + 8}
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="0.5"
              />
              {/* Endpoint node */}
              <rect
                x={ep.x - 10}
                y={ep.y}
                width="40"
                height="16"
                rx="3"
                fill="rgba(255,255,255,0.04)"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="0.5"
              />
              <text
                x={ep.x + 10}
                y={ep.y + 10}
                textAnchor="middle"
                dominantBaseline="middle"
                className="font-mono"
                fontSize="6"
                fill="rgba(255,255,255,0.4)"
              >
                {ep.label}
              </text>
              {/* Flowing packet */}
              <circle r="1.5" fill="#40bf86">
                <animate
                  attributeName="cx"
                  from="150"
                  to="230"
                  dur="2s"
                  begin={`${i * 0.35}s`}
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="cy"
                  from="58"
                  to={ep.y + 8}
                  dur="2s"
                  begin={`${i * 0.35}s`}
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0;0.7;0.7;0"
                  keyTimes="0;0.1;0.85;1"
                  dur="2s"
                  begin={`${i * 0.35}s`}
                  repeatCount="indefinite"
                />
              </circle>
            </g>
          ))}
        </svg>
      </div>

      <div className="absolute bottom-2.5 left-3 font-mono text-[9px] text-white/35">
        Adaptive bitrate
      </div>
      <div className="absolute bottom-2.5 right-3 font-mono text-[9px] text-emerald-400/60">
        Live
      </div>
    </div>
  );
}

/* ── Solution Visual: Streamplace — Open Layer ── */
function StreamplaceSolutionVisual() {
  const layers = [
    { label: "Ingest", y: 10, color: "rgba(222,145,166,0.5)", speed: "12s" },
    { label: "Encode", y: 35, color: "rgba(222,145,166,0.4)", speed: "16s" },
    { label: "Route", y: 60, color: "rgba(222,145,166,0.3)", speed: "20s" },
    { label: "Deliver", y: 85, color: "rgba(222,145,166,0.25)", speed: "24s" },
  ];

  return (
    <div className="relative h-full overflow-hidden rounded-lg bg-[#0a0a0a]">
      <div className="absolute inset-0 bg-gradient-to-br from-[#140d10] via-[#0a0a0a] to-[#110d0f]" />

      {/* Subtle brand glow */}
      <div
        className="absolute h-[100px] w-[100px] rounded-full opacity-15 blur-[50px]"
        style={{ left: "30%", top: "20%", background: "#de91a6" }}
      />

      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 200 120"
        preserveAspectRatio="xMidYMid meet"
        fill="none"
      >
        {/* Infrastructure layers with parallax drift */}
        {layers.map((layer, i) => (
          <g key={layer.label}>
            {/* Layer bar */}
            <rect
              x="20"
              y={layer.y}
              width="160"
              height="18"
              rx="3"
              fill="rgba(255,255,255,0.03)"
              stroke={`rgba(222,145,166,${0.15 - i * 0.02})`}
              strokeWidth="0.5"
            />
            {/* Layer label */}
            <text
              x="28"
              y={layer.y + 12}
              className="font-mono"
              fontSize="7"
              fill={layer.color}
            >
              {layer.label}
            </text>
            {/* Open source badge */}
            <text
              x="172"
              y={layer.y + 12}
              textAnchor="end"
              className="font-mono"
              fontSize="5"
              fill="rgba(255,255,255,0.15)"
            >
              open
            </text>
            {/* Data packet traveling through layer */}
            <circle r="2" cy={layer.y + 9} fill={layer.color}>
              <animate
                attributeName="cx"
                from="20"
                to="180"
                dur={layer.speed}
                begin={`${i * 0.8}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0;0.8;0.8;0"
                keyTimes="0;0.05;0.9;1"
                dur={layer.speed}
                begin={`${i * 0.8}s`}
                repeatCount="indefinite"
              />
            </circle>
            {/* Second staggered packet */}
            <circle r="1.5" cy={layer.y + 9} fill={layer.color}>
              <animate
                attributeName="cx"
                from="20"
                to="180"
                dur={layer.speed}
                begin={`${i * 0.8 + parseFloat(layer.speed) / 2}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0;0.5;0.5;0"
                keyTimes="0;0.05;0.9;1"
                dur={layer.speed}
                begin={`${i * 0.8 + parseFloat(layer.speed) / 2}s`}
                repeatCount="indefinite"
              />
            </circle>
          </g>
        ))}

        {/* Vertical connection lines */}
        {[60, 100, 140].map((x) => (
          <line
            key={x}
            x1={x}
            y1="10"
            x2={x}
            y2="103"
            stroke="rgba(222,145,166,0.06)"
            strokeWidth="0.5"
            strokeDasharray="2 3"
          />
        ))}
      </svg>

      <div className="absolute bottom-2.5 left-3 font-mono text-[9px] text-white/35">
        AT Protocol
      </div>
      <div
        className="absolute bottom-2.5 right-3 font-mono text-[9px]"
        style={{ color: "rgba(222,145,166,0.5)" }}
      >
        Open-source
      </div>
    </div>
  );
}

/* ── Solution Visual: Embody — Presence ── */
function EmbodySolutionVisual() {
  const facePts: [number, number][] = [
    [100, 35],
    [85, 42],
    [115, 42], // forehead, brow L, brow R
    [90, 52],
    [110, 52], // eye L, eye R
    [100, 58], // nose
    [93, 68],
    [100, 72],
    [107, 68], // mouth L, chin, mouth R
    [78, 48],
    [122, 48], // temple L, temple R
    [82, 62],
    [118, 62], // cheek L, cheek R
    [100, 42], // bridge
    [88, 48],
    [112, 48], // inner brow
  ];

  const faceLines: [number, number][] = [
    [0, 1],
    [0, 2],
    [0, 13],
    [1, 3],
    [1, 9],
    [1, 14],
    [2, 4],
    [2, 10],
    [2, 15],
    [3, 5],
    [3, 14],
    [3, 11],
    [4, 5],
    [4, 15],
    [4, 12],
    [5, 6],
    [5, 8],
    [6, 7],
    [7, 8],
    [9, 11],
    [10, 12],
    [11, 6],
    [12, 8],
    [13, 3],
    [13, 4],
  ];

  return (
    <div className="relative h-full overflow-hidden rounded-lg bg-[#0a0a0a]">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f0d14] via-[#0a0a0a] to-[#0d100f]" />

      {/* Subtle glow */}
      <div
        className="absolute h-[120px] w-[120px] rounded-full opacity-15 blur-[50px]"
        style={{
          left: "35%",
          top: "20%",
          background: "linear-gradient(135deg, #a78bfa, #34d399)",
        }}
      />

      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 200 120"
        preserveAspectRatio="xMidYMid meet"
        fill="none"
      >
        {/* Whole face group — gentle head turn/nod */}
        <g>
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0,0; 3,-1; 0,0; -3,1; 0,0"
            dur="6s"
            repeatCount="indefinite"
          />

          {/* Face mesh lines */}
          {faceLines.map(([a, b], i) => (
            <line
              key={i}
              x1={facePts[a][0]}
              y1={facePts[a][1]}
              x2={facePts[b][0]}
              y2={facePts[b][1]}
              stroke="rgba(167,139,250,0.25)"
              strokeWidth="0.5"
            >
              <animate
                attributeName="stroke-opacity"
                values="0.2;0.35;0.2"
                dur="3s"
                begin={`${i * 0.1}s`}
                repeatCount="indefinite"
              />
            </line>
          ))}

          {/* Face mesh points */}
          {facePts.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="1.2" fill="rgba(167,139,250,0.6)">
              <animate
                attributeName="r"
                values="1;1.6;1"
                dur="2.5s"
                begin={`${i * 0.15}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="fill-opacity"
                values="0.4;0.8;0.4"
                dur="2.5s"
                begin={`${i * 0.15}s`}
                repeatCount="indefinite"
              />
            </circle>
          ))}

          {/* Eye glow — blink */}
          <circle cx="90" cy="52" r="3" fill="rgba(167,139,250,0.12)">
            <animate
              attributeName="r"
              values="3;3;0.5;3;3"
              dur="4s"
              keyTimes="0;0.45;0.5;0.55;1"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx="110" cy="52" r="3" fill="rgba(167,139,250,0.12)">
            <animate
              attributeName="r"
              values="3;3;0.5;3;3"
              dur="4s"
              keyTimes="0;0.45;0.5;0.55;1"
              repeatCount="indefinite"
            />
          </circle>

          {/* Eye pupils — track movement */}
          <circle cx="90" cy="52" r="1" fill="rgba(167,139,250,0.7)">
            <animate
              attributeName="cx"
              values="89;91;90;88;90"
              dur="5s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="cy"
              values="52;51;52;53;52"
              dur="7s"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx="110" cy="52" r="1" fill="rgba(167,139,250,0.7)">
            <animate
              attributeName="cx"
              values="109;111;110;108;110"
              dur="5s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="cy"
              values="52;51;52;53;52"
              dur="7s"
              repeatCount="indefinite"
            />
          </circle>

          {/* Mouth animation — speaking */}
          <path
            d="M93 68 Q100 72 107 68"
            stroke="rgba(167,139,250,0.3)"
            strokeWidth="0.8"
          >
            <animate
              attributeName="d"
              values="M93 68 Q100 72 107 68;M93 68 Q100 76 107 68;M93 68 Q100 73 107 68;M93 68 Q100 78 107 68;M93 68 Q100 72 107 68"
              dur="2s"
              repeatCount="indefinite"
            />
          </path>
        </g>

        {/* Scanning line — sweeps vertically */}
        <line
          x1="60"
          y1="30"
          x2="140"
          y2="30"
          stroke="rgba(167,139,250,0.2)"
          strokeWidth="0.5"
        >
          <animate
            attributeName="y1"
            values="25;95;25"
            dur="4s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="y2"
            values="25;95;25"
            dur="4s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="stroke-opacity"
            values="0;0.3;0.3;0"
            dur="4s"
            keyTimes="0;0.1;0.9;1"
            repeatCount="indefinite"
          />
        </line>

        {/* Tracking corners — animated lock-on */}
        <g stroke="rgba(167,139,250,0.3)" strokeWidth="0.6">
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0,0; 3,-1; 0,0; -3,1; 0,0"
            dur="6s"
            repeatCount="indefinite"
          />
          {/* Top-left */}
          <path d="M68,28 L68,33 M68,28 L73,28">
            <animate
              attributeName="stroke-opacity"
              values="0.2;0.5;0.2"
              dur="2s"
              repeatCount="indefinite"
            />
          </path>
          {/* Top-right */}
          <path d="M132,28 L132,33 M132,28 L127,28">
            <animate
              attributeName="stroke-opacity"
              values="0.2;0.5;0.2"
              dur="2s"
              begin="0.5s"
              repeatCount="indefinite"
            />
          </path>
          {/* Bottom-left */}
          <path d="M68,82 L68,77 M68,82 L73,82">
            <animate
              attributeName="stroke-opacity"
              values="0.2;0.5;0.2"
              dur="2s"
              begin="1s"
              repeatCount="indefinite"
            />
          </path>
          {/* Bottom-right */}
          <path d="M132,82 L132,77 M132,82 L127,82">
            <animate
              attributeName="stroke-opacity"
              values="0.2;0.5;0.2"
              dur="2s"
              begin="1.5s"
              repeatCount="indefinite"
            />
          </path>
        </g>

        {/* Outer presence ring — rotating */}
        <circle
          cx="100"
          cy="55"
          r="38"
          stroke="rgba(167,139,250,0.08)"
          strokeWidth="0.5"
          strokeDasharray="8 4"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="0 100 55;360 100 55"
            dur="12s"
            repeatCount="indefinite"
          />
        </circle>
        <circle
          cx="100"
          cy="55"
          r="45"
          stroke="rgba(167,139,250,0.04)"
          strokeWidth="0.5"
          strokeDasharray="6 6"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="360 100 55;0 100 55"
            dur="18s"
            repeatCount="indefinite"
          />
        </circle>

        {/* Data particles — float upward */}
        {[
          [75, 90],
          [125, 85],
          [68, 65],
          [132, 70],
          [80, 38],
          [120, 35],
        ].map(([x, y], i) => (
          <circle
            key={`dp-${i}`}
            cx={x}
            cy={y}
            r="0.8"
            fill="rgba(167,139,250,0.5)"
          >
            <animate
              attributeName="cy"
              values={`${y};${y - 20};${y}`}
              dur={`${3 + i * 0.5}s`}
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0;0.6;0"
              dur={`${3 + i * 0.5}s`}
              repeatCount="indefinite"
            />
          </circle>
        ))}
      </svg>

      {/* Agent indicator + waveform */}
      <div className="absolute bottom-2.5 left-3 flex items-center gap-2">
        <span
          className="h-1.5 w-1.5 rounded-full bg-emerald-400/70"
          style={{ animation: "breathe 2s ease-in-out infinite" }}
        />
        <span className="font-mono text-[9px] text-purple-400/60">
          Agent Active
        </span>
      </div>
      <div className="absolute bottom-2.5 right-3 flex items-center gap-0.5">
        {[3, 6, 4, 8, 5, 7, 3, 5, 4].map((h, i) => (
          <div
            key={i}
            className="w-[2px] rounded-full bg-purple-400/30"
            style={{
              height: `${h}px`,
              animation: "breathe 2s ease-in-out infinite",
              animationDelay: `${i * 0.15}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* ── Use Cases data ── */
const useCases: {
  title: string;
  description: string;
  attribution: string;
  Visual: React.ComponentType;
  colSpan: 2 | 4 | 6;
}[] = [
  {
    title: "AI-Generated Worlds",
    description:
      "Live environments inferred in real time from user inputs. Not pre-rendered, not pre-recorded. The world itself is the model's output.",
    attribution: "Powered by Daydream on Livepeer.",
    Visual: WorldsVisual,
    colSpan: 4,
  },
  {
    title: "AI Avatars",
    description:
      "Video representations of AI agents that respond in real time, for tutoring, telepresence, and conversational interfaces.",
    attribution: "Powered by Embody on Livepeer.",
    Visual: AvatarsVisual,
    colSpan: 2,
  },
  {
    title: "Live Video Intelligence",
    description:
      "Real-time analysis of live streams: sports broadcasts, security feeds, manufacturing lines. Processed during, not after.",
    attribution: "Emerging on Livepeer.",
    Visual: AnalysisVisual,
    colSpan: 2,
  },
  {
    title: "Prompt-Driven Live Transformation",
    description:
      "A creator goes live and the stream adapts: lighting, environment, visual style, based on a text prompt, in real time.",
    attribution: "Powered by Daydream on Livepeer.",
    Visual: PipelinesVisual,
    colSpan: 4,
  },
  {
    title: "Live Transcoding & Streaming",
    description:
      "Adaptive bitrate transcoding across a global GPU network with sub-second latency.",
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
      <div className="divider-gradient absolute top-0 left-0 right-0" />

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
              title="Real-time AI video applications"
              description="From AI-native creative tools to autonomous avatars and agents, a growing ecosystem of applications built on Livepeer's open GPU network."
              align="split"
            />
          </motion.div>

          <div className="mt-20 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-6">
            {useCases.map((useCase) => (
              <motion.div
                key={useCase.title}
                variants={fadeUp}
                transition={{ duration: 0.4 }}
                className={`md:col-span-1 ${colSpanClass[useCase.colSpan]}`}
              >
                <div className="block h-full overflow-hidden rounded-xl border border-white/[0.07] bg-[#1a1a1a]">
                  <div
                    className={`p-2.5 pb-0 ${useCase.colSpan === 4 ? "h-[180px] lg:h-[240px]" : "h-[180px]"}`}
                  >
                    <useCase.Visual />
                  </div>
                  <div className="px-5 py-5">
                    <h3 className="text-lg font-medium text-white/90">
                      {useCase.title}
                    </h3>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-white/40">
                      {useCase.description}
                    </p>
                    <p className="mt-3 text-[12px] text-white/25">
                      {useCase.attribution}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Sub-section B: Solution Cards */}
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.4 }}
            className="mt-16"
          >
            <p className="mb-4 font-mono text-xs font-medium tracking-wider text-white/30 uppercase">
              Solutions
            </p>
            <h3 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Live on Livepeer
            </h3>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-white/50">
              Applications and emerging capabilities on Livepeer, from
              transcoding and streaming to real-time AI.
            </p>
          </motion.div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              {
                name: "Daydream",
                capability:
                  "Turn a live camera feed into AI-generated video, in real time.",
                Visual: DaydreamSolutionVisual,
              },
              {
                name: "Frameworks",
                capability:
                  "Stream to any device, any format, any scale, from a single source.",
                Visual: FrameworksSolutionVisual,
              },
              {
                name: "Streamplace",
                capability:
                  "Open-source video infrastructure powering AT Protocol social apps.",
                Visual: StreamplaceSolutionVisual,
              },
              {
                name: "Embody",
                capability:
                  "Deploy AI avatars that see, speak, and respond in real time.",
                Visual: EmbodySolutionVisual,
              },
            ].map((solution) => (
              <motion.div
                key={solution.name}
                variants={fadeUp}
                transition={{ duration: 0.4 }}
                className="flex flex-col overflow-hidden rounded-xl border border-white/[0.07] bg-[#1a1a1a]"
              >
                <div className="h-[200px] p-2.5 pb-0">
                  <solution.Visual />
                </div>
                <div className="px-5 py-5">
                  <h3 className="text-[15px] font-medium text-white/90">
                    {solution.name}
                  </h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-white/40">
                    {solution.capability}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.4 }}
            className="mt-12 text-center"
          >
            <a
              href="/ecosystem"
              className="inline-flex items-center gap-1.5 rounded-lg px-5 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:brightness-110 active:brightness-95"
              style={{
                background:
                  "linear-gradient(135deg, #1E9960 0%, #18794E 60%, #115C3B 100%)",
              }}
            >
              Explore the Ecosystem
              <span aria-hidden="true">&rarr;</span>
            </a>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}
