"use client";

import { useEffect, useRef } from "react";

import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";
import { cn } from "@/lib/utils";

export type AgentShowcaseItem = {
  /** What kind of video it is. */
  kind: string;
  /** The model that rendered it, as the caption names it. */
  model: string;
  /** The request, in a person's words. */
  request: string;
  /** Width over height, so the clip is shown in the shape it was made in. */
  aspect: number;
  src: string;
  poster: string;
  label: string;
};

/**
 * Three things the Agent made, hung as a set: each clip in the shape it was
 * made in, bottom-aligned like frames on a wall, so a vertical ad rises taller
 * than the widescreen work beside it; under each, on one shared line, what
 * kind of video it is, the model that rendered it, and the request that asked
 * for it. The work and the words that made it, and nothing else.
 *
 * Every clip cropped to one portrait card came first and made the vertical ad
 * the same shape as the film, which is the one thing it exists to show; a
 * carousel with a mocked-up prompt box before that read as a widget competing
 * with the work. A vertical clip takes a column a little over half the width
 * of a widescreen one, which keeps its height in proportion to the row
 * without shrinking the films. Below sm the row scrolls sideways,
 * bottom-aligned the same way, with the next clip peeking in. Clips play
 * silently while the row is on screen; under reduced motion the posters
 * stand still.
 */
export function AgentShowcase({ items }: { items: AgentShowcaseItem[] }) {
  const row = useRef<HTMLUListElement>(null);
  const still = usePrefersReducedMotion();

  useEffect(() => {
    const node = row.current;
    if (!node || still) return;
    const videos = [...node.querySelectorAll("video")];
    const observer = new IntersectionObserver(
      ([entry]) => {
        for (const video of videos) {
          if (entry.isIntersecting) video.play().catch(() => {});
          else video.pause();
        }
      },
      { threshold: 0.25 }
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      videos.forEach((video) => video.pause());
    };
  }, [still]);

  // A tall clip gets a narrower column than a wide one.
  const columns = items
    .map((item) => (item.aspect < 1 ? "1fr" : "1.65fr"))
    .join(" ");

  return (
    <ul
      ref={row}
      style={{ "--cols": columns } as React.CSSProperties}
      className="-mx-4 flex snap-x snap-mandatory scroll-px-4 items-end gap-4 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-[var(--cols)] sm:grid-rows-[auto_auto] sm:gap-x-6 sm:gap-y-0 sm:overflow-visible sm:px-0"
    >
      {items.map((item) => (
        <li
          key={item.kind}
          className={cn(
            "flex shrink-0 snap-start flex-col sm:row-span-2 sm:grid sm:w-auto sm:grid-rows-subgrid",
            item.aspect < 1 ? "w-[46%]" : "w-[82%]"
          )}
        >
          {/* The figure gives way to the row's two tracks, so every clip
              sits on one baseline and every caption starts on one line. */}
          <figure className="contents">
            <div
              className="relative w-full overflow-hidden rounded-xl bg-muted sm:self-end"
              style={{ aspectRatio: String(item.aspect) }}
            >
              <video
                src={item.src}
                poster={item.poster}
                aria-label={item.label}
                muted
                loop
                playsInline
                preload="metadata"
                className="absolute inset-0 size-full object-cover"
              />
            </div>
            <figcaption className="mt-4">
              <p className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 text-sm">
                <span className="text-foreground">{item.kind}</span>
                <span className="font-mono text-xs text-muted-foreground">
                  {item.model}
                </span>
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-pretty text-muted-foreground">
                &ldquo;{item.request}&rdquo;
              </p>
            </figcaption>
          </figure>
        </li>
      ))}
    </ul>
  );
}
