"use client";

import { useEffect } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

/**
 * What a visitor sees when a page throws while rendering — most likely a
 * Notion read failing on a page's first request — inside the site's own
 * header and footer, in the 404 page's layout, rather than Next's bare
 * "Application error" screen. "Try again" re-renders the segment.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
    // A client component cannot export metadata; without this the tab
    // keeps the title of the page that failed, or the home page's.
    document.title = "Something went wrong | Livepeer";
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-display-sm sm:text-display-md">
        Something went wrong
      </h1>
      <p className="text-reading-body mt-5 max-w-md text-pretty text-muted-foreground">
        This page didn&apos;t load. It&apos;s usually temporary, so try again in
        a moment.
      </p>
      <div className="mt-8 flex items-center gap-6">
        <Button onClick={reset}>Try again</Button>
        <Link
          href="/"
          className="text-reading-body text-foreground underline underline-offset-4 transition-opacity hover:opacity-60"
        >
          Go to the front page
        </Link>
      </div>
    </div>
  );
}
