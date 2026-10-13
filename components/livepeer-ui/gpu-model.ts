/**
 * The graphics card the home page and the Compute page draw as point clouds:
 * its dimensions, the points that make it, and the helpers both renderers
 * share. The model only; how it is lit, turned and animated is each
 * component's own (gpu-point-cloud.tsx, gpu-rack.tsx).
 */

// The card in model units: length along x, height along y (up), thickness
// along z, with the fans facing +z.
export const HALF_L = 1.5;
export const HALF_H = 0.6;
export const HALF_T = 0.23;
const CORNER = 0.13;

export const FAN_RADIUS = 0.46;
export const FAN_CENTERS = [-0.98, 0, 0.98];
const BLADES = 9;

// Palette slots, as getCanvasThemePalette returns them.
export const FOREGROUND = 0;
export const MUTED = 1;
export const BRAND = 4;

// The body, for that test: a little inside the shroud, so that what sits on
// the surface or just under it (the blades) starts outside.
export const BODY_X = HALF_L - 0.04;
export const BODY_Y = HALF_H - 0.04;
export const BODY_Z = HALF_T - 0.04;

// The symbol's six squares, from the viewBox in components/brand.tsx: centres
// and the side they share. Drawn on the backplate as six solid squares, not
// stippled like everything round them — the mark is not rebuilt from parts.
const SYMBOL_SQUARES = [
  [7.75, 8.69],
  [36.22, 26.75],
  [64.64, 44.82],
  [36.22, 62.83],
  [7.75, 80.87],
  [7.75, 44.82],
];
const SYMBOL_CENTER = [36.2, 44.8];
const SYMBOL_SIDE = 15.5;
/** Model units to a viewBox unit: the symbol stands half the card's height. */
const SYMBOL_SCALE = 0.6 / 89;
const SYMBOL_X = -0.62;

type Vector = [number, number, number];

export type Point = {
  x: number;
  y: number;
  z: number;
  // The face the point lies on, or zero for an outline. A face seen at a
  // glancing angle packs its points together and would glare; this dims it.
  nx: number;
  ny: number;
  nz: number;
  // Where it starts from before the card assembles, as an offset, and when
  // it sets off.
  ex: number;
  ey: number;
  ez: number;
  delay: number;
  tone: number;
  weight: number;
  // Blade points turn with their fan: its index, and the point in polar form.
  fan: number;
  radius: number;
  angle: number;
};

export type Square = {
  x: number;
  y: number;
  half: number;
  ez: number;
  delay: number;
};

export function noise(seed: number) {
  const value = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return value - Math.floor(value);
}

export function smooth(value: number) {
  const t = Math.min(1, Math.max(0, value));
  return t * t * (3 - 2 * t);
}

/** Signed distance to the shroud's rounded outline; negative inside. */
function outlineDistance(x: number, y: number) {
  const qx = Math.abs(x) - (HALF_L - CORNER);
  const qy = Math.abs(y) - (HALF_H - CORNER);
  return (
    Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) +
    Math.min(Math.max(qx, qy), 0) -
    CORNER
  );
}

/** The shroud's outline, walked at an even pace, with its outward normals. */
function outline(spacing: number) {
  const stations: { x: number; y: number; nx: number; ny: number }[] = [];
  const innerX = HALF_L - CORNER;
  const innerY = HALF_H - CORNER;
  const straight = (
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    nx: number,
    ny: number
  ) => {
    const steps = Math.max(
      1,
      Math.round(Math.hypot(toX - fromX, toY - fromY) / spacing)
    );
    for (let step = 0; step < steps; step += 1) {
      const t = step / steps;
      stations.push({
        x: fromX + (toX - fromX) * t,
        y: fromY + (toY - fromY) * t,
        nx,
        ny,
      });
    }
  };
  const corner = (centerX: number, centerY: number, from: number) => {
    const steps = Math.max(1, Math.round((CORNER * Math.PI) / 2 / spacing));
    for (let step = 0; step < steps; step += 1) {
      const angle = from - (step / steps) * (Math.PI / 2);
      stations.push({
        x: centerX + Math.cos(angle) * CORNER,
        y: centerY + Math.sin(angle) * CORNER,
        nx: Math.cos(angle),
        ny: Math.sin(angle),
      });
    }
  };

  // Clockwise from the top left.
  straight(-innerX, HALF_H, innerX, HALF_H, 0, 1);
  corner(innerX, innerY, Math.PI / 2);
  straight(HALF_L, innerY, HALF_L, -innerY, 1, 0);
  corner(innerX, -innerY, 0);
  straight(innerX, -HALF_H, -innerX, -HALF_H, 0, -1);
  corner(-innerX, -innerY, -Math.PI / 2);
  straight(-HALF_L, -innerY, -HALF_L, innerY, -1, 0);
  corner(-innerX, innerY, Math.PI);

  return stations;
}

export function buildCard() {
  const points: Point[] = [];
  // The part being built: how far and which way it starts out, and when it
  // sets off. `alongNormal` sends each point out along its own face instead,
  // which is what opens the shroud's walls like a box.
  let part = { ex: 0, ey: 0, ez: 0, alongNormal: 0, delay: 0 };

  const add = (
    x: number,
    y: number,
    z: number,
    normal: Vector | null,
    tone: number,
    weight = 1
  ) => {
    const [nx, ny, nz] = normal ?? [0, 0, 0];
    points.push({
      x,
      y,
      z,
      nx,
      ny,
      nz,
      ex: part.ex + nx * part.alongNormal,
      ey: part.ey + ny * part.alongNormal,
      ez: part.ez + nz * part.alongNormal,
      delay: part.delay + noise(points.length * 0.37) * 0.22,
      tone,
      weight,
      fan: -1,
      radius: 0,
      angle: 0,
    });
  };
  const line = (
    from: Vector,
    to: Vector,
    spacing: number,
    normal: Vector | null,
    tone: number,
    weight = 1
  ) => {
    const length = Math.hypot(
      to[0] - from[0],
      to[1] - from[1],
      to[2] - from[2]
    );
    const steps = Math.max(1, Math.round(length / spacing));
    for (let step = 0; step <= steps; step += 1) {
      const t = step / steps;
      add(
        from[0] + (to[0] - from[0]) * t,
        from[1] + (to[1] - from[1]) * t,
        from[2] + (to[2] - from[2]) * t,
        normal,
        tone,
        weight
      );
    }
  };
  /** A rectangle's outline in the plane of two axes, the third held. */
  const frame = (
    axis: "x" | "y",
    held: number,
    a: [number, number],
    b: [number, number],
    spacing: number,
    normal: Vector | null,
    tone: number,
    weight = 1
  ) => {
    const at = (u: number, v: number): Vector =>
      axis === "x" ? [held, u, v] : [u, held, v];
    line(at(a[0], b[0]), at(a[1], b[0]), spacing, normal, tone, weight);
    line(at(a[0], b[1]), at(a[1], b[1]), spacing, normal, tone, weight);
    line(at(a[0], b[0]), at(a[0], b[1]), spacing, normal, tone, weight);
    line(at(a[1], b[0]), at(a[1], b[1]), spacing, normal, tone, weight);
  };

  const front: Vector = [0, 0, 1];
  const back: Vector = [0, 0, -1];
  const top: Vector = [0, 1, 0];
  const left: Vector = [-1, 0, 0];

  // The shroud's walls: rows across its thickness at each station round the
  // outline, which on the long edges are the heatsink's fins seen end-on.
  part = { ex: 0, ey: 0, ez: 0, alongNormal: 0.6, delay: 0 };
  for (const station of outline(0.085)) {
    for (let z = -HALF_T + 0.046; z < HALF_T - 0.02; z += 0.062) {
      add(station.x, station.y, z, [station.nx, station.ny, 0], MUTED, 0.6);
    }
  }
  // Power socket on the top edge.
  frame("y", HALF_H + 0.045, [0.74, 1.14], [-0.1, 0.1], 0.045, top, FOREGROUND);

  // Backplate: an even grid, which is what reads as a flat sheet, standing
  // clear of the symbol and of the cut-out at the far end, where the fins
  // show through as they do on a flow-through card.
  part = { ex: 0, ey: 0, ez: -0.85, alongNormal: 0, delay: 0.2 };
  const symbolHalfW = (73 / 2) * SYMBOL_SCALE + 0.11;
  const symbolHalfH = (89 / 2) * SYMBOL_SCALE + 0.11;
  const cutout = { from: 0.52, to: 1.24, half: 0.4 };
  for (const station of outline(0.045)) {
    add(station.x, station.y, -HALF_T, null, FOREGROUND);
  }
  for (let x = -HALF_L + 0.085; x < HALF_L; x += 0.085) {
    for (let y = -HALF_H + 0.09; y < HALF_H; y += 0.084) {
      if (outlineDistance(x, y) > -0.05) continue;
      if (Math.abs(x - SYMBOL_X) < symbolHalfW && Math.abs(y) < symbolHalfH) {
        continue;
      }
      if (
        x > cutout.from - 0.05 &&
        x < cutout.to + 0.05 &&
        Math.abs(y) < cutout.half + 0.05
      ) {
        continue;
      }
      add(x, y, -HALF_T, back, MUTED, 0.8);
    }
  }
  for (const y of [-cutout.half, cutout.half]) {
    line(
      [cutout.from, y, -HALF_T],
      [cutout.to, y, -HALF_T],
      0.045,
      back,
      FOREGROUND
    );
  }
  for (const x of [cutout.from, cutout.to]) {
    line(
      [x, -cutout.half, -HALF_T],
      [x, cutout.half, -HALF_T],
      0.045,
      back,
      FOREGROUND
    );
  }
  for (let x = cutout.from + 0.06; x < cutout.to - 0.03; x += 0.06) {
    line(
      [x, -cutout.half + 0.05, -HALF_T + 0.03],
      [x, cutout.half - 0.05, -HALF_T + 0.03],
      0.05,
      back,
      MUTED,
      0.6
    );
  }
  const squares: Square[] = SYMBOL_SQUARES.map(([x, y], index) => ({
    // Mirrored in x: the backplate is read from behind.
    x: SYMBOL_X - (x - SYMBOL_CENTER[0]) * SYMBOL_SCALE,
    y: -(y - SYMBOL_CENTER[1]) * SYMBOL_SCALE,
    half: (SYMBOL_SIDE / 2) * SYMBOL_SCALE,
    ez: -0.85,
    delay: 0.55 + index * 0.05,
  }));

  // The shroud's face: its outline, the fans' rims, and a stipple between.
  part = { ex: 0, ey: 0, ez: 0.85, alongNormal: 0, delay: 0.25 };
  for (const station of outline(0.045)) {
    add(station.x, station.y, HALF_T, null, FOREGROUND);
  }
  for (const centerX of FAN_CENTERS) {
    for (let step = 0; step < 64; step += 1) {
      const angle = (step / 64) * Math.PI * 2;
      add(
        centerX + Math.cos(angle) * FAN_RADIUS,
        Math.sin(angle) * FAN_RADIUS,
        HALF_T,
        null,
        FOREGROUND
      );
    }
  }
  for (let x = -HALF_L + 0.07; x < HALF_L; x += 0.07) {
    for (let y = -HALF_H + 0.07; y < HALF_H; y += 0.07) {
      if (outlineDistance(x, y) > -0.05) continue;
      const inFan = FAN_CENTERS.some(
        (centerX) => Math.hypot(x - centerX, y) < FAN_RADIUS + 0.05
      );
      if (!inFan) add(x, y, HALF_T, front, MUTED, 0.8);
    }
  }

  // Fans, a little under the face: a hub, and swept blades that turn. They
  // arrive last and from furthest out.
  part = { ex: 0, ey: 0, ez: 1.7, alongNormal: 0, delay: 0.5 };
  FAN_CENTERS.forEach((centerX, fan) => {
    for (const [radius, count] of [
      [0.12, 14],
      [0.06, 7],
      [0, 1],
    ]) {
      for (let step = 0; step < count; step += 1) {
        const angle = (step / count) * Math.PI * 2;
        add(
          centerX + Math.cos(angle) * radius,
          Math.sin(angle) * radius,
          HALF_T - 0.02,
          front,
          FOREGROUND
        );
      }
    }
    for (let blade = 0; blade < BLADES; blade += 1) {
      const base = (blade / BLADES) * Math.PI * 2;
      // Every third blade in the brand green, which is what lets the eye
      // follow the turn. All grey was tried, to keep green for what leaves
      // the card, and the card lost its life; Adam preferred it green.
      const tone = blade % 3 === 0 ? BRAND : MUTED;
      // Two curves a little apart give a blade its width.
      for (const [offset, steps] of [
        [0, 8],
        [0.2, 5],
      ]) {
        for (let step = 0; step <= steps; step += 1) {
          const t = step / steps;
          add(0, 0, HALF_T - 0.03, front, tone);
          const point = points[points.length - 1];
          point.fan = fan;
          point.radius = 0.16 + t * 0.26;
          point.angle = base + offset + t * 0.85;
        }
      }
    }
  });

  // The bracket: taller than the card, with its ports and its vents.
  part = { ex: -0.9, ey: 0, ez: 0, alongNormal: 0, delay: 0.35 };
  const bracketX = -HALF_L - 0.05;
  frame(
    "x",
    bracketX,
    [-HALF_H - 0.15, HALF_H + 0.06],
    [-HALF_T - 0.03, HALF_T + 0.03],
    0.06,
    null,
    FOREGROUND,
    0.7
  );
  for (const portY of [-0.38, -0.14, 0.1, 0.34]) {
    frame(
      "x",
      bracketX,
      [portY - 0.085, portY + 0.085],
      [-0.15, -0.04],
      0.05,
      left,
      FOREGROUND,
      0.7
    );
  }
  for (let y = -HALF_H + 0.08; y < HALF_H; y += 0.065) {
    line([bracketX, y, 0.05], [bracketX, y, 0.19], 0.045, left, MUTED, 0.85);
  }

  // The edge connector, in the brand green: the part that plugs in.
  part = { ex: 0, ey: -0.7, ez: 0, alongNormal: 0, delay: 0.55 };
  const boardZ = -HALF_T + 0.09;
  for (let x = -1.24; x <= -0.3; x += 0.052) {
    // The key notch.
    if (x > -1.03 && x < -0.94) continue;
    line(
      [x, -HALF_H - 0.02, boardZ],
      [x, -HALF_H - 0.15, boardZ],
      0.045,
      null,
      BRAND
    );
  }

  return { points, squares };
}
