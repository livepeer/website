import { ArrowUpRightIcon } from "lucide-react";
import Link from "next/link";

/* ------------------------------------------------------------------ *
 * Types
 * ------------------------------------------------------------------ */

export type ContributeLink = {
  label: string;
  href: string;
};

export type ContributeCard = ContributeLink & {
  note: string;
};

export type FundingPath = {
  name: string;
  /**
   * The one line that tells a reader whether this path is theirs. Written as
   * the kind of work, not the kind of applicant.
   */
  bestFor: string;
  /**
   * The constraint that settles eligibility fastest — a ceiling, or the shape
   * of the process. Kept separate from `bestFor` because it is what someone
   * skimming for "can I use this" is actually looking for.
   */
  detail: string;
  links: ContributeLink[];
};

export type FundingGroup = {
  /** The body that runs these paths. Two bodies, two processes. */
  name: string;
  intro: string;
  paths: FundingPath[];
  /** A condition that applies to every path in the group, not to one of them. */
  footnote?: string;
};

/* ------------------------------------------------------------------ *
 * Shared furniture
 * ------------------------------------------------------------------ */

/**
 * A major block. Rule, then title, then content — the same shell /brand uses,
 * so the two pages built without a mockup at least agree with each other.
 */
function Section({
  id,
  title,
  intro,
  children,
}: {
  id: string;
  title: string;
  intro?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="mt-20 border-t border-border pt-12 sm:mt-24 sm:pt-16"
    >
      <h2 className="text-page-title text-balance sm:text-display-sm">
        {title}
      </h2>
      {intro && (
        <p className="mt-4 max-w-[52ch] text-reading-body text-pretty text-muted-foreground">
          {intro}
        </p>
      )}
      <div className="mt-10">{children}</div>
    </section>
  );
}

/** The mono caption used for sub-blocks, matching /brand and /ecosystem/submit. */
function Caption({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-mono text-ui-caption tracking-wide text-muted-foreground uppercase">
      {children}
    </h3>
  );
}

/**
 * One link out.
 *
 * Internal routes go through next/link and external ones do not, so the
 * roadmap and the forum behave the way each should: the first without a page
 * load, the second in a new tab with the arrow that says so.
 */
function OutLink({ label, href }: ContributeLink) {
  const external = !href.startsWith("/");

  const content = (
    <>
      {label}
      <ArrowUpRightIcon
        className={
          external
            ? "size-3.5 text-muted-foreground transition-transform group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5"
            : "size-3.5 rotate-45 text-muted-foreground transition-transform group-hover/link:translate-x-0.5"
        }
        aria-hidden="true"
      />
    </>
  );

  const className =
    "group/link inline-flex items-center gap-1.5 text-sm font-medium underline-offset-4 hover:underline";

  return external ? (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {content}
    </a>
  ) : (
    <Link href={href} className={className}>
      {content}
    </Link>
  );
}

/* ------------------------------------------------------------------ *
 * Hero
 * ------------------------------------------------------------------ */

export function ContributeHeroSection({
  eyebrow,
  heading,
  description,
}: {
  eyebrow: string;
  heading: string;
  description: string;
}) {
  return (
    <header className="pt-12 text-center lg:pt-16">
      <p className="font-mono text-ui-caption tracking-wide text-muted-foreground uppercase">
        {eyebrow}
      </p>
      <h1 className="mt-6 text-display-sm text-balance sm:text-display-fluid">
        {heading}
      </h1>
      <p className="mx-auto mt-5 max-w-prose text-sm leading-relaxed text-balance text-muted-foreground">
        {description}
      </p>
    </header>
  );
}

/* ------------------------------------------------------------------ *
 * Where the work comes from
 * ------------------------------------------------------------------ */

/**
 * Deliberately first.
 *
 * The failure this page exists to fix is people arriving with a proposal
 * nobody asked for. Reading the roadmap costs a minute and changes what gets
 * written, so it comes before the money rather than as a footnote to it.
 */
export function ContributeWorkSection({
  title,
  intro,
  links,
}: {
  title: string;
  intro: string;
  links: ContributeCard[];
}) {
  return (
    <Section id="work" title={title} intro={intro}>
      <ul className="grid gap-3 sm:grid-cols-2">
        {links.map((link) => (
          <li key={link.href}>
            <CardLink {...link} />
          </li>
        ))}
      </ul>
    </Section>
  );
}

/**
 * A bordered card that is entirely a link.
 *
 * Per-theme fill, matching /brand and the ecosystem cards: `card` is
 * oklch(1 0 0) in light — identical to the background, so it is invisible
 * there — and `muted/50` is rgb 7 in dark, so it disappears there. Each theme
 * takes the one that lifts.
 */
function CardLink({ label, href, note }: ContributeCard) {
  const external = !href.startsWith("/");

  const body = (
    <>
      <span className="flex items-center gap-1.5 text-sm font-medium">
        {label}
        <ArrowUpRightIcon
          className={
            external
              ? "size-3.5 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              : "size-3.5 rotate-45 text-muted-foreground transition-transform group-hover:translate-x-0.5"
          }
          aria-hidden="true"
        />
      </span>
      <span className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {note}
      </span>
    </>
  );

  const className =
    "group flex h-full flex-col rounded-sm border border-border p-5 transition-colors hover:bg-muted/50 dark:hover:bg-card";

  return external ? (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {body}
    </a>
  ) : (
    <Link href={href} className={className}>
      {body}
    </Link>
  );
}

/* ------------------------------------------------------------------ *
 * Funding
 * ------------------------------------------------------------------ */

/**
 * The five paths, grouped by the body that runs them.
 *
 * Grouped rather than flattened into one list because the two bodies decide
 * differently — the Treasury by a vote of everyone holding stake, the SPE by
 * its own review — and someone choosing a path needs to know which room their
 * proposal ends up in.
 */
export function ContributeFundingSection({
  title,
  intro,
  groups,
}: {
  title: string;
  intro: string;
  groups: FundingGroup[];
}) {
  return (
    <Section id="funding" title={title} intro={intro}>
      <div className="flex flex-col gap-12">
        {groups.map((group) => (
          <div key={group.name}>
            <Caption>{group.name}</Caption>
            <p className="mt-2.5 max-w-[52ch] text-sm leading-relaxed text-muted-foreground">
              {group.intro}
            </p>

            <dl className="mt-6">
              {group.paths.map((path) => (
                <div
                  key={path.name}
                  className="border-t border-border py-5 last:border-b sm:grid sm:grid-cols-[12rem_1fr] sm:gap-6"
                >
                  <dt className="text-sm font-medium">{path.name}</dt>
                  <dd className="mt-1.5 sm:mt-0">
                    <p className="text-sm leading-relaxed">{path.bestFor}</p>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      {path.detail}
                    </p>
                    {/* Wraps rather than scrolls: the Treasury path carries
                        three, and on a phone they stack. */}
                    <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
                      {path.links.map((link) => (
                        <OutLink key={link.href} {...link} />
                      ))}
                    </div>
                  </dd>
                </div>
              ))}
            </dl>

            {group.footnote && (
              <p className="mt-4 max-w-[60ch] text-xs leading-relaxed text-muted-foreground">
                {group.footnote}
              </p>
            )}
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ *
 * Starting without a proposal
 * ------------------------------------------------------------------ */

export function ContributeStartSection({
  title,
  intro,
  links,
}: {
  title: string;
  intro: string;
  links: ContributeCard[];
}) {
  return (
    <Section id="start" title={title} intro={intro}>
      <ul className="grid gap-3 sm:grid-cols-2">
        {links.map((link) => (
          <li key={link.href}>
            <CardLink {...link} />
          </li>
        ))}
      </ul>
    </Section>
  );
}

/* ------------------------------------------------------------------ *
 * Retired mechanisms
 * ------------------------------------------------------------------ */

/**
 * The dead programmes, named.
 *
 * They are here for exactly one reader: someone who followed a link from a
 * 2024 post and is about to file a request nobody reads. Listing them is
 * cheaper than the silence they would otherwise get.
 */
export function ContributeRetiredSection({
  title,
  intro,
  links,
}: {
  title: string;
  intro: string;
  links: ContributeCard[];
}) {
  return (
    <Section id="retired" title={title} intro={intro}>
      <dl>
        {links.map((link) => (
          <div
            key={link.href}
            className="border-t border-border py-4 last:border-b sm:grid sm:grid-cols-[12rem_1fr] sm:gap-6"
          >
            <dt className="text-sm font-medium text-muted-foreground">
              {link.label}
            </dt>
            <dd className="mt-1 text-sm leading-relaxed text-muted-foreground sm:mt-0">
              {link.note}{" "}
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4 hover:text-foreground"
              >
                Archive
              </a>
            </dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}
