import type { LivepeerOrgSite } from "@/components/livepeer-ui/contracts";

/**
 * Static site configuration that drives the registry Header and Footer.
 *
 * The registry components are data-driven via this object (no CMS — see
 * CLAUDE.md). `footerGroups` powers both the footer columns and the header
 * dropdowns; `menuLinks` supplies real-route overrides for local destinations.
 *
 * Primer is intentionally absent — it stays live at /primer but unlinked.
 */
export const livepeerOrgSite: LivepeerOrgSite = {
  _id: "livepeerOrgSite",
  homeHref: "/",
  menuLinks: [
    { label: "Livepeer Agent", href: "/agent" },
    { label: "Ecosystem", href: "/ecosystem" },
    { label: "Livepeer Token", href: "/token" },
    { label: "Provide GPUs", href: "/compute" },
    { label: "Blog", href: "/blog" },
    { label: "Foundation", href: "/foundation" },
  ],
  footerTagline: "The open inference network.",
  footerGroups: [
    {
      _key: "network",
      title: "Network",
      links: [
        { label: "Ecosystem", href: "/ecosystem" },
        { label: "Provide GPUs", href: "/compute" },
        { label: "Livepeer Token", href: "/token" },
        { label: "Delegate LPT", href: "https://explorer.livepeer.org" },
        { label: "Roadmap", href: "https://roadmap.livepeer.org/roadmap" },
      ],
    },
    {
      _key: "resources",
      title: "Resources",
      links: [
        { label: "Blog", href: "/blog" },
        { label: "Foundation", href: "/foundation" },
        { label: "Brand", href: "/brand" },
        { label: "Documentation", href: "https://docs.livepeer.org" },
      ],
    },
    {
      _key: "community",
      title: "Community",
      links: [
        { label: "Discord", href: "https://discord.gg/livepeer" },
        { label: "X / Twitter", href: "https://twitter.com/Livepeer" },
        { label: "Forum", href: "https://forum.livepeer.org" },
      ],
    },
  ],
  socialLinks: [
    { label: "Discord", href: "https://discord.gg/livepeer", service: "discord" },
    { label: "X / Twitter", href: "https://twitter.com/Livepeer", service: "x" },
    { label: "GitHub", href: "https://github.com/livepeer", service: "github" },
    { label: "Livepeer.org", href: "https://livepeer.org", service: "website" },
  ],
  copyright: "© 2026 Livepeer",
};

/**
 * The Livepeer Agent product app.
 *
 * A separate surface from this marketing site: accounts, API keys and the
 * playbook library all live there. Centralised here because /agent links to it
 * four times and the host is the one thing about those links that is not yet
 * settled — `livepeer.peaceno.de` is where the Agent app currently runs, and it
 * should be repointed here, in one place, before launch.
 *
 * The MCP endpoint is different: it is served from livepeer.org itself and is
 * the address users paste into their agent, so it is a real published value
 * rather than a link target.
 */
const agentAppOrigin = "https://livepeer.peaceno.de";

/**
 * Where "Use Livepeer", "Try Livepeer Agent", and "Agent Console" all point.
 *
 * Interim: the registry's Agent console mockup, not a real deployment. It is a
 * single constant precisely so the three prominent CTAs that use it cannot
 * drift apart, and so repointing at launch is one edit.
 */
const agentConsoleHref = `${agentAppOrigin}/mockups/livepeer-agent`;

/**
 * What sits behind "Log in".
 *
 * One list, used by both the header dropdown and the mobile menu's login
 * panel. The desktop trigger is hidden below `lg`, so on a phone this list is
 * only reachable through the menu — if the two drifted apart, mobile users
 * would silently lose a destination.
 */
export const loginLinks = [
  { label: "Agent Console", href: agentConsoleHref },
  { label: "Livepeer Explorer", href: "https://explorer.livepeer.org" },
] as const;

export const agentApp = {
  mcpServerUrl: "https://livepeer.org/api/mcp",
  /** The signed-in surface behind the header's "Log in" menu. */
  console: agentConsoleHref,
  signIn: `${agentAppOrigin}/sign-in`,
  createAccount: `${agentAppOrigin}/sign-up`,
  apiKeys: `${agentAppOrigin}/api`,
  // Scoped under the console, matching the mockup — the playbook library is a
  // surface inside the Agent app, not a sibling of it.
  playbooks: `${agentConsoleHref}/playbooks`,
} as const;
