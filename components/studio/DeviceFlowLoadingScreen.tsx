import { LivepeerSymbol } from "@/components/icons/LivepeerLogo";

/**
 * Full-screen loading state for RFC 8628 / third-party device login — matches
 * `/studio/device-approved` so users stay oriented (no dashboard flash).
 */
export default function DeviceFlowLoadingScreen() {
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
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 75% 70% at 50% 48%, transparent 40%, rgba(18,18,18,0.5) 70%, rgba(18,18,18,0.85) 100%)",
        }}
        aria-hidden="true"
      />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
        <div className="mb-5 flex justify-center">
          <LivepeerSymbol className="h-9 w-9 text-white" />
        </div>
        <h1 className="text-2xl font-medium tracking-tight text-white">
          Approving device login
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-white/60">
          Stay on this page while we finish connecting your terminal. This
          usually takes a few seconds.
        </p>
        <div className="mt-8 flex justify-center" role="status" aria-live="polite">
          <div
            className="h-9 w-9 animate-spin rounded-full border-2 border-white/15 border-t-green-bright"
            aria-hidden
          />
        </div>
      </div>
    </main>
  );
}
