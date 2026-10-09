import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import { getDesignGuidelines } from "@/lib/design-guidelines";

export const metadata: Metadata = {
  title: "Design guidelines",
  description:
    "How Livepeer surfaces are designed: colour and type roles, spacing, composition, responsive behaviour and accessibility.",
  openGraph: {
    title: "Design guidelines | Livepeer",
    description:
      "How Livepeer surfaces are designed: colour and type roles, spacing, composition, responsive behaviour and accessibility.",
  },
  // Declared, or the brand segment's Twitter card (titled "Brand") cascades.
  twitter: {
    card: "summary_large_image",
    title: "Design guidelines | Livepeer",
    description:
      "How Livepeer surfaces are designed: colour and type roles, spacing, composition, responsive behaviour and accessibility.",
  },
};

/**
 * The design guidelines, rendered from `content/design.md` in the article
 * measure the blog uses, under a link back to the brand page they are the
 * long form of. The raw file is at /design.md, linked here for agents.
 */
export default async function DesignGuidelinesPage() {
  const guidelines = await getDesignGuidelines();
  return (
    <div className="px-4 pt-16 pb-24 sm:px-6 sm:pt-24 sm:pb-32 lg:px-10">
      <div className="mx-auto w-full max-w-[46rem]">
        <Link
          href="/brand"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeftIcon className="size-4" aria-hidden="true" />
          Brand
        </Link>
        <h1 className="mt-8 text-display-sm text-balance sm:text-display-md">
          {guidelines.title}
        </h1>
        <p className="mt-5 text-reading-body text-pretty text-muted-foreground">
          {guidelines.intro}{" "}
          <a
            href="/design.md"
            className="text-foreground underline underline-offset-4"
          >
            Raw file for agents
          </a>
          .
        </p>
        <div
          className="article-prose mt-14"
          dangerouslySetInnerHTML={{ __html: guidelines.html }}
        />
      </div>
    </div>
  );
}
