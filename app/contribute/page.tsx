import type { Metadata } from "next";
import Link from "next/link";

import {
  ContributeContributors,
  ContributeHero,
  ContributeLadder,
  ContributeOwners,
  ContributePath,
} from "@/components/livepeer-ui/contribute-sections";
import { getContributors } from "@/lib/contributors";
import { getDiscord } from "@/lib/discord";
import { getFundingPaths } from "@/lib/register";

/**
 * The answer to "how can I get involved?".
 *
 * No mockup — built from the Foundation's Grants & Funding Mechanisms Notion
 * page, which this replaces as the canonical destination. The brief was that
 * the barrier is too high: a newcomer had to already know that SPEs exist,
 * that grants come in four sizes, and which forum category takes which.
 *
 * So the page is three things. The hero is the answer — one sentence and a
 * Discord button, because "go and say hello" is what getting involved means
 * here today. The path is the middle the old help site's "get involved"
 * articles covered: where an idea is proposed, what happens to it, and what
 * a funded item owes once it is on the roadmap (the owner's rules are their
 * own page, /roadmap/reporting). The ladder is the one piece of reference
 * the answer needs: every way work gets paid for, ordered by size, read from
 * the Funding paths database so a cap that changed last week is true here
 * without a deploy. The page closes on the people: the contributors strip,
 * lifted from the old home page, with the GitHub call for the reader who
 * has just read the ladder.
 *
 * The copy here is the site's voice and stays in the repo (CLAUDE.md →
 * Content); the rows are the Foundation's data and live in Notion.
 */
const hero = {
  eyebrow: "Contribute",
  heading: "How to get involved.",
  description:
    "Livepeer is built by independent teams, not by one company. Say what you want to work on and someone will point you at the work.",
  // The href is the live invite at render; see lib/discord.ts.
  primary: { label: "Join the Discord", href: "/discord" },
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
  const [paths, contributors, discord] = await Promise.all([
    getFundingPaths(),
    getContributors(),
    getDiscord(),
  ]);

  return (
    // No cover, deliberately: one was tried, and a banner above the hero
    // pushed the answer below the fold for a page whose whole point is that
    // the answer is the first thing you see. The share card keeps the art.
    // No top padding either: the hero pulls itself up under the header and
    // carries its own.
    <div className="pb-24">
      <ContributeHero
        {...hero}
        primary={{ ...hero.primary, href: discord.invite }}
        online={discord.online}
      />
      <ContributePath
        title="From an idea to the roadmap"
        steps={[
          {
            title: "Say it on the forum.",
            body: (
              <>
                Check <Link href="/roadmap">the roadmap</Link>, then post on{" "}
                <a
                  href="https://forum.livepeer.org"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  the forum
                </a>
                : what problem it solves, what success looks like, and why it
                matters to the network.
              </>
            ),
          },
          {
            title: "It gets reviewed.",
            body: (
              <>
                Proposals are shortlisted for the monthly community call and
                taken forward, sent back for more, or declined with a reason.
              </>
            ),
          },
          {
            title: "It becomes a commitment.",
            body: (
              <>
                With an owner, a target and funding it appears on the roadmap,
                and its owner{" "}
                <Link href="/roadmap/reporting">reports on it</Link>.
              </>
            ),
          },
        ]}
      />
      <ContributeLadder
        title="How work gets funded"
        intro={
          <>
            Every way work on the network gets paid for, smallest first. Which
            rung fits depends on how big the thing is; the proposal is the same
            one at every height.
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
      <ContributeOwners
        label="Own something on the roadmap?"
        body="Its owner keeps the work trackable, posts an update every month, and closes it with a retrospective. The rules, and what the roadmap reads from each."
        link={{
          label: "Reporting on a commitment",
          href: "/roadmap/reporting",
        }}
      />
      <ContributeContributors {...contributors} />
    </div>
  );
}
