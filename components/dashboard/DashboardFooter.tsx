import Link from "next/link";
import { EXTERNAL_LINKS } from "@/lib/constants";

const MOCK_STATUS = {
  healthy: true,
  orchestrators: 47,
  gpus: 312,
  callsPerMin: "2.4k",
};

const devLinks = [
  { label: "Docs", href: "https://docs.livepeer.org", external: true },
  { label: "Changelog", href: "https://docs.livepeer.org/changelog", external: true },
  { label: "Discord", href: EXTERNAL_LINKS.discord, external: true },
];

const legalLinks = [
  { label: "Terms", href: "https://livepeer.org/terms", external: true },
  { label: "Privacy", href: "https://livepeer.org/privacy", external: true },
];

const COPYRIGHT = "© 2026 Livepeer Foundation";

// ─── Shared: network status with pulsing dot + optional text ───

function NetworkStatus({ variant }: { variant: "mobile" | "desktop" }) {
  const label = MOCK_STATUS.healthy ? "All services online" : "Service disruption";
  const isDesktop = variant === "desktop";
  return (
    <Link
      href="/dashboard/stats"
      aria-label={`Network status: ${label.toLowerCase()}`}
      className={
        isDesktop
          ? "flex shrink-0 items-center gap-2 rounded-md px-2 py-1 transition-colors hover:bg-white/[0.06] hover:text-white"
          : "flex shrink-0 items-center gap-2"
      }
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-bright opacity-50" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-green-bright" />
      </span>
      {isDesktop ? (
        <span className="text-[13px] text-white/60">{label}</span>
      ) : (
        <span className="font-mono text-[11px] font-medium uppercase tracking-wider text-green-bright">
          Live
        </span>
      )}
    </Link>
  );
}

// ─── Desktop hover tooltip ───

function DesktopStatusTooltip() {
  return (
    <div className="absolute bottom-full left-0 pb-2 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-150 z-50">
      <div className="w-52 rounded-lg border border-white/[0.08] bg-dark-card/95 backdrop-blur-xl shadow-xl p-3.5">
        <div className="flex items-center gap-2 text-[11px] font-medium text-white/70">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-bright opacity-50" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-bright" />
          </span>
          Network {MOCK_STATUS.healthy ? "Healthy" : "Disrupted"}
        </div>
        <div className="my-2.5 border-t border-white/[0.08]" />
        <div className="space-y-2 text-[11px]">
          <div className="flex justify-between text-white/50">
            <span>Orchestrators</span>
            <span className="font-mono text-white/70">{MOCK_STATUS.orchestrators}</span>
          </div>
          <div className="flex justify-between text-white/50">
            <span>GPUs active</span>
            <span className="font-mono text-white/70">{MOCK_STATUS.gpus}</span>
          </div>
          <div className="flex justify-between text-white/50">
            <span>Requests/min</span>
            <span className="font-mono text-white/70">{MOCK_STATUS.callsPerMin}</span>
          </div>
        </div>
        <div className="my-2.5 border-t border-white/[0.08]" />
        <Link
          href="/dashboard/stats"
          className="text-[10px] text-white/60 transition-colors hover:text-white/60 pointer-events-auto"
        >
          View full stats →
        </Link>
      </div>
    </div>
  );
}

// ─── Shared: legal links with `/` separator ───

function LegalLinks({ className }: { className?: string }) {
  return (
    <span className={`flex items-center ${className ?? ""}`}>
      {legalLinks.map((link, i) => (
        <span key={link.label} className="flex items-center">
          <a
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-white"
          >
            {link.label}
          </a>
          {i < legalLinks.length - 1 && (
            <span className="mx-2 select-none text-white/30" aria-hidden="true">
              /
            </span>
          )}
        </span>
      ))}
    </span>
  );
}

// ─── Main ───

export default function DashboardFooter() {
  return (
    <footer className="relative mt-12 border-t border-white/[0.08] bg-shell lg:mt-16">
      <div className="divider-gradient absolute top-0 left-0 right-0" />

      {/* ─── Desktop: single row, left = status, right = dev | legal | copyright ─── */}
      <div className="hidden lg:flex items-center justify-between gap-6 px-6 py-3.5">
        <div className="group relative">
          <NetworkStatus variant="desktop" />
          <DesktopStatusTooltip />
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          {devLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[13px] text-white/60 transition-colors hover:text-white"
            >
              {link.label}
            </a>
          ))}

          <span className="h-3 w-px bg-white/10" aria-hidden="true" />

          <LegalLinks className="text-[13px] text-white/40" />

          <span className="h-3 w-px bg-white/10" aria-hidden="true" />

          <span className="text-[13px] text-white/40">{COPYRIGHT}</span>
        </div>
      </div>

      {/* ─── Mobile + tablet: two rows, each justify-between, edge-anchored ─── */}
      <div className="flex flex-col gap-3 px-4 py-4 lg:hidden">
        {/* Row 1: status dot left, dev links right */}
        <div className="flex items-center justify-between gap-3">
          <NetworkStatus variant="mobile" />
          <div className="flex items-center text-[13px] text-white/70">
            {devLinks.map((link, i) => (
              <span key={link.label} className="flex items-center">
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-white"
                >
                  {link.label}
                </a>
                {i < devLinks.length - 1 && (
                  <span className="mx-2 select-none text-white/30" aria-hidden="true">
                    ·
                  </span>
                )}
              </span>
            ))}
          </div>
        </div>

        {/* Row 2: legal left, copyright right */}
        <div className="flex items-center justify-between gap-3 text-[12px] text-white/40">
          <LegalLinks />
          <span className="truncate">{COPYRIGHT}</span>
        </div>
      </div>
    </footer>
  );
}
