import type { Metadata } from "next";

import type { LivepeerOrgPage } from "@/components/livepeer-ui/contracts";
import { LivepeerAgentHero } from "@/components/livepeer-ui/livepeer-agent-hero";
import {
  AgentAccessSection,
  AgentCapabilitiesSection,
} from "@/components/livepeer-ui/livepeer-agent-sections";
import { agentCapabilities } from "@/lib/agent-capabilities";
import { agentApp } from "@/lib/site";

// Static, in-repo page content matching the registry's content contract
// (see CLAUDE.md → Content). Copy mirrors the public-beta mockup.
//
// Every destination here is on the Agent product app, not this site — they all
// resolve through `agentApp` so the host is settled in one place.
type AgentContent = NonNullable<LivepeerOrgPage["agentContent"]>;

const agent: AgentContent = {
  hero: {
    heading: "Create and edit images and video with your agent.",
    // The absence of a key is the story, so it is said here rather than left
    // to be discovered: there is nothing to provision, and the first call
    // signs you in through the browser the way any other connector does.
    description:
      "Add this server in your agent's MCP / connector settings. There is no API key to provision — the first connection opens your browser and signs you in.",
    serverUrl: agentApp.mcpServerUrl,
    signInCta: { label: "Sign in", href: agentApp.signIn },
    createAccountCta: { label: "Create account", href: agentApp.createAccount },
  },
  access: {
    heading: "Install Livepeer Agent in your app today",
    description:
      "Point your product's agent runtime at the same MCP server and Livepeer Agent's image and video workflows are available inside it. Nothing to provision, no SDK to install.",
    // No CTA. The band is a statement about what the Agent can do inside
    // someone else's product, and the console is one click away in the header.
  },
  capabilities: {
    heading:
      "Livepeer Agent brings image, video, audio, 3D, editing, rendering, and production tools across the Livepeer network into one interface.",
    cta: { label: "See more", href: agentApp.playbooks },
  },
  // The mockup has no playbooks section on this page — the library lives in the
  // Agent app, which the capabilities CTA links to. Kept present because the
  // contract requires it, and empty rather than invented.
  playbooks: {
    heading: "",
    description: "",
    cta: { label: "", href: agentApp.playbooks },
  },
};

const DESCRIPTION =
  "Create and edit images and video with your agent. Connect Livepeer Agent over MCP and reach image, video, audio, 3D and production tools across the Livepeer network.";

  // openGraph and twitter are declared, not inferred. Next does not fill
  // og:title from `title` or og:description from `description`, so a page
  // setting only those two inherits the root layout's openGraph object whole —
  // and served "Livepeer — The open inference network" with the home page's
  // description to every timeline it was shared into.
export const metadata: Metadata = {
  title: "Livepeer Agent",
  description: DESCRIPTION,
  openGraph: {
    title: "Livepeer Agent | Livepeer",
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "Livepeer Agent | Livepeer",
    description: DESCRIPTION,
  },
};

export default function AgentPage() {
  return (
    <>
      <LivepeerAgentHero content={agent.hero} />
      <AgentAccessSection content={agent.access} />
      <AgentCapabilitiesSection
        content={agent.capabilities}
        capabilities={agentCapabilities}
      />
    </>
  );
}
