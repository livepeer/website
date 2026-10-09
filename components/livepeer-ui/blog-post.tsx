import Image from "next/image";
import Link from "next/link";

import type { BlogAuthor } from "@/lib/blog";

import { keepHyphenated } from "./keep-hyphenated";

export type BlogPostView = {
  title: string;
  category: string;
  /** ISO yyyy-mm-dd, straight from the markdown frontmatter. */
  date: string;
  readingTime: string;
  author?: BlogAuthor;
  heroImage?: string;
  imageAlt?: string;
};

/** Long form here, unlike the index's "Jul 29, 2026" — see blog-listing. */
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    timeZone: "UTC",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Who wrote it: a face, then the name, the way a roadmap record credits
 * someone (RecordCredit), and a monogram where there is no portrait. The name
 * links to their page when they are in the people register; a name that only
 * exists in a markdown file's frontmatter has no page to link to.
 */
function Byline({ author }: { author: BlogAuthor }) {
  const face = author.avatar ? (
    <Image
      src={`/people/${author.avatar}`}
      alt=""
      width={24}
      height={24}
      className="size-6 shrink-0 rounded-full object-cover"
    />
  ) : (
    <span
      aria-hidden
      className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground"
    >
      {author.name.charAt(0)}
    </span>
  );
  const byline = (
    <span className="flex items-center gap-2 text-foreground">
      {face}
      {author.name}
    </span>
  );
  return author.slug ? (
    <Link
      href={`/people/${author.slug}`}
      className="underline decoration-transparent underline-offset-4 transition-colors hover:decoration-border"
    >
      {byline}
    </Link>
  ) : (
    byline
  );
}

/**
 * A blog post.
 *
 * 680px, left-aligned, one column. Nothing sits beside the text — no rail, no
 * share bar, no related strip — because the piece is the page. The only
 * navigation is the breadcrumb at the top and the way back at the bottom.
 */
export function BlogPost({ post, html }: { post: BlogPostView; html: string }) {
  return (
    <div className="px-4 pt-24 pb-24 sm:px-6 lg:px-10">
      <article className="mx-auto max-w-[680px]">
        <header className="mb-12">
          <nav
            aria-label="Breadcrumb"
            className="mb-8 flex items-center gap-2 text-sm text-muted-foreground"
          >
            {/* "Latest Updates", matching the nav's label for this section —
                the URL stays /blog, the word the site uses is Latest. */}
            <Link
              href="/blog"
              className="transition-colors hover:text-foreground"
            >
              Latest Updates
            </Link>
            <span aria-hidden="true">›</span>
            <span>{post.category}</span>
          </nav>

          {/* Smaller than the index's title, deliberately: the index is a
              display statement, an article headline is read.

              font-medium, matching the index card titles, so a headline carries
              the same weight whether it is met on the card or on the article.
              This ran at font-light while it was set in Favorit; under Inter
              that read thin rather than editorial, and at 30px on a phone it
              stopped anchoring the page. 600 was the alternative and is heavier
              than anything else on the site. */}
          <h1 className="text-3xl font-medium tracking-tight text-balance sm:text-4xl lg:text-[2.75rem] lg:leading-[1.15]">
            {keepHyphenated(post.title)}
          </h1>

          {/* One line from sm. On a phone the author takes a line of their own
              and the date and reading time share the next: all three need
              ~365px against 343 on a 375px phone, so as one wrapping row the
              reading time fell to a line by itself. The date and reading time
              never part. */}
          <div className="mt-6 flex flex-col items-start gap-2 text-sm text-muted-foreground sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
            {post.author && <Byline author={post.author} />}
            <span className="flex items-center gap-3 whitespace-nowrap">
              {post.author && (
                <span aria-hidden="true" className="hidden sm:inline">
                  ·
                </span>
              )}
              <time dateTime={post.date}>{formatDate(post.date)}</time>
              <span aria-hidden="true">·</span>
              <span>{post.readingTime}</span>
            </span>
          </div>

          {/* 16:9 here where the index is square — the index is a grid of
              covers and wants a repeating shape; a post opens on one image and
              wants the wider frame. */}
          {post.heroImage && (
            <div className="relative mt-10 aspect-[16/9] overflow-hidden rounded-sm border bg-muted">
              <Image
                src={post.heroImage}
                alt={post.imageAlt ?? ""}
                fill
                sizes="680px"
                priority
                className="object-cover"
              />
            </div>
          )}
        </header>

        {/* article-prose, not reading-prose: an ecosystem entry's write-up is
            secondary content sitting beside a metadata rail and is set at 16px
            muted, where a post's body is the page and is set at 17px on
            foreground. Both live in globals.css on registry tokens; the legacy
            .blog-prose reads the quarantined --color-* layer. */}
        <div
          className="article-prose"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        <div className="mt-16 border-t pt-10 text-center">
          <Link
            href="/blog"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            ← All posts
          </Link>
        </div>
      </article>
    </div>
  );
}
