"use client";

import * as React from "react";

import {
  LivepeerLockup,
  LivepeerSymbol,
  LivepeerWordmark,
} from "@/components/brand";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ *
 * The two client pieces of the brand page. Everything else is static.
 * ------------------------------------------------------------------ */

type Ink = "black" | "white";

/**
 * The mark in both inks, on one switch.
 *
 * The rule is "black or white only", so the plates show exactly those two
 * and nothing else. Ink is expressed through the theme's pair rather than
 * literal colours: a black mark is `foreground` on `background` in light and
 * `background` on `foreground` in dark, so the plates stay honest in both
 * themes without a second set of values.
 */
const PLATE: Record<Ink, string> = {
  black:
    "bg-background text-foreground dark:bg-foreground dark:text-background",
  white:
    "bg-foreground text-background dark:bg-background dark:text-foreground",
};

const MARKS = [
  {
    name: "Lockup",
    note: "Symbol and wordmark in fixed relation.",
    file: "livepeer-lockup",
    wide: true,
    render: (
      <LivepeerLockup className="h-7 w-auto sm:h-10" aria-hidden="true" />
    ),
  },
  {
    name: "Symbol",
    note: "Where the name is already established.",
    file: "livepeer-symbol",
    wide: false,
    render: (
      <LivepeerSymbol className="h-14 w-auto sm:h-16" aria-hidden="true" />
    ),
  },
  {
    name: "Wordmark",
    note: "Wherever the name has to be read.",
    file: "livepeer-wordmark",
    wide: false,
    render: (
      <LivepeerWordmark className="h-6 w-auto sm:h-7" aria-hidden="true" />
    ),
  },
];

export function MarkPlates() {
  const [ink, setInk] = React.useState<Ink>("black");
  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          Three forms. Every file is the source vector.
        </p>
        <InkSwitch value={ink} onChange={setInk} />
      </div>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {MARKS.map((mark) => (
          <li key={mark.name} className={cn(mark.wide && "sm:col-span-2")}>
            <div
              className={cn(
                "flex items-center justify-center rounded-lg border border-border transition-colors duration-300",
                mark.wide ? "aspect-[2/1] sm:aspect-[3/1]" : "aspect-[3/2]",
                PLATE[ink]
              )}
            >
              {mark.render}
            </div>
            <div className="mt-3 flex items-baseline justify-between gap-4 px-1">
              <p className="text-sm">
                {mark.name}
                <span className="ml-2 text-muted-foreground">{mark.note}</span>
              </p>
              <a
                href={`/brand-assets/${mark.file}-${ink}.svg`}
                download
                className="shrink-0 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                SVG ↓
              </a>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function InkSwitch({
  value,
  onChange,
}: {
  value: Ink;
  onChange: (ink: Ink) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Ink"
      className="inline-flex shrink-0 rounded-full bg-muted p-0.5"
    >
      {(["black", "white"] as Ink[]).map((ink) => (
        <button
          key={ink}
          type="button"
          role="radio"
          aria-checked={value === ink}
          onClick={() => onChange(ink)}
          className={cn(
            "cursor-pointer rounded-full px-3 py-1 text-xs capitalize transition-colors",
            value === ink
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {ink}
        </button>
      ))}
    </div>
  );
}

/**
 * A type specimen you can type into.
 *
 * A face is judged on your own words, not ours. The line is editable in
 * place, with nothing saved and nothing sent; reload and it is ours again.
 */
export function Specimen({
  text,
  className,
}: {
  text: string;
  className: string;
}) {
  return (
    <p
      contentEditable
      suppressContentEditableWarning
      spellCheck={false}
      aria-label="Editable specimen"
      className={cn(
        "rounded-sm text-pretty outline-none focus-visible:ring-3 focus-visible:ring-ring/30",
        className
      )}
    >
      {text}
    </p>
  );
}
