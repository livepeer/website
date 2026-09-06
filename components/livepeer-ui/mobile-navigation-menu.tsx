"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

function MobileMenuIcon({ open = false }: { open?: boolean }) {
  return (
    <span aria-hidden="true" className="relative block h-4 w-8">
      <span
        className="absolute right-0.5 h-1 w-[30px] transition-[top,transform] duration-[250ms] ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none"
        style={{
          top: open ? 6 : 2,
          transform: open ? "rotate(135deg)" : "rotate(0deg)",
          transformOrigin: "19px 50%",
        }}
      >
        <span
          className="block h-full w-full origin-right bg-current transition-transform duration-[250ms] ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none"
          style={{ transform: open ? "scaleX(0.733333)" : "scaleX(1)" }}
        />
      </span>
      <span
        className="absolute right-0.5 h-1 w-[22px] origin-center bg-current transition-[top,transform] duration-[250ms] ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none"
        style={{
          top: open ? 6 : 10,
          transform: open ? "rotate(45deg)" : "rotate(0deg)",
        }}
      />
    </span>
  )
}

export function MobileNavigationMenu({
  title,
  header,
  children,
  open,
  onOpenChange,
}: {
  title: string
  header: React.ReactNode
  children: (close: () => void) => React.ReactNode
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const close = React.useCallback(() => onOpenChange(false), [onOpenChange])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            className="hover:bg-transparent hover:text-foreground aria-expanded:bg-transparent dark:hover:bg-transparent"
          />
        }
      >
        <MobileMenuIcon open={open} />
        <span className="sr-only">
          {open ? `Close ${title}` : `Open ${title}`}
        </span>
      </SheetTrigger>
      <SheetContent
        side="top"
        showCloseButton={false}
        overlayClassName="bg-transparent transition-none supports-backdrop-filter:backdrop-blur-none"
        // z-[90], above the site header's z-[80]. The sheet draws its own
        // 64px row with a logo and a close button in exactly the position the
        // page header occupies; below the header's z-index both rows render
        // and you see two logos and two menu icons a couple of pixels apart.
        // The mockup has the same arrangement with header z-50 / sheet z-70 —
        // the sheet always wins.
        className="z-[90] h-dvh max-h-none w-screen max-w-none overflow-hidden border-0 bg-background p-0 text-foreground opacity-100 shadow-none transition-opacity duration-200 ease-out data-ending-style:opacity-0 data-starting-style:opacity-0 data-[side=top]:h-dvh data-[side=top]:border-b-0 data-[side=top]:data-ending-style:translate-y-0 data-[side=top]:data-starting-style:translate-y-0 motion-reduce:transition-none"
      >
        <SheetTitle className="sr-only">{title}</SheetTitle>
        <div className="flex h-dvh flex-col">
          <div className="flex h-16 shrink-0 items-center justify-between px-4 sm:px-6">
            {header}
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={`Close ${title}`}
              onClick={close}
              className="hover:bg-transparent dark:hover:bg-transparent"
            >
              <MobileMenuIcon open />
            </Button>
          </div>
          {children(close)}
        </div>
      </SheetContent>
    </Sheet>
  )
}
