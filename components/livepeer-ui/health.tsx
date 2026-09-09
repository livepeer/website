import { HEALTH_LABEL, type HealthOrNone } from "@/lib/health";
import { cn } from "@/lib/utils";

/**
 * Health, the way Linear shows it: a dot, then the word, both in the
 * colour of the scale — green, yellow, red, and grey for nothing said.
 *
 * The one place on the site a colour scale carries meaning. The rule that
 * green is brand expression rather than a status colour holds everywhere
 * else, and the roadmap already bends it once for the "In progress" dot;
 * health is that state's own weather, so it reads in the same green. No
 * new tokens: green is the brand colour with the same light-mode mix the
 * roadmap uses, red is `destructive`, and yellow is the point between the
 * two on the oklch hue wheel — the scale is drawn from the two colours the
 * system already has, and the one that lies between them.
 */
const GREEN = {
  dot: "bg-[color-mix(in_oklch,var(--color-brand),black_28%)] dark:bg-brand",
  text: "text-[color-mix(in_oklch,var(--color-brand),black_28%)] dark:text-brand",
};

const AMBER = {
  dot: "bg-[color-mix(in_oklch,color-mix(in_oklch,var(--color-brand),var(--destructive)_55%),black_22%)] dark:bg-[color-mix(in_oklch,var(--color-brand),var(--destructive)_55%)]",
  text: "text-[color-mix(in_oklch,color-mix(in_oklch,var(--color-brand),var(--destructive)_55%),black_22%)] dark:text-[color-mix(in_oklch,var(--color-brand),var(--destructive)_55%)]",
};

export function HealthDot({
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
        "inline-block size-1.5 shrink-0 rounded-full",
        health === "on-track" && GREEN.dot,
        health === "at-risk" && AMBER.dot,
        health === "off-track" && "bg-destructive",
        health === "no-update" && "border border-muted-foreground/70",
        className
      )}
    />
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
        "inline-flex items-center gap-2",
        health === "on-track" && GREEN.text,
        health === "at-risk" && AMBER.text,
        health === "off-track" && "text-destructive",
        health === "no-update" && "text-muted-foreground",
        className
      )}
    >
      <HealthDot health={health} />
      {HEALTH_LABEL[health]}
    </span>
  );
}
