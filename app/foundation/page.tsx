"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import { LivepeerSymbol } from "@/components/icons/LivepeerLogo";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

// WORK pillars are defined inside the WhatWeDo section below so they
// can reference the Strategy/Coordination/Support graphic components,
// which sit later in the file.

// Preserved for when the Team section is re-enabled (pending member
// headshots). Underscore prefix keeps the unused-vars linter happy
// while clearly signaling intent.
const _TEAM = [
  { name: "Steph Alinsug", role: "Narrative" },
  { name: "Ben Perez", role: "Operations" },
  { name: "Rick Staa", role: "Technical" },
  { name: "Rich O'Grady", role: "Ecosystem & Trust" },
  { name: "Mehrdad Sadeghi", role: "Ops Engineer" },
  { name: "Joe Birch", role: "Storyteller" },
];

/* ================================================================== */
/*  Hero graphic — Venn-style overlapping circles, modeled exactly on   */
/*  Linear Method's graphic.                                           */
/*  Two dashed-border circle DIVs overlap. Inside each, a "spinner"    */
/*  div rotates 10s linear, carrying a gradient comet SVG at the top   */
/*  edge. The right circle's container is rotated 180° so the two      */
/*  comets are 180° out of phase. Stripes fill the lens intersection.  */
/* ================================================================== */

function CometSvg() {
  // Concentric 50° arc centered at the viewBox center. The containing
  // spinner is extended via `inset: -1px` so the SVG's viewBox maps to
  // the FULL circle (including its 1px border area), not just the inner
  // content box. This lets the arc radius of 49.9 land directly on the
  // dashed border (at ~49.91 viewBox units from center), so the comet
  // traces along the arc edge exactly rather than floating inside.
  //
  // Arc from angle 270° (top) to angle 320° (50° clockwise).
  // Start: (50 + 49.9·cos(270°), 50 + 49.9·sin(270°)) = (50, 0.1)
  // End:   (50 + 49.9·cos(320°), 50 + 49.9·sin(320°)) = (88.23, 17.92)
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        overflow: "visible",
      }}
    >
      <path
        d="M 50 0.1 A 49.9 49.9 0 0 1 88.23 17.92"
        stroke="url(#foundationComet)"
        strokeLinecap="round"
        strokeWidth="0.4"
      />
      <defs>
        <linearGradient
          id="foundationComet"
          x1="50"
          y1="0.1"
          x2="88.23"
          y2="17.92"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F7F8F8" />
          <stop offset="1" stopColor="#F7F8F8" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function HeroVenn() {
  // Geometry:
  //   D = circle diameter = min(40vw, 560px)
  //   Circles overlap by 42% of D (each translated 21% inward)
  //   Bounding width = 2D - 0.42D = 1.58D
  // Inside the bounds, circles sit against the left and right edges.
  return (
    <div className="relative mx-auto" style={{ width: "min(63vw, 883px)" }}>
      <div
        className="relative"
        style={{
          // Container aspect matches 1.58 : 1 (width : height of bounds)
          paddingBottom: `${(100 / 1.58).toFixed(4)}%`,
        }}
      >
        {/* Left circle — anchored to left edge of bounds */}
        <div
          className="absolute"
          style={{
            left: 0,
            top: 0,
            width: `${(100 / 1.58).toFixed(4)}%`,
            aspectRatio: "1 / 1",
            border: "1px dashed rgba(255, 255, 255, 0.25)",
            borderRadius: "50%",
          }}
        >
          <div className="venn-spinner">
            <CometSvg />
          </div>
        </div>

        {/* Right circle — anchored to right edge, rotated 180° so its
            comet is phase-offset */}
        <div
          className="absolute"
          style={{
            right: 0,
            top: 0,
            width: `${(100 / 1.58).toFixed(4)}%`,
            aspectRatio: "1 / 1",
            border: "1px dashed rgba(255, 255, 255, 0.25)",
            borderRadius: "50%",
            transform: "rotate(180deg)",
          }}
        >
          <div className="venn-spinner">
            <CometSvg />
          </div>
        </div>

        {/* Stripes inside the lens intersection */}
        <HeroStripes />

      </div>

      <style>{`
        /* Spinner is extended by 1px beyond the circle's content box so
           the SVG viewBox (0..100) maps to the full outer bounds of the
           circle (including the 1px dashed border). The concentric arc
           at viewBox radius 49.9 then lands directly on the dashed arc,
           so the comet traces along the border instead of floating inside. */
        .venn-spinner {
          position: absolute;
          inset: -1px;
          border-radius: 50%;
          overflow: visible;
          animation: vennSpin 10s linear infinite;
        }
        @keyframes vennSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          .venn-spinner { animation: none !important; }
        }
      `}</style>
    </div>
  );
}

// Diagonal stripes clipped to the lens = intersection of the two circles.
// Uses nested SVG clipPaths (inside-both) to isolate the lens region.
function HeroStripes() {
  // viewBox 158 × 100 matches the 1.58:1 bounding box. Each circle has
  // diameter 100 and radius 50. Left circle center (50, 50), right (108, 50).
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 158 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <pattern
          id="lensHatch"
          width="1.6"
          height="1.6"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="1.6"
            stroke="rgba(255,255,255,0.32)"
            strokeWidth="0.35"
          />
        </pattern>
        {/* Primary glow — deep forest green, centred near the lens
            centre. Slightly larger radius so it fills most of the
            intersection. */}
        <radialGradient
          id="lensGlowA"
          cx="79"
          cy="50"
          r="24"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="rgba(30, 153, 96, 0.36)" />
          <stop offset="45%" stopColor="rgba(24, 121, 78, 0.13)" />
          <stop offset="100%" stopColor="rgba(24, 121, 78, 0)" />
        </radialGradient>
        {/* Secondary glow — Livepeer blue, biased to the right side
            of the lens. Drifts on its own rhythm against the green
            primary, so the intersection reads as the two brand
            colors meeting — a miniature echo of the green→blue
            top aurora. */}
        <radialGradient
          id="lensGlowB"
          cx="90"
          cy="50"
          r="16"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="rgba(37, 171, 208, 0.32)" />
          <stop offset="55%" stopColor="rgba(20, 106, 143, 0.13)" />
          <stop offset="100%" stopColor="rgba(20, 106, 143, 0)" />
        </radialGradient>
        {/* Slightly smaller clip circles (r=48.2 instead of 50) so the
            stripes sit with a small inset from the dashed arc edges,
            matching Linear Method's padded lens treatment. */}
        <clipPath id="clipLeftCircle">
          <circle cx="50" cy="50" r="48.2" />
        </clipPath>
        <clipPath id="clipRightCircle">
          <circle cx="108" cy="50" r="48.2" />
        </clipPath>
      </defs>
      {/* Nested clips = intersection of both circles = the lens.
          Layered motion (bottom to top):
            1. Primary glow — slow breathing (forest green)
            2. Secondary glow — drifts across the lens (mint)
            3. Hatching — crisp diagonal lines on top of all motion */}
      <g clipPath="url(#clipLeftCircle)">
        <g clipPath="url(#clipRightCircle)">
          <rect
            x="0"
            y="0"
            width="158"
            height="100"
            fill="url(#lensGlowA)"
            style={{
              animation: "lensGlowABreathe 7.5s ease-in-out infinite",
              transformOrigin: "79px 50px",
            }}
          />
          <rect
            x="0"
            y="0"
            width="158"
            height="100"
            fill="url(#lensGlowB)"
            style={{
              animation: "lensGlowBDrift 9.5s ease-in-out infinite",
              transformOrigin: "79px 50px",
              mixBlendMode: "screen",
            }}
          />
          <rect x="0" y="0" width="158" height="100" fill="url(#lensHatch)" />
        </g>
      </g>
      <style>{`
        @keyframes lensGlowABreathe {
          0%, 100% { opacity: 0.55; transform: scale(0.9); }
          50%      { opacity: 1;    transform: scale(1.08); }
        }
        @keyframes lensGlowBDrift {
          0%, 100% {
            opacity: 0.4;
            transform: translate(-6px, 4px) scale(0.95);
          }
          33% {
            opacity: 0.95;
            transform: translate(5px, -3px) scale(1.1);
          }
          66% {
            opacity: 0.7;
            transform: translate(-2px, -5px) scale(1);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          rect[style*="animation"] { animation: none !important; }
        }
      `}</style>
    </svg>
  );
}

/* ================================================================== */
/*  Chapter graphics — wide rectangular SVG banners                    */
/*  Designed to match the width of body text and sit tight between     */
/*  the heading and the prose. Inspired by Linear Method.              */
/* ================================================================== */

// 01 — Network: a peer-mesh constellation. Nodes scattered organically,
// connected to nearest neighbors with clearly visible mesh wiring.
// Smooth glowing particles travel between connected peers — each
// particle is a bright dot with a soft halo that glides along an edge.
function NetworkGraphic() {
  const data = useMemo(() => {
    // Seeded RNG so layout is deterministic across renders.
    // Seed picked after sampling several — produces the most evenly
    // triangulated mesh with no clusters or gaps.
    let s = 0x2d8a;
    const rand = () => {
      s = (s * 1664525 + 1013904223) % 2147483648;
      return s / 2147483648;
    };

    // Perturbed grid: regular grid + per-node jitter for organic feel.
    // Base spans -360 → +360 with ±18 jitter, so even maximally-jittered
    // edge nodes stay within the viewBox bounds (±384) — no clipping.
    const cols = 11;
    const rows = 4;
    const gapX = 72;
    const gapY = 52;
    const nodes: { x: number; y: number }[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const baseX = (-gapX * (cols - 1)) / 2 + c * gapX;
        const baseY = (-gapY * (rows - 1)) / 2 + r * gapY;
        const jx = (rand() - 0.5) * 36;
        const jy = (rand() - 0.5) * 26;
        nodes.push({ x: baseX + jx, y: baseY + jy });
      }
    }

    // Nearest-neighbor mesh: each node → 3 closest neighbors. Deduped.
    const seen = new Set<string>();
    const edges: { a: number; b: number }[] = [];
    for (let i = 0; i < nodes.length; i++) {
      const ds: { j: number; d: number }[] = [];
      for (let j = 0; j < nodes.length; j++) {
        if (i === j) continue;
        const d = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
        ds.push({ j, d });
      }
      ds.sort((a, b) => a.d - b.d);
      for (let k = 0; k < 3; k++) {
        const j = ds[k].j;
        const key = i < j ? `${i}-${j}` : `${j}-${i}`;
        if (!seen.has(key)) {
          seen.add(key);
          edges.push({ a: Math.min(i, j), b: Math.max(i, j) });
        }
      }
    }

    // 12 traveling particles — each picks a unique edge, random
    // direction, random delay/duration so motion never synchronizes.
    type Pulse = {
      from: { x: number; y: number };
      to: { x: number; y: number };
      delay: number;
      duration: number;
    };
    const pulses: Pulse[] = [];
    const usedEdges = new Set<number>();
    while (pulses.length < 12 && usedEdges.size < edges.length) {
      const idx = Math.floor(rand() * edges.length);
      if (usedEdges.has(idx)) continue;
      usedEdges.add(idx);
      const e = edges[idx];
      const a = nodes[e.a];
      const b = nodes[e.b];
      const reverse = rand() > 0.5;
      pulses.push({
        from: reverse ? b : a,
        to: reverse ? a : b,
        delay: rand() * 4,
        duration: 2.4 + rand() * 1.2,
      });
    }

    const highlighted = new Set([4, 9, 18, 25, 32, 41]);

    return { nodes, edges, pulses, highlighted };
  }, []);

  // Per-particle keyframes — each particle gets its own translate
  // animation from its source node to its destination node. Smooth
  // ease-in-out so motion feels organic, not mechanical.
  const keyframes = data.pulses
    .map(
      (p, i) => `
        @keyframes netHop${i} {
          0%   { transform: translate(${p.from.x.toFixed(2)}px, ${p.from.y.toFixed(2)}px); opacity: 0; }
          12%  { opacity: 1; }
          88%  { opacity: 1; }
          100% { transform: translate(${p.to.x.toFixed(2)}px, ${p.to.y.toFixed(2)}px); opacity: 0; }
        }
      `
    )
    .join("\n");

  return (
    <svg
      viewBox="-384 -100 768 200"
      fill="none"
      className="h-full w-full"
      preserveAspectRatio="xMinYMid meet"
      aria-hidden="true"
      style={{ overflow: "visible" }}
    >
      {/* Mesh wiring — clearly visible at rest. Light enough not to
          dominate, heavy enough that the network's structure is
          unmistakable. */}
      {data.edges.map((e, i) => {
        const a = data.nodes[e.a];
        const b = data.nodes[e.b];
        return (
          <line
            key={`edge-${i}`}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke="rgba(255,255,255,0.18)"
            strokeWidth="0.6"
          />
        );
      })}

      {/* Nodes */}
      {data.nodes.map((n, i) => {
        const isHighlighted = data.highlighted.has(i);
        return (
          <circle
            key={i}
            cx={n.x}
            cy={n.y}
            r={isHighlighted ? 2.6 : 2}
            fill={
              isHighlighted
                ? "rgba(64,191,134,0.95)"
                : "rgba(255,255,255,0.7)"
            }
          />
        );
      })}

      {/* Traveling particles — soft halo + bright core gliding from
          source to destination along an edge. */}
      {data.pulses.map((p, i) => (
        <g
          key={`pulse-${i}`}
          style={{
            animation: `netHop${i} ${p.duration}s ease-in-out ${p.delay}s infinite`,
            willChange: "transform, opacity",
          }}
        >
          <circle cx="0" cy="0" r="6" fill="rgba(64,191,134,0.28)" />
          <circle cx="0" cy="0" r="2.4" fill="rgba(255,255,255,1)" />
        </g>
      ))}

      <style>{`
        ${keyframes}
        @media (prefers-reduced-motion: reduce) {
          g[style*="animation"] { animation: none !important; opacity: 0 !important; }
        }
      `}</style>
    </svg>
  );
}

// 02 — Foundation: rectangular grid of dots with a radial ripple
// animation. Each dot has a per-dot CSS animation delay based on its
// distance from center, so the lit pulse appears to sweep outward
// from the origin through the grid.
function FoundationGraphic() {
  const cols = 21;
  const rows = 7;
  const gapX = 38.4;
  const gapY = 24;
  const totalW = (cols - 1) * gapX;
  const totalH = (rows - 1) * gapY;

  const dots = useMemo(() => {
    const ds: { x: number; y: number; delay: number }[] = [];
    let maxDist = 0;
    const positions: { x: number; y: number }[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = -totalW / 2 + c * gapX;
        const y = -totalH / 2 + r * gapY;
        positions.push({ x, y });
        const d = Math.hypot(x, y);
        if (d > maxDist) maxDist = d;
      }
    }
    for (const p of positions) {
      const d = Math.hypot(p.x, p.y);
      ds.push({ x: p.x, y: p.y, delay: (d / maxDist) * 2.5 });
    }
    return ds;
  }, [totalW, totalH]);

  return (
    <svg
      viewBox="-384 -100 768 200"
      fill="none"
      className="block h-full w-full"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      {dots.map((d, i) => (
        <circle
          key={i}
          cx={d.x}
          cy={d.y}
          r="1.8"
          style={{
            animation: `foundationRipple 5s ease-out ${d.delay}s infinite`,
            fill: "rgba(255,255,255,0.22)",
          }}
        />
      ))}

      <style>{`
        @keyframes foundationRipple {
          0%, 100% { fill: rgba(255,255,255,0.18); r: 1.8; }
          12%      { fill: rgba(64,191,134,1); r: 2.8; }
          35%      { fill: rgba(255,255,255,0.18); r: 1.8; }
        }
        @media (prefers-reduced-motion: reduce) {
          circle[style*="animation"] { animation: none !important; }
        }
      `}</style>
    </svg>
  );
}


/* ================================================================== */
/*  Pillar marks — small editorial print-style figures, drawn as if    */
/*  they belonged in a typographic plate from a book of geometry. No   */
/*  glowing nodes, no halos, no "AI-aesthetic" network diagrams.       */
/*  Hairline strokes only, off-white on dark, with at most one quiet   */
/*  motion per mark.                                                   */
/*    Strategy     — a hand-drawn compass rose                         */
/*    Coordination — three intersecting rings (Borromean-style)        */
/*    Support      — a classical column (capital, shaft, base)         */
/* ================================================================== */

function StrategyMark() {
  // Classic compass-rose star inside a thin ring. Four cardinal
  // kite-petals (half-filled, half-outlined for the iconic shaded
  // look) plus four smaller diagonal kite-petals. Slow settling
  // rotation, like a real compass needle finding north. Cleaner than
  // the original (no tick marks, no "N" label) but unambiguously
  // reads as a compass — matches editorial density of the Borromean
  // rings and column marks.
  const stroke = "rgba(232,232,228,0.9)";
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      className="block h-full w-full"
      aria-hidden="true"
    >
      <g
        style={{
          transformOrigin: "50px 50px",
          animation: "strategySettle 22s ease-in-out infinite",
        }}
      >
        {/* Outer ring */}
        <circle cx="50" cy="50" r="42" stroke={stroke} strokeWidth="0.6" />
        {/* Cardinal kites — at 0/90/180/270 (N is rot 0, then E/S/W).
            Each kite is split into two halves: one filled, one
            outlined, creating the classic shaded compass-rose look. */}
        {[0, 90, 180, 270].map((rot) => (
          <g
            key={`card-${rot}`}
            transform={`rotate(${rot} 50 50)`}
          >
            {/* Right (filled) half of the kite — tip up, base at
                centre, side vertex midway out. */}
            <path
              d="M 50 11 L 53.5 35 L 50 50 Z"
              fill={stroke}
              stroke="none"
            />
            {/* Left (outlined) half */}
            <path
              d="M 50 11 L 46.5 35 L 50 50 Z"
              fill="none"
              stroke={stroke}
              strokeWidth="0.55"
              strokeLinejoin="round"
            />
          </g>
        ))}
        {/* Diagonal kites — at 45/135/225/315. Smaller, simpler:
            single filled narrow triangle pointing out. */}
        {[45, 135, 225, 315].map((rot) => (
          <g key={`diag-${rot}`} transform={`rotate(${rot} 50 50)`}>
            <path
              d="M 50 24 L 51.6 41 L 50 50 L 48.4 41 Z"
              fill={stroke}
              stroke="none"
              opacity="0.7"
            />
          </g>
        ))}
        {/* Center pivot */}
        <circle cx="50" cy="50" r="2.2" fill={stroke} />
      </g>
      <style>{`
        @keyframes strategySettle {
          0%, 100% { transform: rotate(-3deg); }
          50%      { transform: rotate(3deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          g[style*="animation"] { animation: none !important; }
        }
      `}</style>
    </svg>
  );
}

function CoordinationMark() {
  // Three intersecting rings — a Borromean / heraldic motif. The three
  // rings are visually equal; their overlapping arcs read as agreement,
  // alignment, coordination. One ring's stroke periodically brightens,
  // tracing around in a slow rhythm — the only motion in the mark.
  const stroke = "rgba(232,232,228,0.85)";
  const accent = "rgba(64,191,134,1)";
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      className="block h-full w-full"
      aria-hidden="true"
    >
      {/* Three circles arranged as an equilateral triangle of centers,
          each radius 24, centers spaced 27 apart so they intersect. */}
      {[
        { cx: 50, cy: 32, delay: 0 },
        { cx: 32, cy: 62, delay: 1.6 },
        { cx: 68, cy: 62, delay: 3.2 },
      ].map((c, i) => (
        <g key={i}>
          {/* Base ring — always visible */}
          <circle
            cx={c.cx}
            cy={c.cy}
            r="24"
            stroke={stroke}
            strokeWidth="0.7"
          />
          {/* Bright "trace" ring that fades in/out, suggesting the ring
              is signalling. Stroke-dashoffset animation walks a short
              bright segment around the circumference. */}
          <circle
            cx={c.cx}
            cy={c.cy}
            r="24"
            stroke={accent}
            strokeWidth="0.9"
            strokeDasharray="18 200"
            style={{
              animation: `coordTrace 4.8s linear ${c.delay}s infinite`,
              transformOrigin: `${c.cx}px ${c.cy}px`,
            }}
          />
        </g>
      ))}
      {/* Tiny center dot at the geometric centroid of the three centers
          — the place where all three overlap */}
      <circle cx="50" cy="52" r="1.2" fill={stroke} />
      <style>{`
        @keyframes coordTrace {
          0%   { stroke-dashoffset: 0; opacity: 0; }
          8%   { opacity: 0.9; }
          70%  { stroke-dashoffset: -150; opacity: 0.9; }
          100% { stroke-dashoffset: -150; opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          circle[style*="animation"] { animation: none !important; opacity: 0 !important; }
        }
      `}</style>
    </svg>
  );
}

function SupportMark() {
  // A classical column rendered in the spirit of an architectural
  // engraving: capital, shaft with subtle fluting, base. Hairline
  // strokes, no fill, no animation. Static and confident — a structure
  // can't fidget.
  const stroke = "rgba(232,232,228,0.85)";
  const faint = "rgba(232,232,228,0.4)";
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      className="block h-full w-full"
      aria-hidden="true"
    >
      <g stroke={stroke} strokeWidth="0.7">
        {/* Capital — the top */}
        <line x1="22" y1="22" x2="78" y2="22" />
        <line x1="22" y1="22" x2="22" y2="28" />
        <line x1="78" y1="22" x2="78" y2="28" />
        <line x1="22" y1="28" x2="78" y2="28" />
        {/* Necking — small narrowing under the capital */}
        <line x1="32" y1="28" x2="32" y2="32" />
        <line x1="68" y1="28" x2="68" y2="32" />
        <line x1="32" y1="32" x2="68" y2="32" />
        {/* Shaft — vertical body, slight tapering */}
        <line x1="34" y1="32" x2="36" y2="78" />
        <line x1="66" y1="32" x2="64" y2="78" />
        {/* Fluting — three thin vertical lines inside the shaft */}
        <line x1="44" y1="34" x2="44" y2="76" stroke={faint} strokeWidth="0.5" />
        <line x1="50" y1="34" x2="50" y2="76" stroke={faint} strokeWidth="0.5" />
        <line x1="56" y1="34" x2="56" y2="76" stroke={faint} strokeWidth="0.5" />
        {/* Base — wider than the shaft */}
        <line x1="32" y1="78" x2="68" y2="78" />
        <line x1="20" y1="84" x2="80" y2="84" />
        <line x1="32" y1="78" x2="20" y2="84" />
        <line x1="68" y1="78" x2="80" y2="84" />
        {/* Plinth — the very bottom slab */}
        <line x1="20" y1="84" x2="20" y2="90" />
        <line x1="80" y1="84" x2="80" y2="90" />
        <line x1="20" y1="90" x2="80" y2="90" />
      </g>
    </svg>
  );
}

/* ================================================================== */
/*  Chapter header — number / crumb + serif title + optional graphic   */
/*  Graphic sandwiched tight between heading and body text.            */
/* ================================================================== */

function ChapterHeader({
  num,
  crumb,
  title,
  graphic,
  graphicAlign = "full",
}: {
  num: string;
  crumb: string;
  title: string;
  graphic?: React.ReactNode;
  graphicAlign?: "full" | "left";
}) {
  return (
    <>
      <div className={graphic ? "mb-4 lg:mb-12" : "mb-8 lg:mb-12"}>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mb-6 font-mono text-[13px] tracking-[0.04em] text-white/45 lg:mb-8"
        >
          <span className="text-white/70 tabular-nums">{num}</span>
          <span className="mx-2.5 text-white/20">/</span>
          <span>{crumb}</span>
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="font-serif font-normal leading-[0.88] tracking-[-0.025em] text-balance text-white"
          style={{ fontSize: "clamp(2.75rem, 6vw, 5rem)" }}
        >
          {title}
        </motion.h2>
      </div>

      {graphic && (
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className={`mb-4 aspect-[19/5] overflow-hidden rounded-sm lg:mb-12 lg:aspect-auto lg:h-[200px] ${
            graphicAlign === "left" ? "ml-0 w-3/4 max-w-lg" : "w-full"
          }`}
        >
          {graphic}
        </motion.div>
      )}
    </>
  );
}

/* ================================================================== */
/*  ChapterNav — fixed vertical thread on the right showing reading    */
/*  progress through the four chapters. Active chapter highlights as   */
/*  the user scrolls. Dots are linked by a thin static line so the     */
/*  thread reads as a single continuous spine across all chapters.    */
/* ================================================================== */

const CHAPTERS = [
  { num: "01", label: "The Foundation" },
  { num: "02", label: "What We Do" },
  { num: "03", label: "The Network" },
  // 04 / The Team is hidden until we have headshots — see the
  // commented-out section in FoundationPage's render.
];

function ChapterNav() {
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        // Pick whichever chapter is most centered in the viewport.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) {
          const idx = parseInt(
            visible[0].target.getAttribute("data-chapter") || "0",
            10
          );
          setActive(idx);
        }
      },
      { rootMargin: "-30% 0px -50% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] }
    );
    document
      .querySelectorAll<HTMLElement>("[data-chapter]")
      .forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const onClickChapter = (idx: number) => {
    document
      .querySelector(`[data-chapter="${idx}"]`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav
      className="pointer-events-none fixed top-1/2 right-6 z-40 hidden -translate-y-1/2 lg:block"
      aria-label="Chapter navigation"
    >
      <ul className="relative flex flex-col items-center gap-7">
        {/* Continuous thin spine connecting all chapter ticks */}
        <span
          aria-hidden="true"
          className="absolute top-2 bottom-2 left-1/2 -translate-x-1/2 w-px bg-white/10"
        />
        {CHAPTERS.map((ch, i) => (
          <li key={ch.num} className="pointer-events-auto relative">
            <button
              type="button"
              onClick={() => onClickChapter(i)}
              className="group flex cursor-pointer items-center gap-3"
              aria-label={`Jump to chapter ${ch.num} — ${ch.label}`}
            >
              {/* Chapter label fades in on hover */}
              <span
                className={`pointer-events-none absolute right-full mr-3 whitespace-nowrap font-mono text-[10px] tracking-[0.22em] uppercase transition-opacity ${
                  active === i
                    ? "text-white/70 opacity-100"
                    : "text-white/50 opacity-0 group-hover:opacity-100"
                }`}
              >
                {ch.num} &nbsp; {ch.label}
              </span>
              <span
                className={`block h-2 w-2 rounded-full transition-all duration-300 ${
                  active === i
                    ? "bg-green-bright scale-125"
                    : "bg-white/25 group-hover:bg-white/50"
                }`}
              />
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/* ================================================================== */
/*  Colophon — small bookend at the bottom of the page                 */
/* ================================================================== */

function Colophon() {
  return (
    <div className="mt-20 flex justify-center lg:mt-28">
      <div className="flex items-center gap-3">
        <LivepeerSymbol className="h-4 w-auto text-white/50" />
        <span className="font-mono text-[11px] tracking-[0.25em] text-white/40 uppercase">
          The Livepeer Foundation
        </span>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Page                                                               */
/* ================================================================== */


export default function FoundationPage() {
  const heroEase = [0.16, 1, 0.3, 1] as const;

  return (
    // Force-dark wrapper — the foundation page is designed as an
    // editorial essay built around the green→blue aurora, dark Venn
    // glow, and halftone overlay. The composition doesn't gracefully
    // invert for light mode, so we lock it to dark via `theme-dark`
    // (a force-dark scope introduced for exactly this kind of zone).
    // `bg-background` + `text-foreground` resolve to the dark values
    // inside this scope regardless of the user's theme preference.
    <div className="theme-dark bg-background text-foreground">
      <ChapterNav />

      {/* Halftone texture — the identical 64×64 dot PNG used on
          daylightcomputer.com (downloaded from /textures/halftone.png
          on their site). Tiled across the viewport at z-30 so it sits
          above page content but below the chapter nav (z-40) and
          header (z-50), giving the foundation page a printed/riso
          surface quality. */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-30"
        style={{
          backgroundImage: "url(/images/halftone.png)",
          backgroundRepeat: "repeat",
          backgroundSize: "64px 64px",
          opacity: 0.11,
          mixBlendMode: "screen",
        }}
      />

      <div className="relative">

      <div className="relative">

      {/* ================================================================ */}
      {/*  HERO — text perfectly vertically centered.                       */}
      {/*  Mobile uses 78vh so the Venn peek doesn't sit too far below      */}
      {/*  the lede; desktop uses full 100vh.                               */}
      {/*  Each element staggers in for a more composed arrival.            */}
      {/* ================================================================ */}
      <section className="relative flex min-h-[78vh] items-center justify-center overflow-hidden lg:min-h-screen">
        {/* Top horizon glow — mirrors xAI's edge band: a hot bright line
            at the very edge that condenses to ~1% of the height, then
            transitions into a single darker hue (Livepeer green) and
            fades to the page background. Single-family palette, no
            secondary colors. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[78vh] overflow-hidden"
        >
          {/* Outer curtain — wide green→teal→blue arc spanning the
              full width of the hero. */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 220% 90% at 42% 0% in oklch, rgba(110, 230, 175, 0.46) 0%, rgba(70, 200, 145, 0.38) 10%, rgba(38, 165, 105, 0.30) 22%, rgba(30, 160, 130, 0.26) 32%, rgba(28, 145, 165, 0.28) 44%, rgba(25, 130, 175, 0.36) 54%, rgba(22, 122, 165, 0.30) 66%, rgba(20, 110, 150, 0.20) 78%, rgba(20, 95, 125, 0.10) 88%, rgba(20, 90, 120, 0.03) 95%, transparent 100%)",
              maskImage:
                "radial-gradient(ellipse 55% 90% at 50% 100%, transparent 0%, rgba(0,0,0,0.5) 35%, rgba(0,0,0,0.9) 65%, rgba(0,0,0,1) 90%)",
              WebkitMaskImage:
                "radial-gradient(ellipse 55% 90% at 50% 100%, transparent 0%, rgba(0,0,0,0.5) 35%, rgba(0,0,0,0.9) 65%, rgba(0,0,0,1) 90%)",
            }}
          />
          {/* Inner curtain — narrower, brighter mint peak sitting on
              top of the outer arc. Screen-blended so it brightens the
              center without re-coloring it, giving the impression of
              two overlapping aurora curtains rather than a single
              flat fill. Aligned to the same off-center peak (42%) so
              the two layers feel concentric. */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 95% 38% at 42% 0% in oklch, rgba(180, 250, 215, 0.48) 0%, rgba(110, 230, 175, 0.32) 18%, rgba(70, 200, 145, 0.18) 38%, rgba(45, 180, 130, 0.07) 60%, transparent 85%)",
              mixBlendMode: "screen",
              maskImage:
                "radial-gradient(ellipse 55% 90% at 50% 100%, transparent 0%, rgba(0,0,0,0.5) 35%, rgba(0,0,0,0.9) 65%, rgba(0,0,0,1) 90%)",
              WebkitMaskImage:
                "radial-gradient(ellipse 55% 90% at 50% 100%, transparent 0%, rgba(0,0,0,0.5) 35%, rgba(0,0,0,0.9) 65%, rgba(0,0,0,1) 90%)",
            }}
          />
        </div>
        <Container className="relative">
          <div className="mx-auto max-w-5xl text-center">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: heroEase, delay: 0 }}
              className="font-mono text-[13px] font-medium tracking-[0.22em] text-white/50 uppercase"
            >
              The Livepeer Foundation
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: heroEase, delay: 0.08 }}
              className="mt-6 font-serif font-normal leading-[0.95] tracking-[-0.02em] text-balance text-white lg:mt-8"
              style={{ fontSize: "clamp(2.5rem, 7.2vw, 5.75rem)" }}
            >
              Advancing the open network for real-time AI video
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: heroEase, delay: 0.18 }}
              className="mx-auto mt-8 max-w-xl text-base leading-[1.55] text-white/55 text-pretty lg:mt-10 lg:text-lg"
            >
              The Livepeer Foundation is an independent non-profit created
              to ensure the protocol&rsquo;s long-term health, fund core
              development, set strategic direction and protect the
              ecosystem&rsquo;s interests.
            </motion.p>
          </div>
        </Container>
      </section>

      {/* ================================================================ */}
      {/*  HERO ARCS — partial arcs rendered in full (no clipping).        */}
      {/*  Aspect 16:5 matches the SVG viewBox. Negative margin pulls      */}
      {/*  the top slightly into the hero so the peaks peek above fold.   */}
      {/* ================================================================ */}
      <div
        className="pointer-events-none relative -mt-[40px] w-full lg:-mt-[60px]"
        aria-hidden="true"
      >
        <HeroVenn />
      </div>
      </div> {/* /hero-region */}

      {/* ================================================================ */}
      {/*  1. ABOUT THE FOUNDATION                                          */}
      {/* ================================================================ */}
      <section className="relative" data-chapter="0">
        <Container>
          <div className="mx-auto max-w-3xl py-14 lg:py-40">
            <ChapterHeader
              num="01"
              crumb="The Foundation"
              title="About The Foundation"
              graphic={<FoundationGraphic />}
            />

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              transition={{ staggerChildren: 0.1 }}
              className="space-y-8 text-lg leading-[1.7] text-white/75 lg:text-xl lg:leading-[1.75]"
            >
              <motion.p variants={fadeUp} transition={{ duration: 0.5 }}>
                <Link
                  href="/blog/introducing-the-livepeer-foundation"
                  className="underline decoration-white/25 decoration-1 underline-offset-[5px] transition-colors hover:text-white hover:decoration-white/50"
                >
                  Established in 2025
                </Link>
                , the Livepeer Foundation is a non-profit entity accountable
                to the network&rsquo;s participants. Its mandate is the
                long-term health of the Livepeer network, through strategy,
                core development and ecosystem growth.
              </motion.p>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* ================================================================ */}
      {/*  2. WHAT WE DO                                                    */}
      {/* ================================================================ */}
      <section className="relative" data-chapter="1">
        <div className="divider-gradient absolute top-0 right-0 left-0" />
        <Container>
          <div className="mx-auto max-w-3xl py-14 lg:py-40">
            <ChapterHeader num="02" crumb="What We Do" title="What We Do" />

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              transition={{ staggerChildren: 0.14 }}
              className="divide-y divide-white/[0.06]"
            >
              {[
                {
                  num: "01",
                  label: "Strategy",
                  text: "We set the strategic direction of the network and align stakeholders around a long-term roadmap of priority work.",
                  Mark: StrategyMark,
                },
                {
                  num: "02",
                  label: "Coordination",
                  text: "We coordinate technical development across independent teams building on and for the network.",
                  Mark: CoordinationMark,
                },
                {
                  num: "03",
                  label: "Support",
                  text: "We support builders through funding, connections and tools that lower the barrier to building.",
                  Mark: SupportMark,
                },
              ].map((item) => (
                <motion.article
                  key={item.label}
                  variants={fadeUp}
                  transition={{ duration: 0.5 }}
                  className="grid grid-cols-[60px_1fr] items-start gap-x-6 gap-y-4 py-10 sm:grid-cols-[88px_1fr] sm:gap-x-10 sm:py-12 lg:grid-cols-[112px_1fr] lg:gap-x-16 lg:py-16"
                >
                  {/* Bespoke editorial mark in the left gutter */}
                  <div
                    className="aspect-square w-full opacity-90"
                    aria-hidden="true"
                  >
                    <item.Mark />
                  </div>
                  {/* Eyebrow / serif italic title / body */}
                  <div>
                    <p className="font-mono text-[11px] tracking-[0.22em] text-white/40 uppercase">
                      {item.num}
                      <span className="mx-2.5 text-white/15">·</span>
                      {item.label}
                    </p>
                    <h3
                      className="mt-3 font-serif font-normal italic tracking-[-0.01em] text-white"
                      style={{ fontSize: "clamp(1.875rem, 4.4vw, 3rem)", lineHeight: 1 }}
                    >
                      {item.label}.
                    </h3>
                    <p className="mt-5 max-w-prose text-base leading-[1.7] text-white/70 lg:text-lg lg:leading-[1.7]">
                      {item.text}
                    </p>
                  </div>
                </motion.article>
              ))}

              <motion.div
                variants={fadeUp}
                transition={{ duration: 0.5 }}
                className="pt-10 lg:pt-14"
              >
                <Button href="/ecosystem" size="lg" variant="primary">
                  Explore the ecosystem
                  <span aria-hidden="true">&rarr;</span>
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* ================================================================ */}
      {/*  3. ABOUT THE NETWORK                                             */}
      {/* ================================================================ */}
      <section className="relative" data-chapter="2">
        <div className="divider-gradient absolute top-0 right-0 left-0" />
        <Container>
          <div className="mx-auto max-w-3xl py-14 lg:py-40">
            <ChapterHeader
              num="03"
              crumb="The Network"
              title="About The Network"
              graphic={<NetworkGraphic />}
            />

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              transition={{ staggerChildren: 0.1 }}
              className="space-y-8 text-lg leading-[1.7] text-white/75 lg:text-xl lg:leading-[1.75]"
            >
              <motion.p variants={fadeUp} transition={{ duration: 0.5 }}>
                Livepeer was founded in 2017 by Doug Petkanics and Eric Tang
                to solve a straightforward problem: video infrastructure
                was expensive, centralised, and controlled by a handful of
                companies. They built an open alternative, where a global
                network of GPU operators processes video at scale,{" "}
                <em className="font-serif italic text-white/95">
                  is owned and run by its participants
                </em>{" "}
                and available to anyone.
              </motion.p>

              <motion.p variants={fadeUp} transition={{ duration: 0.5 }}>
                Eight years on, builders discovered that Livepeer&rsquo;s
                low-latency GPU infrastructure was what the emerging wave
                of real-time AI video applications needed. The
                network&rsquo;s operators were already running the hardware
                when the demand arrived. As of early 2026,{" "}
                <a
                  href="https://messari.io/report/state-of-livepeer-q4-2025"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-white/25 decoration-1 underline-offset-[5px] transition-colors hover:text-white hover:decoration-white/50"
                >
                  72% of network fees come from AI inference workloads
                </a>
                .
              </motion.p>

              <motion.p variants={fadeUp} transition={{ duration: 0.5 }}>
                The network is now a proving ground for builders
                experimenting at the bleeding edge of real-time video and
                AI. Live video streams analysed and acted on as they
                happen, entire worlds generated in real time and AI
                avatars that see, speak and respond. Livepeer&rsquo;s
                roots are in transcoding and streaming, but the focus is
                clear: be the open network for real-time AI video.
              </motion.p>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* ================================================================ */}
      {/*  4. THE TEAM — hidden until we have member headshots. Section     */}
      {/*  preserved verbatim below so it can be uncommented in one step    */}
      {/*  once the photography is ready. The Colophon (page-end Livepeer  */}
      {/*  signature) is moved out into its own section above so the page  */}
      {/*  still has a quiet sign-off after The Network.                    */}
      {/* ================================================================ */}
      {/*
      <section className="relative" data-chapter="3">
        <div className="divider-gradient absolute top-0 right-0 left-0" />
        <Container>
          <div className="mx-auto max-w-3xl py-14 lg:py-40">
            <ChapterHeader num="04" crumb="The Team" title="The Team" />

            <motion.ul
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              transition={{ staggerChildren: 0.06 }}
            >
              {TEAM.map((person) => (
                <motion.li
                  key={person.name}
                  variants={fadeUp}
                  transition={{ duration: 0.45 }}
                  className="flex items-baseline justify-between gap-6 border-t border-white/[0.08] py-5 lg:py-6"
                >
                  <span className="text-xl tracking-[-0.01em] text-white lg:text-2xl">
                    {person.name}
                  </span>
                  <span className="text-right text-sm text-white/45 lg:text-base">
                    {person.role}
                  </span>
                </motion.li>
              ))}
              <li className="border-t border-white/[0.08]" aria-hidden="true" />
            </motion.ul>
          </div>
        </Container>
      </section>
      */}

      {/* Colophon — quiet Livepeer signature that closes the page. */}
      <section className="relative">
        <Container>
          <div className="mx-auto max-w-3xl pb-14 lg:pb-32">
            <Colophon />
          </div>
        </Container>
      </section>

        {/* Spacer between the last chapter and the global Footer */}
        <div className="h-24 lg:h-32" aria-hidden="true" />
      </div>
    </div>
  );
}
