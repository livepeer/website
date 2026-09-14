import type { Metadata } from "next";
import Link from "next/link";

import {
  ReportingGuide,
  type GuideSection,
} from "@/components/livepeer-ui/reporting-guide";

/**
 * What owning something on the roadmap obliges you to.
 *
 * The old help site kept three articles for "roadmap item owners" — progress
 * tracking, monthly reports, the end-of-project retrospective — beside the
 * board they reported on. The board is this site now, and the mechanisms
 * those articles asked for are built into it: a commitment's Links, the
 * update row the roadmap reads as health, the Retrospective kind. So the
 * rules live here, one page, each ending on the row it fills in.
 *
 * Reached from where the question arises rather than from the header: the
 * empty states on a record, the roadmap's rail beside "Not on the roadmap?",
 * and the foot of Contribute's path and ladder. Page copy, so it lives in the
 * repo (CLAUDE.md → Content).
 */

const TITLE = "Reporting on a commitment";
const DESCRIPTION =
  "What owning something on the Livepeer roadmap means: track the work in the open, post an update every month, and close with a retrospective.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: `${TITLE} | Livepeer`, description: DESCRIPTION },
  twitter: {
    card: "summary_large_image",
    title: `${TITLE} | Livepeer`,
    description: DESCRIPTION,
  },
};

const forum = (
  <a
    href="https://forum.livepeer.org"
    target="_blank"
    rel="noopener noreferrer"
  >
    the forum
  </a>
);

const sections: GuideSection[] = [
  {
    id: "tracking",
    title: "Track the work where anyone can check it",
    body: [
      <>
        Keep a GitHub project board with every active task and issue on it. Set
        milestones as delivery checkpoints with due dates — the phases of the
        proposal, its milestone deliverables, or quarterly checkpoints — and
        assign every issue to one. Update the status of tasks as they move.
      </>,
      <>
        The point is that a reader can see what is planned, what is under way
        and what has landed without asking. A board that is kept current makes
        every report shorter, because the report can point at it.
      </>,
    ],
    reads: (
      <>
        Put the board in the commitment&rsquo;s <strong>Links</strong>, beside
        the proposal thread and the repo. Links is where a claim on the record
        gets checked, and a record needs at least one.
      </>
    ),
  },
  {
    id: "updates",
    title: "Post an update every month",
    body: [
      <>
        At the end of each month, or when a milestone lands, whichever comes
        first. Post it as a reply in the proposal&rsquo;s thread on {forum}, so
        the record of the work stays where the work was proposed.
      </>,
      <>
        Keep it short and easy to scan. Tie every claim to something a reader
        can open — a pull request, a repository, documentation, a deployment, a
        demo — and map what was done to the milestones and goals of the
        proposal. Outcomes, not narrative.
      </>,
    ],
    template: {
      title: "What a monthly update carries",
      fields: [
        {
          name: "Project and update number",
          note: "so the thread reads in order",
        },
        { name: "Period", note: "the dates it covers" },
        {
          name: "Status",
          note: "On track, At risk or Off track. At risk says what could push it out; Off track says what changes.",
        },
        { name: "Summary", note: "one or two sentences, on outcomes" },
        {
          name: "Completed deliverables",
          note: "grouped by milestone, each with its link",
        },
        { name: "Planned for the next update" },
        { name: "When the next update is due" },
      ],
    },
    reads: (
      <>
        One row in <strong>Roadmap updates</strong>, the day you post the
        report: the summary as its one line, the status as its{" "}
        <strong>Health</strong>, and the forum post as its <strong>Link</strong>
        . The roadmap shows the newest update&rsquo;s health beside the card and
        the changelog rolls the month&rsquo;s updates up. After six weeks with
        nothing posted the card reads <em>No update</em>, whatever the last one
        said.
      </>
    ),
  },
  {
    id: "retrospective",
    title: "Close with a retrospective",
    body: [
      <>
        When the scoped work is done, the commitment owes one more post, in the
        same thread as the updates. Write it while the context is fresh. It is
        factual and about outcomes: what was committed, what was delivered, and
        the gap between them, if any.
      </>,
      <>
        Use the sections below or your own structure, as long as everything they
        ask for is there.
      </>,
    ],
    template: {
      title: "What a retrospective covers",
      fields: [
        { name: "Introduction", note: "the work in brief, and its scope" },
        {
          name: "Commitments delivered",
          note: "the original deliverables that landed, with their artifacts and what was learned making them",
        },
        {
          name: "Delivered beyond the commitment",
          note: "work outside the original scope, why it was taken on, and what it added",
        },
        {
          name: "Commitments not delivered",
          note: "what did not land, why it was dropped or changed, and what to do about it next time",
        },
        {
          name: "Impact",
          note: "what changed for the network or the ecosystem, with evidence",
        },
        { name: "Key learnings", note: "what should shape the next proposal" },
        {
          name: "Conclusion and what is next",
          note: "follow-up work, handoffs, recommended next steps",
        },
      ],
    },
    reads: (
      <>
        A row in <strong>Roadmap updates</strong> with <strong>Kind</strong> set
        to Retrospective, its one line as the summary and the forum post as its
        Link. A shipped record leads with its retrospective; until one is
        posted, its card says <em>No retrospective</em>.
      </>
    ),
  },
];

export default function ReportingPage() {
  return (
    <ReportingGuide
      eyebrow={{ label: "Roadmap", href: "/roadmap" }}
      heading="Reporting on a commitment."
      intro={
        <>
          Everything on <Link href="/roadmap">the roadmap</Link> is owned, and
          owning it means three things: the work is tracked where anyone can
          check it, its owner posts an update every month, and it closes with a
          retrospective. The roadmap is where all three show.
        </>
      }
      sections={sections}
      closing={
        <>
          These are the rules Mehrdad Sadeghi set for funded work on the
          roadmap&rsquo;s help pages, carried over as the roadmap moved here.
          How to fill in the rows themselves is on the{" "}
          <em>Posting a roadmap update</em> page beside the database in Notion.
          Questions about the rules go to {forum}.
        </>
      }
    />
  );
}
