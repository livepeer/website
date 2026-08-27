import { ArrowLeft, ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getOrganizationRegister, getRegister } from "@/lib/register";
import type { Organization } from "@/lib/organizations";
import type { Commitment } from "@/lib/roadmap";
import { shippedPeriod } from "@/lib/roadmap";

/**
 * One organisation, and what it is answerable for.
 *
 * The commitments are derived by filtering the register on `ownerSlug` rather
 * than stored on the organisation. A body that listed its own work would be a
 * second copy of a fact the register already holds, and the two would disagree
 * the first time an owner changed — the drift that put owners in their own
 * table in the first place.
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

/**
 * The three tenses, in the order work moves through them.
 *
 * In progress first: the question this page is asked is "what are they doing",
 * and a track record answers a different one. Shipped last rather than absent —
 * for RaidGuild it is the whole of the record, and a page that led with an
 * empty "in progress" would read as a body doing nothing.
 */
const SECTIONS: { state: Commitment["state"]; label: string }[] = [
  { state: "building", label: "In progress" },
  { state: "next", label: "Committed" },
  { state: "shipped", label: "Shipped" },
];

/** A commitment, at the size a supporting list wants. */
function CommitmentRow({ commitment: c }: { commitment: Commitment }) {
  return (
    <li className="group relative border-t border-border py-4">
      <div className="flex items-baseline justify-between gap-6">
        <h3 className="text-sm font-medium">
          <Link
            href={`/roadmap/${c.slug}`}
            className="rounded-sm outline-none before:absolute before:inset-0 focus-visible:ring-2 focus-visible:ring-ring"
          >
            {c.title}
          </Link>
        </h3>
        <span className="shrink-0 font-mono text-xs text-muted-foreground">
          {c.state === "shipped" ? shippedPeriod(c.shippedAt!) : c.target}
        </span>
      </div>
      <p className="mt-1 max-w-[68ch] text-sm leading-relaxed text-muted-foreground">
        {c.outcome}
      </p>
    </li>
  );
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
      {/* Names the destination rather than saying "back": most readers reach
          this from a roadmap card or a shared link, and have never seen the
          index. */}
      <div className="px-6 sm:px-8">
        <Link
          href="/organizations"
          className="group inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft
            className="size-4 transition-transform group-hover:-translate-x-0.5 motion-reduce:transition-none"
            aria-hidden
          />
          All organizations
        </Link>
      </div>

      {org.cover && (
        <div className="mt-6 mb-10 relative h-40 w-full overflow-hidden sm:h-56">
          <Image
            src={org.cover}
            alt=""
            aria-hidden
            fill
            sizes="(max-width: 46rem) 100vw, 46rem"
            className="object-cover"
            priority
          />
        </div>
      )}

      <div className={org.cover ? "px-6 sm:px-8" : "px-6 pt-10 sm:px-8"}>
        <div className="flex items-center gap-4">
          {org.logo && (
            <img
              src={`/organizations/${org.logo}`}
              alt=""
              className="size-12 shrink-0 rounded-md object-contain"
            />
          )}
          <span className="font-mono text-xs text-muted-foreground">
            {org.type}
          </span>
        </div>

        <h1 className="mt-4 text-[1.75rem] leading-[1.15] font-bold tracking-[-0.02em] text-balance sm:text-[2.25rem]">
          {org.name}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          {org.description}
        </p>

        {org.link && (
          <a
            href={org.link}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex items-center gap-1.5 text-sm underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
          >
            {new URL(org.link).host.replace(/^www\./, "")}
            <ArrowUpRight className="size-3.5" aria-hidden />
          </a>
        )}

        {org.detail && (
          <div
            className="reading-prose mt-10 border-t border-border pt-10"
            dangerouslySetInnerHTML={{ __html: org.detail }}
          />
        )}

        {/* What they are answerable for. Rendered from the register, so this
            cannot drift from the roadmap. */}
        <section className="mt-14 border-t border-border pt-10">
          <h2 className="text-[0.6875rem] leading-4 font-medium tracking-[0.09em] text-muted-foreground uppercase">
            On the roadmap
          </h2>

          {owned.length === 0 ? (
            // Said plainly. Three of these bodies own nothing — they fund work,
            // or govern it — and an empty section with no explanation reads as
            // a page that failed to load.
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              No commitments on the register. {org.name} appears on the roadmap
              through the work it funds rather than as an owner.
            </p>
          ) : (
            SECTIONS.map(({ state, label }) => {
              const rows = owned.filter((c) => c.state === state);
              if (rows.length === 0) return null;
              return (
                <div key={state} className="mt-8">
                  <h3 className="text-sm font-medium">{label}</h3>
                  <ul className="mt-2">
                    {rows.map((c) => (
                      <CommitmentRow key={c.slug} commitment={c} />
                    ))}
                  </ul>
                </div>
              );
            })
          )}
        </section>
      </div>
    </article>
  );
}
