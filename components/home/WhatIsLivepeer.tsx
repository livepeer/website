"use client";

import { motion } from "framer-motion";
import Container from "@/components/ui/Container";
import SectionHeader from "@/components/ui/SectionHeader";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const workloads = [
  {
    pipeline: "Real-time Object Detection",
    model: "YOLOv8",
    status: "running" as const,
    gpu: "A100",
    latency: "12ms",
    utilization: 78,
  },
  {
    pipeline: "Live Stream Upscaling",
    model: "ESRGAN",
    status: "running" as const,
    gpu: "H100",
    latency: "45ms",
    utilization: 62,
  },
  {
    pipeline: "Speech-to-Text",
    model: "Whisper v3",
    status: "running" as const,
    gpu: "A100",
    latency: "180ms",
    utilization: 45,
  },
  {
    pipeline: "Scene Classification",
    model: "CLIP",
    status: "queued" as const,
    gpu: "—",
    latency: "—",
    utilization: 0,
  },
  {
    pipeline: "Video Generation",
    model: "Stable Video",
    status: "completed" as const,
    gpu: "H100",
    latency: "2.1s",
    utilization: 0,
  },
];

const sidebarItems = [
  { label: "Overview", icon: "grid", active: false },
  { label: "Workloads", icon: "layers", active: true },
  { label: "Pipelines", icon: "git", active: false },
  { label: "Network", icon: "globe", active: false },
  { label: "Logs", icon: "terminal", active: false },
];

const stats = [
  { label: "Active GPUs", value: "247", sub: "across 18 regions" },
  { label: "Avg Latency", value: "23ms", sub: "p95: 48ms" },
  { label: "Cost", value: "$0.004", sub: "per minute" },
];

function StatusBadge({ status }: { status: "running" | "queued" | "completed" }) {
  if (status === "running")
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-400">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
        Running
      </span>
    );
  if (status === "queued")
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-medium text-amber-400">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
        Queued
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-0.5 text-[11px] font-medium text-white/40">
      <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none">
        <path d="M3 6l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Completed
    </span>
  );
}

function SidebarIcon({ icon }: { icon: string }) {
  if (icon === "grid")
    return (
      <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
        <rect x="1.5" y="1.5" width="5" height="5" rx="1" />
        <rect x="9.5" y="1.5" width="5" height="5" rx="1" />
        <rect x="1.5" y="9.5" width="5" height="5" rx="1" />
        <rect x="9.5" y="9.5" width="5" height="5" rx="1" />
      </svg>
    );
  if (icon === "layers")
    return (
      <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
        <path d="M8 1.5L1.5 5 8 8.5 14.5 5z" />
        <path d="M1.5 8L8 11.5 14.5 8" />
        <path d="M1.5 11L8 14.5 14.5 11" />
      </svg>
    );
  if (icon === "git")
    return (
      <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
        <circle cx="4" cy="4" r="2" />
        <circle cx="12" cy="4" r="2" />
        <circle cx="4" cy="12" r="2" />
        <path d="M4 6v4M6 4h4" />
      </svg>
    );
  if (icon === "globe")
    return (
      <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
        <circle cx="8" cy="8" r="6.5" />
        <path d="M1.5 8h13M8 1.5c-2.5 2.5-2.5 10 0 13M8 1.5c2.5 2.5 2.5 10 0 13" />
      </svg>
    );
  return (
    <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
      <rect x="2" y="2.5" width="12" height="11" rx="1.5" />
      <path d="M5 6h1M5 8.5h6M5 11h4" />
    </svg>
  );
}

function UtilBar({ pct }: { pct: number }) {
  return (
    <div className="h-1 w-12 rounded-full bg-white/5">
      <div
        className="h-full rounded-full bg-emerald-500/50"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function ProductUI() {
  return (
    <div className="relative">
      {/* Glow effect behind the frame */}
      <div
        className="pointer-events-none absolute -inset-8 rounded-3xl opacity-40 blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse at 50% 40%, rgba(24,121,78,0.25), transparent 70%)",
        }}
      />

      {/* Browser frame */}
      <div className="relative overflow-hidden rounded-xl border border-white/[0.08] bg-[#0c0c0c] shadow-2xl shadow-black/50">
        {/* Title bar */}
        <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3">
          <div className="flex items-center gap-1.5">
            <div className="h-[10px] w-[10px] rounded-full bg-white/10" />
            <div className="h-[10px] w-[10px] rounded-full bg-white/10" />
            <div className="h-[10px] w-[10px] rounded-full bg-white/10" />
          </div>
          <div className="ml-3 flex items-center gap-2 rounded-md bg-white/[0.04] px-3 py-1">
            <svg className="h-3 w-3 text-white/20" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="6" cy="6" r="5" />
              <path d="M6 3v3l2 1" strokeLinecap="round" />
            </svg>
            <span className="text-[11px] text-white/30">AI Gateway</span>
          </div>
        </div>

        {/* App body */}
        <div className="flex min-h-[360px]">
          {/* Sidebar */}
          <div className="hidden w-[170px] flex-shrink-0 border-r border-white/[0.06] px-2 py-3 sm:block">
            <div className="mb-4 px-3">
              <div className="text-[11px] font-medium tracking-wider text-white/20 uppercase">
                Workspace
              </div>
            </div>
            {sidebarItems.map((item) => (
              <div
                key={item.label}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] ${
                  item.active
                    ? "bg-white/[0.06] text-white font-medium"
                    : "text-white/35 hover:text-white/50"
                }`}
              >
                <SidebarIcon icon={item.icon} />
                {item.label}
              </div>
            ))}
          </div>

          {/* Main content */}
          <div className="flex-1 p-4 sm:p-5">
            {/* Header row */}
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-[15px] font-semibold text-white/90">
                  Workloads
                </h3>
                <p className="mt-0.5 text-[11px] text-white/30">
                  5 pipelines &middot; 3 active
                </p>
              </div>
              <button className="rounded-lg bg-white/[0.06] px-3 py-1.5 text-[12px] font-medium text-white/60 transition-colors hover:bg-white/10">
                + New Pipeline
              </button>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-lg border border-white/[0.06]">
              {/* Table header */}
              <div className="grid grid-cols-[1fr_80px_90px_50px_50px_50px] items-center gap-2 border-b border-white/[0.06] bg-white/[0.02] px-4 py-2 text-[11px] font-medium tracking-wide text-white/25 uppercase sm:grid-cols-[1fr_100px_90px_60px_60px_60px]">
                <span>Pipeline</span>
                <span>Model</span>
                <span>Status</span>
                <span className="hidden sm:block">GPU</span>
                <span className="hidden sm:block">Latency</span>
                <span className="hidden sm:block">Util</span>
              </div>

              {/* Table rows */}
              {workloads.map((w, i) => (
                <div
                  key={w.pipeline}
                  className={`grid grid-cols-[1fr_80px_90px_50px_50px_50px] items-center gap-2 px-4 py-2.5 text-[12px] sm:grid-cols-[1fr_100px_90px_60px_60px_60px] ${
                    i < workloads.length - 1 ? "border-b border-white/[0.04]" : ""
                  }`}
                >
                  <span className="truncate font-medium text-white/70">
                    {w.pipeline}
                  </span>
                  <span className="font-mono text-[11px] text-white/30">
                    {w.model}
                  </span>
                  <StatusBadge status={w.status} />
                  <span className="hidden font-mono text-[11px] text-white/30 sm:block">
                    {w.gpu}
                  </span>
                  <span className="hidden font-mono text-[11px] text-white/30 sm:block">
                    {w.latency}
                  </span>
                  <span className="hidden sm:block">
                    {w.utilization > 0 ? (
                      <UtilBar pct={w.utilization} />
                    ) : (
                      <span className="text-[11px] text-white/15">—</span>
                    )}
                  </span>
                </div>
              ))}
            </div>

            {/* Stats row */}
            <div className="mt-4 grid grid-cols-3 gap-3">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-3"
                >
                  <div className="text-[10px] font-medium tracking-wider text-white/25 uppercase">
                    {s.label}
                  </div>
                  <div className="mt-1 font-mono text-[18px] font-semibold text-white/80 sm:text-[22px]">
                    {s.value}
                  </div>
                  <div className="mt-0.5 text-[10px] text-white/20">
                    {s.sub}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WhatIsLivepeer() {
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      <div className="divider-gradient absolute top-0 left-0 right-0" />

      <Container className="relative">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          transition={{ staggerChildren: 0.15 }}
        >
          <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
            <SectionHeader
              label="What is Livepeer"
              title="The open GPU network for real-time AI video"
              description="Livepeer is infrastructure purpose-built for AI-native video workloads — where live streams are continuously generated, transformed, and interpreted by AI. Deploy real-time pipelines on a distributed GPU network with low latency and elastic scaling."
            />
          </motion.div>

          {/* Product UI showcase — Linear-style floating frame */}
          <motion.div
            className="mx-auto mt-16 max-w-5xl"
            variants={fadeUp}
            transition={{ duration: 0.6 }}
          >
            <ProductUI />
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}
