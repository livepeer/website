import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CommitmentRecord } from "@/components/livepeer-ui/commitment-record";
import { RecordCover } from "@/components/livepeer-ui/record-parts";
import { StartAtTop } from "@/components/livepeer-ui/start-at-top";
import { getRegister } from "@/lib/register";
import { type Commitment } from "@/lib/roadmap";

/**
 * One commitment, at length.
 *
 * The index states what a commitment is and who owns it; this is where the
 * write-up behind it lives — how the work is funded, what has landed, what it
 * is downstream of. That outgrew the card the moment the bodies stopped being
 * two or three sentences: an accordion is a fine place for six short facts and
 * a poor one for several hundred words.
 *
 * A real page rather than only a panel, because the reason to write at length
 * is to be read elsewhere: a write-up worth linking into a forum thread needs
 * an address, an unfurl and a place in search, none of which a drawer has.
 *
 * The drawer exists too, and renders this same record — see
 * app/roadmap/@modal. Building it in that order is what makes it cheap: an
 * intercepting route is presentation over a page that already works, rather
 * than a second rendering path with no URL behind it.
 */

export const dynamicParams = false;

export async function generateStaticParams() {
  const commitments = await getRegister();
  return commitments.map((c) => ({ slug: c.slug }));
}

async function find(slug: string): Promise<Commitment | undefined> {
  const commitments = await getRegister();
  return commitments.find((c) => c.slug === slug);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const c = await find((await params).slug);
  if (!c) return {};

  // The outcome is already one sentence written to be read away from the page,
  // which is exactly what a description is for. Nothing to compose.
  const title = `${c.title} — Livepeer Roadmap`;
  return {
    title: c.title,
    description: c.outcome,
    openGraph: { title, description: c.outcome, type: "article" },
    twitter: {
      card: "summary_large_image",
      title,
      description: c.outcome,
    },
  };
}

export default async function CommitmentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const c = await find((await params).slug);
  if (!c) notFound();

  return (
    // Banner first, flush to the header, then everything else in the reading
    // column — the same shape a person and an organisation now have.
    <article className="pb-28">
      <StartAtTop />

      {c.cover && <RecordCover src={c.cover} alt={`${c.title} cover image`} />}

      <div
        className={`mx-auto w-full max-w-[46rem] px-6 sm:px-8 ${
          c.cover ? "pt-8" : "pt-20"
        }`}
      >
        {/* Below the banner now, not above it. It was the only thing between
            the header and the cover, and the gap it left there was the whole
            reason this page looked unlike the other two.

            Under the banner it once read as a caption — but that was when it
            said "Roadmap". "All commitments" behind a left arrow is plainly a
            way out, not a label for the picture above it.

            Named rather than called "back": most people reach a record from a
            shared link and have never seen the register, so "back" describes a
            journey they did not make. */}
        <Link
          href="/roadmap"
          className="group inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft
            className="size-4 transition-transform group-hover:-translate-x-0.5 motion-reduce:transition-none"
            aria-hidden
          />
          All commitments
        </Link>

        <div className="mt-8">
          <CommitmentRecord commitment={c} />
        </div>
      </div>
    </article>
  );
}
