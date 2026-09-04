import type { Metadata } from "next";
import Link from "next/link";

import {
  FundingTable,
  Hero,
  Moves,
  Notes,
  type Move,
  type Path,
} from "./sections";

/**
 * Comparison candidate for /contribute. Same brief, same source material,
 * different editorial bet — see the commit. Not in the nav, the sitemap or
 * the share cards; one of the two gets deleted once a version is picked.
 *
 * The bet: the page answers one question, so it should read as one answer.
 * Three moves in the order a newcomer can actually take them, one table for
 * the part of the answer that is genuinely tabular, and nothing that exists
 * because a template has a slot for it.
 */

const FORUM = "https://forum.livepeer.org";

const hero = {
  eyebrow: "Contribute",
  heading: "How to get involved.",
  description:
    "Livepeer is built by independent teams and individuals, not the employees of one company. Nobody hires you: you turn up, find the work, and if it's worth funding there are five ways to fund it.",
};

const moves: Move[] = [
  {
    heading: "Talk to the people doing the work",
    body: (
      <>
        <p>
          The teams are on Discord. The longer arguments — proposals, protocol
          changes, the record of what was decided and why — are on the forum.
          Say what you’re interested in.
        </p>
        <p className="mt-4">
          That isn’t a formality. A treasury proposal needs community support
          before it goes anywhere near a vote, and grants get scoped in the
          open. The people who would fund your work are the ones reading.
        </p>
      </>
    ),
    refs: [
      { label: "Discord", href: "https://discord.gg/livepeer" },
      { label: "Forum", href: FORUM },
    ],
  },
  {
    heading: "Take something that's already scoped",
    body: (
      <>
        <p>
          The bounties board lists small, defined tasks with a known answer
          and a price. There is no proposal to write. You do the task, it gets
          reviewed, you get paid.
        </p>
        <p className="mt-4">
          If you’d rather see the shape of things first: the roadmap is what
          is committed and who is answerable for each piece, and the
          ecosystem is what has already been built on the network — which is
          the fastest way to see where the gaps are.
        </p>
      </>
    ),
    refs: [
      {
        label: "Bounties board",
        href: "https://github.com/orgs/livepeer/projects/24/views/1",
      },
      { label: "Roadmap", href: "/roadmap" },
      { label: "Ecosystem", href: "/ecosystem" },
    ],
  },
  {
    heading: "Propose something",
    body: (
      <>
        <p>
          Read <Link href="/roadmap">the roadmap</Link> first. A proposal
          that lines up with it is a much stronger proposal; one that
          duplicates it is dead on arrival. Then post on{" "}
          <a href={FORUM} target="_blank" rel="noopener noreferrer">
            the forum
          </a>{" "}
          — a pre-proposal in the treasury category, or an application in the
          relevant grants category — and let it get argued with.
        </p>
        <p className="mt-4">
          Which path it takes comes down to two things: how big it is, and
          how settled the scope already is.
        </p>
      </>
    ),
    // No link row: the table is this move's next step.
  },
];

const SPE = "Network Engineering SPE";

const paths: Path[] = [
  {
    name: "On-chain Treasury",
    decidedBy: "Vote of staked LPT",
    bestFor:
      "Large, standalone initiatives, and new Special Purpose Entities that warrant their own vote. At least seven days of forum discussion, then an on-chain vote: 33% quorum of staked LPT, majority in favour.",
    ceiling: "None",
    refs: [
      { label: "Treasury category", href: `${FORUM}/c/treasury/18` },
      {
        label: "Governance process",
        href: `${FORUM}/t/livepeer-governance-process/2767`,
      },
      { label: "Explorer", href: "https://explorer.livepeer.org/treasury" },
    ],
  },
  {
    name: "RFPs",
    decidedBy: SPE,
    bestFor:
      "Scoped work the Foundation has already defined and several builders could take on. Competitive — the brief is published first and you apply against it.",
    ceiling: "Set by the brief",
    refs: [
      {
        label: "RFP applications",
        href: `${FORUM}/t/about-the-rfp-applications-category/3070`,
      },
    ],
  },
  {
    name: "Direct Grants",
    decidedBy: SPE,
    bestFor:
      "Scope already clear, builder obvious. Anything over the ceiling goes to an RFP so other builders get a look at it.",
    ceiling: "Up to $20k",
    refs: [
      {
        label: "Direct grants",
        href: `${FORUM}/t/about-the-direct-grants-category/3261/2`,
      },
    ],
  },
  {
    name: "Retroactive Grants",
    decidedBy: SPE,
    bestFor:
      "Something you have already shipped that the network is using. Build first, apply after.",
    ceiling: "Under $5k",
    refs: [
      {
        label: "Retroactive grants",
        href: `${FORUM}/t/about-the-retroactive-grant-applications-category/3250/2`,
      },
    ],
  },
  {
    name: "Bounties",
    decidedBy: SPE,
    bestFor: "Small, well-defined tasks with a known answer.",
    ceiling: "Per task",
    refs: [
      {
        label: "Bounties board",
        href: "https://github.com/orgs/livepeer/projects/24/views/1",
      },
    ],
  },
];

const DESCRIPTION =
  "How to get involved with Livepeer: who to talk to, what you can pick up today, and the five ways work gets funded.";

export const metadata: Metadata = {
  title: "Contribute — v2",
  description: DESCRIPTION,
  // A comparison candidate. Keep it out of the index until it is the page.
  robots: { index: false, follow: false },
};

export default function ContributeV2Page() {
  return (
    <div className="pt-16 pb-24">
      <div className="mx-auto w-full max-w-page px-4 sm:px-6 lg:px-10">
        <Hero {...hero} />
        {/* One centred reading column under a centred hero. The table is the
            widest thing on the page and sets the column's width — 4xl, so the
            "best for" column gets a real measure; the prose above it is
            measured narrower inside it. */}
        <div className="mx-auto max-w-4xl">
          <Moves moves={moves} />
          <FundingTable caption="Funding paths" paths={paths} />
          <Notes>
            <p>
              {SPE} payments — RFPs, grants and bounties — are made in LPT.
              The dollar figures define the value of the work, not the
              currency it arrives in. Treasury proposals name an LPT amount
              directly.
            </p>
            <p>
              Two older programmes still turn up in old threads and search
              results:{" "}
              <a
                href="https://livepeer.notion.site/Livepeer-Governance-Hub-13d0a348568780a598acc869d19f14c8"
                target="_blank"
                rel="noopener noreferrer"
              >
                the GovWorks SPE
              </a>{" "}
              and{" "}
              <a
                href="https://github.com/livepeer/grants"
                target="_blank"
                rel="noopener noreferrer"
              >
                the original Livepeer Grants
              </a>
              . Neither takes requests any more. If a link brought you to one
              of them, the table above is what replaced it.
            </p>
          </Notes>
        </div>
      </div>
    </div>
  );
}
