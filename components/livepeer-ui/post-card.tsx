import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

import { keepHyphenated } from "./keep-hyphenated";

export type PostCardPost = {
  slug: string;
  title: string;
  description: string;
  category: string;
  /** ISO yyyy-mm-dd, straight from the markdown frontmatter. */
  date: string;
  image?: string;
  imageAlt?: string;
};

/**
 * Frontmatter dates are plain yyyy-mm-dd, which Date parses as UTC midnight.
 * Formatted in any timezone west of UTC that renders as the day before — so
 * the zone is pinned rather than left to the server's locale.
 */
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * A post as a cover with its title, category and date beneath: the card the
 * blog index is a contact sheet of, and the one the home page shows three of.
 * One component so the two cannot drift — a post looks the same wherever it
 * is offered, and only the cover's proportion and the heading level are the
 * caller's.
 */
export function PostCard({
  post,
  heading: Heading = "h2",
  coverClassName = "aspect-square",
  sizes,
}: {
  post: PostCardPost;
  /** The level the title sits at under the caller's own heading. */
  heading?: "h2" | "h3";
  /** The cover's proportion; square on the index. */
  coverClassName?: string;
  /** next/image `sizes` for the column the card sits in. */
  sizes: string;
}) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex min-w-0 flex-col gap-2"
    >
      {/* The same tile whether or not the post has art: the bordered muted
          panel is the placeholder, so a post without a cover leaves a
          considered gap rather than a collapsed card. */}
      <div
        className={cn(
          "relative overflow-hidden rounded-sm border bg-muted",
          coverClassName
        )}
      >
        {post.image && (
          <Image
            src={post.image}
            alt={post.imageAlt ?? ""}
            fill
            sizes={sizes}
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        )}
      </div>
      {/* font-medium: at 20px Inter's 300 goes thin and the title stops
          out-weighing the body copy beneath it. Matches the ecosystem card
          title. */}
      <Heading className="text-xl leading-snug font-medium tracking-tight text-pretty">
        {keepHyphenated(post.title)}
      </Heading>
      {/* whitespace-nowrap with a truncating date: at 390px a two-column card
          is ~180px wide, and letting this row wrap would stagger every card
          in the row by a line. The category holds its width; the date gives
          way. */}
      <div className="flex items-center gap-2 overflow-hidden pl-[1px] whitespace-nowrap">
        <span className="shrink-0 text-xs text-foreground">
          {post.category}
        </span>
        <time
          dateTime={post.date}
          className="min-w-0 truncate text-xs text-muted-foreground"
        >
          {formatDate(post.date)}
        </time>
      </div>
    </Link>
  );
}
