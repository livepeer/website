import { HEALTH_LABEL, type HealthOrNone } from "@/lib/health";
import { cn } from "@/lib/utils";

/**
 * Health, the way Linear shows it: a dot, then the word.
 *
 * Linear's dots are green, yellow, red and grey. Here green is never a
 * status colour and the chart roles are greyscale, so the scale is drawn in
 * weight rather than hue: On track is a quiet dot, At risk a full one, Off
 * track the one destructive colour the system has, and No update a hollow
 * ring — the mark for nothing having been said. The word is always beside
 * the dot, so the dot only has to support it.
 */
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
        health === "on-track" && "bg-muted-foreground/70",
        health === "at-risk" && "bg-foreground",
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
        health === "at-risk" && "text-foreground",
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
