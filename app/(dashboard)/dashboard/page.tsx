"use client";

import Link from "next/link";
import {
  Check,
  ArrowRight,
  ArrowUpRight,
  ChevronRight,
  Code2,
  MessageSquare,
  FileText,
  Activity,
  DollarSign,
  Gauge,
} from "lucide-react";
import { useAuth } from "@/components/dashboard/AuthContext";
import {
  MODELS,
  ACCOUNT_USAGE_SUMMARY,
  ACCOUNT_USAGE_BY_SIGNER,
  MOCK_RECENT_REQUESTS,
} from "@/lib/dashboard/mock-data";
import { getModelIcon } from "@/lib/dashboard/utils";
import { generateCardBackground } from "@/lib/dashboard/generate-card-visual";
import { useStarredModels } from "@/lib/dashboard/useStarredModels";
import DashboardFooter from "@/components/dashboard/DashboardFooter";
import ModelCard from "@/components/dashboard/ModelCard";
import type { Model, ModelCategory } from "@/lib/dashboard/types";

// ─── Mock data ───

function formatRelativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diffMs = Date.now() - then;
  const minutes = Math.round(diffMs / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return "yesterday";
  return `${days}d ago`;
}

function formatLatency(ms: number | null): string {
  if (ms == null) return "—";
  if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`;
  return `${ms}ms`;
}

const SIGNER_SWATCH: Record<"green" | "blue" | "neutral" | "violet", string> = {
  green: "bg-green-bright",
  blue: "bg-blue-bright",
  violet: "bg-purple-bright",
  neutral: "bg-white/40",
};

// ─── Welcome Card ───

function WelcomeCard({
  isConnected,
  user,
}: {
  isConnected: boolean;
  user: { name: string } | null;
}) {
  if (isConnected && user) {
    const firstName = user.name.split(" ")[0];
    // TODO(onboarding): wire to real user state once hasFirstRequest + hasSigner signals exist.
    const completedNonOptional = 2; // Create account + default API key (both auto-done on signup)
    const totalNonOptional = 3;
    const remaining = totalNonOptional - completedNonOptional;
    const progressPct = (completedNonOptional / totalNonOptional) * 100;
    // SVG progress ring math
    const ringRadius = 18;
    const ringCircumference = 2 * Math.PI * ringRadius;
    const ringDashOffset =
      ringCircumference - (progressPct / 100) * ringCircumference;

    return (
      <div className="relative overflow-hidden rounded-2xl bg-dark-card ring-1 ring-white/[0.08]">
        {/* Decorative radial highlight */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at top right, rgba(64, 191, 134, 0.1), transparent 60%)",
          }}
          aria-hidden="true"
        />

        <div className="relative p-5 sm:p-6">
          {/* Heading row: progress ring + greeting + subtitle */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative h-11 w-11 shrink-0">
              <svg
                viewBox="0 0 44 44"
                className="h-11 w-11 -rotate-90"
                aria-hidden="true"
              >
                <circle
                  cx="22"
                  cy="22"
                  r={ringRadius}
                  fill="none"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="3"
                />
                <circle
                  cx="22"
                  cy="22"
                  r={ringRadius}
                  fill="none"
                  stroke="var(--color-green-bright)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={ringCircumference}
                  strokeDashoffset={ringDashOffset}
                  className="transition-[stroke-dashoffset] duration-500"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center font-mono text-[10px] font-medium text-white/60">
                {completedNonOptional}/{totalNonOptional}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
                Welcome back, {firstName}.
              </h1>
              <p className="mt-1 text-sm text-white/70">
                {remaining > 0
                  ? `You're ${remaining} ${remaining === 1 ? "step" : "steps"} away from your first inference.`
                  : "You're set up. Time to build."}
              </p>
            </div>
          </div>

          {/* Checklist — each row is a clickable todo, no ghost buttons */}
          <ul className="mt-4 space-y-1 sm:mt-6">
            {/* Step 1 — complete (non-interactive, matches two-line rhythm) */}
            <li className="-mx-3 flex items-center gap-3 rounded-lg px-3 py-2.5 opacity-60">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green/20">
                <Check className="h-3 w-3 text-green-bright" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white/60 line-through">
                  Create account
                </p>
                <p className="mt-0.5 text-xs text-white/55">
                  Welcome to the Livepeer Developer Dashboard.
                </p>
              </div>
              <span className="hidden shrink-0 text-[10px] font-medium uppercase tracking-wider text-white/55 sm:inline">
                Done
              </span>
            </li>

            {/* Step 2 — API key (auto-completed on signup) */}
            <li className="-mx-3 flex items-center gap-3 rounded-lg px-3 py-2.5 opacity-60">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green/20">
                <Check className="h-3 w-3 text-green-bright" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white/60 line-through">
                  API key ready
                </p>
                <p className="mt-0.5 text-xs text-white/55">
                  Your default key is active. 10,000 free requests per month.
                </p>
              </div>
              <span className="hidden shrink-0 text-[10px] font-medium uppercase tracking-wider text-white/55 sm:inline">
                Done
              </span>
            </li>

            {/* Step 3 — first inference */}
            <li>
              <Link
                href="/dashboard/explore"
                className="group -mx-3 flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-white/[0.04]"
              >
                <span className="h-5 w-5 shrink-0 rounded-full border border-white/20 transition-colors group-hover:border-green-bright/40" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white">
                    Make your first inference
                  </p>
                  <p className="mt-0.5 text-xs text-white/65">
                    Pick a capability and run it — takes about 60 seconds.
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-white/30 transition-colors group-hover:text-green-bright" />
              </Link>
            </li>

            {/* Optional item, visually separated */}
            <li className="!mt-2 border-t border-white/[0.06] pt-2 sm:!mt-3 sm:pt-3">
              <Link
                href="/dashboard/settings?tab=billing"
                className="group -mx-3 flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-white/[0.04]"
              >
                <span className="h-5 w-5 shrink-0 rounded-full border border-dashed border-white/20 transition-colors group-hover:border-green-bright/40" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-white">
                      Connect a payment provider
                    </p>
                    <span className="inline-flex rounded-full bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white/65">
                      Optional
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-white/65">
                    Go beyond 10,000 requests. Connect a wallet or card to keep running at production volume.
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-white/30 transition-colors group-hover:text-green-bright" />
              </Link>
            </li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-dark-card to-dark p-8 shadow-xl">
      <p className="mb-3 text-xs font-medium uppercase tracking-wider text-green-bright">
        Livepeer Developer Dashboard
      </p>
      <h1 className="text-3xl font-bold text-white sm:text-4xl">
        The open network for GPU-powered video.
      </h1>
      <p className="mt-3 max-w-2xl text-white/60">
        Specialized infrastructure for real-time video inference. Community-operated,
        permissionless, and built for the edges where centralized platforms fall short.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/dashboard/explore"
          className="rounded-full bg-green-bright px-5 py-2.5 text-sm font-medium text-dark transition-colors hover:bg-green"
        >
          Explore capabilities
        </Link>
        <a
          href="https://discord.gg/livepeer"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-white/20 px-5 py-2.5 text-sm text-white/70 transition-colors hover:bg-white/[0.06]"
        >
          Build with us →
        </a>
      </div>
    </div>
  );
}

// ─── Featured Capabilities ───

function FeaturedCapabilities() {
  const featured = MODELS.filter((m) => m.featured).slice(0, 4);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-white">
          Featured capabilities
        </h2>
        <Link
          href="/dashboard/explore"
          className="text-xs text-white/60 transition-colors hover:text-white"
        >
          View all →
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
        {featured.map((model) => (
          <ModelCard key={model.id} model={model} />
        ))}
      </div>
    </div>
  );
}

// ─── Starred Capabilities (auth-gated, conditional) ───

function StarredCapabilities() {
  const { starredIds } = useStarredModels();
  if (starredIds.length === 0) return null;

  const byId = new Map(MODELS.map((m) => [m.id, m]));
  const starred = starredIds
    .map((id) => byId.get(id))
    .filter((m): m is (typeof MODELS)[number] => Boolean(m))
    .slice(0, 4);

  if (starred.length === 0) return null;

  const hasMore = starredIds.length > starred.length;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-white">Your starred capabilities</h2>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[11px] text-white/40">
            {starredIds.length} starred
          </span>
          {hasMore && (
            <Link
              href="/dashboard/explore?starred=1"
              className="text-xs text-white/60 transition-colors hover:text-white"
            >
              View all →
            </Link>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
        {starred.map((model) => (
          <ModelCard key={model.id} model={model} hideNewBadge />
        ))}
      </div>
    </div>
  );
}

// ─── Suggested Capabilities (right rail, logged-in) ───

function SuggestedCapabilitiesList() {
  const { starredIds } = useStarredModels();
  const byId = new Map(MODELS.map((m) => [m.id, m]));
  const starredModels = starredIds
    .map((id) => byId.get(id))
    .filter((m): m is Model => Boolean(m));
  const featuredModels = MODELS.filter((m) => m.featured);
  const seen = new Set<string>();
  const suggested = [...starredModels, ...featuredModels]
    .filter((m) => {
      if (seen.has(m.id)) return false;
      seen.add(m.id);
      return true;
    })
    .slice(0, 5);

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-white">
          Suggested capabilities
        </h2>
        <Link
          href="/dashboard/explore"
          className="text-xs text-white/60 transition-colors hover:text-white"
        >
          View all →
        </Link>
      </div>

      <div className="flex flex-col rounded-2xl border border-white/[0.08] bg-dark-surface">
      <ul className="flex flex-col px-2 py-2">
        {suggested.map((model) => {
          const Icon = getModelIcon(model.category);
          return (
            <li key={model.id}>
              <Link
                href={`/dashboard/models/${model.id}`}
                className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-white/[0.04]"
              >
                <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg">
                  {model.coverImage ? (
                    <img
                      src={model.coverImage}
                      alt=""
                      className="block h-full w-full object-cover"
                    />
                  ) : (
                    <div
                      className="flex h-full w-full items-center justify-center"
                      style={{ background: generateCardBackground(model.id) }}
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.08] ring-1 ring-white/[0.1] backdrop-blur-sm">
                        <Icon
                          className="h-4 w-4 text-white/80"
                          strokeWidth={2}
                          aria-hidden="true"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="font-mono text-[11px] uppercase tracking-wider text-white/45">
                    {model.provider.toLowerCase().replace(/\s+/g, "-")}
                  </p>
                  <p className="truncate text-[14px] font-medium text-white transition-colors group-hover:text-green-bright">
                    {model.name}
                  </p>
                  <p className="line-clamp-1 text-[12px] text-white/55">
                    {model.description}
                  </p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>

      <footer className="mt-auto border-t border-white/[0.06] px-5 py-4">
        <Link
          href="/dashboard/explore"
          className="inline-flex items-center gap-1.5 text-[13px] text-white/70 transition-colors hover:text-green-bright"
        >
          Looking for more? Browse all capabilities
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
        </Link>
      </footer>
      </div>
    </section>
  );
}

// ─── Browse by Category ───

const HOME_CATEGORIES: {
  label: ModelCategory;
  subtitle: string;
}[] = [
  { label: "Video Generation", subtitle: "Generate video" },
  { label: "Video Editing", subtitle: "Edit footage" },
  { label: "Video Understanding", subtitle: "Understand video" },
  { label: "Live Transcoding", subtitle: "Transcode live" },
  { label: "Image Generation", subtitle: "Generate images" },
  { label: "Speech", subtitle: "Transcribe & synthesize" },
  { label: "Language", subtitle: "Run LLMs" },
];

function BrowseByCategory() {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-white">
          Browse by category
        </h2>
        <Link
          href="/dashboard/explore"
          className="text-xs text-white/60 transition-colors hover:text-white"
        >
          View all →
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {HOME_CATEGORIES.map(({ label, subtitle }, i) => {
          const Icon = getModelIcon(label);
          const isLastOdd =
            i === HOME_CATEGORIES.length - 1 &&
            HOME_CATEGORIES.length % 2 === 1;
          return (
            <Link
              key={label}
              href={`/dashboard/explore?category=${encodeURIComponent(label)}`}
              className={`group flex flex-col rounded-xl bg-dark-surface/60 p-4 transition-colors hover:bg-dark-card ${
                isLastOdd ? "col-span-2 sm:col-span-1" : ""
              }`}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-bright/10">
                <Icon className="h-4 w-4 text-green-bright" />
              </div>
              <p className="mt-3 text-sm font-medium text-white transition-colors group-hover:text-green-bright">
                {label}
              </p>
              <p className="mt-0.5 text-xs text-white/60">{subtitle}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// ─── Getting Started Strip ───

function GettingStartedStrip() {
  const cards = [
    {
      icon: FileText,
      title: "Documentation",
      description: "Guides and concepts for building on the network.",
      href: "https://docs.livepeer.org",
      external: true,
    },
    {
      icon: Code2,
      title: "API reference",
      description: "REST and streaming endpoints with full schemas.",
      href: "https://docs.livepeer.org/api-reference",
      external: true,
    },
    {
      icon: MessageSquare,
      title: "Community",
      description: "Get help from orchestrators and builders in Discord.",
      href: "https://discord.gg/livepeer",
      external: true,
    },
  ];

  return (
    <div>
      <h2 className="mb-4 text-base font-semibold text-white">Get started</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ icon: Icon, title, description, href, external }) => {
          const Wrapper = external ? "a" : Link;
          const extraProps = external
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {};
          return (
            <Wrapper
              key={title}
              href={href}
              {...(extraProps as Record<string, string>)}
              className="group flex items-start gap-3 rounded-xl bg-dark-surface/60 p-4 transition-colors hover:bg-dark-card"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-bright/10 text-green-bright">
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-medium text-white">{title}</p>
                  {external && (
                    <ArrowUpRight className="h-3 w-3 shrink-0 text-white/30 transition-colors group-hover:text-white/60" />
                  )}
                </div>
                <p className="mt-0.5 text-xs leading-relaxed text-white/50">
                  {description}
                </p>
              </div>
            </Wrapper>
          );
        })}
      </div>
    </div>
  );
}

// ─── Recent Requests (auth-gated) ───

function RecentRequests() {
  const rows = MOCK_RECENT_REQUESTS.slice(0, 5);
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-white">Recent requests</h2>
        <Link
          href="/dashboard/settings?tab=usage"
          className="text-xs text-white/60 transition-colors hover:text-white"
        >
          View all →
        </Link>
      </div>
      <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-dark-surface">
        {rows.map((row) => {
          const isSuccess = row.status === "success";
          return (
            <Link
              key={row.id}
              href={`/dashboard/settings?tab=usage&request=${row.id}`}
              className="group flex flex-col gap-2 border-b border-white/[0.06] px-4 py-3 transition-colors last:border-0 hover:bg-white/[0.02] sm:flex-row sm:items-center sm:justify-between sm:gap-3"
            >
              <span className="truncate font-mono text-sm text-white">
                {row.model}
              </span>
              <div className="flex shrink-0 items-center gap-3 sm:gap-4">
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-center text-xs sm:w-[68px] ${
                    isSuccess
                      ? "bg-green/15 text-green-bright"
                      : "bg-white/[0.06] text-white/50"
                  }`}
                >
                  {row.status}
                </span>
                <span className="shrink-0 font-mono text-xs tabular-nums text-white/70 sm:w-12 sm:text-right">
                  {formatLatency(row.latencyMs)}
                </span>
                <span className="hidden w-32 truncate text-[11px] text-white/55 sm:inline">
                  via {row.signerLabel}
                </span>
                <span className="ml-auto text-xs tabular-nums text-white/55 sm:ml-0 sm:w-16 sm:text-right">
                  {formatRelativeTime(row.timestamp)}
                </span>
                <ChevronRight
                  className="hidden h-4 w-4 shrink-0 text-white/30 opacity-0 transition-opacity group-hover:opacity-100 sm:block"
                  aria-hidden
                />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// ─── Usage Overview (auth-gated) ───

function UsageOverview() {
  const freePct = Math.min(
    100,
    Math.round(
      (ACCOUNT_USAGE_SUMMARY.freeTierUsed / ACCOUNT_USAGE_SUMMARY.freeTierLimit) *
        100,
    ),
  );
  const activeSigners = ACCOUNT_USAGE_BY_SIGNER.filter(
    (s) => s.signer !== "freeTier",
  ).length;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-white">
          Your usage this period
        </h2>
        <Link
          href="/dashboard/settings?tab=usage"
          className="text-xs text-white/60 transition-colors hover:text-white"
        >
          View all →
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-5 rounded-2xl border border-white/[0.08] bg-dark-surface p-6 lg:grid-cols-5">
        {/* Free-tier gauge (left, 3 cols) */}
        <div className="lg:col-span-3 lg:border-r lg:border-white/[0.06] lg:pr-6">
          <p className="text-[11px] font-medium uppercase tracking-wider text-white/40">
            Free tier
          </p>
          <p className="mt-2 font-mono text-3xl font-semibold text-white">
            {ACCOUNT_USAGE_SUMMARY.freeTierUsed.toLocaleString()}
            <span className="ml-1 text-base font-normal text-white/55">
              / {ACCOUNT_USAGE_SUMMARY.freeTierLimit.toLocaleString()} requests
            </span>
          </p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full bg-green-bright transition-all"
              style={{ width: `${freePct}%` }}
            />
          </div>
          <p className="mt-2 text-[11px] text-white/60">
            {freePct}% used · resets in {ACCOUNT_USAGE_SUMMARY.freeTierResetIn}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/70">
            <span className="inline-flex items-center gap-1.5">
              <Activity className="h-3 w-3 text-white/50" aria-hidden="true" />
              <span className="font-mono text-white">
                {ACCOUNT_USAGE_SUMMARY.requests.toLocaleString()}
              </span>
              requests
            </span>
            <span className="text-white/30" aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1.5">
              <DollarSign className="h-3 w-3 text-white/50" aria-hidden="true" />
              <span className="font-mono text-white">
                {ACCOUNT_USAGE_SUMMARY.spendDisplay}
              </span>
              spent
            </span>
            <span className="text-white/30" aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1.5">
              <Gauge className="h-3 w-3 text-white/50" aria-hidden="true" />
              <span className="font-mono text-white">{activeSigners}</span>
              providers
            </span>
          </div>
        </div>

        {/* Signer routing (right, 2 cols) */}
        <div className="lg:col-span-2">
          <p className="text-[11px] font-medium uppercase tracking-wider text-white/40">
            Request routing
          </p>
          <div className="mt-3 space-y-2">
            {ACCOUNT_USAGE_BY_SIGNER.map((row) => (
              <div
                key={row.signer}
                className="flex items-center justify-between gap-3"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span
                    className={`h-1.5 w-1.5 shrink-0 rounded-full ${SIGNER_SWATCH[row.color]}`}
                    aria-hidden="true"
                  />
                  <span className="truncate text-xs text-white/70">
                    {row.label}
                  </span>
                </span>
                <span className="shrink-0 font-mono text-[11px] text-white/50">
                  {row.requests.toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          {/* Segmented percentage bar */}
          <div
            className="mt-4 flex h-1.5 overflow-hidden rounded-full bg-white/[0.04]"
            role="img"
            aria-label="Request routing breakdown"
          >
            {ACCOUNT_USAGE_BY_SIGNER.map((row) => (
              <div
                key={row.signer}
                className={SIGNER_SWATCH[row.color]}
                style={{ width: `${row.percent}%` }}
                title={`${row.label}: ${row.percent}%`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Home Page ───

export default function HomePage() {
  const { isConnected, isLoading, user } = useAuth();

  if (isLoading) return null;

  return (
    <main id="main-content" className="flex flex-1 flex-col bg-dark">
      <div className="mx-auto max-w-6xl flex-1 px-5 pt-6 pb-12 space-y-8 lg:px-6 lg:pt-10 lg:pb-16 lg:space-y-12">
        {isConnected ? (
          <>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)]">
              <div className="space-y-6">
                <WelcomeCard isConnected={isConnected} user={user} />
                <UsageOverview />
              </div>
              <SuggestedCapabilitiesList />
            </div>
            <RecentRequests />
            <StarredCapabilities />
          </>
        ) : (
          <>
            <WelcomeCard isConnected={isConnected} user={user} />
            <FeaturedCapabilities />
          </>
        )}
        <BrowseByCategory />
        <GettingStartedStrip />
      </div>
      <DashboardFooter />
    </main>
  );
}
