"use client";

import { useState } from "react";
import Link from "next/link";
import { Wallet, ExternalLink, Plus, ArrowRight } from "lucide-react";
import { REMOTE_SIGNERS, ROUTING_SUMMARY } from "@/lib/dashboard/mock-data";
import type { RoutingSummary } from "@/lib/dashboard/types";
import { SectionRow } from "./SectionRow";

const FOUNDATION_LIMIT = 10_000;
const FOUNDATION_USED = 1_204;
const FOUNDATION_RESET = "6h 12m";

function formatRequests(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toLocaleString();
}

const ROUTE_COLOR_CLASS: Record<RoutingSummary["routes"][number]["color"], string> = {
  green: "bg-green-bright",
  blue: "bg-blue-bright",
  neutral: "bg-white/40",
};

const ROUTE_DOT_CLASS: Record<RoutingSummary["routes"][number]["color"], string> = {
  green: "bg-green-bright",
  blue: "bg-blue-bright",
  neutral: "bg-white/40",
};

function RoutingStrip({ summary }: { summary: RoutingSummary }) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-dark-surface p-4">
      {/* Header: label + total + view details */}
      <div className="flex items-baseline justify-between">
        <div className="flex items-baseline gap-2">
          <p className="text-[11px] font-medium uppercase tracking-wider text-white/40">
            Routing this month
          </p>
          <span className="font-mono text-xs text-white/30">·</span>
          <span className="font-mono text-xs text-white/70">
            {formatRequests(summary.totalRequests)} total
          </span>
        </div>
        <Link
          href="/dashboard/settings?tab=usage"
          className="flex items-center gap-1 text-[11px] text-white/40 transition-colors hover:text-white/70"
        >
          View details
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Stacked bar */}
      <div className="mt-3 flex h-1.5 overflow-hidden rounded-full bg-white/[0.04]">
        {summary.routes.map((r) => (
          <div
            key={r.label}
            className={ROUTE_COLOR_CLASS[r.color]}
            style={{ width: `${r.percent}%` }}
          />
        ))}
      </div>

      {/* Inline legend */}
      <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
        {summary.routes.map((r, i) => (
          <span
            key={r.label}
            className="flex items-center gap-1.5 text-[11px] text-white/55"
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${ROUTE_DOT_CLASS[r.color]}`}
            />
            {r.label} <span className="font-mono text-white/75">{r.percent}%</span>
            {i < summary.routes.length - 1 && (
              <span className="ml-1 text-white/15">·</span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function PaymentTab() {
  const [connectedSigners, setConnectedSigners] = useState<Set<string>>(
    new Set(),
  );
  const [walletConnected, setWalletConnected] = useState(false);

  const mockWallet = "0x1a2B…9cD4";
  const mockBalance = "0.34 ETH";

  const toggleSigner = (id: string) => {
    setConnectedSigners((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const usagePct = (FOUNDATION_USED / FOUNDATION_LIMIT) * 100;

  return (
    <div className="px-5 lg:px-6">
      <div className="divide-y divide-white/[0.06]">
        {/* Free tier */}
        <SectionRow
          title="Free tier"
          description="A community payment provider offering free, rate-limited access. Enabled by default for every API token."
        >
          <div className="rounded-lg border border-white/[0.08] bg-dark-surface p-5">
            <p className="text-[11px] font-medium uppercase tracking-wider text-white/40">Requests</p>
            <p className="mt-1 font-mono text-2xl font-semibold text-white">
              {FOUNDATION_USED.toLocaleString()}
              <span className="ml-1 text-base font-normal text-white/40">
                / {FOUNDATION_LIMIT.toLocaleString()}
              </span>
            </p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full bg-green-bright transition-all"
                style={{ width: `${Math.min(usagePct, 100)}%` }}
              />
            </div>
            <p className="mt-2 text-[11px] text-white/40">
              Resets in {FOUNDATION_RESET}
            </p>
          </div>
        </SectionRow>

        {/* Remote signers */}
        <SectionRow
          title="Payment providers"
          description="Connect a payment provider to add capacity beyond the Free tier. Your API token routes to it automatically."
        >
          <RoutingStrip summary={ROUTING_SUMMARY} />

          <div className="mt-3 rounded-lg border border-white/[0.06]">
          {REMOTE_SIGNERS.map((signer) => {
            const isConnected = connectedSigners.has(signer.id);
            const isComingSoon = signer.status === "coming-soon";

            return (
              <div
                key={signer.id}
                className={`group flex flex-col gap-3 border-b border-white/[0.06] px-4 py-3.5 first:rounded-t-lg sm:flex-row sm:items-center sm:gap-4 ${
                  isComingSoon
                    ? "opacity-50"
                    : "transition-colors hover:bg-white/[0.02]"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {isConnected && (
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-green-bright" />
                    )}
                    <p className="text-sm font-medium text-white">
                      {signer.name}
                    </p>
                    {isComingSoon && (
                      <span className="inline-flex shrink-0 items-center rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] font-medium text-white/60 sm:hidden">
                        Coming soon
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-[13px] text-white/65 sm:line-clamp-1">
                    {signer.description}
                  </p>
                  {isConnected && signer.monthlyUsage && (
                    <p className="mt-1 text-[12px] text-white/60">
                      <span className="font-mono text-white/80">
                        {formatRequests(signer.monthlyUsage.requests)}
                      </span>{" "}
                      requests this month
                      <span
                        className="mx-1.5 text-white/30"
                        aria-hidden="true"
                      >
                        ·
                      </span>
                      <span className="font-mono text-white/80">
                        {signer.monthlyUsage.spentDisplay}
                      </span>{" "}
                      spent
                    </p>
                  )}
                </div>

                {/* Right rail: meta chips · status pill · action. Wraps under name on mobile. */}
                <div className="flex flex-wrap items-center gap-2 sm:shrink-0 sm:flex-nowrap sm:gap-2.5">
                  <div className="flex flex-wrap items-center gap-1">
                    {signer.currencies.map((c) => (
                      <span
                        key={c}
                        className="rounded-md bg-white/[0.04] px-2 py-0.5 font-mono text-[11px] font-medium text-white/70"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                  {isConnected && (
                    <span className="inline-flex items-center rounded-full border border-green-bright/20 bg-green-bright/[0.08] px-2 py-0.5 text-[10px] font-medium text-green-bright">
                      Connected
                    </span>
                  )}
                  {isComingSoon && (
                    <span className="hidden items-center rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] font-medium text-white/60 sm:inline-flex">
                      Coming soon
                    </span>
                  )}
                  {isConnected ? (
                    <div className="ml-auto flex items-center gap-1 sm:ml-0">
                      <a
                        href="https://docs.livepeer.org"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-xs text-white/70 transition-colors hover:bg-white/[0.06] hover:text-white"
                      >
                        Manage
                        <ExternalLink className="h-3 w-3" />
                      </a>
                      <button
                        onClick={() => toggleSigner(signer.id)}
                        className="rounded-md px-2 py-1.5 text-xs text-white/55 transition-colors hover:bg-white/[0.06] hover:text-white"
                      >
                        Disconnect
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => toggleSigner(signer.id)}
                      disabled={isComingSoon}
                      className={`ml-auto rounded-md border px-3 py-1.5 text-xs font-medium transition-colors sm:ml-0 ${
                        isComingSoon
                          ? "cursor-not-allowed border-white/[0.06] text-white/30"
                          : "border-white/[0.12] text-white/80 hover:bg-white/[0.06] hover:text-white"
                      }`}
                    >
                      Connect
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* Bring your own signer — last row inside the same container */}
          <a
            href="https://docs.livepeer.org"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-4 px-4 py-3.5 transition-colors last:rounded-b-lg hover:bg-white/[0.02]"
          >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-white/[0.08] text-white/40 transition-colors group-hover:text-white/60">
              <Plus className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white/80 transition-colors group-hover:text-white">
                Bring your own signer
              </p>
              <p className="mt-0.5 text-[13px] text-white/55">
                Implement the OAuth2 spec to route your own billing.
              </p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-white/40 transition-colors group-hover:bg-white/[0.06] group-hover:text-white/70">
              Docs
              <ExternalLink className="h-3 w-3" />
            </span>
          </a>
        </div>
        </SectionRow>

        {/* Direct ETH payments */}
        <SectionRow
          title="Direct ETH payments"
          description="Pay orchestrators directly on-chain. Bypasses signers entirely."
        >
          <div className="rounded-lg border border-white/[0.08] bg-dark-surface p-4">
            {walletConnected ? (
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-bright/10">
                    <Wallet className="h-4 w-4 text-blue-bright" />
                  </div>
                  <div>
                    <p className="font-mono text-sm text-white">{mockWallet}</p>
                    <p className="mt-0.5 text-xs text-white/40">
                      {mockBalance} available
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href="https://etherscan.io"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-md border border-white/[0.08] px-3 py-1.5 text-xs text-white/60 transition-colors hover:bg-white/[0.04] hover:text-white"
                  >
                    Add funds
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  <button
                    onClick={() => setWalletConnected(false)}
                    className="rounded-md border border-white/[0.08] px-3 py-1.5 text-xs text-white/50 transition-colors hover:bg-white/[0.04] hover:text-white/70"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.04]">
                    <Wallet className="h-4 w-4 text-white/40" />
                  </div>
                  <p className="text-sm text-white/50">No wallet connected</p>
                </div>
                <button
                  onClick={() => setWalletConnected(true)}
                  className="rounded-md border border-white/[0.12] px-3.5 py-1.5 text-xs font-medium text-white/80 transition-colors hover:bg-white/[0.06] hover:text-white"
                >
                  Connect wallet
                </button>
              </div>
            )}
          </div>
        </SectionRow>
      </div>
    </div>
  );
}
