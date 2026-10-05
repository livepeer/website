import Link from "next/link";
import { ArrowRightIcon, ArrowUpRightIcon } from "lucide-react";

import { FoundationVennField } from "@/components/livepeer-ui/foundation-venn-field";
import { Button } from "@/components/ui/button";

/**
 * The Foundation page (/foundation).
 *
 * A centred opening with the Venn assembling over the Foundation's name;
 * then three chapters, each a statement pinned on the left while what bears
 * it out scrolls past on the right; then three ways in as tiles. Each
 * statement is the Foundation's own part, in the first person: it sets the
 * direction, connects work to the treasury's funding (it does not fund), and
 * holds the work to account. The copy and the sections are minimal and the
 * design is not (Adam). The lists beside the chapters are in
 * foundation-steps.tsx, the copy in app/foundation/content.ts.
 *
 * What came before, and why it went: the mockup's two sections (what the
 * Foundation is; what it does, beside a Venn) with the roadmap and the blog
 * under them stated the job in one place and showed it in another. Redrawn
 * from scratch, the headline set in the overlap of a full-screen Venn fought
 * the drawing for one space; the words beside a large Venn gave the drawing
 * as much room as the message and read as dull; one Venn pinned on the left
 * while the page scrolled read as strange. The title is the Foundation's
 * name, because "Advancing the world's open inference network." describes
 * the network and the page stopped reading as the Foundation's (Adam).
 */

/** The page's copy; see app/foundation/content.ts. */
export type FoundationContent = {
  hero: {
    title: string;
    description: string;
    cta: { label: string; href: string };
  };
  direction: FoundationChapterContent;
  funding: FoundationChapterContent;
  accountability: FoundationChapterContent;
  waysIn: { heading: string; ways: WayIn[] };
};

export type FoundationChapterContent = {
  statement: string;
  lede: string;
  link?: { label: string; href: string };
};

/** One way in, for the close. */
export type WayIn = { title: string; line: string; href: string };

/** One open commitment on the roadmap, as the page lists it. */
export type FoundationWorkItem = {
  slug: string;
  title: string;
  outcome?: string;
  state: "building" | "next";
  /** Who is answerable for it, which is often not the Foundation. */
  owner: string;
};

const external = (href: string) => /^https?:/.test(href);
const newTab = (href: string) =>
  external(href) ? { target: "_blank", rel: "noreferrer" } : {};

function Arrow({ href, className = "" }: { href: string; className?: string }) {
  const Icon = external(href) ? ArrowUpRightIcon : ArrowRightIcon;
  return <Icon className={`size-4 shrink-0 ${className}`} aria-hidden="true" />;
}

function TextLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      {...newTab(href)}
      className={`inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground ${className}`}
    >
      {children}
      <Arrow href={href} />
    </Link>
  );
}

/** One rhythm for every part below the opening. */
const SECTION = "px-4 py-20 sm:px-6 sm:py-28 lg:px-10";

/** A section's statement: a step under the title at every width. */
const STATEMENT = "text-display-sm text-balance xl:text-display-md";

const LEDE = "text-base leading-relaxed text-muted-foreground";

/**
 * The opening: the Venn assembles over the Foundation's name.
 *
 * The first time it is seen its rings slide together and the overlap lights:
 * independent teams brought into overlap, the Foundation's job in a second of
 * motion. The title is the home page's scale (48px, then fluid to 64px), so
 * no page's title outranks the home page's.
 */
export function FoundationHero({
  content,
}: {
  content: FoundationContent["hero"];
}) {
  return (
    <section className="px-4 pt-12 pb-20 sm:px-6 sm:pt-16 sm:pb-28 lg:px-10">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
        <FoundationVennField
          assemble
          density={1.1}
          className="max-w-[22rem] sm:max-w-[30rem]"
        />
        <h1 className="mt-10 text-display-md text-balance sm:text-display-fluid">
          {content.title}
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-balance text-muted-foreground">
          {content.description}
        </p>
        <Button
          size="lg"
          nativeButton={false}
          render={<Link href={content.cta.href} />}
          className="mt-10 h-12 rounded-sm px-5"
        >
          {content.cta.label}
          <ArrowRightIcon className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </section>
  );
}

/**
 * One chapter: the statement pinned on the left while its proof scrolls on
 * the right, so the two are read together. Below lg they stack, statement
 * first.
 */
export function FoundationChapter({
  content,
  children,
}: {
  content: FoundationChapterContent;
  children: React.ReactNode;
}) {
  return (
    <section className={SECTION}>
      <div className="mx-auto grid w-full max-w-page gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:sticky lg:top-32 lg:col-span-5 lg:self-start">
          <h2 className={STATEMENT}>{content.statement}</h2>
          <p className={`mt-5 max-w-md ${LEDE}`}>{content.lede}</p>
          {content.link && (
            <TextLink href={content.link.href} className="mt-8">
              {content.link.label}
            </TextLink>
          )}
        </div>
        <div className="lg:col-span-7">{children}</div>
      </div>
    </section>
  );
}

/** The close: three ways in as tiles, the whole tile the link. */
export function FoundationWaysIn({
  content,
}: {
  content: FoundationContent["waysIn"];
}) {
  return (
    <section className="px-4 pt-20 pb-28 sm:px-6 sm:pt-28 sm:pb-36 lg:px-10">
      <div className="mx-auto w-full max-w-page">
        <h2 className={`text-center ${STATEMENT}`}>{content.heading}</h2>
        <ul className="mt-12 grid gap-3 md:grid-cols-3 md:gap-4">
          {content.ways.map((way) => (
            <li key={way.title}>
              <Link
                href={way.href}
                {...newTab(way.href)}
                className="group flex h-full flex-col gap-3 rounded-lg border border-border p-6 transition-colors hover:bg-accent"
              >
                <span className="flex items-center justify-between gap-4 text-lg font-medium tracking-tight">
                  {way.title}
                  <Arrow
                    href={way.href}
                    className="text-muted-foreground transition-transform group-hover:translate-x-0.5"
                  />
                </span>
                <span className="text-sm leading-relaxed text-muted-foreground">
                  {way.line}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
