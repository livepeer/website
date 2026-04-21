"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ChevronDown } from "lucide-react";
import StatCard from "@/components/studio/statistics/StatCard";
import PeriodToggle from "@/components/studio/statistics/PeriodToggle";
import { StackedChartTooltip } from "@/components/studio/statistics/ChartTooltip";
import { SIGNER_COLORS } from "@/lib/studio/mock-data";
import type {
  NetworkStat,
  AccountActivityRow,
  AccountUsageBySigner,
  AccountUsageByToken,
  AccountUsageDailyPoint,
  AccountUsageSummary,
  SignerKey,
} from "@/lib/studio/types";

type UsagePayload = {
  summary: AccountUsageSummary;
  bySigner: AccountUsageBySigner[];
  byToken: AccountUsageByToken[];
  daily: AccountUsageDailyPoint[];
  recentRequests: AccountActivityRow[];
};

function normalizeUsagePayload(
  payload: Partial<UsagePayload> & { recentRequests?: AccountActivityRow[] },
): UsagePayload {
  return {
    summary: payload.summary ?? {
      requests: 0,
      spendDisplay: "$0.00",
      freeTierUsed: 0,
      freeTierLimit: 10_000,
      freeTierResetIn: "—",
    },
    bySigner: payload.bySigner ?? [],
    byToken: payload.byToken ?? [],
    daily: payload.daily ?? [],
    recentRequests: payload.recentRequests ?? [],
  };
}

// ─── Period filter ───

type Period = "24h" | "7d" | "30d" | "3m";

const PERIOD_OPTIONS: { key: Period; label: string }[] = [
  { key: "24h", label: "24H" },
  { key: "7d", label: "7D" },
  { key: "30d", label: "30D" },
  { key: "3m", label: "3M" },
];

function filterByPeriod(
  data: AccountUsageDailyPoint[],
  period: Period,
): AccountUsageDailyPoint[] {
  const days =
    period === "24h" ? 1 : period === "7d" ? 7 : period === "30d" ? 30 : 90;
  const now = new Date();
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - days);
  return data.filter((d) => new Date(d.date) >= cutoff);
}

// ─── Signer filter ───

type SignerFilter = "all" | SignerKey;

const SIGNER_KEYS: SignerKey[] = [
  "freeTier",
  "paymthouse",
  "livepeerCloud",
  "ethWallet",
];

const SIGNER_LABELS: Record<SignerKey, string> = {
  freeTier: "Free tier",
  paymthouse: "Paymthouse",
  livepeerCloud: "Livepeer Cloud",
  ethWallet: "ETH wallet",
};

// ─── Activity log helpers ───

function formatActivityTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const hh = d.getHours().toString().padStart(2, "0");
  const mm = d.getMinutes().toString().padStart(2, "0");
  const ss = d.getSeconds().toString().padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

function formatActivityLatency(ms: number | null): string {
  if (ms == null) return "—";
  if (ms >= 1000) return `${(ms / 1000).toFixed(1)} s`;
  return `${ms} ms`;
}

// ─── Filter dropdown ───

function FilterSelect<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { key: T; label: string }[];
  onChange: (v: T) => void;
}) {
  const current = options.find((o) => o.key === value)?.label ?? "All";
  return (
    <label className="relative flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-1.5 text-xs text-white/60 transition-colors hover:bg-white/[0.04]">
      <span className="text-white/40">{label}</span>
      <span className="text-white/80">{current}</span>
      <ChevronDown className="h-3 w-3 text-white/40" aria-hidden="true" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="absolute inset-0 cursor-pointer opacity-0"
        aria-label={label}
      >
        {options.map((o) => (
          <option key={o.key} value={o.key} className="bg-dark text-white">
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

// ─── Main ───

export default function UsageTab() {
  const [period, setPeriod] = useState<Period>("30d");
  const [signerFilter, setSignerFilter] = useState<SignerFilter>("all");
  const [tokenFilter, setTokenFilter] = useState<string>("all");
  const [usageLoading, setUsageLoading] = useState(true);
  const [usageError, setUsageError] = useState<string | null>(null);
  const [usageData, setUsageData] = useState<UsagePayload | null>(null);
  const [highlightedRequestId, setHighlightedRequestId] = useState<
    string | null
  >(null);
  const searchParams = useSearchParams();
  const targetRequestId = searchParams.get("request");

  useEffect(() => {
    let cancelled = false;
    const fetchUsage = async () => {
      setUsageLoading(true);
      setUsageError(null);
      try {
        const response = await fetch(`/api/usage?period=${period}`, {
          method: "GET",
          cache: "no-store",
        });
        const payload = (await response.json().catch(() => ({}))) as Partial<UsagePayload> & {
          error_description?: string;
        };
        if (!response.ok) {
          throw new Error(payload.error_description || "Failed to load usage data.");
        }
        if (!cancelled) {
          setUsageData(normalizeUsagePayload(payload));
        }
      } catch (error) {
        if (!cancelled) {
          setUsageError(
            error instanceof Error ? error.message : "Failed to load usage data.",
          );
          setUsageData(null);
        }
      } finally {
        if (!cancelled) {
          setUsageLoading(false);
        }
      }
    };

    void fetchUsage();
    return () => {
      cancelled = true;
    };
  }, [period]);

  const summary = usageData?.summary;
  const signerRows = usageData?.bySigner ?? [];
  const tokenRows = usageData?.byToken ?? [];
  const dailyRows = usageData?.daily ?? [];

  const chartData = useMemo(
    () => filterByPeriod(dailyRows, period),
    [dailyRows, period],
  );

  const totalRequests = useMemo(() => {
    if (usageData?.summary.requests != null) {
      return usageData.summary.requests;
    }
    return chartData.reduce(
      (sum, d) =>
        sum + d.freeTier + d.paymthouse + d.livepeerCloud + d.ethWallet,
      0,
    );
  }, [chartData, usageData]);

  const visibleSigners: SignerKey[] = useMemo(
    () => (signerFilter === "all" ? SIGNER_KEYS : [signerFilter]),
    [signerFilter],
  );

  const filteredSignerRows = useMemo(
    () =>
      signerRows.filter(
        (row) => signerFilter === "all" || row.signer === signerFilter,
      ),
    [signerFilter, signerRows],
  );

  const filteredTokenRows = useMemo(
    () =>
      tokenRows.filter(
        (row) => tokenFilter === "all" || row.tokenId === tokenFilter,
      ),
    [tokenFilter, tokenRows],
  );

  const periodCutoffMs = useMemo(() => {
    const days =
      period === "24h" ? 1 : period === "7d" ? 7 : period === "30d" ? 30 : 90;
    return Date.now() - days * 24 * 60 * 60 * 1000;
  }, [period]);

  const filteredActivity = useMemo<AccountActivityRow[]>(() => {
    const rows = usageData?.recentRequests ?? [];
    return rows.filter((row) => {
      const ts = new Date(row.timestamp).getTime();
      if (Number.isNaN(ts) || ts < periodCutoffMs) return false;
      if (signerFilter !== "all" && row.signer !== signerFilter) return false;
      if (tokenFilter !== "all" && row.tokenId !== tokenFilter) return false;
      return true;
    });
  }, [usageData?.recentRequests, periodCutoffMs, signerFilter, tokenFilter]);

  const clearAllFilters = () => {
    setPeriod("30d");
    setSignerFilter("all");
    setTokenFilter("all");
  };

  // Scroll to a specific request row when arriving with `?request=<id>`
  // (e.g. from clicking a row on the studio home). scrollIntoView cascades
  // through every scrollable ancestor, so it handles both the outer settings
  // scroll container and the inner 440px activity log region in one call.
  useEffect(() => {
    if (!targetRequestId) return;
    let cancelled = false;
    const raf = requestAnimationFrame(() => {
      if (cancelled) return;
      const el = document.querySelector<HTMLElement>(
        `[data-request-id="${CSS.escape(targetRequestId)}"]`,
      );
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        setHighlightedRequestId(targetRequestId);
      } else {
        // Row not in the current filtered view — fall back to the section anchor
        document
          .getElementById("recent-requests")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
    const timer = window.setTimeout(() => {
      if (!cancelled) setHighlightedRequestId(null);
    }, 1800);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
    };
  }, [targetRequestId, filteredActivity]);

  const headerStats: NetworkStat[] = useMemo(() => {
    if (!summary) return [];
    const freePct = Math.round(
      (summary.freeTierUsed / summary.freeTierLimit) * 100,
    );
    return [
      {
        label: "Requests this period",
        value: summary.requests.toLocaleString(),
        trend: "flat",
      },
      {
        label: "Spend this period",
        value: summary.spendDisplay,
        trend: "flat",
      },
      {
        label: `Free tier (${freePct}% used)`,
        value: `${summary.freeTierUsed.toLocaleString()} / ${summary.freeTierLimit.toLocaleString()}`,
        delta: `Resets ${summary.freeTierResetIn}`,
        trend: "flat",
      },
    ];
  }, [summary]);

  const signerSelectOptions = useMemo<{ key: SignerFilter; label: string }[]>(
    () => [
      { key: "all", label: "All providers" },
      ...SIGNER_KEYS.map((k) => ({ key: k, label: SIGNER_LABELS[k] })),
    ],
    [],
  );

  const tokenSelectOptions = useMemo(
    () => [
      { key: "all", label: "All tokens" },
      ...tokenRows.map((t) => ({
        key: t.tokenId,
        label: t.tokenName,
      })),
    ],
    [tokenRows],
  );

  const showSyncBanner = usageLoading && usageData;

  return (
    <div className="px-6 pt-6 pb-10">
      {usageError && (
        <div className="mb-4 rounded-lg border border-red-400/25 bg-red-500/10 px-4 py-3 text-xs text-red-300/90">
          {usageError}
        </div>
      )}

      {usageLoading && !usageData && (
        <div className="space-y-6" aria-busy="true" aria-label="Loading usage">
          <p className="text-center text-xs text-white/50">Loading usage…</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-[88px] animate-pulse rounded-xl border border-white/[0.06] bg-white/[0.04]"
              />
            ))}
          </div>
          <div className="h-[380px] animate-pulse rounded-xl border border-white/[0.06] bg-white/[0.04]" />
          <div className="h-[200px] animate-pulse rounded-xl border border-white/[0.06] bg-white/[0.04]" />
          <div className="h-[200px] animate-pulse rounded-xl border border-white/[0.06] bg-white/[0.04]" />
          <div className="h-[240px] animate-pulse rounded-xl border border-white/[0.06] bg-white/[0.04]" />
        </div>
      )}

      {showSyncBanner && (
        <div className="mb-4 rounded-lg border border-white/[0.08] bg-white/[0.02] px-4 py-3 text-xs text-white/50">
          Syncing usage from pymthouse...
        </div>
      )}

      {usageData && (
        <>
      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {headerStats.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </div>

      {/* Usage breakdown chart */}
      <div className="mt-6 rounded-xl border border-white/[0.06] bg-dark-surface p-5">
        <div className="mb-1 flex items-start justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-white/60">
              Requests
            </p>
            <p className="mt-1 font-mono text-3xl font-bold text-white">
              {totalRequests.toLocaleString()}
            </p>
            <p className="mt-1 text-sm text-white/55">
              Daily request volume across providers for the selected period.
            </p>
          </div>
          <PeriodToggle
            value={period}
            onChange={setPeriod}
            options={PERIOD_OPTIONS}
          />
        </div>

        {/* Provider + Token filters */}
        <div className="mt-4 flex flex-wrap items-center gap-3 border-b border-white/[0.06] pb-4">
          <FilterSelect
            label="Provider"
            value={signerFilter}
            options={signerSelectOptions}
            onChange={setSignerFilter}
          />
          <FilterSelect
            label="Token"
            value={tokenFilter}
            options={tokenSelectOptions}
            onChange={setTokenFilter}
          />
        </div>

        <div className="mt-4">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData} barCategoryGap="15%">
              <XAxis
                dataKey="date"
                tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: string) => v.slice(5)}
                interval={
                  period === "24h"
                    ? 0
                    : period === "7d"
                      ? 0
                      : period === "30d"
                        ? 4
                        : 12
                }
              />
              <YAxis hide />
              <Tooltip
                content={<StackedChartTooltip />}
                cursor={{ fill: "rgba(255,255,255,0.03)" }}
              />
              {visibleSigners.map((key, i) => (
                <Bar
                  key={key}
                  dataKey={key}
                  stackId="requests"
                  name={SIGNER_LABELS[key]}
                  fill={SIGNER_COLORS[key]}
                  radius={
                    i === visibleSigners.length - 1
                      ? [2, 2, 0, 0]
                      : [0, 0, 0, 0]
                  }
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-3 flex flex-wrap gap-3">
          {SIGNER_KEYS.map((key) => {
            const dim =
              signerFilter !== "all" && signerFilter !== key
                ? "opacity-30"
                : "";
            return (
              <div key={key} className={`flex items-center gap-1.5 ${dim}`}>
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: SIGNER_COLORS[key] }}
                />
                <span className="text-[11px] text-white/50">
                  {SIGNER_LABELS[key]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Usage per signer */}
      <div className="mt-6 rounded-xl border border-white/[0.06] bg-dark-surface">
        <div className="border-b border-white/[0.06] px-5 py-3">
          <h2 className="text-sm font-medium text-white">Usage per provider</h2>
          <p className="text-[11px] text-white/40">
            Cost breakdown by payment routing source.
          </p>
        </div>

        <div className="hidden md:flex items-center gap-3 border-b border-white/[0.06] px-5 py-2">
          <span className="min-w-0 flex-1 text-[11px] font-medium uppercase tracking-wider text-white/30">
            Provider
          </span>
          <span className="w-24 shrink-0 text-right text-[11px] font-medium uppercase tracking-wider text-white/30">
            Requests
          </span>
          <span className="w-16 shrink-0 text-right text-[11px] font-medium uppercase tracking-wider text-white/30">
            Share
          </span>
          <span className="w-24 shrink-0 text-right text-[11px] font-medium uppercase tracking-wider text-white/30">
            Spend
          </span>
        </div>

        <div className="divide-y divide-white/[0.04]">
          {filteredSignerRows.map((row) => (
            <div key={row.signer}>
              {/* Desktop row */}
              <div className="hidden md:flex items-center gap-3 px-5 py-3">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: SIGNER_COLORS[row.signer] }}
                />
                <p className="min-w-0 flex-1 truncate text-sm text-white/80">
                  {row.label}
                </p>
                <span className="w-24 shrink-0 text-right font-mono text-xs text-white/70">
                  {row.requests.toLocaleString()}
                </span>
                <span className="w-16 shrink-0 text-right font-mono text-xs text-white/50">
                  {row.percent}%
                </span>
                <span className="w-24 shrink-0 text-right font-mono text-xs text-white/70">
                  {row.spendDisplay}
                </span>
              </div>
              {/* Mobile card */}
              <div className="flex flex-col gap-1.5 px-4 py-3 md:hidden">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: SIGNER_COLORS[row.signer] }}
                  />
                  <p className="min-w-0 flex-1 truncate text-sm text-white/80">
                    {row.label}
                  </p>
                  <span className="shrink-0 font-mono text-xs text-white/70">
                    {row.spendDisplay}
                  </span>
                </div>
                <div className="flex items-center gap-4 pl-4 font-mono text-[11px] text-white/40">
                  <span>{row.requests.toLocaleString()} req</span>
                  <span className="text-white/20">·</span>
                  <span>{row.percent}%</span>
                </div>
              </div>
            </div>
          ))}
          {filteredSignerRows.length === 0 && (
            <div className="px-5 py-8 text-center text-xs text-white/40">
              No provider activity for the current filter.
            </div>
          )}
        </div>
      </div>

      {/* Usage per token */}
      <div className="mt-6 rounded-xl border border-white/[0.06] bg-dark-surface">
        <div className="border-b border-white/[0.06] px-5 py-3">
          <h2 className="text-sm font-medium text-white">Usage per token</h2>
          <p className="text-[11px] text-white/40">
            Activity grouped by API token.
          </p>
        </div>

        <div className="hidden md:flex items-center gap-3 border-b border-white/[0.06] px-5 py-2">
          <span className="min-w-0 flex-1 text-[11px] font-medium uppercase tracking-wider text-white/30">
            Token
          </span>
          <span className="w-24 shrink-0 text-right text-[11px] font-medium uppercase tracking-wider text-white/30">
            Requests
          </span>
          <span className="w-28 shrink-0 text-right text-[11px] font-medium uppercase tracking-wider text-white/30">
            Last used
          </span>
          <span className="w-24 shrink-0 text-right text-[11px] font-medium uppercase tracking-wider text-white/30">
            Spend
          </span>
        </div>

        <div className="divide-y divide-white/[0.04]">
          {filteredTokenRows.map((row) => (
            <div key={row.tokenId}>
              {/* Desktop row */}
              <div className="hidden md:flex items-center gap-3 px-5 py-3">
                <p className="min-w-0 flex-1 truncate text-sm text-white/80">
                  {row.tokenName}
                </p>
                <span className="w-24 shrink-0 text-right font-mono text-xs text-white/70">
                  {row.requests.toLocaleString()}
                </span>
                <span className="w-28 shrink-0 text-right font-mono text-xs text-white/50">
                  {row.lastUsed}
                </span>
                <span className="w-24 shrink-0 text-right font-mono text-xs text-white/70">
                  {row.spendDisplay}
                </span>
              </div>
              {/* Mobile card */}
              <div className="flex flex-col gap-1.5 px-4 py-3 md:hidden">
                <div className="flex items-center gap-2">
                  <p className="min-w-0 flex-1 truncate text-sm text-white/80">
                    {row.tokenName}
                  </p>
                  <span className="shrink-0 font-mono text-xs text-white/70">
                    {row.spendDisplay}
                  </span>
                </div>
                <div className="flex items-center gap-4 font-mono text-[11px] text-white/40">
                  <span>{row.requests.toLocaleString()} req</span>
                  <span className="text-white/20">·</span>
                  <span>last {row.lastUsed}</span>
                </div>
              </div>
            </div>
          ))}
          {filteredTokenRows.length === 0 && (
            <div className="px-5 py-8 text-center text-xs text-white/40">
              No token activity for the current filter.
            </div>
          )}
        </div>
      </div>

      {/* Recent requests — full activity log (filtered by tab-level filters) */}
      <div
        id="recent-requests"
        className="mt-6 scroll-mt-6 rounded-xl border border-white/[0.06] bg-dark-surface"
      >
        <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3">
          <div>
            <h2 className="text-sm font-medium text-white">Recent requests</h2>
            <p className="text-[11px] text-white/55">
              Latest API requests across all providers and tokens.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-bright/10 px-2.5 py-1 text-[11px] font-medium text-green-bright">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-bright" />
              LIVE
            </span>
            <span className="font-mono text-[11px] text-white/50">
              Showing {Math.min(filteredActivity.length, 10)} of{" "}
              {filteredActivity.length}
            </span>
          </div>
        </div>

        {filteredActivity.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-xs text-white/40">
              No requests match the current filters.
            </p>
            <button
              type="button"
              onClick={clearAllFilters}
              className="mt-2 text-xs text-green-bright transition-colors hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="scrollbar-dark max-h-[440px] overflow-y-auto">
            {/* Sticky header — desktop only */}
            <div className="hidden md:flex sticky top-0 z-10 items-center gap-3 border-b border-white/[0.06] bg-dark-surface px-5 py-2">
              <span className="w-20 shrink-0 text-[11px] font-medium uppercase tracking-wider text-white/30">
                Time
              </span>
              <span className="min-w-0 flex-1 text-[11px] font-medium uppercase tracking-wider text-white/30">
                Model
              </span>
              <span className="w-20 shrink-0 text-[11px] font-medium uppercase tracking-wider text-white/30">
                Status
              </span>
              <span className="w-20 shrink-0 text-right text-[11px] font-medium uppercase tracking-wider text-white/30">
                Latency
              </span>
              <span className="hidden w-32 shrink-0 text-[11px] font-medium uppercase tracking-wider text-white/30 lg:inline">
                Provider
              </span>
              <span className="hidden w-24 shrink-0 text-[11px] font-medium uppercase tracking-wider text-white/30 lg:inline">
                Token
              </span>
              <span className="w-24 shrink-0 text-right text-[11px] font-medium uppercase tracking-wider text-white/30">
                Cost
              </span>
            </div>

            <div className="divide-y divide-white/[0.04]">
              {filteredActivity.map((row) => {
                const isSuccess = row.status === "success";
                const isHighlighted = highlightedRequestId === row.id;
                return (
                  <div
                    key={row.id}
                    data-request-id={row.id}
                    className={`transition-colors ${
                      isHighlighted
                        ? "bg-green/[0.08]"
                        : "hover:bg-white/[0.02]"
                    }`}
                  >
                    {/* Desktop row */}
                    <div className="hidden md:flex items-center gap-3 px-5 py-2.5">
                      <span className="w-20 shrink-0 font-mono text-[11px] text-white/40">
                        {formatActivityTime(row.timestamp)}
                      </span>
                      <span className="min-w-0 flex-1 truncate font-mono text-xs text-white/80">
                        {row.model}
                      </span>
                      <span className="w-20 shrink-0">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-[11px] ${
                            isSuccess
                              ? "bg-green/15 text-green-bright"
                              : "bg-white/[0.06] text-white/50"
                          }`}
                        >
                          {row.status}
                        </span>
                      </span>
                      <span className="w-20 shrink-0 text-right font-mono text-[11px] text-white/60">
                        {formatActivityLatency(row.latencyMs)}
                      </span>
                      <span className="hidden w-32 shrink-0 items-center gap-1.5 text-[11px] text-white/70 lg:inline-flex">
                        <span
                          className="h-1.5 w-1.5 shrink-0 rounded-full"
                          style={{ backgroundColor: SIGNER_COLORS[row.signer] }}
                          aria-hidden="true"
                        />
                        <span className="truncate">{row.signerLabel}</span>
                      </span>
                      <span className="hidden w-24 shrink-0 truncate text-[11px] text-white/50 lg:inline">
                        {row.tokenName}
                      </span>
                      <span className="w-24 shrink-0 text-right font-mono text-[11px] text-white/70">
                        {row.costDisplay}
                      </span>
                    </div>
                    {/* Mobile card */}
                    <div className="flex flex-col gap-1 px-4 py-2.5 md:hidden">
                      <div className="flex items-start justify-between gap-3">
                        <span className="min-w-0 flex-1 truncate font-mono text-xs text-white/80">
                          {row.model}
                        </span>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] ${
                            isSuccess
                              ? "bg-green/15 text-green-bright"
                              : "bg-white/[0.06] text-white/50"
                          }`}
                        >
                          {row.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 font-mono text-[11px] text-white/40">
                        <span>{formatActivityTime(row.timestamp)}</span>
                        <span className="text-white/20">·</span>
                        <span>{formatActivityLatency(row.latencyMs)}</span>
                        <span className="ml-auto text-white/70">{row.costDisplay}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
        </>
      )}
    </div>
  );
}
