import type { LivepeerOrgPage } from "@/components/livepeer-ui/contracts";
import { ContributorsCtaSection } from "@/components/livepeer-ui/contributors-cta-section";
import { LatestPostsSection } from "@/components/livepeer-ui/latest-posts-section";
import {
  NetworkHeroSection,
  LivepeerAgentFeatureSection,
  OrchestratorCtaSection,
} from "@/components/livepeer-ui/livepeer-org-landing-sections";
import { getContributors } from "@/lib/contributors";
import { getDiscord } from "@/lib/discord";
import { getBlogRegister } from "@/lib/register";
import { agentApp } from "@/lib/site";

import { blog, toListingPosts } from "./blog/listing";

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
    "Purpose-built for AI video workloads. Designed for the agentic era.",
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
  // The other side of the network, written for the reader who has a GPU and
  // from what that reader needs to know, in the order they ask it: what am I
  // being asked to do (the heading, which is also /compute's own, so the
  // button lands on the line it was pressed under), what would my GPU be
  // doing and how am I paid (the first sentence, which is the whole market:
  // who sends the work, who runs it, who is paid), and then the invitation.
  // The router is named as Livepeer Agent, Adam's call: it is not the only
  // source of jobs, but effectively all of them will reach a GPU through an
  // agent, and naming it ties this band to the section above. The matching
  // (a node advertises its capabilities, a job is routed on what it needs)
  // is all in "jobs it can run". Longer versions spelled out both halves
  // and Adam asked for it to be easy to understand, so the mechanism is
  // /compute's to explain and this is three plain facts: connect, get
  // work your GPU can do, get paid for it.
  // The ways in (a pool, AI-first, a solo node) are /compute's to explain;
  // a line here offering a pool as the way to start without tokens was cut
  // at Adam's word, and pools are not to be mentioned on this page.
  //
  // What it replaced, and why each went. "Become an Orchestrator" over three
  // kinds of earnings in the network's own words named neither the reader
  // nor the work. "Run the GPUs behind it." needed the section above to mean
  // anything. Copy that quoted the Agent demo's $0.34 needed the reader to
  // have caught a price in small type in a demo that plays once, and as a
  // bare figure read as a claim about what things cost; Adam cut the number.
  //
  // The word "orchestrator" is not on this page at all: a visitor cannot be
  // assumed to know it, and "GPU provider" says what one is. /compute, where
  // this leads, is where the term is taught. Nothing here promises earnings;
  // /compute says work is not guaranteed, and this only says a job pays.
  providerCta: {
    heading: "Put your GPU to work.",
    description:
      "Connect your GPU to the network. Livepeer Agent sends it AI video jobs it can run, and you get paid for each one.",
    cta: { label: "Get started", href: "/compute" },
  },
};

// The two sides, labelled over their sections. The Agent is for people who
// build with it and people who make things with it; the band is for people
// with hardware. See Audience in livepeer-org-landing-sections.
const audience = {
  agent: "For builders and creatives",
  providers: "For GPU providers",
};

// The newest posts close the page, under the blog's own heading and linking
// to its index (app/blog/listing.ts). Three is one row; the register is
// already newest first. Read from Notion like the blog, so a post published
// there reaches this page within the minute, and the page revalidates with
// it rather than at build.
const latest = { count: 3, allLabel: "View all" };

// The closing band: the people, and the way in. The faces and the count are
// read live (lib/contributors.ts, with its dated fallback); the words are
// the site's, and say only as much as sends the reader to /contribute, which
// is where the path and the funding ladder are explained.
const contribute = {
  heading: "Built in the open.",
  description:
    "Livepeer is built by independent teams, not by one company. Bring an idea, pick up a bounty, or propose something larger.",
  cta: { label: "How to contribute", href: "/contribute" },
};

export default async function Home() {
  const [{ invite }, register, contributors] = await Promise.all([
    getDiscord(),
    getBlogRegister(),
    getContributors(),
  ]);
  return (
    <>
      <NetworkHeroSection
        content={{
          ...hero,
          secondaryCta: { ...hero.secondaryCta, href: invite },
        }}
      />
      {/* These share a background so the Orchestrator's particle field can
          overflow up past the section boundary and pass behind the playbook
          card. An opaque background on the Agent section would clip it there;
          the wrapper carries the black for both and crops the overflow at the
          outer edges. The canvas itself stays inside the Orchestrator section,
          which is what keeps the field composed against that section's height
          rather than being re-centred over the taller combined box. */}
      <div className="relative isolate overflow-hidden bg-background">
        <LivepeerAgentFeatureSection
          content={home.agentFeature}
          audience={audience.agent}
        />
        <OrchestratorCtaSection
          content={home.providerCta}
          audience={audience.providers}
          continues
        />
        {/* Inside the wrapper too: the field dissolves into this section's
            top padding rather than stopping at a rule, so the two have to
            share the wrapper's ground and its crop. */}
        <LatestPostsSection
          posts={toListingPosts(register).slice(0, latest.count)}
          heading={blog.heading}
          allLabel={latest.allLabel}
          allHref={blog.allHref}
        />
      </div>
      <ContributorsCtaSection contributors={contributors} {...contribute} />
    </>
  );
}
