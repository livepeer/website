import { cn } from "@/lib/utils";

/**
 * A chevron that grows into an arrow on hover.
 *
 * x.ai's hero button, rebuilt. Theirs is three <line>s: the two diagonals of a
 * chevron, plus a zero-length line at the tip held at opacity 0, which extends
 * leftward on hover so the chevron becomes a full arrow. The point of it is
 * that nothing moves position — the head stays put and the shaft arrives, so
 * the button reads as "go" only once you have committed to it.
 *
 * Theirs animates the x1 geometry attribute directly. That is a real CSS
 * property in SVG2 and Chrome transitions it, but Firefox does not, so the
 * shaft here is a full-length line scaled to nothing from its right end.
 * Transforms animate everywhere, and the result is identical.
 *
 * Requires `group/cta` on the button.
 */
export function CtaArrow({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cn(
        // The whole glyph also drifts right as the shaft arrives — the shaft
        // alone reads as the icon changing shape, the nudge makes it read as
        // the arrow setting off. transition-[translate], because Tailwind v4's
        // translate-x-* sets the standalone `translate` property, so animating
        // `transform` here would do nothing.
        // size-5, matching x.ai's hero button. The chevron is mostly negative
        // space, so it carries less weight than a solid icon at the same box
        // and reads small next to the label at 16px.
        "size-5 shrink-0 transition-[translate] duration-200 ease-out group-hover/cta:translate-x-0.5 motion-reduce:transition-none",
        className
      )}
    >
      {/* The shaft. Origin at the arrowhead so it unfurls backwards from the
          tip rather than sliding in from the left. */}
      <line
        x1="8"
        y1="12"
        x2="15"
        y2="12"
        // transition-[scale,...], not transform: Tailwind v4's scale-x-*
        // utilities set the standalone `scale` property, so transitioning
        // `transform` animates nothing and the shaft snaps open while only the
        // opacity fades.
        className="origin-[15px_12px] scale-x-0 opacity-0 transition-[scale,opacity] duration-200 ease-out group-hover/cta:scale-x-100 group-hover/cta:opacity-100 motion-reduce:transition-none"
      />
      <line x1="11" y1="8" x2="15" y2="12" />
      <line x1="11" y1="16" x2="15" y2="12" />
    </svg>
  );
}
