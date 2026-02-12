"use client";

import { useEffect, useRef } from "react";

/**
 * Real-time WebGL generative visual — AI video processing monitor.
 *
 * Looks like you're watching an AI system process video in real-time:
 * pixelated video frames updating in blocks, edge detection overlays,
 * bounding boxes tracking objects, signal waveforms, glitch artifacts.
 * Deep green on black — broadcast monitor aesthetic.
 */

const VERTEX_SHADER = `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision mediump float;

uniform float u_time;
uniform vec2 u_resolution;

// --- Noise primitives ---
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float hash1(float n) {
  return fract(sin(n) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p) {
  float f = 0.0;
  f += 0.5 * noise(p); p *= 2.02;
  f += 0.25 * noise(p); p *= 2.03;
  f += 0.125 * noise(p); p *= 2.01;
  f += 0.0625 * noise(p);
  return f;
}

// --- Rounded rect SDF for bounding boxes ---
float boxSDF(vec2 p, vec2 center, vec2 halfSize) {
  vec2 d = abs(p - center) - halfSize;
  return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  float t = u_time;
  float aspect = u_resolution.x / u_resolution.y;
  vec2 p = vec2(uv.x * aspect, uv.y);

  // === BASE: dark with subtle pixel-block mosaic ===
  // Quantize to visible pixel blocks that update over time
  float blockSize = 48.0;
  vec2 blockUV = floor(uv * blockSize) / blockSize;
  // Each block updates at its own rate — some fast, some slow
  float blockPhase = hash(blockUV * 100.0);
  float blockTime = floor(t * (1.0 + blockPhase * 4.0));
  float blockVal = hash(blockUV * 100.0 + blockTime * 0.1);

  // Underlying structure — noise that looks like video content
  float content = fbm(blockUV * 4.0 + vec2(t * 0.08, t * 0.05));
  content = content * 0.7 + blockVal * 0.3;

  // Color: deep green monitor tones
  vec3 col = vec3(0.01, 0.03, 0.02);
  col += vec3(0.02, 0.10, 0.06) * content;

  // Higher-res detail layer — finer pixel structure
  float fineBlock = 128.0;
  vec2 fineUV = floor(uv * fineBlock) / fineBlock;
  float fineContent = fbm(fineUV * 6.0 + vec2(t * 0.1, -t * 0.06));
  col += vec3(0.01, 0.05, 0.03) * fineContent * smoothstep(0.3, 0.6, content);

  // === EDGE DETECTION OVERLAY ===
  // Simulate AI edge detection — bright green outlines on "objects"
  float edgeNoise = fbm(uv * 5.0 + vec2(t * 0.06, t * 0.04));
  float dx = fbm((uv + vec2(0.005, 0.0)) * 5.0 + vec2(t * 0.06, t * 0.04)) - edgeNoise;
  float dy = fbm((uv + vec2(0.0, 0.005)) * 5.0 + vec2(t * 0.06, t * 0.04)) - edgeNoise;
  float edges = length(vec2(dx, dy)) * 80.0;
  edges = smoothstep(0.4, 0.9, edges);
  col += vec3(0.04, 0.30, 0.16) * edges * 0.6;

  // === BOUNDING BOXES — AI tracking overlays ===
  for (int i = 0; i < 3; i++) {
    float fi = float(i);
    // Each box drifts slowly
    vec2 center = vec2(
      0.3 + 0.4 * sin(t * 0.15 + fi * 2.1),
      0.35 + 0.3 * cos(t * 0.12 + fi * 1.7 + 0.5)
    );
    vec2 halfSize = vec2(
      0.08 + 0.04 * sin(t * 0.2 + fi * 1.3),
      0.06 + 0.03 * cos(t * 0.18 + fi * 1.9)
    );

    float d = boxSDF(uv, center, halfSize);
    // Box outline
    float outline = smoothstep(0.003, 0.0, abs(d) - 0.002);
    // Corner brackets — only show near corners
    vec2 relPos = abs(uv - center);
    float cornerMask = step(halfSize.x - 0.02, relPos.x) + step(halfSize.y - 0.02, relPos.y);
    cornerMask = min(cornerMask, 1.0);
    outline *= cornerMask;

    // Pulse visibility
    float boxPulse = 0.6 + 0.4 * sin(t * 1.5 + fi * 2.09);
    col += vec3(0.06, 0.45, 0.25) * outline * boxPulse;

    // Tiny label bar above box
    float labelBar = smoothstep(0.0, 0.001, -(uv.y - center.y - halfSize.y - 0.015))
                   * smoothstep(0.0, 0.001, uv.y - center.y - halfSize.y - 0.005)
                   * smoothstep(0.0, 0.001, uv.x - center.x + halfSize.x)
                   * smoothstep(0.0, 0.001, -(uv.x - center.x - halfSize.x * 0.5));
    col += vec3(0.04, 0.25, 0.14) * labelBar * boxPulse;
  }

  // === SCANNING PROGRESS BAR ===
  float scanY = fract(t * 0.08);
  float scanLine = smoothstep(0.003, 0.0, abs(uv.y - scanY));
  // Bright leading edge
  col += vec3(0.06, 0.40, 0.22) * scanLine * 0.7;
  // Trail fade behind scan
  float scanTrail = smoothstep(0.0, 0.06, scanY - uv.y) * smoothstep(0.06, 0.0, scanY - uv.y - 0.03);
  col += vec3(0.02, 0.12, 0.07) * scanTrail;

  // === DATA READOUT — signal waveform at bottom ===
  float waveRegion = smoothstep(0.0, 0.01, uv.y) * smoothstep(0.12, 0.10, uv.y);
  if (waveRegion > 0.0) {
    float waveY = 0.06; // center line
    float signal = 0.03 * sin(uv.x * 60.0 + t * 4.0)
                 + 0.02 * sin(uv.x * 120.0 - t * 7.0)
                 + 0.015 * noise(vec2(uv.x * 30.0, t * 2.0));
    float waveDist = abs(uv.y - waveY - signal);
    float waveLine = smoothstep(0.003, 0.0, waveDist);
    col += vec3(0.05, 0.35, 0.20) * waveLine * waveRegion;
    // Baseline
    float baseline = smoothstep(0.001, 0.0, abs(uv.y - waveY));
    col += vec3(0.02, 0.08, 0.05) * baseline * waveRegion;
  }

  // === HORIZONTAL GLITCH BANDS — digital corruption ===
  for (int i = 0; i < 3; i++) {
    float fi = float(i);
    // Glitch appears and disappears
    float glitchTrigger = step(0.92, hash1(floor(t * 3.0) + fi * 17.0));
    float glitchY = hash1(floor(t * 3.0) * 7.0 + fi * 31.0);
    float glitchH = 0.003 + 0.008 * hash1(fi * 43.0 + floor(t * 3.0));
    float inGlitch = smoothstep(0.0, 0.001, uv.y - glitchY)
                   * smoothstep(0.0, 0.001, glitchY + glitchH - uv.y);
    float xShift = (hash1(floor(t * 3.0) + fi * 71.0) - 0.5) * 0.08;
    float glitchBrightness = hash(vec2(uv.x + xShift, glitchY) * 200.0 + floor(t * 8.0));
    col += vec3(0.03, 0.18, 0.10) * inGlitch * glitchTrigger * glitchBrightness;
  }

  // === PIXEL GRID LINES — faint structural grid ===
  vec2 pixGrid = fract(uv * blockSize);
  float pixLine = smoothstep(0.98, 1.0, pixGrid.x) + smoothstep(0.98, 1.0, pixGrid.y);
  col += vec3(0.01, 0.04, 0.02) * pixLine * 0.4;

  // === FRAME COUNTER / TIMECODE (top-right region) ===
  // Simulated with flickering blocks
  float tcRegion = step(0.82, uv.x) * step(0.90, uv.y);
  float tcFlicker = hash(floor(vec2(uv.x * 200.0, uv.y * 20.0)) + floor(t * 8.0));
  col += vec3(0.02, 0.12, 0.07) * tcRegion * step(0.5, tcFlicker) * 0.5;

  // === PROCESSING INDICATOR — pulsing dot top-left ===
  float recDist = length(uv - vec2(0.04, 0.95));
  float recDot = smoothstep(0.008, 0.005, recDist);
  float recPulse = 0.5 + 0.5 * sin(t * 3.0);
  col += vec3(0.08, 0.50, 0.28) * recDot * recPulse;

  // === VIGNETTE ===
  float vig = 1.0 - 0.5 * pow(length(uv - 0.5) * 1.3, 2.0);
  col *= vig;

  gl_FragColor = vec4(col, 1.0);
}
`;

export default function GenerativeCanvas({
  className = "",
}: {
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      antialias: false,
      alpha: false,
      preserveDrawingBuffer: false,
    });
    if (!gl) return;

    // Compile shaders
    function createShader(gl: WebGLRenderingContext, type: number, source: string) {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vs = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    // Full-screen quad
    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );
    const aPos = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    // Uniforms
    const uTime = gl.getUniformLocation(program, "u_time");
    const uRes = gl.getUniformLocation(program, "u_resolution");

    // Resize handler
    function resize() {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio, 1.5); // Cap for performance
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      gl!.viewport(0, 0, canvas.width, canvas.height);
    }

    resize();
    window.addEventListener("resize", resize);

    // Render loop
    const start = performance.now();

    function render() {
      if (!gl) return;
      const elapsed = (performance.now() - start) / 1000;

      gl.uniform1f(uTime, elapsed);
      gl.uniform2f(uRes, canvas!.width, canvas!.height);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      rafRef.current = requestAnimationFrame(render);
    }

    rafRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(posBuffer);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`h-full w-full ${className}`}
      style={{ display: "block" }}
    />
  );
}
