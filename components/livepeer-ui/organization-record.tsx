import { ArrowUpRight, CircleChevronDown, Link2 } from "lucide-react";
import Link from "next/link";

import {
  RecordCredit as Credit,
  RecordRow as Row,
} from "@/components/livepeer-ui/record-parts";
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
 * `description` is deliberately not rendered. It is the share line — the
 * sentence a link unfurls with, written to be read away from the page — and
 * the body below says the same thing at length to anyone standing on it.
 * Printing both puts the summary directly above the thing it summarises.
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
    // The whole row is the target, so the whole row answers the pointer. The
    // tint bleeds past the text column by the same 12px it is padded, which is
    // what stops it reading as a box drawn around the title.
    //
    // Full accent, not the /40 the cards use. Those sit on `card` inside a
    // bordered box; this sits on the page, and 0.97 at 40% over white measured
    // a 1% shift — present in the computed style and invisible to anyone. The
    // title takes the underline as well, because that is what the pointer is
    // actually aimed at.
    <li className="group relative -mx-3 rounded-md border-t border-border px-3 py-4 transition-colors hover:bg-accent">
      <div className="flex items-baseline justify-between gap-6">
        <h3 className="text-sm font-medium">
          <Link
            href={`/roadmap/${c.slug}`}
            scroll={false}
            className="rounded-sm underline decoration-transparent underline-offset-4 outline-none transition-colors group-hover:decoration-border before:absolute before:inset-0 focus-visible:ring-2 focus-visible:ring-ring"
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

/** Our own host, so a link home is not dressed up as a trip somewhere else. */
const SITE_HOST = "livepeer.org";

/**
 * Where to read about them — which is not always somewhere else.
 *
 * Labelled "Link", not "Website", because only one of these four is one: the
 * others are a forum thread, a page on the Explorer, and a page on this site.
 * "Link" is true of all of them, and is what the field is called in Notion.
 *
 * The Foundation's official page is livepeer.org/foundation: here. Sent
 * through the external treatment it opened a new tab back to where the reader
 * already was, over a label naming the host they were already on. An internal
 * destination is a normal link to a path, and says which page it is.
 */
function LinkRow({ href }: { href: string }) {
  const url = new URL(href);
  const internal = url.host.replace(/^www\./, "") === SITE_HOST;

  return (
    <Row icon={Link2} label="Link">
      {internal ? (
        <Link
          href={url.pathname}
          className="underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
        >
          {url.pathname}
        </Link>
      ) : (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
        >
          {url.host.replace(/^www\./, "")}
          <ArrowUpRight className="size-3.5 shrink-0" aria-hidden />
        </a>
      )}
    </Row>
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
      {/* The mark alone. The type used to sit beside it and is a property row
          now, which is where a commitment states the same kind of fact. */}
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

      {/* The same page title the commitment record sets: heavy, tight, and the
          largest thing on the record by a clear margin. */}
      <h1 className="mt-4 text-[1.75rem] leading-[1.15] font-bold tracking-[-0.02em] text-balance sm:text-[2.25rem]">
        {org.name}
      </h1>

      {/* The facts, set exactly as a commitment sets its own.
          The two records swap places in one panel when a reader follows an
          owner's name, so a different treatment on each side reads as two
          unrelated pages rather than two records of the same kind.

          Two rows, not nine. An organisation has fewer facts than a
          commitment, and inventing rows to fill the table would be scaffolding
          rather than content — Affiliated is the one that will earn a third,
          once the placeholder people are replaced. */}
      <dl className="mt-8 space-y-0.5">
        <Row icon={CircleChevronDown} label="Type">
          {org.type}
        </Row>
        {org.link && <LinkRow href={org.link} />}
        {org.people && org.people.length > 0 && (
          <Row icon={ArrowUpRight} label="People">
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              {org.people.map((person) => (
                <li key={person.name}>
                  <Credit person={person} />
                </li>
              ))}
            </ul>
          </Row>
        )}
      </dl>

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
