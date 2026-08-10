import type { Metadata } from "next";

import {
  BrandColorSection,
  BrandHeroSection,
  BrandMarkSection,
  BrandSystemSection,
  BrandTypeSection,
} from "@/components/livepeer-ui/brand-sections";

/**
 * The one page in the redesign with no mockup (CLAUDE.md → IA), so it is
 * composed from design.md's Foundations and the registry's own language rather
 * than traced from a comp. Needs creative-direction review.
 *
 * It corrects the previous page rather than restyling it. That page described
 * "two typefaces", with Favorit Pro as the primary face for "headings, body,
 * UI" — true before the registry, and the opposite of the rule now: Inter is
 * the default and Favorit Pro is opt-in display. Anyone following the old page
 * would have built something the design system rejects.
 */
const brand = {
  hero: {
    eyebrow: "Brand",
    heading: "Using the Livepeer brand",
    description:
      "What you need to represent Livepeer accurately — the marks and how to place them, the one colour that is ours, and the three type roles.",
  },
  kitHref: "/downloads/livepeer-brand-kit.zip",
  system: [
    {
      label: "Design guidelines",
      href: "https://livepeer.peaceno.de/design.md",
      note: "The full rules for colour roles, type roles, spacing, and composition.",
    },
    {
      label: "Component registry",
      href: "https://livepeer.peaceno.de/docs",
      note: "Livepeer UI — installable components, themed and documented.",
    },
    {
      label: "Ask on Discord",
      href: "https://discord.gg/livepeer",
      note: "Unsure whether a use is on-brand? Ask before you ship it.",
    },
  ],
};

export const metadata: Metadata = {
  title: "Brand",
  description:
    "Livepeer's marks, colour, and typography — how to use them, and where the design system lives.",
};

export default function BrandPage() {
  // Gutter and max-width on the same element, as in the header, the footer and
  // SectionRule. With the gutter on an outer wrapper instead, max-w-page
  // constrains the content box rather than the padded box, so the column lands
  // 40px wider on each side than the chrome above and below it.
  return (
    <div className="pt-16 pb-24">
      <div className="mx-auto w-full max-w-page px-4 sm:px-6 lg:px-10">
        <BrandHeroSection {...brand.hero} />
        <BrandMarkSection kitHref={brand.kitHref} />
        <BrandColorSection />
        <BrandTypeSection />
        <BrandSystemSection links={brand.system} />
      </div>
    </div>
  );
}
