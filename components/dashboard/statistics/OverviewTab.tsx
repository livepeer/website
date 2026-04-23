"use client";

import { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import StatCard from "./StatCard";
import PeriodToggle from "./PeriodToggle";
import { StackedChartTooltip } from "./ChartTooltip";
import {
  NETWORK_STATS,
  API_REQUEST_SERIES,
  TOP_APIS,
  API_COLORS,
  MODELS,
} from "@/lib/dashboard/mock-data";
import { computeAxisTicks, formatRuns, getModelIcon } from "@/lib/dashboard/utils";
import Link from "next/link";
import type { NetworkStat } from "@/lib/dashboard/types";

// ─── KPI subset for overview ───

const OVERVIEW_KPI: NetworkStat[] = [
  NETWORK_STATS[3], // Requests / sec
  NETWORK_STATS[6], // Success Rate
  NETWORK_STATS[7], // Total GPUs
  NETWORK_STATS[2], // Median Latency
];

// ─── Time period filter ───

type Period = "7d" | "30d" | "3m";

const PERIOD_OPTIONS: { key: Period; label: string }[] = [
  { key: "7d", label: "7D" },
  { key: "30d", label: "30D" },
  { key: "3m", label: "3M" },
];

function filterByPeriod<T extends { date: string }>(data: T[], period: Period): T[] {
  const now = new Date();
  const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - days);
  return data.filter((d) => new Date(d.date) >= cutoff);
}

// ─── Top Pipelines grid ───

function TopPipelinesGrid() {
  const sorted = useMemo(
    () =>
      [...MODELS]
        .sort((a, b) => b.runs7d - a.runs7d)
        .slice(0, 9),
    [],
  );

  const othersRuns = MODELS
    .sort((a, b) => b.runs7d - a.runs7d)
    .slice(9)
    .reduce((s, m) => s + m.runs7d, 0);

  const totalRuns = MODELS.reduce((s, m) => s + m.runs7d, 0);

  return (
    <div className="rounded-xl border border-white/[0.06] bg-dark-surface">
      <div className="border-b border-white/[0.06] px-5 py-3">
        <h3 className="text-sm font-medium text-white/60">Top Pipelines</h3>
        <p className="text-[11px] text-white/40">By request volume (last 3 months)</p>
      </div>

      {/* Column headers */}
      <div className="flex items-center gap-3 border-b border-white/[0.06] px-5 py-2">
        <span className="w-5" />
        <span className="w-7" />
        <span className="min-w-0 flex-1 text-[11px] font-medium uppercase tracking-wider text-white/30">Pipeline</span>
        <span className="hidden w-12 shrink-0 text-right text-[11px] font-medium uppercase tracking-wider text-white/30 sm:block">Share</span>
        <span className="w-16 shrink-0 text-right text-[11px] font-medium uppercase tracking-wider text-white/30">Requests</span>
      </div>

      <div className="divide-y divide-white/[0.04]">
        {sorted.map((model, i) => {
          const Icon = getModelIcon(model.category);
          const color = API_COLORS[i % API_COLORS.length];
          const pct = ((model.runs7d / totalRuns) * 100).toFixed(1);
          return (
            <Link
              key={model.id}
              href={`/dashboard/models/${model.id}`}
              className="group flex items-center gap-3 px-5 py-3 transition-colors hover:bg-white/[0.03]"
            >
              <span className="w-5 text-right font-mono text-[11px] text-white/25">
                {i + 1}
              </span>
              <div
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
                style={{ backgroundColor: `${color}15` }}
              >
                <Icon className="h-3.5 w-3.5" style={{ color }} />
              </div>
              <p className="min-w-0 flex-1 truncate text-sm text-white/80 group-hover:text-white transition-colors">
                {model.name}
              </p>
              <span className="hidden w-12 shrink-0 text-right font-mono text-[11px] text-white/50 sm:block">
                {pct}%
              </span>
              <span className="w-16 shrink-0 text-right font-mono text-xs text-white/70">
                {formatRuns(model.runs7d)}
              </span>
            </Link>
          );
        })}
        {othersRuns > 0 && (
          <div className="flex items-center gap-3 px-5 py-3">
            <span className="w-5 text-right font-mono text-[11px] text-white/40">+</span>
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white/[0.04]">
              <span className="text-xs text-white/40">...</span>
            </div>
            <p className="min-w-0 flex-1 text-sm text-white/60">Others</p>
            <span className="hidden w-12 shrink-0 text-right font-mono text-[11px] text-white/40 sm:block">
              {((othersRuns / totalRuns) * 100).toFixed(1)}%
            </span>
            <span className="w-16 shrink-0 text-right font-mono text-xs text-white/60">
              {formatRuns(othersRuns)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main ───

export default function OverviewTab() {
  const [period, setPeriod] = useState<Period>("3m");
  const chartData = useMemo(() => filterByPeriod(API_REQUEST_SERIES, period), [period]);
  const xTicks = useMemo(() => computeAxisTicks(chartData, "date", 6), [chartData]);

  // Compute total requests from chart data
  const totalRequests = useMemo(() => {
    let sum = 0;
    for (const row of chartData) {
      for (const key of Object.keys(row)) {
        if (key !== "date" && typeof row[key] === "number") sum += row[key] as number;
      }
    }
    return sum;
  }, [chartData]);

  return (
    <div className="flex flex-1 flex-col gap-6 p-5 lg:p-6">
      {/* Header — hidden on mobile (dropdown nav already identifies the section) */}
      <div className="hidden lg:block">
        <h2 className="text-lg font-semibold text-white">Network Stats</h2>
        <p className="mt-1 text-sm text-white/60">
          Network-wide request volumes, top APIs, and growth metrics for the Livepeer AI inference network.
        </p>
      </div>
      <p className="text-sm text-white/60 lg:hidden">
        Network-wide request volumes, top APIs, and growth metrics for the Livepeer AI inference network.
      </p>

      {/* KPI cards — 4 metrics fit 2×2 on mobile, 2×2 at sm, 1×4 on desktop */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {OVERVIEW_KPI.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </div>

      {/* Total Requests section */}
      <div className="rounded-xl border border-white/[0.06] bg-dark-surface p-5">
        <div className="mb-1 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-wider text-white/40">
              Total Requests
            </p>
            <p className="mt-1 font-mono text-3xl font-bold text-white">
              {(totalRequests / 1_000_000).toFixed(1)}M
            </p>
          </div>
          <PeriodToggle value={period} onChange={setPeriod} options={PERIOD_OPTIONS} />
        </div>
        <p className="mt-1 text-sm text-white/60">
          Total inference requests across all APIs on the network.
        </p>

        <div className="mt-4">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} barCategoryGap="15%">
              <XAxis
                dataKey="date"
                tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: string) => v.slice(5)}
                ticks={xTicks}
                interval={0}
                padding={{ left: 8, right: 8 }}
              />
              <YAxis hide />
              <Tooltip content={<StackedChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
              {TOP_APIS.map((api, i) => (
                <Bar
                  key={api}
                  dataKey={api}
                  stackId="requests"
                  fill={API_COLORS[i]}
                  radius={i === TOP_APIS.length - 1 ? [2, 2, 0, 0] : [0, 0, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="mt-3 flex flex-wrap gap-3">
          {TOP_APIS.map((api, i) => (
            <div key={api} className="flex items-center gap-1.5">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: API_COLORS[i] }}
              />
              <span className="text-[11px] text-white/50">{api}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Pipelines grid */}
      <TopPipelinesGrid />
    </div>
  );
}
