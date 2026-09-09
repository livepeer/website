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

export type Group = "open" | "silent" | "closed";

export type Status =
  | { group: "open"; label: "Updated" | "Update due" | "Preparing" }
  | { group: "silent"; label: string; months: number }
  | { group: "closed"; label: "Retro done" | "No retro" };

const DAY = 86_400_000;

/** After this long with no update, a body is silent rather than merely late. */
const SILENT_AFTER_DAYS = 90;

export function daysSince(iso: string, now: Date): number {
  return Math.floor((now.getTime() - new Date(iso).getTime()) / DAY);
}

/**
 * Where a body stands, from its updates and the date. Closed is a fact the
 * body states (an end date); everything else is the calendar's verdict.
 */
export function statusOf(initiative: Initiative, now: Date): Status {
  if (initiative.ended) {
    return {
      group: "closed",
      label: initiative.retrospective ? "Retro done" : "No retro",
    };
  }
  const latest = initiative.updates[0];
  if (!latest) {
    // Funded but has not reported yet. Preparing until the first update is
    // due; after that it is late like anyone else.
    const age = daysSince(initiative.started, now);
    if (age <= initiative.cadenceDays)
      return { group: "open", label: "Preparing" };
    return silent(age);
  }
  const age = daysSince(latest.date, now);
  if (age >= SILENT_AFTER_DAYS) return silent(age);
  if (age > initiative.cadenceDays)
    return { group: "open", label: "Update due" };
  return { group: "open", label: "Updated" };
}

function silent(ageDays: number): Status {
  const months = Math.max(3, Math.floor(ageDays / 30));
  return { group: "silent", label: `${months} months silent`, months };
}

export const HEALTH_LABEL: Record<Health, string> = {
  "on-track": "On track",
  "at-risk": "At risk",
  "off-track": "Off track",
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

// -- Wrap-ups ----------------------------------------------------------------

/**
 * The monthly wrap-up: one per month, posted when the month closes. The
 * updates the bodies logged that month are listed by the site; the notes are
 * the part only a person writes — proposals, RFCs, threads, applications.
 */
export type WrapUp = {
  /** yyyy-mm. */
  month: string;
  /** The day it was posted. */
  date: string;
  notes: { text: string; href?: string }[];
};

/** Every update logged in a month, newest first, with its body. */
export function updatesIn(
  initiatives: Initiative[],
  month: string
): { initiative: Initiative; update: Update }[] {
  return initiatives
    .flatMap((initiative) =>
      initiative.updates
        .filter((update) => update.date.startsWith(month))
        .map((update) => ({ initiative, update }))
    )
    .sort((a, b) => b.update.date.localeCompare(a.update.date));
}

/** Placeholder, from the August and July wrap-ups on roadmap.livepeer.org. */
export const PLACEHOLDER_WRAPUPS: WrapUp[] = [
  {
    month: "2026-08",
    date: "2026-09-08",
    notes: [
      {
        text: "NE SPE II pre-proposal: $230k for Sep–Dec, four tracks with named owners; milestones land mid-September.",
        href: forum("network-engineering-spe-ii-pre-proposal"),
      },
      {
        text: "livepeer.bot: a shared LIP-118 reward caller on Arbitrum One; orchestrator keys can go cold.",
        href: forum("livepeer-bot-reward-caller"),
      },
      {
        text: "Treasury reward cut restart reopened. No pushback on restoring it; the debate is the cap.",
        href: forum("treasury-reward-cut-restart"),
      },
    ],
  },
  {
    month: "2026-07",
    date: "2026-08-04",
    notes: [
      {
        text: "LIP-118, Delegated Reward Calling: discussion thread opened by rickstaa.",
        href: forum("lip-118-delegated-reward-calling"),
      },
      {
        text: "Livepeer 2.0: “A Path to Livepeer 2.0” by dob, “The Initial Roadmap” by honestly_rich, and the Delegators, Node Operator and Validators 2.0 threads.",
        href: forum("a-path-to-livepeer-2-0"),
      },
      {
        text: "RFC: Agent Framework, The Five Milestones, by Qiang Han; comments open through August 10.",
        href: forum("rfc-agent-framework"),
      },
      {
        text: "New retroactive grant applications: Flux Klein over Trickle; vLLM real-time transcription.",
      },
      {
        text: "Livepeer Testnet proposal posted by Sidestream.",
        href: forum("livepeer-testnet-proposal"),
      },
    ],
  },
];
