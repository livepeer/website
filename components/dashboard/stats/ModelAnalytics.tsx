"use client";

import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import StatCard from "@/components/dashboard/statistics/StatCard";
import PeriodToggle from "@/components/dashboard/statistics/PeriodToggle";
import {
  SimpleChartTooltip,
  StackedChartTooltip,
} from "@/components/dashboard/statistics/ChartTooltip";
import { generateModelStats, type StatsPeriod } from "@/lib/dashboard/model-stats";
import { computeAxisTicks } from "@/lib/dashboard/utils";
import type { Model, NetworkStat } from "@/lib/dashboard/types";

const PERIOD_OPTIONS: { key: StatsPeriod; label: string }[] = [
  { key: "24h", label: "24H" },
  { key: "7d", label: "7D" },
  { key: "30d", label: "30D" },
];

const LATENCY_COLORS = {
  p50: "#40bf86",
  p90: "#25abd0",
  p99: "#e5a536",
};

function formatRequestCount(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}k`;
  return v.toString();
}

export default function ModelAnalytics({ model }: { model: Model }) {
  const [period, setPeriod] = useState<StatsPeriod>("7d");
  const stats = useMemo(() => generateModelStats(model, period), [model, period]);
  const requestsTicks = useMemo(
    () => computeAxisTicks(stats.requests, "label", 6),
    [stats.requests],
  );
  const latencyTicks = useMemo(
    () => computeAxisTicks(stats.latency, "label", 6),
    [stats.latency],
  );

  const kpiCards: NetworkStat[] = [
    {
      label: stats.kpis.latencyLabel,
      value: stats.kpis.latencyValue,
      delta: stats.kpis.latencyDelta,
      trend: stats.kpis.latencyTrend,
    },
    {
      label: stats.kpis.throughputLabel,
      value: stats.kpis.throughputValue,
      delta: stats.kpis.throughputDelta,
      trend: stats.kpis.throughputTrend,
    },
    {
      label: "Orchestrators",
      value: stats.kpis.orchestrators.toString(),
      delta: stats.kpis.orchestratorsDelta,
      trend: stats.kpis.orchestratorsTrend,
    },
    {
      label: "Uptime",
      value: stats.kpis.uptime,
      delta: stats.kpis.uptimeDelta,
      trend: stats.kpis.uptimeTrend,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-white/60">Analytics</h3>
          <p className="mt-1 text-sm text-white/60">
            Performance, supply, and reliability for {model.name} on the network.
          </p>
        </div>
        <PeriodToggle value={period} onChange={setPeriod} options={PERIOD_OPTIONS} />
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {kpiCards.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </div>

      {/* Request volume */}
      <div className="rounded-xl border border-white/[0.06] bg-dark-surface p-5">
        <div>
          <h4 className="text-sm font-medium text-white/60">Request volume</h4>
          <p className="mt-1 text-sm text-white/60">
            Inference requests routed to {model.name} over the selected period.
          </p>
        </div>
        <div className="mt-4">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={stats.requests} barCategoryGap="15%">
              <XAxis
                dataKey="label"
                tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                ticks={requestsTicks}
                interval={0}
                padding={{ right: 8 }}
              />
              <YAxis
                tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                width={44}
                tickFormatter={formatRequestCount}
              />
              <Tooltip
                content={
                  <SimpleChartTooltip
                    formatValue={(v) => `${v.toLocaleString()} req`}
                  />
                }
                cursor={{ fill: "rgba(255,255,255,0.03)" }}
              />
              <Bar dataKey="value" fill="#40bf86" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Latency trend */}
      <div className="rounded-xl border border-white/[0.06] bg-dark-surface p-5">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="text-sm font-medium text-white/60">Latency trend</h4>
            <p className="mt-1 text-sm text-white/60">
              P50, P90, and P99 across the selected period.
            </p>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-white/50">
            {(["p50", "p90", "p99"] as const).map((key) => (
              <span key={key} className="flex items-center gap-1.5">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: LATENCY_COLORS[key] }}
                />
                {key.toUpperCase()}
              </span>
            ))}
          </div>
        </div>
        <div className="mt-4">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={stats.latency}>
              <XAxis
                dataKey="label"
                tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                ticks={latencyTicks}
                interval={0}
                padding={{ right: 8 }}
              />
              <YAxis
                tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                width={44}
                tickFormatter={(v) => `${v}ms`}
              />
              <Tooltip
                content={<StackedChartTooltip />}
                cursor={{ stroke: "rgba(255,255,255,0.08)" }}
              />
              <Line
                type="monotone"
                dataKey="p50"
                name="P50"
                stroke={LATENCY_COLORS.p50}
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="p90"
                name="P90"
                stroke={LATENCY_COLORS.p90}
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="p99"
                name="P99"
                stroke={LATENCY_COLORS.p99}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Regional supply */}
      <div className="rounded-xl border border-white/[0.06] bg-dark-surface p-5">
        <div>
          <h4 className="text-sm font-medium text-white/60">Regional supply</h4>
          <p className="mt-1 text-sm text-white/60">
            Orchestrators serving {model.name}, ranked by traffic share.
          </p>
        </div>
        <div className="mt-5 space-y-3">
          {stats.regions.map((region) => (
            <div key={region.region}>
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/70">{region.region}</span>
                <div className="flex items-center gap-4 font-mono text-white/50">
                  <span>{region.orchestrators} orch</span>
                  <span>{region.latency}ms</span>
                  <span className="w-10 text-right text-white/80">
                    {(region.share * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/[0.04]">
                <div
                  className="h-full rounded-full bg-green-bright/60"
                  style={{ width: `${region.share * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Uptime strip */}
      <div className="rounded-xl border border-white/[0.06] bg-dark-surface p-5">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-white/60">Uptime (90 days)</h4>
            <p className="mt-1 text-sm text-white/60">
              Daily reachability across all orchestrators.
            </p>
          </div>
          <span className="font-mono text-sm text-white/80">
            {stats.kpis.uptime}
          </span>
        </div>
        <div className="mt-4 flex flex-wrap gap-[2px]">
          {stats.uptimeGrid.map((status, i) => (
            <div
              key={i}
              className={`h-2.5 w-2.5 rounded-[2px] ${
                status === "up" ? "bg-green-bright/40" : "bg-red-500/50"
              }`}
              title={`Day ${90 - i}: ${status}`}
            />
          ))}
        </div>
        <div className="mt-3 flex items-center gap-3 text-[10px] text-white/40">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-[2px] bg-green-bright/40" /> Up
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-[2px] bg-red-500/50" /> Down
          </span>
        </div>
      </div>
    </div>
  );
}
