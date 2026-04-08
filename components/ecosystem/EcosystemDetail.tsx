import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import PageHero from "@/components/ui/PageHero";
import type { EcosystemApp } from "@/lib/ecosystem";

const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const GitHubIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const MailIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 8l9 6 9-6M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
    />
  </svg>
);

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
      className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 text-white/70 transition-colors hover:border-white/30 hover:bg-white/5 hover:text-white"
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
    const segments = new URL(url).pathname.split("/").filter(Boolean);
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
      className="group inline-flex items-center gap-1 text-xs text-white/85 transition-colors hover:text-green-light"
    >
      <span className="truncate">{children}</span>
      <ArrowUpRight className="h-2.5 w-2.5 shrink-0 text-white/30 transition-colors group-hover:text-green-light" />
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
      <span className="pt-px text-xs text-white/40">{label}</span>
      <div className="min-w-0 break-words text-xs text-white/85">
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
    <div className={isFirst ? "" : "mt-5 border-t border-white/[0.06] pt-5"}>
      <h3 className="mb-2 text-[11px] font-medium uppercase tracking-wider text-white/50">
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
  if (!value) return <span className="text-white/30">{EM_DASH}</span>;
  if (isEmail(value)) {
    return (
      <a
        href={`mailto:${value}`}
        className="text-xs text-white/85 transition-colors hover:text-green-light"
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
            className="font-mono text-xs text-white/40"
          >
            <Link
              href="/ecosystem"
              className="transition-colors hover:text-white/70"
            >
              Ecosystem
            </Link>
            <span className="mx-2 text-white/20">/</span>
            <span className="text-white/70">{app.name}</span>
          </nav>

          {/* Header */}
          <header className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.06]">
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
                <span className="text-3xl font-semibold text-white/30">
                  {app.name.charAt(0)}
                </span>
              )}
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-3">
              <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                {app.name}
              </h1>
              <p className="text-base leading-relaxed text-white/60 sm:text-lg">
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
        <div className="grid grid-cols-1 gap-12 pb-24 lg:min-h-[150vh] lg:grid-cols-[1fr_300px] lg:gap-16">
          {/* Main column */}
          <div className="min-w-0">
            <div
              className="blog-prose"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>

          {/* Sidebar */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-5">
              <MetaGroup title="Details" isFirst>
                <MetaRow label="Made by">
                  {app.madeBy ? (
                    <span>{app.madeBy}</span>
                  ) : (
                    <span className="text-white/30">{EM_DASH}</span>
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
                    <span className="text-white/30">{EM_DASH}</span>
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
            className="inline-flex items-center gap-2 font-mono text-sm text-white/30 transition-colors hover:text-white/60"
          >
            ← Back to ecosystem
          </Link>
        </div>
      </Container>
    </>
  );
}
