import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { RecordCover } from "@/components/livepeer-ui/record-parts";
import { OrganizationRecord } from "@/components/livepeer-ui/organization-record";
import type { Organization } from "@/lib/organizations";
import { getOrganizationRegister, getRegister } from "@/lib/register";

/**
 * One organisation, and what it is answerable for.
 *
 * The commitments are derived by filtering the register on `ownerSlug` rather
 * than stored on the organisation. A body that listed its own work would be a
 * second copy of a fact the register already holds, and the two would disagree
 * the first time an owner changed — the drift that put owners in their own
 * table in the first place.
 *
 * The overlay exists too, and renders this same record — see
 * app/roadmap/@modal. Building the page first is what makes it cheap: an
 * intercepting route is presentation over a page that already works, rather
 * than a second rendering path with no URL behind it.
 */

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getOrganizationRegister()).map((o) => ({ slug: o.slug }));
}

async function find(slug: string): Promise<Organization | undefined> {
  return (await getOrganizationRegister()).find((o) => o.slug === slug);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const org = await find((await params).slug);
  if (!org) return {};

  // The description is already written to be read away from the page, which is
  // exactly what this is for. Nothing to compose.
  const title = `${org.name} — Livepeer`;
  return {
    title: org.name,
    description: org.description,
    openGraph: { title, description: org.description, type: "profile" },
    twitter: {
      card: "summary_large_image",
      title,
      description: org.description,
    },
  };
}

export default async function OrganizationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [org, commitments] = await Promise.all([find(slug), getRegister()]);
  if (!org) notFound();

  const owned = commitments.filter((c) => c.ownerSlug === org.slug);

  return (
    <article className="mx-auto w-full max-w-[46rem] pt-20 pb-28">
      {/* No back link. A commitment lives at /roadmap/<slug> and the register
          really is its parent, so naming it is true there. An organisation is
          a sibling route that happens to be reached from a card, and a link
          home to the roadmap would claim an ancestry it does not have.

          Nothing is lost by dropping it: this only ever renders on the full
          page — the overlay has a close control — and the roadmap is linked
          from this page where that is honest, on every row of "On the
          roadmap". */}
      {org.cover && (
        <div className="mt-6 mb-10">
          <RecordCover src={org.cover} alt={`${org.name} cover image`} />
        </div>
      )}

      <div className={org.cover ? "px-6 sm:px-8" : "px-6 pt-10 sm:px-8"}>
        <OrganizationRecord organization={org} owned={owned} />
      </div>
    </article>
  );
}
