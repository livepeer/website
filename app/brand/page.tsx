import type { Metadata } from "next";

import {
  BrandColorSection,
  BrandHeroSection,
  BrandMarkSection,
  BrandSystemSection,
  BrandTypeSection,
  BrandUsageSection,
} from "@/components/livepeer-ui/brand-sections";

/**
 * The one page in the redesign with no mockup (CLAUDE.md → IA), so it is
 * composed from design.md's Foundations and the registry's own language rather
 * than traced from a comp.
 *
 * It corrects the previous page rather than restyling it. That page described
 * "two typefaces" with Favorit Pro as the primary; Favorit is gone, Inter is
 * the one face, and Geist Mono is the mono. Anyone following the old page
 * would have built something the design system rejects.
 */
const brand = {
  hero: {
    heading: "Brand guidelines",
    description:
      "The mark, the green, the type, and the few rules that keep them looking right. If you're putting Livepeer on something, start here.",
  },
  kitHref: "/downloads/livepeer-brand-kit.zip",
  // The guidelines live in this repo (content/design.md), not on the
  // registry they came from; the registry link was removed (Adam).
  systemHref: "/brand/guidelines",
  system: [
    {
      label: "Design guidelines",
      href: "/brand/guidelines",
      note: "Colour roles, type roles, spacing and composition in full.",
    },
    {
      label: "Ask on Discord",
      href: "/discord",
      external: true,
      note: "Unsure whether a use is on-brand? Ask before shipping it.",
    },
  ],
};

export const metadata: Metadata = {
  title: "Brand",
  description:
    "Livepeer's marks, colour, and typography — how to use them, and where the design system lives.",
};

export default function BrandPage() {
  // A centred 56rem measure, like the ladder on /contribute, rather than the
  // chrome's max-w-page: plates read as objects at this width and as banners
  // any wider. Gutter and max-width on the same element, so the padded box is
  // what is constrained.
  return (
    <div className="pt-16 pb-24 sm:pb-32">
      <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-10">
        <BrandHeroSection
          {...brand.hero}
          kitHref={brand.kitHref}
          systemHref={brand.systemHref}
        />
        <BrandMarkSection />
        <BrandUsageSection />
        <BrandColorSection />
        <BrandTypeSection />
        <BrandSystemSection links={brand.system} />
      </div>
    </div>
  );
}
