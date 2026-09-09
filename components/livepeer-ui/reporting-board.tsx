import Link from "next/link";
import { ArrowUpRightIcon } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  daysSince,
  HEALTH_LABEL,
  statusOf,
  updatesIn,
  type Health,
  type Initiative,
  type Status,
  type WrapUp,
} from "@/lib/reporting";
import { cn } from "@/lib/utils";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function relative(iso: string, now: Date): string {
  const days = daysSince(iso, now);
  if (days < 1) return "today";
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return months === 1 ? "1 month ago" : `${months} months ago`;
}

/**
 * A small mono chip. The type of engagement, the health a body reported,
 * and the status the calendar computed all take this shape, so a row reads
 * as a line of facts rather than a row of widgets. Tone is greyscale except
 * where something needs attention: the one place the destructive role is
 * right on this site outside a form.
 */
function Chip({
  children,
  tone = "muted",
}: {
  children: React.ReactNode;
  tone?: "muted" | "foreground" | "alert";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm px-1.5 py-0.5 font-mono text-xs whitespace-nowrap",
        tone === "muted" && "bg-muted text-muted-foreground",
        tone === "foreground" && "bg-muted text-foreground",
        tone === "alert" && "bg-destructive/10 text-destructive"
      )}
    >
      {children}
    </span>
  );
}

function healthTone(health: Health): "muted" | "foreground" | "alert" {
  return health === "off-track"
    ? "alert"
    : health === "at-risk"
      ? "foreground"
      : "muted";
}

function statusTone(status: Status): "muted" | "foreground" | "alert" {
  if (status.group === "silent") return "alert";
  if (status.label === "Update due" || status.label === "No retro")
    return "foreground";
  return "muted";
}

function Owner({ owner }: { owner: Initiative["owner"] }) {
  if (!owner.slug) return <span>{owner.name}</span>;
  return (
    <Link
      href={`/organizations/${owner.slug}`}
      className="underline decoration-transparent underline-offset-4 transition-colors hover:decoration-border"
    >
      {owner.name}
    </Link>
  );
}

/**
 * One group of bodies: Open, Silent or Closed. A table, because the use is
 * scanning thirty rows for the one that needs attention, and a table is the
 * shape that scan wants. On a phone the latest-update column drops away and
 * the row is name, owner and status.
 */
function Group({
  title,
  note,
  rows,
  now,
}: {
  title: string;
  note: string;
  rows: { initiative: Initiative; status: Status }[];
  now: Date;
}) {
  if (rows.length === 0) return null;
  return (
    <section className="mt-16 first:mt-0">
      <div className="flex items-baseline justify-between gap-6">
        <h2 className="text-page-title">{title}</h2>
        <span className="font-mono text-xs text-muted-foreground tabular-nums">
          {rows.length}
        </span>
      </div>
      <p className="mt-2 max-w-[52ch] text-sm text-muted-foreground">{note}</p>
      <Table className="mt-6">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[38%]">Initiative</TableHead>
            <TableHead className="hidden md:table-cell">
              Latest update
            </TableHead>
            <TableHead className="w-40 text-right">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map(({ initiative, status }) => {
            const latest = initiative.updates[0];
            return (
              <TableRow key={initiative.slug} className="align-top">
                <TableCell className="py-4">
                  <div className="flex flex-col gap-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{initiative.name}</span>
                      <Chip>{initiative.type}</Chip>
                    </span>
                    <span className="text-sm text-muted-foreground">
                      <Owner owner={initiative.owner} />
                      {status.group === "closed" && initiative.ended && (
                        <> · ended {formatDate(initiative.ended)}</>
                      )}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="hidden py-4 md:table-cell">
                  {status.group === "closed" ? (
                    initiative.retrospective ? (
                      <a
                        href={initiative.retrospective}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        Retrospective
                        <ArrowUpRightIcon className="size-3.5" aria-hidden />
                      </a>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        No retrospective published
                      </span>
                    )
                  ) : latest ? (
                    <div className="flex max-w-[44ch] flex-col gap-1.5">
                      <span className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        <a
                          href={latest.href}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
                        >
                          <time dateTime={latest.date}>
                            {formatDate(latest.date)}
                          </time>
                          <ArrowUpRightIcon className="size-3.5" aria-hidden />
                        </a>
                        <span>·</span>
                        <span>{relative(latest.date, now)}</span>
                        <Chip tone={healthTone(latest.health)}>
                          {HEALTH_LABEL[latest.health]}
                        </Chip>
                      </span>
                      <span className="text-sm text-pretty">
                        {latest.summary}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      No update yet · started {formatDate(initiative.started)}
                    </span>
                  )}
                </TableCell>
                <TableCell className="py-4 text-right">
                  <Chip tone={statusTone(status)}>{status.label}</Chip>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </section>
  );
}

/**
 * The board. Linear's method, on a public page: the unit is the update a
 * body posts, with a health it chose; the site computes overdue and silent
 * from the calendar; and each row shows the latest update in one line, so a
 * stakeholder reads the page once and knows where every funded body stands.
 * Silence is something the page shows, not something a person has to say.
 */
function formatMonth(month: string): string {
  return new Date(`${month}-01`).toLocaleDateString("en-US", {
    timeZone: "UTC",
    month: "long",
    year: "numeric",
  });
}

/**
 * The monthly wrap-ups, beneath the board. The same shape as the posts on
 * roadmap.livepeer.org today, with one difference: the first section, the
 * updates the bodies logged that month, is the site's, so a wrap-up starts
 * written. The notes beneath are the part only a person writes.
 */
function WrapUps({
  wrapUps,
  initiatives,
}: {
  wrapUps: WrapUp[];
  initiatives: Initiative[];
}) {
  return (
    <section className="mt-24 border-t border-border pt-16">
      <h2 className="text-page-title">Wrap-ups</h2>
      <p className="mt-2 max-w-[52ch] text-sm text-muted-foreground">
        One a month. What each body reported, then what else moved.
      </p>
      <ol className="mt-10 divide-y divide-border">
        {wrapUps.map((wrap) => {
          const updates = updatesIn(initiatives, wrap.month);
          return (
            <li
              key={wrap.month}
              id={wrap.month}
              className="grid gap-4 py-10 first:pt-0 md:grid-cols-[14rem_minmax(0,44rem)] md:gap-12 lg:grid-cols-[18rem_minmax(0,44rem)]"
            >
              <div className="md:sticky md:top-24 md:self-start">
                <h3 className="text-xl font-medium tracking-tight">
                  {formatMonth(wrap.month)}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Posted {formatDate(wrap.date)}
                </p>
              </div>
              <div className="flex flex-col gap-8">
                {updates.length > 0 && (
                  <div>
                    <h4 className="font-mono text-xs text-muted-foreground">
                      Updates
                    </h4>
                    <ul className="mt-3 flex flex-col gap-3">
                      {updates.map(({ initiative, update }) => (
                        <li
                          key={`${initiative.slug}-${update.date}`}
                          className="text-sm leading-relaxed"
                        >
                          <span className="font-medium">{initiative.name}</span>
                          <span className="text-muted-foreground">
                            {" "}
                            · {formatDate(update.date)}{" "}
                          </span>
                          <Chip tone={healthTone(update.health)}>
                            {HEALTH_LABEL[update.health]}
                          </Chip>
                          <span className="mt-1 block text-muted-foreground">
                            {update.summary}{" "}
                            <a
                              href={update.href}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-0.5 transition-colors hover:text-foreground"
                            >
                              Read
                              <ArrowUpRightIcon
                                className="size-3"
                                aria-hidden
                              />
                            </a>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {wrap.notes.length > 0 && (
                  <div>
                    <h4 className="font-mono text-xs text-muted-foreground">
                      Also this month
                    </h4>
                    <ul className="mt-3 flex flex-col gap-2">
                      {wrap.notes.map((note) => (
                        <li
                          key={note.text}
                          className="text-sm leading-relaxed text-muted-foreground"
                        >
                          {note.href ? (
                            <a
                              href={note.href}
                              target="_blank"
                              rel="noreferrer"
                              className="text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
                            >
                              {note.text}
                            </a>
                          ) : (
                            <span className="text-foreground">{note.text}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export function ReportingBoard({
  initiatives,
  wrapUps,
  now,
}: {
  initiatives: Initiative[];
  wrapUps: WrapUp[];
  now: Date;
}) {
  const rows = initiatives.map((initiative) => ({
    initiative,
    status: statusOf(initiative, now),
  }));
  const open = rows.filter((r) => r.status.group === "open");
  const silent = rows
    .filter((r) => r.status.group === "silent")
    .sort((a, b) => {
      const am = a.status.group === "silent" ? a.status.months : 0;
      const bm = b.status.group === "silent" ? b.status.months : 0;
      return bm - am;
    });
  const closed = rows
    .filter((r) => r.status.group === "closed")
    .sort((a, b) =>
      (b.initiative.ended ?? "").localeCompare(a.initiative.ended ?? "")
    );

  return (
    <div className="pt-16 pb-24">
      <div className="mx-auto w-full max-w-page px-4 sm:px-6 lg:px-10">
        <h1 className="text-display-md font-normal">Reporting</h1>
        <p className="mt-4 max-w-[52ch] text-reading-body text-pretty text-muted-foreground">
          Every body the network funds, and whether it is reporting. Each posts
          an update on its cadence and says how it is going; the rest is the
          calendar.
        </p>
        <p className="mt-6 font-mono text-xs text-muted-foreground tabular-nums">
          {open.length} open · {silent.length} silent · {closed.length} closed ·
          as of {formatDate(now.toISOString().slice(0, 10))}
        </p>

        <div className="mt-14">
          <Group
            title="Open"
            note="Engagements in progress. Updated means an update landed within the cadence; Update due means it has not."
            rows={open}
            now={now}
          />
          <Group
            title="Silent"
            note="Open, with no update in three months or more. Nothing here is a judgment; it is the date of the last post."
            rows={silent}
            now={now}
          />
          <Group
            title="Closed"
            note="Ended engagements, and whether a retrospective was published."
            rows={closed}
            now={now}
          />
        </div>

        <WrapUps wrapUps={wrapUps} initiatives={initiatives} />
      </div>
    </div>
  );
}
