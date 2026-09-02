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
        { label: "Roadmap", href: "/roadmap" },
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
 * settled — this is the Vercel preview of the console, not its final address,
 * so there is still one edit to make before launch.
 *
 * It replaced `livepeer.peaceno.de`, which was the registry's mockup rather
 * than a deployment. The paths below moved with it and are the real ones the
 * console serves: signing out lands on /login, and the three that used to be
 * guessed at (/sign-in, /sign-up, /api) had never existed on the old host.
 *
 * The MCP endpoint is different: it is served from livepeer.org itself and is
 * the address users paste into their agent, so it is a real published value
 * rather than a link target.
 */
const agentAppOrigin = "https://livepeer-console.vercel.app";

/**
 * Where "Use Livepeer", "Try Livepeer Agent", and "Agent Console" all point.
 *
 * The console's own root, which sends a signed-out visitor to its login — the
 * right landing for a CTA that means "go and use the thing". A single constant
 * precisely so the three prominent CTAs that use it cannot drift apart, and so
 * repointing at launch is one edit.
 */
const agentConsoleHref = agentAppOrigin;

/**
 * The playbook library, which the console does not have yet.
 *
 * Left on the registry's mockup deliberately. Every other link here moved to
 * the console because the console answers it; this one would 404 there, and a
 * dead link is worse than an honest mockup. Move it when the console grows the
 * page.
 */
const playbooksHref = "https://livepeer.peaceno.de/mockups/livepeer-agent/playbooks";

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
  signIn: `${agentAppOrigin}/login`,
  createAccount: `${agentAppOrigin}/signup`,
  playbooks: playbooksHref,
} as const;
