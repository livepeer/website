import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";

import { HOME_SECTION_HEADING } from "@/components/livepeer-ui/home-heading";
import {
  PostCard,
  type PostCardPost,
} from "@/components/livepeer-ui/post-card";

/**
 * The newest posts, on the home page beneath the Orchestrator band.
 *
 * The page above this is a product, then a call to supply: both are pitches,
 * and on black. This is the one part of it that shows the project moving —
 * what was written lately, in the covers, which are the most colour the site
 * has. Last on the page because it is for every reader rather than for one
 * of the two audiences the sections above address.
 *
 * The blog's own card, with a shorter cover: squares are the index's contact
 * sheet, and three of them here would make a band into a second page. It is
 * one row of the newest at every width — three from sm, and two on a phone,
 * paired the way the index pairs them. A single column of three covers was
 * tried there and made the band twelve hundred pixels of scroll before the
 * footer; a third card under a pair is an orphan. "View all" is where the
 * rest are.
 *
 * No rule above it and no ground of its own: the Orchestrator's particle
 * field carries on under the boundary, through this section's heading row,
 * and passes behind the cards (see `continues` on OrchestratorCtaSection),
 * which is the transition. A hairline there was what the arc appeared to be
 * cut by. So this has to sit inside the same wrapper as that band, which
 * supplies the background, and above its canvas; the covers being opaque is
 * what the arc disappears behind.
 */
export function LatestPostsSection({
  posts,
  heading,
  allLabel,
  allHref,
}: {
  posts: PostCardPost[];
  heading: string;
  allLabel: string;
  allHref: string;
}) {
  // Nothing published is not an empty state worth a section: the page simply
  // ends on the Orchestrator band, as it did before there was a blog row.
  if (posts.length === 0) return null;

  return (
    <section className="relative z-20">
      {/* Less above than below: the arc crossing into this section is what
          separates it from the band, so the top padding only has to clear
          the heading, while the bottom still has the footer's rule to stand
          off from. */}
      <div className="mx-auto w-full max-w-page px-4 pt-10 pb-16 sm:px-6 sm:pt-12 sm:pb-20 lg:px-10 lg:pb-24">
        <div className="flex items-baseline justify-between gap-6">
          {/* The home page's one heading scale (home-heading.ts). It was
              display-sm at first, a step under the band's line so a list
              label would not compete with a pitch — but the two were already
              the same size on a phone, so the difference only existed from
              sm up and read as a mistake, and on a page of few sections the
              small one looked like a footnote. */}
          <h2 className={HOME_SECTION_HEADING}>{heading}</h2>
          <Link
            href={allHref}
            className="group inline-flex shrink-0 items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {allLabel}
            <ArrowRightIcon
              className="size-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
              aria-hidden
            />
          </Link>
        </div>

        <ul className="mt-8 grid grid-cols-2 gap-x-3 sm:mt-12 sm:grid-cols-3 sm:gap-x-6">
          {posts.map((post, index) => (
            <li
              key={post.slug}
              className={index < 2 ? "contents" : "hidden sm:contents"}
            >
              <PostCard
                post={post}
                heading="h3"
                coverClassName="aspect-[3/2]"
                sizes="(min-width: 640px) 33vw, 50vw"
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
