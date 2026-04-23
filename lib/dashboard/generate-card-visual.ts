/**
 * Deterministic abstract card header generator.
 * Produces unique CSS gradient backgrounds from a string seed (model ID).
 * Uses brand greens/blues at low opacity on a dark base.
 *
 * Seeded RNG approach extracted from components/home/NetworkSpirits.tsx.
 */

function seeded(s: number) {
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) || 1;
}

// Brand palette: greens, blues, teals (from brand-tokens.md)
const PALETTE: [number, number, number][] = [
  [24, 121, 78], // green #18794E
  [64, 191, 134], // green-bright #40BF86
  [20, 106, 143], // blue #146A8F
  [37, 171, 208], // blue-bright #25ABD0
  [30, 153, 96], // green-light #1E9960
  [17, 92, 59], // green-dark #115C3B
];

export function generateCardBackground(id: string): string {
  const rand = seeded(hashString(id));

  const c1 = PALETTE[Math.floor(rand() * PALETTE.length)];
  const c2 = PALETTE[Math.floor(rand() * PALETTE.length)];
  const c3 = PALETTE[Math.floor(rand() * PALETTE.length)];

  const angle = Math.floor(rand() * 360);
  const x1 = Math.floor(rand() * 60 + 10);
  const y1 = Math.floor(rand() * 60 + 10);
  const x2 = Math.floor(rand() * 60 + 30);
  const y2 = Math.floor(rand() * 60 + 30);
  const x3 = Math.floor(rand() * 40 + 30);
  const y3 = Math.floor(rand() * 40 + 30);
  const o1 = (rand() * 0.15 + 0.08).toFixed(2);
  const o2 = (rand() * 0.12 + 0.06).toFixed(2);
  const o3 = (rand() * 0.08 + 0.03).toFixed(2);

  return [
    `radial-gradient(ellipse at ${x1}% ${y1}%, rgba(${c1.join(",")},${o1}) 0%, transparent 55%)`,
    `radial-gradient(ellipse at ${x2}% ${y2}%, rgba(${c2.join(",")},${o2}) 0%, transparent 50%)`,
    `radial-gradient(circle at ${x3}% ${y3}%, rgba(${c3.join(",")},${o3}) 0%, transparent 40%)`,
    `linear-gradient(${angle}deg, #0e0e0e 0%, #141414 50%, #121212 100%)`,
  ].join(", ");
}
