import { ArrowUpRightIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * The mark that says "this leaves the site".
 *
 * A stroked icon rather than the ↗ glyph the registry uses inline. The glyph
 * inherits the label's weight and colour, so at 500 next to 14px text it reads
 * as another character in the phrase; x.ai's version — the reference here — is
 * lighter than its label and set apart from it, so it reads as an annotation
 * on the link rather than part of the name.
 *
 * currentColor at 60% rather than text-muted-foreground: this sits on a popup
 * surface in one place and inside a filled primary button in another, and a
 * muted token would be tuned for only the first.
 */
export function ExternalArrow({ className }: { className?: string }) {
  return (
    <ArrowUpRightIcon
      aria-hidden="true"
      // 1.5, against Lucide's default 2 — at 14px the default reads heavier
      // than the type it annotates.
      strokeWidth={1.5}
      className={cn("size-3.5 shrink-0 opacity-60", className)}
    />
  );
}
