import type { LivepeerOrgPage } from "@/components/livepeer-ui/contracts";
import {
  NetworkHeroSection,
  LivepeerAgentFeatureSection,
  OrchestratorCtaSection,
} from "@/components/livepeer-ui/livepeer-org-landing-sections";
import { getDiscord } from "@/lib/discord";
import { agentApp } from "@/lib/site";

// Static, in-repo page content matching the registry's content contract
// (see CLAUDE.md → Content). Copy mirrors the public-beta mockup.
//
// The hero splits its headline across two lines — `heading` leads in the
// foreground colour, `accent` follows on its own line in the muted one — so it
// carries a third string the contract has no field for.
type HomeContent = NonNullable<LivepeerOrgPage["homeContent"]>;

const hero: HomeContent["hero"] & {
  description: string;
  banner: { label: string; title: string; description: string; href: string };
  // The contract's EditorialLink has no newTab; whether a CTA takes over the
  // tab is a presentation decision this page makes, not content from a CMS.
  secondaryCta: HomeContent["hero"]["secondaryCta"] & { newTab?: boolean };
} = {
  heading: "The open",
  accent: "inference network.",
  description:
    "Purpose-built for AI video and image workloads. Designed for the agentic era.",
  banner: {
    label: "New",
    title: "Livepeer 2.0",
    description: "The open video agent platform",
    href: "/blog/livepeer-2-0-video-agent-platform",
  },
  // Both off-site, but only one is an aside. The Agent console is the product,
  // so it takes over the tab and gets the "go" arrow; Discord opens alongside
  // and is marked as leaving. See renderCta in livepeer-org-landing-sections.
  primaryCta: { label: "Try Livepeer Agent", href: agentApp.console },
  secondaryCta: {
    label: "Join Discord",
    // Replaced with the live invite at render; see lib/discord.ts.
    href: "/discord",
    newTab: true,
  },
};

const home: Pick<HomeContent, "agentFeature" | "providerCta"> = {
  agentFeature: {
    description:
      "A video agent harness for multimodal media generation, from right within Claude. Running on Livepeer's open network.",
    installCta: { label: "Install", href: "/agent" },
    libraryCta: { label: "Explore playbooks", href: "/agent" },
  },
  providerCta: {
    heading: "Become an Orchestrator",
    description:
      "Put a GPU on the Livepeer network and earn from inference workloads, service payouts, and protocol rewards.",
    cta: { label: "Get Started", href: "/compute" },
  },
};

export default async function Home() {
  const { invite } = await getDiscord();
  return (
    <>
      <NetworkHeroSection
        content={{
          ...hero,
          secondaryCta: { ...hero.secondaryCta, href: invite },
        }}
      />
      {/* These two share a background so the Orchestrator's particle field can
          overflow up past the section boundary and pass behind the playbook
          card. An opaque background on the Agent section would clip it there;
          the wrapper carries the black for both and crops the overflow at the
          outer edges. The canvas itself stays inside the Orchestrator section,
          which is what keeps the field composed against that section's height
          rather than being re-centred over the taller combined box. */}
      <div className="relative isolate overflow-hidden bg-background">
        <LivepeerAgentFeatureSection content={home.agentFeature} />
        <OrchestratorCtaSection content={home.providerCta} />
      </div>
    </>
  );
}
