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
    description: "In your agent's MCP / connector settings, add this server:",
    serverUrl: agentApp.mcpServerUrl,
    signInCta: { label: "Sign in", href: agentApp.signIn },
    createAccountCta: { label: "Create account", href: agentApp.createAccount },
  },
  access: {
    heading: "Install Livepeer Agent in your app today",
    description:
      "Create an API key to add Livepeer Agent's image and video workflows to your own product.",
    cta: { label: "Create an API key", href: agentApp.apiKeys },
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
