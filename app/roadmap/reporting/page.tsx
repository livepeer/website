import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { RecordCover } from "@/components/livepeer-ui/record-parts";
import { StartAtTop } from "@/components/livepeer-ui/start-at-top";
import { getGuide } from "@/lib/register";

/**
 * What owning something on the roadmap obliges you to: track the work in
 * the open, post an update every month, close with a retrospective.
 *
 * The old help site kept three articles for "roadmap item owners" beside the
 * board they reported on. The board is this site now, and the mechanisms
 * those articles asked for are built into it — a commitment's Links, the
 * update row the roadmap reads as health, the Retrospective kind. The rules
 * themselves are the Foundation's, so they live in Notion, as one page
 * under Livepeer.org content, and this route shows it the way a record
 * shows its write-up: cover, title, body (lib/guides.ts). A first version
 * held the copy here, in cards; the Foundation could not edit it without a
 * pull request, and it read long.
 *
 * Reached from where the question arises rather than from the header: the
 * empty states on a record, the roadmap's rail, and Contribute.
 */

export const revalidate = 60;

const DESCRIPTION =
  "What owning something on the Livepeer roadmap means: track the work in the open, post an update every month, and close with a retrospective.";

export async function generateMetadata(): Promise<Metadata> {
  const guide = await getGuide("reporting");
  const title = `${guide.title} | Livepeer`;
  return {
    title: guide.title,
    description: DESCRIPTION,
    openGraph: { title, description: DESCRIPTION, type: "article" },
    twitter: { card: "summary_large_image", title, description: DESCRIPTION },
  };
}

export default async function ReportingPage() {
  const guide = await getGuide("reporting");

  return (
    <article className="pb-28">
      <StartAtTop />

      {guide.cover && (
        <RecordCover src={guide.cover} alt={`${guide.title} cover image`} />
      )}

      <div
        className={`mx-auto w-full max-w-[46rem] px-6 sm:px-8 ${
          guide.cover ? "pt-8" : "pt-20"
        }`}
      >
        <Link
          href="/roadmap"
          className="group inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft
            className="size-4 transition-transform group-hover:-translate-x-0.5 motion-reduce:transition-none"
            aria-hidden
          />
          Roadmap
        </Link>

        <div className="mt-8">
          <h1 className="text-[1.75rem] leading-[1.15] font-bold tracking-[-0.02em] text-balance sm:text-[2.25rem]">
            {guide.title}
          </h1>
          <div
            className="reading-prose mt-8"
            dangerouslySetInnerHTML={{ __html: guide.html }}
          />
        </div>
      </div>
    </article>
  );
}
