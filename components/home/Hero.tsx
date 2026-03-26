"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionValue, useMotionValueEvent, animate } from "framer-motion";
import Container from "@/components/ui/Container";
import ImageMask from "@/components/ui/ImageMask";

/*
  9×5 tile grid with square tiles.
  Tile size = 100vw / 9 ≈ 11.11vw.

  All grid-aligned elements use vw units for both x and y
  so they stay locked to tile intersections at any viewport size.

  Three visual layers (besides content):
    1. Video + tile mask — the core visual
    2. White geometric shapes — structural framing
    3. Emerald starburst node + pulse trail — the AI accent
*/

const COLS = 9;
const ROWS = 5;
const TILE = 100 / COLS; // tile size in vw — used for both axes

const RAYS = [0, 22, 45, 68, 90, 135, 170, -15, -40, -70];

/* ── Pulse trail: follows a fixed scenic loop along grid lines + circle arcs ──
   Route uses tangent entry/exit points for smooth line-to-arc transitions:
   starburst (1,1) → up to row 0 → right to large circle top tangent (7.5,0) →
   CW 180° to bottom tangent (7.5,3) → left along row 3 to small circle
   top tangent (1,3) → CCW 270° to right tangent (2,4) → up col 2 → left → loop.
   Uses SVG getPointAtLength() for uniform-speed traversal with no re-renders. */

const PULSE_PATH = [
  "M 100 100",                  // starburst at (1,1)
  "L 100 0",                    // up col 1 to row 0
  "L 750 0",                    // right along row 0 to large circle top tangent
  "A 150 150 0 0 1 750 300",    // CW 180° arc to bottom tangent (7.5,3)
  "L 100 300",                  // left along row 3 to small circle top tangent
  "A 100 100 0 1 0 200 400",    // CCW 270° arc to right tangent (2,4)
  "L 200 100",                  // up col 2 to row 1
  "L 100 100",                  // left along row 1 back to starburst
].join(" ");

function PulseTrail() {
  const dotRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const progress = useMotionValue(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (dotRef.current) dotRef.current.style.opacity = "0.8";
      animate(progress, 1, {
        duration: 20,
        ease: "linear",
        repeat: Infinity,
        repeatType: "loop",
      });
    }, 3000);

    return () => clearTimeout(timeout);
  }, [progress]);

  useMotionValueEvent(progress, "change", (v) => {
    const path = pathRef.current;
    const dot = dotRef.current;
    if (!path || !dot) return;

    const totalLength = path.getTotalLength();
    const point = path.getPointAtLength(v * totalLength);

    // SVG units are tile-coords × 100; convert back to vw
    dot.style.left = `${(point.x / 100) * TILE}vw`;
    dot.style.top = `${(point.y / 100) * TILE}vw`;
  });

  return (
    <>
      {/* Hidden SVG — only used for path geometry computation */}
      <svg
        width="0"
        height="0"
        viewBox="0 0 900 500"
        style={{ position: "absolute", pointerEvents: "none" }}
        aria-hidden="true"
      >
        <path ref={pathRef} d={PULSE_PATH} fill="none" />
      </svg>
      <div
        ref={dotRef}
        className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          left: `${1 * TILE}vw`,
          top: `${1 * TILE}vw`,
          opacity: 0,
          width: "6px",
          height: "6px",
          background:
            "radial-gradient(circle, rgba(64,191,134,0.9) 0%, rgba(64,191,134,0.3) 50%, transparent 70%)",
          boxShadow:
            "0 0 10px 3px rgba(64,191,134,0.32), 0 0 20px 6px rgba(64,191,134,0.12)",
        }}
      />
    </>
  );
}

export default function Hero() {
  return (
    <section className="relative flex min-h-[95vh] items-center overflow-hidden">
      {/* Full-bleed Holographik visual */}
      <div className="absolute inset-0">
        <ImageMask
          video="/videos/hero-world.mp4"
          className="h-full w-full"
          cols={COLS}
          rows={20}
          seed={42}
        />
      </div>

      {/* Geometric shapes + pulse trail */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
      >
        {/* Large circle — cols 6–8, rows 0–2 */}
        <div
          className="absolute rounded-full animate-[breathe_8s_ease-in-out_infinite]"
          style={{
            left: `${6 * TILE}vw`,
            top: "0vw",
            width: `${3 * TILE}vw`,
            aspectRatio: "1 / 1",
            border: "1px solid rgba(255,255,255,0.15)",
          }}
        />

        {/* Small circle — cols 0–1, rows 3–4 */}
        <div
          className="absolute rounded-full animate-[breathe_8s_ease-in-out_infinite_3s]"
          style={{
            left: "0vw",
            top: `${3 * TILE}vw`,
            width: `${2 * TILE}vw`,
            aspectRatio: "1 / 1",
            border: "1px solid rgba(255,255,255,0.10)",
          }}
        />

        {/* Starburst — (col 1, row 1) — white rays, emerald pulsing center */}
        <div
          className="absolute rounded-full animate-[node-pulse_6s_ease-in-out_infinite]"
          style={{
            left: `calc(${1 * TILE}vw - 20px)`,
            top: `calc(${1 * TILE}vw - 20px)`,
            width: "40px",
            height: "40px",
            background:
              "radial-gradient(circle, rgba(64,191,134,0.25) 0%, rgba(64,191,134,0.08) 40%, transparent 70%)",
          }}
        />
        {RAYS.map((angle, i) => (
          <div
            key={`ray-${i}`}
            className="absolute"
            style={{
              left: `${1 * TILE}vw`,
              top: `${1 * TILE}vw`,
              width: "40%",
              height: "1px",
              background:
                "linear-gradient(to right, rgba(255,255,255,0.12), rgba(255,255,255,0.03) 35%, transparent 70%)",
              transformOrigin: "0% 50%",
              transform: `rotate(${angle}deg)`,
            }}
          />
        ))}

        {/* V-line — col 7 seam, rows 3–5 */}
        <div
          className="absolute"
          style={{
            left: `${7 * TILE}vw`,
            top: `${3 * TILE}vw`,
            width: "1px",
            height: `${2 * TILE}vw`,
            background:
              "linear-gradient(to bottom, rgba(255,255,255,0.10), transparent 100%)",
          }}
        />

        {/* Crosshair — (col 6, row 4) */}
        <div
          className="absolute"
          style={{
            left: `${6 * TILE}vw`,
            top: `${4 * TILE}vw`,
          }}
        >
          <div
            style={{
              position: "absolute",
              left: "-6px",
              top: "-0.5px",
              width: "13px",
              height: "1px",
              background: "rgba(255,255,255,0.12)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: "-0.5px",
              top: "-6px",
              width: "1px",
              height: "13px",
              background: "rgba(255,255,255,0.12)",
            }}
          />
        </div>

        {/* Pulse trail — walks the grid from starburst origin */}
        <PulseTrail />
      </div>

      {/* Center darken for text readability — wider/stronger on mobile */}
      <div
        className="pointer-events-none absolute inset-0 lg:hidden"
        style={{
          background:
            "radial-gradient(ellipse 90% 60% at 50% 48%, rgba(4,6,5,0.88) 0%, rgba(4,6,5,0.5) 70%, transparent 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 hidden lg:block"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 48%, rgba(4,6,5,0.78) 0%, rgba(4,6,5,0.35) 70%, transparent 100%)",
        }}
      />

      {/* "GENERATING" label — near starburst origin */}
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        aria-hidden="true"
      >
        <div
          className="absolute flex items-center gap-2"
          style={{
            left: `${0.3 * TILE}vw`,
            top: `${0.25 * TILE}vw`,
          }}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/70 animate-pulse" />
          <span className="font-mono text-[10px] tracking-wider text-emerald-400/50 uppercase">
            Generating
          </span>
        </div>
      </div>

      {/* Content */}
      <Container className="relative z-10 py-24 lg:py-32">
        <motion.div
          className="mx-auto max-w-4xl text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.h1
            className="text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-7xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
          >
            The open network for
            <br />
            <span className="text-gradient">GPU-powered video</span>
          </motion.h1>

          <motion.p
            className="mx-auto mt-6 max-w-xl text-lg text-white/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            For less than the centralized cloud — no platform lock-in, and a
            direct line to builders powering the network.
          </motion.p>

        </motion.div>
      </Container>

      {/* Bottom fade to page bg */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-48"
        aria-hidden="true"
        style={{
          background: "linear-gradient(to bottom, transparent, #121212)",
        }}
      />
    </section>
  );
}
