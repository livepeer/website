import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * Shared renderer for blog share cards (Open Graph + Twitter).
 *
 * The frame is fixed so the blog reads as one system in a feed: the Holographik
 * hairline grid edge to edge, brand and category on the top rail, the title set
 * large on the left, date and reading time on the bottom rail.
 *
 * What fills the right side is always something the post already contains:
 *
 * The right-hand panel is always an ordered dither. What it encodes differs:
 *
 *   PHOTO — the post's own photograph (`cardArt`), downsampled to the dither
 *   grid and thresholded on luminance, so it resolves as a halftone.
 *
 *   FIELD — otherwise a scalar field defined for that post (POST_FIELD).
 *
 *   TILES — fallback for a post with neither, seeded by slug.
 */

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

/**
 * Shared `generateImageMetadata` payload for the Open Graph and Twitter image
 * routes. Both must declare the reserved export directly in their own file
 * (Next discovers image-route exports per file, not through re-export), so the
 * one thing that would otherwise drift between them — the alt text — lives here.
 */
export function shareImageMetadata(post: { title: string; category: string }) {
  return [
    {
      id: "card",
      alt: `${post.title} — ${post.category} on the Livepeer blog`,
      size: OG_SIZE,
      contentType: OG_CONTENT_TYPE,
    },
  ];
}

/**
 * Every colour literal the renderer emits, in one place. Satori can't resolve
 * the CSS custom properties from `globals.css`, so the values are inlined here
 * rather than referenced as theme tokens; each name mirrors the `@theme` token
 * it shadows so a change to the brand greens has a single place to follow. The
 * three unnamed mids (`greenMid`, `greenPale`) are interpolations the tone ramp
 * needs and have no direct token.
 */
const PALETTE = {
  bg: "#121212", // --color-dark (page background)
  rule: "rgba(255,255,255,0.09)",
  greenDark: "#115C3B", // --color-green-dark (deep shadow)
  green: "#18794E", // --color-green
  greenLight: "#1E9960", // --color-green-light
  greenMid: "#2CAF74", // interpolated mid-bright
  greenBright: "#40BF86", // --color-green-bright
  greenPale: "#8FE0C8", // pale tip — a green→blue whisper, reading as screen glow
} as const;

const BG = PALETTE.bg;
const GREEN_LIGHT = PALETTE.greenLight;
const GREEN_BRIGHT = PALETTE.greenBright;
const RULE = PALETTE.rule;

/** Grid tile, in px. Matches the 60px `.tile-bg` rhythm used across the site. */
const TILE = 60;

/** Width of the artwork panel in photo mode; also the dither surface width
 * (`ART_W` derives from it). */
const PANEL = 560;

function dataUri(svg: string) {
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

/**
 * The Holographik tile grid, edge to edge. Drawn as an SVG because satori does
 * not tile CSS gradient backgrounds — a `backgroundSize` repeat renders empty.
 */
const GRID = dataUri(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${OG_SIZE.width}" height="${
    OG_SIZE.height
  }" fill="none">${[
    ...Array.from(
      { length: Math.ceil(OG_SIZE.width / TILE) },
      (_, i) =>
        `<line x1="${i * TILE}" y1="0" x2="${i * TILE}" y2="${
          OG_SIZE.height
        }" stroke="rgba(255,255,255,0.07)" stroke-width="1"/>`
    ),
    ...Array.from(
      { length: Math.ceil(OG_SIZE.height / TILE) },
      (_, i) =>
        `<line x1="0" y1="${i * TILE}" x2="${OG_SIZE.width}" y2="${
          i * TILE
        }" stroke="rgba(255,255,255,0.07)" stroke-width="1"/>`
    ),
  ].join("")}</svg>`
);

// ── Tile constellation, for cards with no artwork ──────────────────────────
// A run of squares stepping across the grid — the grammar of the Livepeer
// symbol — wrapped in a halo that thins with distance. Seeded by slug so each
// post's is its own, and quiet enough that the title stays the subject.

const FIELD_COLS = 6;
const FIELD_ROWS = 7;
const FIELD_X = 840;
const FIELD_Y = 120;

/** xmur3 — string to a well-mixed 32-bit seed. */
function seedFrom(input: string) {
  let h = 1779033703 ^ input.length;
  for (let i = 0; i < input.length; i++) {
    h = Math.imul(h ^ input.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  return (h ^= h >>> 16) >>> 0;
}

/** mulberry32 — small, deterministic float source. */
function rng(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function tile(
  col: number,
  row: number,
  fill: number,
  stroke: number,
  solid = false
) {
  const inset = 6;
  const s = TILE - inset * 2;
  return (
    `<rect x="${FIELD_X + col * TILE + inset}" y="${FIELD_Y + row * TILE + inset}" ` +
    `width="${s}" height="${s}" fill="${solid ? GREEN_BRIGHT : GREEN_LIGHT}" ` +
    `fill-opacity="${fill.toFixed(3)}" stroke="${GREEN_BRIGHT}" stroke-width="1" ` +
    `stroke-opacity="${stroke.toFixed(3)}"/>`
  );
}

/**
 * Fallback only, for a post with no artwork drawn yet: tiles stepping across
 * the grid, seeded by slug so it is at least the post's own.
 */
function constellation(key: string) {
  const random = rng(seedFrom(key));
  const mid = (FIELD_ROWS - 1) / 2;

  const spine: { col: number; row: number }[] = [];
  let row = Math.round(mid + (random() < 0.5 ? -1 : 1) * (1 + random() * 2));
  let dir = row > mid ? -1 : 1;
  for (let col = 0; col < FIELD_COLS; col++) {
    spine.push({ col, row });
    if (random() < 0.3) dir *= -1;
    if (row + dir < 0 || row + dir > FIELD_ROWS - 1) dir *= -1;
    row = Math.min(FIELD_ROWS - 1, Math.max(0, row + dir));
  }

  const dist = (col: number, r: number) =>
    Math.min(
      ...spine.map((c) => Math.max(Math.abs(c.col - col), Math.abs(c.row - r)))
    );

  const out: string[] = [];
  for (let col = 0; col < FIELD_COLS; col++) {
    for (let r = 0; r < FIELD_ROWS; r++) {
      const d = dist(col, r);
      if (d === 0) continue;
      const chance = d === 1 ? 0.62 : d === 2 ? 0.26 : 0;
      if (random() > chance) continue;
      const near = d === 1;
      out.push(
        tile(
          col,
          r,
          (near ? 0.07 : 0.03) * (0.6 + random() * 0.8),
          near ? 0.2 : 0.1
        )
      );
    }
  }
  spine.forEach(({ col, row: r }, i) => {
    const t = i / (spine.length - 1);
    if (i === spine.length - 1) out.push(tile(col, r, 0.92, 0, true));
    else out.push(tile(col, r, 0.14 + t * 0.22, 0.45 + t * 0.4));
  });

  return dataUri(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${OG_SIZE.width}" height="${
      OG_SIZE.height
    }" fill="none">${out.join("")}</svg>`
  );
}

// ── Per-post artwork ───────────────────────────────────────────────────────
// Each post's panel is an ordered dither — an 8×8 Bayer matrix thresholding a
// scalar field, the same technique used to render an image with a limited
// palette. Only the field changes per post, so the density drifts a different
// way each time while the process stays identical across the set.
//
// It is a process, not a drawing, which is the point: earlier passes drew
// shapes (hairlines, solid blocks, glowing paths) and every one of them read as
// stock art. Dither has a real technical origin, and for a company whose
// business is encoding video that origin is the subject rather than decoration.

/**
 * Artwork panel, bleeding off the top, right and bottom of the card. Same width
 * as the layout `PANEL` box it's placed in — the dither is authored at this
 * width and the card renders it at `PANEL`, so one constant keeps them in step.
 */
const ART_W = PANEL;
const ART_H = OG_SIZE.height;

/** Dither cell, in px. Small enough to read as texture at feed size. */
const CELL = 7;

/**
 * Photographs dither at a much finer pitch. At the 7px cell the abstract fields
 * use, a photo gets only 80×90 samples — not enough to hold a face or an object,
 * and the subject dissolves. 3px gives ~187×210, which reads clearly and still
 * renders in well under a second.
 */
const PHOTO_CELL = 3;

/** Bayer 8×8 ordered-dither thresholds, normalised to 0..1. */
const BAYER = [
  [0, 32, 8, 40, 2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44, 4, 36, 14, 46, 6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [3, 35, 11, 43, 1, 33, 9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47, 7, 39, 13, 45, 5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21],
].map((row) => row.map((v) => (v + 0.5) / 64));

const clamp = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/** Soft circular source. */
const blob = (x: number, y: number, cx: number, cy: number, r: number) =>
  clamp(1 - Math.hypot(x - cx, y - cy) / r);

/**
 * The field each post encodes, in 0..1 over the 560×630 panel. These are
 * abstract — a drift, a gathering, a spine — rather than silhouettes of
 * objects. Literal shapes were tried and read as odd; the density gradient is
 * what carries the character, and it stays on the right side of decorative.
 *
 * Written so the density is heaviest toward the right and falls away before
 * the left edge, keeping the headline's side of the card clear.
 */
type Field = (x: number, y: number) => number;

const POST_FIELD: Record<string, Field> = {
  // Cascade — intensity building as it steps down and to the right.
  "introducing-livepeer-cascade-a-vision-for-livepeers-future-in-the-age-of-real-time-ai-video":
    (x, y) => {
      const step = Math.floor(y / 126);
      return clamp(0.12 + (x - (70 + step * 100)) / 250 + step * 0.11);
    },

  // Q1 ATHs — a climb resolving into the top right corner.
  "q1-2026-messari-state-of-livepeer": (x, y) =>
    clamp((x / ART_W) * 0.85 + (1 - y / ART_H) * 0.95 - 0.42),

  // Built from Inside the Stack — the density is on the inside.
  "builder-spotlight-frameworks": (x, y) => {
    const d = Math.max(Math.abs(x - 300) / 210, Math.abs(y - 315) / 210);
    return d > 1 ? 0 : clamp(1.05 - d * 1.5) + clamp(0.34 - d * 0.2);
  },

  // The Foundation — a dense base, thinning as it rises.
  "introducing-the-livepeer-foundation": (x, y) =>
    clamp((y - 210) / 300) * clamp((x - 30) / 170),

  // Livepeer 2.0 — two open planes, densest where they overlap.
  "livepeer-2-0-video-agent-platform": (x, y) => {
    const a = clamp(
      1 - Math.max(Math.abs(x - 250) / 190, Math.abs(y - 230) / 130)
    );
    const b = clamp(
      1 - Math.max(Math.abs(x - 370) / 190, Math.abs(y - 400) / 130)
    );
    return clamp(Math.max(a, b) * 0.8 + Math.min(a, b) * 0.9);
  },

  // Delegation — five faint sources resolving into one dense mass.
  "why-delegation-still-matters-in-a-low-inflation-environment": (x, y) => {
    let v = 0;
    for (let i = 0; i < 5; i++)
      v = Math.max(v, blob(x, y, 130, 120 + i * 100, 92) * 0.72);
    return Math.max(v, blob(x, y, 385, 315, 190));
  },

  // The treasury — a reserve, dispersing as it is drawn down.
  "using-the-livepeer-community-treasury": (x, y) => {
    const held = clamp(
      1 - Math.max(Math.abs(x - 190) / 130, Math.abs(y - 315) / 200)
    );
    return Math.max(
      held,
      clamp(0.9 - (x - 300) / 240) * clamp(1 - Math.abs(y - 315) / 230) * 0.7
    );
  },

  // Streamplace — a dense spine, fading outward.
  "onchain-builders-streamplace": (x, y) =>
    clamp(1.1 - Math.abs(x - 310) / 150) * clamp(1.2 - Math.abs(y - 315) / 400),

  // Livepeer Inc — everything narrowing into one band.
  "livepeer-incorporated-and-realtime-ai": (x, y) => {
    const half = 250 - (x / ART_W) * 205;
    return clamp(1.05 - Math.abs(y - 315) / half) * clamp(0.35 + x / 380);
  },

  // Network Vision — the new view laid over the one it replaces.
  "a-real-time-update-to-the-livepeer-network-vision": (x, y) =>
    Math.max(blob(x, y, 250, 360, 175) * 0.6, blob(x, y, 370, 275, 185)),

  // Blog index — a clean ramp resolving to the corner.
  "livepeer-blog": (x, y) =>
    clamp((x / ART_W) * 0.9 + (1 - y / ART_H) * 0.7 - 0.32),
};

/**
 * A photograph as a field: downsampled to one sample per dither cell and read
 * as luminance, so the same Bayer threshold that renders the abstract fields
 * renders the picture too. `normalise` stretches contrast first — most of these
 * are dim source images and would otherwise dither to mud.
 */
/**
 * Overrides for {@link photoField}. All optional — the card path takes every
 * default; the thumbnail path sets only `fit` and `feather`. A named object
 * (rather than a long positional list) is what keeps a caller from silently
 * shifting exposure or polarity by miscounting arguments.
 */
type PhotoFieldOpts = {
  /** Output box, in px. Defaults to the card artwork panel. */
  w?: number;
  h?: number;
  /** Dither cell pitch. */
  cell?: number;
  /** Auto-exposure target mean, 0..1. */
  target?: number;
  gamma?: number;
  // "cover" fills the box and crops (the card's right-hand panel bleeds, so a
  // crop is fine). "inside" fits the whole photo within the box, preserving
  // aspect, so nothing is cropped — the listing thumbnail uses this so a
  // portrait subject (three stacked monitors) shows in full.
  fit?: "cover" | "inside";
  // `pad` insets the box, leaving an even black margin so the picture doesn't
  // touch the frame.
  pad?: number;
  // Polarity. The dither lays dots on the bright end, so a photo whose subject
  // is darker than its surround (a projector on a lit wall, a mountain against
  // sky) renders inside-out — dots on the background, subject a hole. Flipping
  // the luminance puts the ink on the subject so the dither traces its shape.
  invert?: boolean;
  // Black-point, 0..1: everything at or below this exposed level clamps to
  // black. Set just under the background tone, it clears the background so the
  // dither follows the subject's silhouette instead of filling the whole frame,
  // while a gentle value keeps the subject's own tones (not a hard crush). The
  // card leaves it at 0 for a full-tonal, edge-to-edge panel.
  blackPoint?: number;
  // Feather, in px: softens only the residual hard edges where bright content
  // meets the image boundary (a sky band cut off at the top), fading them the
  // last bit into black. The black-point does the shape; this just kills the
  // straight boundary lines. Small — a large value would re-impose a rectangle.
  feather?: number;
};

async function photoField(
  path: string,
  opts: PhotoFieldOpts = {}
): Promise<Field | null> {
  const {
    w = ART_W,
    h = ART_H,
    cell = PHOTO_CELL,
    target = 0.44,
    gamma = 1.05,
    fit = "cover",
    pad = 0,
    invert = false,
    blackPoint = 0,
    feather = 0,
  } = opts;
  const boxCols = Math.ceil((w - 2 * pad) / cell);
  const boxRows = Math.ceil((h - 2 * pad) / cell);
  try {
    // Imported dynamically and guarded: sharp ships with Next for image
    // optimisation but is not a declared dependency of this app, so a post with
    // a photo degrades to its field rather than failing the render. Add sharp
    // to package.json to make this path guaranteed.
    const sharp = (await import("sharp")).default;
    // "inside" returns the scaled image at its own dimensions (no letterbox
    // pixels), so the mean below is the photo's alone and auto-exposure is not
    // dragged toward black by padding.
    const { data, info } = await sharp(join(process.cwd(), "public", path))
      .resize(boxCols, boxRows, { fit, position: "center" })
      .greyscale()
      .normalise()
      .raw()
      .toBuffer({ resolveWithObject: true });
    if (invert) for (let i = 0; i < data.length; i++) data[i] = 255 - data[i];
    const cols = info.width;
    const rows = info.height;
    // Centre the scaled image in the full frame; everything outside it is black.
    const offX = Math.round((w - cols * cell) / 2);
    const offY = Math.round((h - rows * cell) / 2);
    const x1 = offX + cols * cell;
    const y1 = offY + rows * cell;
    // Auto-expose off the (possibly inverted) mean, then a mild gamma. A fixed
    // curve cannot serve both a bright source (dithers to a solid slab) and a
    // dim one (dithers to nothing), and these sources vary widely.
    let sum = 0;
    for (let i = 0; i < data.length; i++) sum += data[i];
    const gain = target / Math.max(0.08, sum / data.length / 255);
    return (x, y) => {
      const c = Math.floor((x - offX) / cell);
      const r = Math.floor((y - offY) / cell);
      if (c < 0 || r < 0 || c >= cols || r >= rows) return 0;
      const e = (data[r * cols + c] / 255) * gain;
      // Black-point cut, then a mild gamma. The cut clears the background so the
      // dither follows the subject's shape; the gamma is near-linear so the
      // subject keeps its tonal range rather than crushing to a flat slab.
      let d = clamp(Math.pow(clamp((e - blackPoint) / (1 - blackPoint)), gamma));
      if (feather > 0) {
        const g = clamp(Math.min(x - offX, x1 - x, y - offY, y1 - y) / feather);
        d *= g * g * (3 - 2 * g);
      }
      return d;
    };
  } catch {
    return null;
  }
}

/**
 * Density picks the tone, so the ramp reads as depth rather than colour. A
 * six-step green ramp, deep shadow to a pale highlight: the extra steps over a
 * flat three-tone give the dither photographic depth and a specular pop on the
 * brightest dots, instead of reading posterised. Brand greens from `@theme`
 * (green-dark → green → green-light → green-bright) with an interpolated mid and
 * a pale tint on top.
 */
function tone(v: number) {
  if (v > 0.76) return PALETTE.greenPale; // cool pale tip on the brightest dots
  if (v > 0.64) return PALETTE.greenBright;
  if (v > 0.5) return PALETTE.greenMid;
  if (v > 0.38) return PALETTE.greenLight;
  if (v > 0.22) return PALETTE.green;
  return PALETTE.greenDark; // deep shadow
}

/**
 * Density is capped below 1 so the field never fills in solid — past about 0.8
 * the dither stops reading as texture and becomes a block.
 *
 * The top and bottom bands are cleared outright rather than merely dimmed: the
 * category sits at y≈60 and the domain at y≈560, both over the panel, and any
 * dither behind them costs legibility. Zero to y=100, ramping in by y=190, and
 * the mirror of that at the foot.
 */
function shape(v: number, x: number, y: number) {
  const edges =
    clamp((x - 10) / 90) * clamp((y - 100) / 90) * clamp((ART_H - 90 - y) / 90);
  return Math.min(0.75, v * edges);
}

/** Renders any field as a dithered panel, at the given cell pitch. */
function ditherUri(
  field: Field,
  cell: number,
  w = ART_W,
  h = ART_H,
  mask: (v: number, x: number, y: number) => number = shape,
  bg: string = BG
) {
  const out: string[] = [];
  const dot = cell > 5 ? cell - 1 : cell - 0.6;
  for (let y = 0; y < h; y += cell) {
    for (let x = 0; x < w; x += cell) {
      const v = mask(field(x + cell / 2, y + cell / 2), x, y);
      const t = BAYER[Math.round(y / cell) % 8][Math.round(x / cell) % 8];
      if (v <= 0.02 || v <= t) continue;
      out.push(
        `<rect x="${x}" y="${y}" width="${dot}" height="${dot}" fill="${tone(v)}"/>`
      );
    }
  }
  return dataUri(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">` +
      `<rect width="${w}" height="${h}" fill="${bg}"/>${out.join("")}</svg>`
  );
}

// ── Listing thumbnail ──────────────────────────────────────────────────────
// The post's artwork on its own, for the listing thumbnail — identical to the
// share card's artwork: the same full-tonal `photoField` curve, cover-fit at the
// same `PHOTO_CELL` pitch and 0.75 cap, filling the frame. None of the card's
// furniture (the listing prints the title, category and date beneath the image
// already) and no thumbnail-only processing, so a post reads as exactly the same
// picture in the feed as it does when shared.

/**
 * 16:10, matching the listing's image panel. Authored close to display size (a
 * card is at most ~389 CSS px, ≈780 device px at 2×), so the fine dither lands
 * near 1:1 and stays crisp instead of beating against a heavy downscale.
 */
export const THUMB_SIZE = { width: 800, height: 500 };

/**
 * Panel fill behind the dither — the card's "black". Set to the design system's
 * `--color-card` (#1e1e1e), a clear step above the page background (#121212), so
 * each card reads as a contained panel rather than dissolving into the page.
 */
const THUMB_BG = "#1e1e1e";

export async function renderThumbnail(cardArt: string) {
  const { width: w, height: h } = THUMB_SIZE;
  // The share card's tonal treatment — full range, same PHOTO_CELL pitch, 0.75
  // cap — fitted whole into the frame ("inside") so nothing is cropped, with a
  // feather that fades the dither out at the fitted image's edges. That last bit
  // is what makes every card dissolve into the panel instead of ending on a hard
  // square where a source has bright content (a floor, a bright sky) running to
  // its edge; the dark-vignette sources already blended, and this brings the
  // rest in line with them.
  const sampled = await photoField(cardArt, { w, h, fit: "inside", feather: 70 });
  // Capped a touch higher than the card's 0.75 so the densest dots reach the
  // pale tip of the tone ramp — a small specular glow the card doesn't need.
  const art = sampled
    ? ditherUri(sampled, PHOTO_CELL, w, h, (v) => Math.min(0.82, v), THUMB_BG)
    : null;

  // Corner registration marks — thin L-brackets inset from the frame, echoing
  // the share card's Holographik panel. They frame the picture as a designed
  // plate without touching the dither.
  const M = 18; // inset from the frame
  const A = 15; // arm length
  const B = 1.5; // stroke
  const RC = "rgba(255,255,255,0.16)";
  const bracket = (v: "top" | "bottom", hSide: "left" | "right") => (
    <div
      style={{
        position: "absolute",
        [v]: M,
        [hSide]: M,
        width: A,
        height: A,
        [`border${v[0].toUpperCase()}${v.slice(1)}`]: `${B}px solid ${RC}`,
        [`border${hSide[0].toUpperCase()}${hSide.slice(1)}`]: `${B}px solid ${RC}`,
        display: "flex",
      }}
    />
  );

  return new ImageResponse(
    <div
      style={{
        width: w,
        height: h,
        display: "flex",
        background: THUMB_BG,
        position: "relative",
      }}
    >
      {art ? <img src={art} width={w} height={h} alt="" /> : null}
      {bracket("top", "left")}
      {bracket("top", "right")}
      {bracket("bottom", "left")}
      {bracket("bottom", "right")}
    </div>,
    {
      ...THUMB_SIZE,
      // The render is deterministic per source image and this is a Route
      // Handler (not cached by default in Next 15), so cache it hard. A day
      // fresh, then a month of stale-while-revalidate quietly picks up a
      // changed source on the next deploy without a cold render on every hit.
      headers: {
        "Cache-Control":
          "public, max-age=86400, stale-while-revalidate=2592000",
      },
    }
  );
}

/** Satori can't auto-fit, so step the size down in bands by title length. */
function titleSize(title: string, wide: boolean) {
  const n = title.length;
  if (wide) {
    if (n <= 34) return 74;
    if (n <= 52) return 64;
    if (n <= 74) return 56;
    if (n <= 96) return 48;
    return 42;
  }
  if (n <= 34) return 64;
  if (n <= 52) return 54;
  if (n <= 74) return 47;
  if (n <= 96) return 41;
  return 37;
}

function formatDate(date: string) {
  if (!date) return "";
  return new Date(date)
    .toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    })
    .toUpperCase();
}

function Lockup() {
  return (
    <svg
      width="196"
      height="25"
      viewBox="0 0 711 89"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M0 16.4436V0.944092H15.4995V16.4436H0Z" fill="white" />
      <path d="M28.4692 34.504V19.0045H43.9687V34.504H28.4692Z" fill="white" />
      <path d="M56.8936 52.5661V37.0667H72.393V52.5661H56.8936Z" fill="white" />
      <path
        d="M28.4692 70.5814V55.0819H43.9687V70.5814H28.4692Z"
        fill="white"
      />
      <path d="M0 88.6207V73.1212H15.4995V88.6207H0Z" fill="white" />
      <path d="M0 52.5661V37.0667H15.4995V52.5661H0Z" fill="white" />
      <path
        d="M118.899 88.6863V0.97998H135.921V73.6405H185.815V88.6863H118.899Z"
        fill="white"
      />
      <path
        d="M195.932 88.6863V0.97998H212.954V88.6863H195.932Z"
        fill="white"
      />
      <path
        d="M291.653 0.97998H310.34L277.221 88.6863H255.142L221.283 0.97998H240.34L266.551 70.9493L291.653 0.97998Z"
        fill="white"
      />
      <path
        d="M319.038 88.6863V52.5316H336.06V37.121H319.038V0.97998H385.955V16.0258H336.06V37.121H378.369V52.5316H336.06V73.6405H387.25V88.6863H319.038Z"
        fill="white"
      />
      <path
        d="M400.019 88.6863V0.97998H439.798C457.005 0.97998 468.23 9.63853 468.23 26.9229C468.23 42.2786 457.005 52.6235 439.798 52.6235H417.041V88.6863H400.019ZM417.041 37.0306H437.886C446.521 37.0306 451.146 32.8877 451.146 26.7406C451.146 20.1235 446.521 16.0258 437.886 16.0258H417.041V37.0306Z"
        fill="white"
      />
      <path
        d="M479.889 88.6863V52.5316H496.911V37.121H479.889V0.97998H546.805V16.0258H496.911V37.121H539.219V52.5316H496.911V73.6405H548.1V88.6863H479.889Z"
        fill="white"
      />
      <path
        d="M560.869 88.6863V52.5316H577.891V37.121H560.869V0.97998H627.785V16.0258H577.891V37.121H620.2V52.5316H577.891V73.6405H629.081V88.6863H560.869Z"
        fill="white"
      />
      <path
        d="M641.85 88.6863V0.97998H682.925C698.488 0.983166 710.061 8.54418 710.061 22.8274C710.061 33.708 705.127 40.3254 695.013 44.0563C704.202 44.0563 708.766 48.2153 708.766 56.4722V88.6863H691.744V60.6923C691.744 54.3927 689.894 52.5578 683.541 52.5578H658.872V88.6863H641.85ZM658.872 37.0884H677.867C687.797 37.0884 692.977 33.7995 692.977 26.616C692.977 19.4325 687.982 16.0258 677.867 16.0258H658.872V37.0884Z"
        fill="white"
      />
    </svg>
  );
}

async function loadFonts() {
  const dir = join(process.cwd(), "public/fonts");
  const [bold, mono] = await Promise.all([
    readFile(join(dir, "FavoritPro-Bold.otf")),
    readFile(join(dir, "FavoritMono-Medium.ttf")),
  ]);
  return [
    {
      name: "Favorit Pro",
      data: bold,
      weight: 700 as const,
      style: "normal" as const,
    },
    {
      name: "Favorit Mono",
      data: mono,
      weight: 500 as const,
      style: "normal" as const,
    },
  ];
}

export type OgCardInput = {
  title: string;
  category: string;
  /** Post slug — seeds the tile constellation on cards with nothing else. */
  seed: string;
  /** ISO date string; omit for evergreen cards like the blog index. */
  date?: string;
  /** e.g. "8 min read" */
  readingTime?: string;
  author?: string;
  /** Public path to the post's own photograph, if it has one. */
  cardArt?: string;
};

export async function renderOgCard({
  title,
  category,
  seed,
  date,
  readingTime,
  author,
  cardArt,
}: OgCardInput) {
  const fonts = await loadFonts();
  // A photograph and an abstract field are both just fields now — the same
  // dither renders either, so the whole set reads as one treatment.
  const photo = cardArt ? await photoField(cardArt) : null;
  const field = photo ?? POST_FIELD[seed];
  const art = field ? ditherUri(field, photo ? PHOTO_CELL : CELL) : null;
  const size = titleSize(title, !art);
  const titleWidth = art ? 540 : 760;

  const meta = [
    formatDate(date ?? ""),
    readingTime?.toUpperCase(),
    author?.toUpperCase(),
  ]
    .filter(Boolean)
    .join("  ·  ");

  return new ImageResponse(
    // Root is an explicit, unpadded box, and the margins live on the content
    // layer inside it. Two satori quirks force this: absolute children resolve
    // against the padding box, so padding here would inset the artwork off the
    // card edges; and a root sized in percentages gives them no containing
    // block at all, so the artwork silently fails to paint.
    <div
      style={{
        width: OG_SIZE.width,
        height: OG_SIZE.height,
        display: "flex",
        flexDirection: "column",
        background: BG,
        fontFamily: "Favorit Pro",
        position: "relative",
      }}
    >
      {art ? (
        <>
          <div
            style={{
              position: "absolute",
              right: 0,
              top: 0,
              width: PANEL,
              height: OG_SIZE.height,
              display: "flex",
            }}
          >
            <img src={art} width={PANEL} height={OG_SIZE.height} alt="" />
          </div>
          {/* Narrow blend carrying the panel back into the page. The dither is
              cleared at its left edge already, so this only softens the seam. */}
          <div
            style={{
              position: "absolute",
              left: OG_SIZE.width - PANEL - 40,
              top: 0,
              width: 240,
              height: OG_SIZE.height,
              display: "flex",
              background:
                "linear-gradient(90deg, #121212 0%, rgba(18,18,18,0) 100%)",
            }}
          />
        </>
      ) : (
        <div
          style={{
            position: "absolute",
            width: 780,
            height: 780,
            right: -240,
            top: -80,
            borderRadius: "50%",
            display: "flex",
            background:
              "radial-gradient(circle, rgba(24,121,78,0.34) 0%, rgba(24,121,78,0.11) 44%, transparent 70%)",
          }}
        />
      )}

      {/* Hairline tile grid, over everything — the surface the card is cut from */}
      <div style={{ position: "absolute", inset: 0, display: "flex" }}>
        <img src={GRID} width={OG_SIZE.width} height={OG_SIZE.height} alt="" />
      </div>

      {!art && (
        <div style={{ position: "absolute", inset: 0, display: "flex" }}>
          <img
            src={constellation(seed)}
            width={OG_SIZE.width}
            height={OG_SIZE.height}
            alt=""
          />
        </div>
      )}

      {art && (
        <>
          <div
            style={{
              position: "absolute",
              left: 72,
              width: OG_SIZE.width - PANEL - 144,
              top: 133,
              height: 1,
              display: "flex",
              background: RULE,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 72,
              width: OG_SIZE.width - PANEL - 144,
              bottom: 100,
              height: 1,
              display: "flex",
              background: RULE,
            }}
          />
        </>
      )}

      {/* Content layer — everything that sits inside the margins */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "56px 72px 52px",
        }}
      >
        {/* Header rail: brand left, category right */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingBottom: 26,
            borderBottom: art ? "none" : `1px solid ${RULE}`,
          }}
        >
          <Lockup />
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 8,
                height: 8,
                background: GREEN_BRIGHT,
                display: "flex",
              }}
            />
            <div
              style={{
                fontFamily: "Favorit Mono",
                fontSize: 19,
                letterSpacing: "0.16em",
                color: art
                  ? "rgba(255,255,255,0.82)"
                  : "rgba(255,255,255,0.62)",
                display: "flex",
              }}
            >
              {category.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Title — the whole point of the card */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            paddingBottom: 30,
          }}
        >
          <div
            style={{
              display: "flex",
              maxWidth: titleWidth,
              fontSize: size,
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: "-0.025em",
              color: "#FFFFFF",
            }}
          >
            {title}
          </div>
        </div>

        {/* Footer rail */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: 24,
            borderTop: art ? "none" : `1px solid ${RULE}`,
            fontFamily: "Favorit Mono",
            fontSize: 18,
            letterSpacing: "0.08em",
          }}
        >
          <div
            style={{
              display: "flex",
              color: art ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.42)",
            }}
          >
            {meta}
          </div>
          <div
            style={{
              display: "flex",
              color: art ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.32)",
            }}
          >
            LIVEPEER.ORG
          </div>
        </div>
      </div>
    </div>,
    { ...OG_SIZE, fonts }
  );
}
