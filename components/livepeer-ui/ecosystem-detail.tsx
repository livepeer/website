import Image from "next/image";
import Link from "next/link";
import { ArrowLeftIcon, ArrowUpRightIcon } from "lucide-react";

import {
  BlueskyIcon,
  GitHubIcon,
  MailIcon,
  XIcon,
} from "@/components/icons/SocialIcons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { EcosystemApp } from "@/lib/ecosystem";

const EM_DASH = "—";

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/** "@handle" from a profile URL, or the raw value if it can't be parsed. */
function handleFromUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const segments = parsed.pathname.split("/").filter(Boolean);
    if (parsed.hostname.endsWith("bsky.app") && segments[0] === "profile") {
      return segments[1] ?? url;
    }
    return segments[0] ?? url;
  } catch {
    return url;
  }
}

function IconLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="inline-flex size-12 items-center justify-center rounded-sm border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      {children}
    </a>
  );
}

/**
 * One row of the metadata rail. Missing values render an em dash rather than
 * disappearing — the catalogue is contributor markdown, so an absent field is
 * information ("no docs published"), and dropping the row would make two apps
 * with different completeness look identical.
 */
function MetaRow({
  label,
  value,
  display,
}: {
  label: string;
  value?: string;
  display?: string;
}) {
  let body: React.ReactNode;

  if (!value) {
    body = <span className="text-muted-foreground/50">{EM_DASH}</span>;
  } else if (isEmail(value)) {
    body = (
      <a
        href={`mailto:${value}`}
        className="text-foreground underline underline-offset-4 transition-opacity hover:opacity-60"
      >
        {display ?? value}
      </a>
    );
  } else {
    let text = display;
    if (!text) {
      try {
        const parsed = new URL(value);
        const host = parsed.hostname.replace(/^www\./, "");
        const path = parsed.pathname.replace(/\/$/, "");
        // Short-link hosts are unrecognisable without their path.
        const isShortLink = /^(discord\.gg|t\.me|bit\.ly|tinyurl\.com)$/i.test(
          host
        );
        text = isShortLink ? `${host}${path}` : host;
      } catch {
        text = value;
      }
    }
    body = (
      <a
        href={value}
        target="_blank"
        rel="noopener noreferrer"
        className="text-foreground underline underline-offset-4 transition-opacity hover:opacity-60"
      >
        {text}
      </a>
    );
  }

  // Stacked, not label-left/value-right. In a 288px rail a justified row
  // leaves a gulf between the two and forces the value to truncate — which
  // hides exactly the part worth reading. Stacking gives the value the full
  // width and lets the label recede to a caption.
  return (
    <div className="border-b border-border py-3 last:border-b-0">
      <dt className="text-ui-caption text-muted-foreground">{label}</dt>
      <dd className="mt-1 truncate text-sm">{body}</dd>
    </div>
  );
}

/**
 * A titled block in the metadata rail.
 *
 * Renders nothing when every row inside it is empty, so an app that published
 * no docs and no support link doesn't get a "Resources" heading over two em
 * dashes. Individual dashes stay — within a group that has content, an absent
 * field is worth seeing.
 */
function MetaGroup({
  title,
  rows,
}: {
  title: string;
  rows: { label: string; value?: string; display?: string }[];
}) {
  if (rows.every((row) => !row.value)) return null;
  return (
    <section className="mt-8 first:mt-0">
      <h2 className="font-mono text-ui-caption tracking-wide text-muted-foreground uppercase">
        {title}
      </h2>
      <dl className="mt-3">
        {rows.map((row) => (
          <MetaRow key={row.label} {...row} />
        ))}
      </dl>
    </section>
  );
}

/**
 * An ecosystem app's detail page.
 *
 * There is no mockup for this view — the mockup's cards link straight out to
 * the app — so it is composed from design.md and the listing's own language:
 * the same logo tile, mono identifiers, hairline rules, and secondary-surface
 * badges, at the larger scale a full page allows.
 */
export function EcosystemDetail({
  app,
  html,
}: {
  app: EcosystemApp;
  html: string;
}) {
  const socials = [
    app.twitter && {
      href: app.twitter,
      label: "X (Twitter)",
      icon: <XIcon className="size-4" />,
    },
    app.bluesky && {
      href: app.bluesky,
      label: "Bluesky",
      icon: <BlueskyIcon className="size-4" />,
    },
    app.github && {
      href: app.github,
      label: "GitHub",
      icon: <GitHubIcon className="size-4" />,
    },
    app.contact && {
      href: isEmail(app.contact) ? `mailto:${app.contact}` : app.contact,
      label: isEmail(app.contact) ? "Email" : "Contact",
      icon: <MailIcon className="size-4" />,
    },
  ].filter(Boolean) as { href: string; label: string; icon: React.ReactNode }[];

  return (
    // max-w-5xl, not the site's max-w-page. The catalogue index is a card grid
    // and earns the full measure; an entry is an article with a rail, and at
    // 1408 the two columns used 896px and left a 432px channel down the middle
    // — a third of the band, empty. Narrowing the container closes it to a
    // gutter that binds the columns instead of separating them.
    <div className="mx-auto w-full max-w-5xl px-4 pt-16 pb-24 sm:px-6 lg:px-10">
      <nav
        aria-label="Breadcrumb"
        className="font-mono text-xs text-muted-foreground"
      >
        <Link
          href="/ecosystem"
          className="transition-colors hover:text-foreground"
        >
          Ecosystem
        </Link>
        <span className="mx-2 opacity-50">/</span>
        <span className="text-foreground">{app.name}</span>
      </nav>

      <header className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
        {/* Same tile treatment as the listing card, one size up — the mark is
            contained rather than cropped, on the submitter's own background.

            bg-secondary rather than muted: at 0.16 the tile barely separated
            from black, and on the listing this same tile sits inside a card
            whose hover surface is bg-card (0.205) — anything at or below that
            disappears the moment you hover. 0.269 stays a step clear in every
            state. Submitter-supplied logoBg still overrides it. */}
        {app.logo ? (
          <span
            className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-sm bg-secondary"
            style={app.logoBg ? { backgroundColor: app.logoBg } : undefined}
          >
            <Image
              src={`/ecosystem/${app.logo}`}
              alt=""
              width={56}
              height={56}
              className="size-14 object-contain"
            />
          </span>
        ) : (
          <span
            aria-hidden="true"
            className="flex size-20 shrink-0 items-center justify-center rounded-sm bg-secondary text-2xl font-medium text-muted-foreground"
          >
            {app.name.charAt(0)}
          </span>
        )}

        <div className="flex min-w-0 flex-1 flex-col items-start">
          {/* page-title, not display-md. This is one entry in a catalogue whose
              own title runs at display-fluid — an app name set larger than it
              needs to be competes with the page it belongs to. */}
          <h1 className="text-page-title text-balance sm:text-display-sm">
            {app.name}
          </h1>
          <p className="mt-3 font-mono text-xs text-muted-foreground">
            {app.hostname}
          </p>
          <p className="mt-6 max-w-[46ch] text-reading-body text-pretty text-muted-foreground">
            {app.description}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-2">
            <Button
              size="lg"
              nativeButton={false}
              render={
                <a href={app.url} target="_blank" rel="noopener noreferrer" />
              }
              className="h-12 rounded-sm px-5"
            >
              Visit site
              <ArrowUpRightIcon className="size-4" aria-hidden="true" />
            </Button>
            {socials.map((social) => (
              <IconLink
                key={social.label}
                href={social.href}
                label={social.label}
              >
                {social.icon}
              </IconLink>
            ))}
          </div>
        </div>
      </header>

      {/* The prose column is capped at a reading measure rather than filling
          its track — unconstrained it ran 114 characters per line here, and no
          amount of spacing elsewhere compensates for a line you lose your place
          in. 38rem lands near 70. Set in rem rather than ch because Tailwind's
          ch measures the `0` glyph, which is narrower than Inter's average and
          overshot by a dozen characters.

          justify-between still collects the slack between the columns rather
          than after them, but with the container narrowed there is little left
          to collect — which is the point. */}
      <div className="mt-14 grid gap-10 border-t border-border pt-10 lg:grid-cols-[minmax(0,38rem)_16rem] lg:justify-between lg:gap-16">
        {/* reading-prose renders the contributor markdown on registry tokens —
            see globals.css. The legacy .blog-prose reads the quarantined
            --color-* layer and sets 700-weight headings. */}
        <div
          className="reading-prose min-w-0"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        {/* Sticky so the metadata stays reachable through a long write-up. */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <MetaGroup
            title="Details"
            rows={[
              { label: "Made by", value: app.madeBy, display: app.madeBy },
              { label: "Website", value: app.url, display: app.hostname },
            ]}
          />

          <section className="mt-8">
            <h2 className="font-mono text-ui-caption tracking-wide text-muted-foreground uppercase">
              Categories
            </h2>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {app.categories.map((category) => (
                <Badge
                  key={category}
                  variant="secondary"
                  className="rounded-sm font-mono text-[0.6875rem] font-normal uppercase"
                >
                  {category}
                </Badge>
              ))}
            </div>
          </section>

          <MetaGroup
            title="Connect"
            rows={[
              {
                label: "X",
                value: app.twitter,
                display: app.twitter
                  ? `@${handleFromUrl(app.twitter)}`
                  : undefined,
              },
              {
                label: "Bluesky",
                value: app.bluesky,
                display: app.bluesky
                  ? `@${handleFromUrl(app.bluesky)}`
                  : undefined,
              },
              {
                label: "GitHub",
                value: app.github,
                display: app.github ? handleFromUrl(app.github) : undefined,
              },
              { label: "Contact", value: app.contact },
            ]}
          />

          <MetaGroup
            title="Resources"
            rows={[
              { label: "Docs", value: app.docs },
              { label: "Support", value: app.support },
            ]}
          />
        </aside>
      </div>

      <div className="mt-14 border-t border-border pt-8">
        <Link
          href="/ecosystem"
          className="group inline-flex items-center gap-2 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeftIcon
            className="size-3.5 transition-transform group-hover:-translate-x-0.5"
            aria-hidden="true"
          />
          Back to ecosystem
        </Link>
      </div>
    </div>
  );
}
