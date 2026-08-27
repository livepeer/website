import Image from "next/image";
import Link from "next/link";
import {
  AlignLeft,
  ArrowUpRight,
  CalendarDays,
  CircleChevronDown,
  Clock,
  Link2,
} from "lucide-react";

import type { Commitment, Person } from "@/lib/roadmap";
import { shippedPeriod } from "@/lib/roadmap";

/** Where a credited face links; the record builds the URL from a handle. */
const PROFILE_HOST = "forum.livepeer.org";

/**
 * One commitment, rendered once.
 *
 * Two routes show this: the page at /roadmap/<slug>, and the intercepting
 * route that slides it over the index. Sharing the body is the point of doing
 * the overlay that way round — a drawer with its own copy of the layout is two
 * things to keep in step, and they drift the first time one of them changes.
 *
 * Laid out the way Notion lays out a database page, because that is where
 * these records are written and it is a good pattern for the shape: a title,
 * then properties as icon-label-value rows, then the body below them.
 *
 * The properties are deliberately quiet — small, muted, no rules between, no
 * uppercase. They are the metadata around a write-up rather than the content,
 * and the earlier treatment set them at the same weight as the prose they were
 * introducing.
 */

/**
 * The banner, full-bleed above the record.
 *
 * Rendered by each route rather than inside CommitmentRecord, because the two
 * carry different horizontal padding and a cover has to escape whichever it
 * is sitting in. Kept here so the sizing and treatment are stated once.
 *
 * Fixed height and object-cover: the library's images are 1456x816, and a
 * banner that changed height per record would make the register's pages feel
 * like different templates. Priority, because it is the largest thing above
 * the fold on a page whose whole point is to be read.
 */
export function RecordCover({ src, alt }: { src: string; alt: string }) {
  return (
    // shrink-0 is load-bearing. The sheet is a flex column, so a child with a
    // fixed height still shrinks when the content overflows — which collapsed
    // this to 0px and made the banner render as nothing at all while every
    // measurement said it was present and positioned correctly.
    <div className="relative h-40 w-full shrink-0 overflow-hidden sm:h-56">
      <Image
        src={src}
        alt=""
        aria-hidden
        fill
        sizes="(max-width: 46rem) 100vw, 46rem"
        className="object-cover"
        priority
      />
      <span className="sr-only">{alt}</span>
    </div>
  );
}

/** "2026-08-27" → "August 27, 2026". UTC, so the date does not shift by zone. */
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    timeZone: "UTC",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * A credited person: portrait, then name.
 *
 * The card shows faces alone and identifies them on hover, which is right
 * where the space is tight. Here there is room for both, and a record that
 * made you hover to learn who worked on something would be worse than the
 * plain list of names it replaced — recognition and identification at once,
 * no interaction required.
 *
 * A monogram where there is no portrait, so a roster does not become a ragged
 * mix of pictures and bare text.
 */
function Credit({ person }: { person: Person }) {
  const name = (
    <span className="flex items-center gap-2">
      {person.avatar ? (
        <Image
          src={`/people/${person.avatar}`}
          alt=""
          width={20}
          height={20}
          className="size-5 shrink-0 rounded-full object-cover"
        />
      ) : (
        <span
          aria-hidden
          className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-[0.625rem] font-medium text-muted-foreground"
        >
          {person.name.charAt(0)}
        </span>
      )}
      {person.name}
    </span>
  );

  return person.profile ? (
    <a
      href={`https://${PROFILE_HOST}/u/${person.profile}`}
      target="_blank"
      rel="noreferrer"
      className="underline decoration-transparent underline-offset-4 transition-colors hover:decoration-border"
    >
      {name}
    </a>
  ) : (
    name
  );
}

const STATE_LABEL: Record<Commitment["state"], string> = {
  next: "Committed",
  building: "In progress",
  shipped: "Shipped",
};

/**
 * A property row.
 *
 * `<div>` inside `<dl>` is valid and is what keeps a label and its value in
 * one grid row without a wrapper element per column.
 *
 * No hover state. Notion highlights a property row because clicking it edits
 * the value; here the record is read-only, so the same highlight would be
 * promising an interaction that does not exist.
 */
function Row({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof AlignLeft;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 items-start gap-x-3 gap-y-1 px-2 py-1.5 sm:grid-cols-[11rem_1fr]">
      <dt className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="size-4 shrink-0" aria-hidden />
        {label}
      </dt>
      <dd className="text-sm leading-relaxed">{children}</dd>
    </div>
  );
}

export function CommitmentRecord({
  commitment: c,
}: {
  commitment: Commitment;
}) {
  return (
    <>
      {/* Notion's page title: heavy, tight, and the largest thing on the
          record by a clear margin. */}
      <h1 className="text-[1.75rem] leading-[1.15] font-bold tracking-[-0.02em] text-balance sm:text-[2.25rem]">
        {c.title}
      </h1>

      <dl className="mt-8 space-y-0.5">
        <Row icon={CircleChevronDown} label="Status">
          {STATE_LABEL[c.state]}
        </Row>
        <Row icon={ArrowUpRight} label="Owner">
          <Link
            href={`/organizations/${c.ownerSlug}`}
            scroll={false}
            className="underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
          >
            {c.owner}
          </Link>
        </Row>
        {c.state === "shipped" ? (
          <Row icon={CalendarDays} label="Shipped on">
            {shippedPeriod(c.shippedAt!)}
          </Row>
        ) : (
          <Row icon={AlignLeft} label="Target">
            {c.target}
          </Row>
        )}
        <Row icon={CircleChevronDown} label="Workstream">
          {c.workstream}
        </Row>
        <Row icon={AlignLeft} label="Outcome">
          {c.outcome}
        </Row>
        {c.funding && (
          <Row icon={AlignLeft} label="Funding">
            {c.funding}
          </Row>
        )}
        {c.accountable && (
          <Row icon={ArrowUpRight} label="Contact">
            <Credit person={c.accountable} />
          </Row>
        )}
        {c.contributors && c.contributors.length > 0 && (
          <Row icon={ArrowUpRight} label="Contributors">
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              {c.contributors.map((p) => (
                <li key={p.name}>
                  <Credit person={p} />
                </li>
              ))}
            </ul>
          </Row>
        )}
        <Row icon={Link2} label="Links">
          <ul className="space-y-1">
            {c.related.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="underline decoration-border underline-offset-4 hover:decoration-foreground"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </Row>
        {c.lastUpdated && (
          <Row icon={Clock} label="Last updated">
            <span className="text-muted-foreground">
              {formatDate(c.lastUpdated)}
            </span>
          </Row>
        )}
      </dl>

      {/* The write-up, unlabelled and below a rule, exactly where Notion puts
          a page body. On the card it needed the word "Context" to explain why
          a paragraph sat among facts; here it is the content and the
          properties are the aside.

          HTML from either source: the markdown register renders through the
          blog's pipeline, Notion's blocks through lib/notion-blocks.ts. */}
      {c.detail ? (
        <div
          className="reading-prose mt-10 border-t border-border pt-10"
          dangerouslySetInnerHTML={{ __html: c.detail }}
        />
      ) : (
        // Said plainly rather than left blank. Every commitment should carry a
        // write-up, and an empty record is a prompt to write one rather than
        // evidence that there is nothing to say.
        <p className="mt-10 border-t border-border pt-10 text-sm text-muted-foreground">
          No write-up yet.
        </p>
      )}
    </>
  );
}
