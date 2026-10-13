"use client";

import { useEffect, useRef } from "react";

import { getCanvasThemePalette } from "@/components/canvas-theme";

/**
 * Two rings and the overlap between them, drawn in the field's own squares.
 *
 * The Foundation's argument is the overlap — independent teams, one network —
 * and this keeps it: nothing is drawn inside either circle except where they
 * meet, and that lens is the only thing lit. It was two dashed CSS circles
 * with a sheen, a different language from every other drawing on the site
 * (the home page's field, the GPU card, the rack on /compute), which are all
 * small squares on the ground colour; drawn that way it belongs to them.
 *
 * Each ring is a band of squares that drifts round its centre, the two in
 * opposite directions, with a highlight travelling each one the way the old
 * sheen did. Squares on a ring's arc inside the other circle are the lens's
 * edge and take the green; the lens itself holds a loose drift of green
 * squares, densest at its middle. A plain 2D canvas, the palette read from
 * the theme (components/canvas-theme.ts), paused off screen, and one still
 * frame under reduced motion.
 */

// The drawing's own units, the proportions of the original: two circles of
// radius 48 whose centres are 58 apart, in a 158 by 100 box (the aspect
// ratio on the wrapper).
const BOX_W = 158;
const RADIUS = 48;
const CENTRES = [
  [50, 50],
  [108, 50],
] as const;
const LENS_X = 79;

/**
 * Assembling, the rings start this far either side of where they end, so the
 * drawing is drawn in a wider box with the finished Venn in its middle.
 */
const SPREAD = 30;
const ASSEMBLED_BOX_W = 220;
const ASSEMBLE_SECONDS = 2.4;

const RING_SQUARES = 340;
const LENS_SQUARES = 150;
/** Radial spread of a ring's band, in drawing units. */
const BAND = 0.75;
/** Radians a second; the rings turn in opposite directions. */
const DRIFT = 0.03;
/** Radians a second for the highlight travelling each ring. */
const SHEEN_SPEED = 0.45;
/** Half-width of the highlight, in radians. */
const SHEEN_WIDTH = 0.5;
const SQUARE = 2;
/** Grey ink held back on light, as on the home card (LIGHT_INK there). */
const LIGHT_INK = 0.85;

// Palette slots from getCanvasThemePalette.
const FOREGROUND = 0;
const MUTED = 1;
const BRAND = 4;

type RingSquare = {
  ring: 0 | 1;
  angle: number;
  offset: number;
  alpha: number;
  tone: typeof FOREGROUND | typeof MUTED;
};

type LensSquare = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  phase: number;
};

/** A fixed sequence, so the server-free first frame is the same each load. */
function random(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function gaussian(next: () => number) {
  const u = Math.max(next(), 1e-6);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * next());
}

/**
 * The brand green as rgb channels, read by painting one pixel, so the glow can
 * fade to a transparent version of itself. A gradient to "transparent" fades
 * through transparent black, which on the light theme left a grey smudge.
 */
function channels(color: string): string {
  const probe = document.createElement("canvas").getContext("2d");
  if (!probe) return "0, 0, 0";
  probe.fillStyle = color;
  probe.fillRect(0, 0, 1, 1);
  const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;
  return `${r}, ${g}, ${b}`;
}

function inside(x: number, y: number, ring: 0 | 1, margin = 0) {
  const [cx, cy] = CENTRES[ring];
  return Math.hypot(x - cx, y - cy) < RADIUS - margin;
}

function build(density: number) {
  const next = random(7);
  const rings: RingSquare[] = [];
  for (const ring of [0, 1] as const) {
    for (let i = 0; i < Math.round(RING_SQUARES * density); i++) {
      // Most squares hug the line; a few stray further, so the band reads as
      // particles rather than a stroked circle. One in twenty, kept within
      // about two bands of the line: one in eight, three bands out, read as
      // scruffy, the strays gathering along the rings' lower edge.
      const stray = next() < 0.05;
      rings.push({
        ring,
        angle: next() * Math.PI * 2,
        offset: gaussian(next) * (stray ? BAND * 2 : BAND),
        alpha: stray ? 0.12 + next() * 0.2 : 0.3 + next() * 0.5,
        tone: next() < 0.75 ? FOREGROUND : MUTED,
      });
    }
  }

  // The lens: rejection-sample inside both circles, keeping more near its
  // middle so the light gathers where the overlap is deepest.
  const lens: LensSquare[] = [];
  while (lens.length < Math.round(LENS_SQUARES * density)) {
    const x = LENS_X - 21 + next() * 42;
    const y = 50 - RADIUS + next() * RADIUS * 2;
    if (!inside(x, y, 0, 1) || !inside(x, y, 1, 1)) continue;
    const depth = 1 - Math.hypot((x - LENS_X) / 21, (y - 50) / 40);
    if (next() > 0.25 + depth) continue;
    lens.push({
      x,
      y,
      vx: (next() - 0.5) * 0.6,
      vy: (next() - 0.5) * 0.6,
      alpha: 0.2 + next() * 0.6,
      phase: next() * Math.PI * 2,
    });
  }
  return { rings, lens };
}

export function FoundationVennField({
  className,
  density = 1,
  assemble = false,
}: {
  className?: string;
  /**
   * More squares for a larger drawing, so the rings stay a band rather than
   * a dotted line when the Venn is drawn large.
   */
  density?: number;
  /**
   * Bring the rings together the first time the drawing is seen: they start
   * apart, slide into overlap, and the lens lights as they meet — the
   * Foundation's job, independent teams brought into overlap, in one motion.
   * The Foundation draft's hero uses it as a small emblem over the title.
   * Reduced motion gets the finished Venn.
   */
  assemble?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const { rings, lens } = build(density);
    const inkFor = () =>
      document.documentElement.classList.contains("dark") ? 1 : LIGHT_INK;
    let palette = getCanvasThemePalette();
    let brand = channels(palette[BRAND]);
    let ink = inkFor();
    let width = 0;
    let height = 0;
    let scale = 1;
    let frame = 0;
    let visible = false;
    let previous = 0;
    let time = 0;
    // Assembly runs 0 → 1 once the drawing is first seen.
    let progress = assemble && !reduceMotion ? 0 : 1;
    // Wide when the rings travel in from either side.
    const boxW = assemble ? ASSEMBLED_BOX_W : BOX_W;

    const shift = (boxW - BOX_W) / 2;
    const eased = () => 1 - (1 - progress) ** 3;
    /** A ring's centre on x, where it is in the assembly. */
    const centreX = (ring: 0 | 1) =>
      CENTRES[ring][0] + shift + (ring === 0 ? -1 : 1) * SPREAD * (1 - eased());
    /** How lit the lens is: dark while the rings close, full as they settle. */
    const lit = () => Math.min(1, Math.max(0, (eased() - 0.5) / 0.5));
    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      if (bounds.width <= 0 || bounds.height <= 0) return;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = bounds.width;
      height = bounds.height;
      scale = width / boxW;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const square = (x: number, y: number) => {
      context.fillRect(
        x * scale - SQUARE / 2,
        y * scale - SQUARE / 2,
        SQUARE,
        SQUARE
      );
    };

    const draw = () => {
      context.clearRect(0, 0, width, height);

      // A faint glow under the lens, so the green squares sit in light rather
      // than on black.
      const glow = context.createRadialGradient(
        (LENS_X + shift) * scale,
        50 * scale,
        0,
        (LENS_X + shift) * scale,
        50 * scale,
        24 * scale
      );
      glow.addColorStop(0, `rgba(${brand}, 1)`);
      glow.addColorStop(1, `rgba(${brand}, 0)`);
      context.save();
      context.beginPath();
      context.arc(centreX(0) * scale, 50 * scale, RADIUS * scale, 0, 7);
      context.clip();
      context.beginPath();
      context.arc(centreX(1) * scale, 50 * scale, RADIUS * scale, 0, 7);
      context.clip();
      context.globalAlpha = 0.14 * lit();
      context.fillStyle = glow;
      context.fillRect(0, 0, width, height);
      context.restore();

      for (const s of rings) {
        const direction = s.ring === 0 ? 1 : -1;
        const angle = s.angle + direction * DRIFT * time;
        const cx = centreX(s.ring);
        const cy = 50;
        const r = RADIUS + s.offset;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;

        // The travelling highlight; the second ring's starts opposite, so the
        // two chase each other rather than moving in step.
        const sheenAt =
          (s.ring === 0 ? 0 : Math.PI) + direction * SHEEN_SPEED * time;
        const turn = Math.PI * 2;
        const apart = (((angle - sheenAt) % turn) + turn) % turn;
        const gap = Math.min(apart, turn - apart);
        const sheen = Math.max(0, 1 - gap / SHEEN_WIDTH);

        const other = s.ring === 0 ? 1 : 0;
        const edge = Math.hypot(x - centreX(other), y - 50) < RADIUS;
        context.fillStyle = palette[edge ? BRAND : s.tone];
        context.globalAlpha = Math.min(
          1,
          (s.alpha + sheen * 0.5) * (edge ? 1 : ink)
        );
        square(x, y);
      }

      context.fillStyle = palette[BRAND];
      for (const s of lens) {
        const twinkle = 0.65 + 0.35 * Math.sin(time * 1.3 + s.phase);
        context.globalAlpha = s.alpha * twinkle * lit();
        square(s.x + shift, s.y);
      }
      context.globalAlpha = 1;
    };

    const step = (dt: number) => {
      for (const s of lens) {
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        // Kept inside the lens: a square that drifts out turns back.
        if (!inside(s.x, s.y, 0, 1) || !inside(s.x, s.y, 1, 1)) {
          s.x -= s.vx * dt * 2;
          s.y -= s.vy * dt * 2;
          s.vx = -s.vx;
          s.vy = -s.vy;
        }
      }
    };

    const tick = (now: number) => {
      if (!visible) return;
      const dt = previous ? Math.min((now - previous) / 1000, 0.05) : 0;
      previous = now;
      time += dt;
      if (progress < 1)
        progress = Math.min(1, progress + dt / ASSEMBLE_SECONDS);
      step(dt);
      draw();
      frame = requestAnimationFrame(tick);
    };

    const start = () => {
      cancelAnimationFrame(frame);
      if (reduceMotion) {
        draw();
        return;
      }
      previous = 0;
      frame = requestAnimationFrame(tick);
    };

    resize();
    draw();

    const resizeObserver = new ResizeObserver(() => {
      resize();
      draw();
    });
    resizeObserver.observe(canvas);

    // Nothing is drawn while the drawing is off screen.
    const visibility = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else cancelAnimationFrame(frame);
    });
    visibility.observe(canvas);

    const themeObserver = new MutationObserver(() => {
      palette = getCanvasThemePalette();
      brand = channels(palette[BRAND]);
      ink = inkFor();
      draw();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style", "data-theme"],
    });

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      visibility.disconnect();
      themeObserver.disconnect();
    };
  }, [density, assemble]);

  return (
    <div
      className={`relative w-full ${assemble ? "aspect-[220/100]" : "aspect-[158/100]"} ${className ?? ""}`}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="absolute inset-0 size-full" />
    </div>
  );
}
