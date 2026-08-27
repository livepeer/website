import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CommitmentRecord } from "@/components/livepeer-ui/commitment-record";
import { RecordCover } from "@/components/livepeer-ui/record-parts";
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
    <article className="mx-auto w-full max-w-[46rem] pt-20 pb-28">
      {/* Above the cover, with an arrow, and not the word "back".
          It read as a caption when it sat under the banner saying only
          "Roadmap". But "Back to roadmap" was wrong in the other direction:
          most people reach a record from a shared link and have never seen
          the register, so "back" describes a journey they did not make.
          Naming the destination is true either way, and tells a first-time
          reader what they would get. */}
      <div className="px-6 sm:px-8">
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
      </div>

      {c.cover && (
        <div className="mt-6 mb-10">
          <RecordCover src={c.cover} alt={`${c.title} cover image`} />
        </div>
      )}

      <div className={c.cover ? "px-6 sm:px-8" : "px-6 pt-10 sm:px-8"}>
        <CommitmentRecord commitment={c} />
      </div>
    </article>
  );
}
