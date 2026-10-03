import { notFound } from "next/navigation";

import { CommitmentRecord } from "@/components/livepeer-ui/commitment-record";
import { GuideRecord } from "@/components/livepeer-ui/guide-record";
import { RecordCover } from "@/components/livepeer-ui/record-parts";
import { RecordSheet } from "@/components/livepeer-ui/record-sheet";
import { isGuideName, type GuideName } from "@/lib/guides";
import { getCommitmentUpdates, getGuide, getRegister } from "@/lib/register";
import { standingOf } from "@/lib/updates";

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
 *
 * It intercepts the guides too, whether it wants to or not. `(.)[slug]`
 * catches every client-side navigation to /roadmap/<segment>, and Next gives
 * a static sibling like /roadmap/reporting no precedence over it the way the
 * router does on a full load — so "How to report" in the rail 404'd here
 * while a refresh of the same URL rendered the page. There is no opting a
 * segment out of an interceptor, so the guide gets the record's treatment
 * instead: the same panel over the register, its own page on a refresh or a
 * shared link, and the expand control to get from one to the other.
 */
export default async function InterceptedCommitment({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (isGuideName(slug)) return <InterceptedGuide name={slug} />;
  const commitment = (await getRegister()).find((c) => c.slug === slug);
  if (!commitment) notFound();
  const updates = await getCommitmentUpdates(commitment.slug);
  const standing = standingOf(commitment, updates, new Date());

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
        standing={standing}
        updates={updates}
      />
    </RecordSheet>
  );
}

async function InterceptedGuide({ name }: { name: GuideName }) {
  const guide = await getGuide(name);
  return (
    <RecordSheet
      href={`/roadmap/${name}`}
      closeTo="/roadmap"
      title={guide.title}
      cover={
        guide.cover && (
          <RecordCover
            sizes="(max-width: 46rem) 100vw, 46rem"
            src={guide.cover}
            alt={`${guide.title} cover image`}
          />
        )
      }
    >
      <GuideRecord guide={guide} />
    </RecordSheet>
  );
}
