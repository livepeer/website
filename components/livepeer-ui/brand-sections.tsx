import { ArrowUpRightIcon, DownloadIcon, XIcon } from "lucide-react";

import { LivepeerLockup, LivepeerSymbol } from "@/components/brand";
import { CopyButton } from "@/components/copy-button";
import { MarkPlates, Specimen } from "@/components/livepeer-ui/brand-interactive";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ *
 * Furniture
 *
 * Objects, not paragraphs. Each thing the page has to say is a plate you
 * can look at: the marks in both inks, every rule as a small picture, the
 * colour as a field, the faces as lines you can type into. Copy is a
 * caption under the object, never a block beside it.
 * ------------------------------------------------------------------ */

function Section({
  id,
  title,
  lede,
  aside,
  children,
}: {
  id: string;
  title: string;
  lede?: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mt-28 scroll-mt-24 sm:mt-36">
      <div className="flex items-end justify-between gap-6">
        <div>
          <h2 className="text-page-title">{title}</h2>
          {lede && (
            <p className="mt-3 max-w-[44ch] text-sm leading-relaxed text-pretty text-muted-foreground">
              {lede}
            </p>
          )}
        </div>
        {aside}
      </div>
      <div className="mt-8">{children}</div>
    </section>
  );
}

/** A soft field for an object to sit on. */
function Plate({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center overflow-hidden rounded-lg bg-muted text-foreground",
        className
      )}
    >
      {children}
    </div>
  );
}

/** The caption under a plate: a name, then a note in the quieter colour. */
function Caption({
  name,
  note,
  never,
}: {
  name: string;
  note?: string;
  never?: boolean;
}) {
  return (
    <p className="mt-3 flex items-baseline gap-2 px-1 text-sm">
      {never && (
        <XIcon
          className="size-3 shrink-0 self-center text-muted-foreground"
          aria-hidden="true"
        />
      )}
      <span className="whitespace-nowrap">{name}</span>
      {note && <span className="text-muted-foreground">{note}</span>}
    </p>
  );
}

/* ------------------------------------------------------------------ *
 * Hero
 * ------------------------------------------------------------------ */

export function BrandHeroSection({
  heading,
  description,
  kitHref,
  systemHref,
}: {
  heading: string;
  description: string;
  kitHref: string;
  systemHref: string;
}) {
  return (
    <header className="mx-auto max-w-2xl pt-12 text-center sm:pt-20">
      <p className="font-mono text-xs text-muted-foreground">Livepeer</p>
      {/* Inter, like every other page title. The Favorit Pro line in the
          type section is the one place this page sets the display face;
          there it is the subject, not the styling. */}
      <h1 className="mt-5 text-display-md text-balance sm:text-display-lg">
        {heading}
      </h1>
      <p className="mx-auto mt-6 max-w-[40ch] text-reading-body text-pretty text-muted-foreground">
        {description}
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button
          size="lg"
          nativeButton={false}
          render={<a href={kitHref} download />}
        >
          <DownloadIcon data-icon="inline-start" aria-hidden="true" />
          Download the kit
        </Button>
        <Button
          size="lg"
          variant="outline"
          nativeButton={false}
          render={
            <a href={systemHref} target="_blank" rel="noopener noreferrer" />
          }
        >
          Design system
          <ArrowUpRightIcon data-icon="inline-end" aria-hidden="true" />
        </Button>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ *
 * Mark
 * ------------------------------------------------------------------ */

export function BrandMarkSection() {
  return (
    <section id="mark" className="mt-16 scroll-mt-24 sm:mt-24">
      <MarkPlates />
    </section>
  );
}

/**
 * Clear space, drawn. The symbol is 73 units wide and 89 tall; the margin on
 * every side is one symbol width, so the hairline is the exclusion zone.
 */
function ClearSpace() {
  const W = 73;
  const H = 89;
  return (
    <svg
      viewBox={`-8 -8 ${W * 3 + 16} ${H + W * 2 + 16}`}
      className="h-[60%] w-auto"
      aria-label="Clear space: one symbol width on every side"
      role="img"
    >
      <rect
        x="0.5"
        y="0.5"
        width={W * 3 - 1}
        height={H + W * 2 - 1}
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.35"
        strokeDasharray="3 3"
      />
      <g stroke="currentColor" strokeOpacity="0.5">
        <line x1={W} y1={W / 2} x2={W * 2} y2={W / 2} />
        <line x1={W} y1={W / 2 - 4} x2={W} y2={W / 2 + 4} />
        <line x1={W * 2} y1={W / 2 - 4} x2={W * 2} y2={W / 2 + 4} />
      </g>
      <g transform={`translate(${W} ${W})`}>
        <LivepeerSymbol width={W} height={H} aria-hidden="true" />
      </g>
    </svg>
  );
}

const NEVER = [
  {
    name: "Stretched",
    render: (
      <LivepeerSymbol
        className="h-10 w-auto scale-x-[1.6]"
        aria-hidden="true"
      />
    ),
  },
  {
    name: "Rotated",
    render: (
      <LivepeerSymbol className="h-10 w-auto rotate-[24deg]" aria-hidden="true" />
    ),
  },
  {
    name: "Outlined",
    render: (
      <LivepeerSymbol
        className="h-10 w-auto"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        aria-hidden="true"
      />
    ),
  },
  {
    name: "Recoloured",
    render: (
      // The one green mark on the site, shown as the thing not to do.
      <LivepeerSymbol className="h-10 w-auto text-brand" aria-hidden="true" />
    ),
  },
];

export function BrandUsageSection() {
  return (
    <Section
      id="usage"
      title="Using the mark"
      lede="Give it room, keep it legible, and leave it alone."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Plate className="aspect-[3/2]">
            <ClearSpace />
          </Plate>
          <Caption name="Clear space" note="One symbol width, every side." />
        </div>
        <div>
          <Plate className="aspect-[3/2]">
            {/* The lockup at its floor. The symbol shares the wordmark's
                height there, so this one object states both minimums. */}
            <span className="flex flex-col items-center gap-3">
              <LivepeerLockup className="h-8 w-auto" aria-hidden="true" />
              <span className="font-mono text-xs text-muted-foreground">
                32px
              </span>
            </span>
          </Plate>
          <Caption
            name="Minimum size"
            note="Symbol and lockup 32px. Wordmark alone 24px."
          />
        </div>
      </div>
      <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {NEVER.map((item) => (
          <li key={item.name}>
            <Plate className="aspect-square">{item.render}</Plate>
            <Caption name={item.name} never />
          </li>
        ))}
      </ul>
      <p className="mt-6 max-w-[48ch] px-1 text-sm leading-relaxed text-muted-foreground">
        Below 32px the symbol&apos;s squares close up, so it is not an icon.
        Black or white, never a gradient, never a shadow, never rebuilt from
        the parts. If it is not in the kit, it is not the mark.
      </p>
    </Section>
  );
}

/* ------------------------------------------------------------------ *
 * Colour
 * ------------------------------------------------------------------ */

const GREEN = "color(display-p3 0.04 0.74 0.49)";

/**
 * The semantic roles. No hex values: the registry theme owns the numbers
 * and they differ between light and dark, so each swatch renders the live
 * value for the theme you are reading in.
 */
const ROLES = [
  { token: "background", swatch: "bg-background" },
  { token: "foreground", swatch: "bg-foreground" },
  { token: "card", swatch: "bg-card" },
  { token: "muted", swatch: "bg-muted" },
  { token: "primary", swatch: "bg-primary" },
  { token: "secondary", swatch: "bg-secondary" },
  { token: "accent", swatch: "bg-accent" },
  { token: "border", swatch: "bg-border" },
  { token: "input", swatch: "bg-input" },
  { token: "ring", swatch: "bg-ring" },
  { token: "destructive", swatch: "bg-destructive" },
];

export function BrandColorSection() {
  return (
    <Section
      id="colour"
      title="Colour"
      lede="One colour is ours. Everything else is a role the theme resolves."
    >
      <div className="aspect-[2/1] rounded-lg bg-brand sm:aspect-[3/1]" />
      <div className="mt-3 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 px-1">
        <p className="text-sm">
          Livepeer green
          <span className="ml-2 text-muted-foreground">
            Marks, diagrams, artwork, motion. Never a button, link or state.
          </span>
        </p>
        <span className="inline-flex items-center gap-1">
          <code className="font-mono text-xs text-muted-foreground">
            {GREEN}
          </code>
          <CopyButton value={GREEN} className="-my-2" />
        </span>
      </div>

      <ul className="mt-12 grid grid-cols-3 gap-3 sm:grid-cols-6">
        {ROLES.map((role) => (
          <li key={role.token} className="min-w-0">
            {/* Hairline on every swatch: two of these roles are the page
                itself and would otherwise be an invisible square. */}
            <span
              className={cn(
                "block aspect-square w-full rounded-lg border border-border",
                role.swatch
              )}
              aria-hidden="true"
            />
            <span className="mt-2 block truncate px-1 font-mono text-xs text-muted-foreground">
              {role.token}
            </span>
          </li>
        ))}
      </ul>
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
    role: "Product, body, docs, ordinary headings.",
    text: "The open inference network",
    className: "font-sans text-display-sm sm:text-display-md",
  },
  {
    name: "Favorit Pro",
    utility: "font-display",
    role: "Major statements, by choice.",
    text: "The open inference network",
    className: "font-display text-display-sm sm:text-display-md",
  },
  {
    name: "Favorit Mono",
    utility: "font-mono",
    role: "Code, paths, IDs, timestamps.",
    text: "0x1a2b · 128 GPUs · 04:21:07",
    className: "font-mono text-2xl sm:text-3xl",
  },
];

/** The scale at its own sizes. A ladder of the utilities is the scale. */
const SCALE = [
  { utility: "text-ui-caption", note: "12" },
  { utility: "text-ui-body", note: "14" },
  { utility: "text-reading-body", note: "16" },
  { utility: "text-page-title", note: "32" },
  { utility: "text-display-sm", note: "36" },
  { utility: "text-display-md", note: "48" },
  { utility: "text-display-lg", note: "60" },
];

export function BrandTypeSection() {
  return (
    <Section
      id="type"
      title="Type"
      lede="Three faces, split by what the text is doing."
      aside={
        <p className="hidden shrink-0 font-mono text-xs text-muted-foreground sm:block">
          Click a line to type
        </p>
      }
    >
      <ul className="rounded-lg bg-muted px-6 sm:px-10">
        {FACES.map((face) => (
          <li
            key={face.name}
            className="border-b border-border py-8 last:border-b-0 sm:py-10"
          >
            <Specimen text={face.text} className={face.className} />
            <p className="mt-5 flex flex-wrap items-baseline gap-x-4 gap-y-1 text-sm">
              <span>{face.name}</span>
              <span className="font-mono text-xs text-muted-foreground">
                {face.utility}
              </span>
              <span className="text-muted-foreground">{face.role}</span>
            </p>
          </li>
        ))}
      </ul>

      <ol className="mt-12 px-1">
        {SCALE.map((step) => (
          <li
            key={step.utility}
            className="grid gap-1 border-b border-border py-4 last:border-b-0 sm:grid-cols-[11rem_1fr] sm:items-baseline sm:gap-6"
          >
            <span className="font-mono text-xs text-muted-foreground">
              {step.utility}
              <span className="ml-3 tabular-nums">{step.note}</span>
            </span>
            {/* Clip rather than wrap, so every step is one line and the
                ladder reads as a ladder. */}
            <span className={cn(step.utility, "block truncate")}>Livepeer</span>
          </li>
        ))}
      </ol>
    </Section>
  );
}

/* ------------------------------------------------------------------ *
 * System
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
      lede="This page is the summary. The tokens, components and the full guidance are the Livepeer UI registry."
    >
      <ul className="grid gap-3 sm:grid-cols-3">
        {links.map((link) => (
          <li key={link.href}>
            <a
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex h-full flex-col justify-between gap-8 rounded-lg bg-muted p-5 transition-colors hover:bg-[color-mix(in_oklch,var(--muted),var(--foreground)_4%)]"
            >
              <ArrowUpRightIcon
                className="size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
              <span>
                <span className="block text-sm">{link.label}</span>
                <span className="mt-1 block text-sm text-muted-foreground">
                  {link.note}
                </span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </Section>
  );
}
