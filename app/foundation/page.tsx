"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Container from "@/components/ui/Container";
import SectionHeader from "@/components/ui/SectionHeader";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const PILLARS = [
  {
    num: "01",
    title: "Strategic Alignment",
    description:
      "Co-creating the long-term, shared vision with key stakeholders across the Livepeer ecosystem.",
  },
  {
    num: "02",
    title: "Core Development",
    description:
      "Coordinating research, development, and upgrades that strengthen the Livepeer network and protocol.",
  },
  {
    num: "03",
    title: "Ecosystem Growth",
    description:
      "Driving awareness of the Livepeer project and onboarding new developers and companies to drive demand to the network.",
  },
];

const VALUES = [
  {
    title: "Transparency & Accountability",
    description:
      "Our funding, decisions and deliverables follow open processes with clear reporting, milestones and public oversight.",
  },
  {
    title: "Efficiency & Execution",
    description:
      "We drive forward priority work with focus, discipline and speed to fuel network demand and innovation.",
  },
  {
    title: "Co-creation & Inclusivity",
    description:
      "We\u2019re a vehicle for ecosystem participation that co-creates the future of the network through community inclusion and open feedback cycles.",
  },
];

/* ------------------------------------------------------------------ */
/*  Card illustrations (bold B&W, Linear-inspired)                     */
/* ------------------------------------------------------------------ */

function IllustrationStrategy() {
  // Compass / convergence — multiple arrows pointing inward to a center target
  return (
    <svg
      viewBox="0 0 200 140"
      fill="none"
      className="h-full w-full"
      aria-hidden="true"
    >
      {/* Outer ring */}
      <circle
        cx="100"
        cy="70"
        r="55"
        stroke="rgba(255,255,255,0.12)"
        strokeWidth="1"
      />
      {/* Middle ring */}
      <circle
        cx="100"
        cy="70"
        r="35"
        stroke="rgba(255,255,255,0.20)"
        strokeWidth="1"
      />
      {/* Inner ring */}
      <circle
        cx="100"
        cy="70"
        r="16"
        stroke="rgba(255,255,255,0.40)"
        strokeWidth="1.5"
      />
      {/* Center dot */}
      <circle cx="100" cy="70" r="4" fill="rgba(255,255,255,0.80)" />
      {/* Converging lines from edges */}
      <line
        x1="20"
        y1="20"
        x2="88"
        y2="58"
        stroke="rgba(255,255,255,0.30)"
        strokeWidth="1"
      />
      <line
        x1="180"
        y1="20"
        x2="112"
        y2="58"
        stroke="rgba(255,255,255,0.30)"
        strokeWidth="1"
      />
      <line
        x1="20"
        y1="120"
        x2="88"
        y2="82"
        stroke="rgba(255,255,255,0.30)"
        strokeWidth="1"
      />
      <line
        x1="180"
        y1="120"
        x2="112"
        y2="82"
        stroke="rgba(255,255,255,0.30)"
        strokeWidth="1"
      />
      {/* Arrow tips — single shape rotated per line for perfect symmetry */}
      <path
        d="M0,0 L-8,-4 L-8,4Z"
        fill="rgba(255,255,255,0.30)"
        transform="translate(88,58) rotate(29.2)"
      />
      <path
        d="M0,0 L-8,-4 L-8,4Z"
        fill="rgba(255,255,255,0.30)"
        transform="translate(112,58) rotate(150.8)"
      />
      <path
        d="M0,0 L-8,-4 L-8,4Z"
        fill="rgba(255,255,255,0.30)"
        transform="translate(88,82) rotate(-29.2)"
      />
      <path
        d="M0,0 L-8,-4 L-8,4Z"
        fill="rgba(255,255,255,0.30)"
        transform="translate(112,82) rotate(-150.8)"
      />
      {/* Corner dots */}
      <circle cx="20" cy="20" r="3" fill="rgba(255,255,255,0.50)" />
      <circle cx="180" cy="20" r="3" fill="rgba(255,255,255,0.50)" />
      <circle cx="20" cy="120" r="3" fill="rgba(255,255,255,0.50)" />
      <circle cx="180" cy="120" r="3" fill="rgba(255,255,255,0.50)" />
      {/* Crosshair dashes */}
      <line
        x1="100"
        y1="5"
        x2="100"
        y2="54"
        stroke="rgba(255,255,255,0.10)"
        strokeWidth="0.75"
        strokeDasharray="4 3"
      />
      <line
        x1="100"
        y1="86"
        x2="100"
        y2="135"
        stroke="rgba(255,255,255,0.10)"
        strokeWidth="0.75"
        strokeDasharray="4 3"
      />
      <line
        x1="35"
        y1="70"
        x2="84"
        y2="70"
        stroke="rgba(255,255,255,0.10)"
        strokeWidth="0.75"
        strokeDasharray="4 3"
      />
      <line
        x1="116"
        y1="70"
        x2="165"
        y2="70"
        stroke="rgba(255,255,255,0.10)"
        strokeWidth="0.75"
        strokeDasharray="4 3"
      />
    </svg>
  );
}

function IllustrationDevelopment() {
  // Layered blocks with code-like horizontal lines inside
  return (
    <svg
      viewBox="0 0 200 140"
      fill="none"
      className="h-full w-full"
      aria-hidden="true"
    >
      {/* Bottom layer — widest */}
      <rect
        x="20"
        y="95"
        width="160"
        height="35"
        rx="4"
        stroke="rgba(255,255,255,0.15)"
        strokeWidth="1"
      />
      {[35, 55, 75, 95, 115, 135].map((x) => (
        <line
          key={x}
          x1={x}
          y1="106"
          x2={x + 12}
          y2="106"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="1.5"
        />
      ))}
      {[35, 55, 75, 95].map((x) => (
        <line
          key={`b${x}`}
          x1={x}
          y1="116"
          x2={x + 18}
          y2="116"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="1.5"
        />
      ))}
      {/* Middle layer */}
      <rect
        x="35"
        y="55"
        width="130"
        height="32"
        rx="4"
        stroke="rgba(255,255,255,0.25)"
        strokeWidth="1"
        fill="rgba(255,255,255,0.02)"
      />
      {[50, 70, 90, 110, 130].map((x) => (
        <line
          key={x}
          x1={x}
          y1="66"
          x2={x + 14}
          y2="66"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="2"
        />
      ))}
      {[50, 70, 90].map((x) => (
        <line
          key={`m${x}`}
          x1={x}
          y1="76"
          x2={x + 20}
          y2="76"
          stroke="rgba(255,255,255,0.10)"
          strokeWidth="1.5"
        />
      ))}
      {/* Top layer — brightest */}
      <rect
        x="50"
        y="12"
        width="100"
        height="35"
        rx="4"
        stroke="rgba(255,255,255,0.45)"
        strokeWidth="1.5"
        fill="rgba(255,255,255,0.04)"
      />
      {[65, 85, 105, 125].map((x) => (
        <line
          key={x}
          x1={x}
          y1="24"
          x2={x + 10}
          y2="24"
          stroke="rgba(255,255,255,0.40)"
          strokeWidth="2"
        />
      ))}
      {[65, 85, 105].map((x) => (
        <line
          key={`t${x}`}
          x1={x}
          y1="34"
          x2={x + 16}
          y2="34"
          stroke="rgba(255,255,255,0.25)"
          strokeWidth="1.5"
        />
      ))}
      {/* Connecting vertical lines between layers */}
      <line
        x1="80"
        y1="47"
        x2="80"
        y2="55"
        stroke="rgba(255,255,255,0.20)"
        strokeWidth="1"
      />
      <line
        x1="120"
        y1="47"
        x2="120"
        y2="55"
        stroke="rgba(255,255,255,0.20)"
        strokeWidth="1"
      />
      <line
        x1="80"
        y1="87"
        x2="80"
        y2="95"
        stroke="rgba(255,255,255,0.12)"
        strokeWidth="1"
      />
      <line
        x1="120"
        y1="87"
        x2="120"
        y2="95"
        stroke="rgba(255,255,255,0.12)"
        strokeWidth="1"
      />
    </svg>
  );
}

function IllustrationGrowth() {
  // Expanding network — central node with radiating connections and outer nodes
  return (
    <svg
      viewBox="0 0 200 140"
      fill="none"
      className="h-full w-full"
      aria-hidden="true"
    >
      {/* Outer connections (dashed) */}
      {(
        [
          [100, 70, 180, 25],
          [100, 70, 175, 115],
          [100, 70, 25, 25],
          [100, 70, 25, 115],
          [100, 70, 100, 5],
          [100, 70, 100, 135],
        ] as [number, number, number, number][]
      ).map(([x1, y1, x2, y2], i) => (
        <line
          key={`ol-${i}`}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="0.75"
          strokeDasharray="3 4"
        />
      ))}
      {/* Inner connections (solid) */}
      {(
        [
          [140, 45],
          [145, 95],
          [60, 45],
          [55, 95],
          [100, 25],
          [100, 115],
        ] as [number, number][]
      ).map(([x, y], i) => (
        <line
          key={`il-${i}`}
          x1="100"
          y1="70"
          x2={x}
          y2={y}
          stroke="rgba(255,255,255,0.20)"
          strokeWidth="1"
        />
      ))}
      {/* Outer ring nodes */}
      {(
        [
          [180, 25],
          [175, 115],
          [25, 25],
          [25, 115],
          [100, 5],
          [100, 135],
        ] as [number, number][]
      ).map(([x, y], i) => (
        <g key={`on-${i}`}>
          <circle cx={x} cy={y} r="4" fill="rgba(255,255,255,0.15)" />
        </g>
      ))}
      {/* Secondary outer nodes */}
      {(
        [
          [155, 10],
          [185, 70],
          [45, 10],
          [15, 70],
          [60, 130],
          [140, 130],
        ] as [number, number][]
      ).map(([x, y], i) => (
        <circle
          key={`sn-${i}`}
          cx={x}
          cy={y}
          r="2.5"
          fill="rgba(255,255,255,0.10)"
        />
      ))}
      {/* Inner ring nodes */}
      {(
        [
          [140, 45],
          [145, 95],
          [60, 45],
          [55, 95],
          [100, 25],
          [100, 115],
        ] as [number, number][]
      ).map(([x, y], i) => (
        <g key={`in-${i}`}>
          <circle
            cx={x}
            cy={y}
            r="6"
            stroke="rgba(255,255,255,0.30)"
            strokeWidth="1"
            fill="rgba(255,255,255,0.05)"
          />
          <circle cx={x} cy={y} r="2.5" fill="rgba(255,255,255,0.50)" />
        </g>
      ))}
      {/* Cross connections between inner nodes */}
      <line
        x1="140"
        y1="45"
        x2="145"
        y2="95"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth="0.75"
      />
      <line
        x1="60"
        y1="45"
        x2="55"
        y2="95"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth="0.75"
      />
      <line
        x1="140"
        y1="45"
        x2="100"
        y2="25"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth="0.75"
      />
      <line
        x1="60"
        y1="45"
        x2="100"
        y2="25"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth="0.75"
      />
      {/* Center hub */}
      <circle
        cx="100"
        cy="70"
        r="10"
        stroke="rgba(255,255,255,0.50)"
        strokeWidth="1.5"
        fill="rgba(255,255,255,0.06)"
      />
      <circle cx="100" cy="70" r="4" fill="rgba(255,255,255,0.80)" />
    </svg>
  );
}

function IllustrationTransparency() {
  // Open window / magnifying lens with visible grid and data points
  return (
    <svg
      viewBox="0 0 200 140"
      fill="none"
      className="h-full w-full"
      aria-hidden="true"
    >
      {/* Background grid (partially visible) */}
      {[30, 50, 70, 90, 110, 130, 150, 170].map((x) => (
        <line
          key={`v${x}`}
          x1={x}
          y1="10"
          x2={x}
          y2="130"
          stroke="rgba(255,255,255,0.04)"
          strokeWidth="0.5"
        />
      ))}
      {[20, 40, 60, 80, 100, 120].map((y) => (
        <line
          key={`h${y}`}
          x1="20"
          y1={y}
          x2="180"
          y2={y}
          stroke="rgba(255,255,255,0.04)"
          strokeWidth="0.5"
        />
      ))}
      {/* Lens circle */}
      <circle
        cx="95"
        cy="65"
        r="45"
        stroke="rgba(255,255,255,0.40)"
        strokeWidth="1.5"
      />
      <circle
        cx="95"
        cy="65"
        r="46"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth="4"
      />
      {/* Handle */}
      <line
        x1="127"
        y1="97"
        x2="165"
        y2="130"
        stroke="rgba(255,255,255,0.50)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <line
        x1="127"
        y1="97"
        x2="165"
        y2="130"
        stroke="rgba(255,255,255,0.20)"
        strokeWidth="6"
        strokeLinecap="round"
      />
      {/* Magnified content inside lens — data rows */}
      {[40, 52, 64, 76, 88].map((y, i) => (
        <g key={y}>
          <rect
            x="60"
            y={y}
            width={[45, 55, 35, 50, 40][i]}
            height="3"
            rx="1.5"
            fill={`rgba(255,255,255,${[0.35, 0.25, 0.45, 0.2, 0.3][i]})`}
          />
          <rect
            x={60 + [48, 58, 38, 53, 43][i]}
            y={y}
            width={[16, 12, 20, 14, 18][i]}
            height="3"
            rx="1.5"
            fill={`rgba(255,255,255,${[0.15, 0.12, 0.18, 0.1, 0.14][i]})`}
          />
        </g>
      ))}
    </svg>
  );
}

function IllustrationEfficiency() {
  // Funnel / pipeline narrowing from many inputs to focused output
  return (
    <svg
      viewBox="0 0 200 140"
      fill="none"
      className="h-full w-full"
      aria-hidden="true"
    >
      {/* Input dots on the left — scattered */}
      {(
        [
          [15, 15],
          [30, 30],
          [10, 50],
          [25, 70],
          [18, 90],
          [35, 105],
          [12, 120],
          [40, 18],
          [45, 55],
          [38, 85],
          [42, 40],
        ] as [number, number][]
      ).map(([x, y], i) => (
        <circle
          key={`d-${i}`}
          cx={x}
          cy={y}
          r={[3, 2.5, 3, 2, 2.5, 3, 2, 2.5, 2, 3, 2.5][i]}
          fill={`rgba(255,255,255,${0.15 + i * 0.03})`}
        />
      ))}
      {/* Flow lines converging */}
      <path
        d="M 50 15 C 80 15, 100 55, 140 65"
        stroke="rgba(255,255,255,0.12)"
        strokeWidth="0.75"
      />
      <path
        d="M 50 35 C 80 35, 100 55, 140 67"
        stroke="rgba(255,255,255,0.15)"
        strokeWidth="0.75"
      />
      <path
        d="M 50 55 C 80 55, 110 60, 140 69"
        stroke="rgba(255,255,255,0.18)"
        strokeWidth="1"
      />
      <path
        d="M 50 75 C 80 75, 110 72, 140 71"
        stroke="rgba(255,255,255,0.18)"
        strokeWidth="1"
      />
      <path
        d="M 50 95 C 80 95, 100 80, 140 73"
        stroke="rgba(255,255,255,0.15)"
        strokeWidth="0.75"
      />
      <path
        d="M 50 115 C 80 115, 100 85, 140 75"
        stroke="rgba(255,255,255,0.12)"
        strokeWidth="0.75"
      />
      {/* Funnel shape */}
      <path
        d="M 55 5 L 55 135 L 140 80 L 140 60 Z"
        stroke="rgba(255,255,255,0.15)"
        strokeWidth="1"
        fill="rgba(255,255,255,0.02)"
      />
      {/* Output — bold arrow */}
      <line
        x1="140"
        y1="70"
        x2="185"
        y2="70"
        stroke="rgba(255,255,255,0.60)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <polygon points="185,70 175,63 175,77" fill="rgba(255,255,255,0.60)" />
      {/* Output dot */}
      <circle cx="192" cy="70" r="4" fill="rgba(255,255,255,0.80)" />
    </svg>
  );
}

function IllustrationCocreation() {
  // Three overlapping circles with people-like dots forming a collaborative pattern
  return (
    <svg
      viewBox="0 0 200 140"
      fill="none"
      className="h-full w-full"
      aria-hidden="true"
    >
      {/* Three overlapping circles */}
      <circle
        cx="85"
        cy="55"
        r="42"
        stroke="rgba(255,255,255,0.18)"
        strokeWidth="1"
      />
      <circle
        cx="115"
        cy="55"
        r="42"
        stroke="rgba(255,255,255,0.18)"
        strokeWidth="1"
      />
      <circle
        cx="100"
        cy="85"
        r="42"
        stroke="rgba(255,255,255,0.18)"
        strokeWidth="1"
      />
      {/* Triple intersection fill */}
      <clipPath id="c1">
        <circle cx="85" cy="55" r="42" />
      </clipPath>
      <clipPath id="c2">
        <circle cx="115" cy="55" r="42" />
      </clipPath>
      <g clipPath="url(#c1)">
        <g clipPath="url(#c2)">
          <circle cx="100" cy="85" r="42" fill="rgba(255,255,255,0.08)" />
        </g>
      </g>
      {/* Center — collaborative node */}
      <circle
        cx="100"
        cy="65"
        r="7"
        stroke="rgba(255,255,255,0.50)"
        strokeWidth="1.5"
        fill="rgba(255,255,255,0.08)"
      />
      <circle cx="100" cy="65" r="3" fill="rgba(255,255,255,0.70)" />
      {/* Connection lines from people to center */}
      <line
        x1="74"
        y1="55"
        x2="93"
        y2="63"
        stroke="rgba(255,255,255,0.15)"
        strokeWidth="0.75"
        strokeDasharray="3 2"
      />
      <line
        x1="126"
        y1="55"
        x2="107"
        y2="63"
        stroke="rgba(255,255,255,0.15)"
        strokeWidth="0.75"
        strokeDasharray="3 2"
      />
      <line
        x1="100"
        y1="92"
        x2="100"
        y2="72"
        stroke="rgba(255,255,255,0.15)"
        strokeWidth="0.75"
        strokeDasharray="3 2"
      />
    </svg>
  );
}

const PILLAR_ILLUSTRATIONS = [
  IllustrationStrategy,
  IllustrationDevelopment,
  IllustrationGrowth,
];
const VALUE_ILLUSTRATIONS = [
  IllustrationTransparency,
  IllustrationEfficiency,
  IllustrationCocreation,
];

/* ------------------------------------------------------------------ */
/*  Scroll-opacity mission text                                        */
/* ------------------------------------------------------------------ */

const MISSION_TEXT: {
  word: string;
  bold?: boolean;
  color?: string;
  num?: string;
}[] = [
  { word: "Drive" },
  { word: "the" },
  { word: "strategy,", bold: true, color: "text-gradient", num: "01" },
  { word: "core", bold: true, color: "text-gradient", num: "02" },
  { word: "development", bold: true, color: "text-gradient" },
  { word: "and" },
  { word: "ecosystem", bold: true, color: "text-gradient", num: "03" },
  { word: "growth", bold: true, color: "text-gradient" },
  { word: "of" },
  { word: "the" },
  { word: "Livepeer" },
  { word: "project." },
];

function ScrollRevealMission() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.9", "start 0.25"],
  });

  return (
    <div ref={containerRef} className="mx-auto max-w-2xl text-center">
      <p className="text-4xl leading-tight font-light tracking-tight sm:text-5xl lg:text-6xl text-balance">
        {MISSION_TEXT.map((item, i) => (
          <ScrollWord
            key={i}
            word={item.word}
            bold={item.bold}
            color={item.color}
            num={item.num}
            index={i}
            total={MISSION_TEXT.length}
            progress={scrollYProgress}
          />
        ))}
      </p>
    </div>
  );
}

function ScrollWord({
  word,
  bold,
  color,
  num,
  index,
  total,
  progress,
}: {
  word: string;
  bold?: boolean;
  color?: string;
  num?: string;
  index: number;
  total: number;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
}) {
  const start = index / total;
  const end = start + 1 / total;
  const opacity = useTransform(progress, [start, end], [0.15, 1]);

  return (
    <motion.span
      style={{ opacity }}
      className={`${num ? "relative" : ""} transition-none ${bold ? "font-medium" : ""} ${color || ""}`}
    >
      {num && (
        <span className="text-gradient absolute top-[0.15em] -left-[0.6em] font-mono text-[0.2em] font-bold leading-none">
          {num}
        </span>
      )}
      {word}{" "}
    </motion.span>
  );
}

/* ------------------------------------------------------------------ */
/*  Animated grain canvas (like Linear's GrainCanvas)                  */
/* ------------------------------------------------------------------ */

function GrainCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf: number;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (!rect) return;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
    };

    resize();
    window.addEventListener("resize", resize);

    const frame = () => {
      const w = canvas.width;
      const h = canvas.height;
      if (w === 0 || h === 0) {
        raf = requestAnimationFrame(frame);
        return;
      }
      const imageData = ctx.createImageData(w, h);
      const d = imageData.data;
      for (let i = 0; i < d.length; i += 4) {
        const v = (Math.random() * 255) | 0;
        d[i] = v;
        d[i + 1] = v;
        d[i + 2] = v;
        d[i + 3] = 255;
      }
      ctx.putImageData(imageData, 0, 0);
      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden="true"
      style={{ opacity: 0.1, zIndex: 10 }}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Tile grid with cutout hole + corner crosshairs                     */
/* ------------------------------------------------------------------ */

function TileGrid({ children }: { children?: React.ReactNode }) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [tile, setTile] = useState(0);
  const [gridOffsetX, setGridOffsetX] = useState(0);

  const calculate = useCallback(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const w = grid.offsetWidth;
    const maxTile = 160;
    const t = Math.min(w / 9, maxTile);
    setTile(t);

    const gridWidth = t * 9;
    const offsetX = (w - gridWidth) / 2;
    setGridOffsetX(offsetX);
  }, []);

  useEffect(() => {
    calculate();
    window.addEventListener("resize", calculate);
    return () => window.removeEventListener("resize", calculate);
  }, [calculate]);

  return (
    <div
      ref={gridRef}
      className="pointer-events-none absolute inset-0 hidden md:block"
      aria-hidden="true"
      style={{
        zIndex: 15,
        maskImage: "linear-gradient(to bottom, white 50%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(to bottom, white 50%, transparent 100%)",
      }}
    >
      {tile > 0 && (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)",
            backgroundSize: `${tile}px ${tile}px`,
            backgroundPosition: `${gridOffsetX}px 0`,
          }}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function FoundationPage() {
  return (
    <>
      {/* ---- Hero ---- */}
      <div className="relative overflow-hidden">
        <TileGrid />

        <section className="relative flex min-h-screen items-center">
          {/* Dark B&W background photograph */}
          <img
            src="/images/foundation-hero.webp"
            alt=""
            className="pointer-events-none absolute inset-0 h-full w-full object-cover"
            style={{
              objectPosition: "center 100%",
              filter: "grayscale(70%) brightness(0.55) contrast(1.1)",
            }}
          />

          {/* Animated grain / static overlay */}
          <GrainCanvas />

          {/* Vignette / dark edges */}
          <div
            className="pointer-events-none absolute inset-0"
            aria-hidden="true"
            style={{
              background:
                "radial-gradient(ellipse 60% 50% at 50% 45%, transparent 10%, rgba(18,18,18,0.9) 100%)",
            }}
          />

          <Container className="relative z-[16]">
            <motion.div
              className="mx-auto max-w-5xl text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <p className="mb-6 font-mono text-xs font-medium tracking-wider text-white/60 uppercase">
                The Livepeer Foundation
              </p>
              <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-7xl">
                Stewarding the World&apos;s Open Video Infrastructure
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/65 lg:text-xl text-pretty">
                The Livepeer Foundation is a neutral, non-profit steward of the
                Livepeer protocol, coordinating long-term strategy, core
                development and ecosystem growth to strengthen and expand the
                Livepeer network.
              </p>
            </motion.div>
          </Container>

          {/* Bottom fade to page bg */}
          <div
            className="pointer-events-none absolute bottom-0 left-0 right-0 h-48"
            aria-hidden="true"
            style={{
              background: "linear-gradient(to bottom, transparent, #121212)",
              zIndex: 14,
            }}
          />
        </section>
      </div>

      {/* ---- Mission ---- */}
      <section className="relative flex items-center justify-center py-24 sm:py-36 lg:py-48">
        <div className="relative px-6 text-center md:px-0 max-w-[90vw] md:max-w-[55.55vw]">
          <p className="absolute inset-x-0 -top-12 font-mono text-xs font-medium tracking-wider text-white/30 uppercase">
            Our Mission
          </p>
          <ScrollRevealMission />
        </div>
      </section>

      {/* ---- Pillars ---- */}
      <section className="relative py-16 sm:py-24 lg:py-32">
        <div className="divider-gradient absolute top-0 right-0 left-0" />

        <Container>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            transition={{ staggerChildren: 0.1 }}
          >
            <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
              <div className="mx-auto max-w-2xl">
                <SectionHeader
                  label="Our Pillars"
                  title="Three pillars of network stewardship"
                  align="center"
                />
              </div>
            </motion.div>

            <div className="mt-20 grid gap-4 sm:grid-cols-3">
              {PILLARS.map((pillar, i) => {
                const Illus = PILLAR_ILLUSTRATIONS[i];
                return (
                  <motion.div
                    key={pillar.num}
                    variants={fadeUp}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col rounded-xl border border-white/[0.07] bg-[#1a1a1a] p-8"
                  >
                    <p className="font-mono text-[11px] tracking-wider text-white/25">
                      {pillar.num}{" "}
                      <span className="ml-1.5 text-white/40">
                        {pillar.title}
                      </span>
                    </p>
                    <div className="my-6 h-44 w-full">
                      <Illus />
                    </div>
                    <h3 className="mt-auto text-xl font-medium leading-snug text-white lg:text-2xl">
                      {pillar.description}
                    </h3>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </Container>
      </section>

      {/* ---- Values ---- */}
      <section className="relative py-24 lg:py-32">
        <div className="divider-gradient absolute top-0 right-0 left-0" />

        <Container>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            transition={{ staggerChildren: 0.1 }}
          >
            <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
              <SectionHeader
                label="Our Values"
                title="What guides us"
                align="center"
              />
            </motion.div>

            <div className="mt-20 grid gap-4 sm:grid-cols-3">
              {VALUES.map((value, i) => {
                const Illus = VALUE_ILLUSTRATIONS[i];
                return (
                  <motion.div
                    key={value.title}
                    variants={fadeUp}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col rounded-xl border border-white/[0.07] bg-[#1a1a1a] p-8"
                  >
                    <p className="font-mono text-[11px] tracking-wider text-white/25">
                      0{i + 1}{" "}
                      <span className="ml-1.5 text-white/40">
                        {value.title}
                      </span>
                    </p>
                    <div className="my-6 h-44 w-full">
                      <Illus />
                    </div>
                    <h3 className="mt-auto text-xl font-medium leading-snug text-white lg:text-2xl">
                      {value.description}
                    </h3>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </Container>
      </section>
    </>
  );
}
