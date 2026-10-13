"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";
import { cn } from "@/lib/utils";

export type AgentHeroFilm = {
  /**
   * The film's name under /videos/agent: `<name>.av1.mp4` (AV1, 2560 wide),
   * `<name>-sm.av1.mp4` (AV1, 1280 wide, for phones) and `<name>.mp4`
   * (H.264, 1920 wide, for browsers without AV1), with `<name>.jpg` the
   * poster.
   */
  name: string;
  /**
   * Where the subject sits across the frame, as a percentage from the left,
   * so the narrow crops (the tall card on a phone, 4:3 on a tablet) follow it. The
   * films were composed with the subject right of centre for the headline
   * beside it, and centred crops cut it off at the edge.
   */
  focus: number;
  /** The models and length, as the credit names them. */
  model: string;
  /** The request that made it, in a person's words. */
  request: string;
};

const AV1 = 'video/mp4; codecs="av01.0.08M.08"';

/**
 * Which encode this browser should load: AV1 where it can decode it, at
 * phone or desktop width, and H.264 where it cannot. Read on the client and
 * null on the server, so nothing is fetched until the choice is made; the
 * posters stand in until then.
 */
function useVariant(): "av1" | "av1-sm" | "h264" | null {
  return useSyncExternalStore(
    (onChange) => {
      window.addEventListener("resize", onChange);
      return () => window.removeEventListener("resize", onChange);
    },
    () => {
      const av1 = document.createElement("video").canPlayType(AV1) !== "";
      if (!av1) return "h264";
      return window.innerWidth < 768 ? "av1-sm" : "av1";
    },
    () => null
  );
}

function urlFor(name: string, variant: "av1" | "av1-sm" | "h264") {
  const base = `/videos/agent/${name}`;
  if (variant === "av1") return `${base}.av1.mp4`;
  if (variant === "av1-sm") return `${base}-sm.av1.mp4`;
  return `${base}.mp4`;
}

/**
 * The hero: the Agent's own films in an inset card, each played through once
 * and crossfaded into the next, with the page's words set over the scrim at
 * the foot and the film's credit opposite — what was asked for, and on what.
 *
 * Inset rather than full-bleed, and cropped wide (2.35:1 from xl, 16:9 from
 * lg, 4:3 from sm, where 16:9 is too short for the words over it): a 1080p film stretched edge to edge across a large window and cropped
 * to its height looked soft, and a card is the design system's own frame. On
 * a phone the card fills the screen under the header, with the words over
 * its lower half, so the headline and the film are both in the first screen;
 * a 4:5 card with the words beneath it put the headline a scroll away. The
 * card is dark in both themes, because it is a picture.
 *
 * Only the first clip loads with the page; the rest are fetched once it is
 * playing. A row of bars over the credit fills as each clip plays and picks
 * one when pressed. It plays only while the card is on screen, and under
 * reduced motion it holds the first clip's poster and does not move on.
 */
export function AgentHeroFilms({
  films,
  children,
}: {
  films: AgentHeroFilm[];
  children: React.ReactNode;
}) {
  const [active, setActive] = useState(0);
  const [warm, setWarm] = useState(false);
  const [visible, setVisible] = useState(true);
  const still = usePrefersReducedMotion();
  const variant = useVariant();
  const root = useRef<HTMLDivElement>(null);
  const videos = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    const node = root.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) =>
      setVisible(entry.isIntersecting)
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Play the active clip from its start while the card is seen; hold the rest.
  useEffect(() => {
    videos.current.forEach((video, index) => {
      if (!video) return;
      if (index === active && visible && !still) {
        video.currentTime = 0;
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, [active, visible, still, variant]);

  const next = () => setActive((current) => (current + 1) % films.length);
  const film = films[active];

  // One bar per film: the playing one fills over its length, and pressing
  // one plays it.
  const bars = (width: string) => (
    <div className="flex justify-end gap-1.5" role="group" aria-label="Films">
      {films.map((entry, index) => (
        <button
          key={entry.name}
          type="button"
          aria-label={`Film ${index + 1} of ${films.length}`}
          aria-pressed={index === active}
          onClick={() => setActive(index)}
          className="py-2 outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span
            className={cn(
              "block h-0.5 overflow-hidden rounded-full bg-foreground/25",
              width
            )}
          >
            <span
              key={index === active ? `${active}-on` : "off"}
              className={cn(
                "block h-full origin-left bg-foreground",
                index === active
                  ? still || !visible
                    ? "scale-x-100"
                    : "animate-[bar-fill_8s_linear_forwards]"
                  : "scale-x-0"
              )}
            />
          </span>
        </button>
      ))}
    </div>
  );

  return (
    <div
      ref={root}
      className="dark relative overflow-hidden rounded-3xl bg-background text-foreground"
    >
      <div className="relative h-[max(34rem,calc(100svh-4.75rem))] sm:h-auto sm:aspect-[4/3] lg:aspect-video xl:aspect-[2.35/1]">
        {films.map((entry, index) => (
          <video
            key={entry.name}
            ref={(node) => {
              videos.current[index] = node;
            }}
            src={
              variant && (index === 0 || warm)
                ? urlFor(entry.name, variant)
                : undefined
            }
            poster={`/videos/agent/${entry.name}.jpg`}
            style={{ objectPosition: `${entry.focus}% 50%` }}
            aria-hidden="true"
            muted
            playsInline
            loop={films.length === 1}
            preload={index === 0 ? "auto" : "metadata"}
            onPlaying={index === 0 ? () => setWarm(true) : undefined}
            onEnded={index === active ? next : undefined}
            className={cn(
              "absolute inset-0 size-full object-cover transition-opacity duration-[1200ms] ease-out",
              index === active ? "opacity-100" : "opacity-0"
            )}
          />
        ))}
        {/* Scrims: up from the foot for the type, in from the left for the
            headline's side, so the picture stays clear above and right. On a
            phone the words take the lower half, so the first rises higher. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent to-70% sm:via-background/35 sm:to-75%"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 hidden bg-gradient-to-r from-background/60 via-transparent to-transparent sm:block"
        />
        {/* Below lg, a little shade at the head for the credit there. */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-background/55 to-transparent lg:hidden"
        />

        {/* The film's credit, from lg, where it has room beside the words. */}
        <div className="absolute right-10 bottom-10 hidden w-[17rem] text-right lg:block xl:right-14 xl:bottom-14">
          {films.length > 1 && <div className="mb-4">{bars("w-8")}</div>}
          <p
            key={active}
            aria-live="polite"
            className="animate-[fadeIn_0.8s_ease-out] text-sm leading-relaxed text-foreground/70"
          >
            <span className="block font-mono text-xs leading-5 text-foreground/50">
              Made with Livepeer Agent
              <br />
              {film.model}
            </span>
            <span className="mt-2 block text-pretty">
              &ldquo;{film.request}&rdquo;
            </span>
          </p>
        </div>

        {/* Below lg, a short credit and the bars at the picture's head,
            where the words cover its foot. Without them the films changed
            with nothing to say they were a set, or whose they were. */}
        <div className="absolute inset-x-5 top-5 flex items-start justify-between gap-4 sm:inset-x-8 sm:top-8 lg:hidden">
          <p
            key={active}
            aria-hidden="true"
            className="animate-[fadeIn_0.8s_ease-out] font-mono text-[0.6875rem] leading-4 text-foreground/60"
          >
            Made with Livepeer Agent
            <br />
            {film.model}
          </p>
          {films.length > 1 && bars("w-5")}
        </div>
      </div>

      {/* The page's words, over the foot of the picture. */}
      <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10 xl:p-14">
        {children}
      </div>
    </div>
  );
}
