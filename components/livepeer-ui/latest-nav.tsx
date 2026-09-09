"use client";

import Link from "next/link";
import { SearchIcon } from "lucide-react";

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
 */
export function LatestNav({
  allHref,
  categories,
  siblings,
  current,
  query,
  onQueryChange,
  searchPlaceholder,
}: {
  allHref: string;
  categories: LatestLink[];
  siblings: LatestLink[];
  /** The href of the place this page is, so it reads as pressed. */
  current: string;
  query: string;
  onQueryChange: (value: string) => void;
  searchPlaceholder: string;
}) {
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
    </div>
  );
}
