import type { Metadata } from "next";
import Link from "next/link";

import { Hero, Ladder, type RungGroup } from "./sections";

/**
 * Comparison candidate for /contribute. Same brief and source material,
 * a third pass at the shape. Not in the nav, the sitemap or the share cards,
 * and noindex; one of the two gets deleted once a version is picked.
 *
 * The page answers one question, so it is two things: the answer, and the
 * one piece of reference the answer needs. The hero is the answer — a
 * sentence and a button — and the ladder is the reference. Nothing between
 * them explains what the ladder already shows.
 *
 * Copy is authored here as a typed object rather than read from a CMS
 * (CLAUDE.md → Content).
 */

const FORUM = "https://forum.livepeer.org";

const hero = {
  eyebrow: "Contribute",
  heading: "How to get involved.",
  description:
    "Livepeer is built by independent teams, not one company's employees. Say what you want to work on and someone will point you at the work.",
  primary: { label: "Join the Discord", href: "https://discord.gg/livepeer" },
  secondary: [
    { label: "Forum", href: FORUM },
    { label: "GitHub", href: "https://github.com/livepeer" },
  ],
};

/**
 * Ascending by size. The two groups are the two bodies that say yes — four
 * lanes reviewed by the SPE, then the one decided by a vote — and the size
 * order happens to agree with that split, so the ladder needs no third axis.
 */
const groups: RungGroup[] = [
  {
    name: "Network Engineering SPE",
    rungs: [
      {
        name: "Bounties",
        bestFor: "Small, defined tasks with a known answer",
        ceiling: "Per task",
        apply: {
          label: "Board",
          href: "https://github.com/orgs/livepeer/projects/24/views/1",
        },
      },
      {
        name: "Retroactive grants",
        bestFor: "Something you already shipped and the network uses",
        ceiling: "Under $5k",
        apply: {
          label: "Apply",
          href: `${FORUM}/t/about-the-retroactive-grant-applications-category/3250/2`,
        },
      },
      {
        name: "Direct grants",
        bestFor: "Scope already clear, builder already obvious",
        ceiling: "Up to $20k",
        apply: {
          label: "Apply",
          href: `${FORUM}/t/about-the-direct-grants-category/3261/2`,
        },
      },
      {
        name: "RFPs",
        bestFor: "Briefs the Foundation publishes; you apply against one",
        ceiling: "Set by the brief",
        apply: {
          label: "Apply",
          href: `${FORUM}/t/about-the-rfp-applications-category/3070`,
        },
      },
    ],
  },
  {
    name: "Livepeer Treasury",
    rungs: [
      {
        name: "Treasury proposal",
        bestFor: "Large initiatives and new SPEs, decided by community vote",
        ceiling: "No ceiling",
        apply: { label: "Propose", href: `${FORUM}/c/treasury/18` },
      },
    ],
  },
];

const DESCRIPTION =
  "How to get involved with Livepeer: who to talk to, and the five ways work gets funded.";

export const metadata: Metadata = {
  title: "Contribute — v2",
  description: DESCRIPTION,
  // A comparison candidate. Keep it out of the index until it is the page.
  robots: { index: false, follow: false },
};

export default function ContributeV2Page() {
  return (
    <div className="pt-16 pb-24">
      <Hero {...hero} />
      <Ladder
        title="How work gets funded"
        intro={
          <>
            Check <Link href="/roadmap">the roadmap</Link> first. A proposal
            that lines up with what is already committed is a much stronger
            one.
          </>
        }
        groups={groups}
        notes={[
          <>
            SPE payments are made in LPT; the dollar figures set the value of
            the work. Treasury proposals follow the{" "}
            <a
              href={`${FORUM}/t/livepeer-governance-process/2767`}
              target="_blank"
              rel="noopener noreferrer"
            >
              governance process
            </a>
            .
          </>,
          <>
            The{" "}
            <a
              href="https://livepeer.notion.site/Livepeer-Governance-Hub-13d0a348568780a598acc869d19f14c8"
              target="_blank"
              rel="noopener noreferrer"
            >
              GovWorks SPE
            </a>{" "}
            and the original{" "}
            <a
              href="https://github.com/livepeer/grants"
              target="_blank"
              rel="noopener noreferrer"
            >
              Livepeer Grants
            </a>{" "}
            no longer take requests.
          </>,
        ]}
      />
    </div>
  );
}
