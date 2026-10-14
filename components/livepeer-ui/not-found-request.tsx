"use client";

import { usePathname } from "next/navigation";

/**
 * The 404's log line: the address that was asked for, written the way the
 * network would log a request nothing served. Read on the client, since the
 * not-found page is rendered once for every missing address.
 *
 * Only the address gives way when the line is short of room, so the result
 * is always read; on a phone the reason is left to the headline under it.
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
      <span className="shrink-0 text-foreground">route</span>
      <span className="min-w-0 truncate">{path}</span>
      <span className="shrink-0">
        <span aria-hidden="true">→</span>{" "}
        <span className="text-foreground">404</span>
        <span className="hidden sm:inline"> · no node serves this path</span>
      </span>
    </p>
  );
}
