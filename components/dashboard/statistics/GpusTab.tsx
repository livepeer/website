"use client";

import { useState, useMemo, useRef, useLayoutEffect, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp } from "lucide-react";
import StatCard from "./StatCard";
import { StackedChartTooltip, SimpleChartTooltip } from "./ChartTooltip";
import { GPU_NODES, GPU_GROWTH } from "@/lib/dashboard/mock-data";
import { computeAxisTicks } from "@/lib/dashboard/utils";
import type { NetworkStat } from "@/lib/dashboard/types";

// ─── Constants ───

const GPU_COLORS = [
  "#40bf86", "#25abd0", "#e5a536", "#d94f70",
  "#8b5cf6", "#06b6d4", "#f59e0b", "#ec4899",
  "#84cc16", "#a855f7",
];

// Short label for bar segments — the unique model identifier
function gpuShortName(name: string): string {
  // Extract the most recognizable short identifier
  const n = name.replace("NVIDIA ", "");
  if (n.startsWith("H100")) return "H100";
  if (n.startsWith("A100")) return "A100";
  if (n.startsWith("A10G")) return "A10G";
  if (n.includes("A6000")) return "A6000";
  if (n.includes("6000")) return "6000";
  if (n.includes("4090")) return "4090";
  if (n.includes("3090")) return "3090";
  if (n.startsWith("L40")) return "L40";
  if (n.startsWith("L4")) return "L4";
  return n.split(" ")[0];
}

// Sorted by count descending, "Other" always last
const GPU_TYPE_KEYS = (() => {
  const latest = GPU_GROWTH[GPU_GROWTH.length - 1];
  if (!latest?.byType) return ["H100", "A100", "A6000", "RTX 4090", "L40", "Other"];
  return Object.entries(latest.byType)
    .filter(([k]) => k !== "Other")
    .sort(([, a], [, b]) => b - a)
    .map(([k]) => k)
    .concat("Other");
})();

// ─── Main ───

export default function GpusTab() {
  const [chartMode, setChartMode] = useState<"total" | "byType">("total");

  const barRef = useRef<HTMLDivElement>(null);
  const segmentRefs = useRef<(HTMLDivElement | null)[]>([]);
  const tooltipRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [tooltipShifts, setTooltipShifts] = useState<number[]>([]);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // Close popover when tapping outside the bar (mobile tap-to-reveal)
  useEffect(() => {
    if (openIndex === null) return;
    const handleClick = (e: MouseEvent) => {
      if (!barRef.current?.contains(e.target as Node)) {
        setOpenIndex(null);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenIndex(null);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [openIndex]);

  const totalGpus = useMemo(() => GPU_NODES.reduce((s, n) => s + n.count, 0), []);
  const totalVram = useMemo(() => {
    // Extract numeric GB from memory strings like "141 GB HBM3e"
    return GPU_NODES.reduce((s, n) => {
      const gb = parseFloat(n.memory);
      return s + (isNaN(gb) ? 0 : gb * n.count);
    }, 0);
  }, []);
  const gpuGrowthTicks = useMemo(() => computeAxisTicks(GPU_GROWTH, "date", 6), []);
  const latestGrowth = GPU_GROWTH[GPU_GROWTH.length - 1];
  const earliestGrowth = GPU_GROWTH[0];
  const growthPct = (
    ((latestGrowth.total - earliestGrowth.total) / earliestGrowth.total) * 100
  ).toFixed(1);

  const kpi: NetworkStat[] = useMemo(() => [
    { label: "Total GPUs", value: totalGpus.toLocaleString(), delta: `+${growthPct}%`, trend: "up" as const },
    { label: "GPU Types", value: `${GPU_NODES.length}`, trend: "flat" as const },
    { label: "Total VRAM", value: `${(totalVram / 1000).toFixed(0)} TB`, trend: "flat" as const },
    { label: "90D Growth", value: `${growthPct}%`, delta: `+${latestGrowth.total - earliestGrowth.total}`, trend: "up" as const },
  ], [totalGpus, totalVram, growthPct, latestGrowth.total, earliestGrowth.total]);

  // Compute per-segment tooltip shift so each tooltip stays centered on its
  // segment unless that would clip the bar's left/right edge, in which case
  // shift just enough to remain in view.
  useLayoutEffect(() => {
    const compute = () => {
      const bar = barRef.current;
      if (!bar) return;
      const barRect = bar.getBoundingClientRect();
      const next = GPU_NODES.map((_, i) => {
        const seg = segmentRefs.current[i];
        const tip = tooltipRefs.current[i];
        if (!seg || !tip) return 0;
        const segRect = seg.getBoundingClientRect();
        const tipW = tip.offsetWidth;
        const center = segRect.left + segRect.width / 2;
        const tipLeft = center - tipW / 2;
        const tipRight = center + tipW / 2;
        if (tipLeft < barRect.left) return barRect.left - tipLeft;
        if (tipRight > barRect.right) return barRect.right - tipRight;
        return 0;
      });
      setTooltipShifts((prev) =>
        prev.length === next.length && prev.every((v, i) => v === next[i])
          ? prev
          : next,
      );
    };
    compute();
    const ro = new ResizeObserver(compute);
    if (barRef.current) ro.observe(barRef.current);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="flex flex-1 flex-col gap-6 p-5 lg:p-6">
      {/* Header — hidden on mobile (dropdown nav already identifies the section) */}
      <div className="hidden lg:block">
        <h2 className="text-lg font-semibold text-white">GPUs</h2>
        <p className="mt-1 text-sm text-white/60">
          GPU hardware backing the network — node growth, type distribution, and hardware specifications.
        </p>
      </div>
      <p className="text-sm text-white/60 lg:hidden">
        GPU hardware backing the network — node growth, type distribution, and hardware specifications.
      </p>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {kpi.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </div>

      {/* Growth chart */}
      <div className="rounded-xl border border-white/[0.06] bg-dark-surface p-5">
        <div className="mb-1 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-wider text-white/40">
              GPU Growth
            </p>
            <p className="mt-1 font-mono text-3xl font-bold text-white">
              {latestGrowth.total.toLocaleString()}
            </p>
            <div className="mt-1 flex items-center gap-1 text-xs text-green-bright">
              <TrendingUp className="h-3 w-3" />
              {growthPct}% growth
            </div>
          </div>

          {/* Mode toggle — mirrors the PeriodToggle slot on other cards */}
          <div className="flex shrink-0 rounded-lg bg-white/[0.04] p-0.5">
            <button
              onClick={() => setChartMode("total")}
              className={`rounded-md px-2.5 py-1 text-xs transition-colors ${
                chartMode === "total"
                  ? "bg-white/[0.08] font-medium text-white"
                  : "text-white/50 hover:text-white/70"
              }`}
            >
              Total
            </button>
            <button
              onClick={() => setChartMode("byType")}
              className={`rounded-md px-2.5 py-1 text-xs transition-colors ${
                chartMode === "byType"
                  ? "bg-white/[0.08] font-medium text-white"
                  : "text-white/50 hover:text-white/70"
              }`}
            >
              By Type
            </button>
          </div>
        </div>
        <p className="mt-1 text-sm text-white/60">
          Total GPU count across all nodes over the last 90 days.
        </p>

        <div className="mt-4" />

        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={GPU_GROWTH}>
            <defs>
              <linearGradient id="gpuTotalFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#40bf86" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#40bf86" stopOpacity={0} />
              </linearGradient>
              {chartMode === "byType" &&
                GPU_TYPE_KEYS.map((key, i) => (
                  <linearGradient key={key} id={`gpuFill-${i}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={GPU_COLORS[i]} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={GPU_COLORS[i]} stopOpacity={0.02} />
                  </linearGradient>
                ))}
            </defs>
            <XAxis
              dataKey="date"
              tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: string) => v.slice(5)}
              ticks={gpuGrowthTicks}
              interval={0}
              padding={{ left: 8, right: 8 }}
            />
            <YAxis hide />
            {chartMode === "total" ? (
              <>
                <Tooltip content={<SimpleChartTooltip formatValue={(v) => `${v.toLocaleString()} GPUs`} />} />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#40bf86"
                  strokeWidth={2}
                  fill="url(#gpuTotalFill)"
                />
              </>
            ) : (
              <>
                <Tooltip content={<StackedChartTooltip />} />
                {GPU_TYPE_KEYS.map((key, i) => (
                  <Area
                    key={key}
                    type="monotone"
                    dataKey={`byType.${key}`}
                    name={key}
                    stackId="gpu"
                    stroke={GPU_COLORS[i]}
                    strokeWidth={1}
                    fill={`url(#gpuFill-${i})`}
                  />
                ))}
              </>
            )}
          </AreaChart>
        </ResponsiveContainer>

        {/* Legend — only renders when By Type is active (no reserved slot) */}
        {chartMode === "byType" && (
          <div className="mt-3 flex flex-wrap gap-3">
            {GPU_TYPE_KEYS.map((key, i) => (
              <div key={key} className="flex items-center gap-1.5">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: GPU_COLORS[i] }}
                />
                <span className="text-[11px] text-white/50">{key}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* GPU Inventory — mix bar + table in one card */}
      <div className="overflow-x-clip rounded-xl border border-white/[0.06] bg-dark-surface">
        <div className="border-b border-white/[0.06] px-5 py-3">
          <h3 className="text-sm font-medium text-white/60">GPU Inventory</h3>
          <p className="text-[11px] text-white/40">
            Current GPU types on the network with hardware specifications
          </p>
        </div>

        {/* GPU Mix bar — inline above table */}
        <div className="relative border-b border-white/[0.06] px-5 py-4">
          <div ref={barRef} className="flex h-10 gap-[1px] rounded-lg">
            {GPU_NODES.map((node, i) => {
              const pct = (node.count / totalGpus) * 100;
              const isFirst = i === 0;
              const isLast = i === GPU_NODES.length - 1;
              const shift = tooltipShifts[i] ?? 0;
              const isOpen = openIndex === i;
              return (
                <div
                  key={node.name}
                  ref={(el) => {
                    segmentRefs.current[i] = el;
                  }}
                  role="button"
                  tabIndex={0}
                  aria-expanded={isOpen}
                  aria-label={`${node.name}: ${node.count} GPUs, ${pct.toFixed(1)}%`}
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setOpenIndex(isOpen ? null : i);
                    }
                  }}
                  className={`group relative flex cursor-pointer items-center justify-center transition-opacity hover:opacity-100 ${isOpen ? "opacity-100" : ""}`}
                  style={{
                    width: `${pct}%`,
                    backgroundColor: GPU_COLORS[i % GPU_COLORS.length],
                    opacity: isOpen ? 1 : 0.75,
                    borderRadius: isFirst && isLast ? "0.5rem" : isFirst ? "0.5rem 0 0 0.5rem" : isLast ? "0 0.5rem 0.5rem 0" : undefined,
                  }}
                >
                  {pct > 3 && (
                    <span className="truncate px-0.5 text-[9px] font-medium text-white">
                      {gpuShortName(node.name)}
                    </span>
                  )}
                  {/* Popover — hover on desktop, tap-to-toggle on mobile.
                      Centered on segment, shifted only if it would clip the
                      bar's left/right edge. */}
                  <div
                    ref={(el) => {
                      tooltipRefs.current[i] = el;
                    }}
                    className={`pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 rounded-lg border border-white/[0.08] bg-dark-card px-3 py-2 shadow-xl transition-opacity ${isOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                    style={{
                      transform: `translateX(calc(-50% + ${shift}px))`,
                    }}
                  >
                    <p className="whitespace-nowrap text-xs font-medium text-white">{node.name}</p>
                    <p className="mt-0.5 whitespace-nowrap font-mono text-[11px] text-white/50">
                      {node.count} GPUs · {pct.toFixed(1)}%
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-white/[0.06] px-5 py-2 text-[11px] font-medium uppercase tracking-wider text-white/30">
          <span className="flex-1 pl-[18px]">GPU Name</span>
          <span className="w-14 text-right">Count</span>
          <span className="w-12 text-right">Share</span>
          <span className="hidden w-24 text-right sm:block">Memory</span>
          <span className="hidden w-16 text-right md:block">TFLOPS</span>
          <span className="hidden w-16 text-right lg:block">Power</span>
        </div>

        {/* Rows */}
        <div className="divide-y divide-white/[0.04]">
          {GPU_NODES.map((node, i) => {
            const pct = ((node.count / totalGpus) * 100).toFixed(1);
            return (
              <div key={node.name} className="flex items-center gap-3 px-5 py-3">
                <span className="flex flex-1 items-center gap-2 text-sm text-white/70">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: GPU_COLORS[i % GPU_COLORS.length] }}
                  />
                  <span className="truncate">{node.name}</span>
                </span>
                <span className="w-14 text-right font-mono text-sm font-medium text-white">
                  {node.count}
                </span>
                <span className="w-12 text-right font-mono text-[11px] text-white/30">
                  {pct}%
                </span>
                <span className="hidden w-24 text-right font-mono text-xs text-white/50 sm:block">
                  {node.memory}
                </span>
                <span className="hidden w-16 text-right font-mono text-xs text-white/50 md:block">
                  {node.tflops}
                </span>
                <span className="hidden w-16 text-right font-mono text-xs text-white/50 lg:block">
                  {node.maxPower}
                </span>
              </div>
            );
          })}
        </div>

        {/* Total row */}
        <div className="flex items-center gap-3 border-t border-white/[0.08] bg-white/[0.02] px-5 py-3">
          <span className="flex-1 text-sm font-medium text-white/60">Total</span>
          <span className="w-14 text-right font-mono text-sm font-bold text-white">
            {totalGpus.toLocaleString()}
          </span>
          <span className="w-12 text-right font-mono text-[11px] text-white/30">100%</span>
          <span className="hidden w-24 text-right font-mono text-xs text-white/40 sm:block">
            {(totalVram / 1000).toFixed(0)} TB
          </span>
          <span className="hidden w-16 md:block" />
          <span className="hidden w-16 lg:block" />
        </div>
      </div>
    </div>
  );
}
