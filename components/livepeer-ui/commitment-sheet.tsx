"use client";

import { Maximize2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";

/**
 * The commitment, slid over the register.
 *
 * Rendered by an intercepting route, so this is what a click from the index
 * gets while the URL becomes /roadmap/<slug>. A direct visit or a refresh
 * bypasses it and lands on the real page — same content either way, because
 * both routes render CommitmentRecord.
 *
 * Which is the whole reason for doing it in this order. A drawer built before
 * the page would have been a second rendering path with no address, nothing
 * to share and nothing to index; built after, it is presentation over a page
 * that already exists.
 *
 * Base UI's Dialog underneath rather than a hand-rolled panel: focus
 * trapping, scroll locking, Esc, and the backdrop are all things that look
 * easy and are not, and the repo already had the primitive.
 */
export function CommitmentSheet({
  slug,
  title,
  children,
}: {
  slug: string;
  title: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  // Mounted closed, opened on the next tick.
  //
  // Not a flourish: a dialog whose first render is already open has no state
  // change to transition from, so Base UI skips the enter animation and the
  // panel simply appears. Rendering closed and flipping in an effect gives it
  // a false-to-true edge, which is what makes it slide.
  //
  // Closing sets state first and navigates after, so the exit animation runs
  // before the history entry goes rather than unmounting mid-transition.
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(true), []);

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (next) return;
        setOpen(false);
        router.back();
      }}
    >
      <SheetContent
        side="right"
        showCloseButton={false}
        // Above the site header, which sits at z-80. At the sheet's default
        // z-50 the header painted over the panel and its menu button sat on
        // top of this one's close control — a modal you cannot close.
        //
        // No blur. The default backdrop frosts the whole page, which reads as
        // a heavy modal state; this is a record opening beside the register,
        // and the register should stay legible behind it. A plain scrim is
        // also cheaper — a full-viewport backdrop-filter is the sort of thing
        // that costs frames on a mid-range laptop.
        overlayClassName="z-[90] bg-black/40 supports-backdrop-filter:backdrop-blur-none"
        // Full width below sm, then a reading column. Every override carries
        // the same data-[side=right] prefix as the default it replaces — a
        // bare w-full loses to the variant-scoped w-3/4, which is how this
        // first rendered as a 281px strip of prose on a phone.
        //
        // translate-x-full, not the sheet's default 2.5rem: that nudge plus a
        // fade reads as a dialog appearing, and the thing being asked for is
        // Notion's panel arriving from off-screen.
        className="z-[90] gap-0 overflow-y-auto data-[side=right]:w-full data-[side=right]:duration-300 data-[side=right]:data-ending-style:translate-x-full data-[side=right]:data-starting-style:translate-x-full data-[side=right]:sm:max-w-[46rem]"
      >
        {/* Named for assistive tech; the record renders its own visible
            heading, so this one is not shown twice. */}
        <SheetTitle className="sr-only">{title}</SheetTitle>

        <div className="sticky top-0 z-10 flex items-center justify-end gap-1 bg-popover/80 px-4 py-3 backdrop-blur">
          {/* Notion's other affordance: take it full-screen. A plain anchor
              rather than a Link — the point is to leave the overlay and land
              on the page itself, which is what a full navigation does. */}
          <a
            href={`/roadmap/${slug}`}
            aria-label="Open as full page"
            className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <Maximize2 className="size-4" aria-hidden />
          </a>
          <SheetClose
            aria-label="Close"
            className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <X className="size-4" aria-hidden />
          </SheetClose>
        </div>

        <div className="px-6 pt-4 pb-20 sm:px-10">{children}</div>
      </SheetContent>
    </Sheet>
  );
}
