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

const DESCRIPTION =
  "Projects, tools, and products built on Livepeer — the open inference network for AI video and image workloads.";

  // openGraph and twitter are declared, not inferred. Next does not fill
  // og:title from `title` or og:description from `description`, so a page
  // setting only those two inherits the root layout's openGraph object whole —
  // and served "Livepeer — The open inference network" with the home page's
  // description to every timeline it was shared into.
export const metadata: Metadata = {
  title: "Ecosystem",
  description: DESCRIPTION,
  openGraph: {
    title: "Ecosystem | Livepeer",
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "Ecosystem | Livepeer",
    description: DESCRIPTION,
  },
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
