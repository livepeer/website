import Link from "next/link";
import {
  Activity,
  AlignLeft,
  ArrowUpRight,
  CalendarDays,
  ChevronDown,
  CircleCheck,
  CircleChevronDown,
  CircleDot,
  Clock,
  Link2,
  NotebookPen,
} from "lucide-react";

import { HealthIcon, HealthMark } from "@/components/livepeer-ui/health";
import {
  RecordCredit as Credit,
  RecordRow as Row,
} from "@/components/livepeer-ui/record-parts";
import type { Commitment } from "@/lib/roadmap";
import { shippedPeriod } from "@/lib/roadmap";
import {
  HEALTH_LABEL,
  STALE_AFTER_DAYS,
  type Post,
  type Standing,
} from "@/lib/health";

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

/** "Sep 9", or "Sep 9, 2025" once it is not this year — an activity date. */
function shortDate(iso: string, now: Date): string {
  const sameYear = iso.slice(0, 4) === now.toISOString().slice(0, 4);
  return new Date(iso).toLocaleDateString("en-US", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
  });
}

/**
 * One line of the activity log: an icon, who did what, and when.
 *
 * Linear's sidebar, not its feed: "ads1018 posted an update · Sep 9". A
 * row with a body is a native <details>, so the text is one click away and
 * the log stays a log. The marker is hidden and a chevron stands in, on
 * the right where the eye is not.
 */
function ActivityRow({
  icon,
  actor,
  verb,
  date,
  children,
}: {
  icon: React.ReactNode;
  actor: string;
  verb: string;
  date: string;
  children?: React.ReactNode;
}) {
  const line = (
    <>
      <span className="flex size-5 shrink-0 items-center justify-center">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="text-foreground">{actor}</span> {verb}
        <span aria-hidden="true"> · </span>
        {date}
      </span>
    </>
  );
  if (!children) {
    return (
      <li className="flex items-center gap-3 py-2 text-sm text-muted-foreground">
        {line}
      </li>
    );
  }
  return (
    <li>
      <details className="group">
        <summary className="flex cursor-pointer list-none items-center gap-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground [&::-webkit-details-marker]:hidden">
          {line}
          <ChevronDown
            className="ml-auto size-4 shrink-0 transition-transform group-open:rotate-180 motion-reduce:transition-none"
            aria-hidden
          />
        </summary>
        <div className="pt-1 pb-4 pl-8">{children}</div>
      </details>
    </li>
  );
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
  update: Post;
  when: string;
  /** "Latest update", on the card that leads the record. */
  eyebrow?: string;
  /** A remark on the card's standing, set on the right of the eyebrow. */
  note?: string;
}) {
  // Outlined, not filled. A muted plate with a border, stacked three deep,
  // read as one grey block; a hairline alone leaves each update its own
  // edge and lets the page's ground run between them. The structure does
  // the rest: health and author on the left, the date on the right, the
  // text below — the same header on every card, so the eye finds the next
  // one by its shape.
  return (
    <article className="rounded-xl border border-border p-5 sm:p-6">
      {(eyebrow || note) && (
        <div className="mb-5 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <h2 className="text-[0.6875rem] leading-4 font-medium tracking-[0.09em] text-muted-foreground uppercase">
            {eyebrow}
          </h2>
          {note && (
            <span className="text-sm text-muted-foreground">{note}</span>
          )}
        </div>
      )}
      <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-sm">
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {u.kind === "update" ? (
            <HealthMark health={u.health} className="font-medium" />
          ) : (
            <span className="inline-flex items-center gap-1.5 font-medium">
              <NotebookPen className="size-4" aria-hidden />
              Retrospective
            </span>
          )}
          {u.author && (
            <span className="text-muted-foreground">
              <Credit person={u.author} />
            </span>
          )}
        </span>
        <time
          dateTime={u.date}
          title={formatDate(u.date)}
          className="text-muted-foreground"
        >
          {when}
        </time>
      </header>
      <p className="mt-4 font-medium text-pretty">{u.summary}</p>
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
  /** The posts on this commitment, newest first, with write-ups. */
  updates?: Post[];
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
  const latest = standing
    ? updates.find((u) => u.kind === "update")
    : undefined;
  // Shipped work leads with its retrospective instead, or with the fact
  // that none has been written: the closing post is what a finished
  // commitment owes, the way an open one owes a monthly update.
  const retro =
    c.state === "shipped" ? updates.find((u) => u.kind === "retro") : undefined;
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
        {/* Where the work stands, as a property beside its status, for work
            under way. The latest update below says the same at length; this
            is the one-word answer in the place a reader scanning the facts
            looks for it, with the date the word is good as of. Past six
            weeks the word is withdrawn and the row says when it was last
            said instead. */}
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

      {/* The latest update, under the write-up and above the log, so the
          record reads as what it is, then how it is going. It sat above the
          write-up first, where Linear puts a project's, but Linear's
          activity is a sidebar; in one column that left the write-up
          sandwiched between two kinds of update. The card is the health its
          lead chose, who said so and when, and what they said. Past six weeks of silence
          the card says so on its right — the word the lead chose is still
          the last word, but it is no longer a current one — and with
          nothing ever posted the card says that instead of hiding. */}
      {c.state === "shipped" &&
        (retro ? (
          <div className="mt-10 border-t border-border pt-10">
            <UpdateCard
              update={retro}
              when={shortDate(retro.date, now)}
              eyebrow="Retrospective"
            />
          </div>
        ) : (
          <div className="mt-10 border-t border-border pt-10">
            <div className="rounded-xl border border-border p-5 sm:p-6">
              <h2 className="text-[0.6875rem] leading-4 font-medium tracking-[0.09em] text-muted-foreground uppercase">
                Retrospective
              </h2>
              <p className="mt-3 text-sm text-muted-foreground">
                None posted yet. A retrospective closes a shipped commitment:
                what was delivered against what was committed, what it cost,
                what was learned.
              </p>
            </div>
          </div>
        ))}

      {standing &&
        (latest ? (
          <div className="mt-10 border-t border-border pt-10">
            <UpdateCard
              update={latest}
              when={shortDate(latest.date, now)}
              eyebrow="Latest update"
              note={
                standing.health === "no-update"
                  ? `No update in ${Math.round(STALE_AFTER_DAYS / 7)} weeks`
                  : undefined
              }
            />
          </div>
        ) : (
          <div className="mt-10 border-t border-border pt-10">
            <div className="rounded-xl border border-border p-5 sm:p-6">
              <h2 className="text-[0.6875rem] leading-4 font-medium tracking-[0.09em] text-muted-foreground uppercase">
                Latest update
              </h2>
              <p className="mt-3 text-sm text-muted-foreground">
                Nothing posted yet. The lead posts one a month while the work is
                under way.
              </p>
            </div>
          </div>
        ))}

      {/* Activity, the way Linear keeps it beside a project: one line per
          event, newest first — every update posted, with its health as the
          icon and its text a click away, and the record's own milestones
          around them. The latest update is in the log too, even though it
          is the card above; a log with its newest entry missing is not one.
          Shown whenever there is anything to log, which for committed work
          with no updates is only the day it was committed. Directly under
          the latest card where there is one, with no rule between: the two
          are one subject. */}
      {(updates.length > 0 || c.shippedAt || c.issued) && (
        <section
          className={
            standing || c.state === "shipped"
              ? "mt-10"
              : "mt-10 border-t border-border pt-10"
          }
        >
          <h2 className="text-sm font-medium">Activity</h2>
          <ol className="mt-4">
            {/* One log in date order, newest first: the posts, and the
                record's own milestones among them. Pinning "shipped it" to
                the top put it above a retrospective written the day after,
                which is not the order things happened in. */}
            {[
              ...(c.shippedAt
                ? [
                    {
                      key: "shipped",
                      date: c.shippedAt,
                      node: (
                        <ActivityRow
                          key="shipped"
                          icon={<CircleCheck className="size-4" aria-hidden />}
                          actor={c.owner}
                          verb="shipped it"
                          date={shortDate(c.shippedAt, now)}
                        />
                      ),
                    },
                  ]
                : []),
              ...updates.map((u) => ({
                key: `${u.kind}-${u.date}-${u.summary}`,
                date: u.date,
                node: (
                  <ActivityRow
                    key={`${u.kind}-${u.date}-${u.summary}`}
                    icon={
                      u.kind === "update" ? (
                        <HealthIcon health={u.health} />
                      ) : (
                        <NotebookPen className="size-4" aria-hidden />
                      )
                    }
                    actor={u.author?.name ?? c.owner}
                    verb={
                      u.kind === "update"
                        ? `posted an update, ${HEALTH_LABEL[u.health].toLowerCase()}`
                        : "posted a retrospective"
                    }
                    date={shortDate(u.date, now)}
                  >
                    <p className="text-sm font-medium text-pretty">
                      {u.summary}
                    </p>
                    {u.html && (
                      <div
                        className="reading-prose mt-2 text-sm!"
                        dangerouslySetInnerHTML={{ __html: u.html }}
                      />
                    )}
                  </ActivityRow>
                ),
              })),
              ...(c.issued
                ? [
                    {
                      key: "issued",
                      date: c.issued,
                      node: (
                        <ActivityRow
                          key="issued"
                          icon={<CircleDot className="size-4" aria-hidden />}
                          actor={c.owner}
                          verb="committed to it"
                          date={shortDate(c.issued, now)}
                        />
                      ),
                    },
                  ]
                : []),
            ]
              .sort((a, b) => b.date.localeCompare(a.date))
              .map((e) => e.node)}
          </ol>
        </section>
      )}
    </>
  );
}
