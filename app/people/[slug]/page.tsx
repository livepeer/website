import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PersonRecordView } from "@/components/livepeer-ui/person-record";
import { RecordCover } from "@/components/livepeer-ui/record-parts";
import { StartAtTop } from "@/components/livepeer-ui/start-at-top";
import type { PersonRecord } from "@/lib/people";
import { getPeopleRegister, getRegister } from "@/lib/register";

/**
 * One person, and what the register credits them with.
 *
 * No back link, for the reason an organisation has none: a person is not a
 * child of the roadmap. They are reached from a credited face on a card, which
 * slides this in over the register, and the roadmap is linked from here where
 * that is honest — on every commitment listed below.
 */

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getPeopleRegister()).map((p) => ({ slug: p.slug }));
}

async function find(slug: string): Promise<PersonRecord | undefined> {
  return (await getPeopleRegister()).find((p) => p.slug === slug);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const person = await find((await params).slug);
  if (!person) return {};

  // Composed rather than authored: a person has no description field, and
  // writing one per row would be a second sentence about a real human to keep
  // true. What the register knows is enough for a card.
  const description = person.affiliation
    ? `${person.name} — ${person.affiliation.name}, on the Livepeer roadmap.`
    : `${person.name}, credited on the Livepeer roadmap.`;
  const title = `${person.name} — Livepeer`;

  return {
    title: person.name,
    description,
    openGraph: { title, description, type: "profile" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function PersonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [person, commitments] = await Promise.all([find(slug), getRegister()]);
  if (!person) notFound();

  const contributed = commitments.filter((c) =>
    c.contributors?.some((p) => p.slug === person.slug)
  );
  const accountableFor = commitments.filter(
    (c) => c.accountable?.slug === person.slug
  );

  return (
    // The banner spans the page; the record keeps the reading column.
    //
    // The same cover is edge-to-edge in the slide-over, so an inset one here
    // made the page the odd one out against its own overlay — expand a record
    // and the banner shrank into a rectangle floating in the margin. The
    // portrait still lifts from the column's left edge, which is where a
    // profile puts it.
    <article className="pb-28">
      <StartAtTop />

      {person.cover && (
        <RecordCover src={person.cover} alt={`${person.name} cover image`} />
      )}

      <div
        className={`${"mx-auto w-full max-w-[46rem]"} px-6 sm:px-8 ${person.cover ? "" : "pt-20"}`}
      >
        <PersonRecordView
          person={person}
          contributed={contributed}
          accountableFor={accountableFor}
        />
      </div>
    </article>
  );
}
