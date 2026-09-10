import type { Commitment } from "./roadmap";
import { HEALTH_ORDER, type HealthOrNone, type UpdateSummary } from "./health";

/**
 * The changelog: one roundup per month, generated.
 *
 * Nothing here is written. A month's roundup is composed from the roadmap
 * register and the updates posted on it: what shipped in the month, what was
 * under way and what its lead said about it, and what was under way with
 * nothing said. Linear's changelog is one entry per release; Vercel's is one
 * per change; this is one per month, because the thing it is accountable for
 * is a cadence — every funded commitment reports monthly, and the roundup is
 * where a missed month is visible.
 *
 * Months are addressed as yyyy-mm, so /changelog/2026-08 is August 2026.
 * A month is published when it ends: a roundup is a report on a finished
 * month, and one that changed under the reader as the month went on would
 * be a dashboard, not a log. `roundups` therefore stops at last month;
 * `roundupFor` will still compose the month under way for whatever nudges
 * the silent before it closes (app/changelog/roundup.json).
 */

export const MONTH = /^\d{4}-(?:0[1-9]|1[0-2])$/;

export type Roundup = {
  /** yyyy-mm. */
  month: string;
  /** "August 2026". */
  title: string;
  /** The month `now` falls in, which is not over yet. Never published. */
  current: boolean;
  /**
   * Commitments that shipped this month, newest first, each with the last
   * thing its lead said before it shipped, if anything was said.
   */
  shipped: { commitment: Commitment; update?: UpdateSummary }[];
  /** Under way with an update posted this month, what needs attention first. */
  reported: { commitment: Commitment; update: UpdateSummary }[];
  /** Under way with nothing posted this month. */
  quiet: Commitment[];
};

/** "2026-08-19" → "2026-08". */
export function monthOf(iso: string): string {
  return iso.slice(0, 7);
}

export function monthTitle(month: string): string {
  return new Date(`${month}-01T00:00:00Z`).toLocaleDateString("en-US", {
    timeZone: "UTC",
    month: "long",
    year: "numeric",
  });
}

/** The last day of a month, as ISO, so dates can be compared as text. */
function endOf(month: string): string {
  const [y, m] = month.split("-").map(Number);
  const last = new Date(Date.UTC(y!, m!, 0)).getUTCDate();
  return `${month}-${String(last).padStart(2, "0")}`;
}

function nextMonth(month: string): string {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(Date.UTC(y!, m! - 1 + 1, 1));
  return d.toISOString().slice(0, 7);
}

/**
 * When a commitment's history on this site begins.
 *
 * The date it was committed, where the register records one; otherwise the
 * first thing we know about it — its first update, or the day it shipped.
 * Work under way that has none of those is taken to have started now, which
 * is the honest reading: it is not listed as silent for months nobody can
 * show it existed in.
 */
function activeFrom(
  c: Commitment,
  updates: UpdateSummary[],
  today: string
): string | undefined {
  if (c.issued) return c.issued;
  const first = updates
    .filter((u) => u.commitment === c.slug)
    .map((u) => u.date)
    .sort()[0];
  if (first) return first;
  if (c.shippedAt) return c.shippedAt;
  return c.state === "building" ? today : undefined;
}

function healthRank(health: HealthOrNone): number {
  return HEALTH_ORDER.indexOf(health);
}

/**
 * Every finished month with something to say, newest first. The month
 * under way is left out: it is published when it ends.
 *
 * A commitment is under way in a month if its history had begun by the end
 * of it and it had not shipped by then. Committed work that has not started
 * is left out unless its lead posted on it, in which case the post counts.
 */
export function roundups(
  commitments: Commitment[],
  updates: UpdateSummary[],
  now: Date
): Roundup[] {
  const today = now.toISOString().slice(0, 10);
  const thisMonth = monthOf(today);

  const starts = commitments
    .map((c) => activeFrom(c, updates, today))
    .filter((d): d is string => Boolean(d))
    .map(monthOf)
    .sort();
  const firstMonth = starts[0];
  if (!firstMonth) return [];

  const months: string[] = [];
  for (let m = firstMonth; m < thisMonth; m = nextMonth(m)) months.push(m);

  return months
    .map((month) => roundupFor(month, commitments, updates, now))
    .filter((r) => r.shipped.length + r.reported.length + r.quiet.length > 0)
    .reverse();
}

export function roundupFor(
  month: string,
  commitments: Commitment[],
  updates: UpdateSummary[],
  now: Date
): Roundup {
  const today = now.toISOString().slice(0, 10);
  const end = endOf(month);

  const shipped = commitments
    .filter((c) => c.shippedAt && monthOf(c.shippedAt) === month)
    .sort((a, b) => b.shippedAt!.localeCompare(a.shippedAt!))
    .map((commitment) => ({
      commitment,
      // The newest update posted up to the day it shipped — the lead's last
      // word on it, from whichever month it was said in.
      update: updates
        .filter(
          (u) =>
            u.commitment === commitment.slug && u.date <= commitment.shippedAt!
        )
        .sort((a, b) => b.date.localeCompare(a.date))[0],
    }));

  const posted = new Map<string, UpdateSummary>();
  for (const u of updates) {
    if (monthOf(u.date) !== month) continue;
    const held = posted.get(u.commitment);
    if (!held || held.date < u.date) posted.set(u.commitment, u);
  }

  const underWay = commitments.filter((c) => {
    if (c.shippedAt && c.shippedAt <= end) return false;
    if (posted.has(c.slug)) return true;
    if (c.state === "next") return false;
    const from = activeFrom(c, updates, today);
    return Boolean(from && from <= end);
  });

  const reported = underWay
    .filter((c) => posted.has(c.slug))
    .map((commitment) => ({ commitment, update: posted.get(commitment.slug)! }))
    .sort(
      (a, b) =>
        healthRank(a.update.health) - healthRank(b.update.health) ||
        b.update.date.localeCompare(a.update.date)
    );

  const quiet = underWay
    .filter((c) => !posted.has(c.slug))
    .sort((a, b) => a.title.localeCompare(b.title));

  return {
    month,
    title: monthTitle(month),
    current: month === monthOf(today),
    shipped,
    reported,
    quiet,
  };
}
