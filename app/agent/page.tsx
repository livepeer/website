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
    heading: "Create and edit video with your agent.",
    // Just what happens. Naming the step that no longer exists would put an
    // API key in the reader's head on the way to telling them there isn't one.
    description:
      "Add this server in your agent's MCP / connector settings. The first connection opens your browser and logs you in.",
    serverUrl: agentApp.mcpServerUrl,
    signInCta: { label: "Log in", href: agentApp.signIn },
    createAccountCta: { label: "Create account", href: agentApp.createAccount },
  },
  access: {
    heading: "Install Livepeer Agent in your app today",
    description:
      "Point your product's agent runtime at the same MCP server and Livepeer Agent's image and video workflows are available inside it.",
    // To sign-up: connecting a runtime to the MCP server needs an account
    // (the first connection logs in), and there is no integration guide to
    // send a builder to yet; the docs have no Agent pages and the MCP host
    // serves only the endpoint. It had no button at first, as a statement
    // with the console one click away in the header, and read as a dead end
    // to a builder told to install something (Adam). Point it at the guide
    // once the docs have one.
    cta: { label: "Create an account", href: agentApp.createAccount },
  },
  capabilities: {
    heading:
      "Livepeer Agent brings image, video, audio, 3D, editing, rendering, and production tools across the Livepeer network into one interface.",
    // No CTA. It was "See more" to the playbook library in the Agent app,
    // which the list does not lead to: it is an inventory of capabilities,
    // shown in full, and the app is one click away in the header.
  },
  // The mockup has no playbooks section on this page — the library lives in the
  // Agent app. Kept present because the contract requires it, and empty
  // rather than invented.
  playbooks: {
    heading: "",
    description: "",
    cta: { label: "", href: agentApp.playbooks },
  },
};

const DESCRIPTION =
  "Create and edit video with your agent. Connect Livepeer Agent over MCP and reach image, video, audio, 3D and production tools across the Livepeer network.";

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
