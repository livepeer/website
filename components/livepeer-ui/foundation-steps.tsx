"use client";

import Link from "next/link";
import { RouteIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import type { FoundationWorkItem } from "@/components/livepeer-ui/livepeer-foundation-sections";

import {
  HealthMark,
  ShippedMark,
  StateMark,
} from "@/components/livepeer-ui/health";
import { STALE_AFTER_DAYS } from "@/lib/health";

/**
 * The Foundation page's scroll-lit lists, one beside each chapter and drawn
 * in one idiom so the chapters read as one page: a spine down the left with a marker
 * per step, and open type beside it — a small mono label, a title, one line.
 * Each step lights as it reaches the middle of the screen and stays lit, and
 * the spine draws down to the next as it does, so the scroll walks the reader
 * through the list beside the pinned statement. Lit from the first render
 * and under reduced motion, so nothing depends on it.
 *
 * The funding ladder was five boxed cards with meters first, and the roadmap
 * a ruled list, and beside this timeline both read as heavier and less
 * considered (Adam).
 */

export type Step = {
  /** The small mono line over the title: when, or how much. */
  label: string;
  title: string;
  /** Where the title goes, when the step is a record of its own. */
  href?: string;
  line?: string;
  marks?: React.ReactNode;
};

function useReached(count: number) {
  const list = useRef<HTMLOListElement>(null);
  // Everything lit until the effect has run, so the server render, a reader
  // without script and reduced motion all see the whole thing.
  const [reached, setReached] = useState(count - 1);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const items = [...(list.current?.children ?? [])] as HTMLElement[];
    // Steps above the middle on arrival stay lit; the rest wait for the scroll.
    const middle = window.innerHeight / 2;
    const start = items.filter(
      (item) => item.getBoundingClientRect().top < middle
    ).length;
    setReached(start - 1);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const index = items.indexOf(entry.target as HTMLElement);
          setReached((current) => Math.max(current, index));
        }
      },
      { rootMargin: "0px 0px -50% 0px" }
    );
    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  return { list, reached };
}

/** Marker column width; the spine runs down its centre. */
const MARKER = 15;

function ScrollSteps({
  steps,
  marker,
  labelClassName = "text-muted-foreground",
}: {
  steps: Step[];
  /** The marker for step `index`, lit or not. */
  marker: (index: number, lit: boolean) => React.ReactNode;
  labelClassName?: string;
}) {
  const { list, reached } = useReached(steps.length);
  return (
    <ol ref={list} className="relative">
      {steps.map((step, index) => {
        const lit = index <= reached;
        const last = index === steps.length - 1;
        return (
          <li key={step.title} className="relative flex gap-6 pb-12 last:pb-0">
            {/* The spine: drawn down to the next step once that one is lit. */}
            {!last && (
              <span
                aria-hidden="true"
                className="absolute top-4 bottom-0 w-px bg-border"
                style={{ left: (MARKER - 1) / 2 }}
              >
                <span
                  className={`block h-full w-full origin-top bg-foreground transition-transform duration-700 ease-out ${index < reached ? "scale-y-100" : "scale-y-0"}`}
                />
              </span>
            )}
            <span
              aria-hidden="true"
              className="relative mt-1 flex shrink-0 items-start justify-center"
              style={{ width: MARKER, height: MARKER }}
            >
              {marker(index, lit)}
            </span>
            <div
              className={`transition-opacity duration-500 ${lit ? "opacity-100" : "opacity-40"}`}
            >
              <p className={`font-mono text-xs ${labelClassName}`}>
                {step.label}
              </p>
              <h3 className="mt-2 text-lg font-medium tracking-tight text-balance">
                {step.href ? (
                  <Link
                    href={step.href}
                    className="underline decoration-transparent underline-offset-4 transition-colors hover:decoration-muted-foreground"
                  >
                    {step.title}
                  </Link>
                ) : (
                  step.title
                )}
              </h3>
              {step.line && (
                <p className="mt-1.5 max-w-md text-base leading-relaxed text-pretty text-muted-foreground">
                  {step.line}
                </p>
              )}
              {step.marks && (
                <p className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                  {step.marks}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

const LIT = "border-foreground bg-foreground";
const UNLIT = "border-border bg-background";

/**
 * How a commitment is held to account, as the life of one in three steps:
 * committed, reported on every month (and shown when the reports stop), and
 * closed with a retrospective. Five steps came first, with silence and the
 * changelog as steps of their own, and read as more than the idea (Adam).
 * Drawn with the roadmap's own marks, so a reader who goes on to the roadmap
 * recognises them there.
 *
 * It is the process, not a record: the Roadmap updates database has no rows
 * yet, and a timeline of invented updates on a real commitment would be a
 * claim nobody made. Once teams post, a real record can take its place.
 */
const ACCOUNTABILITY: Step[] = [
  {
    label: "When it's committed",
    title: "It goes on the roadmap",
    line: "With an owner who answers for it, a target, and where its funding comes from.",
  },
  {
    label: "Every month",
    title: "The owner reports",
    line: `Where it stands, in their own words. After ${Math.round(STALE_AFTER_DAYS / 7)} weeks without one the roadmap says so, and the changelog lists who hasn't posted.`,
    marks: (
      <>
        <HealthMark health="on-track" />
        <HealthMark health="at-risk" />
        <HealthMark health="off-track" />
        <HealthMark health="no-update" />
      </>
    ),
  },
  {
    label: "When it ships",
    title: "It closes with a retrospective",
    line: "What was delivered against what was promised, and what was learned.",
    marks: <ShippedMark className="text-muted-foreground" />,
  },
];

/** A round marker, for the steps that are events rather than rungs. */
function dot(_: number, lit: boolean) {
  return (
    <span
      className={`size-full rounded-full border transition-colors duration-500 ${lit ? LIT : UNLIT}`}
    />
  );
}

export function AccountabilityTimeline() {
  return <ScrollSteps steps={ACCOUNTABILITY} marker={dot} />;
}

/**
 * Which of a set of items has reached the middle of the screen, each on its
 * own: for things where nothing comes first, so one lights when it is
 * reached rather than with a spine drawn down to it.
 */
function useSeen(count: number) {
  const list = useRef<HTMLUListElement>(null);
  // All seen until the effect has run, for the same reasons as useReached.
  const [seen, setSeen] = useState<boolean[]>(() => Array(count).fill(true));

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const items = [...(list.current?.children ?? [])] as HTMLElement[];
    const middle = window.innerHeight / 2;
    setSeen(items.map((item) => item.getBoundingClientRect().top < middle));
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const index = items.indexOf(entry.target as HTMLElement);
          setSeen((current) =>
            current[index] ? current : current.map((v, i) => v || i === index)
          );
        }
      },
      { rootMargin: "0px 0px -50% 0px" }
    );
    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  return { list, seen };
}

/**
 * The roadmap's open items in the same type and the same lighting, as one
 * list with no spine: they are under way at once, and a line through them
 * said "first this, then that" (Adam). Two columns were tried and halved the
 * height the pinned statement scrolls against, in a column too narrow to
 * split; one list matches the chapters either side. They read as roadmap items because
 * they are drawn in the roadmap's own words: a caption with the roadmap's
 * route glyph and how many are open, and on each item the state mark its
 * card carries (the green dot and "In progress", or "Planned") beside who
 * owns it — on the roadmap the owner is the party answerable, and listed
 * bare here another body's work would read as the Foundation's. Then the
 * title, which opens the record, and the outcome it promises where it has
 * one. No health, no dates (Adam: the roadmap is a list here).
 */
export function RoadmapSteps({ items }: { items: FoundationWorkItem[] }) {
  const { list, seen } = useSeen(items.length);
  return (
    <div>
      <p className="flex items-center gap-2 border-b border-border pb-4 text-sm text-muted-foreground">
        <RouteIcon className="size-4" aria-hidden="true" />
        <span className="text-foreground">On the roadmap</span>
        <span>
          {items.length} {items.length === 1 ? "commitment" : "commitments"}{" "}
          open
        </span>
      </p>
      <ul ref={list} className="mt-10 grid gap-12">
        {items.map((item, index) => (
          <li
            key={item.slug}
            className={`transition-opacity duration-500 ${seen[index] ? "opacity-100" : "opacity-40"}`}
          >
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
              <StateMark state={item.state} />
              <span aria-hidden="true">·</span>
              <span>{item.owner}</span>
            </p>
            <h3 className="mt-3 text-lg font-medium tracking-tight text-balance">
              <Link
                href={`/roadmap/${item.slug}`}
                className="underline decoration-transparent underline-offset-4 transition-colors hover:decoration-muted-foreground"
              >
                {item.title}
              </Link>
            </h3>
            {item.outcome && (
              <p className="mt-1.5 text-base leading-relaxed text-pretty text-muted-foreground">
                {item.outcome}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * The ways to funding, smallest first, on the same spine. The marker is a
 * square — the field's own unit, as the Venn is drawn in — that grows a step
 * with each rung, so "from a single bounty to a treasury vote" is drawn
 * rather than said; its size is the rung's place in the order, not an
 * amount. The amount is the label, in the foreground, since it is what a
 * builder weighs a path by (Adam), and the line is who the path is for.
 */
export function FundingLadder({
  paths,
}: {
  paths: { name: string; bestFor: string; ceiling: string }[];
}) {
  const smallest = 5;
  const step = (MARKER - smallest) / Math.max(paths.length - 1, 1);
  return (
    <ScrollSteps
      steps={paths.map((path) => ({
        label: path.ceiling,
        title: path.name,
        line: path.bestFor,
      }))}
      labelClassName="text-foreground"
      marker={(index, lit) => {
        const size = Math.round(smallest + step * index);
        return (
          <span
            className={`block border transition-colors duration-500 ${lit ? LIT : UNLIT}`}
            // Centred on the spine and on the marker's own top half, so a
            // small square sits where a large one's centre would.
            style={{
              width: size,
              height: size,
              marginTop: (MARKER - size) / 2,
            }}
          />
        );
      }}
    />
  );
}
