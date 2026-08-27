import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import type { Organization } from "@/lib/organizations";
import { shippedPeriod, type Commitment } from "@/lib/roadmap";

/**
 * One organisation, rendered once.
 *
 * Two routes show this: the page at /organizations/<slug>, and the
 * intercepting route that slides it over the roadmap. Sharing the body is the
 * point of doing the overlay that way round — a drawer with its own copy of
 * the layout is two things to keep in step, and they drift the first time one
 * of them changes.
 *
 * The commitments are passed in rather than fetched here, because both routes
 * already hold the register: they derive them by filtering it on `ownerSlug`,
 * so what a body owns is never stored twice and cannot disagree with the
 * roadmap.
 */

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

export function OrganizationRecord({
  organization: org,
  owned,
}: {
  organization: Organization;
  owned: Commitment[];
}) {
  return (
    <>
      <div className="flex items-center gap-4">
        {org.logo && (
          // A raw <img>: these are SVGs served straight from public/, and
          // next/image needs dangerouslyAllowSVG to touch them — a global
          // loosening to render files the repo itself controls.
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

      {/* The same page title the commitment record sets: heavy, tight, and the
          largest thing on the record by a clear margin. */}
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

      {/* What they are answerable for — only when there is something.
          Rendered from the register, so it cannot drift from the roadmap.

          No empty state. A body that owns nothing is not a page missing a
          section: the Treasury is every delegator and orchestrator voting on
          proposals and governance LIPs, and will never own an initiative. The
          sentence that used to stand here — that they appear through the work
          they fund — was true of Livepeer Inc and false of the other two. Each
          record's own copy says what that body does, which is the place for
          it. */}
      {owned.length > 0 && (
        <section className="mt-14 border-t border-border pt-10">
          <h2 className="text-[0.6875rem] leading-4 font-medium tracking-[0.09em] text-muted-foreground uppercase">
            On the roadmap
          </h2>

          {SECTIONS.map(({ state, label }) => {
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
          })}
        </section>
      )}
    </>
  );
}
