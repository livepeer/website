"use client";

import { useEffect, useRef, useCallback } from "react";

/*
  NETWORK SPIRITS — "Living Network" with Ghibli-style spirit creatures
  Luminous creatures travel network paths between hub nodes.
  Pure cinematic energy — no text, no labels.
  Full-bleed canvas with top/bottom gradient fades.
*/

const GREEN: [number, number, number] = [0, 235, 136];

function seeded(s: number) {
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// ─── Types ────────────────────────────────────

interface NetworkNode {
  x: number;
  y: number;
  size: number;
  energy: number;
  speed: number;
  phase: number;
  type: "hub" | "secondary" | "dust";
}

interface Connection {
  a: NetworkNode;
  b: NetworkNode;
  strength: number;
  speed: number;
  offset: number;
}

interface TrailPoint {
  x: number;
  y: number;
}

interface TravelerSpirit {
  type: "traveler";
  conn: Connection;
  progress: number;
  speed: number;
  size: number;
  bodyPhase: number;
  wobbleAmp: number;
  wobbleSpeed: number;
  trail: TrailPoint[];
  trailLength: number;
  eyeSpacing: number;
  hasEars: boolean;
  hasTail: boolean;
  legPhase: number;
  brightness: number;
  pauseAt: number;
  pauseTimer: number;
  direction: number;
}

interface FloaterSpirit {
  type: "floater";
  hub: NetworkNode;
  angle: number;
  orbitSpeed: number;
  orbitRadius: number;
  size: number;
  bobPhase: number;
  bobAmp: number;
  brightness: number;
  trail: TrailPoint[];
  trailLength: number;
}

type Spirit = TravelerSpirit | FloaterSpirit;

// ─── NETWORK TOPOLOGY ────────────────────────

function buildNetwork() {
  const rand = seeded(77);
  const nodes: NetworkNode[] = [];
  const connections: Connection[] = [];
  const hubs: NetworkNode[] = [];

  const hubPositions: [number, number][] = [
    [120, 150],
    [300, 75],
    [500, 170],
    [720, 85],
    [940, 145],
    [1080, 75],
    [200, 300],
    [650, 310],
    [860, 270],
    [420, 330],
    [1040, 310],
    [380, 180],
    [780, 200],
    [160, 220],
  ];

  hubPositions.forEach(([x, y]) => {
    const node: NetworkNode = {
      x,
      y,
      size: 3.5 + rand() * 3,
      energy: 0.7 + rand() * 0.3,
      speed: 1.5 + rand() * 2,
      phase: rand() * Math.PI * 2,
      type: "hub",
    };
    hubs.push(node);
    nodes.push(node);
  });

  for (let i = 0; i < 20; i++) {
    nodes.push({
      x: 40 + rand() * 1120,
      y: 30 + rand() * 380,
      size: 1.8 + rand() * 2,
      energy: 0.4 + rand() * 0.4,
      speed: 2 + rand() * 2.5,
      phase: rand() * Math.PI * 2,
      type: "secondary",
    });
  }

  for (let i = 0; i < 50; i++) {
    nodes.push({
      x: rand() * 1200,
      y: rand() * 440,
      size: 0.5 + rand() * 1,
      energy: 0.1 + rand() * 0.25,
      speed: 3 + rand() * 4,
      phase: rand() * Math.PI * 2,
      type: "dust",
    });
  }

  for (let i = 0; i < hubs.length; i++) {
    for (let j = i + 1; j < hubs.length; j++) {
      const d = Math.hypot(hubs[i].x - hubs[j].x, hubs[i].y - hubs[j].y);
      if (d < 350) {
        connections.push({
          a: hubs[i],
          b: hubs[j],
          strength: 1 - d / 350,
          speed: 0.2 + rand() * 0.4,
          offset: rand() * 100,
        });
      }
    }
  }

  const secs = nodes.filter((n) => n.type === "secondary");
  hubs.forEach((hub) => {
    secs.forEach((sec) => {
      const d = Math.hypot(hub.x - sec.x, hub.y - sec.y);
      if (d < 200) {
        connections.push({
          a: hub,
          b: sec,
          strength: (1 - d / 200) * 0.5,
          speed: 0.3 + rand() * 0.3,
          offset: rand() * 100,
        });
      }
    });
  });

  return { nodes, connections, hubs };
}

// ─── SPIRIT CREATURES ────────────────────────

function createSpirits(
  connections: Connection[],
  hubs: NetworkNode[]
): Spirit[] {
  const rand = seeded(123);
  const spirits: Spirit[] = [];

  const goodConns = connections.filter((c) => c.strength > 0.3);
  for (let i = 0; i < 12; i++) {
    const conn = goodConns[Math.floor(rand() * goodConns.length)];
    spirits.push({
      type: "traveler",
      conn,
      progress: rand(),
      speed: 0.03 + rand() * 0.05,
      size: 4 + rand() * 5,
      bodyPhase: rand() * Math.PI * 2,
      wobbleAmp: 3 + rand() * 5,
      wobbleSpeed: 2 + rand() * 3,
      trail: [],
      trailLength: 8 + Math.floor(rand() * 12),
      eyeSpacing: 2 + rand() * 2,
      hasEars: rand() > 0.4,
      hasTail: rand() > 0.3,
      legPhase: rand() * Math.PI * 2,
      brightness: 0.7 + rand() * 0.3,
      pauseAt: rand() > 0.6 ? 0.4 + rand() * 0.2 : -1,
      pauseTimer: 0,
      direction: rand() > 0.5 ? 1 : -1,
    });
  }

  for (let i = 0; i < 6; i++) {
    const hub = hubs[Math.floor(rand() * hubs.length)];
    spirits.push({
      type: "floater",
      hub,
      angle: rand() * Math.PI * 2,
      orbitSpeed: 0.3 + rand() * 0.5,
      orbitRadius: 20 + rand() * 30,
      size: 3 + rand() * 3,
      bobPhase: rand() * Math.PI * 2,
      bobAmp: 4 + rand() * 4,
      brightness: 0.5 + rand() * 0.3,
      trail: [],
      trailLength: 6,
    });
  }

  return spirits;
}

const NET = buildNetwork();
const SPIRITS = createSpirits(NET.connections, NET.hubs);

const BG = "#121212";

export default function NetworkSpirits() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    const t = performance.now() * 0.001;
    const dt = 0.016;

    ctx.clearRect(0, 0, w, h);

    // ─── ATMOSPHERE ───
    const g1 = ctx.createRadialGradient(
      w * 0.3,
      h * 0.35,
      0,
      w * 0.3,
      h * 0.35,
      w * 0.4
    );
    g1.addColorStop(0, "rgba(0, 235, 136, 0.035)");
    g1.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, w, h);

    const g2 = ctx.createRadialGradient(
      w * 0.75,
      h * 0.6,
      0,
      w * 0.75,
      h * 0.6,
      w * 0.35
    );
    g2.addColorStop(0, "rgba(0, 235, 136, 0.02)");
    g2.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = g2;
    ctx.fillRect(0, 0, w, h);

    // ─── CONNECTIONS ───
    NET.connections.forEach((conn) => {
      const wave = Math.sin(t * conn.speed * 2 + conn.offset) * 0.5 + 0.5;
      const alpha = conn.strength * (0.03 + wave * 0.05);
      const mx =
        (conn.a.x + conn.b.x) / 2 + Math.sin(t * 0.7 + conn.offset) * 10;
      const my =
        (conn.a.y + conn.b.y) / 2 + Math.cos(t * 0.5 + conn.offset) * 7;

      ctx.beginPath();
      ctx.moveTo(conn.a.x, conn.a.y);
      ctx.quadraticCurveTo(mx, my, conn.b.x, conn.b.y);
      ctx.strokeStyle = `rgba(${GREEN[0]}, ${GREEN[1]}, ${GREEN[2]}, ${alpha})`;
      ctx.lineWidth = conn.strength > 0.5 ? 0.8 : 0.5;
      ctx.stroke();

      const pT = (t * conn.speed * 0.6 + conn.offset * 0.1) % 1;
      const pAlpha = Math.sin(pT * Math.PI) * conn.strength * 0.4;
      if (pAlpha > 0.03) {
        const u = pT;
        const px =
          (1 - u) * (1 - u) * conn.a.x +
          2 * (1 - u) * u * mx +
          u * u * conn.b.x;
        const py =
          (1 - u) * (1 - u) * conn.a.y +
          2 * (1 - u) * u * my +
          u * u * conn.b.y;
        ctx.beginPath();
        ctx.arc(px, py, 1.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${GREEN[0]}, ${GREEN[1]}, ${GREEN[2]}, ${pAlpha})`;
        ctx.fill();
      }
    });

    // ─── NODES ───
    NET.nodes.forEach((node) => {
      const pulse =
        Math.sin((t * (Math.PI * 2)) / node.speed + node.phase) * 0.5 + 0.5;

      if (node.type === "hub") {
        ctx.beginPath();
        ctx.arc(
          node.x,
          node.y,
          node.size * 3.5 + pulse * node.size * 2,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = `rgba(${GREEN[0]}, ${GREEN[1]}, ${GREEN[2]}, ${0.012 + pulse * 0.012})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size + 2 + pulse, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${GREEN[0]}, ${GREEN[1]}, ${GREEN[2]}, ${0.08 + pulse * 0.1})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${GREEN[0]}, ${GREEN[1]}, ${GREEN[2]}, ${0.35 + pulse * 0.35})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${0.2 + pulse * 0.3})`;
        ctx.fill();
      } else if (node.type === "secondary") {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${GREEN[0]}, ${GREEN[1]}, ${GREEN[2]}, ${0.15 + pulse * 0.2})`;
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${GREEN[0]}, ${GREEN[1]}, ${GREEN[2]}, ${0.03 + pulse * node.energy * 0.12})`;
        ctx.fill();
      }
    });

    // ─── SPIRIT CREATURES ───
    SPIRITS.forEach((spirit) => {
      if (spirit.type === "traveler") {
        const conn = spirit.conn;

        if (
          spirit.pauseAt > 0 &&
          Math.abs(spirit.progress - spirit.pauseAt) < 0.02
        ) {
          spirit.pauseTimer += dt;
          if (spirit.pauseTimer >= 1.5) {
            spirit.pauseTimer = 0;
            spirit.pauseAt = -1;
          }
        } else {
          spirit.progress += spirit.speed * dt * spirit.direction;
        }

        if (spirit.progress > 1) {
          spirit.progress = 1;
          spirit.direction = -1;
        }
        if (spirit.progress < 0) {
          spirit.progress = 0;
          spirit.direction = 1;
        }

        const mx =
          (conn.a.x + conn.b.x) / 2 + Math.sin(t * 0.7 + conn.offset) * 10;
        const my =
          (conn.a.y + conn.b.y) / 2 + Math.cos(t * 0.5 + conn.offset) * 7;
        const u = spirit.progress;
        const baseX =
          (1 - u) * (1 - u) * conn.a.x +
          2 * (1 - u) * u * mx +
          u * u * conn.b.x;
        const baseY =
          (1 - u) * (1 - u) * conn.a.y +
          2 * (1 - u) * u * my +
          u * u * conn.b.y;

        const wobble =
          Math.sin(t * spirit.wobbleSpeed + spirit.bodyPhase) *
          spirit.wobbleAmp;
        const nextU = Math.min(1, u + 0.01);
        const nx =
          (1 - nextU) * (1 - nextU) * conn.a.x +
          2 * (1 - nextU) * nextU * mx +
          nextU * nextU * conn.b.x;
        const ny =
          (1 - nextU) * (1 - nextU) * conn.a.y +
          2 * (1 - nextU) * nextU * my +
          nextU * nextU * conn.b.y;
        const ddx = nx - baseX;
        const ddy = ny - baseY;
        const len = Math.hypot(ddx, ddy) || 1;
        const perpX = -ddy / len;
        const perpY = ddx / len;

        const x = baseX + perpX * wobble;
        const y = baseY + perpY * wobble;

        spirit.trail.unshift({ x, y });
        if (spirit.trail.length > spirit.trailLength) spirit.trail.pop();

        spirit.trail.forEach((tp, i) => {
          const fade = 1 - i / spirit.trail.length;
          const trailSize = spirit.size * 0.35 * fade;
          ctx.beginPath();
          ctx.arc(tp.x, tp.y, trailSize, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${GREEN[0]}, ${GREEN[1]}, ${GREEN[2]}, ${fade * 0.15 * spirit.brightness})`;
          ctx.fill();
        });

        if (spirit.trail.length > 2) {
          ctx.beginPath();
          ctx.moveTo(spirit.trail[0].x, spirit.trail[0].y);
          for (let i = 1; i < spirit.trail.length; i++) {
            ctx.lineTo(spirit.trail[i].x, spirit.trail[i].y);
          }
          ctx.strokeStyle = `rgba(${GREEN[0]}, ${GREEN[1]}, ${GREEN[2]}, 0.08)`;
          ctx.lineWidth = spirit.size * 0.5;
          ctx.lineCap = "round";
          ctx.stroke();
        }

        const s = spirit.size;
        const breathe = Math.sin(t * 2 + spirit.bodyPhase) * 0.1 + 1;
        const squish = 1 + Math.sin(t * spirit.wobbleSpeed * 2) * 0.05;

        ctx.beginPath();
        ctx.arc(x, y, s * 2.5 * breathe, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${GREEN[0]}, ${GREEN[1]}, ${GREEN[2]}, ${0.04 * spirit.brightness})`;
        ctx.fill();

        ctx.save();
        ctx.translate(x, y);
        ctx.scale(squish, 1 / squish);
        ctx.beginPath();
        ctx.arc(0, 0, s * breathe, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${GREEN[0]}, ${GREEN[1]}, ${GREEN[2]}, ${0.4 * spirit.brightness})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(0, 0, s * 0.6 * breathe, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${GREEN[0]}, ${GREEN[1]}, ${GREEN[2]}, ${0.6 * spirit.brightness})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(0, 0, s * 0.25, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${0.5 * spirit.brightness})`;
        ctx.fill();

        const eyeY = -s * 0.15;
        const blinkPhase = Math.sin(t * 0.5 + spirit.bodyPhase * 3);
        const eyeOpen = blinkPhase > -0.9 ? 1 : 0.1;
        ctx.beginPath();
        ctx.arc(-spirit.eyeSpacing, eyeY, s * 0.12 * eyeOpen, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${0.8 * spirit.brightness})`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(spirit.eyeSpacing, eyeY, s * 0.12 * eyeOpen, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${0.8 * spirit.brightness})`;
        ctx.fill();

        if (spirit.hasEars) {
          const earWave = Math.sin(t * 3 + spirit.bodyPhase) * 2;
          ctx.beginPath();
          ctx.arc(-s * 0.4, -s * 0.8 + earWave, s * 0.15, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${GREEN[0]}, ${GREEN[1]}, ${GREEN[2]}, ${0.5 * spirit.brightness})`;
          ctx.fill();
          ctx.beginPath();
          ctx.arc(s * 0.4, -s * 0.8 - earWave, s * 0.15, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${GREEN[0]}, ${GREEN[1]}, ${GREEN[2]}, ${0.5 * spirit.brightness})`;
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(-s * 0.3, -s * 0.5);
          ctx.lineTo(-s * 0.4, -s * 0.8 + earWave);
          ctx.strokeStyle = `rgba(${GREEN[0]}, ${GREEN[1]}, ${GREEN[2]}, ${0.2 * spirit.brightness})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(s * 0.3, -s * 0.5);
          ctx.lineTo(s * 0.4, -s * 0.8 - earWave);
          ctx.stroke();
        }

        ctx.restore();

        const legCycle = Math.sin(t * 8 + spirit.legPhase);
        const legOffsetL = legCycle * 2;
        const legOffsetR = -legCycle * 2;
        ctx.beginPath();
        ctx.arc(
          x - s * 0.3 + legOffsetL,
          y + s * 0.9,
          s * 0.12,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = `rgba(${GREEN[0]}, ${GREEN[1]}, ${GREEN[2]}, ${0.35 * spirit.brightness})`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(
          x + s * 0.3 + legOffsetR,
          y + s * 0.9,
          s * 0.12,
          0,
          Math.PI * 2
        );
        ctx.fill();

        if (spirit.hasTail) {
          const tailDir = -spirit.direction;
          ctx.beginPath();
          ctx.moveTo(x + tailDir * s * 0.6, y);
          ctx.quadraticCurveTo(
            x + tailDir * s * 1.5,
            y + Math.sin(t * 4 + spirit.bodyPhase) * 4,
            x + tailDir * s * 2,
            y + Math.sin(t * 3 + spirit.bodyPhase) * 3
          );
          ctx.strokeStyle = `rgba(${GREEN[0]}, ${GREEN[1]}, ${GREEN[2]}, ${0.15 * spirit.brightness})`;
          ctx.lineWidth = 1.2;
          ctx.lineCap = "round";
          ctx.stroke();
          const tailTipX = x + tailDir * s * 2;
          const tailTipY = y + Math.sin(t * 3 + spirit.bodyPhase) * 3;
          ctx.beginPath();
          ctx.arc(tailTipX, tailTipY, s * 0.1, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${GREEN[0]}, ${GREEN[1]}, ${GREEN[2]}, ${0.3 * spirit.brightness})`;
          ctx.fill();
        }

        for (let p = 0; p < 3; p++) {
          const sparkleAge = (t * 2 + p * 1.3 + spirit.bodyPhase) % 2;
          if (sparkleAge < 1) {
            const sparkleX =
              x + Math.cos(t * 3 + p * 2.1) * s * (1 + sparkleAge);
            const sparkleY =
              y +
              Math.sin(t * 2.5 + p * 1.7) * s * (1 + sparkleAge) -
              sparkleAge * 8;
            const sparkleAlpha = (1 - sparkleAge) * 0.35 * spirit.brightness;
            ctx.beginPath();
            ctx.arc(sparkleX, sparkleY, 0.8, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${GREEN[0]}, ${GREEN[1]}, ${GREEN[2]}, ${sparkleAlpha})`;
            ctx.fill();
          }
        }
      } else if (spirit.type === "floater") {
        spirit.angle += spirit.orbitSpeed * dt;
        const bob = Math.sin(t * 1.5 + spirit.bobPhase) * spirit.bobAmp;
        const x = spirit.hub.x + Math.cos(spirit.angle) * spirit.orbitRadius;
        const y =
          spirit.hub.y +
          Math.sin(spirit.angle) * spirit.orbitRadius * 0.6 +
          bob;

        spirit.trail.unshift({ x, y });
        if (spirit.trail.length > spirit.trailLength) spirit.trail.pop();

        spirit.trail.forEach((tp, i) => {
          const fade = 1 - i / spirit.trail.length;
          ctx.beginPath();
          ctx.arc(tp.x, tp.y, spirit.size * 0.3 * fade, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${GREEN[0]}, ${GREEN[1]}, ${GREEN[2]}, ${fade * 0.1 * spirit.brightness})`;
          ctx.fill();
        });

        ctx.beginPath();
        ctx.arc(x, y, spirit.size * 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${GREEN[0]}, ${GREEN[1]}, ${GREEN[2]}, ${0.03 * spirit.brightness})`;
        ctx.fill();

        const breathe = Math.sin(t * 2.5 + spirit.bobPhase) * 0.1 + 1;
        ctx.beginPath();
        ctx.arc(x, y, spirit.size * breathe, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${GREEN[0]}, ${GREEN[1]}, ${GREEN[2]}, ${0.3 * spirit.brightness})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x, y, spirit.size * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${0.35 * spirit.brightness})`;
        ctx.fill();

        const blink = Math.sin(t * 0.4 + spirit.bobPhase * 2) > -0.85 ? 1 : 0.1;
        ctx.beginPath();
        ctx.arc(
          x - 1.5,
          y - spirit.size * 0.2,
          spirit.size * 0.1 * blink,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = `rgba(255, 255, 255, ${0.7 * spirit.brightness})`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(
          x + 1.5,
          y - spirit.size * 0.2,
          spirit.size * 0.1 * blink,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    });

    // ─── ENERGY BURSTS ───
    const hubNodes = NET.hubs;
    for (let i = 0; i < 2; i++) {
      const burstT = (t * 0.1 + i * 0.5) % 1;
      const hub = hubNodes[Math.floor((t * 0.25 + i * 4.1) % hubNodes.length)];
      if (hub && burstT < 0.5) {
        const r = burstT * 120;
        const a = (1 - burstT / 0.5) * 0.04;
        ctx.beginPath();
        ctx.arc(hub.x, hub.y, r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${GREEN[0]}, ${GREEN[1]}, ${GREEN[2]}, ${a})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
    }

    animRef.current = requestAnimationFrame(draw);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = 1200;
    canvas.height = 440;
    animRef.current = requestAnimationFrame(draw);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [draw]);

  return (
    <div
      style={{
        background: BG,
        position: "relative",
        overflow: "hidden",
        width: "100%",
      }}
    >
      <div
        className="pointer-events-none absolute top-0 right-0 left-0 z-[2]"
        style={{
          height: 100,
          background: `linear-gradient(to bottom, ${BG}, transparent)`,
        }}
      />
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "auto",
          aspectRatio: "2.73 / 1",
          display: "block",
        }}
      />
      <div
        className="pointer-events-none absolute right-0 bottom-0 left-0 z-[2]"
        style={{
          height: 100,
          background: `linear-gradient(to top, ${BG}, transparent)`,
        }}
      />
    </div>
  );
}
