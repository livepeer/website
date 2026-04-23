"use client";

import { useState, useMemo } from "react";
import { Search, RefreshCw } from "lucide-react";
import StatCard from "./StatCard";
import { PIPELINE_UTILIZATION, LIVE_JOBS } from "@/lib/dashboard/mock-data";
import type { NetworkStat, PipelineUtilization, LiveJobStatus } from "@/lib/dashboard/types";

// ─── Utilization bar ───

function UtilBar({ pct }: { pct: number }) {
  const color =
    pct >= 80
      ? "bg-green-bright"
      : pct >= 50
        ? "bg-green-bright/60"
        : pct >= 20
          ? "bg-blue-bright/60"
          : "bg-white/20";

  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-24 rounded-full bg-white/[0.06]">
        <div
          className={`h-2 rounded-full ${color} transition-all`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
      <span className="font-mono text-xs text-white/50">{pct}%</span>
    </div>
  );
}

// ─── Status badge ───

function StatusBadge({ status }: { status: PipelineUtilization["status"] | LiveJobStatus }) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    active: { bg: "bg-green-bright/10", text: "text-green-bright", label: "Active" },
    online: { bg: "bg-green-bright/10", text: "text-green-bright", label: "online" },
    degraded: { bg: "bg-yellow-400/10", text: "text-yellow-400", label: "degraded" },
    cold: { bg: "bg-white/[0.06]", text: "text-white/40", label: "Cold" },
    completed: { bg: "bg-white/[0.06]", text: "text-white/40", label: "done" },
  };
  const { bg, text, label } = config[status] || config.cold;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] ${bg} ${text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${status === "online" || status === "active" ? "bg-green-bright" : status === "degraded" ? "bg-yellow-400" : "bg-white/30"}`} />
      {label}
    </span>
  );
}

// ─── Live Job Feed ───

const REFRESH_OPTIONS = ["5s", "15s", "30s", "90s"];

function LiveJobFeed() {
  const [refreshInterval, setRefreshInterval] = useState("30s");
  const activeJobCount = LIVE_JOBS.filter((j) => j.status !== "completed").length;

  return (
    <div className="rounded-xl border border-white/[0.06] bg-dark-surface">
      <div className="border-b border-white/[0.06] px-4 py-3 sm:px-5">
        {/* Row 1: title + LIVE badge */}
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-medium text-white/60">Live Job Feed</h3>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-green-bright/10 px-2.5 py-1 text-[11px] font-medium text-green-bright">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-bright" />
            LIVE
          </span>
        </div>
        {/* Row 2: refresh toggle left, job count right */}
        <div className="mt-2.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1 rounded-lg bg-white/[0.04] p-0.5">
            <RefreshCw className="ml-1.5 h-3 w-3 shrink-0 text-white/30" />
            {REFRESH_OPTIONS.map((opt) => (
              <button
                key={opt}
                onClick={() => setRefreshInterval(opt)}
                className={`shrink-0 rounded-md px-2 py-1 text-[11px] transition-colors ${
                  refreshInterval === opt
                    ? "bg-white/[0.1] font-medium text-white"
                    : "text-white/40 hover:text-white/60"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
          <span className="shrink-0 whitespace-nowrap text-[11px] text-white/40">
            {LIVE_JOBS.length} / {activeJobCount + 9} active
          </span>
        </div>
      </div>

      {/* Column headers — outside scroll, desktop only */}
      <div className="hidden md:block overflow-x-auto">
        <div className="flex min-w-[600px] items-center gap-4 border-b border-white/[0.06] px-5 py-2 text-[11px] font-medium uppercase tracking-wider text-white/30">
          <span className="flex-1">Pipeline</span>
          <span className="w-44">Model</span>
          <span className="w-20 text-right">FPS</span>
          <span className="w-14 text-right">Age</span>
          <span className="w-20">Status</span>
        </div>
      </div>

      {/* Scrollable rows — desktop table, mobile card list */}
      <div className="scrollbar-dark max-h-[360px] overflow-y-auto md:overflow-x-auto">
        <div className="divide-y divide-white/[0.04]">
          {LIVE_JOBS.map((job) => {
            const fps =
              job.fpsIn != null
                ? `${job.fpsIn.toFixed(0)} / ${job.fpsOut?.toFixed(0)}`
                : job.latencyMs != null
                  ? `${job.latencyMs}ms`
                  : "—";
            return (
              <div key={job.id}>
                {/* Desktop row */}
                <div className="hidden md:flex min-w-[600px] items-center gap-4 px-5 py-2.5 transition-colors hover:bg-white/[0.02]">
                  <span className="flex-1 text-sm text-white/70">{job.pipeline}</span>
                  <span className="w-44 truncate font-mono text-xs text-white/50">{job.model}</span>
                  <span className="w-20 text-right font-mono text-xs text-white/50">{fps}</span>
                  <span className="w-14 text-right font-mono text-[11px] text-white/40">{job.age}</span>
                  <span className="w-20">
                    <StatusBadge status={job.status} />
                  </span>
                </div>
                {/* Mobile card */}
                <div className="flex flex-col gap-1.5 px-4 py-3 transition-colors hover:bg-white/[0.02] md:hidden">
                  <div className="flex items-start justify-between gap-3">
                    <span className="min-w-0 flex-1 truncate text-sm text-white/80">
                      {job.pipeline}
                    </span>
                    <StatusBadge status={job.status} />
                  </div>
                  <div className="truncate font-mono text-[11px] text-white/40">
                    {job.model}
                  </div>
                  <div className="flex items-center gap-4 font-mono text-[11px] text-white/50">
                    <span>FPS {fps}</span>
                    <span className="text-white/30">·</span>
                    <span>Age {job.age}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Main ───

const PIPELINE_PAGE_SIZE = 5;

export default function UtilizationTab() {
  const [search, setSearch] = useState("");
  const [pipelinePage, setPipelinePage] = useState(0);

  const kpi: NetworkStat[] = useMemo(() => {
    const active = PIPELINE_UTILIZATION.filter((p) => p.status !== "cold");
    const totalWarm = PIPELINE_UTILIZATION.reduce((s, p) => s + p.warmOrchestrators, 0);

    return [
      { label: "Active Jobs", value: "24", delta: "+3", trend: "up" as const },
      { label: "Active Pipelines", value: `${active.length}`, trend: "flat" as const },
      { label: "Warm Capabilities", value: `${totalWarm}`, delta: "+12", trend: "up" as const },
      { label: "Requests (1h)", value: "4,280", delta: "+340", trend: "up" as const },
    ];
  }, []);

  const filteredPipelines = useMemo(() => {
    if (!search) return PIPELINE_UTILIZATION;
    const q = search.toLowerCase();
    return PIPELINE_UTILIZATION.filter((p) => p.name.toLowerCase().includes(q));
  }, [search]);

  const pipelineTotalPages = Math.ceil(filteredPipelines.length / PIPELINE_PAGE_SIZE);
  const pipelinePageItems = filteredPipelines.slice(
    pipelinePage * PIPELINE_PAGE_SIZE,
    (pipelinePage + 1) * PIPELINE_PAGE_SIZE,
  );

  return (
    <div className="flex flex-1 flex-col gap-6 p-5 lg:p-6">
      {/* Header — hidden on mobile (dropdown nav already identifies the section) */}
      <div className="hidden lg:block">
        <h2 className="text-lg font-semibold text-white">Utilization</h2>
        <p className="mt-1 text-sm text-white/60">
          Real-time network activity and pipeline capacity across the Livepeer AI inference network.
        </p>
      </div>
      <p className="text-sm text-white/60 lg:hidden">
        Real-time network activity and pipeline capacity across the Livepeer AI inference network.
      </p>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {kpi.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </div>

      {/* Live Jobs */}
      <LiveJobFeed />

      {/* Pipelines */}
      <div className="rounded-xl border border-white/[0.06] bg-dark-surface">
        <div className="border-b border-white/[0.06] px-4 py-3 sm:px-5">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-sm font-medium text-white/60">Pipelines</h3>
            <p className="shrink-0 text-[11px] text-white/40">
              {filteredPipelines.length} active · {PIPELINE_UTILIZATION.filter((p) => p.status !== "cold").length} warm · {Math.round(
                PIPELINE_UTILIZATION.filter((p) => p.status !== "cold").reduce((s, p) => s + p.utilizationPct, 0) /
                  PIPELINE_UTILIZATION.filter((p) => p.status !== "cold").length,
              )}% avg
            </p>
          </div>
          <div className="relative mt-2.5">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPipelinePage(0); }}
              placeholder="Search pipelines..."
              className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] py-1.5 pl-9 pr-3 text-xs text-white placeholder:text-white/30 focus:border-white/20 focus:outline-none"
            />
          </div>
        </div>

        {/* Column headers — outside scroll, desktop only */}
        <div className="hidden md:block overflow-x-auto">
          <div className="flex min-w-[700px] items-center gap-4 border-b border-white/[0.06] px-5 py-2 text-[11px] font-medium uppercase tracking-wider text-white/30">
            <span className="flex-1">Pipeline</span>
            <span className="w-16 text-right">Warm</span>
            <span className="w-16 text-right">Capacity</span>
            <span className="w-32">Utilization</span>
            <span className="w-20 text-right">Latency</span>
            <span className="w-20 text-right">Price</span>
            <span className="w-20">Status</span>
          </div>
        </div>

        {/* Paginated rows — desktop table, mobile card list */}
        <div className="md:overflow-x-auto">
          <div className="divide-y divide-white/[0.04]">
            {pipelinePageItems.map((p) => (
              <div key={p.id}>
                {/* Desktop row */}
                <div className="hidden md:flex min-w-[700px] items-center gap-4 px-5 py-3 transition-colors hover:bg-white/[0.02]">
                  <span className="flex-1 text-sm text-white/70">{p.name}</span>
                  <span className="w-16 text-right font-mono text-xs text-green-bright">
                    {p.warmOrchestrators}
                  </span>
                  <span className="w-16 text-right font-mono text-xs text-white/50">
                    {p.totalCapacity}
                  </span>
                  <span className="w-32">
                    <UtilBar pct={p.utilizationPct} />
                  </span>
                  <span className="w-20 text-right font-mono text-xs text-white/50">
                    {p.avgLatencyMs > 0 ? `${p.avgLatencyMs}ms` : "—"}
                  </span>
                  <span className="w-20 text-right font-mono text-xs text-white/50">
                    ${p.price}{p.priceUnit}
                  </span>
                  <span className="w-20">
                    <StatusBadge status={p.status} />
                  </span>
                </div>
                {/* Mobile card */}
                <div className="flex flex-col gap-2 px-4 py-3 transition-colors hover:bg-white/[0.02] md:hidden">
                  <div className="flex items-start justify-between gap-3">
                    <span className="min-w-0 flex-1 truncate text-sm text-white/80">
                      {p.name}
                    </span>
                    <StatusBadge status={p.status} />
                  </div>
                  <UtilBar pct={p.utilizationPct} />
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-[11px] text-white/50">
                    <span>
                      <span className="text-white/30">Warm </span>
                      <span className="text-green-bright">{p.warmOrchestrators}</span>
                      <span className="text-white/30"> / {p.totalCapacity}</span>
                    </span>
                    <span>
                      <span className="text-white/30">Latency </span>
                      {p.avgLatencyMs > 0 ? `${p.avgLatencyMs}ms` : "—"}
                    </span>
                    <span>
                      <span className="text-white/30">Price </span>${p.price}
                      {p.priceUnit}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pagination */}
        {pipelineTotalPages > 1 && (
          <div className="flex items-center justify-between border-t border-white/[0.06] px-5 py-2.5">
            <span className="text-xs text-white/50">
              {pipelinePage * PIPELINE_PAGE_SIZE + 1}–
              {Math.min((pipelinePage + 1) * PIPELINE_PAGE_SIZE, filteredPipelines.length)} of{" "}
              {filteredPipelines.length} pipelines
            </span>
            <div className="flex gap-1.5">
              <button
                onClick={() => setPipelinePage(Math.max(0, pipelinePage - 1))}
                disabled={pipelinePage === 0}
                className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-white/70 transition-colors hover:border-white/20 hover:bg-white/[0.05] hover:text-white disabled:opacity-30 disabled:hover:border-white/[0.08] disabled:hover:bg-white/[0.03]"
              >
                Prev
              </button>
              <button
                onClick={() => setPipelinePage(Math.min(pipelineTotalPages - 1, pipelinePage + 1))}
                disabled={pipelinePage >= pipelineTotalPages - 1}
                className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-white/70 transition-colors hover:border-white/20 hover:bg-white/[0.05] hover:text-white disabled:opacity-30 disabled:hover:border-white/[0.08] disabled:hover:bg-white/[0.03]"
              >
                Next
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
