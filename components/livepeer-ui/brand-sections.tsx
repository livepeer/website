import { ArrowUpRightIcon, DownloadIcon } from "lucide-react";

import {
  LivepeerLockup,
  LivepeerSymbol,
  LivepeerWordmark,
} from "@/components/brand";
import { CopyButton } from "@/components/copy-button";
import { Button } from "@/components/ui/button";

/* ------------------------------------------------------------------ *
 * Shared furniture
 * ------------------------------------------------------------------ */

/** A major block. Rule, then title, then content — repeated down the page. */
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

/** The mono caption used for sub-blocks, matching /ecosystem/submit. */
function Caption({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-mono text-ui-caption tracking-wide text-muted-foreground uppercase">
      {children}
    </h3>
  );
}

/**
 * A rule stated as a rule.
 *
 * Brand pages fail by burying constraints in paragraphs nobody finishes. Each
 * of these is one line, and the ones that say "never" say it first.
 */
function Rule({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-border py-4 last:border-b-0 sm:grid sm:grid-cols-[12rem_1fr] sm:gap-6">
      <dt className="text-sm font-medium">{label}</dt>
      <dd className="mt-1 text-sm leading-relaxed text-muted-foreground sm:mt-0">
        {children}
      </dd>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * The mark
 * ------------------------------------------------------------------ */

const MARKS = [
  {
    name: "Symbol",
    note: "Favicons, avatars, app icons — anywhere the name is already established.",
    file: "livepeer-symbol",
    render: <LivepeerSymbol className="h-12 w-auto" aria-hidden="true" />,
  },
  {
    name: "Wordmark",
    note: "The default. Use it wherever the name has to be read.",
    file: "livepeer-wordmark",
    render: <LivepeerWordmark className="h-6 w-auto" aria-hidden="true" />,
  },
  {
    name: "Lockup",
    note: "Symbol and wordmark in fixed relation. Never rebuild it by hand.",
    file: "livepeer-lockup",
    render: <LivepeerLockup className="h-6 w-auto" aria-hidden="true" />,
  },
];

/**
 * A clear-space diagram, because the rule is spatial.
 *
 * "Space equal to the symbol's width on all sides" is a sentence someone has
 * to translate before they can apply it. Drawing it removes the translation:
 * the dashed box is the boundary, the four ticks are the measure, and the
 * measure is the symbol itself.
 */
function ClearSpaceDiagram() {
  return (
    <div className="rounded-sm border border-border p-8 sm:p-12">
      <div className="mx-auto flex max-w-sm items-center justify-center">
        {/* Padding is the symbol's own width — 73/89 of its height, the mark's
            aspect ratio — so the drawing stays correct at any size rather than
            encoding a pixel value.

            Both values spell var() out. Tailwind v4 dropped v3's bare
            [--custom-property] shorthand in favour of (--custom-property), and
            the silent failure mode is a rule that never compiles: h-[--symbol-h]
            left the symbol at zero height while the padding beside it, written
            with an explicit var(), resolved fine. */}
        <div
          className="relative border border-dashed border-border p-[calc(var(--symbol-h)*73/89)]"
          style={{ "--symbol-h": "3rem" } as React.CSSProperties}
        >
          <LivepeerSymbol
            className="h-[var(--symbol-h)] w-auto text-foreground"
            aria-hidden="true"
          />
          {/* One labelled edge rather than four: the rule is the same on every
              side, and repeating it four times only adds ink. */}
          {/* nowrap: the box is only as wide as the symbol plus its margin, so
              without it the label breaks onto three stacked lines and spills
              out of the drawing it is annotating. */}
          <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-background px-2 font-mono text-[0.625rem] whitespace-nowrap tracking-wide text-muted-foreground uppercase">
            = symbol width
          </span>
        </div>
      </div>
    </div>
  );
}

export function BrandMarkSection({ kitHref }: { kitHref: string }) {
  return (
    <Section
      id="mark"
      title="The mark"
      intro="Three forms, one relationship. Take them from here rather than lifting them off a screenshot — every file below is the source vector."
    >
      <ul className="grid gap-3 sm:grid-cols-3">
        {MARKS.map((mark) => (
          <li
            key={mark.name}
            className="flex flex-col rounded-sm border border-border"
          >
            {/* The mark sits on muted rather than the page: a logo needs a
                field of its own to be judged, and the tile is that field. */}
            <div className="flex min-h-40 items-center justify-center bg-muted px-6">
              {mark.render}
            </div>
            <div className="flex flex-1 flex-col p-5">
              <Caption>{mark.name}</Caption>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                {mark.note}
              </p>
              <div className="mt-5 flex gap-4 font-mono text-xs">
                {/* Named by ink colour, not by theme: "black" is unambiguous
                    where "light" invites the wrong download half the time. */}
                <a
                  href={`/brand-assets/${mark.file}-black.svg`}
                  download
                  className="text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
                >
                  Black SVG
                </a>
                <a
                  href={`/brand-assets/${mark.file}-white.svg`}
                  download
                  className="text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
                >
                  White SVG
                </a>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_minmax(0,26rem)] lg:gap-16">
        <div>
          <Caption>Placing it</Caption>
          <dl className="mt-4">
            <Rule label="Clear space">
              Keep space equal to the symbol&apos;s width on all four sides.
              Nothing — type, rules, image edges — enters it.
            </Rule>
            <Rule label="Minimum size">
              Symbol at 16px. Wordmark and lockup at 24px tall. Below that the
              counters close up and it stops reading as the mark.
            </Rule>
            <Rule label="Colour">
              Black or white only. The mark is never green, never gradient,
              never tinted to match a background.
            </Rule>
            <Rule label="Never">
              Stretch, rotate, outline, add a shadow, reorder the lockup, or
              rebuild it from the symbol and wordmark by hand.
            </Rule>
          </dl>
          <Button
            size="lg"
            nativeButton={false}
            render={<a href={kitHref} download />}
            className="mt-8 h-12 rounded-sm px-5"
          >
            <DownloadIcon className="size-4" aria-hidden="true" />
            Download the brand kit
          </Button>
          <p className="mt-3 font-mono text-xs text-muted-foreground">
            ZIP · marks, colour, and usage notes
          </p>
        </div>

        <ClearSpaceDiagram />
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ *
 * Colour
 * ------------------------------------------------------------------ */

/**
 * The semantic roles.
 *
 * No hex values printed anywhere. Roles are the interface: the registry theme
 * owns the numbers, they differ between light and dark, and a page that
 * reprints them creates the second token layer design.md forbids. The swatch
 * renders the live value for whichever theme you are reading in, which is both
 * truthful and self-updating.
 */
const ROLES = [
  { token: "--background", swatch: "bg-background", use: "The canvas." },
  { token: "--foreground", swatch: "bg-foreground", use: "Default text." },
  { token: "--card", swatch: "bg-card", use: "A self-contained object." },
  { token: "--muted", swatch: "bg-muted", use: "Subdued regions and supporting text." },
  { token: "--primary", swatch: "bg-primary", use: "The default action." },
  { token: "--secondary", swatch: "bg-secondary", use: "Lower-emphasis actions." },
  { token: "--accent", swatch: "bg-accent", use: "State changes." },
  { token: "--border", swatch: "bg-border", use: "Separation." },
  { token: "--input", swatch: "bg-input", use: "Control edges." },
  { token: "--ring", swatch: "bg-ring", use: "Visible focus." },
  { token: "--destructive", swatch: "bg-destructive", use: "Destructive actions and errors." },
];

export function BrandColorSection() {
  return (
    <Section
      id="colour"
      title="Colour"
      intro="One brand colour, and a set of roles that carry everything else. The roles are the interface — they resolve differently in light and dark, which is why this page shows the role rather than a hex value."
    >
      {/* Green first and alone, because the rule attached to it is the single
          most-broken rule in the system. */}
      <div className="grid gap-0 overflow-hidden rounded-sm border border-border sm:grid-cols-[1fr_1.2fr]">
        <div className="min-h-48 bg-brand" />
        <div className="flex flex-col justify-center p-6 sm:p-10">
          <Caption>Livepeer green</Caption>
          <div className="mt-3 flex items-center gap-1">
            <code className="font-mono text-sm">
              color(display-p3 0.04 0.74 0.49)
            </code>
            <CopyButton value="color(display-p3 0.04 0.74 0.49)" />
          </div>
          <p className="mt-5 max-w-[44ch] text-sm leading-relaxed text-muted-foreground">
            <strong className="font-medium text-foreground">
              Green is not an affordance colour.
            </strong>{" "}
            Never a button, link, hover, focus, selected state, or success
            message. It is non-interactive brand expression only — marks,
            diagrams, artwork, and branded motion. Actions use{" "}
            <code className="font-mono text-xs">primary</code>.
          </p>
        </div>
      </div>

      <div className="mt-12">
        <Caption>Roles</Caption>
        <ul className="mt-4 grid gap-x-6 sm:grid-cols-2 lg:grid-cols-3">
          {ROLES.map((role) => (
            <li
              key={role.token}
              className="flex items-center gap-3 border-b border-border py-3"
            >
              {/* Bordered, because two of these roles are the page background
                  itself and would otherwise be an invisible swatch. */}
              <span
                className={`size-8 shrink-0 rounded-sm border border-border ${role.swatch}`}
                aria-hidden="true"
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-mono text-xs">
                  {role.token}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {role.use}
                </span>
              </span>
              <CopyButton value={`var(${role.token})`} />
            </li>
          ))}
        </ul>
        <p className="mt-6 max-w-[52ch] text-sm leading-relaxed text-muted-foreground">
          <code className="font-mono text-xs">chart-1</code> through{" "}
          <code className="font-mono text-xs">chart-5</code> distinguish ordered
          data series and are never an alternative action palette. Do not add a
          second token layer or hard-code a colour for a role the theme already
          covers.
        </p>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ *
 * Type
 * ------------------------------------------------------------------ */

const FACES = [
  {
    name: "Inter",
    utility: "font-sans",
    specimen: "The open inference network",
    specimenClass: "font-sans",
    rule: "The default. Product UI, navigation, forms, data, docs, ordinary headings, and body copy. A heading element does not imply a display face.",
  },
  {
    name: "Favorit Pro",
    utility: "font-display",
    specimen: "The open inference network",
    specimenClass: "font-display font-light",
    rule: "Opt-in brand display type, for major marketing statements and editorial titles. Never for routine product UI.",
  },
  {
    name: "Favorit Mono",
    utility: "font-mono",
    specimen: "0x1a2b · 128 GPUs · 04:21:07",
    specimenClass: "font-mono",
    rule: "Code, commands, paths, IDs, timestamps, and short technical annotations — normally at text-xs or text-sm. Never explanatory prose.",
  },
];

const SCALE = [
  { role: "UI caption", utility: "text-ui-caption", size: "12 / 16", weight: "500", tracking: "—" },
  { role: "UI body", utility: "text-ui-body", size: "14 / 20", weight: "400", tracking: "—" },
  { role: "Reading body", utility: "text-reading-body", size: "16 / 28", weight: "400", tracking: "—" },
  { role: "Page title", utility: "text-page-title", size: "32 / 0.98", weight: "300", tracking: "-0.025em" },
  { role: "Display small", utility: "text-display-sm", size: "36 / 0.98", weight: "300", tracking: "-0.045em" },
  { role: "Display medium", utility: "text-display-md", size: "48 / 0.98", weight: "300", tracking: "-0.045em" },
  { role: "Display large", utility: "text-display-lg", size: "60 / 0.98", weight: "300", tracking: "-0.045em" },
  { role: "Display fluid", utility: "text-display-fluid", size: "40→64 / 0.98", weight: "300", tracking: "-0.045em" },
];

export function BrandTypeSection() {
  return (
    <Section
      id="type"
      title="Type"
      intro="Three faces, split by role rather than by hierarchy. Which one you reach for is decided by what the text is doing, not by how large it is."
    >
      <ul className="grid gap-3 lg:grid-cols-3">
        {FACES.map((face) => (
          <li
            key={face.name}
            className="flex flex-col rounded-sm border border-border"
          >
            <div className="flex min-h-32 items-center bg-muted px-6 py-8">
              <p className={`${face.specimenClass} text-2xl text-pretty`}>
                {face.specimen}
              </p>
            </div>
            <div className="flex flex-1 flex-col p-5">
              <div className="flex items-baseline gap-2">
                <Caption>{face.name}</Caption>
                <code className="font-mono text-xs text-muted-foreground">
                  {face.utility}
                </code>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {face.rule}
              </p>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-12">
        <Caption>The scale</Caption>
        <p className="mt-3 max-w-[52ch] text-sm leading-relaxed text-muted-foreground">
          Each utility carries its own size, line height, weight, and tracking.
          Add the font-family utility separately, and reach for a responsive
          pair — <code className="font-mono text-xs">text-display-sm</code>{" "}
          <code className="font-mono text-xs">sm:text-display-md</code> — rather
          than interpolating a one-off size.
        </p>

        {/* Scrolls inside its own box: five columns of tabular data do not
            compress to 390px, and squeezing them would cost the alignment
            that makes a scale readable as a scale. */}
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[38rem] border-collapse text-left">
            <thead>
              <tr className="border-b border-border">
                {["Role", "Utility", "Size / leading", "Weight", "Tracking"].map(
                  (head) => (
                    <th
                      key={head}
                      scope="col"
                      className="py-3 pr-6 font-mono text-ui-caption tracking-wide text-muted-foreground uppercase"
                    >
                      {head}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {SCALE.map((row) => (
                <tr key={row.utility} className="border-b border-border">
                  <td className="py-3 pr-6 text-sm">{row.role}</td>
                  <td className="py-3 pr-6 font-mono text-xs">{row.utility}</td>
                  {/* Tabular numerals so the sizes form a column you can read
                      down, which is the whole point of printing a scale. */}
                  <td className="py-3 pr-6 font-mono text-xs tabular-nums text-muted-foreground">
                    {row.size}
                  </td>
                  <td className="py-3 pr-6 font-mono text-xs tabular-nums text-muted-foreground">
                    {row.weight}
                  </td>
                  <td className="py-3 pr-6 font-mono text-xs tabular-nums text-muted-foreground">
                    {row.tracking}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ *
 * Where the system lives
 * ------------------------------------------------------------------ */

export function BrandSystemSection({
  links,
}: {
  links: { label: string; href: string; note: string }[];
}) {
  return (
    <Section
      id="system"
      title="The system"
      intro="This page is the summary. The design system itself — tokens, components, and the full guidance — is the Livepeer UI registry."
    >
      <ul className="grid gap-3 sm:grid-cols-3">
        {links.map((link) => (
          <li key={link.href}>
            {/* Per-theme fill, matching the ecosystem cards: `card` is
                oklch(1 0 0) in light — identical to the background — so it is
                invisible there, and `muted/50` is rgb 7 in dark, so it
                disappears there. Each theme takes the one that lifts. */}
            <a
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex h-full flex-col rounded-sm border border-border p-5 transition-colors hover:bg-muted/50 dark:hover:bg-card"
            >
              <span className="flex items-center gap-1.5 text-sm font-medium">
                {link.label}
                <ArrowUpRightIcon
                  className="size-3.5 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </span>
              <span className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {link.note}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </Section>
  );
}

/* ------------------------------------------------------------------ *
 * Hero
 * ------------------------------------------------------------------ */

export function BrandHeroSection({
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
      <h1 className="mt-6 font-display text-display-sm text-balance sm:text-display-fluid">
        {heading}
      </h1>
      <p className="mx-auto mt-5 max-w-prose text-sm leading-relaxed text-balance text-muted-foreground">
        {description}
      </p>
    </header>
  );
}
