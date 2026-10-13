import type {
  FoundationContent,
  FoundationWorkItem,
} from "@/components/livepeer-ui/livepeer-foundation-sections";
import { getRegister } from "@/lib/register";

/**
 * The Foundation page's copy and its roadmap list.
 *
 * Copy authored as a typed object rather than read from a CMS (CLAUDE.md →
 * Content). Minimal on purpose (Adam): one line under the title, one under
 * each statement, one link under each chapter. The funding ladder and the
 * roadmap beside two of the statements are read from Notion; see the page.
 *
 * Earlier versions carried what this one does not, deliberately: the three
 * pillars spelled out one by one, a project history whose closing framing the
 * 2.0 announcement has since retired, and, more recently, the roadmap's
 * health, the blog's newest posts and the June 2025 announcement. The page
 * now shows the Foundation's three jobs and the proof of each beside it.
 */
export const foundation: FoundationContent = {
  hero: {
    title: "The Livepeer Foundation",
    description:
      "An independent non-profit that coordinates the teams building Livepeer, helps their work get funded, and reports on all of it in public.",
    cta: { label: "See what we're working on", href: "/roadmap" },
  },
  direction: {
    statement: "We set the direction.",
    lede: "Together with the teams building Livepeer, we work out what comes next and publish it in one public roadmap: what's being built, and who owns it.",
    link: { label: "See the full roadmap", href: "/roadmap" },
  },
  // The funding is the community treasury's, which token holders control,
  // and every path is decided by the treasury or an SPE it funds. The
  // Foundation's part is the briefs (the RFPs row says so) and pointing
  // builders to the right path, so that is the claim, never "funds".
  funding: {
    statement: "We connect work to funding.",
    lede: "The funding comes from the community treasury, which token holders control. We write the briefs teams apply against and help builders find the right path, from a single bounty to a treasury vote.",
    link: { label: "How funding works", href: "/contribute#funding" },
  },
  accountability: {
    statement: "We hold the work to account.",
    lede: "Every team on the roadmap reports by our rules, and the roadmap shows it when they don't.",
    link: { label: "Read the reporting rules", href: "/roadmap/reporting" },
  },
  waysIn: {
    heading: "Get involved.",
    ways: [
      {
        title: "Propose work",
        line: "Bring an idea to the forum, where every commitment starts.",
        href: "https://forum.livepeer.org",
      },
      {
        title: "Get funded",
        line: "Find the path that fits, from a bounty to a treasury vote.",
        href: "/contribute#funding",
      },
      {
        title: "Vote on the treasury",
        line: "Token holders decide what the treasury funds.",
        href: "https://explorer.livepeer.org/treasury",
      },
    ],
  },
};

/** The page's description, for its metadata and share card. */
export const FOUNDATION_DESCRIPTION = foundation.hero.description;

/**
 * Everything under way or planned, whoever owns it: the Foundation
 * coordinates the whole roadmap. Under way first, then planned; the
 * register's order holds within each, and shipped work is the roadmap's.
 * Read through the same minute-long fetch cache as the roadmap.
 */
export async function loadFoundationWork(): Promise<FoundationWorkItem[]> {
  const register = await getRegister();
  return register
    .filter((c) => c.state !== "shipped")
    .sort(
      (a, b) => Number(b.state === "building") - Number(a.state === "building")
    )
    .map((c) => ({
      slug: c.slug,
      title: c.title,
      outcome: c.outcome,
      state: c.state === "building" ? "building" : "next",
      owner: c.owner,
    }));
}
