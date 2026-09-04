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
const EMPTY_ALPHA = 0.04;
/**
 * Where the loop and the reduced-motion still frame both start from. A whole
 * number of the shader's ten-second weeks, so the drift is a whole number of
 * columns and the grid lands exactly on the CSS fallback's cells.
 */
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
 * intersected with a long fade that starts under the buttons and reaches
 * the canvas's foot, well into the next section, and a fade at either side,
 * so the field thins out before the viewport edge rather than being cut by
 * it. Anchored in pixels from the top, not percentages: the canvas is far
 * taller than the hero, and the hero is what the anchors are about. Wide,
 * with a long falloff: the whole block from eyebrow to buttons should sit on
 * faded ground, not just the headline, or the description reads over cells.
 * The radii are CSS variables set by responsive classes on the canvas, since
 * an inline style has no breakpoints: smaller below sm, where the desktop
 * ellipse would also fade the rows above the eyebrow, the only ones a phone
 * keeps.
 */
const clearing: React.CSSProperties = {
  maskImage: [
    "radial-gradient(ellipse var(--clearing-x) var(--clearing-y) at 50% 290px, transparent 35%, black 100%)",
    "linear-gradient(to bottom, black 430px, transparent 100%)",
    "linear-gradient(to right, transparent, black 14%, black 86%, transparent)",
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

/**
 * The brand green's hue in OKLCH, so light's ramp can be written as
 * lightness and chroma at that hue rather than derived by mixing.
 */
const GREEN_HUE = 157.5;

/**
 * The palette, and the ramp the theme needs.
 *
 * What makes the real graph's ramp read is that each step is more colourful
 * as well as lighter or darker. Over a dark ground the green's alpha does
 * that on its own — lightness and chroma climb together — so dark's levels
 * are the green at four opacities over the background, topping out well
 * short of the full green: this is a ground, and a ground stays quiet.
 * Over a light ground alpha only pales it, and mixing toward black bleeds
 * chroma so the top level goes dull, so light's levels are stated directly
 * in OKLCH at the green's hue, darker and more saturated with each step —
 * but never below L 0.74: a dark green tile on white reads as a stain, not
 * a light, and the range is narrower than dark's on purpose.
 * Which ground it is comes from the background token's luminance, not the
 * class on <html>, so a third theme would sort itself. The browser resolves
 * every colour, including gamut, through the probe.
 */
function colours(probe: CanvasRenderingContext2D) {
  const [foreground, , , , green] = getCanvasThemePalette();
  const [background] = getCanvasThemePalette(true);
  const [r, g, b] = rgbOf(background, probe);
  const dark = 0.2126 * r + 0.7152 * g + 0.0722 * b < 0.5;
  const levels = dark
    ? [20, 36, 54, 72].map(
        (pct) => `color-mix(in srgb, ${green} ${pct}%, ${background})`
      )
    : [
        [0.92, 0.06],
        [0.86, 0.09],
        [0.8, 0.115],
        [0.74, 0.13],
      ].map(([l, c]) => `oklch(${l} ${c} ${GREEN_HUE})`);
  const [level1, level2, level3, level4] = levels.map((css) => [
    ...rgbOf(css, probe),
    1,
  ]);
  return {
    empty: [...rgbOf(foreground, probe), EMPTY_ALPHA],
    level1,
    level2,
    level3,
    level4,
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
    // The height reaches 24rem past the section, through the ladder's rule,
    // heading and intro, so the ground bleeds into the page rather than
    // stopping at the hero; the mask has it gone before the rows. The ladder
    // is positioned so its text paints over the canvas, not under it.
    <canvas
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 h-[calc(100%+24rem)] w-full [--clearing-x:400px] [--clearing-y:220px] sm:[--clearing-x:560px] sm:[--clearing-y:290px]"
      style={{ ...fallback, ...clearing }}
    />
  );
}
