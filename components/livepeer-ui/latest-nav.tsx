"use client";

import Link from "next/link";
import { RssIcon, SearchIcon } from "lucide-react";
import { useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type LatestLink = { label: string; href: string };

/**
 * The row under the heading on /blog and /changelog: the places on the left,
 * the search on the right. After Vercel's blog and changelog, which share one
 * row so a reader moves between them without the page changing shape.
 *
 * The places are All, every blog category in use, and then the sibling
 * surfaces that are not categories, after a hairline. Each is the registry's
 * ghost button rendered as a link: no fill at rest, the muted fill on hover,
 * and the same fill held on the current page with aria-current set — the
 * toggle's pressed state, on an anchor, because these are routes.
 *
 * On a phone the row wraps: the search drops beneath at full width, and the
 * places scroll sideways rather than wrap, so the row stays one line tall.
 * The pressed place is scrolled into view on mount, because on the changelog
 * it is the last in the row and would otherwise start past the right edge,
 * leaving a reader unable to see which page they are on.
 */
export function LatestNav({
  allHref,
  categories,
  siblings,
  current,
  feedHref,
  query,
  onQueryChange,
  searchPlaceholder,
}: {
  allHref: string;
  categories: LatestLink[];
  siblings: LatestLink[];
  /** The href of the place this page is, so it reads as pressed. */
  current: string;
  /** An Atom feed for this page, shown as an icon after the search. */
  feedHref?: string;
  query: string;
  onQueryChange: (value: string) => void;
  searchPlaceholder: string;
}) {
  const row = useRef<HTMLElement>(null);
  useEffect(() => {
    const nav = row.current;
    const pressed = nav?.querySelector<HTMLElement>("[aria-current]");
    if (!nav || !pressed) return;
    // scrollLeft rather than scrollIntoView, which would also scroll the
    // page vertically to the row. Only the row moves, and only when the
    // pressed place is actually clipped.
    const right = pressed.offsetLeft + pressed.offsetWidth;
    if (right > nav.clientWidth + nav.scrollLeft) {
      nav.scrollLeft = right - nav.clientWidth + 16;
    }
  }, [current]);

  const place = (link: LatestLink) => {
    const pressed = link.href === current;
    return (
      <Button
        key={link.href}
        variant="ghost"
        size="sm"
        nativeButton={false}
        render={
          <Link href={link.href} aria-current={pressed ? "page" : undefined} />
        }
        className={cn(
          "shrink-0 font-normal duration-200 active:translate-y-0",
          pressed
            ? "bg-muted text-foreground dark:bg-muted"
            : "text-muted-foreground"
        )}
      >
        {link.label}
      </Button>
    );
  };

  return (
    <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
      <nav
        ref={row}
        aria-label="Latest"
        className="-mx-4 flex min-w-0 gap-x-1 overflow-x-auto px-4 whitespace-nowrap [scrollbar-width:none] sm:-mx-3 sm:px-3 [&::-webkit-scrollbar]:hidden"
      >
        {place({ label: "All", href: allHref })}
        {categories.map(place)}
        {siblings.length > 0 && (
          <>
            <span
              aria-hidden="true"
              className="mx-1 w-px shrink-0 self-stretch bg-border"
            />
            {siblings.map(place)}
          </>
        )}
      </nav>

      <label className="relative block w-full sm:ml-auto sm:w-64">
        <SearchIcon
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
          className="pl-9"
        />
      </label>
      {feedHref && (
        <Button
          variant="ghost"
          size="icon-sm"
          nativeButton={false}
          render={<a href={feedHref} />}
          aria-label="Atom feed"
          title="Atom feed"
          className="-ml-4 hidden text-muted-foreground sm:inline-flex"
        >
          <RssIcon aria-hidden="true" />
        </Button>
      )}
    </div>
  );
}
