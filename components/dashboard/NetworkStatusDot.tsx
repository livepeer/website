"use client";

import Link from "next/link";

const MOCK_STATUS = {
  status: "healthy" as const,
  orchestrators: 47,
  gpus: 312,
  callsPerMin: "2.4k",
};

export default function NetworkStatusDot() {
  return (
    <div className="relative group">
      <span
        className="flex items-center gap-2 rounded-full px-3 py-1 text-xs text-white/60 cursor-help"
        aria-label={`${MOCK_STATUS.orchestrators} orchestrators online, network ${MOCK_STATUS.status}`}
        role="status"
      >
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-bright opacity-50" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-bright" />
        </span>
        {MOCK_STATUS.orchestrators} online
      </span>

      {/* Tooltip — pt-3 creates an invisible hover bridge across the gap */}
      <div
        className="absolute top-full right-0 pt-4 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-150 z-50"
        role="tooltip"
        aria-hidden="true"
      >
        <div className="w-64 rounded-xl border border-white/10 bg-dark/95 backdrop-blur-xl shadow-xl p-4">
          {/* Heading */}
          <div className="text-xs font-medium text-white capitalize">
            Network {MOCK_STATUS.status}
          </div>

          {/* Divider */}
          <div className="my-2 border-t border-white/10" />

          {/* Stats */}
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-white/60">
              <span>Orchestrators</span>
              <span className="text-white">{MOCK_STATUS.orchestrators}</span>
            </div>
            <div className="flex justify-between text-white/60">
              <span>GPUs active</span>
              <span className="text-white">{MOCK_STATUS.gpus}</span>
            </div>
            <div className="flex justify-between text-white/60">
              <span>Requests/min</span>
              <span className="text-white">{MOCK_STATUS.callsPerMin}</span>
            </div>
          </div>

          {/* Divider */}
          <div className="my-2 border-t border-white/10" />

          {/* Link */}
          <Link
            href="/dashboard/stats"
            className="inline-block text-xs text-green-bright hover:text-green-bright/80 transition-colors"
          >
            View stats →
          </Link>
        </div>
      </div>
    </div>
  );
}
