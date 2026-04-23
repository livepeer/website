"use client";

import type { NetworkStat } from "@/lib/dashboard/types";

export default function StatCard({ stat }: { stat: NetworkStat }) {
  const trendColor =
    stat.trend === "up"
      ? "text-green-bright"
      : stat.trend === "down"
        ? "text-red-400"
        : "text-white/50";

  return (
    <div className="flex flex-col rounded-xl border border-white/[0.06] bg-dark-surface p-5">
      <p className="text-[11px] font-medium uppercase tracking-wider text-white/40">
        {stat.label}
      </p>
      <p className="mt-1 font-mono text-2xl font-semibold text-white">
        {stat.value}
      </p>
      {/* Always render the delta slot (nbsp when absent) so sibling cards in the same row stay aligned */}
      <p className={`mt-0.5 font-mono text-xs ${trendColor}`} aria-hidden={!stat.delta}>
        {stat.delta ?? "\u00A0"}
      </p>
    </div>
  );
}
