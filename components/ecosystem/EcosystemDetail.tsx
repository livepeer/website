import Link from "next/link";
import { ArrowUpRight, ArrowLeft } from "lucide-react";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import PageHero from "@/components/ui/PageHero";
import {
  XIcon,
  BlueskyIcon,
  GitHubIcon,
  MailIcon,
} from "@/components/icons/SocialIcons";
import type { EcosystemApp } from "@/lib/ecosystem";

function ConnectButton({
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
      className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-foreground/15 text-foreground/70 transition-colors hover:border-foreground/30 hover:bg-foreground/5 hover:text-foreground"
    >
      {children}
    </a>
  );
}

type Props = {
  app: EcosystemApp;
  html: string;
};

const EM_DASH = "—";

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

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

function ExternalLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex items-center gap-1 text-xs text-foreground/85 transition-colors hover:text-green-light"
    >
      <span className="truncate">{children}</span>
      <ArrowUpRight className="h-2.5 w-2.5 shrink-0 text-foreground/30 transition-colors group-hover:text-green-light" />
    </a>
  );
}

function MetaRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[72px_1fr] items-start gap-3 py-1.5">
      <span className="pt-px text-xs text-foreground/40">{label}</span>
      <div className="min-w-0 break-words text-xs text-foreground/85">
        {children}
      </div>
    </div>
  );
}

function MetaGroup({
  title,
  children,
  isFirst = false,
}: {
  title: string;
  children: React.ReactNode;
  isFirst?: boolean;
}) {
  return (
    <div className={isFirst ? "" : "mt-5 border-t border-foreground/[0.06] pt-5"}>
      <h3 className="mb-2 text-[11px] font-medium uppercase tracking-wider text-foreground/50">
        {title}
      </h3>
      <div>{children}</div>
    </div>
  );
}

function LinkOrDash({
  value,
  display,
  showPath = false,
}: {
  value: string | undefined;
  display?: string;
  showPath?: boolean;
}) {
  if (!value) return <span className="text-foreground/30">{EM_DASH}</span>;
  if (isEmail(value)) {
    return (
      <a
        href={`mailto:${value}`}
        className="text-xs text-foreground/85 transition-colors hover:text-green-light"
      >
        {display ?? value}
      </a>
    );
  }
  let host = display;
  if (!host) {
    try {
      const u = new URL(value);
      const cleanHost = u.hostname.replace(/^www\./, "");
      const cleanPath = u.pathname.replace(/\/$/, "");
      // Short-link hosts (Discord invites, Telegram, etc.) are unrecognizable
      // without their path, so always include it.
      const isShortLink = /^(discord\.gg|t\.me|bit\.ly|tinyurl\.com)$/i.test(
        cleanHost
      );
      host =
        showPath || isShortLink ? `${cleanHost}${cleanPath}` : cleanHost;
    } catch {
      host = value;
    }
  }
  return <ExternalLink href={value}>{host}</ExternalLink>;
}

export default function EcosystemDetail({ app, html }: Props) {
  return (
    <>
      <PageHero>
        <Container>
          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            className="font-mono text-xs text-foreground/40"
          >
            <Link
              href="/ecosystem"
              className="transition-colors hover:text-foreground/70"
            >
              Ecosystem
            </Link>
            <span className="mx-2 text-foreground/20">/</span>
            <span className="text-foreground/70">{app.name}</span>
          </nav>

          {/* Header */}
          <header className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-foreground/[0.08] bg-foreground/[0.06]">
              {app.logo ? (
                <img
                  src={`/ecosystem/${app.logo}`}
                  alt={`${app.name} logo`}
                  className="h-14 w-14 rounded-lg object-contain"
                  style={
                    app.logoBg
                      ? { backgroundColor: app.logoBg, padding: "6px" }
                      : undefined
                  }
                />
              ) : (
                <span className="text-3xl font-semibold text-foreground/30">
                  {app.name.charAt(0)}
                </span>
              )}
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-3">
              <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                {app.name}
              </h1>
              <p className="text-base leading-relaxed text-foreground/60 sm:text-lg">
                {app.description}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Button
                  href={app.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  size="md"
                >
                  Visit site
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
                {app.twitter && (
                  <ConnectButton href={app.twitter} label="X (Twitter)">
                    <XIcon className="h-4 w-4" />
                  </ConnectButton>
                )}
                {app.bluesky && (
                  <ConnectButton href={app.bluesky} label="Bluesky">
                    <BlueskyIcon className="h-4 w-4" />
                  </ConnectButton>
                )}
                {app.github && (
                  <ConnectButton href={app.github} label="GitHub">
                    <GitHubIcon className="h-4 w-4" />
                  </ConnectButton>
                )}
                {app.contact &&
                  (isEmail(app.contact) ? (
                    <ConnectButton
                      href={`mailto:${app.contact}`}
                      label="Email"
                    >
                      <MailIcon className="h-4 w-4" />
                    </ConnectButton>
                  ) : (
                    <ConnectButton href={app.contact} label="Contact">
                      <MailIcon className="h-4 w-4" />
                    </ConnectButton>
                  ))}
              </div>
            </div>
          </header>
        </Container>
      </PageHero>

      {/* Two-column body lives outside PageHero so the sidebar can use
          position: sticky — PageHero's overflow-hidden would otherwise
          break sticky positioning for any descendant. */}
      <Container>
        <div className="divider-gradient mb-16" />
        <div className="grid grid-cols-1 gap-12 pb-24 lg:grid-cols-[1fr_300px] lg:gap-16">
          {/* Main column */}
          <div className="min-w-0">
            <div
              className="blog-prose"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>

          {/* Sidebar */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-xl border border-foreground/[0.06] bg-foreground/[0.015] p-5">
              <MetaGroup title="Details" isFirst>
                <MetaRow label="Made by">
                  {app.madeBy ? (
                    <span>{app.madeBy}</span>
                  ) : (
                    <span className="text-foreground/30">{EM_DASH}</span>
                  )}
                </MetaRow>
                <MetaRow label="Categories">
                  {app.categories.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {app.categories.map((cat) => (
                        <Badge key={cat} variant="category">
                          {cat}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-foreground/30">{EM_DASH}</span>
                  )}
                </MetaRow>
                <MetaRow label="Website">
                  <LinkOrDash value={app.url} display={app.hostname} />
                </MetaRow>
              </MetaGroup>

              <MetaGroup title="Connect">
                <MetaRow label="X">
                  <LinkOrDash
                    value={app.twitter}
                    display={
                      app.twitter ? `@${handleFromUrl(app.twitter)}` : undefined
                    }
                  />
                </MetaRow>
                <MetaRow label="Bluesky">
                  <LinkOrDash
                    value={app.bluesky}
                    display={
                      app.bluesky ? `@${handleFromUrl(app.bluesky)}` : undefined
                    }
                  />
                </MetaRow>
                <MetaRow label="GitHub">
                  <LinkOrDash
                    value={app.github}
                    display={
                      app.github ? handleFromUrl(app.github) : undefined
                    }
                  />
                </MetaRow>
                <MetaRow label="Contact">
                  <LinkOrDash value={app.contact} />
                </MetaRow>
              </MetaGroup>

              <MetaGroup title="Resources">
                <MetaRow label="Docs">
                  <LinkOrDash value={app.docs} />
                </MetaRow>
                <MetaRow label="Support">
                  <LinkOrDash value={app.support} />
                </MetaRow>
              </MetaGroup>
            </div>
          </aside>
        </div>

        <div className="divider-gradient my-8" />

        <div className="flex justify-center pb-16">
          <Link
            href="/ecosystem"
            className="group inline-flex items-center gap-2 font-mono text-sm text-foreground/30 transition-colors hover:text-foreground/60"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
            Back to ecosystem
          </Link>
        </div>
      </Container>
    </>
  );
}
