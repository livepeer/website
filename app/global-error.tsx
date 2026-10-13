"use client";

import { inter } from "@/lib/fonts";
import "./globals.css";

/**
 * The last resort, for when the root layout itself fails (the header's
 * Discord read, say): it replaces the whole document, so it carries its own
 * html and body, and follows the visitor's colour scheme from the system
 * since the theme script lives in the layout that failed.
 */
export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <title>Something went wrong | Livepeer</title>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var de=document.documentElement,l=window.matchMedia('(prefers-color-scheme: light)').matches;de.setAttribute('data-theme',l?'light':'dark');de.classList.toggle('dark',!l);})()`,
          }}
        />
      </head>
      <body className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center font-sans text-foreground antialiased">
        <h1 className="text-display-sm sm:text-display-md">
          Something went wrong
        </h1>
        <p className="text-reading-body mt-5 max-w-md text-pretty text-muted-foreground">
          livepeer.org didn&apos;t load. It&apos;s usually temporary, so try
          again in a moment.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-8 rounded-md bg-primary px-4 py-2 text-ui-body text-primary-foreground transition-opacity hover:opacity-90"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
