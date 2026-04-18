"use client";

import Link from "next/link";
import { LivepeerSymbol } from "@/components/icons/LivepeerLogo";

export default function DeviceApprovedPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-dark px-6">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 45%, rgba(24,121,78,0.10) 0%, rgba(24,121,78,0.03) 45%, transparent 70%)",
        }}
        aria-hidden="true"
      />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
        <div className="mb-5 flex justify-center">
          <LivepeerSymbol className="h-9 w-9 text-white" />
        </div>
        <h1 className="text-2xl font-medium tracking-tight text-white">
          Device login approved
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-white/60">
          You can now return to your terminal. Your python-gateway device flow
          should finish automatically in a few seconds.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Link
            href="/studio"
            className="rounded-lg bg-green px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-light"
          >
            Open Studio
          </Link>
          <Link
            href="/studio/settings?tab=tokens"
            className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/70 transition-colors hover:bg-white/[0.06]"
          >
            API tokens
          </Link>
        </div>
      </div>
    </main>
  );
}
