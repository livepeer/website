import { notFound } from "next/navigation";

import { PersonRecordView } from "@/components/livepeer-ui/person-record";
import { RecordCover } from "@/components/livepeer-ui/record-parts";
import { RecordSheet } from "@/components/livepeer-ui/record-sheet";
import { getPeopleRegister, getRegister } from "@/lib/register";

/**
 * A person, slid over the roadmap.
 *
 * `(..)` for the same reason organisations use it: people are not under
 * /roadmap but a sibling one level up, and the marker counts route segments
 * rather than folders, so the @modal slot does not count as one.
 */
export default async function InterceptedPerson({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [people, commitments] = await Promise.all([
    getPeopleRegister(),
    getRegister(),
  ]);

  const person = people.find((p) => p.slug === slug);
  if (!person) notFound();

  return (
    <RecordSheet
      href={`/people/${slug}`}
      closeTo="/roadmap"
      title={person.name}
      cover={
        person.cover && (
          <RecordCover
            src={person.cover}
            alt={`${person.name} cover image`}
            sizes="(max-width: 46rem) 100vw, 46rem"
          />
        )
      }
    >
      <PersonRecordView
        person={person}
        overlay
        contributed={commitments.filter((c) =>
          c.contributors?.some((p) => p.slug === person.slug)
        )}
        leading={commitments.filter(
          (c) => c.lead?.slug === person.slug
        )}
      />
    </RecordSheet>
  );
}
