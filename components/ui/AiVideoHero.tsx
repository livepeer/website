"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";

/**
 * AI Video Processing hero visual.
 *
 * Real Sobel edge detection on a looping video, rendered through WebGL.
 * Overlaid with animated bounding boxes, tracking labels, stats HUD,
 * and frosted glass tile treatment. Looks like a live AI vision system.
 */

const VERT = `
attribute vec2 a_pos;
varying vec2 v_uv;
void main() {
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

const FRAG = `
precision mediump float;
varying vec2 v_uv;
uniform sampler2D u_tex;
uniform float u_time;
uniform vec2 u_res;

float luma(vec3 c) { return dot(c, vec3(0.299, 0.587, 0.114)); }

void main() {
  vec2 uv = vec2(v_uv.x, 1.0 - v_uv.y);
  vec2 tx = 1.5 / u_res;

  // Sobel edge detection
  float tl = luma(texture2D(u_tex, uv + vec2(-tx.x, tx.y)).rgb);
  float tc = luma(texture2D(u_tex, uv + vec2(0.0,   tx.y)).rgb);
  float tr = luma(texture2D(u_tex, uv + vec2( tx.x, tx.y)).rgb);
  float ml = luma(texture2D(u_tex, uv + vec2(-tx.x, 0.0)).rgb);
  float mr = luma(texture2D(u_tex, uv + vec2( tx.x, 0.0)).rgb);
  float bl = luma(texture2D(u_tex, uv + vec2(-tx.x,-tx.y)).rgb);
  float bc = luma(texture2D(u_tex, uv + vec2(0.0,  -tx.y)).rgb);
  float br = luma(texture2D(u_tex, uv + vec2( tx.x,-tx.y)).rgb);

  float gx = -tl - 2.0*ml - bl + tr + 2.0*mr + br;
  float gy = -tl - 2.0*tc - tr + bl + 2.0*bc + br;
  float edge = sqrt(gx*gx + gy*gy);
  edge = smoothstep(0.06, 0.35, edge);

  // Original brightness
  vec3 orig = texture2D(u_tex, uv).rgb;
  float bri = luma(orig);

  // Dark base
  vec3 col = vec3(0.008, 0.02, 0.014);

  // Faint original content in deep green
  col += vec3(0.015, 0.05, 0.03) * bri;

  // Bright green edges — the hero visual
  col += vec3(0.055, 0.40, 0.22) * edge;
  col += vec3(0.02, 0.12, 0.06) * edge * edge; // edge glow

  // Depth-like heat on bright regions
  float heat = smoothstep(0.35, 0.8, bri);
  col += vec3(0.02, 0.09, 0.05) * heat * 0.4;

  // Scan line sweep
  float scanY = fract(u_time * 0.12);
  float scan = smoothstep(0.004, 0.0, abs(v_uv.y - scanY));
  col += vec3(0.04, 0.28, 0.16) * scan * 0.6;
  // Trail
  float trail = smoothstep(0.0, 0.05, scanY - v_uv.y)
              * smoothstep(0.05, 0.0, scanY - v_uv.y - 0.025);
  col += vec3(0.015, 0.10, 0.06) * trail;

  // Faint grid
  vec2 g = fract(uv * 80.0);
  float gl = step(0.975, g.x) + step(0.975, g.y);
  col += vec3(0.004, 0.015, 0.008) * gl;

  gl_FragColor = vec4(col, 1.0);
}`;

// --- Bounding box definitions ---
interface Box {
  id: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  confidence: number;
}

const INITIAL_BOXES: Box[] = [
  { id: "a", label: "face_mesh", x: 33, y: 22, w: 28, h: 34, confidence: 0.97 },
  { id: "b", label: "pose_est", x: 20, y: 15, w: 52, h: 65, confidence: 0.94 },
  {
    id: "c",
    label: "segment_roi",
    x: 58,
    y: 42,
    w: 22,
    h: 28,
    confidence: 0.91,
  },
];

export default function AiVideoHero({
  className = "",
}: {
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const rafRef = useRef(0);
  const [boxes, setBoxes] = useState(INITIAL_BOXES);
  const [stats, setStats] = useState({
    fps: 30,
    latency: 42,
    objects: 3,
    frames: 0,
  });
  const [, setReady] = useState(false);

  // Tile grid
  const tiles = useMemo(() => {
    return Array.from({ length: 24 }).map((_, i) => {
      const h = Math.abs(Math.sin(i * 127.1 + 311.7 + 43758.5453)) % 1;
      return { blur: 1 + h * 3, tint: 0.03 + h * 0.08 };
    });
  }, []);

  // Animate bounding boxes
  useEffect(() => {
    let frame = 0;
    const iv = setInterval(() => {
      frame++;
      setBoxes((prev) =>
        prev.map((box) => ({
          ...box,
          x: box.x + Math.sin(frame * 0.3 + box.x) * 0.8,
          y: box.y + Math.cos(frame * 0.25 + box.y) * 0.6,
          confidence: Math.min(
            0.99,
            Math.max(0.88, box.confidence + (Math.random() - 0.5) * 0.03)
          ),
        }))
      );
      setStats((prev) => ({
        fps: 28 + Math.floor(Math.random() * 5),
        latency: 36 + Math.floor(Math.random() * 15),
        objects: 3,
        frames: prev.frames + 1,
      }));
    }, 700);
    return () => clearInterval(iv);
  }, []);

  // WebGL setup
  const initGL = useCallback(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const gl = canvas.getContext("webgl", { antialias: false, alpha: false });
    if (!gl) return;

    function mkShader(src: string, type: number) {
      const s = gl!.createShader(type)!;
      gl!.shaderSource(s, src);
      gl!.compileShader(s);
      return s;
    }

    const prog = gl.createProgram()!;
    gl.attachShader(prog, mkShader(VERT, gl.VERTEX_SHADER));
    gl.attachShader(prog, mkShader(FRAG, gl.FRAGMENT_SHADER));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );
    const aPos = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, "u_time");
    const uRes = gl.getUniformLocation(prog, "u_res");
    const uTex = gl.getUniformLocation(prog, "u_tex");

    // Video texture
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    // Init with 1px black
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      1,
      1,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      new Uint8Array([0, 0, 0, 255])
    );

    function resize() {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio, 1.5);
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      gl!.viewport(0, 0, canvas.width, canvas.height);
    }
    resize();
    window.addEventListener("resize", resize);

    const t0 = performance.now();

    function render() {
      if (!gl || !video || !canvas) return;

      // Upload video frame
      if (video.readyState >= 2) {
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          video
        );
      }

      gl.uniform1f(uTime, (performance.now() - t0) / 1000);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1i(uTex, 0);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      rafRef.current = requestAnimationFrame(render);
    }

    rafRef.current = requestAnimationFrame(render);
    setReady(true);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const start = () => initGL();
    video.addEventListener("playing", start, { once: true });

    // Also try after canplay in case playing already fired
    if (video.readyState >= 3) start();

    return () => {
      video.removeEventListener("playing", start);
      cancelAnimationFrame(rafRef.current);
    };
  }, [initGL]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Video source — hidden, used as WebGL texture */}
      <video
        ref={videoRef}
        src="/videos/ai-face.mp4"
        autoPlay
        muted
        loop
        playsInline
        crossOrigin="anonymous"
        className="sr-only"
      />

      {/* WebGL canvas — edge detection output */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        style={{ display: "block" }}
      />

      {/* Frosted glass tiles */}
      <div
        className="absolute inset-0"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(6, 1fr)",
          gridTemplateRows: "repeat(4, 1fr)",
        }}
      >
        {tiles.map((t, i) => (
          <div
            key={i}
            style={{
              backgroundColor: `rgba(24, 121, 78, ${t.tint})`,
              backdropFilter: `blur(${t.blur}px)`,
              WebkitBackdropFilter: `blur(${t.blur}px)`,
              borderRight: "1px solid rgba(255,255,255,0.04)",
              borderBottom: "1px solid rgba(255,255,255,0.04)",
            }}
          />
        ))}
      </div>

      {/* CRT scanlines */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 3px)",
        }}
      />

      {/* TV grain */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full tv-static"
        aria-hidden="true"
        style={{ willChange: "transform" }}
      >
        <defs>
          <filter id="heroGrain">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.7"
              numOctaves="4"
              stitchTiles="stitch"
              seed={42}
            />
            <feColorMatrix type="saturate" values="0" />
          </filter>
        </defs>
        <rect
          width="120%"
          height="120%"
          x="-10%"
          y="-10%"
          filter="url(#heroGrain)"
          opacity="0.18"
          style={{ mixBlendMode: "overlay" }}
        />
      </svg>

      {/* === AI OVERLAYS — bounding boxes === */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {boxes.map((box) => (
          <div
            key={box.id}
            className="absolute"
            style={{
              left: `${box.x}%`,
              top: `${box.y}%`,
              width: `${box.w}%`,
              height: `${box.h}%`,
              transition: "all 0.7s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            {/* Corner brackets — top-left */}
            <div className="absolute top-0 left-0 h-3 w-3 border-t border-l border-green-bright/60" />
            {/* Corner brackets — top-right */}
            <div className="absolute top-0 right-0 h-3 w-3 border-t border-r border-green-bright/60" />
            {/* Corner brackets — bottom-left */}
            <div className="absolute bottom-0 left-0 h-3 w-3 border-b border-l border-green-bright/60" />
            {/* Corner brackets — bottom-right */}
            <div className="absolute bottom-0 right-0 h-3 w-3 border-b border-r border-green-bright/60" />

            {/* Label */}
            <div className="absolute -top-5 left-0 flex items-center gap-1.5">
              <span className="font-mono text-[10px] tracking-wider text-green-bright/70">
                {box.label}
              </span>
              <span className="font-mono text-[9px] text-green/50">
                {(box.confidence * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* === STATS HUD — bottom left === */}
      <div
        className="pointer-events-none absolute bottom-5 left-5 flex flex-col gap-0.5 font-mono text-[10px] tracking-wider text-green-bright/40"
        aria-hidden="true"
      >
        <span>
          STREAM_01 &nbsp;|&nbsp; {stats.fps} FPS &nbsp;|&nbsp; {stats.latency}
          ms
        </span>
        <span>OBJECTS: {stats.objects} &nbsp;|&nbsp; MODEL: cascade-rt-v2</span>
        <span>FRAME: {String(stats.frames).padStart(6, "0")}</span>
      </div>

      {/* === PROCESSING INDICATOR — top left === */}
      <div
        className="pointer-events-none absolute top-5 left-5 flex items-center gap-2"
        aria-hidden="true"
      >
        <div className="h-2 w-2 rounded-full bg-green-bright/80 animate-pulse" />
        <span className="font-mono text-[10px] tracking-widest text-green-bright/50">
          PROCESSING
        </span>
      </div>

      {/* === MODEL LABELS — top right === */}
      <div
        className="pointer-events-none absolute top-5 right-5 flex flex-col items-end gap-0.5 font-mono text-[10px] tracking-wider text-green/30"
        aria-hidden="true"
      >
        <span>EDGE_DETECT ✓</span>
        <span>POSE_EST ✓</span>
        <span>SEGMENT ✓</span>
      </div>

      {/* Vignette */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 75% 70% at 50% 50%, transparent 35%, rgba(8,8,8,0.5) 100%)",
        }}
      />
    </div>
  );
}
