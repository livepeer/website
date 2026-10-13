"use client";

import { useEffect, useRef } from "react";

import { getCanvasThemePalette } from "@/components/canvas-theme";
import {
  BODY_X,
  BODY_Y,
  BODY_Z,
  BRAND,
  buildCard,
  FAN_CENTERS,
  FOREGROUND,
  HALF_H,
  HALF_L,
  HALF_T,
  MUTED,
  noise,
  smooth,
} from "@/components/livepeer-ui/gpu-model";
import { fieldCircle } from "@/components/livepeer-ui/livepeer-cube-stream";
import { cn } from "@/lib/utils";

/**
 * Four of the home page's cards in an open rack, for the Compute hero: the
 * home band says "Put your GPUs to work" over one card, and the page it links
 * to shows the plural. Same drawing, same squares, same turn and lean and
 * drag; what is new is what the rack is for. Jobs leave the arc beside it
 * and stream into one card or another, and the card a job lands on spins
 * its fans up and brightens while it works, then settles. That is the
 * network routing work to a provider's GPUs, which is what the copy beside
 * it says, shown rather than told.
 *
 * The cards slide into the rack one after another the first time it is seen
 * (the home card's exploded assembly, done four times over, was busy, and an
 * exploded card was tried on the 404 page and cut). Under reduced motion the
 * rack is drawn at rest with one card at work and nothing moving.
 */

// Three, not four: still the plural, and a rack the height of the copy
// rather than of the hero. Four at full strength outweighed the heading.
const CARDS = 3;
const CARD_GAP = 0.34;
const CARD_PITCH = HALF_H * 2 + CARD_GAP;
/** Each card's height in the rack, top first. */
const CARD_Y = Array.from(
  { length: CARDS },
  (_, index) => ((CARDS - 1) / 2 - index) * CARD_PITCH
);
// The frame: four posts just clear of the cards' ends and faces, and a rail
// under each end of each card for it to sit on.
const RACK_X = HALF_L + 0.17;
const RACK_Z = HALF_T + 0.12;
const RACK_Y = CARD_Y[0] + HALF_H + 0.24;

// A three-quarter view with the fans towards the arc, as on the home page,
// tipped less: from as high as the card is seen from, a stack this tall
// showed mostly tops.
const REST_YAW = 0.7;
const REST_PITCH = 0.3;
const REST_ROLL = -0.06;
const SWAY = 0.12;
const SWAY_RATE = 0.2;
// Further off than the card's camera: the rack is five times as tall, and
// at the card's distance its top and bottom swelled and shrank as it turned.
const CAMERA_DISTANCE = 14;

/** Pixels to a model unit at most and at least, and the rack's extent in units. */
const MAX_UNIT = 92;
const MIN_UNIT = 62;
const SPAN_X = 3.7;
const SPAN_Y = 5.3;
const ARC_CLEARANCE = 64;
const VERTICAL_PADDING = 140;

// The frame draws up from the floor, then the cards slide in from the front,
// top first.
const FRAME_SECONDS = 0.45;
const FIRST_CARD = 0.35;
const CARD_STAGGER = 0.24;
const SEAT_SECONDS = 0.9;
const SLIDE = 1.6;
const ASSEMBLY_SECONDS = FIRST_CARD + CARD_STAGGER * (CARDS - 1) + SEAT_SECONDS;

// Idle fans barely turn: with every fan in the rack spinning there was more
// moving than anyone could follow, and the busy card did not stand out.
const FAN_IDLE = 0.35;
const FAN_BUSY = 8;
/** How fast a card settles once its job has landed, per second. */
const ACTIVITY_DECAY = 0.3;

const GHOST = 0.04;
/** As on the home card: near-black on white is held to 85%, the green is not. */
const LIGHT_INK = 0.85;

// A job: a short stream of particles off the arc into the end of one card,
// the end that faces the arc. Aimed at the fans first, they spent most of
// their flight over the card's own face and were lost among its points;
// the gap between the arc and the rack is where a stream can be seen.
// Mostly green, the arc's colour, since it is the network's work arriving.
const JOB_PARTICLES = 36;
const JOB_SPREAD = 0.45;
const JOB_FLIGHT = [1, 1.4];
// One job every few seconds, so each is an event and the rack is mostly at
// rest between them.
const JOB_INTERVAL = [2.6, 4];
const JOB_TONES = [BRAND, BRAND, BRAND, FOREGROUND, MUTED];
/** A job particle's trail: how far behind on its path, and how strong. */
const TRAIL = [
  [0, 1],
  [0.035, 0.45],
  [0.07, 0.2],
] as const;

type FramePoint = { x: number; y: number; z: number; delay: number };

type JobParticle = {
  age: number;
  bend: number;
  card: number;
  delay: number;
  flight: number;
  jitterX: number;
  jitterY: number;
  startX: number;
  startY: number;
  tone: number;
};

function buildFrame() {
  const points: FramePoint[] = [];
  const line = (
    from: [number, number, number],
    to: [number, number, number],
    spacing: number
  ) => {
    const length = Math.hypot(
      to[0] - from[0],
      to[1] - from[1],
      to[2] - from[2]
    );
    const steps = Math.max(1, Math.round(length / spacing));
    for (let step = 0; step <= steps; step += 1) {
      const t = step / steps;
      const y = from[1] + (to[1] - from[1]) * t;
      points.push({
        x: from[0] + (to[0] - from[0]) * t,
        y,
        z: from[2] + (to[2] - from[2]) * t,
        // Up from the floor.
        delay: ((y + RACK_Y) / (2 * RACK_Y)) * FRAME_SECONDS,
      });
    }
  };
  for (const x of [-RACK_X, RACK_X]) {
    for (const z of [-RACK_Z, RACK_Z]) {
      line([x, -RACK_Y, z], [x, RACK_Y, z], 0.055);
    }
  }
  for (const y of [-RACK_Y, RACK_Y]) {
    for (const z of [-RACK_Z, RACK_Z]) {
      line([-RACK_X, y, z], [RACK_X, y, z], 0.055);
    }
    for (const x of [-RACK_X, RACK_X]) {
      line([x, y, -RACK_Z], [x, y, RACK_Z], 0.055);
    }
  }
  for (const cardY of CARD_Y) {
    const railY = cardY - HALF_H - 0.05;
    for (const x of [-RACK_X, RACK_X]) {
      line([x, railY, -RACK_Z], [x, railY, RACK_Z], 0.05);
    }
  }
  return points;
}

function GpuRack({
  arcRadius,
  className,
  side = "left",
  wideRadius,
}: {
  /** The `wideArcRadius` the hero's field is drawn with, if any. */
  arcRadius?: number;
  /** Positions and sizes the element; the rack is fitted to it. */
  className?: string;
  /**
   * Which side of the arc the rack stands: left of it with the field
   * mirrored, the Compute hero's (and the home band's arrangement), or right
   * of it with the field drawn as is, which the hero tried and set aside.
   * The fans face the arc either way, the lean mirrors with them, and jobs
   * land in the end of a card that faces the arc.
   */
  side?: "left" | "right";
  /** The `wideRadius` the hero's field is drawn with, so both use one circle. */
  wideRadius: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const handle = handleRef.current;
    if (!canvas || !handle) return;

    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const { points, squares } = buildCard();
    const frame = buildFrame();
    const jobs: JobParticle[] = [];
    const fanAngle = new Array<number>(CARDS).fill(0);
    const fanSpeed = new Array<number>(CARDS).fill(0);
    const activity = new Array<number>(CARDS).fill(0);
    // A still shows the rack at work: one card busy.
    if (reduceMotion) activity[1] = 0.8;
    const inkFor = () =>
      document.documentElement.classList.contains("dark") ? 1 : LIGHT_INK;
    let palette = getCanvasThemePalette();
    let ink = inkFor();
    let width = 0;
    let height = 0;
    let centerX = 0;
    let centerY = 0;
    let unit = 0;
    let animationFrame = 0;
    let visible = false;
    let assembly = reduceMotion ? ASSEMBLY_SECONDS : -1;
    let previousTime = 0;
    let elapsed = 0;
    // Mirrored on the left, so the fans face the arc from either side.
    const facing = side === "right" ? -1 : 1;
    const restYaw = REST_YAW * facing;
    // The lean mirrors too. Left unmirrored on the right, the rack tipped
    // away from the copy and the arc, as if leaving the hero.
    const roll = REST_ROLL * facing;
    let yaw = restYaw;
    let pitch = REST_PITCH;
    let yawVelocity = 0;
    let followYaw = 0;
    let followPitch = 0;
    let followYawTarget = 0;
    let followPitchTarget = 0;
    let roused = false;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let lastMove = 0;
    let jobSeed = 1;
    let lastCard = -1;
    // The first job lands as the last card seats, so the rack is seen at
    // work straight away rather than after a wait.
    let nextJob = ASSEMBLY_SECONDS - 0.9;
    let arcX = 0;
    let arcY = 0;
    let arcR = 0;

    let m00 = 1;
    let m01 = 0;
    let m02 = 0;
    let m10 = 0;
    let m11 = 1;
    let m12 = 0;
    let m20 = 0;
    let m21 = 0;
    let m22 = 1;

    const setRotation = (turn: number, tip: number) => {
      const cy = Math.cos(turn);
      const sy = Math.sin(turn);
      const cp = Math.cos(tip);
      const sp = Math.sin(tip);
      const cr = Math.cos(roll);
      const sr = Math.sin(roll);
      const a00 = cy;
      const a02 = sy;
      const a10 = sp * sy;
      const a11 = cp;
      const a12 = -sp * cy;
      m00 = cr * a00 - sr * a10;
      m01 = -sr * a11;
      m02 = cr * a02 - sr * a12;
      m10 = sr * a00 + cr * a10;
      m11 = cr * a11;
      m12 = sr * a02 + cr * a12;
      m20 = -cp * sy;
      m21 = sp;
      m22 = cp * cy;
    };

    const project = (x: number, y: number, z: number) => {
      const depth = m20 * x + m21 * y + m22 * z;
      const scale = (CAMERA_DISTANCE / (CAMERA_DISTANCE - depth)) * unit;
      return {
        depth,
        x: centerX + (m00 * x + m01 * y + m02 * z) * scale,
        y: centerY - (m10 * x + m11 * y + m12 * z) * scale,
      };
    };

    /** The home card's sight-line test, against one card's body. */
    const throughBox = (x: number, y: number, z: number) => {
      let near = 0;
      let far = Infinity;
      if (Math.abs(m20) > 1e-5) {
        const a = (-BODY_X - x) / m20;
        const b = (BODY_X - x) / m20;
        near = Math.max(near, Math.min(a, b));
        far = Math.min(far, Math.max(a, b));
      } else if (Math.abs(x) > BODY_X) return 0;
      if (Math.abs(m21) > 1e-5) {
        const a = (-BODY_Y - y) / m21;
        const b = (BODY_Y - y) / m21;
        near = Math.max(near, Math.min(a, b));
        far = Math.min(far, Math.max(a, b));
      } else if (Math.abs(y) > BODY_Y) return 0;
      if (Math.abs(m22) > 1e-5) {
        const a = (-BODY_Z - z) / m22;
        const b = (BODY_Z - z) / m22;
        near = Math.max(near, Math.min(a, b));
        far = Math.min(far, Math.max(a, b));
      } else if (Math.abs(z) > BODY_Z) return 0;
      return far > near ? far - near : 0;
    };

    /** How much card lies between a point and the eye: every card, summed. */
    const through = (x: number, y: number, z: number) => {
      let total = 0;
      for (const cardY of CARD_Y) total += throughBox(x, y - cardY, z);
      return total;
    };

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      if (bounds.width <= 0 || bounds.height <= 0) return;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = bounds.width;
      height = bounds.height;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);

      const section = canvas.closest("section");
      if (!section) return;
      const sectionBounds = section.getBoundingClientRect();
      const circle = fieldCircle(
        sectionBounds.width,
        sectionBounds.height,
        "default",
        arcRadius,
        0,
        wideRadius
      );
      // On the left the field is drawn mirrored.
      arcX =
        side === "right"
          ? sectionBounds.left + circle.centerX - bounds.left
          : sectionBounds.left +
            sectionBounds.width -
            circle.centerX -
            bounds.left;
      arcY = sectionBounds.top + circle.centerY - bounds.top;
      arcR = circle.radius;

      // Between the arc and the page's edge, centred, and sized to fit both
      // that width and the hero's height.
      const room = side === "right" ? width - (arcX + arcR) : arcX - arcR;
      unit = Math.min(
        MAX_UNIT,
        (room - ARC_CLEARANCE) / SPAN_X,
        (height - VERTICAL_PADDING * 2) / SPAN_Y
      );
      if (unit < MIN_UNIT) unit = 0;
      centerX = side === "right" ? width - room / 2 : room / 2;
      centerY = height / 2;
      const handleWidth = SPAN_X * unit * 0.9;
      const handleHeight = SPAN_Y * unit * 0.95;
      handle.style.width = `${handleWidth}px`;
      handle.style.height = `${handleHeight}px`;
      handle.style.left = `${centerX - handleWidth / 2}px`;
      handle.style.top = `${centerY - handleHeight / 2}px`;
      handle.style.display = unit ? "" : "none";
    };

    const spawnJob = () => {
      jobSeed += 1;
      let card = Math.floor(noise(jobSeed) * CARDS);
      if (card === lastCard)
        card =
          (card + 1 + Math.floor(noise(jobSeed + 0.5) * (CARDS - 1))) % CARDS;
      lastCard = card;
      // Off the arc level with the card, so a job crosses the gap as one
      // stream. Off a wide stretch of the arc it fanned out into a cone and
      // read as more of the field's scatter.
      const level = project(
        side === "right" ? -HALF_L : HALF_L,
        CARD_Y[card],
        0
      ).y;
      const across = Math.asin(
        Math.min(0.9, Math.max(-0.9, (level - arcY) / arcR))
      );
      for (let index = 0; index < JOB_PARTICLES; index += 1) {
        const seed = jobSeed * 31 + index;
        const angle =
          (side === "right" ? across : Math.PI - across) +
          (noise(seed + 0.11) - 0.5) * 0.22;
        const lane = arcR + noise(seed + 0.23) * 12;
        jobs.push({
          age: 0,
          bend: (noise(seed + 0.41) - 0.5) * 36,
          card,
          delay:
            (index / JOB_PARTICLES) * JOB_SPREAD + noise(seed + 0.53) * 0.1,
          flight:
            JOB_FLIGHT[0] +
            noise(seed + 0.61) * (JOB_FLIGHT[1] - JOB_FLIGHT[0]),
          jitterX: noise(seed + 0.67) * 2 - 1,
          jitterY: noise(seed + 0.71) * 2 - 1,
          startX: arcX + Math.cos(angle) * lane,
          startY: arcY + Math.sin(angle) * lane,
          tone: JOB_TONES[Math.floor(noise(seed + 0.79) * JOB_TONES.length)],
        });
      }
    };

    const stepJobs = (seconds: number) => {
      // A fan face that cannot be seen is not sent work to be seen arriving.
      if (elapsed >= nextJob && m22 > 0.1) {
        spawnJob();
        jobSeed += 1;
        nextJob =
          elapsed +
          JOB_INTERVAL[0] +
          noise(jobSeed + 0.9) * (JOB_INTERVAL[1] - JOB_INTERVAL[0]);
      }
      for (let index = jobs.length - 1; index >= 0; index -= 1) {
        const job = jobs[index];
        job.age += seconds;
        const t = (job.age - job.delay) / job.flight;
        if (t >= 1) {
          // Landed: the card wakes on the first of a job and stays awake
          // while the rest arrive.
          activity[job.card] = Math.min(
            1,
            Math.max(activity[job.card], 0.6) + 0.04
          );
          jobs.splice(index, 1);
        }
      }
    };

    const paintJobs = () => {
      for (const job of jobs) {
        const t = (job.age - job.delay) / job.flight;
        if (t <= 0 || t >= 1) continue;
        // Somewhere on the end that faces the arc, across its height and
        // thickness: the far end on the left, the bracket on the right.
        const target = project(
          side === "right" ? -HALF_L - 0.05 : HALF_L + 0.02,
          CARD_Y[job.card] + job.jitterY * HALF_H * 0.75,
          job.jitterX * HALF_T * 0.8
        );
        // A gentle curve, lifted a little, so the stream reads as thrown
        // rather than slid along a ruler.
        const dx = target.x - job.startX;
        const dy = target.y - job.startY;
        const length = Math.hypot(dx, dy) || 1;
        const controlX = (job.startX + target.x) / 2 - (dy / length) * job.bend;
        const controlY =
          (job.startY + target.y) / 2 + (dx / length) * job.bend - 30;
        const fade = 0.95 * Math.min(1, t / 0.12) * Math.min(1, (1 - t) / 0.2);
        context.fillStyle = palette[job.tone];
        // Each particle with two fainter squares behind it on its path: a
        // stream of single squares beside the field's own was lost among
        // them, and a short trail says which way it is going.
        for (const [lag, strength] of TRAIL) {
          const at = Math.max(0, t - lag);
          const e = at < 0.5 ? 4 * at * at * at : 1 - (-2 * at + 2) ** 3 / 2;
          const a = (1 - e) * (1 - e);
          const b = 2 * (1 - e) * e;
          const c = e * e;
          const x = a * job.startX + b * controlX + c * target.x;
          const y = a * job.startY + b * controlY + c * target.y;
          context.globalAlpha = fade * strength;
          context.fillRect(Math.round(x - 1.5), Math.round(y - 1.5), 3, 3);
        }
      }
    };

    const draw = (time: number) => {
      const seconds = previousTime
        ? Math.min(0.05, (time - previousTime) / 1000)
        : 0;
      previousTime = time;
      context.clearRect(0, 0, width, height);
      if (!unit || assembly < 0) return;

      const assembled = assembly >= ASSEMBLY_SECONDS;
      if (!reduceMotion) {
        elapsed += seconds;
        assembly += seconds;
        if (!dragging) {
          yawVelocity *= Math.exp(-seconds * 1.4);
          yaw += yawVelocity * seconds;
          const target = restYaw + Math.sin(elapsed * SWAY_RATE) * SWAY;
          let error = (target - yaw) % (Math.PI * 2);
          if (error > Math.PI) error -= Math.PI * 2;
          if (error < -Math.PI) error += Math.PI * 2;
          yaw +=
            (error * Math.min(1, seconds * 1.8)) /
            (1 + Math.abs(yawVelocity) * 2);
          pitch += (REST_PITCH - pitch) * Math.min(1, seconds * 1.2);
        }
        const ease = Math.min(1, seconds * 5);
        followYaw += ((dragging ? 0 : followYawTarget) - followYaw) * ease;
        followPitch +=
          ((dragging ? 0 : followPitchTarget) - followPitch) * ease;
        for (let card = 0; card < CARDS; card += 1) {
          const seated =
            assembly >= FIRST_CARD + card * CARD_STAGGER + SEAT_SECONDS;
          activity[card] = Math.max(
            0,
            activity[card] - ACTIVITY_DECAY * seconds
          );
          // Idle fans turn slowly once a card is seated; a card at work spins
          // up, and harder still for someone handling the rack.
          const busy = activity[card] * (FAN_BUSY - FAN_IDLE);
          const fanTarget = !seated ? 0 : FAN_IDLE + busy + (roused ? 1.5 : 0);
          fanSpeed[card] +=
            (fanTarget - fanSpeed[card]) * Math.min(1, seconds * 2.2);
          fanAngle[card] += fanSpeed[card] * seconds;
        }
      }
      const turnIn = (1 - smooth(assembly / ASSEMBLY_SECONDS)) * -0.6 * facing;
      setRotation(yaw + followYaw + turnIn, pitch + followPitch);

      // The frame.
      for (const point of frame) {
        const progress = assembled
          ? 1
          : Math.min(1, (assembly - point.delay) / 0.3);
        if (progress <= 0) continue;
        const projected = project(point.x, point.y, point.z);
        let alpha =
          0.3 *
          progress *
          (0.62 + 0.38 * Math.min(1, Math.max(-1, projected.depth / 2.6)));
        const solid = 1 - smooth(through(point.x, point.y, point.z) / 0.3);
        alpha *= (GHOST + (1 - GHOST) * solid) * ink;
        if (alpha < 0.02) continue;
        const size = solid > 0.5 ? 2 : 1;
        context.globalAlpha = alpha;
        context.fillStyle = palette[FOREGROUND];
        context.fillRect(
          Math.round(projected.x - size / 2),
          Math.round(projected.y - size / 2),
          size,
          size
        );
      }

      // The cards, top first.
      for (let card = 0; card < CARDS; card += 1) {
        const progress = assembled
          ? 1
          : (assembly - (FIRST_CARD + card * CARD_STAGGER)) / SEAT_SECONDS;
        if (progress <= 0) continue;
        const slide = progress < 1 ? SLIDE * (1 - progress) ** 3 : 0;
        const arriving = Math.min(1, progress * 2.5);
        const cardY = CARD_Y[card];
        // The card at work is the one thing at full strength. An idle card
        // sits back at half, its blades grey; the green comes up with a job
        // and goes with it, so in this rack green means work arriving.
        const busy = activity[card];
        const lit = 0.5 + 0.5 * busy;
        const turn = fanAngle[card];

        for (const point of points) {
          let x = point.x;
          let y = point.y;
          if (point.fan >= 0) {
            const spin = point.fan === 1 ? turn : -turn;
            x =
              FAN_CENTERS[point.fan] +
              Math.cos(point.angle + spin) * point.radius;
            y = Math.sin(point.angle + spin) * point.radius;
          }
          y += cardY;
          const z = point.z + slide;
          const projected = project(x, y, z);

          let alpha =
            point.weight *
            arriving *
            lit *
            (0.62 + 0.38 * Math.min(1, Math.max(-1, projected.depth / 2.6)));
          if (point.nx || point.ny || point.nz) {
            const facing = Math.abs(
              m20 * point.nx + m21 * point.ny + m22 * point.nz
            );
            alpha *= 0.4 + 0.6 * Math.min(1, facing * 1.6);
          }
          const solid = 1 - smooth(through(x, y, z) / 0.3);
          alpha *= GHOST + (1 - GHOST) * solid;
          const size = solid > 0.5 ? 3 : 2;
          // The edge connector stays grey: lit with the blades it was a solid
          // green bar under the card, heavier than the fans, and it pulled
          // the eye to the card's bottom edge. The blades say it is working.
          const tone =
            point.tone === BRAND && point.fan < 0 ? MUTED : point.tone;
          if (tone === BRAND) {
            // Grey while idle, crossing to green as the card wakes: the
            // grey drawn under it fades out as the green fades in.
            const grey = alpha * ink * (1 - busy);
            if (grey >= 0.03) {
              context.globalAlpha = Math.min(1, grey);
              context.fillStyle = palette[MUTED];
              context.fillRect(
                Math.round(projected.x - size / 2),
                Math.round(projected.y - size / 2),
                size,
                size
              );
            }
            alpha *= busy * 1.3;
          } else {
            alpha *= ink;
          }
          // Most of what the cards hide is never worth a fill.
          if (alpha < 0.03) continue;
          context.globalAlpha = Math.min(1, alpha);
          context.fillStyle = palette[tone];
          context.fillRect(
            Math.round(projected.x - size / 2),
            Math.round(projected.y - size / 2),
            size,
            size
          );
        }
      }

      // Each card's symbol, on the backplates, only when they are what is
      // being looked at; see the home card for why it has no ghost.
      const backFacing = smooth((-m22 - 0.08) / 0.3);
      if (backFacing > 0 && assembled) {
        context.fillStyle = palette[FOREGROUND];
        context.globalAlpha = backFacing;
        for (const cardY of CARD_Y) {
          for (const square of squares) {
            context.beginPath();
            for (const [cornerX, cornerY] of [
              [-1, -1],
              [1, -1],
              [1, 1],
              [-1, 1],
            ]) {
              const corner = project(
                square.x + cornerX * square.half,
                cardY + square.y + cornerY * square.half,
                -HALF_T - 0.004
              );
              context.lineTo(corner.x, corner.y);
            }
            context.closePath();
            context.fill();
          }
        }
      }

      if (!reduceMotion && assembly >= ASSEMBLY_SECONDS - 1.6) {
        stepJobs(seconds);
        paintJobs();
      }
      context.globalAlpha = 1;

      if (!reduceMotion && visible) {
        animationFrame = requestAnimationFrame(draw);
      }
    };

    const redraw = () => {
      cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(draw);
    };

    const onPointerDown = (event: PointerEvent) => {
      dragging = true;
      roused = true;
      lastX = event.clientX;
      lastY = event.clientY;
      lastMove = performance.now();
      yawVelocity = 0;
      handle.setPointerCapture(event.pointerId);
      handle.dataset.dragging = "true";
    };
    const onPointerMove = (event: PointerEvent) => {
      if (!dragging) {
        if (event.pointerType !== "mouse") return;
        const bounds = handle.getBoundingClientRect();
        roused = true;
        followYawTarget =
          ((event.clientX - bounds.left) / bounds.width - 0.5) * 0.42;
        followPitchTarget =
          ((event.clientY - bounds.top) / bounds.height - 0.5) * 0.2;
        return;
      }
      const now = performance.now();
      const dx = event.clientX - lastX;
      const dy = event.clientY - lastY;
      const dt = Math.max(1, now - lastMove) / 1000;
      yaw += dx * 0.01;
      pitch = Math.min(1.1, Math.max(-1.1, pitch + dy * 0.008));
      yawVelocity = yawVelocity * 0.6 + ((dx * 0.01) / dt) * 0.4;
      lastX = event.clientX;
      lastY = event.clientY;
      lastMove = now;
      if (reduceMotion) redraw();
    };
    const onPointerUp = (event: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      if (event.pointerType !== "mouse") roused = false;
      if (performance.now() - lastMove > 120) yawVelocity = 0;
      yawVelocity = Math.min(9, Math.max(-9, yawVelocity));
      if (handle.hasPointerCapture(event.pointerId)) {
        handle.releasePointerCapture(event.pointerId);
      }
      delete handle.dataset.dragging;
    };
    const onPointerLeave = () => {
      followYawTarget = 0;
      followPitchTarget = 0;
      if (!dragging) roused = false;
    };

    handle.addEventListener("pointerdown", onPointerDown);
    handle.addEventListener("pointermove", onPointerMove);
    handle.addEventListener("pointerup", onPointerUp);
    handle.addEventListener("pointercancel", onPointerUp);
    handle.addEventListener("pointerleave", onPointerLeave);

    const resizeObserver = new ResizeObserver(() => {
      resize();
      // In flight towards where the rack and the arc used to be.
      jobs.length = 0;
      redraw();
    });
    resizeObserver.observe(canvas);

    const visibility = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      previousTime = 0;
      if (visible) redraw();
      else cancelAnimationFrame(animationFrame);
    });
    visibility.observe(canvas);

    const arrival = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || assembly >= 0) return;
        assembly = 0;
        arrival.disconnect();
        redraw();
      },
      { threshold: 0.35 }
    );
    arrival.observe(handle);

    const themeObserver = new MutationObserver(() => {
      palette = getCanvasThemePalette();
      ink = inkFor();
      redraw();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style"],
    });

    return () => {
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      visibility.disconnect();
      arrival.disconnect();
      themeObserver.disconnect();
      handle.removeEventListener("pointerdown", onPointerDown);
      handle.removeEventListener("pointermove", onPointerMove);
      handle.removeEventListener("pointerup", onPointerUp);
      handle.removeEventListener("pointercancel", onPointerUp);
      handle.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [arcRadius, side, wideRadius]);

  return (
    <div className={cn("pointer-events-none", className)} aria-hidden="true">
      <canvas ref={canvasRef} className="absolute inset-0 size-full" />
      {/* The part that takes the drag: the rack's own box, placed by the
          effect. pan-y leaves a vertical swipe to the page. */}
      <div
        ref={handleRef}
        className="pointer-events-auto absolute cursor-grab touch-pan-y select-none data-[dragging]:cursor-grabbing"
      />
    </div>
  );
}

export { GpuRack };
