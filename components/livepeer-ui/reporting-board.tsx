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
  HEALTH_LABEL,
  HEALTH_ORDER,
  standingOf,
  type HealthOrNone,
  type Initiative,
  type Standing,
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

function relative(days: number): string {
  if (days < 1) return "today";
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return months === 1 ? "1 month ago" : `${months} months ago`;
}

/**
 * Health, the way Linear shows it: a dot, then the word. Linear's dots are
 * green, yellow, red and grey. The system's rule is that green is never a
 * status colour and the chart roles are greyscale, so here On track is a
 * quiet dot, At risk a full one, Off track the destructive red, and No
 * update a hollow ring — the one that means nothing has been said.
 */
function HealthDot({ health }: { health: HealthOrNone }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-block size-2 shrink-0 rounded-full",
        health === "on-track" && "bg-muted-foreground/50",
        health === "at-risk" && "bg-foreground",
        health === "off-track" && "bg-destructive",
        health === "no-update" && "border border-muted-foreground/60"
      )}
    />
  );
}

function Health({ standing }: { standing: Standing }) {
  if (standing.status === "completed") {
    return (
      <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
        <HealthDot health="on-track" />
        Completed
      </span>
    );
  }
  return (
    <span className="flex flex-col gap-1">
      <span
        className={cn(
          "inline-flex items-center gap-2 text-sm",
          standing.health === "off-track" && "text-destructive",
          standing.health === "no-update" && "text-muted-foreground"
        )}
      >
        <HealthDot health={standing.health} />
        {HEALTH_LABEL[standing.health]}
      </span>
      {standing.overdue && (
        <span className="pl-4 font-mono text-xs text-destructive">
          Update overdue
        </span>
      )}
    </span>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-sm bg-muted px-1.5 py-0.5 font-mono text-xs whitespace-nowrap text-muted-foreground">
      {children}
    </span>
  );
}

function Lead({ owner }: { owner: Initiative["owner"] }) {
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
 * One status group, In progress or Completed: Linear's project list, with
 * the columns it has — health, the project, its lead, and the last update.
 * A table, because the use is scanning thirty rows for the one that needs
 * attention. On a phone the last-update column drops away.
 */
function StatusGroup({
  title,
  note,
  rows,
}: {
  title: string;
  note: string;
  rows: { project: Initiative; standing: Standing }[];
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
            <TableHead className="w-36">Health</TableHead>
            <TableHead className="w-[32%]">Project</TableHead>
            <TableHead className="hidden w-40 sm:table-cell">Lead</TableHead>
            <TableHead className="hidden md:table-cell">Last update</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map(({ project, standing }) => (
            <TableRow key={project.slug} className="align-top">
              <TableCell className="py-4">
                <Health standing={standing} />
              </TableCell>
              <TableCell className="py-4">
                <div className="flex flex-col gap-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{project.name}</span>
                    <Chip>{project.type}</Chip>
                  </span>
                  {standing.status === "completed" && project.ended && (
                    <span className="text-sm text-muted-foreground">
                      Completed {formatDate(project.ended)}
                    </span>
                  )}
                  <span className="text-sm text-muted-foreground sm:hidden">
                    <Lead owner={project.owner} />
                  </span>
                </div>
              </TableCell>
              <TableCell className="hidden py-4 text-sm text-muted-foreground sm:table-cell">
                <Lead owner={project.owner} />
              </TableCell>
              <TableCell className="hidden py-4 md:table-cell">
                {standing.status === "completed" ? (
                  standing.retrospective ? (
                    <a
                      href={standing.retrospective}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      Retrospective
                      <ArrowUpRightIcon className="size-3.5" aria-hidden />
                    </a>
                  ) : (
                    <span className="text-sm text-destructive">
                      No retrospective
                    </span>
                  )
                ) : standing.latest ? (
                  <div className="flex max-w-[44ch] flex-col gap-1">
                    <span className="flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
                      <span
                        className={cn(
                          standing.health === "no-update" && "text-destructive"
                        )}
                      >
                        {relative(standing.age)}
                      </span>
                      <span>·</span>
                      <a
                        href={standing.latest.href}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
                      >
                        <time dateTime={standing.latest.date}>
                          {formatDate(standing.latest.date)}
                        </time>
                        <ArrowUpRightIcon className="size-3.5" aria-hidden />
                      </a>
                    </span>
                    <span className="text-sm text-pretty">
                      {standing.latest.summary}
                    </span>
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    None yet · funded {formatDate(project.started)}
                  </span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </section>
  );
}

/**
 * The board, in Linear's terms. Every funded engagement is a project with a
 * lead. Its lead posts a project update on a cadence and picks a health for
 * it: On track, At risk, Off track. The site adds the two things Linear's
 * calendar adds — Update overdue when the cadence has passed, and No update
 * when nothing has been said for long enough that the last health no longer
 * counts — and lists projects by status, In progress and Completed, with the
 * ones that need attention first.
 */
export function ReportingBoard({
  projects,
  now,
}: {
  projects: Initiative[];
  now: Date;
}) {
  const rows = projects.map((project) => ({
    project,
    standing: standingOf(project, now),
  }));
  const healthOf = (s: Standing): HealthOrNone =>
    s.status === "in-progress" ? s.health : "on-track";
  const inProgress = rows
    .filter((r) => r.standing.status === "in-progress")
    .sort(
      (a, b) =>
        HEALTH_ORDER.indexOf(healthOf(a.standing)) -
        HEALTH_ORDER.indexOf(healthOf(b.standing))
    );
  const completed = rows
    .filter((r) => r.standing.status === "completed")
    .sort((a, b) =>
      (b.project.ended ?? "").localeCompare(a.project.ended ?? "")
    );

  const count = (health: HealthOrNone) =>
    inProgress.filter((r) => healthOf(r.standing) === health).length;

  return (
    <div className="pt-16 pb-24">
      <div className="mx-auto w-full max-w-page px-4 sm:px-6 lg:px-10">
        <h1 className="text-display-md font-normal">Reporting</h1>
        <p className="mt-4 max-w-[52ch] text-reading-body text-pretty text-muted-foreground">
          Every project the network funds, its health, and when its lead last
          reported. Each lead posts an update on a cadence and says whether the
          project is on track; the rest is the calendar.
        </p>
        <p className="mt-6 flex flex-wrap gap-x-5 gap-y-1 font-mono text-xs text-muted-foreground tabular-nums">
          {HEALTH_ORDER.map((health) => (
            <span key={health} className="inline-flex items-center gap-2">
              <HealthDot health={health} />
              {count(health)} {HEALTH_LABEL[health].toLowerCase()}
            </span>
          ))}
          <span>as of {formatDate(now.toISOString().slice(0, 10))}</span>
        </p>

        <div className="mt-14">
          <StatusGroup
            title="In progress"
            note="Funded and under way. Health is what the lead's latest update said; No update means nothing has been said in three months, or ever."
            rows={inProgress}
          />
          <StatusGroup
            title="Completed"
            note="Ended engagements, and whether a retrospective was published."
            rows={completed}
          />
        </div>
      </div>
    </div>
  );
}
