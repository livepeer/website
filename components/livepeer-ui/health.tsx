import { HEALTH_LABEL, type HealthOrNone } from "@/lib/health";
import { cn } from "@/lib/utils";

/**
 * Health, drawn the way Linear draws it: a small disc tinted in the
 * scale's colour with a line glyph inside — rising for On track, a wobble
 * for At risk, falling for Off track — and the word beside it in the same
 * colour. Green, yellow, red, and grey with a flat line for nothing said.
 *
 * The one place on the site a colour scale carries meaning. The rule that
 * green is brand expression rather than a status colour holds everywhere
 * else, and the roadmap already bends it once for the "In progress" dot;
 * health is that state's own weather, so it reads in the same green. No
 * new tokens: green is the brand colour with the roadmap's light-mode mix,
 * red is `destructive`, and yellow is the point between the two on the
 * oklch hue wheel — the scale is drawn from the two colours the system
 * already has, and the one that lies between them. Each is set once as
 * `--health` on the mark, and the disc and the word both read it.
 *
 * The glyphs are three-segment polylines rather than library icons: no
 * icon set has Linear's three, and a picture this small is a drawing, not
 * an icon.
 */
const TONE: Record<HealthOrNone, string> = {
  "on-track":
    "[--health:color-mix(in_oklch,var(--color-brand),black_28%)] dark:[--health:var(--color-brand)]",
  // One mix, no nesting — Tailwind drops an arbitrary value with a
  // color-mix inside a color-mix. It still lands darker in light mode
  // because `destructive` does, and that is the half that carries it.
  "at-risk":
    "[--health:color-mix(in_oklch,var(--color-brand),var(--destructive)_55%)]",
  "off-track": "[--health:var(--destructive)]",
  "no-update": "[--health:var(--muted-foreground)]",
};

const GLYPH: Record<HealthOrNone, string> = {
  "on-track": "M3.5 10.5 L6.5 6.5 L9 9 L12.5 5",
  "at-risk": "M3.5 7.5 L6.5 11 L9.5 5.5 L12.5 8.5",
  "off-track": "M3.5 5.5 L6.5 9.5 L9 6.5 L12.5 11",
  "no-update": "M4 8 L12 8",
};

export function HealthIcon({
  health,
  className,
}: {
  health: HealthOrNone;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex size-4 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_oklch,var(--health),transparent_82%)] text-[var(--health)]",
        TONE[health],
        className
      )}
    >
      <svg
        viewBox="0 0 16 16"
        className="size-3"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={GLYPH[health]} />
      </svg>
    </span>
  );
}

/**
 * Shipped, in the same idiom: the disc with a tick, in the foreground
 * rather than a colour, because done is not a health — it is the end of
 * having one.
 */
export function ShippedIcon({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex size-4 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_oklch,var(--health),transparent_82%)] text-[var(--health)] [--health:var(--foreground)]",
        className
      )}
    >
      <svg
        viewBox="0 0 16 16"
        className="size-3"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3.5 8.5 L6.5 11.5 L12.5 5" />
      </svg>
    </span>
  );
}

export function ShippedMark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <ShippedIcon />
      Shipped
    </span>
  );
}

export function HealthMark({
  health,
  className,
}: {
  health: HealthOrNone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-[var(--health)]",
        TONE[health],
        className
      )}
    >
      <HealthIcon health={health} />
      {HEALTH_LABEL[health]}
    </span>
  );
}
