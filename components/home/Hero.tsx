"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import ImageMask from "@/components/ui/ImageMask";
import { EXTERNAL_LINKS } from "@/lib/constants";

/*
  9×5 tile grid on ~16:9 viewport.
  CW ≈ 11.11%, CH = 20%.

  Three visual layers (besides content):
    1. Video + tile mask — the core visual
    2. White geometric shapes — structural framing
    3. Emerald starburst node + pulse trail — the AI accent

  The pulse trail walks the tile grid from the starburst origin,
  following a random path through grid intersections, fading as it goes.
*/

const COLS = 9;
const ROWS = 5;
const CW = 100 / COLS;
const CH = 100 / ROWS;

const RAYS = [0, 22, 45, 68, 90, 135, 170, -15, -40, -70];

/* ── Pulse trail: walks the tile grid from starburst origin ── */
function PulseTrail() {
  const [pos, setPos] = useState<{ x: number; y: number; opacity: number }>({
    x: CW,
    y: CH,
    opacity: 0,
  });
  const pathRef = useRef<{ x: number; y: number }[]>([]);
  const stepRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const generatePath = useCallback(() => {
    let col = 1;
    let row = 1;
    const path = [{ x: col * CW, y: row * CH }];
    const visited = new Set([`${col},${row}`]);

    for (let i = 0; i < 6; i++) {
      const dirs = [
        { dc: 1, dr: 0 },
        { dc: -1, dr: 0 },
        { dc: 0, dr: 1 },
        { dc: 0, dr: -1 },
      ].filter((d) => {
        const nc = col + d.dc;
        const nr = row + d.dr;
        return (
          nc >= 0 &&
          nc <= COLS &&
          nr >= 0 &&
          nr <= ROWS &&
          !visited.has(`${nc},${nr}`)
        );
      });

      if (!dirs.length) break;
      const d = dirs[Math.floor(Math.random() * dirs.length)];
      col += d.dc;
      row += d.dr;
      visited.add(`${col},${row}`);
      path.push({ x: col * CW, y: row * CH });
    }

    return path;
  }, []);

  useEffect(() => {
    const startPulse = () => {
      pathRef.current = generatePath();
      stepRef.current = 0;
      advance();
    };

    const advance = () => {
      const path = pathRef.current;
      const step = stepRef.current;

      if (step >= path.length) {
        setPos((p) => ({ ...p, opacity: 0 }));
        timeoutRef.current = setTimeout(startPulse, 4000);
        return;
      }

      const point = path[step];
      const fade = step / path.length;
      setPos({
        x: point.x,
        y: point.y,
        opacity: 0.8 * (1 - fade * 0.9),
      });
      stepRef.current = step + 1;
      timeoutRef.current = setTimeout(advance, 900);
    };

    timeoutRef.current = setTimeout(startPulse, 3000);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [generatePath]);

  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-[800ms] ease-in-out"
      style={{
        left: `${pos.x}%`,
        top: `${pos.y}%`,
        opacity: pos.opacity,
        width: "6px",
        height: "6px",
        background:
          "radial-gradient(circle, rgba(52,211,153,0.9) 0%, rgba(52,211,153,0.3) 50%, transparent 70%)",
        boxShadow: `0 0 10px 3px rgba(52,211,153,${pos.opacity * 0.4}), 0 0 20px 6px rgba(52,211,153,${pos.opacity * 0.15})`,
      }}
    />
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
          rows={ROWS}
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
            left: `${6 * CW}%`,
            top: "0%",
            width: `${3 * CW}%`,
            height: `${3 * CH}%`,
            border: "1px solid rgba(255,255,255,0.15)",
          }}
        />

        {/* Small circle — cols 0–1, rows 3–4 */}
        <div
          className="absolute rounded-full animate-[breathe_8s_ease-in-out_infinite_3s]"
          style={{
            left: "0%",
            top: `${3 * CH}%`,
            width: `${2 * CW}%`,
            height: `${2 * CH}%`,
            border: "1px solid rgba(255,255,255,0.10)",
          }}
        />

        {/* Starburst — (col 1, row 1) — white rays, emerald pulsing center */}
        <div
          className="absolute rounded-full animate-[node-pulse_6s_ease-in-out_infinite]"
          style={{
            left: `calc(${CW}% - 20px)`,
            top: `calc(${CH}% - 20px)`,
            width: "40px",
            height: "40px",
            background:
              "radial-gradient(circle, rgba(52,211,153,0.25) 0%, rgba(52,211,153,0.08) 40%, transparent 70%)",
          }}
        />
        {RAYS.map((angle, i) => (
          <div
            key={`ray-${i}`}
            className="absolute"
            style={{
              left: `${1 * CW}%`,
              top: `${1 * CH}%`,
              width: "40%",
              height: "1px",
              background:
                "linear-gradient(to right, rgba(255,255,255,0.12), rgba(255,255,255,0.03) 35%, transparent 70%)",
              transformOrigin: "0% 50%",
              transform: `rotate(${angle}deg)`,
            }}
          />
        ))}

        {/* H-line — row 3 seam, cols 0–4 */}
        <div
          className="absolute"
          style={{
            left: "0%",
            top: `${3 * CH}%`,
            width: `${4 * CW}%`,
            height: "1px",
            background:
              "linear-gradient(to right, rgba(255,255,255,0.08), rgba(255,255,255,0.12) 40%, transparent 100%)",
          }}
        />

        {/* V-line — col 7 seam, rows 3–5 */}
        <div
          className="absolute"
          style={{
            left: `${7 * CW}%`,
            top: `${3 * CH}%`,
            width: "1px",
            height: `${2 * CH}%`,
            background:
              "linear-gradient(to bottom, rgba(255,255,255,0.10), transparent 100%)",
          }}
        />

        {/* Crosshair — (col 6, row 4) */}
        <div
          className="absolute"
          style={{
            left: `${6 * CW}%`,
            top: `${4 * CH}%`,
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

      {/* Center darken for text readability */}
      <div
        className="pointer-events-none absolute inset-0"
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
          style={{ left: `${0.3 * CW}%`, top: `${0.25 * CH}%` }}
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
            Open infrastructure
            <br />
            <span className="text-gradient">for real-time AI video</span>
          </motion.h1>

          <motion.p
            className="mx-auto mt-6 max-w-xl text-lg text-white/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Generate, transform, and interpret live video streams with
            low-latency AI on an elastic GPU network.
          </motion.p>

          <motion.div
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Button href={EXTERNAL_LINKS.docs} variant="primary">
              Start Building <span aria-hidden="true">&rarr;</span>
            </Button>
            <Button href={EXTERNAL_LINKS.explorer} variant="secondary">
              Explore the Network
            </Button>
          </motion.div>
        </motion.div>
      </Container>

      {/* Bottom fade to page bg */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-48"
        aria-hidden="true"
        style={{
          background: "linear-gradient(to bottom, transparent, #181818)",
        }}
      />
    </section>
  );
}
