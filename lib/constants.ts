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
      { label: "Delegate", href: "https://explorer.livepeer.org/", external: true },
      { label: "Provide Compute", href: "https://docs.livepeer.org/orchestrators/guides/get-started", external: true },
      { label: "Roadmap", href: "https://github.com/livepeer/catalyst/milestones", external: true },
    ],
  },
  {
    label: "Resources",
    href: "/brand",
    children: [
      { label: "Ecosystem", href: "/ecosystem" },
      { label: "10-Minute Primer", href: "/primer" },
      { label: "Blog", href: "/blog" },
      { label: "Brand", href: "/brand" },
      { label: "Foundation", href: "/foundation" },
    ],
  },
];

export type AppLink = {
  label: string;
  description: string;
  href: string;
  icon: "studio" | "explorer";
  comingSoon?: boolean;
};

export const APP_LINKS: AppLink[] = [
  {
    label: "Explorer",
    description: "Network & Governance",
    href: "https://explorer.livepeer.org",
    icon: "explorer",
  },
  {
    label: "Studio",
    description: "Developer Dashboard",
    href: "/studio",
    icon: "studio",
    comingSoon: true,
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
