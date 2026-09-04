"use client";

import { useEffect, useRef } from "react";
import { clock, effect, frameLoop, init, surface } from "vgpu";
import type { FrameLoopHandle } from "vgpu";

import { getCanvasThemePalette } from "@/components/canvas-theme";

import shader from "./contribute-graph.wgsl";

/**
 * A contribution graph as the ground of the contribute hero, rendered with
 * WebGPU through vgpu.
 *
 * It fills the hero, which runs up under the header, and the text sits in a
 * clearing: a CSS mask on the canvas fades the grid out around the headline
 * and toward the bottom, so the ground is loud at the edges and quiet where
 * the words are. The mask is CSS rather than shader because it has to shape
 * two things the same way — the empty grid painted in CSS behind the canvas,
 * which is what a browser with no WebGPU sees, and the shader's output. Once
 * the GPU is up the shader draws every cell and the CSS grid is dropped, so
 * nothing is drawn twice.
 *
 * The same three conventions the site's canvas pieces follow are kept:
 * colour comes from the theme tokens and follows a theme flip, reduced
 * motion draws one still frame, and the pixel ratio is capped at 1.5.
 */

/** CSS pixels. The shader holds the same numbers; change both. */
const PITCH = 14;
const CELL = 11;

/** A day with nothing on it: the foreground at a whisper. */
const EMPTY_ALPHA = 0.07;
/** Where the loop and the reduced-motion still frame both start from. */
const STILL_TIME = 40;

const EMPTY_CSS = `color-mix(in oklab, var(--foreground) ${EMPTY_ALPHA * 100}%, transparent)`;

/**
 * The fallback grid: one tile per PITCH square, the cell in its top-left
 * CELL px, the gap painted in the page background over the cell colour so a
 * translucent cell needs no second colour.
 */
const fallback: React.CSSProperties = {
  backgroundImage: [
    `linear-gradient(to right, transparent ${CELL}px, var(--background) ${CELL}px)`,
    `linear-gradient(to bottom, transparent ${CELL}px, var(--background) ${CELL}px)`,
    `linear-gradient(${EMPTY_CSS}, ${EMPTY_CSS})`,
  ].join(", "),
  backgroundSize: `${PITCH}px ${PITCH}px`,
  backgroundPosition: "center top",
};

/**
 * The clearing. An ellipse over the text block — sized in pixels, so on a
 * phone it spans the width and the grid survives only above the eyebrow —
 * intersected with a fade toward the bottom, where the buttons are.
 */
const clearing: React.CSSProperties = {
  maskImage: [
    "radial-gradient(ellipse 420px 210px at 50% 67%, transparent 45%, black 100%)",
    "linear-gradient(to bottom, black 53%, transparent 97%)",
  ].join(", "),
  maskComposite: "intersect",
  WebkitMaskComposite: "source-in",
};

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
    green: [...rgbOf(green, probe), 1],
    empty: [...rgbOf(foreground, probe), EMPTY_ALPHA],
  };
}

export function ContributeGraph() {
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
        // none: the CSS grid stays, and the graph is empty.
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
      const graph = effect(gpu, shader, {
        label: "contribute-graph",
        set: {
          params: {
            ...colours(probe),
            size: [1, 1],
            time: STILL_TIME,
            dpr: 1,
          },
        },
      });

      // The shader draws the empty cells too; from here the CSS grid would
      // only show through beneath them.
      canvas.style.backgroundImage = "none";
      cleanups.push(() => {
        canvas.style.backgroundImage = fallback.backgroundImage as string;
      });

      // Fires once immediately, then on every resize. The shader works in
      // device pixels, so the pitch scales with the ratio the surface chose.
      cleanups.push(
        target.onResize(({ width, height, dpr }) =>
          graph.set({ params: { size: [width, height], dpr } })
        )
      );

      // The theme toggle flips a class on <html>; re-read the tokens when it
      // does, the way the agent hero's particles do.
      const theme = new MutationObserver(() =>
        graph.set({ params: colours(probe) })
      );
      theme.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class", "data-theme"],
      });
      cleanups.push(() => theme.disconnect());

      if (reduceMotion) {
        graph.draw(target);
        return;
      }

      const time = clock(gpu);
      const start = () => {
        if (loop || !gpu) return;
        loop = frameLoop(gpu, (frame) => {
          graph.set({ params: { time: STILL_TIME + time.time } });
          frame.pass(target, graph);
        });
      };
      const stop = () => {
        loop?.stop();
        loop = undefined;
      };

      // Animate only while on screen and while the tab is visible — a ground
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
    // Width and height are explicit because an absolutely positioned canvas
    // with `width: auto` takes its intrinsic size and ignores `right` — and
    // the surface then sizes the canvas to the element, which is a loop.
    <canvas
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{ ...fallback, ...clearing }}
    />
  );
}
