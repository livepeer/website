import type { Metadata } from "next";

import {
  FOUNDATION_DESCRIPTION,
  foundation,
  loadFoundationWork,
} from "@/app/foundation/content";
import {
  AccountabilityTimeline,
  FundingLadder,
  RoadmapSteps,
} from "@/components/livepeer-ui/foundation-steps";
import {
  FoundationChapter,
  FoundationHero,
  FoundationWaysIn,
} from "@/components/livepeer-ui/livepeer-foundation-sections";
import { isActive } from "@/lib/contribute";
import { getFundingPaths } from "@/lib/register";

/**
 * The design is described in components/livepeer-ui/livepeer-foundation-
 * sections.tsx, the copy is in ./content.ts. The roadmap and the funding
 * ladder are read from Notion through the minute-long fetch cache, so the
 * page refreshes with them.
 */

export const metadata: Metadata = {
  title: "Foundation",
  description: FOUNDATION_DESCRIPTION,
};

export default async function FoundationPage() {
  const [items, paths] = await Promise.all([
    loadFoundationWork(),
    getFundingPaths(),
  ]);
  const ladder = paths
    .filter(isActive)
    .sort((a, b) => a.order - b.order)
    .map((p) => ({ name: p.name, bestFor: p.bestFor, ceiling: p.ceiling }));

  return (
    <>
      <FoundationHero content={foundation.hero} />
      <FoundationChapter content={foundation.direction}>
        <RoadmapSteps items={items} />
      </FoundationChapter>
      <FoundationChapter content={foundation.funding}>
        <FundingLadder paths={ladder} />
      </FoundationChapter>
      <FoundationChapter content={foundation.accountability}>
        <AccountabilityTimeline />
      </FoundationChapter>
      <FoundationWaysIn content={foundation.waysIn} />
    </>
  );
}
