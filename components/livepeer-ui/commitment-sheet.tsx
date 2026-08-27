"use client";

import { Maximize2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
  // Held open, then closed on dismissal so the exit animation runs before the
  // history entry goes. Navigating straight away unmounts it mid-transition.
  const [open, setOpen] = useState(true);

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
        overlayClassName="z-[90]"
        // Full width below sm, then a reading column. Both overrides are
        // written with the same data-[side=right] prefix as the defaults they
        // replace — a bare w-full loses to the variant-scoped w-3/4, which is
        // how this first rendered as a 281px strip of prose on a phone with a
        // dead margin beside it.
        className="z-[90] gap-0 overflow-y-auto data-[side=right]:w-full data-[side=right]:sm:max-w-[42rem]"
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
