import type { Metadata } from "next";
import Link from "next/link";

// Without this the tab and any shared link read as the home page.
export const metadata: Metadata = {
  title: "Page not found",
  openGraph: { title: "Page not found | Livepeer" },
  twitter: { title: "Page not found | Livepeer" },
};

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-display-sm sm:text-display-md">Page not found</h1>
      <p className="text-reading-body mt-5 max-w-md text-pretty text-muted-foreground">
        Sorry, but the page you were looking for could not be found.
      </p>
      <p className="text-reading-body mt-2 text-muted-foreground">
        {/* foreground + underline, matching .reading-prose links. This link was
            green, which the design system rules out for anything interactive. */}
        <Link
          href="/"
          className="text-foreground underline underline-offset-4 transition-opacity hover:opacity-60"
        >
          Return to our front page
        </Link>{" "}
        if you can&apos;t find what you&apos;re looking for.
      </p>
    </div>
  );
}
