import type { Metadata } from "next";

import {
  ContributeFundingSection,
  ContributeHeroSection,
  ContributeRetiredSection,
  ContributeStartSection,
  ContributeWorkSection,
  type ContributeCard,
  type FundingGroup,
} from "@/components/livepeer-ui/contribute-sections";

/**
 * The answer to "how can I get involved?".
 *
 * No mockup — built from the Foundation's Grants & Funding Mechanisms page,
 * which until now was the destination for the forum's welcome post and a
 * Notion link nobody outside the workspace could find. The brief was that
 * the barrier is too high: a reader has to already know that SPEs exist, that
 * grants come in four sizes, and which forum category takes which.
 *
 * So the order is the order a newcomer needs, not the order the org chart
 * suggests. What the network is trying to build, then how work gets paid for,
 * then the door you can walk through today without a proposal at all — because
 * most people arrive without one, and telling them to write a treasury
 * proposal first is the barrier being described.
 *
 * Copy is authored here as a typed object rather than read from a CMS
 * (CLAUDE.md → Content).
 */
const hero = {
  eyebrow: "Contribute",
  heading: "Start contributing to Livepeer.",
  description:
    "The network is built by people who don't work for any one company. Here is what it is trying to build, how that work gets paid for, and where to go first.",
};

const work: { title: string; intro: string; links: ContributeCard[] } = {
  title: "Start with what's already committed",
  intro:
    "The roadmap is the work the Foundation and the teams around it have put their names to. Ideas start on the forum and appear there once they are owned and dated. A proposal that lines up with something already on the roadmap is a far stronger proposal — and reading it costs a minute.",
  links: [
    {
      label: "Roadmap",
      href: "/roadmap",
      note: "What is committed, what is in progress, and what has shipped — with the organisation answerable for each.",
    },
    {
      label: "Forum",
      href: "https://forum.livepeer.org",
      note: "Where ideas are proposed and argued about before anyone owns them. Post yours here first.",
    },
  ],
};

const funding: { title: string; intro: string; groups: FundingGroup[] } = {
  title: "How work gets funded",
  intro:
    "Five paths, run by two bodies. Which one is yours comes down to how large the work is and how settled its scope already is.",
  groups: [
    {
      name: "Livepeer Treasury",
      intro:
        "On-chain and funded by the protocol itself. Decided by everyone holding staked LPT, so the bar is a public vote rather than a review.",
      paths: [
        {
          name: "On-chain Treasury",
          bestFor:
            "Larger, standalone initiatives, and new Special Purpose Entities that warrant their own community vote.",
          detail:
            "Post a pre-proposal in the forum's Treasury category and refine it with the community for at least seven days. It then goes to an on-chain vote, which passes on a 33% quorum of staked LPT and a majority in favour.",
          links: [
            {
              label: "Treasury category",
              href: "https://forum.livepeer.org/c/treasury/18",
            },
            {
              label: "Governance process",
              href: "https://forum.livepeer.org/t/livepeer-governance-process/2767",
            },
            {
              label: "Explorer",
              href: "https://explorer.livepeer.org/treasury",
            },
          ],
        },
      ],
    },
    {
      name: "Network Engineering SPE",
      intro:
        "Four lanes for engineering work on the network, reviewed by the SPE rather than voted on. Smaller and faster than the Treasury.",
      paths: [
        {
          name: "RFPs",
          bestFor:
            "Scoped work the Foundation has already defined and several builders could take on.",
          detail:
            "Competitive. The brief is published first and you apply against it.",
          links: [
            {
              label: "About RFP applications",
              href: "https://forum.livepeer.org/t/about-the-rfp-applications-category/3070",
            },
          ],
        },
        {
          name: "Direct Grants",
          bestFor:
            "Work whose scope is already clear and whose builder is obvious.",
          detail:
            "Capped at $20k. Anything larger goes to an RFP so other builders get a look at it.",
          links: [
            {
              label: "About direct grants",
              href: "https://forum.livepeer.org/t/about-the-direct-grants-category/3261/2",
            },
          ],
        },
        {
          name: "Retroactive Grants",
          bestFor:
            "Something you have already shipped that the network is using.",
          detail:
            "Build first, then apply. Under $5k per application, so it rewards work rather than commissioning it.",
          links: [
            {
              label: "About retroactive grants",
              href: "https://forum.livepeer.org/t/about-the-retroactive-grant-applications-category/3250/2",
            },
          ],
        },
        {
          name: "Bounties",
          bestFor: "Small, well-defined tasks with a known answer.",
          detail:
            "Posted on a public board. The shortest path from reading this page to shipping something.",
          links: [
            {
              label: "Bounties board",
              href: "https://github.com/orgs/livepeer/projects/24/views/1",
            },
          ],
        },
      ],
      footnote:
        "Every Network Engineering SPE payment — RFPs, grants, and bounties alike — is made in LPT. The dollar figures above define the value of the approved work, not the currency it arrives in.",
    },
  ],
};

const start: { title: string; intro: string; links: ContributeCard[] } = {
  title: "Or start without a proposal",
  intro:
    "Most people don't arrive with one. Contributing here starts with turning up, saying what you are interested in, and finding the person already working on it.",
  links: [
    {
      label: "Discord",
      href: "https://discord.gg/livepeer",
      note: "Where the teams actually talk. Say what you're interested in and someone will point you at the work.",
    },
    {
      label: "Bounties board",
      href: "https://github.com/orgs/livepeer/projects/24/views/1",
      note: "Small, scoped tasks that are already agreed. A first contribution with no proposal to write.",
    },
    {
      label: "GitHub",
      href: "https://github.com/livepeer",
      note: "The protocol, the node software, and the tooling around them. Issues and pull requests welcome.",
    },
    {
      label: "Ecosystem",
      href: "/ecosystem",
      note: "What people have already built on the network — the fastest way to see where the gaps are.",
    },
  ],
};

const retired: { title: string; intro: string; links: ContributeCard[] } = {
  title: "No longer taking requests",
  intro:
    "You may still find these linked from older posts and threads. They are kept here so you can recognise a dead end rather than wait on one.",
  links: [
    {
      label: "GovWorks SPE",
      href: "https://livepeer.notion.site/Livepeer-Governance-Hub-13d0a348568780a598acc869d19f14c8",
      note: "The previous governance and proposal-support entity. Governance now runs through the forum and the Treasury.",
    },
    {
      label: "Livepeer Grants",
      href: "https://github.com/livepeer/grants",
      note: "The earlier grants programme, superseded by the Network Engineering SPE's four lanes.",
    },
  ],
};

const DESCRIPTION =
  "How to contribute to Livepeer — the five funding paths, what each one is for, and where to start if you don't have a proposal yet.";

export const metadata: Metadata = {
  title: "Contribute",
  description: DESCRIPTION,
  openGraph: {
    title: "Contribute | Livepeer",
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "Contribute | Livepeer",
    description: DESCRIPTION,
  },
};

export default function ContributePage() {
  // Gutter and max-width on the same element, as on /brand: with the gutter on
  // an outer wrapper instead, max-w-page constrains the content box rather than
  // the padded box and the column lands wider than the chrome above and below.
  return (
    <div className="pt-16 pb-24">
      <div className="mx-auto w-full max-w-page px-4 sm:px-6 lg:px-10">
        <ContributeHeroSection {...hero} />
        <ContributeWorkSection {...work} />
        <ContributeFundingSection {...funding} />
        <ContributeStartSection {...start} />
        <ContributeRetiredSection {...retired} />
      </div>
    </div>
  );
}
