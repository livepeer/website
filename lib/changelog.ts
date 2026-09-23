import type { Commitment } from "./roadmap";
import type { Entry } from "./entries";
import {
  HEALTH_ORDER,
  type HealthOrNone,
  type PostSummary,
  type RetroSummary,
  type UpdateSummary,
} from "./health";
import { parsePeriod, type Period } from "./period";

/**
 * The changelog: one entry per published period, generated.
 *
 * Nothing here is written but the headline. An entry's body is composed
 * from the roadmap register and the updates posted on it: what shipped in
 * the period, what was under way and what its lead said about it, and what
 * was under way with nothing said. Linear's changelog is one entry per
 * release; Vercel's is one per change; this is one per period the team
 * publishes, because the thing it is accountable for is a reporting
 * cadence — and the cadence is whatever the rows in _Changelog entries_
 * say (lib/period.ts), month by month today.
 *
 * A row is the act of publishing. An entry appears when its row does, and
 * not before its period has closed: an entry that changed under the reader
 * as the period went on would be a dashboard, not a log. `roundupFor` will
 * still compose an open period for whatever nudges the silent before it
 * closes (app/changelog/roundup.json).
 */

export type Roundup = Period & {
  /** The row's headline, where one was written. */
  headline?: string;
  /** The period has not ended: composed for a nudge, never published. */
  open: boolean;
  /**
   * Commitments that shipped in the period, newest first, each with its
   * retrospective if one had been posted by the period's end, and the last
   * update its lead posted before it shipped, if anything was said.
   */
  shipped: {
    commitment: Commitment;
    retro?: RetroSummary;
    update?: UpdateSummary;
  }[];
  /** Under way with an update posted in the period, what needs attention first. */
  reported: { commitment: Commitment; update: UpdateSummary }[];
  /** Under way with nothing posted in the period. */
  quiet: Commitment[];
};

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
  updates: PostSummary[],
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
 * The published entries, newest first: one per row whose period has
 * closed. A row for a period still under way waits until it ends. An
 * entry with nothing in it is still an entry — publishing it was a choice.
 */
export function roundups(
  entries: Entry[],
  commitments: Commitment[],
  updates: PostSummary[],
  now: Date
): Roundup[] {
  return entries
    .map((e) => roundupFor(e.period, commitments, updates, now, e.headline))
    .filter((r) => !r.open)
    .sort(
      (a, b) => b.start.localeCompare(a.start) || b.end.localeCompare(a.end)
    );
}

export function roundupFor(
  key: string,
  commitments: Commitment[],
  updates: PostSummary[],
  now: Date,
  headline?: string
): Roundup {
  const today = now.toISOString().slice(0, 10);
  const period = parsePeriod(key);
  const { start, end } = period;
  const within = (iso: string) => iso >= start && iso <= end;

  const shipped = commitments
    .filter((c) => c.shippedAt && within(c.shippedAt))
    .sort((a, b) => b.shippedAt!.localeCompare(a.shippedAt!))
    .map((commitment) => ({
      commitment,
      // The retrospective, if one had been posted by the period's end: an
      // entry is the period as it ended, so a retro written later belongs
      // to the record page, not to this entry.
      retro: updates
        .filter(
          (u): u is RetroSummary =>
            u.kind === "retro" &&
            u.commitment === commitment.slug &&
            u.date <= end
        )
        .sort((a, b) => b.date.localeCompare(a.date))[0],
      // The newest update posted up to the day it shipped — the lead's last
      // word on it, from whichever period it was said in.
      update: updates
        .filter(
          (u): u is UpdateSummary =>
            u.kind === "update" &&
            u.commitment === commitment.slug &&
            u.date <= commitment.shippedAt!
        )
        .sort((a, b) => b.date.localeCompare(a.date))[0],
    }));

  const posted = new Map<string, UpdateSummary>();
  for (const u of updates) {
    if (u.kind !== "update" || !within(u.date)) continue;
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
    ...period,
    headline,
    open: end >= today,
    shipped,
    reported,
    quiet,
  };
}
