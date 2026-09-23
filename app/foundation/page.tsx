import type { Metadata } from "next";

import {
  FoundationHeroSection,
  FoundationMandateSection,
  type FoundationContent,
} from "@/components/livepeer-ui/livepeer-foundation-sections";

/**
 * Copy mirrors the public-beta mockup, authored as a typed object rather than
 * read from a CMS (CLAUDE.md → Content).
 *
 * The mockup is two sections and stops. The previous page ran four numbered
 * chapters; what it said that this does not is noted in the git history —
 * chiefly the three pillars spelled out one by one, and a project history
 * whose closing framing ("the open network for real-time AI video") the 2.0
 * announcement has since retired.
 */
const foundation: FoundationContent = {
  hero: {
    eyebrow: "The Livepeer Foundation",
    heading: "Advancing the world's open inference network.",
    description:
      "The Livepeer Foundation is an independent non-profit accountable to network participants, advancing Livepeer's long-term health through strategy, core development, and ecosystem growth.",
    cta: {
      // The mockup links out to livepeer.org; on livepeer.org that is a local
      // route, and the post is in content/blog.
      label: "Read more",
      href: "/blog/introducing-the-livepeer-foundation",
    },
  },
  mandate: {
    heading: "Strategy, coordination, & support.",
    description:
      "The Livepeer Foundation sets the network's strategic direction, aligns stakeholders around shared priorities, coordinates development across independent teams, and supports builders with funding, connections, and tools.",
    cta: { label: "Explore the ecosystem", href: "/ecosystem" },
  },
  lockup: "The Livepeer Foundation",
};

export const metadata: Metadata = {
  title: "Foundation",
  description:
    "The Livepeer Foundation is an independent non-profit accountable to network participants, advancing Livepeer's long-term health through strategy, core development, and ecosystem growth.",
};

export default function FoundationPage() {
  return (
    <>
      <FoundationHeroSection content={foundation.hero} />
      <FoundationMandateSection
        content={foundation.mandate}
        lockup={foundation.lockup}
      />
    </>
  );
}
