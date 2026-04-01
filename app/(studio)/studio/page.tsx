"use client";

import { Suspense, useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Search,
  LayoutGrid,
  List,
  Flame,
  Snowflake,
  X,
  ChevronDown,
  ArrowDown,
  ArrowUp,
  Check,
  Cpu,
  Shield,
  Plus,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import StudioHeader from "@/components/studio/StudioHeader";
import StatisticsTab from "@/components/studio/statistics/StatisticsTab";
import { MODELS, SOLUTIONS } from "@/lib/studio/mock-data";
import { getModelIcon, formatRuns, formatPrice, getCategoryGradient } from "@/lib/studio/utils";
import type { Model, ModelCategory } from "@/lib/studio/types";

// ─── Constants ───

type CatalogMode = "all" | "managed" | "network";

const CATEGORIES: { label: ModelCategory; icon: ReturnType<typeof getModelIcon> }[] = [
  { label: "LLM", icon: getModelIcon("LLM") },
  { label: "Image Generation", icon: getModelIcon("Image Generation") },
  { label: "Video", icon: getModelIcon("Video") },
  { label: "Speech", icon: getModelIcon("Speech") },
  { label: "Object Detection", icon: getModelIcon("Object Detection") },
  { label: "Embeddings", icon: getModelIcon("Embeddings") },
];

const SORT_OPTIONS = [
  { value: "popularity", label: "Popularity" },
  { value: "latency", label: "Latency" },
  { value: "price", label: "Price" },
];

// ─── Home Tab ───

function HomeTab({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const featured = MODELS.filter((m) => m.featured || m.managed).slice(0, 4);

  return (
    <div className="flex-1">
      <div className="mx-auto max-w-5xl px-5 py-10">
        {/* Hero */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Run AI on the Livepeer GPU network
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-base text-white/60">
            Explore models, try them in the playground, get an API key from a
            provider, and start building real-time AI applications.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={() => onNavigate("explore")}
              className="rounded-lg bg-green px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-light"
            >
              Explore Models
            </button>
            <Link
              href="/studio/quickstart"
              className="rounded-lg border border-white/[0.08] px-5 py-2.5 text-sm text-white/50 transition-colors hover:bg-white/[0.04]"
            >
              Get Started Guide
            </Link>
          </div>
        </div>

        {/* Featured models */}
        <div className="mt-14">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white/70">
              Featured Models
            </h2>
            <button
              onClick={() => onNavigate("explore")}
              className="text-xs text-green-bright hover:underline"
            >
              View all →
            </button>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((model) => {
              const Icon = getModelIcon(model.category);
              return (
                <Link
                  key={model.id}
                  href={`/studio/models/${model.id}`}
                  className="group flex flex-col rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 transition-all hover:bg-white/[0.04] hover:border-white/10"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                        model.managed ? "bg-blue/10" : "bg-white/[0.06]"
                      }`}
                    >
                      {model.managed ? (
                        <Shield className="h-4 w-4 text-blue-bright/60" />
                      ) : (
                        <Icon className="h-4 w-4 text-white/50" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate group-hover:text-green-bright transition-colors">
                        {model.name}
                      </p>
                      <p className="text-[11px] text-white/50">
                        {model.provider}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[11px] text-white/50">
                    <span>{formatRuns(model.runs7d)} runs</span>
                    <span className="font-mono">{formatPrice(model)}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Quick stats */}
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Models", value: `${MODELS.length}` },
            { label: "Orchestrators", value: "142" },
            { label: "Avg Latency", value: "34ms" },
            { label: "Uptime", value: "99.97%" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-center"
            >
              <p className="font-mono text-xl font-semibold text-white">
                {stat.value}
              </p>
              <p className="mt-1 text-[11px] text-white/50">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Badges ───

function StatusBadge({ status }: { status: "hot" | "cold" }) {
  if (status === "hot") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-bright/10 px-2 py-0.5 text-[10px] font-medium text-green-bright">
        <span className="h-1.5 w-1.5 rounded-full bg-green-bright" />
        Warm
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-blue/10 px-2 py-0.5 text-[10px] font-medium text-blue-bright">
      <Snowflake className="h-2.5 w-2.5" />
      Cold
    </span>
  );
}

// ─── Model Cards ───

function ManagedCard({ model }: { model: Model }) {
  const Icon = getModelIcon(model.category);
  return (
    <Link
      href={`/studio/models/${model.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm text-left transition-all duration-300 hover:border-green-bright/20 hover:bg-white/[0.06] hover:shadow-[0_0_20px_-5px_rgba(64,191,134,0.1)]"
    >
      {/* Cover image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        {model.coverImage ? (
          <img
            src={model.coverImage}
            alt={`${model.name} - ${model.category} model by ${model.provider}`}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div
            className="h-full w-full"
            style={{ background: getCategoryGradient(model.category) }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-card/80 via-transparent to-transparent" />
        {/* Badges overlay */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
          <span className="inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-blue-bright backdrop-blur-sm">
            <Shield className="h-2.5 w-2.5" />
            SLA
          </span>
          {model.featured && (
            <span className="inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-green-bright backdrop-blur-sm">
              <Sparkles className="h-2.5 w-2.5" />
            </span>
          )}
        </div>
        {/* Category icon */}
        <div className="absolute bottom-2.5 left-3 flex h-8 w-8 items-center justify-center rounded-lg bg-black/50 backdrop-blur-sm">
          <Icon className="h-4 w-4 text-white/70" />
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-3.5 bg-gradient-to-b from-white/[0.02] to-transparent">
        <div className="flex items-center gap-1.5 text-[11px] text-white/50">
          <span>{model.provider}</span>
          <span className="text-white/20">/</span>
        </div>
        <p className="text-sm font-semibold text-white group-hover:text-green-bright transition-colors">
          {model.name}
        </p>
        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-white/50">
          {model.description}
        </p>
        <div className="mt-3 flex flex-wrap gap-1">
          <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] text-white/50">
            {model.category}
          </span>
          <span className="rounded-full bg-blue/10 px-2 py-0.5 text-[10px] text-blue-bright">
            Managed
          </span>
        </div>
        <div className="mt-auto flex items-center justify-between pt-3 text-[11px]">
          <span className="font-medium text-green-bright">{formatRuns(model.runs7d)} runs</span>
          <span className="font-mono text-white/50">{formatPrice(model)}</span>
        </div>
      </div>
    </Link>
  );
}

function CapabilityCard({ model }: { model: Model }) {
  const Icon = getModelIcon(model.category);
  return (
    <Link
      href={`/studio/models/${model.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm text-left transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.06] hover:shadow-[0_0_20px_-5px_rgba(64,191,134,0.1)]"
    >
      {/* Cover image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        {model.coverImage ? (
          <img
            src={model.coverImage}
            alt={`${model.name} - ${model.category} model by ${model.provider}`}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div
            className="h-full w-full"
            style={{ background: getCategoryGradient(model.category) }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-card/80 via-transparent to-transparent" />
        {/* Badges overlay */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
          <StatusBadge status={model.status} />
          {model.featured && (
            <span className="inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-green-bright backdrop-blur-sm">
              <Sparkles className="h-2.5 w-2.5" />
            </span>
          )}
        </div>
        {/* Category icon */}
        <div className="absolute bottom-2.5 left-3 flex h-8 w-8 items-center justify-center rounded-lg bg-black/50 backdrop-blur-sm">
          <Icon className="h-4 w-4 text-white/70" />
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-3.5 bg-gradient-to-b from-white/[0.02] to-transparent">
        <div className="flex items-center gap-1.5 text-[11px] text-white/50">
          <span>{model.provider}</span>
          <span className="text-white/20">/</span>
        </div>
        <p className="text-sm font-semibold text-white group-hover:text-green-bright transition-colors">
          {model.name}
          {model.precision && (
            <span className="ml-1.5 rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-normal text-white/50">
              {model.precision}
            </span>
          )}
        </p>
        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-white/50">
          {model.description}
        </p>
        <div className="mt-3 flex flex-wrap gap-1">
          <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] text-white/50">
            {model.category}
          </span>
        </div>
        <div className="mt-auto flex items-center justify-between pt-3 text-[11px]">
          <span className="font-medium text-green-bright">{formatRuns(model.runs7d)} runs</span>
          <span className="font-mono text-white/50">{formatPrice(model)}</span>
        </div>
      </div>
    </Link>
  );
}

function CtaCard({ mode }: { mode: CatalogMode }) {
  const content = {
    managed: {
      title: "Launch a Managed Solution",
      description: "Offer a managed AI service with guaranteed uptime on Livepeer\u2019s GPU network.",
      href: "https://livepeer.org/foundation",
    },
    network: {
      title: "Deploy a Pipeline",
      description: "Publish an AI capability to the open network. Your model, available to every app on Livepeer.",
      href: "https://docs.livepeer.org",
    },
    all: {
      title: "Add Your Capability",
      description: "Ship a managed solution or publish an open pipeline \u2014 your AI reaches every developer on the network.",
      href: "https://docs.livepeer.org",
    },
  };

  const { title, description, href } = content[mode];

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm text-center transition-all duration-300 hover:border-green-bright/20 hover:bg-white/[0.04]"
    >
      <div
        className="flex aspect-[4/3] w-full items-center justify-center"
        style={{ background: "linear-gradient(135deg, rgba(24,121,78,0.1) 0%, rgba(20,106,143,0.08) 100%)" }}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.06] transition-colors group-hover:bg-white/[0.1]">
          <Sparkles className="h-5 w-5 text-green-bright/40 transition-colors group-hover:text-green-bright/60" />
        </div>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center p-3.5">
        <p className="text-sm font-medium text-white/60 group-hover:text-white/80 transition-colors">
          {title}
        </p>
        <p className="mt-1 text-xs text-white/40">
          {description}
        </p>
      </div>
    </a>
  );
}

// ─── Empty State ───

function ExploreEmptyState({
  mode,
  onClearFilters,
}: {
  mode: CatalogMode;
  onClearFilters: () => void;
}) {
  const headings = {
    managed: "This category is wide open.",
    network: "No one has deployed this yet.",
    all: "Nothing here yet \u2014 but that\u2019s the opportunity.",
  };

  const subheadings = {
    managed: "Be the first to launch a managed AI solution in this space.",
    network: "Be the first to publish this pipeline to the open network.",
    all: "Deploy a managed solution or publish an open pipeline. Either way, you\u2019re first.",
  };

  const showSolutions = mode === "all" || mode === "managed";
  const showNetwork = mode === "all" || mode === "network";

  return (
    <div className="flex flex-col items-center py-20 text-center">
      {/* No results message */}
      <div className="divider-gradient w-16" />
      <p className="mt-6 text-sm text-white/40">No models match your filters</p>
      <h3 className="mt-2 text-xl font-semibold tracking-tight text-white">
        {headings[mode]}
      </h3>
      <p className="mt-2 text-sm text-white/50 max-w-md">
        {subheadings[mode]}
      </p>
      <button
        onClick={onClearFilters}
        className="mt-4 text-xs text-green-bright hover:underline"
      >
        Clear all filters
      </button>

      {/* Path CTAs */}
      <div className={`mt-10 grid grid-cols-1 gap-3 w-full ${
        showSolutions && showNetwork ? "sm:grid-cols-2 max-w-xl" : "max-w-xs"
      }`}>
        {showSolutions && (
          <a
            href="https://livepeer.org/foundation"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-left transition-all hover:border-blue/20 hover:bg-white/[0.04]"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue/10">
              <Shield className="h-4.5 w-4.5 text-blue-bright" />
            </div>
            <div>
              <p className="text-sm font-medium text-white group-hover:text-blue-bright transition-colors">
                Launch a Managed Solution
              </p>
              <p className="mt-0.5 text-xs text-white/40">
                SLA-backed service on Livepeer
              </p>
            </div>
          </a>
        )}
        {showNetwork && (
          <a
            href="https://docs.livepeer.org"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-left transition-all hover:border-green-bright/20 hover:bg-white/[0.04]"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-bright/10">
              <Cpu className="h-4.5 w-4.5 text-green-bright" />
            </div>
            <div>
              <p className="text-sm font-medium text-white group-hover:text-green-bright transition-colors">
                Deploy a Pipeline
              </p>
              <p className="mt-0.5 text-xs text-white/40">
                Open capability on the network
              </p>
            </div>
          </a>
        )}
      </div>
    </div>
  );
}

// ─── List Items ───

function ModelListItem({ model }: { model: Model }) {
  const Icon = getModelIcon(model.category);

  return (
    <Link
      href={`/studio/models/${model.id}`}
      className="group flex w-full items-center gap-4 border-b border-white/[0.04] px-5 py-4 text-left transition-colors hover:bg-white/[0.03]"
    >
      {/* Avatar */}
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] transition-colors group-hover:bg-white/[0.08]">
        {model.coverImage ? (
          <img
            src={model.coverImage}
            alt=""
            className="h-full w-full rounded-xl object-cover"
          />
        ) : (
          <Icon className="h-5 w-5 text-white/40" />
        )}
      </div>

      {/* Name & provider */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white group-hover:text-green-bright transition-colors">
          {model.name}
          {model.precision && (
            <span className="ml-1.5 rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-normal text-white/50">
              {model.precision}
            </span>
          )}
        </p>
        <p className="text-xs text-white/50 truncate">
          {model.provider}
        </p>
      </div>

      {/* Pills — hidden on mobile */}
      <div className="hidden items-center gap-2 sm:flex">
        <span className="inline-flex items-center gap-1.5 rounded-md bg-white/[0.05] px-2.5 py-1 text-[11px] text-white/50">
          <span className="h-1.5 w-1.5 rounded-full bg-white/30" />
          {model.category}
        </span>
        {model.managed ? (
          <span className="inline-flex items-center gap-1 rounded-md bg-blue/10 px-2.5 py-1 text-[11px] font-medium text-blue-bright">
            <Shield className="h-3 w-3" />
            SLA
          </span>
        ) : (
          <StatusBadge status={model.status} />
        )}
      </div>

      {/* Price */}
      <div className="w-40 shrink-0 text-right">
        <p className="font-mono text-xs font-medium text-white/60">{formatPrice(model)}</p>
        <p className="font-mono text-[10px] text-white/40">
          {formatRuns(model.runs7d)} runs
        </p>
      </div>
    </Link>
  );
}

// ─── API Tab (Provider-Centric) ───

function ApiTab() {
  const [section, setSection] = useState<"providers" | "usage" | "pricing">("providers");

  const SECTIONS = [
    { key: "providers" as const, label: "Providers" },
    { key: "usage" as const, label: "Usage" },
    { key: "pricing" as const, label: "Pricing" },
  ];

  return (
    <div className="flex flex-1">
      <div className="w-[220px] flex-shrink-0 space-y-1 self-start sticky top-[105px] border-r border-dark-border bg-dark-lighter p-4">
        <p className="mb-3 text-xs font-semibold text-white/70">
          API Platform
        </p>
        {SECTIONS.map((s) => (
          <button
            key={s.key}
            onClick={() => setSection(s.key)}
            className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] transition-colors ${
              section === s.key
                ? "bg-white/[0.08] font-medium text-white"
                : "text-white/50 hover:bg-white/[0.04] hover:text-white/60"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="flex-1 p-8">
        <div className="mx-auto max-w-3xl">
          {section === "providers" && <ProvidersSection />}
          {section === "usage" && <UsageSection />}
          {section === "pricing" && <PricingSection />}
        </div>
      </div>
    </div>
  );
}

function ProvidersSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white">
          Solutions Providers
        </h2>
        <p className="mt-1 text-sm text-white/50">
          Get API keys from providers to access models on the Livepeer network.
        </p>
      </div>
      <div className="space-y-3">
        {SOLUTIONS.map((provider) => (
          <div
            key={provider.id}
            className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-semibold text-white">
                  {provider.name}
                </h3>
                <p className="mt-1 text-sm text-white/50">
                  {provider.description}
                </p>
              </div>
              <a
                href={provider.dashboardUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-lg bg-green/10 px-3 py-2 text-xs font-medium text-green-bright transition-colors hover:bg-green/20"
              >
                Get API Key
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {provider.capabilities.map((cap) => (
                <span
                  key={cap}
                  className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] text-white/50"
                >
                  {cap}
                </span>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-3">
              {provider.trustBadges.map((badge) => (
                <span
                  key={badge}
                  className="inline-flex items-center gap-1 rounded-full bg-blue/10 px-2 py-0.5 text-[10px] font-medium text-blue-bright"
                >
                  {badge}
                </span>
              ))}
              <span className="text-xs text-white/50">
                {provider.pricingSummary}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function UsageSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white">Usage</h2>
        <p className="mt-1 text-sm text-white/50">
          Aggregated usage data across your connected providers.
        </p>
      </div>
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-8 text-center">
        <Cpu className="mx-auto h-10 w-10 text-white/10" />
        <p className="mt-3 text-sm text-white/50">
          Connect a provider to see your usage data
        </p>
        <p className="mt-1 text-xs text-white/40">
          Get an API key from a provider above, then your usage will appear here.
        </p>
      </div>
    </div>
  );
}

function PricingSection() {
  const pipelines = [
    "LLM",
    "Image Generation",
    "Video",
    "Speech",
    "Object Detection",
    "Embeddings",
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white">
          Pricing Comparison
        </h2>
        <p className="mt-1 text-sm text-white/50">
          Compare pricing across providers for each pipeline type.
        </p>
      </div>
      <div className="overflow-hidden rounded-xl border border-white/[0.06]">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-white/[0.06] bg-white/[0.02]">
              <th className="px-4 py-3 text-left font-medium text-white/50">
                Pipeline
              </th>
              <th className="px-4 py-3 text-left font-medium text-blue-bright">
                Daydream
              </th>
              <th className="px-4 py-3 text-left font-medium text-blue-bright">
                Livepeer Studio
              </th>
              <th className="px-4 py-3 text-left font-medium text-green-bright">
                Network
              </th>
            </tr>
          </thead>
          <tbody>
            {pipelines.map((pipeline) => (
              <tr
                key={pipeline}
                className="border-b border-white/[0.04] last:border-0"
              >
                <td className="px-4 py-3 text-white/60">{pipeline}</td>
                <td className="px-4 py-3 font-mono text-white/40">
                  {pipeline === "Video"
                    ? "$0.006/min"
                    : pipeline === "LLM"
                      ? "$0.10/M tok"
                      : "-"}
                </td>
                <td className="px-4 py-3 font-mono text-white/40">
                  {pipeline === "Video"
                    ? "$0.005/min"
                    : pipeline === "Speech"
                      ? "$0.003/min"
                      : "-"}
                </td>
                <td className="px-4 py-3 font-mono text-green-bright/70">
                  {pipeline === "Video"
                    ? "$0.003/min"
                    : pipeline === "LLM"
                      ? "$0.08/M tok"
                      : pipeline === "Image Generation"
                        ? "$0.003/req"
                        : pipeline === "Speech"
                          ? "$0.002/min"
                          : pipeline === "Object Detection"
                            ? "$0.001/sec"
                            : "$0.01/M tok"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Price Range Slider ───

const PRICE_BUCKETS = 20;

function buildPriceHistogram(models: Model[]) {
  const prices = models.map((m) => m.pricing.amount);
  const maxPrice = Math.max(...prices, 0.01);
  const bucketSize = maxPrice / PRICE_BUCKETS;
  const buckets = Array.from({ length: PRICE_BUCKETS }, (_, i) => ({
    range: +(bucketSize * (i + 1)).toFixed(4),
    count: 0,
  }));
  for (const p of prices) {
    const idx = Math.min(Math.floor(p / bucketSize), PRICE_BUCKETS - 1);
    buckets[idx].count++;
  }
  return { buckets, maxPrice };
}

function PriceRangeFilter({
  min,
  max,
  onChange,
  models,
}: {
  min: number;
  max: number;
  onChange: (min: number, max: number) => void;
  models: Model[];
}) {
  const { buckets, maxPrice } = useMemo(() => buildPriceHistogram(models), [models]);
  const minPrice = (min / 100) * maxPrice;
  const maxPriceValue = (max / 100) * maxPrice;

  // Determine which bars fall within the selected range
  const minBucketIdx = Math.min(
    Math.floor((min / 100) * PRICE_BUCKETS),
    PRICE_BUCKETS - 1,
  );
  const maxBucketIdx = Math.min(
    Math.floor((max / 100) * PRICE_BUCKETS),
    PRICE_BUCKETS - 1,
  );

  return (
    <div>
      <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-white/30">
        Price Range
      </p>
      {/* Histogram */}
      <div className="flex h-12 items-end gap-px px-1">
        {buckets.map((bucket, i) => {
          const maxCount = Math.max(...buckets.map((b) => b.count), 1);
          const height = bucket.count > 0 ? Math.max((bucket.count / maxCount) * 100, 8) : 0;
          const active = i >= minBucketIdx && i <= maxBucketIdx;
          return (
            <div
              key={i}
              className="flex-1 transition-colors duration-150"
              style={{
                height: `${height}%`,
                backgroundColor: active
                  ? "rgba(64, 191, 134, 0.5)"
                  : "rgba(255, 255, 255, 0.06)",
              }}
            />
          );
        })}
      </div>
      {/* Dual range slider */}
      <div className="relative mt-1 h-5 px-1">
        {/* Track background */}
        <div className="absolute left-1 right-1 top-1/2 h-[2px] -translate-y-1/2 rounded-full bg-white/[0.08]" />
        {/* Active track fill */}
        <div
          className="absolute top-1/2 h-[2px] -translate-y-1/2 rounded-full"
          style={{
            left: `calc(${min}% + 4px * (1 - ${min} / 100))`,
            right: `calc(${100 - max}% + 4px * (1 - ${max} / 100))`,
            backgroundColor: "rgba(64, 191, 134, 0.5)",
          }}
        />
        <input
          type="range"
          min={0}
          max={100}
          value={min}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (v < max) onChange(v, max);
          }}
          className="price-range-thumb pointer-events-none absolute inset-0 w-full appearance-none bg-transparent [&::-moz-range-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:pointer-events-auto"
          style={{ zIndex: min > 90 ? 4 : 3 }}
        />
        <input
          type="range"
          min={0}
          max={100}
          value={max}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (v > min) onChange(min, v);
          }}
          className="price-range-thumb pointer-events-none absolute inset-0 w-full appearance-none bg-transparent [&::-moz-range-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:pointer-events-auto"
          style={{ zIndex: 3 }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-white/50 px-1">
        <span>${minPrice.toFixed(3)}</span>
        <span>${maxPriceValue.toFixed(3)}</span>
      </div>
    </div>
  );
}

// ─── Main Page ───

export default function StudioPage() {
  return (
    <Suspense>
      <StudioPageInner />
    </Suspense>
  );
}

function StudioPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get("tab");

  const [activeTab, setActiveTab] = useState(tabParam || "home");
  const [catalogMode, setCatalogMode] = useState<CatalogMode>("all");
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [category, setCategory] = useState<ModelCategory | null>(null);
  const [sort, setSort] = useState("popularity");
  const [sortDir, setSortDir] = useState<"desc" | "asc">("desc");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showHotOnly, setShowHotOnly] = useState(false);
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(100);
  const dataMaxPrice = useMemo(
    () => Math.max(...MODELS.map((m) => m.pricing.amount), 0.01),
    [],
  );
  // Sync tab from URL — use tabParam as source of truth
  useEffect(() => {
    if (tabParam && tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
  }, [tabParam, activeTab]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    router.replace(`/studio?tab=${tab}`, { scroll: false });
  };

  const filtered = useMemo(() => {
    const result = MODELS.filter((m) => {
      if (catalogMode === "managed" && !m.managed) return false;
      if (catalogMode === "network" && m.managed) return false;
      const matchesSearch =
        !search ||
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.provider.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = !category || m.category === category;
      const matchesHot = !showHotOnly || m.status === "hot";
      const price = m.pricing.amount;
      const matchesPrice = price >= (priceMin / 100) * dataMaxPrice && price <= (priceMax / 100) * dataMaxPrice;
      return matchesSearch && matchesCategory && matchesHot && matchesPrice;
    });

    result.sort((a, b) => {
      if (catalogMode === "all" && a.managed !== b.managed) {
        return a.managed ? -1 : 1;
      }
      // Featured first
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      const dir = sortDir === "asc" ? 1 : -1;
      switch (sort) {
        case "latency":
          return (a.latency - b.latency) * dir;
        case "price":
          return (a.pricing.amount - b.pricing.amount) * dir;
        default:
          return (b.runs7d - a.runs7d) * dir;
      }
    });

    return result;
  }, [search, category, sort, sortDir, showHotOnly, priceMin, priceMax, dataMaxPrice, catalogMode]);

  const activeFilters = [
    ...(catalogMode !== "all"
      ? [
          {
            label: catalogMode === "managed" ? "Solutions" : "Network",
            onClear: () => setCatalogMode("all"),
          },
        ]
      : []),
    ...(category
      ? [{ label: category, onClear: () => setCategory(null) }]
      : []),
    ...(showHotOnly
      ? [{ label: "Hot only", onClear: () => setShowHotOnly(false) }]
      : []),
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <StudioHeader
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onSearch={(q) => {
          setSearch(q);
          if (activeTab !== "explore") handleTabChange("explore");
        }}
      />

      <main id="main-content" className="flex flex-1 flex-col">
      {activeTab === "home" && <HomeTab onNavigate={handleTabChange} />}

      {activeTab === "explore" && (
        <div className="flex flex-1">
          {/* Filter sidebar */}
          <div className="hidden w-[220px] flex-shrink-0 space-y-5 self-start sticky top-[105px] max-h-[calc(100vh-105px)] overflow-y-auto border-r border-white/[0.06] bg-dark-lighter/60 p-4 backdrop-blur-xl lg:block">
            {/* Source filter */}
            <div>
              <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-white/50">
                Source
              </p>
              <div className="space-y-0.5">
                <button
                  onClick={() => {
                    setCatalogMode("all");
                    setShowHotOnly(false);
                  }}
                  className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-[13px] transition-colors ${
                    catalogMode === "all"
                      ? "bg-white/[0.08] font-medium text-white"
                      : "text-white/50 hover:bg-white/[0.04] hover:text-white/60"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => {
                    setCatalogMode("managed");
                    setShowHotOnly(false);
                  }}
                  className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-[13px] transition-colors ${
                    catalogMode === "managed"
                      ? "bg-blue/10 font-medium text-blue-bright"
                      : "text-white/50 hover:bg-white/[0.04] hover:text-white/60"
                  }`}
                >
                  <Shield className="h-3 w-3" />
                  Solutions
                </button>
                <button
                  onClick={() => setCatalogMode("network")}
                  className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-[13px] transition-colors ${
                    catalogMode === "network"
                      ? "bg-green-bright/10 font-medium text-green-bright"
                      : "text-white/50 hover:bg-white/[0.04] hover:text-white/60"
                  }`}
                >
                  <Cpu className="h-3 w-3" />
                  Network
                </button>
              </div>
            </div>

            <div className="h-px bg-white/[0.06]" />

            {/* Category filter */}
            <div>
              <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-white/50">
                Pipeline Type
              </p>
              <div className="space-y-0.5">
                {CATEGORIES.map(({ label: cat, icon: CatIcon }) => (
                  <button
                    key={cat}
                    onClick={() =>
                      setCategory(category === cat ? null : cat)
                    }
                    className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-[13px] transition-colors ${
                      category === cat
                        ? "bg-white/[0.08] font-medium text-white"
                        : "text-white/50 hover:bg-white/[0.04] hover:text-white/60"
                    }`}
                  >
                    <CatIcon className="h-3 w-3" />
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Status filter */}
            {catalogMode !== "managed" && (
              <>
                <div className="h-px bg-white/[0.06]" />
                <div>
                  <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-white/50">
                    Status
                  </p>
                  <button
                    onClick={() => setShowHotOnly(!showHotOnly)}
                    className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-[13px] transition-colors ${
                      showHotOnly
                        ? "bg-green-bright/10 font-medium text-green-bright"
                        : "text-white/50 hover:bg-white/[0.04] hover:text-white/60"
                    }`}
                  >
                    <Flame className="h-3 w-3" />
                    Hot models only
                  </button>
                </div>
              </>
            )}

            <div className="h-px bg-white/[0.06]" />

            <PriceRangeFilter
              min={priceMin}
              max={priceMax}
              onChange={(min, max) => { setPriceMin(min); setPriceMax(max); }}
              models={MODELS}
            />

            {activeFilters.length > 0 && (
              <>
                <div className="h-px bg-white/[0.06]" />
                <button
                  onClick={() => {
                    setCatalogMode("all");
                    setCategory(null);
                    setShowHotOnly(false);
                    setPriceMin(0);
                    setPriceMax(100);
                  }}
                  className="text-[11px] text-white/50 hover:text-white/60"
                >
                  Clear all filters
                </button>
              </>
            )}
          </div>

          {/* Content */}
          <div className="flex flex-1 flex-col">
            {/* Toolbar */}
            <div className="sticky top-[105px] z-30 flex flex-wrap items-center gap-3 border-b border-white/[0.06] bg-dark px-5 py-3">
              <div className="relative min-w-[200px] w-full max-w-xl">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  aria-label="Search models"
                  placeholder="Search models..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-lg border border-dark-border bg-dark py-2 pl-9 pr-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-white/20"
                />
              </div>
              <div className="flex items-center gap-1.5 ml-auto">
                <div className="relative">
                  <button
                    onClick={() => setShowSortMenu(!showSortMenu)}
                    className="flex items-center gap-2 rounded-lg border border-dark-border bg-dark px-3 py-2 text-xs transition-colors hover:bg-white/[0.04] focus:outline-none"
                  >
                    <span className="text-white/40">Sort:</span>
                    <span className="text-white/60">{SORT_OPTIONS.find((o) => o.value === sort)?.label}</span>
                    <ChevronDown className="h-3 w-3 text-white/30" />
                  </button>
                  {showSortMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowSortMenu(false)}
                      />
                      <div className="absolute right-0 top-full z-50 mt-1.5 w-44 rounded-xl border border-white/[0.08] bg-dark-card p-1 shadow-xl">
                        {SORT_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => {
                              setSort(opt.value);
                              setShowSortMenu(false);
                            }}
                            className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs transition-colors ${
                              sort === opt.value
                                ? "bg-white/[0.08] text-white"
                                : "text-white/50 hover:bg-white/[0.04] hover:text-white/70"
                            }`}
                          >
                            {opt.label}
                            {sort === opt.value && (
                              <Check className="h-3.5 w-3.5 text-green-bright" />
                            )}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
                <button
                  onClick={() => setSortDir(sortDir === "desc" ? "asc" : "desc")}
                  aria-label={sortDir === "desc" ? "Sort descending" : "Sort ascending"}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-dark-border bg-dark transition-colors hover:bg-white/[0.04] focus:outline-none"
                >
                  {sortDir === "desc" ? (
                    <ArrowDown className="h-3.5 w-3.5 text-white/50" />
                  ) : (
                    <ArrowUp className="h-3.5 w-3.5 text-white/50" />
                  )}
                </button>
              </div>
              <div className="flex rounded-lg border border-dark-border">
                <button
                  onClick={() => setView("grid")}
                  aria-label="Grid view"
                  aria-pressed={view === "grid"}
                  className={`flex h-8 w-8 items-center justify-center rounded-l-lg transition-colors focus:outline-none ${
                    view === "grid"
                      ? "bg-white/[0.08] text-white"
                      : "text-white/50 hover:text-white/60"
                  }`}
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setView("list")}
                  aria-label="List view"
                  aria-pressed={view === "list"}
                  className={`flex h-8 w-8 items-center justify-center rounded-r-lg transition-colors focus:outline-none ${
                    view === "list"
                      ? "bg-white/[0.08] text-white"
                      : "text-white/50 hover:text-white/60"
                  }`}
                >
                  <List className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Filter pills */}
            {activeFilters.length > 0 && (
              <div className="sticky top-[149px] z-20 flex flex-wrap gap-2 border-b border-white/[0.06] bg-dark-lighter/40 px-5 py-2 backdrop-blur-xl">
                <span className="text-[11px] text-white/40">
                  Filtering by:
                </span>
                {activeFilters.map((f) => (
                  <button
                    key={f.label}
                    onClick={f.onClear}
                    className="inline-flex items-center gap-1 rounded-full bg-white/[0.06] px-2 py-0.5 text-[11px] text-white/50 hover:bg-white/[0.1]"
                  >
                    {f.label}
                    <X className="h-2.5 w-2.5" />
                  </button>
                ))}
              </div>
            )}

            {/* Grid/List */}
            <div className="flex-1 p-5">
              {filtered.length === 0 ? (
                <ExploreEmptyState
                  mode={catalogMode}
                  onClearFilters={() => {
                    setSearch("");
                    setCatalogMode("all");
                    setCategory(null);
                    setShowHotOnly(false);
                    setPriceMax(100);
                  }}
                />
              ) : view === "grid" ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                  {filtered.map((model) =>
                    model.managed ? (
                      <ManagedCard key={model.id} model={model} />
                    ) : (
                      <CapabilityCard key={model.id} model={model} />
                    ),
                  )}
                  <CtaCard mode={catalogMode} />
                </div>
              ) : (
                <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm">
                  {filtered.map((model) => (
                    <ModelListItem key={model.id} model={model} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "api" && <ApiTab />}

      {activeTab === "statistics" && <StatisticsTab />}
      </main>
    </div>
  );
}
