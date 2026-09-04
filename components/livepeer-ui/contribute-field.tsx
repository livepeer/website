"use client";

import { useEffect, useRef } from "react";
import { clock, effect, frameLoop, init, surface } from "vgpu";
import type { FrameLoopHandle } from "vgpu";

import { getCanvasThemePalette } from "@/components/canvas-theme";

import shader from "./contribute-field.wgsl";

/**
 * The field behind the contribute hero, rendered with WebGPU through vgpu.
 *
 * Where there is no WebGPU — no `navigator.gpu`, or an adapter that will not
 * come up — this renders nothing and the hero is exactly the page it was
 * before, which is the fallback a decorative layer should have. The same
 * three conventions the site's canvas pieces already follow are kept: colour
 * comes from the theme tokens and follows a theme flip, reduced motion draws
 * one still frame rather than nothing, and the pixel ratio is capped so a
 * retina display is not asked for four times the fragments.
 */

/** The grey dots at a hairline's weight; the green ones nearly solid. */
const DIM_ALPHA = 0.35;
const ACCENT_ALPHA = 0.9;
/** Dot pitch in CSS pixels; scaled by the surface's pixel ratio. */
const CELL = 5;
/** Where the loop and the reduced-motion still frame both start from. */
const STILL_TIME = 40;

/**
 * A CSS colour — the tokens are oklch, the green is display-p3 — as 0..1 RGB,
 * by painting it onto a one-pixel canvas and reading it back. The browser
 * does the colour-space work, so the tokens stay the single source.
 */
function rgbOf(
  css: string,
  probe: CanvasRenderingContext2D
): [number, number, number] {
  probe.clearRect(0, 0, 1, 1);
  probe.fillStyle = css;
  probe.fillRect(0, 0, 1, 1);
  const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;
  return [r / 255, g / 255, b / 255];
}

function colours(probe: CanvasRenderingContext2D) {
  const [foreground, , , , green] = getCanvasThemePalette();
  return {
    dim: [...rgbOf(foreground, probe), DIM_ALPHA],
    accent: [...rgbOf(green, probe), ACCENT_ALPHA],
  };
}

export function ContributeField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !("gpu" in navigator)) return;

    const probeCanvas = document.createElement("canvas");
    probeCanvas.width = 1;
    probeCanvas.height = 1;
    const probe = probeCanvas.getContext("2d", { willReadFrequently: true });
    if (!probe) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let disposed = false;
    let gpu: Awaited<ReturnType<typeof init>> | undefined;
    let loop: FrameLoopHandle | undefined;
    const cleanups: (() => void)[] = [];

    void (async () => {
      try {
        gpu = await init();
      } catch {
        // WebGPU is present but no adapter came up. Same outcome as having
        // none: the hero stands on its own.
        return;
      }
      if (disposed) {
        gpu.dispose();
        return;
      }

      const target = surface(gpu, canvas, {
        dpr: [1, 1.5],
        alphaMode: "premultiplied",
      });
      const field = effect(gpu, shader, {
        label: "contribute-field",
        set: {
          params: {
            ...colours(probe),
            size: [1, 1],
            time: STILL_TIME,
            cell: CELL,
            fade: 0.45,
          },
        },
      });

      // Fires once immediately, then on every resize. The shader works in
      // device pixels, so the pitch scales with the ratio the surface chose.
      cleanups.push(
        target.onResize(({ width, height, dpr }) =>
          field.set({ params: { size: [width, height], cell: CELL * dpr } })
        )
      );

      // The theme toggle flips a class on <html>; re-read the tokens when it
      // does, the way the agent hero's particles do.
      const theme = new MutationObserver(() =>
        field.set({ params: colours(probe) })
      );
      theme.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class", "data-theme"],
      });
      cleanups.push(() => theme.disconnect());

      if (reduceMotion) {
        field.draw(target);
        return;
      }

      const time = clock(gpu);
      const start = () => {
        if (loop || !gpu) return;
        loop = frameLoop(gpu, (frame) => {
          field.set({ params: { time: STILL_TIME + time.time } });
          frame.pass(target, field);
        });
      };
      const stop = () => {
        loop?.stop();
        loop = undefined;
      };

      // Animate only while on screen and while the tab is visible — a hero
      // scrolled past should cost nothing.
      const seen = new IntersectionObserver(([entry]) => {
        if (entry?.isIntersecting && !document.hidden) start();
        else stop();
      });
      seen.observe(canvas);
      cleanups.push(() => seen.disconnect());

      const onVisibility = () => {
        if (document.hidden) stop();
        else start();
      };
      document.addEventListener("visibilitychange", onVisibility);
      cleanups.push(() =>
        document.removeEventListener("visibilitychange", onVisibility)
      );
    })();

    // Strict mode mounts twice in development; without stop() and dispose()
    // each remount would leak a device and a loop.
    return () => {
      disposed = true;
      for (const cleanup of cleanups) cleanup();
      loop?.stop();
      gpu?.dispose();
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}
