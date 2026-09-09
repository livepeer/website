import Link from "next/link";
import {
  AlignLeft,
  ArrowUpRight,
  CalendarDays,
  CircleChevronDown,
  Clock,
  Link2,
} from "lucide-react";

import { HealthMark } from "@/components/livepeer-ui/health";
import {
  RecordCredit as Credit,
  RecordRow as Row,
} from "@/components/livepeer-ui/record-parts";
import type { Commitment } from "@/lib/roadmap";
import { shippedPeriod } from "@/lib/roadmap";
import { STALE_AFTER_DAYS, type Standing, type Update } from "@/lib/health";

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
 * "3 days ago", "2 weeks ago" — how long since an update was posted, the
 * way Linear stamps its latest update. Past a month the date itself is
 * more useful than a count, so it hands over to formatDate.
 */
function ago(iso: string, now: Date): string {
  const days = Math.floor(
    (now.getTime() - new Date(iso).getTime()) / 86_400_000
  );
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) {
    const weeks = Math.floor(days / 7);
    return weeks === 1 ? "last week" : `${weeks} weeks ago`;
  }
  return formatDate(iso);
}

/**
 * One update, the way Linear draws one: the health its lead chose, who
 * posted it and when on one line, then what they said. The write-up, when
 * there is one, runs beneath the line in the reading prose.
 */
function UpdateCard({
  update: u,
  when,
  eyebrow,
  note,
}: {
  update: Update;
  when: string;
  /** "Latest update", on the card that leads the record. */
  eyebrow?: string;
  /** A remark on the card's standing, set on the right of the eyebrow. */
  note?: string;
}) {
  return (
    <article className="rounded-lg border border-border bg-muted p-5">
      {(eyebrow || note) && (
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <h2 className="text-sm font-medium">{eyebrow}</h2>
          {note && (
            <span className="text-sm text-muted-foreground">{note}</span>
          )}
        </div>
      )}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
        <HealthMark health={u.health} className="font-medium" />
        {u.author && <Credit person={u.author} />}
        <time dateTime={u.date} title={formatDate(u.date)}>
          {when}
        </time>
      </div>
      <p className="mt-3 text-pretty">{u.summary}</p>
      {u.html && (
        <div
          className="reading-prose mt-3"
          dangerouslySetInnerHTML={{ __html: u.html }}
        />
      )}
    </article>
  );
}

const STATE_LABEL: Record<Commitment["state"], string> = {
  next: "Committed",
  building: "In progress",
  shipped: "Shipped",
};

export function CommitmentRecord({
  commitment: c,
  overlay = false,
  standing,
  updates = [],
}: {
  commitment: Commitment;
  /**
   * Where the work stands, for a commitment under way — derived by the route
   * from the updates below (lib/updates.ts), never stored on the record.
   * Absent for shipped and committed work, which has no health to report.
   */
  standing?: Standing;
  /** The updates posted on this commitment, newest first, with write-ups. */
  updates?: Update[];
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
  const now = new Date();
  // The card that leads the record is the newest update, for work under way.
  // Everything older runs under the write-up. Shipped and committed work has
  // no standing, so its updates, if any, are all history.
  const latest = standing ? updates[0] : undefined;
  const earlier = latest ? updates.slice(1) : updates;
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
            scroll={!overlay}
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
        {/* The one person to ask. It rendered as "Contact" while the field
            was called something else, so a reader who wanted to find it in the
            register could not. */}
        {c.lead && (
          <Row icon={ArrowUpRight} label="Lead">
            <Credit person={c.lead} />
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

      {/* The latest update, above the write-up, where Linear puts a
          project's. It is the one thing about work under way that changes
          from month to month, so it leads: the health its lead chose, who
          said so and when, and what they said. Past six weeks of silence
          the card says so on its right — the word the lead chose is still
          the last word, but it is no longer a current one — and with
          nothing ever posted the card says that instead of hiding. */}
      {standing &&
        (latest ? (
          <div className="mt-8">
            <UpdateCard
              update={latest}
              when={ago(latest.date, now)}
              eyebrow="Latest update"
              note={
                standing.health === "no-update"
                  ? `No update in ${Math.round(STALE_AFTER_DAYS / 7)} weeks`
                  : undefined
              }
            />
          </div>
        ) : (
          <div className="mt-8 rounded-lg border border-border bg-muted p-5">
            <h2 className="text-sm font-medium">Latest update</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Nothing posted yet. The lead posts one a month while the work is
              under way.
            </p>
          </div>
        ))}

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

      {/* The trail: everything posted before the latest, newest first, each
          on its own plate the way Linear's activity runs under a project.
          Titled "Earlier updates" under a latest card, since the newest one
          is already above the write-up; plain "Updates" on shipped work,
          where all of them are history. */}
      {earlier.length > 0 && (
        <section className="mt-12 border-t border-border pt-10">
          <h2 className="flex items-baseline justify-between text-sm font-medium">
            {latest ? "Earlier updates" : "Updates"}
            <span className="font-mono text-xs font-normal text-muted-foreground tabular-nums">
              {earlier.length}
            </span>
          </h2>
          <ol className="mt-6 space-y-4">
            {earlier.map((u) => (
              <li key={`${u.date}-${u.summary}`}>
                <UpdateCard update={u} when={formatDate(u.date)} />
              </li>
            ))}
          </ol>
        </section>
      )}
    </>
  );
}
