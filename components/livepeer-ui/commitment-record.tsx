import Link from "next/link";
import {
  Activity,
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
import type { Standing, Update } from "@/lib/health";

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
        {/* What the lead last said, and when. The date matters as much as
            the word: "On track" as of last week and as of three months ago
            are different claims, and past six weeks the word is withdrawn
            and the row says so. */}
        {standing && (
          <Row icon={Activity} label="Health">
            <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <HealthMark health={standing.health} />
              {standing.latest && (
                <span className="text-muted-foreground">
                  {standing.health === "no-update" ? "last posted" : "as of"}{" "}
                  {formatDate(standing.latest.date)}
                </span>
              )}
            </span>
          </Row>
        )}
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

      {/* The trail: every update posted on this commitment, newest first,
          the way Linear's activity runs under a project. Each is what its
          lead said and when, with the health they chose beside the date and
          the write-up beneath where there is one. Shown for work under way
          even when empty, because "nothing posted yet" is the fact a reader
          came for; hidden on shipped and committed work with no trail. */}
      {(updates.length > 0 || standing) && (
        <section className="mt-12 border-t border-border pt-10">
          <h2 className="flex items-baseline justify-between text-sm font-medium">
            Updates
            {updates.length > 0 && (
              <span className="font-mono text-xs font-normal text-muted-foreground tabular-nums">
                {updates.length}
              </span>
            )}
          </h2>
          {updates.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Nothing posted yet. The lead posts one a month while the work is
              under way.
            </p>
          ) : (
            <ol className="mt-6 space-y-8">
              {updates.map((u) => (
                <li key={`${u.date}-${u.summary}`}>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                    <HealthMark health={u.health} />
                    <time dateTime={u.date}>{formatDate(u.date)}</time>
                    {u.author && <Credit person={u.author} />}
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-pretty">
                    {u.summary}
                  </p>
                  {u.html && (
                    <div
                      className="reading-prose mt-3"
                      dangerouslySetInnerHTML={{ __html: u.html }}
                    />
                  )}
                </li>
              ))}
            </ol>
          )}
        </section>
      )}
    </>
  );
}
