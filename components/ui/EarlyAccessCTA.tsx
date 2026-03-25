"use client";

import { useState } from "react";
type State = "idle" | "submitting" | "success" | "error";

export default function EarlyAccessCTA() {
  const [state, setState] = useState<State>("idle");
  const [email, setEmail] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("submitting");

    try {
      const res = await fetch("/api/early-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) throw new Error("Request failed");
      setState("success");
      setEmail("");
    } catch {
      setState("error");
    }
  }

  const isSubmitting = state === "submitting";
  const isSuccess = state === "success";

  return (
    <div className="flex flex-col items-center gap-3">
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-lg items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-2xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] p-2"
      >
        {/* Mail icon */}
        <div className="flex shrink-0 items-center pl-3 text-white/30">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="1.5">
            <rect x="2" y="4" width="16" height="12" rx="2" />
            <path d="M2 6l8 5 8-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <input
          type="email"
          required
          placeholder="you@company.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (state === "error") setState("idle");
          }}
          disabled={isSubmitting || isSuccess}
          className="min-w-0 flex-1 bg-transparent py-2 text-sm text-white placeholder:text-white/30 outline-none disabled:opacity-50"
        />

        <button
          type="submit"
          disabled={isSubmitting || isSuccess}
          className="shrink-0 cursor-pointer select-none rounded-lg px-5 py-2.5 text-sm font-medium text-white transition-all duration-200 disabled:opacity-70 animate-[ctaGlow_4s_ease-in-out_infinite] hover:brightness-110 active:brightness-95"
          style={{
            background: "linear-gradient(135deg, #1E9960 0%, #18794E 60%, #115C3B 100%)",
          }}
        >
          <span className="flex items-center justify-center gap-1.5">
            {isSubmitting ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                <span>Submitting...</span>
              </>
            ) : isSuccess ? (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2">
                  <path d="M3 8.5l3.5 3.5 6.5-7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>You&apos;re on the list!</span>
              </>
            ) : (
              <>
                Get Early Access <span aria-hidden="true">&rarr;</span>
              </>
            )}
          </span>
        </button>
      </form>

      {state === "error" ? (
        <p className="text-xs text-red-400">Something went wrong. Try again.</p>
      ) : (
        <p className="text-xs text-white/30">
          We&apos;ll notify you when access opens up.
        </p>
      )}
    </div>
  );
}
