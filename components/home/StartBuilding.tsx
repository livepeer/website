"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { motion } from "framer-motion";
import Container from "@/components/ui/Container";
import { EXTERNAL_LINKS } from "@/lib/constants";

const VERT_SRC = `attribute vec2 a_position;
varying vec2 v_uv;
void main(){
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

const FRAG_SRC = `precision mediump float;
varying vec2 v_uv;
uniform vec2 u_resolution;
uniform float u_angle;
uniform sampler2D u_revealMap;

vec3 logoGradient(float t){
  vec3 c0 = vec3(0.212, 0.380, 0.616);
  vec3 c1 = vec3(0.184, 0.745, 0.773);
  vec3 c2 = vec3(1.000, 0.596, 0.180);
  vec3 c3 = vec3(0.969, 0.231, 0.255);
  vec3 color = mix(c0, c1, smoothstep(0.0, 0.21, t));
  color = mix(color, c2, smoothstep(0.21, 0.72, t));
  color = mix(color, c3, smoothstep(0.72, 1.0, t));
  return color;
}

void main(){
  vec2 uv = v_uv;
  float aspect = u_resolution.x / u_resolution.y;
  vec2 p = (uv - 0.5) * vec2(aspect, 1.0);
  vec2 dir = vec2(cos(u_angle), sin(u_angle));
  vec2 perp = vec2(-dir.y, dir.x);
  float mainT = dot(p, dir);
  float perpT = dot(p, perp);
  float colorSeed = mainT * 0.8 + sin(mainT * 4.0) * 0.12 +
                    sin(perpT * 2.5) * 0.08 + 0.5;
  vec3 gradientColor = logoGradient(clamp(colorSeed, 0.0, 1.0));
  gradientColor *= 1.15;
  float lum = dot(gradientColor, vec3(0.299, 0.587, 0.114));
  gradientColor = mix(vec3(lum), gradientColor, 1.4);
  gradientColor = clamp(gradientColor, 0.0, 1.0);
  float reveal = texture2D(u_revealMap, vec2(uv.x, 1.0 - uv.y)).r;
  reveal = smoothstep(0.0, 0.4, reveal);
  vec3 finalColor = gradientColor;
  float alpha = reveal * 0.35;
  gl_FragColor = vec4(finalColor, alpha);
}`;

function createShader(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  return s;
}

const MAP_SIZE = 128;

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

export default function StartBuilding() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const mouseRef = useRef({ x: -1, y: -1, active: false });
  const [hasPointer, setHasPointer] = useState(false);

  useEffect(() => {
    setHasPointer(window.matchMedia("(pointer: fine)").matches);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const section = sectionRef.current;
    if (!section) return;
    const rect = section.getBoundingClientRect();
    mouseRef.current.x = e.clientX - rect.left;
    mouseRef.current.y = e.clientY - rect.top;
    mouseRef.current.active = true;
  }, []);

  const handleMouseLeave = useCallback(() => {
    mouseRef.current.active = false;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section || !hasPointer) return;

    const gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: false });
    if (!gl) return;

    // Compile shaders & link program
    const vert = createShader(gl, gl.VERTEX_SHADER, VERT_SRC);
    const frag = createShader(gl, gl.FRAGMENT_SHADER, FRAG_SRC);
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vert);
    gl.attachShader(prog, frag);
    gl.linkProgram(prog);
    gl.useProgram(prog);

    // Fullscreen quad
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );
    const aPos = gl.getAttribLocation(prog, "a_position");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    // Uniforms
    const uRes = gl.getUniformLocation(prog, "u_resolution");
    const uAngle = gl.getUniformLocation(prog, "u_angle");
    const uReveal = gl.getUniformLocation(prog, "u_revealMap");
    gl.uniform1f(uAngle, Math.random() * Math.PI * 2);
    gl.uniform1i(uReveal, 0);

    // Reveal map — paint canvas (small)
    const paintCanvas = document.createElement("canvas");
    paintCanvas.width = MAP_SIZE;
    paintCanvas.height = MAP_SIZE;
    const paintCtx = paintCanvas.getContext("2d")!;
    paintCtx.fillStyle = "#000";
    paintCtx.fillRect(0, 0, MAP_SIZE, MAP_SIZE);

    // Blurred output canvas — applies CSS filter blur then uploads to GL
    const blurCanvas = document.createElement("canvas");
    blurCanvas.width = MAP_SIZE;
    blurCanvas.height = MAP_SIZE;
    const blurCtx = blurCanvas.getContext("2d")!;
    blurCtx.filter = "blur(6px)";

    const tex = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    // Sizing
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let sectionW = section.offsetWidth;
    let sectionH = section.offsetHeight;

    const BLEED_PX = 192; // 12rem — how far the canvas extends above and below
    function resize() {
      sectionW = section!.offsetWidth;
      sectionH = section!.offsetHeight;
      const totalH = sectionH + BLEED_PX * 2;
      canvas!.width = sectionW * dpr;
      canvas!.height = totalH * dpr;
      canvas!.style.width = sectionW + "px";
      canvas!.style.height = totalH + "px";
      gl!.viewport(0, 0, canvas!.width, canvas!.height);
      gl!.uniform2f(uRes, canvas!.width, canvas!.height);
    }
    resize();
    window.addEventListener("resize", resize);

    section.addEventListener("mousemove", handleMouseMove);
    section.addEventListener("mouseleave", handleMouseLeave);

    // Animation loop
    function render() {
      // Decay — slow fade so trails linger
      paintCtx.fillStyle = "rgba(0, 0, 0, 0.02)";
      paintCtx.fillRect(0, 0, MAP_SIZE, MAP_SIZE);

      // Paint at mouse — compensate for section aspect ratio so glow is circular
      const m = mouseRef.current;
      if (m.active && m.x >= 0) {
        const totalH = sectionH + BLEED_PX * 2;
        const mx = (m.x / sectionW) * MAP_SIZE;
        const my = ((m.y + BLEED_PX) / totalH) * MAP_SIZE;
        const aspect = sectionW / totalH;
        const ry = 12 * aspect;
        const rx = 12;
        paintCtx.save();
        paintCtx.translate(mx, my);
        paintCtx.scale(1, aspect);
        const g = paintCtx.createRadialGradient(0, 0, 0, 0, 0, rx);
        g.addColorStop(0, "rgba(255, 255, 255, 0.12)");
        g.addColorStop(0.5, "rgba(255, 255, 255, 0.04)");
        g.addColorStop(1, "rgba(255, 255, 255, 0)");
        paintCtx.fillStyle = g;
        paintCtx.fillRect(-rx, -ry, rx * 2, ry * 2);
        paintCtx.restore();
      }

      // Blur pass — draw paintCanvas onto blurCanvas with CSS blur filter
      blurCtx.clearRect(0, 0, MAP_SIZE, MAP_SIZE);
      blurCtx.drawImage(paintCanvas, 0, 0);

      // Upload blurred reveal map to WebGL
      gl!.activeTexture(gl!.TEXTURE0);
      gl!.bindTexture(gl!.TEXTURE_2D, tex);
      gl!.texImage2D(
        gl!.TEXTURE_2D,
        0,
        gl!.RGBA,
        gl!.RGBA,
        gl!.UNSIGNED_BYTE,
        blurCanvas,
      );

      gl!.drawArrays(gl!.TRIANGLES, 0, 6);
      rafRef.current = requestAnimationFrame(render);
    }
    rafRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      section.removeEventListener("mousemove", handleMouseMove);
      section.removeEventListener("mouseleave", handleMouseLeave);
      gl.deleteProgram(prog);
      gl.deleteShader(vert);
      gl.deleteShader(frag);
      gl.deleteBuffer(buf);
      gl.deleteTexture(tex);
    };
  }, [handleMouseMove, handleMouseLeave, hasPointer]);

  return (
    <section
      ref={sectionRef}
      id="start-building"
      className="relative scroll-mt-24 py-24 lg:py-32"
    >
      {/* WebGL rainbow gradient with mouse reveal — desktop only */}
      {hasPointer && (
        <canvas
          ref={canvasRef}
          className="pointer-events-none absolute left-0 right-0"
          style={{ top: "-12rem", bottom: "-12rem" }}
          aria-hidden="true"
        />
      )}

      <Container className="relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          transition={{ staggerChildren: 0.06 }}
        >
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.4 }}
            className="mx-auto max-w-3xl text-center"
          >
            <p className="mb-4 font-mono text-xs font-medium tracking-wider text-white/30 uppercase">
              Start Building
            </p>
            <h2 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              Build on Livepeer through Daydream
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-white/50 text-pretty">
              Livepeer is an open GPU network for real-time AI video
              inference. To build applications on it today, use Daydream — a
              platform built on Livepeer that gives you an API for real-time
              generative video, style transfer, and more.
            </p>
            <div className="mt-8">
              <a
                href="https://daydream.live"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 rounded-lg px-6 py-3 text-sm font-medium text-white transition-all duration-200 animate-[ctaGlow_4s_ease-in-out_infinite] hover:brightness-125 active:brightness-95"
                style={{
                  background:
                    "linear-gradient(135deg, #1E9960 0%, #18794E 60%, #115C3B 100%)",
                }}
              >
                Start building with Daydream{" "}
                <span aria-hidden="true">↗</span>
              </a>
            </div>
            <p className="mt-4 text-xs text-white/25">
              Direct API access to the Livepeer network is coming.{" "}
              <a
                href={EXTERNAL_LINKS.discord}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/35 underline decoration-white/15 underline-offset-2 transition-colors hover:text-white/50"
              >
                Join Discord
              </a>{" "}
              to stay in the loop.
            </p>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}
