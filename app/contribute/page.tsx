import type { Metadata } from "next";
import Link from "next/link";

import {
  ContributeContributors,
  ContributeHero,
  LadderTable,
  RetiredLine,
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
 * here today. Then one document, set the way a Notion page is set: the path
 * from an idea to the roadmap (the middle the old help site's "get involved"
 * articles covered — where an idea is proposed, what happens to it, and
 * what a funded item owes, whose rules are their own page at
 * /roadmap/reporting), the ladder — every way work gets paid for, ordered by
 * size, read from the Funding paths database so a cap that changed last
 * week is true here without a deploy — embedded in it the way a page embeds
 * a database, and a line for whoever already owns something. The page
 * closes on the people: the contributors strip, lifted from the old home
 * page, with the GitHub call for the reader who has just read the ladder.
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
      {/* Everything between the hero and the people is one document, set
          as a Notion page would set it: headings, paragraphs and a list in
          the reading column, with the ladder as a table embedded where a page
          would embed a database. It was three designed sections — a
          three-cell strip, the ladder under a page-title, an owners' block
          — and read as three pages under one hero. The rule at the top is
          the seam the hero's ground fades out to. */}
      <section className="mt-12 sm:mt-16">
        <div className="mx-auto w-full max-w-[46rem] px-6 sm:px-8">
          <div className="border-t border-border pt-10 sm:pt-12">
            <div className="reading-prose">
              <h2>From an idea to the roadmap</h2>
              <ol>
                <li>
                  <strong>Say it on the forum.</strong> Check{" "}
                  <Link href="/roadmap">the roadmap</Link>, then post on{" "}
                  <a
                    href="https://forum.livepeer.org"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    the forum
                  </a>
                  : what problem it solves, what success looks like, and why it
                  matters to the network.
                </li>
                <li>
                  <strong>It gets reviewed.</strong> Proposals are shortlisted
                  for the monthly community call and taken forward, sent back
                  for more, or declined with a reason.
                </li>
                <li>
                  <strong>It becomes a commitment.</strong> With an owner, a
                  target and funding it appears on the roadmap, and its owner{" "}
                  <Link href="/roadmap/reporting">reports on it</Link>.
                </li>
              </ol>

              <h2>How work gets funded</h2>
              <p>
                Every way work on the network gets paid for, smallest first.
                Which rung fits depends on how big the thing is; the proposal is
                the same one at every height.
              </p>
            </div>

            <LadderTable paths={paths} className="mt-6" />

            <div className="reading-prose mt-6">
              <p>
                SPE payments are made in LPT; the dollar figures set the value
                of the work. Treasury proposals follow the{" "}
                <a
                  href="https://forum.livepeer.org/t/livepeer-governance-process/2767"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  governance process
                </a>
                . <RetiredLine paths={paths} />
              </p>

              <h2>Own something on the roadmap?</h2>
              <p>
                Its owner keeps the work trackable, posts an update every month,
                and closes it with a retrospective. The rules, and what the
                roadmap reads from each, are on{" "}
                <Link href="/roadmap/reporting">Reporting on a commitment</Link>
                .
              </p>
            </div>
          </div>
        </div>
      </section>
      <ContributeContributors {...contributors} />
    </div>
  );
}
