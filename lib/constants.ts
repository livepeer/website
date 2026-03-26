export type NavChild = {
  label: string;
  href: string;
  external?: boolean;
};

export type NavItem = {
  label: string;
  href: string;
  children?: NavChild[];
};

export const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/" },
  {
    label: "Network",
    href: "https://explorer.livepeer.org",
    children: [
      { label: "Delegate LPT", href: "https://explorer.livepeer.org", external: true },
      { label: "Provide GPUs", href: "https://docs.livepeer.org", external: true },
      { label: "Roadmap", href: "https://roadmap.livepeer.org/roadmap", external: true },
    ],
  },
  {
    label: "Resources",
    href: "/brand",
    children: [
      { label: "Livepeer Primer", href: "/primer" },
      { label: "Livepeer Blog", href: "/blog" },
      { label: "Livepeer Brand", href: "/brand" },
    ],
  },
];

export const EXTERNAL_LINKS = {
  docs: "https://docs.livepeer.org",
  explorer: "https://explorer.livepeer.org",
  discord: "https://discord.gg/livepeer",
  twitter: "https://twitter.com/Livepeer",
  github: "https://github.com/livepeer",
  forum: "https://forum.livepeer.org",
  grants: "https://github.com/livepeer/grants",
  studio: "https://livepeer.studio",
  staking: "https://explorer.livepeer.org/",
} as const;
