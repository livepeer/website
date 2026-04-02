"use client";

import { useEffect, useRef } from "react";

/**
 * Luminous Streams — fiber-optic light trails flowing across the viewport.
 *
 * Organic bezier paths branch and converge, representing video signals
 * distributed across a global GPU network. Particles flow along the paths
 * leaving glowing trails. Responds subtly to scroll position.
 */

// --- Catmull-Rom spline evaluation ---
function evalSpline(points: number[][], t: number): [number, number] {
  const n = points.length - 1;
  if (n < 1) return [points[0][0], points[0][1]];
  const st = Math.min(t, 0.9999) * n;
  const seg = Math.floor(st);
  const lt = st - seg;
  const p0 = points[Math.max(0, seg - 1)];
  const p1 = points[seg];
  const p2 = points[Math.min(n, seg + 1)];
  const p3 = points[Math.min(n, seg + 2)];
  const t2 = lt * lt,
    t3 = t2 * lt;
  return [
    0.5 *
      (2 * p1[0] +
        (-p0[0] + p2[0]) * lt +
        (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 +
        (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
    0.5 *
      (2 * p1[1] +
        (-p0[1] + p2[1]) * lt +
        (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 +
        (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3),
  ];
}

// --- Path definitions (normalized 0-1, scaled to canvas) ---
// Organized as 3 bands (upper / middle / lower), each with a trunk + 2 branches
// Plus diagonals and cross-connections for network density
const PATHS: number[][][] = [
  // Upper band — trunk + branches
  [
    [-0.05, 0.25],
    [0.15, 0.22],
    [0.35, 0.28],
    [0.55, 0.24],
    [0.75, 0.27],
    [1.05, 0.25],
  ],
  [
    [-0.05, 0.25],
    [0.15, 0.22],
    [0.3, 0.14],
    [0.45, 0.1],
    [0.6, 0.14],
    [0.75, 0.27],
    [1.05, 0.25],
  ],
  [
    [-0.05, 0.25],
    [0.15, 0.22],
    [0.3, 0.33],
    [0.45, 0.37],
    [0.6, 0.34],
    [0.75, 0.27],
    [1.05, 0.25],
  ],

  // Middle band — trunk + branches
  [
    [-0.05, 0.5],
    [0.12, 0.48],
    [0.32, 0.52],
    [0.52, 0.47],
    [0.72, 0.51],
    [1.05, 0.5],
  ],
  [
    [-0.05, 0.5],
    [0.12, 0.48],
    [0.28, 0.41],
    [0.44, 0.37],
    [0.58, 0.4],
    [0.72, 0.51],
    [1.05, 0.5],
  ],
  [
    [-0.05, 0.5],
    [0.12, 0.48],
    [0.28, 0.57],
    [0.44, 0.61],
    [0.58, 0.58],
    [0.72, 0.51],
    [1.05, 0.5],
  ],

  // Lower band — trunk + branches
  [
    [-0.05, 0.75],
    [0.18, 0.73],
    [0.38, 0.77],
    [0.58, 0.74],
    [0.78, 0.76],
    [1.05, 0.75],
  ],
  [
    [-0.05, 0.75],
    [0.18, 0.73],
    [0.32, 0.66],
    [0.46, 0.62],
    [0.6, 0.65],
    [0.78, 0.76],
    [1.05, 0.75],
  ],
  [
    [-0.05, 0.75],
    [0.18, 0.73],
    [0.32, 0.83],
    [0.46, 0.87],
    [0.6, 0.84],
    [0.78, 0.76],
    [1.05, 0.75],
  ],

  // Diagonal flows — connecting bands
  [
    [-0.06, 0.08],
    [0.18, 0.2],
    [0.38, 0.36],
    [0.58, 0.48],
    [0.78, 0.62],
    [1.06, 0.78],
  ],
  [
    [-0.06, 0.92],
    [0.18, 0.8],
    [0.38, 0.64],
    [0.58, 0.52],
    [0.78, 0.39],
    [1.06, 0.22],
  ],

  // Cross-connections — short bridges between bands
  [
    [0.22, 0.27],
    [0.28, 0.36],
    [0.34, 0.44],
  ],
  [
    [0.52, 0.52],
    [0.58, 0.61],
    [0.64, 0.68],
  ],
  [
    [0.68, 0.27],
    [0.72, 0.38],
    [0.76, 0.48],
  ],
];

// Junction nodes — where streams branch or merge
const JUNCTIONS: number[][] = [
  [0.15, 0.22],
  [0.75, 0.27], // Upper
  [0.12, 0.48],
  [0.72, 0.51], // Middle
  [0.18, 0.73],
  [0.78, 0.76], // Lower
];

// Brand greens with slight variation
const COLORS: number[][] = [
  [64, 191, 134], // bright
  [30, 153, 96], // mid
  [64, 191, 134], // light
  [24, 121, 78], // brand
  [40, 160, 110], // warm
];

interface Particle {
  pathIdx: number;
  t: number;
  speed: number;
  ci: number;
  size: number;
  trail: number[][];
  maxTrail: number;
  isPulse: boolean;
}

function createParticle(pathCount: number): Particle {
  const isPulse = Math.random() < 0.12;
  return {
    pathIdx: Math.floor(Math.random() * pathCount),
    t: Math.random(),
    speed: isPulse
      ? 0.0018 + Math.random() * 0.0018
      : 0.0005 + Math.random() * 0.001,
    ci: Math.floor(Math.random() * COLORS.length),
    size: isPulse ? 2.5 + Math.random() * 1.5 : 1 + Math.random() * 1.5,
    trail: [],
    maxTrail: isPulse
      ? 25 + Math.floor(Math.random() * 10)
      : 12 + Math.floor(Math.random() * 10),
    isPulse,
  };
}

export default function LiveNetwork({
  className = "",
}: {
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const scrollRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let w = 0,
      h = 0;

    function resize() {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio, 2);
      w = canvas.clientWidth * dpr;
      h = canvas.clientHeight * dpr;
      canvas.width = w;
      canvas.height = h;
    }
    resize();
    window.addEventListener("resize", resize);

    function onScroll() {
      scrollRef.current = window.scrollY;
    }
    window.addEventListener("scroll", onScroll, { passive: true });

    // Particles
    const PARTICLE_COUNT = 120;
    const particles: Particle[] = Array.from({ length: PARTICLE_COUNT }, () =>
      createParticle(PATHS.length)
    );

    let prev = performance.now();

    function render() {
      if (!ctx || !canvas) return;

      const now = performance.now();
      const dt = Math.min(now - prev, 33);
      prev = now;

      // Scroll modulation
      const sectionH = canvas.clientHeight || 1;
      const scrollP = Math.min(scrollRef.current / sectionH, 1);
      const speedMult = 1 + scrollP * 0.5;
      const brightMult = 1 + scrollP * 0.25;

      // Clear
      ctx.fillStyle = "#060806";
      ctx.fillRect(0, 0, w, h);

      // Background depth — very subtle green nebula
      ctx.globalCompositeOperation = "lighter";
      const bg1 = ctx.createRadialGradient(
        w * 0.3,
        h * 0.35,
        0,
        w * 0.3,
        h * 0.35,
        w * 0.35
      );
      bg1.addColorStop(0, "rgba(10, 35, 24, 0.12)");
      bg1.addColorStop(1, "transparent");
      ctx.fillStyle = bg1;
      ctx.fillRect(0, 0, w, h);

      const bg2 = ctx.createRadialGradient(
        w * 0.72,
        h * 0.65,
        0,
        w * 0.72,
        h * 0.65,
        w * 0.3
      );
      bg2.addColorStop(0, "rgba(8, 28, 20, 0.10)");
      bg2.addColorStop(1, "transparent");
      ctx.fillStyle = bg2;
      ctx.fillRect(0, 0, w, h);

      ctx.lineCap = "round";

      // --- Faint base paths ---
      for (const path of PATHS) {
        ctx.beginPath();
        for (let i = 0; i <= 80; i++) {
          const [nx, ny] = evalSpline(path, i / 80);
          const sx = nx * w,
            sy = ny * h;
          i === 0 ? ctx.moveTo(sx, sy) : ctx.lineTo(sx, sy);
        }
        ctx.strokeStyle = `rgba(24, 121, 78, ${0.035 * brightMult})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      // --- Junction nodes — subtle persistent glow ---
      for (const [jx, jy] of JUNCTIONS) {
        const sx = jx * w,
          sy = jy * h;
        const r = 8 * brightMult;
        const grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, r);
        grad.addColorStop(0, `rgba(64, 191, 134, ${0.18 * brightMult})`);
        grad.addColorStop(0.5, `rgba(30, 153, 96, ${0.06 * brightMult})`);
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.fillRect(sx - r, sy - r, r * 2, r * 2);

        // Tiny center dot
        ctx.beginPath();
        ctx.arc(sx, sy, 1.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(64, 191, 134, ${0.3 * brightMult})`;
        ctx.fill();
      }

      // --- Update & draw particles ---
      for (const p of particles) {
        p.t += p.speed * speedMult * (dt / 16);

        if (p.t >= 1) {
          Object.assign(p, createParticle(PATHS.length));
          p.t = 0;
          p.trail = [];
          continue;
        }

        const path = PATHS[p.pathIdx];
        const [nx, ny] = evalSpline(path, p.t);
        const sx = nx * w,
          sy = ny * h;

        p.trail.push([sx, sy]);
        if (p.trail.length > p.maxTrail) p.trail.shift();

        const [cr, cg, cb] = COLORS[p.ci];
        const tLen = p.trail.length;

        // Trail segments
        if (tLen > 1) {
          for (let i = 0; i < tLen - 1; i++) {
            const prog = (i + 1) / tLen;
            const a = prog * (p.isPulse ? 0.5 : 0.28) * brightMult;
            const lw = p.size * prog * (p.isPulse ? 1.2 : 0.8);
            ctx.beginPath();
            ctx.moveTo(p.trail[i][0], p.trail[i][1]);
            ctx.lineTo(p.trail[i + 1][0], p.trail[i + 1][1]);
            ctx.strokeStyle = `rgba(${cr},${cg},${cb},${a})`;
            ctx.lineWidth = lw;
            ctx.stroke();
          }
        }

        // Bloom glow for pulse particles
        if (p.isPulse) {
          const bloomR = p.size * 6;
          const bloom = ctx.createRadialGradient(sx, sy, 0, sx, sy, bloomR);
          bloom.addColorStop(0, `rgba(${cr},${cg},${cb},${0.08 * brightMult})`);
          bloom.addColorStop(1, "transparent");
          ctx.fillStyle = bloom;
          ctx.fillRect(sx - bloomR, sy - bloomR, bloomR * 2, bloomR * 2);
        }

        // Head with glow
        ctx.shadowBlur = p.isPulse ? 14 : 8;
        ctx.shadowColor = `rgba(${cr},${cg},${cb},${(p.isPulse ? 0.7 : 0.45) * brightMult})`;
        ctx.beginPath();
        ctx.arc(sx, sy, p.size * (p.isPulse ? 1 : 0.7), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${cr},${cg},${cb},${(p.isPulse ? 0.85 : 0.6) * brightMult})`;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Reset blend mode
      ctx.globalCompositeOperation = "source-over";

      // --- Vignette ---
      const vig = ctx.createRadialGradient(
        w / 2,
        h / 2,
        w * 0.22,
        w / 2,
        h / 2,
        w * 0.65
      );
      vig.addColorStop(0, "transparent");
      vig.addColorStop(1, "rgba(6, 8, 6, 0.5)");
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, w, h);

      rafRef.current = requestAnimationFrame(render);
    }

    rafRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ display: "block" }}
    />
  );
}
