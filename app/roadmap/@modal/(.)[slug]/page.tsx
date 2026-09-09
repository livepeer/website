import { notFound } from "next/navigation";

import { CommitmentRecord } from "@/components/livepeer-ui/commitment-record";
import { RecordCover } from "@/components/livepeer-ui/record-parts";
import { RecordSheet } from "@/components/livepeer-ui/record-sheet";
import { getChangelog, getRegister } from "@/lib/register";

/**
 * The same record, intercepted.
 *
 * `(.)` matches a route one level down from this segment, so a client-side
 * navigation from /roadmap to /roadmap/<slug> renders here instead of the
 * page. The URL is the real one either way: it can be shared, it unfurls, and
 * the back button closes the overlay because closing is a history pop.
 *
 * Not prerendered, and it does not need to be — this only ever renders after
 * the index has already loaded, and the page it intercepts is static.
 */
export default async function InterceptedCommitment({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const commitment = (await getRegister()).find((c) => c.slug === slug);
  if (!commitment) notFound();

  return (
    <RecordSheet
      href={`/roadmap/${slug}`}
      closeTo="/roadmap"
      title={commitment.title}
      cover={
        commitment.cover && (
          <RecordCover
            sizes="(max-width: 46rem) 100vw, 46rem"
            src={commitment.cover}
            alt={`${commitment.title} cover image`}
          />
        )
      }
    >
      <CommitmentRecord
        commitment={commitment}
        overlay
        announcement={await announcementFor(commitment.slug)}
      />
    </RecordSheet>
  );
}

/** The changelog entry that announced a commitment, if one names it. */
async function announcementFor(slug: string) {
  const entry = (await getChangelog()).find((e) => e.commitment?.slug === slug);
  return entry ? { slug: entry.slug, title: entry.title } : undefined;
}
