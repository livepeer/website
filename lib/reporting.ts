/**
 * Reporting: which funded bodies are reporting, and which have gone quiet.
 *
 * A mock, to be looked at before it is decided. The shape is Linear's: the
 * unit is an update, posted by the body on a cadence, carrying a health the
 * body chose. Everything a reader sees on the board is derived from those
 * updates and the calendar — overdue and silent are computed, never typed.
 *
 * The rows are placeholder data transcribed from the August 2026 status
 * dashboard on roadmap.livepeer.org, with dates and summaries invented to
 * exercise every state. If this ships, they move to a Notion database of
 * updates, one row per update, and this file keeps only the types and the
 * derivation.
 */

export type InitiativeType = "SPE" | "RFP" | "Direct grant" | "Retro grant";

export type Health = "on-track" | "at-risk" | "off-track";

export type Update = {
  /** ISO yyyy-mm-dd. */
  date: string;
  health: Health;
  /** One line, in the body's own words. */
  summary: string;
  /** The full post, on the forum. */
  href: string;
};

export type Initiative = {
  slug: string;
  name: string;
  type: InitiativeType;
  owner: { name: string; slug?: string };
  /** ISO yyyy-mm-dd. */
  started: string;
  /** Set when the engagement has ended. */
  ended?: string;
  /** The closing retrospective, when one was published. */
  retrospective?: string;
  /** How often an update is expected, in days. Monthly for an SPE. */
  cadenceDays: number;
  /** Newest first. */
  updates: Update[];
};

/**
 * Where a project stands, in Linear's terms.
 *
 * Status is what the project says about itself: in progress, or completed
 * with or without a retrospective. Health is what its latest update said,
 * On track, At risk or Off track — and "No update" when there is none, or
 * when the last one is old enough that repeating it would be a claim nobody
 * has made lately. Overdue is the calendar's: an update was expected and has
 * not arrived.
 */
export type HealthOrNone = Health | "no-update";

export type Standing =
  | {
      status: "in-progress";
      health: HealthOrNone;
      /** Past the cadence with no new update. */
      overdue: boolean;
      /** Days since the last update, or since funding if there is none. */
      age: number;
      latest?: Update;
    }
  | { status: "completed"; retrospective?: string };

const DAY = 86_400_000;

/** Past this, a reported health is stale and the project reads as No update. */
const STALE_AFTER_DAYS = 90;

export function daysSince(iso: string, now: Date): number {
  return Math.floor((now.getTime() - new Date(iso).getTime()) / DAY);
}

export function standingOf(project: Initiative, now: Date): Standing {
  if (project.ended) {
    return { status: "completed", retrospective: project.retrospective };
  }
  const latest = project.updates[0];
  if (!latest) {
    const age = daysSince(project.started, now);
    return {
      status: "in-progress",
      health: "no-update",
      overdue: age > project.cadenceDays,
      age,
    };
  }
  const age = daysSince(latest.date, now);
  return {
    status: "in-progress",
    health: age >= STALE_AFTER_DAYS ? "no-update" : latest.health,
    overdue: age > project.cadenceDays,
    age,
    latest,
  };
}

/** The order the in-progress table sorts by: what needs attention first. */
export const HEALTH_ORDER: HealthOrNone[] = [
  "off-track",
  "at-risk",
  "no-update",
  "on-track",
];

export const HEALTH_LABEL: Record<HealthOrNone, string> = {
  "on-track": "On track",
  "at-risk": "At risk",
  "off-track": "Off track",
  "no-update": "No update",
};

const forum = (thread: string) => `https://forum.livepeer.org/t/${thread}`;

// -- Placeholder rows ---------------------------------------------------------

export const PLACEHOLDER_INITIATIVES: Initiative[] = [
  // Open, reporting
  {
    slug: "protocol-rd-spe-phase-2",
    name: "Protocol R&D SPE",
    type: "SPE",
    owner: { name: "Protocol R&D SPE", slug: "protocol-r-d-spe" },
    started: "2026-06-05",
    cadenceDays: 31,
    updates: [
      {
        date: "2026-09-02",
        health: "on-track",
        summary:
          "Update #7: Immunefi volume more than doubled. August release deliberately skipped, nothing mature enough to ship.",
        href: forum("protocol-r-d-spe-phase-2-update-7"),
      },
      {
        date: "2026-08-01",
        health: "on-track",
        summary:
          "Update #6: highest-volume vulnerability-response month yet; LIP-118 deployed on 30 July.",
        href: forum("protocol-r-d-spe-update-6"),
      },
    ],
  },
  {
    slug: "embody-weave-growth-spe",
    name: "Embody / WEAVE Growth SPE",
    type: "SPE",
    owner: { name: "WEAVE" },
    started: "2026-04-04",
    cadenceDays: 31,
    updates: [
      {
        date: "2026-08-28",
        health: "on-track",
        summary:
          "Livepeer Agent Hackathon live, 8 registrations; Punch Compute stable, payments next.",
        href: forum("weave-growth-spe-august-update"),
      },
    ],
  },
  {
    slug: "payment-clearinghouse",
    name: "Livepeer Payment Clearinghouse",
    type: "Direct grant",
    owner: { name: "Elite Code Solutions" },
    started: "2026-06-12",
    cadenceDays: 31,
    updates: [
      {
        date: "2026-08-25",
        health: "at-risk",
        summary:
          "Milestone 3 slipped two weeks on Arbitrum settlement testing; milestone 2 signed off.",
        href: forum("payment-clearinghouse-milestone-update"),
      },
    ],
  },
  {
    slug: "subgraph-audit",
    name: "Livepeer Subgraph Audit",
    type: "Direct grant",
    owner: { name: "RaidGuild", slug: "raidguild" },
    started: "2026-07-14",
    cadenceDays: 31,
    updates: [
      {
        date: "2026-08-22",
        health: "on-track",
        summary:
          "Audit delivered; findings and fixes published, two mediums closed.",
        href: forum("subgraph-audit-delivered"),
      },
    ],
  },
  // Open, late
  {
    slug: "direct-grant-flux-klein",
    name: "Flux Klein over Trickle",
    type: "Retro grant",
    owner: { name: "Independent" },
    started: "2026-07-20",
    cadenceDays: 31,
    updates: [
      {
        date: "2026-07-24",
        health: "on-track",
        summary: "Grant application posted; awaiting decision.",
        href: forum("retro-grant-flux-klein"),
      },
    ],
  },
  // Open, preparing
  {
    slug: "network-engineering-spe-ii",
    name: "Network Engineering SPE II",
    type: "SPE",
    owner: { name: "Network Engineering SPE", slug: "network-engineering-spe" },
    started: "2026-09-01",
    cadenceDays: 31,
    updates: [],
  },
  // Silent
  {
    slug: "liveinfra-spe",
    name: "LiveInfra SPE",
    type: "SPE",
    owner: { name: "LiveInfra" },
    started: "2026-01-10",
    cadenceDays: 31,
    updates: [
      {
        date: "2026-04-14",
        health: "on-track",
        summary: "Q2 2026 operations plan posted.",
        href: forum("liveinfra-spe-q2-2026"),
      },
    ],
  },
  {
    slug: "lisar-spe",
    name: "LISAR SPE",
    type: "SPE",
    owner: { name: "LISAR" },
    started: "2025-11-01",
    cadenceDays: 31,
    updates: [
      {
        date: "2026-03-30",
        health: "at-risk",
        summary: "Hiring for the second engineer; timeline under review.",
        href: forum("lisar-spe-march-update"),
      },
    ],
  },
  {
    slug: "gwid-spe",
    name: "GWID SPE",
    type: "SPE",
    owner: { name: "Gateway Wizard" },
    started: "2025-12-01",
    cadenceDays: 31,
    updates: [
      {
        date: "2026-05-02",
        health: "on-track",
        summary: "Gateway onboarding docs published.",
        href: forum("gwid-spe-april-update"),
      },
    ],
  },
  {
    slug: "streamplace-spe",
    name: "Streamplace SPE",
    type: "SPE",
    owner: { name: "Streamplace" },
    started: "2025-10-01",
    cadenceDays: 31,
    updates: [
      {
        date: "2026-05-20",
        health: "off-track",
        summary: "Paused pending a revised scope; no work billed this month.",
        href: forum("streamplace-spe-may-update"),
      },
    ],
  },
  // Closed, retro done
  {
    slug: "network-engineering-spe-pilot",
    name: "Network Engineering SPE (pilot)",
    type: "SPE",
    owner: { name: "Network Engineering SPE", slug: "network-engineering-spe" },
    started: "2026-05-15",
    ended: "2026-08-31",
    retrospective: forum("network-engineering-spe-pilot-retrospective"),
    cadenceDays: 31,
    updates: [
      {
        date: "2026-08-30",
        health: "on-track",
        summary:
          "Pilot closed on schedule: 11 pieces of work, full budget published.",
        href: forum("network-engineering-spe-pilot-retrospective"),
      },
    ],
  },
  {
    slug: "protocol-rd-spe-phase-1",
    name: "Protocol R&D SPE (Phase 1)",
    type: "SPE",
    owner: { name: "Protocol R&D SPE", slug: "protocol-r-d-spe" },
    started: "2026-01-01",
    ended: "2026-06-30",
    retrospective: forum("protocol-r-d-spe-phase-1-retrospective"),
    cadenceDays: 31,
    updates: [],
  },
  {
    slug: "delegator-ux-analysis",
    name: "Delegator UX Analysis",
    type: "RFP",
    owner: { name: "RaidGuild", slug: "raidguild" },
    started: "2026-05-29",
    ended: "2026-07-31",
    retrospective: forum("delegator-ux-analysis-retrospective"),
    cadenceDays: 31,
    updates: [],
  },
  {
    slug: "documentation-restructure",
    name: "Documentation Restructure",
    type: "RFP",
    owner: { name: "Livepeer Foundation", slug: "livepeer-foundation" },
    started: "2026-02-01",
    ended: "2026-05-04",
    retrospective: forum("documentation-restructure-retrospective"),
    cadenceDays: 31,
    updates: [],
  },
  {
    slug: "explorer-maintenance",
    name: "Explorer Maintenance",
    type: "RFP",
    owner: { name: "RaidGuild", slug: "raidguild" },
    started: "2025-11-01",
    ended: "2026-05-04",
    retrospective: forum("explorer-maintenance-retrospective"),
    cadenceDays: 31,
    updates: [],
  },
  {
    slug: "cloud-spe",
    name: "Cloud SPE",
    type: "SPE",
    owner: { name: "Cloud SPE" },
    started: "2025-09-01",
    ended: "2026-04-30",
    retrospective: forum("cloud-spe-close-out"),
    cadenceDays: 31,
    updates: [],
  },
  // Closed, no retro
  {
    slug: "event-marketing-fund-spe",
    name: "Event Marketing Fund SPE",
    type: "SPE",
    owner: { name: "Event Marketing Fund" },
    started: "2025-06-01",
    ended: "2025-12-31",
    cadenceDays: 31,
    updates: [],
  },
  {
    slug: "govworks-spe",
    name: "GovWorks SPE",
    type: "SPE",
    owner: { name: "GovWorks" },
    started: "2025-05-01",
    ended: "2025-11-30",
    cadenceDays: 31,
    updates: [],
  },
  {
    slug: "realtime-interactive-video-spe",
    name: "Realtime Interactive Video SPE",
    type: "SPE",
    owner: { name: "RIV" },
    started: "2025-07-01",
    ended: "2026-01-31",
    cadenceDays: 31,
    updates: [],
  },
  {
    slug: "web3-social-video-spe",
    name: "Web3 Social Video SPE",
    type: "SPE",
    owner: { name: "W3SV" },
    started: "2025-04-01",
    ended: "2025-10-31",
    cadenceDays: 31,
    updates: [],
  },
];
