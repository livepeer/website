"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Server,
} from "lucide-react";
import { MODELS, NETWORK_STATS, USAGE_HISTORY } from "@/lib/studio/mock-data";
import { formatRuns, getModelIcon } from "@/lib/studio/utils";
import Link from "next/link";

// ─── Stat Card ───

function StatCard({
  stat,
}: {
  stat: { label: string; value: string; delta?: string; trend: "up" | "down" | "flat" };
}) {
  const TrendIcon =
    stat.trend === "up"
      ? TrendingUp
      : stat.trend === "down"
        ? TrendingDown
        : Minus;

  const trendColor =
    stat.trend === "up"
      ? "text-green-bright"
      : stat.trend === "down"
        ? "text-red-400"
        : "text-white/50";

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
      <p className="text-[11px] text-white/50">{stat.label}</p>
      <p className="mt-1 font-mono text-2xl font-semibold text-white">
        {stat.value}
      </p>
      {stat.delta && (
        <div className={`mt-1 flex items-center gap-1 text-xs ${trendColor}`}>
          <TrendIcon className="h-3 w-3" />
          {stat.delta}
        </div>
      )}
    </div>
  );
}

// ─── Requests Chart ───

function RequestsChart() {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-medium text-white/60">
          Network Requests (30D)
        </h3>
        <span className="text-xs text-white/50">All pipelines</span>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={USAGE_HISTORY}>
          <defs>
            <linearGradient id="requestsFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#40bf86" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#40bf86" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: string) => v.slice(5)}
            interval={6}
          />
          <YAxis hide />
          <Tooltip
            contentStyle={{
              background: "var(--color-dark-card)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "8px",
              fontSize: "12px",
              color: "rgba(255,255,255,0.6)",
            }}
            labelStyle={{ color: "rgba(255,255,255,0.4)" }}
          />
          <Area
            type="monotone"
            dataKey="requests"
            stroke="#40bf86"
            strokeWidth={2}
            fill="url(#requestsFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Model Leaderboard ───

function ModelLeaderboard() {
  const sorted = useMemo(
    () =>
      [...MODELS]
        .filter((m) => !m.managed)
        .sort((a, b) => b.runs7d - a.runs7d)
        .slice(0, 10),
    [],
  );

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02]">
      <div className="border-b border-white/[0.06] px-5 py-3">
        <h3 className="text-sm font-medium text-white/60">
          Top Models by Volume
        </h3>
      </div>
      <div className="divide-y divide-white/[0.04]">
        {sorted.map((model, i) => {
          const Icon = getModelIcon(model.category);
          return (
            <Link
              key={model.id}
              href={`/studio/models/${model.id}`}
              className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-white/[0.02]"
            >
              <span className="w-5 text-right font-mono text-[10px] text-white/40">
                {i + 1}
              </span>
              <Icon className="h-4 w-4 text-white/40" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white/70 truncate">{model.name}</p>
                <p className="text-[10px] text-white/40">{model.provider}</p>
              </div>
              <span className="rounded-full bg-white/[0.04] px-2 py-0.5 text-[10px] text-white/50">
                {model.category}
              </span>
              <span className="w-16 text-right font-mono text-xs text-white/40">
                {formatRuns(model.runs7d)}
              </span>
              <span className="w-12 text-right font-mono text-xs text-white/50">
                {model.latency}ms
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// ─── GPU Regions ───

function GpuRegions() {
  const regions = [
    { name: "NA-East", orchestrators: 42, utilization: 72, latency: 28 },
    { name: "NA-West", orchestrators: 28, utilization: 65, latency: 32 },
    { name: "EU-West", orchestrators: 35, utilization: 78, latency: 45 },
    { name: "EU-Central", orchestrators: 18, utilization: 58, latency: 52 },
    { name: "Asia-Pacific", orchestrators: 14, utilization: 45, latency: 85 },
    { name: "Asia-East", orchestrators: 5, utilization: 82, latency: 110 },
  ];

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02]">
      <div className="border-b border-white/[0.06] px-5 py-3">
        <h3 className="text-sm font-medium text-white/60">
          GPU Regions
        </h3>
      </div>
      <div className="divide-y divide-white/[0.04]">
        {regions.map((region) => (
          <div
            key={region.name}
            className="flex items-center gap-4 px-5 py-3"
          >
            <div className="flex-1">
              <p className="text-sm text-white/60">{region.name}</p>
            </div>
            <div className="flex items-center gap-1 text-xs text-white/50">
              <Server className="h-3 w-3" />
              {region.orchestrators}
            </div>
            <div className="w-24">
              <div className="h-1.5 rounded-full bg-white/[0.06]">
                <div
                  className="h-1.5 rounded-full bg-green-bright/50 transition-all"
                  style={{ width: `${region.utilization}%` }}
                />
              </div>
              <p className="mt-0.5 text-right text-[10px] text-white/40">
                {region.utilization}% util
              </p>
            </div>
            <span className="w-14 text-right font-mono text-xs text-white/40">
              {region.latency}ms
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main ───

export default function StatisticsTab() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-5">
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {NETWORK_STATS.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </div>

      {/* Requests chart */}
      <RequestsChart />

      {/* Two-column: leaderboard + regions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ModelLeaderboard />
        <GpuRegions />
      </div>
    </div>
  );
}
