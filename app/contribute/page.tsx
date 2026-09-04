import type { Metadata } from "next";
import Link from "next/link";

import {
  ContributeHero,
  ContributeLadder,
} from "@/components/livepeer-ui/contribute-sections";
import { RecordCover } from "@/components/livepeer-ui/record-parts";
import { ogArt } from "@/lib/og";
import { getFundingPaths } from "@/lib/register";

/**
 * The answer to "how can I get involved?".
 *
 * No mockup — built from the Foundation's Grants & Funding Mechanisms Notion
 * page, which this replaces as the canonical destination. The brief was that
 * the barrier is too high: a newcomer had to already know that SPEs exist,
 * that grants come in four sizes, and which forum category takes which.
 *
 * So the page is two things. The hero is the answer — one sentence and a
 * Discord button, because "go and say hello" is what getting involved means
 * here today. The ladder is the one piece of reference the answer needs:
 * every way work gets paid for, ordered by size, read from the Funding paths
 * database so a cap that changed last week is true here without a deploy.
 * Nothing between them explains what the ladder already shows.
 *
 * The copy here is the site's voice and stays in the repo (CLAUDE.md →
 * Content); the rows are the Foundation's data and live in Notion.
 */
const hero = {
  eyebrow: "Contribute",
  heading: "How to get involved.",
  description:
    "Livepeer is built by independent teams, not one company's employees. Say what you want to work on and someone will point you at the work.",
  primary: { label: "Join the Discord", href: "https://discord.gg/livepeer" },
  secondary: [
    { label: "Forum", href: "https://forum.livepeer.org" },
    { label: "GitHub", href: "https://github.com/livepeer" },
  ],
};

const DESCRIPTION =
  "How to get involved with Livepeer: who to talk to, and the ways work on the network gets funded.";

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

export default async function ContributePage() {
  const paths = await getFundingPaths();

  return (
    // Full-bleed cover first, the header over it, the way every record page
    // opens — the same frame as this page's share card, chosen for meaning
    // it: many strands running together. No top offset on the wrapper for
    // that reason; the hero carries its own.
    <div className="pb-24">
      <RecordCover
        src={ogArt.contribute}
        alt="Strands of coloured light running together"
      />
      <ContributeHero {...hero} />
      <ContributeLadder
        title="How work gets funded"
        intro={
          <>
            Check <Link href="/roadmap">the roadmap</Link> first. A proposal
            that lines up with what is already committed is a much stronger
            one.
          </>
        }
        paths={paths}
        note={
          <>
            SPE payments are made in LPT; the dollar figures set the value of
            the work. Treasury proposals follow the{" "}
            <a
              href="https://forum.livepeer.org/t/livepeer-governance-process/2767"
              target="_blank"
              rel="noopener noreferrer"
            >
              governance process
            </a>
            .
          </>
        }
      />
    </div>
  );
}
