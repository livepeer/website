"use client";

import { usePathname } from "next/navigation";

/**
 * The address that was asked for, in mono over the 404's headline: "404 ·
 * /pricng". Read on the client, since the not-found page is rendered once for
 * every missing address. Only the address gives way when the line is short
 * of room, so the status is always read.
 */
export function NotFoundRequest() {
  const pathname = usePathname() ?? "/";
  let path = pathname;
  try {
    path = decodeURIComponent(pathname);
  } catch {
    // A malformed escape: show it as it came.
  }

  return (
    <p className="flex max-w-full items-baseline gap-x-[1ch] font-mono text-xs whitespace-nowrap text-muted-foreground">
      <span className="shrink-0 text-foreground">404</span>
      <span className="shrink-0" aria-hidden="true">
        ·
      </span>
      <span className="min-w-0 truncate">{path}</span>
    </p>
  );
}
