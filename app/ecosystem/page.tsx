import type { Metadata } from "next";

import {
  EcosystemListing,
  type EcosystemListingApp,
} from "@/components/livepeer-ui/ecosystem-listing";
import { getAllApps, getEcosystemCategories } from "@/lib/ecosystem";

// Copy mirrors the public-beta mockup. The projects themselves are contributor
// markdown in content/ecosystem/* (see CLAUDE.md → Content), read at build time.
const ecosystem = {
  heading: "Built on Livepeer",
  searchPlaceholder: "Search ecosystem",
  emptyMessage: "No projects match that search.",
  submitLabel: "Submit project",
  submitHref: "/ecosystem/submit",
};

export const metadata: Metadata = {
  title: "Ecosystem",
  description:
    "Projects, tools, and products built on Livepeer — the open inference network for AI video and image workloads.",
};

export default function EcosystemPage() {
  const apps: EcosystemListingApp[] = getAllApps().map((app) => ({
    slug: app.slug,
    name: app.name,
    displayUrl: app.displayUrl,
    description: app.description,
    categories: app.categories,
    logo: app.logo,
    logoBg: app.logoBg,
    logoMonochrome: app.logoMonochrome,
  }));

  return (
    <EcosystemListing
      apps={apps}
      categories={getEcosystemCategories()}
      heading={ecosystem.heading}
      searchPlaceholder={ecosystem.searchPlaceholder}
      emptyMessage={ecosystem.emptyMessage}
      submitLabel={ecosystem.submitLabel}
      submitHref={ecosystem.submitHref}
    />
  );
}
