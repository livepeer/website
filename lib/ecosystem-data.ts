import ecosystemJson from "@/data/ecosystem.json";

export interface EcosystemApp {
  id: string;
  name: string;
  url: string;
  description: string;
  categories: string[];
  logo?: string;
}

export const ECOSYSTEM_CATEGORIES = [
  "All",
  ...Array.from(new Set(ecosystemJson.flatMap((app) => app.categories))).sort(),
];

export const ECOSYSTEM_APPS: (EcosystemApp & { hostname: string })[] =
  ecosystemJson.map((app) => ({
    ...app,
    hostname: new URL(app.url).hostname.replace("www.", ""),
  }));
