import { ArrowUpRight, AtSign, Link2, Mail, MessageSquare } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { RecordRow as Row } from "@/components/livepeer-ui/record-parts";
import type { PersonRecord } from "@/lib/people";
import { shippedPeriod, type Commitment } from "@/lib/roadmap";

/**
 * One person, rendered once.
 *
 * Two routes show this: the page at /people/<slug>, and the intercepting route
 * that slides it over the roadmap — the same split a commitment and an
 * organisation already use, so a face, an owner and a record all open the same
 * way from the register.
 *
 * The commitments are passed in, derived by filtering the register on this
 * person's slug. Nothing here stores what they worked on: a commitment names
 * its own contributors, and a second copy would disagree with it the first
 * time a roster changed.
 */

/** Where a credited face links out to; the record builds the URL from a handle. */
const PROFILE_HOST = "forum.livepeer.org";

/** A commitment, at the size a supporting list wants. */
function CommitmentRow({
  commitment: c,
  overlay,
}: {
  commitment: Commitment;
  overlay: boolean;
}) {
  return (
    <li className="group relative -mx-3 rounded-md border-t border-border px-3 py-4 transition-colors hover:bg-accent">
      <div className="flex items-baseline justify-between gap-6">
        <h3 className="text-sm font-medium">
          <Link
            href={`/roadmap/${c.slug}`}
            scroll={!overlay}
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

export function PersonRecordView({
  person,
  contributed,
  leading,
  overlay = false,
}: {
  person: PersonRecord;
  contributed: Commitment[];
  leading: Commitment[];
  /**
   * Whether this is the panel over the register rather than a page.
   *
   * It decides one thing: whether a link out of here keeps the scroll
   * position. In the panel it must — the register behind it is what the reader
   * was in the middle of, and the link swaps the panel's contents rather than
   * going anywhere. On a page it must not, or the destination opens at
   * whatever offset the reader happened to be at when they clicked.
   */
  overlay?: boolean;
}) {
  return (
    <>
      {/* The face is the page's image, so it is the size of one.
          An organisation leads with a stock banner because it has no face; a
          person has one, and leading with landscape photography over a 48px
          circle had it the wrong way round. The covers were chosen for exactly
          this — soft-focus rooms with nobody in them, so the banner does not
          compete with the portrait sitting on it.

          Lifted over the banner's lower edge where there is one, with a ring
          in the page colour so it reads as separated from the image rather
          than pasted onto it. */}
      {/* relative is load-bearing: RecordCover is positioned and this is not,
          so the banner painted over the lifted portrait and cropped its top
          half. A positioned sibling paints above a static one whatever the
          document order says. */}
      <div className={person.cover ? "relative -mt-16 sm:-mt-20" : "relative"}>
        {person.avatar ? (
          <Image
            src={`/people/${person.avatar}`}
            alt={person.name}
            width={224}
            height={224}
            priority
            className="size-28 shrink-0 rounded-full object-cover ring-4 ring-background sm:size-32"
          />
        ) : (
          <span
            aria-hidden
            className="flex size-28 shrink-0 items-center justify-center rounded-full bg-muted text-2xl font-medium text-muted-foreground ring-4 ring-background sm:size-32"
          >
            {person.name.charAt(0)}
          </span>
        )}
      </div>

      <h1 className="mt-5 text-[1.75rem] leading-[1.15] font-bold tracking-[-0.02em] text-balance sm:text-[2.25rem]">
        {person.name}
      </h1>

      {/* Two rows at most, and often one. A person has fewer facts than an
          organisation, and inventing rows to fill the table would be
          scaffolding rather than content. */}
      <dl className="mt-8 space-y-0.5">
        {person.affiliation && (
          <Row icon={Link2} label="Affiliation">
            <Link
              href={`/organizations/${person.affiliation.slug}`}
              scroll={!overlay}
              className="underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
            >
              {person.affiliation.name}
            </Link>
          </Row>
        )}
        {person.x && (
          <Row icon={AtSign} label="X">
            <a
              href={`https://x.com/${person.x}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
            >
              @{person.x}
              <ArrowUpRight className="size-3.5 shrink-0" aria-hidden />
            </a>
          </Row>
        )}
        {person.email && (
          <Row icon={Mail} label="Email">
            <a
              href={`mailto:${person.email}`}
              className="underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
            >
              {person.email}
            </a>
          </Row>
        )}
        {person.profile && (
          <Row icon={MessageSquare} label="Forum">
            <a
              href={`https://${PROFILE_HOST}/u/${person.profile}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
            >
              {person.profile}
              <ArrowUpRight className="size-3.5 shrink-0" aria-hidden />
            </a>
          </Row>
        )}
      </dl>

      {person.detail ? (
        <div
          className="reading-prose mt-10 border-t border-border pt-10"
          dangerouslySetInnerHTML={{ __html: person.detail }}
        />
      ) : (
        // Said plainly, the way a commitment says it has no write-up. An
        // invented bio would be a biography of someone who may not exist, and
        // it would read as true to everyone who found it.
        <p className="mt-10 border-t border-border pt-10 text-sm text-muted-foreground">
          No bio yet.
        </p>
      )}

      {/* Derived from the register, so it cannot drift from the roadmap.
          Accountable is listed apart from contributed because they are
          different claims: one is the person to ask, the other is the people
          doing the work. */}
      {leading.length > 0 && (
        <section className="mt-14 border-t border-border pt-10">
          <h2 className="text-[0.6875rem] leading-4 font-medium tracking-[0.09em] text-muted-foreground uppercase">
            Leading
          </h2>
          <ul className="mt-2">
            {leading.map((c) => (
              <CommitmentRow key={c.slug} commitment={c} overlay={overlay} />
            ))}
          </ul>
        </section>
      )}

      {contributed.length > 0 && (
        <section className="mt-14 border-t border-border pt-10">
          <h2 className="text-[0.6875rem] leading-4 font-medium tracking-[0.09em] text-muted-foreground uppercase">
            Contributing to
          </h2>
          <ul className="mt-2">
            {contributed.map((c) => (
              <CommitmentRow key={c.slug} commitment={c} overlay={overlay} />
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
