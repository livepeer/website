import type { Metadata } from "next";
import { Suspense } from "react";

import { Roadmap } from "@/components/livepeer-ui/roadmap";
import { getRegister } from "@/lib/register";
import { getWorkstreamsInUse } from "@/lib/roadmap";

/**
 * Named, then claimed.
 *
 * The headline alone left the card without the one word a reader scans for —
 * someone who follows Livepeer and wants the roadmap is looking for "roadmap",
 * not for a sentence about building. The card sets the same pair visually: the
 * page's eyebrow above its headline.
 *
 * Branded, because the title travels without the card. In an unfurl the host
 * line already reads livepeer.org, so "Livepeer" there is a mild echo against
 * small grey type — but a search result, a bookmark or a pasted link carries
 * the title alone, and "Roadmap" on its own belongs to nobody. It also keeps
 * the convention every other page now follows, where the brand is in the card
 * title. The <title> tag stays plain "Roadmap": a browser tab has the URL
 * beside it.
 */
const TITLE = "Livepeer Roadmap \u2014 What we\u2019re building, and when.";
/**
 * The lead, verbatim.
 *
 * It is written to be read away from the page already — in a search result, a
 * link preview, a shared card — so it needs nothing added for those. A second
 * sentence about owners and sources was making the claim the card's own title
 * and the page's cards both make, to a reader who has not arrived yet.
 */
const DESCRIPTION =
  "One place to see everything being built across Livepeer, and who owns what.";

/**
 * openGraph and twitter are declared, not inferred.
 *
 * Next does not fill og:title from `title` or og:description from `description`
 * — a page that sets only those two inherits the root's openGraph object whole,
 * so /roadmap was serving "Livepeer — The open inference network" and the
 * home page's description to every timeline it was shared into. The image was
 * the only part of the card that knew which page it belonged to.
 *
 * The card takes the page's headline rather than the word "Roadmap": a shared
 * link is read beside things competing for the same glance, and the tab title
 * can stay short because a tab has the URL beside it.
 */
export const metadata: Metadata = {
  title: "Roadmap",
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

/**
 * Where someone goes when the thing they care about is not on this page.
 *
 * /contribute, not the forum directly. This has moved before — the board,
 * then the forum when Featurebase was retired — and the forum was right as
 * far as it went: that is where proposals are argued about. But it answers
 * the second question. Someone reading a roadmap and finding a gap is asking
 * how to get involved at all, and the forum drops them into a running
 * conversation with no explanation of the five funding paths or which one is
 * theirs. /contribute answers that and links to the forum in its first
 * section, which is one hop instead of none and a much shorter fall.
 */
const SUGGESTIONS_HREF = "/contribute";

/** The rail and the cards share this label setting; the header borrows it. */
function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[0.6875rem] leading-4 font-medium tracking-[0.09em] text-muted-foreground uppercase">
      {children}
    </span>
  );
}

export default async function RoadmapPage() {
  const commitments = await getRegister();

  return (
    <div className="pt-10 pb-32">
      <div className="mx-auto w-full max-w-page px-4 sm:px-6 lg:px-10">
        {/* One measure for the page.
            The masthead used to run to the container edge while the register
            capped well short of it, so the page had two right edges and read
            as two unrelated blocks. Everything now shares 68rem: the "last
            verified" stamp lands directly above the right edge of the cards,
            and the space left over at wide desktop is a margin rather than a
            mismatch. */}
        <div className="max-w-[68rem]">
          {/* The lead is 18px, not the 14px it was.
              At 14 it was set at the same size as the body copy inside the
              cards — the page's second sentence reading as a footnote — and a
              small size forces a small measure, which is why it sat at 59% of
              the headline's width. At 18px a comfortable measure lands the two
              blocks close enough to read as a pair. Not identical: the
              headline's width comes from its own text, so matching it exactly
              would be a coincidence dressed as a grid. */}
          <header className="pt-6 lg:pt-8">
            <Label>Roadmap</Label>
            {/* No "Here's". It pointed at a page the reader is already on, and
                it is what decides whether the line fits: 1128px against a
                1088px measure with it, 861px without.

                "We" rather than naming Livepeer. The wordmark sits ~100px above
                this line, so the subject is never in doubt, and the lead
                immediately qualifies the "we" — "every item here names who owns
                it" — which is the distinction that matters, since this register
                is owned by several different parties and each card names which.

                text-balance still earns its place at the widths where the line
                does wrap: it stops the last word stranding alone. */}
            <h1 className="mt-3 text-display-sm leading-[1.02] tracking-[-0.04em] text-balance sm:text-display-md lg:text-display-lg">
              What we&rsquo;re building, and when.
            </h1>
            {/* The measure is chosen so the paragraph breaks on its own full
                stop: the standard on line one, the counts on line two, 648/541.
                At 75ch it broke mid-clause instead and left a 337px stub under
                an 832px line. This is a preference, not a constraint — the
                counts are nowrap, so a break can no longer tear one in half
                whatever the measure does.

                It costs distance to the headline, which runs to 968px — the
                step widens from 136px to 281px. A paragraph's right edge is
                meant to be ragged, and two blocks of different measure are not
                a mismatch when one is a headline and the other is prose.

                What the page is, and the shape of what is in it.

                "Who owns what", not "who owns it" or "each piece": there is no
                single Livepeer team, and the owners on this page are companies,
                a foundation, two SPEs, an RFP and one individual. "Who owns
                what" is the only phrasing of the three that can only mean
                many-to-many, which is the fact the cards spend their effort
                establishing.

                A full stop, not a colon. The colon worked when this sentence
                opened "Everything on this page has..." — that set up a set, and
                the counts partitioned it. This one says what the page is for,
                which the counts do not itemise, so the colon promised a
                specification and delivered a tally.

                No tally. It lived here while the lead was the only line that
                described the register whole; the view tabs carry the two counts
                now, which is where a reader acts on them rather than reads
                them. Saying it in both places left three numbers in prose that
                could only be checked against two numbers on a control.
                Earlier versions opened on the admission rule — "nothing reaches
                this page without an owner, a date and a source you can check" —
                which states the editorial policy before the reader knows what
                they are looking at. The rule is real and worth keeping, but it
                is the mechanism, not the point: someone arriving from a link
                needs to know this is where Livepeer's delivery work is tracked
                before they need to know what it takes to get on it. The card
                fields say owner and date on every record anyway, and the
                closing block states the rule outright.

                The counts are a sentence, and its subject is borrowed from the
                sentence above. Two earlier versions left that subject missing:
                "That's 4 building now, 5 committed next and 11 shipped" hung a
                list off a pivot pointing back at nothing, and stating the rule
                as a refusal left the same gap, because "nothing" is not a noun
                the next sentence can count.

                The lead avoids "building", "committed" and "shipped" in its own
                words: the three states are the list that follows it, and using
                any of them twice in one breath reads as a stutter.

                                The refusal is not lost. The closing block at the foot of the
                register states it outright, which is where it does its work —
                explaining why the commitments stop. */}
            <p className="mt-7 max-w-[41.5rem] text-lg leading-relaxed text-pretty text-muted-foreground">
              One place to see everything being built across Livepeer, and who
              owns what.
            </p>
          </header>

          {/* useSearchParams needs a boundary, and the register is server-read,
            so only the interactive shell suspends. The masthead sits outside
            it, which keeps the h1 in the prerendered HTML. */}
          <Suspense fallback={<div className="mt-20 h-10 lg:mt-28" />}>
            <Roadmap
              commitments={commitments}
              workstreams={getWorkstreamsInUse(commitments)}
              suggestionsHref={SUGGESTIONS_HREF}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
