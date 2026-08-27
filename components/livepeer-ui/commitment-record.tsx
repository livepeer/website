import Link from "next/link";
import {
  AlignLeft,
  ArrowUpRight,
  CalendarDays,
  CircleChevronDown,
  Clock,
  Link2,
} from "lucide-react";

import {
  RecordCredit as Credit,
  RecordRow as Row,
} from "@/components/livepeer-ui/record-parts";
import type { Commitment } from "@/lib/roadmap";
import { shippedPeriod } from "@/lib/roadmap";

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
}: {
  commitment: Commitment;
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
