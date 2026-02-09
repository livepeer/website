export const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Network", href: "/network" },
  { label: "Developers", href: "/developers" },
  { label: "LPT", href: "/lpt" },
  { label: "Community", href: "/community" },
  { label: "Blog", href: "/blog" },
] as const;

export const EXTERNAL_LINKS = {
  docs: "https://docs.livepeer.org",
  explorer: "https://explorer.livepeer.org",
  discord: "https://discord.gg/livepeer",
  twitter: "https://twitter.com/Livepeer",
  github: "https://github.com/livepeer",
  forum: "https://forum.livepeer.org",
  grants: "https://github.com/livepeer/grants",
  studio: "https://livepeer.studio",
  staking: "https://explorer.livepeer.org/staking",
} as const;
