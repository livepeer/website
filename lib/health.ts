import type { Commitment, Person } from "./roadmap";

/**
 * Updates: what the lead of a roadmap commitment says about it, on a cadence.
 *
 * The types and the derivation, with nothing that touches the filesystem, so
 * a client component can import a label without dragging the markdown reader
 * (lib/updates.ts) into the browser bundle.
 *
 * The model is Linear's project update. Whoever is answerable for a
 * commitment posts a short update — a date, a health they chose, one line,
 * and optionally a write-up — and everything the site says about how the
 * work is going is derived from those posts and the calendar. Nothing is
 * typed twice: the roadmap card shows the newest update's health, the record
 * page shows the trail, and /changelog rolls a month of them up.
 *
 * Why this rather than a status field on the commitment: a status field is
 * edited once and then believed forever. An update is dated, so silence is
 * visible — a commitment nobody has posted on in six weeks reads as
 * "No update", not as whatever it last claimed.
 */

export const HEALTHS = ["on-track", "at-risk", "off-track"] as const;
export type Health = (typeof HEALTHS)[number];

/** A health, or the absence of one: nothing posted, or nothing recent. */
export type HealthOrNone = Health | "no-update";

export const HEALTH_LABEL: Record<HealthOrNone, string> = {
  "on-track": "On track",
  "at-risk": "At risk",
  "off-track": "Off track",
  "no-update": "No update",
};

/** What needs attention first, which is how a roundup orders its rows. */
export const HEALTH_ORDER: HealthOrNone[] = [
  "off-track",
  "at-risk",
  "no-update",
  "on-track",
];

/** One update, without its write-up. What every list needs. */
export type UpdateSummary = {
  /** The commitment it reports on, by the slug its record page has. */
  commitment: string;
  /** ISO yyyy-mm-dd: the day it was posted. */
  date: string;
  health: Health;
  /** The update in one line, in the lead's own words. */
  summary: string;
  /** Who posted it. Optional — a team can post as itself. */
  author?: Person;
  draft: boolean;
};

/** An update with its write-up, rendered. Empty when there is none. */
export type Update = UpdateSummary & { html: string };

/**
 * Past this, the newest update is old enough that repeating its health would
 * be a claim nobody has made lately, and the commitment reads as No update.
 *
 * Six weeks: the cadence is monthly, and a month plus a fortnight's grace is
 * where a missed update becomes a pattern rather than a late one.
 */
export const STALE_AFTER_DAYS = 45;

const DAY = 86_400_000;

export function daysBetween(from: string, to: Date): number {
  return Math.floor((to.getTime() - new Date(from).getTime()) / DAY);
}

/**
 * Where a commitment stands today, in Linear's terms.
 *
 * Only work under way has a standing: a shipped commitment is finished and a
 * committed one has not started, so neither is on or off track. Health is
 * the newest update's, unless that update is stale, in which case it is No
 * update — and it is No update when nothing has ever been posted.
 */
export type Standing = {
  health: HealthOrNone;
  /** The newest update, stale or not, so the record can still show it. */
  latest?: UpdateSummary;
};

export function standingOf(
  commitment: Commitment,
  updates: UpdateSummary[],
  now: Date
): Standing | undefined {
  if (commitment.state !== "building") return undefined;
  const latest = updates
    .filter((u) => u.commitment === commitment.slug)
    .sort((a, b) => b.date.localeCompare(a.date))[0];
  if (!latest) return { health: "no-update" };
  const stale = daysBetween(latest.date, now) > STALE_AFTER_DAYS;
  return { health: stale ? "no-update" : latest.health, latest };
}
