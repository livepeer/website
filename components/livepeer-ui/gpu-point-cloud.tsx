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
  FAN_RADIUS,
  FOREGROUND,
  HALF_T,
  MUTED,
  noise,
  smooth,
} from "@/components/livepeer-ui/gpu-model";
import { fieldCircle } from "@/components/livepeer-ui/livepeer-cube-stream";
import { cn } from "@/lib/utils";

/**
 * A graphics card drawn as a point cloud, in the particle field's own squares
 * and palette, for the provider band on the home page. The band had copy and
 * an arc and no subject; this is the thing the copy is about, and it sheds
 * particles from its fans that cross to the arc and ride it, so the card
 * reads as feeding the network rather than sitting beside it.
 *
 * It assembles the first time it is seen, the way an exploded drawing closes,
 * then holds a three-quarter view and sways. It leans towards a pointer over
 * it, and can be dragged right round: the back carries the Livepeer symbol,
 * which only someone who turns it finds.
 *
 * A point cloud rather than a rendered card: everything else on the page is
 * small squares on the ground colour, and a lit, textured model would be a
 * stock asset from another site, and one vendor's product. It still has to
 * read as a solid, so points the body would hide are held to a ghost of
 * themselves (see `through`); a cloud you can see straight through is a
 * wireframe, and reads as a diagram of a box.
 *
 * Plain 2D canvas and a hand-rolled projection. A few thousand squares do not
 * need a 3D library, and the page already runs two canvases.
 */

// At rest the card holds a three-quarter view with its fans towards the arc
// and sways about it. A full idle turn was tried first and spent a third of
// its time edge-on, where a card is a sliver.
const REST_YAW = 0.74;
const REST_PITCH = 0.4;
const REST_ROLL = -0.1;
// Kept narrow: at the near end of a wider swing the card faced the viewer
// square on and read as a flat panel.
const SWAY = 0.13;
/** Radians a second of the sway's phase; one swing and back is ~28s. */
const SWAY_RATE = 0.22;
const CAMERA_DISTANCE = 7;

/** Pixels to a model unit at most, and the widest the card gets in units. */
const MAX_UNIT = 114;
const CARD_SPAN = 3.2;
/** Clear space kept between the card and the arc. */
const ARC_CLEARANCE = 60;
/** Under this many pixels to a unit the card is too small to read. */
const MIN_UNIT = 84;

// How long one part takes to seat, and how long the whole card takes.
const SEAT_SECONDS = 1.05;
const ASSEMBLY_SECONDS = 1.9;

const FAN_IDLE = 2.2;
const FAN_ROUSED = 6;

/** What a point the body hides keeps of its strength. */
const GHOST = 0.04;
/**
 * How much of their strength the card's grey points keep on the light
 * ground. Near-black points on white weigh more than white ones on black,
 * and at full strength the outlines and fan rims drew as ruled lines, a
 * technical drawing beside a field of loose squares. Two-thirds was tried
 * and washed out the far fan. The green is left alone, and so is what the
 * card sheds: that is the field's, and matches it.
 */
const LIGHT_INK = 0.85;

const SPARKS = 250;
// How often each fan is the one a particle leaves from: mostly the one
// nearest the arc, so they go as a stream off the card's end and few cross
// its face.
const SPARK_FANS = [0.12, 0.38, 1];
// Palette slots a shed particle may take: the field's, minus its two faintest.
const SPARK_TONES = [FOREGROUND, FOREGROUND, MUTED, BRAND, BRAND];

type Spark = {
  age: number;
  // How far outside the arc's circle it settles, so they ride it as a band.
  lane: number;
  life: number;
  speed: number;
  tone: number;
  vx: number;
  vy: number;
  x: number;
  y: number;
};

function GpuPointCloud({
  arcRadius,
  className,
  figure = false,
}: {
  /** The `arcRadius` the band's field is drawn with, so both use one circle. */
  arcRadius?: number;
  /** Positions and sizes the element; the card is fitted to it. */
  className?: string;
  /**
   * The card alone, filling its box, for widths where it cannot stand beside
   * the arc: nothing is aimed at the arc from here, so nothing is shed.
   */
  figure?: boolean;
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
    const sparks: Spark[] = [];
    const inkFor = () =>
      document.documentElement.classList.contains("dark") ? 1 : LIGHT_INK;
    let palette = getCanvasThemePalette();
    let ink = inkFor();
    let width = 0;
    let height = 0;
    let centerX = 0;
    let centerY = 0;
    let unit = 0;
    let frame = 0;
    let visible = false;
    // Seconds since the card was first seen; negative until it has been.
    let assembly = reduceMotion ? ASSEMBLY_SECONDS : -1;
    let previousTime = 0;
    let elapsed = 0;
    let yaw = REST_YAW;
    let pitch = REST_PITCH;
    let yawVelocity = 0;
    let followYaw = 0;
    let followPitch = 0;
    let followYawTarget = 0;
    let followPitchTarget = 0;
    let fanAngle = 0;
    let fanSpeed = 0;
    let roused = false;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let lastMove = 0;
    let sparkSeed = 1;
    let sparksSettled = false;
    // The circle the band's field runs round, in this canvas's pixels.
    let arcX = 0;
    let arcY = 0;
    let arcR = 0;

    // Rotation, rebuilt each frame.
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
      const cr = Math.cos(REST_ROLL);
      const sr = Math.sin(REST_ROLL);
      // Roll · pitch · yaw: the card spins about its own upright, then the
      // whole thing is tipped towards the viewer and leant.
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

    /**
     * How much of the body lies between a point and the eye, in model units:
     * the length of the sight line that runs inside the shroud. Nothing for a
     * point on a face turned towards the viewer, the body's depth for one on
     * the far side, and it grows from nothing as a face turns away, so a face
     * fades out as it goes rather than switching off. The sight line is
     * taken as parallel for every point, which at this distance it nearly is.
     */
    const through = (x: number, y: number, z: number) => {
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

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      if (bounds.width <= 0 || bounds.height <= 0) return;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = bounds.width;
      height = bounds.height;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);

      if (figure) {
        unit = Math.min(MAX_UNIT, width / (CARD_SPAN + 0.15));
        centerX = width / 2;
        centerY = height / 2;
        handle.style.inset = "0";
        return;
      }

      const section = canvas.closest("section");
      if (!section) return;
      const sectionBounds = section.getBoundingClientRect();
      const circle = fieldCircle(
        sectionBounds.width,
        sectionBounds.height,
        "default",
        arcRadius
      );
      // The band draws its field mirrored.
      arcX =
        sectionBounds.left + sectionBounds.width - circle.centerX - bounds.left;
      arcY = sectionBounds.top + circle.centerY - bounds.top;
      arcR = circle.radius;

      // The card takes the space between the page's edge and the arc where
      // the arc comes furthest left, and is sized to it: as large as it
      // reads well, smaller where the arc leaves less room, and not drawn
      // at all where there is not room for it to be read.
      // Centred in that space, so it has the same air on both sides.
      const room = arcX - arcR;
      unit = Math.min(MAX_UNIT, (room - ARC_CLEARANCE) / CARD_SPAN);
      if (unit < MIN_UNIT) unit = 0;
      centerX = room / 2;
      centerY = height / 2;
      const span = CARD_SPAN * unit;
      handle.style.width = `${span}px`;
      handle.style.height = `${span * 0.68}px`;
      handle.style.left = `${centerX - span / 2}px`;
      handle.style.top = `${centerY - span * 0.34}px`;
      handle.style.display = unit ? "" : "none";
    };

    const spawnSpark = (spark: Spark) => {
      sparkSeed += 1;
      const pick = noise(sparkSeed);
      const fan = SPARK_FANS.findIndex((share) => pick < share);
      const radius = Math.sqrt(noise(sparkSeed + 0.31)) * FAN_RADIUS * 0.9;
      const angle = noise(sparkSeed + 0.57) * Math.PI * 2;
      const x = FAN_CENTERS[fan] + Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      const z = HALF_T;
      const depth = m20 * x + m21 * y + m22 * z;
      const scale = (CAMERA_DISTANCE / (CAMERA_DISTANCE - depth)) * unit;
      spark.x = centerX + (m00 * x + m01 * y + m02 * z) * scale;
      spark.y = centerY - (m10 * x + m11 * y + m12 * z) * scale;
      // Blown out along the way the fans face, as that falls on the screen.
      const push = 30 + noise(sparkSeed + 0.73) * 40;
      spark.vx = m02 * push;
      spark.vy = -m12 * push;
      spark.age = 0;
      spark.lane = noise(sparkSeed + 0.47) ** 2 * 34;
      spark.speed = 95 + noise(sparkSeed + 0.29) * 55;
      // Long enough to cross to the arc and ride it a while, however far
      // the arc is at this width.
      const gap = Math.hypot(spark.x - arcX, spark.y - arcY) - arcR;
      spark.life =
        2.4 + noise(sparkSeed + 0.91) * 1.8 + Math.max(0, gap) / spark.speed;
      spark.tone =
        SPARK_TONES[Math.floor(noise(sparkSeed + 0.13) * SPARK_TONES.length)];
    };

    const stepSparks = (seconds: number) => {
      while (sparks.length < SPARKS) {
        sparks.push({
          // Staggered, so they do not all leave on the first frame: each
          // waits out a delay and is placed when it is over.
          age: -noise(sparks.length + 0.4) * 4.5,
          lane: 0,
          life: 1,
          speed: 0,
          tone: 0,
          vx: 0,
          vy: 0,
          x: 0,
          y: 0,
        });
      }
      // Only a fan face that can be seen sheds anything.
      const facing = m22;
      for (const spark of sparks) {
        const waiting = spark.age < 0;
        spark.age += seconds;
        if (spark.age < 0) continue;
        if (waiting || spark.age > spark.life) {
          if (facing < 0.1) continue;
          spawnSpark(spark);
        }
        // Across to the arc, then up along it the way the field runs: the
        // nearer the circle, the more of the heading is its tangent.
        const fromX = spark.x - arcX;
        const fromY = spark.y - arcY;
        const distance = Math.max(1, Math.hypot(fromX, fromY));
        const radialX = fromX / distance;
        const radialY = fromY / distance;
        const gap = distance - arcR - spark.lane;
        const pull = Math.min(1, Math.max(0, gap / 140));
        const headingX = -radialX * pull - radialY * (1 - pull * 0.7);
        const headingY = -radialY * pull + radialX * (1 - pull * 0.7);
        const heading = Math.hypot(headingX, headingY) || 1;
        const speed =
          spark.speed * (0.45 + Math.min(1, spark.age / 1.5) * 0.55);
        const steer = Math.min(1, seconds * 2.4);
        spark.vx += ((headingX / heading) * speed - spark.vx) * steer;
        spark.vy += ((headingY / heading) * speed - spark.vy) * steer;
        spark.x += spark.vx * seconds;
        spark.y += spark.vy * seconds;
        // Like the field's own particles, never inside the circle.
        const nextX = spark.x - arcX;
        const nextY = spark.y - arcY;
        const nextDistance = Math.max(1, Math.hypot(nextX, nextY));
        if (nextDistance < arcR + spark.lane) {
          spark.x = arcX + (nextX / nextDistance) * (arcR + spark.lane);
          spark.y = arcY + (nextY / nextDistance) * (arcR + spark.lane);
        }
      }
    };

    const paintSparks = () => {
      for (const spark of sparks) {
        if (spark.age < 0 || spark.age > spark.life) continue;
        const t = spark.age / spark.life;
        // The canvas stops at the band's top edge; nothing reaches it lit.
        const fade =
          Math.min(1, t / 0.16) *
          Math.min(1, (1 - t) / 0.35) *
          Math.min(1, Math.max(0, spark.y / 70));
        context.globalAlpha = fade * 0.9;
        context.fillStyle = palette[spark.tone];
        context.fillRect(
          Math.round(spark.x - 1.5),
          Math.round(spark.y - 1.5),
          3,
          3
        );
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
          // A flick spins it, friction stops it, and the card comes home to
          // the view it sways about by the shorter way round. The pull home
          // gives way while it is still spinning, so a flick is not fought.
          yawVelocity *= Math.exp(-seconds * 1.4);
          yaw += yawVelocity * seconds;
          const target = REST_YAW + Math.sin(elapsed * SWAY_RATE) * SWAY;
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
        // The fans start once the card has closed, and work harder for
        // someone handling it.
        const fanTarget = !assembled ? 0 : roused ? FAN_ROUSED : FAN_IDLE;
        fanSpeed += (fanTarget - fanSpeed) * Math.min(1, seconds * 1.5);
        fanAngle += fanSpeed * seconds;
      }
      // It turns into place as it assembles.
      const turnIn = (1 - smooth(assembly / ASSEMBLY_SECONDS)) * -0.9;
      setRotation(yaw + followYaw + turnIn, pitch + followPitch);

      for (const point of points) {
        const progress = assembled
          ? 1
          : (assembly - point.delay) / SEAT_SECONDS;
        if (progress <= 0) continue;

        let x = point.x;
        let y = point.y;
        let z = point.z;
        if (point.fan >= 0) {
          // Neighbours counter-turn.
          const turn = point.fan === 1 ? fanAngle : -fanAngle;
          x =
            FAN_CENTERS[point.fan] +
            Math.cos(point.angle + turn) * point.radius;
          y = Math.sin(point.angle + turn) * point.radius;
        }
        let alpha = point.weight;
        if (progress < 1) {
          const out = (1 - progress) ** 3;
          x += point.ex * out;
          y += point.ey * out;
          z += point.ez * out;
          alpha *= Math.min(1, progress * 2.5);
        }

        const depth = m20 * x + m21 * y + m22 * z;
        const scale = (CAMERA_DISTANCE / (CAMERA_DISTANCE - depth)) * unit;
        const screenX = centerX + (m00 * x + m01 * y + m02 * z) * scale;
        const screenY = centerY - (m10 * x + m11 * y + m12 * z) * scale;

        // Nearer is stronger.
        alpha *= 0.62 + 0.38 * Math.min(1, Math.max(-1, depth / 1.6));
        if (point.nx || point.ny || point.nz) {
          const facing = Math.abs(
            m20 * point.nx + m21 * point.ny + m22 * point.nz
          );
          alpha *= 0.4 + 0.6 * Math.min(1, facing * 1.6);
        }
        const solid = 1 - smooth(through(x, y, z) / 0.3);
        alpha *= GHOST + (1 - GHOST) * solid;
        if (point.tone !== BRAND) alpha *= ink;

        // The field's own three pixels for what can be seen, two for the
        // ghost of what cannot.
        const size = solid > 0.5 ? 3 : 2;
        context.globalAlpha = alpha;
        context.fillStyle = palette[point.tone];
        context.fillRect(
          Math.round(screenX - size / 2),
          Math.round(screenY - size / 2),
          size,
          size
        );
      }

      // The symbol, only when the backplate is what is being looked at: it
      // has no ghost, since seen through the card it would be the mark in a
      // mirror.
      const backFacing = smooth((-m22 - 0.08) / 0.3);
      if (backFacing > 0) {
        context.fillStyle = palette[FOREGROUND];
        for (const square of squares) {
          const progress = assembled
            ? 1
            : (assembly - square.delay) / SEAT_SECONDS;
          if (progress <= 0) continue;
          const out = progress < 1 ? (1 - progress) ** 3 : 0;
          const z = -HALF_T - 0.004 + square.ez * out;
          context.globalAlpha = backFacing * Math.min(1, progress * 2.5);
          context.beginPath();
          for (const [cornerX, cornerY] of [
            [-1, -1],
            [1, -1],
            [1, 1],
            [-1, 1],
          ]) {
            const x = square.x + cornerX * square.half;
            const y = square.y + cornerY * square.half;
            const depth = m20 * x + m21 * y + m22 * z;
            const scale = (CAMERA_DISTANCE / (CAMERA_DISTANCE - depth)) * unit;
            context.lineTo(
              centerX + (m00 * x + m01 * y + m02 * z) * scale,
              centerY - (m10 * x + m11 * y + m12 * z) * scale
            );
          }
          context.closePath();
          context.fill();
        }
      }

      if (figure) {
        // Nothing to shed towards.
      } else if (reduceMotion) {
        // A still gets the stream the card feeds as well as the card: the
        // particles are stepped unpainted to where they would be mid-run,
        // once, and held there.
        if (!sparksSettled) {
          for (let step = 0; step < 240; step += 1) stepSparks(1 / 30);
          sparksSettled = true;
        }
        paintSparks();
      } else if (assembled) {
        stepSparks(seconds);
        paintSparks();
      }
      context.globalAlpha = 1;

      if (!reduceMotion && visible) frame = requestAnimationFrame(draw);
    };

    const redraw = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(draw);
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
        // Not held: the card leans a little towards the pointer, which is
        // what says it can be turned.
        if (event.pointerType !== "mouse") return;
        const bounds = handle.getBoundingClientRect();
        const acrossX = (event.clientX - bounds.left) / bounds.width - 0.5;
        const acrossY = (event.clientY - bounds.top) / bounds.height - 0.5;
        roused = true;
        followYawTarget = acrossX * 0.42;
        followPitchTarget = acrossY * 0.26;
        return;
      }
      const now = performance.now();
      const dx = event.clientX - lastX;
      const dy = event.clientY - lastY;
      const dt = Math.max(1, now - lastMove) / 1000;
      yaw += dx * 0.01;
      pitch = Math.min(1.25, Math.max(-1.25, pitch + dy * 0.008));
      // Smoothed, so the release carries the gesture rather than its last
      // sample.
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
      // The particles in flight were aimed at the old arc.
      sparks.length = 0;
      sparksSettled = false;
      redraw();
    });
    resizeObserver.observe(canvas);

    // Nothing is drawn while the band is off screen.
    const visibility = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      previousTime = 0;
      if (visible) redraw();
      else cancelAnimationFrame(frame);
    });
    visibility.observe(canvas);

    // The card assembles once, when enough of where it stands is in view to
    // watch it happen.
    const arrival = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || assembly >= 0) return;
        assembly = 0;
        arrival.disconnect();
        redraw();
      },
      { threshold: 0.45 }
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
      cancelAnimationFrame(frame);
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
  }, [arcRadius, figure]);

  return (
    <div className={cn("pointer-events-none", className)} aria-hidden="true">
      {/* On its own the card nearly fills its box, and the bracket's foot
          and the parts flying in would be cut at its edge; the canvas runs
          on a little above and below. */}
      <canvas
        ref={canvasRef}
        className={cn(
          "absolute inset-x-0 w-full",
          figure ? "-top-10 h-[calc(100%+5rem)]" : "top-0 h-full"
        )}
      />
      {/* The part that takes the drag: the card's own box, placed by the
          effect, not the whole canvas, which runs on to the right for the
          particles it sheds. pan-y leaves a vertical swipe to the page. */}
      <div
        ref={handleRef}
        className="pointer-events-auto absolute cursor-grab touch-pan-y select-none data-[dragging]:cursor-grabbing"
      />
    </div>
  );
}

export { GpuPointCloud };
