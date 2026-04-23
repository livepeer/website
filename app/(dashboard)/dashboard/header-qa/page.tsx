"use client";

import { useAuth, type MockUser } from "@/components/dashboard/AuthContext";

const mockUsers: MockUser[] = [
  { name: "Rick Staa", email: "rick@livepeer.org", initials: "RS", provider: "github" },
  { name: "Demo User", email: "demo@livepeer.org", initials: "DU", provider: "email" },
  { name: "Alice Rivera", email: "alice@example.com", initials: "AR", provider: "google" },
];

export default function HeaderQaPage() {
  const { isConnected, user, connect, disconnect } = useAuth();

  return (
    <main id="main-content" className="min-h-[300vh] bg-dark text-white">
      {/* Auth controls */}
      <section className="sticky top-16 z-10 mx-auto max-w-4xl px-6 py-6">
        <div className="rounded-xl border border-white/10 bg-dark-card/90 backdrop-blur-xl p-6 shadow-xl">
          <h1 className="text-xl font-semibold mb-4">Dashboard Header QA Sandbox</h1>
          <div className="mb-6 text-sm text-white/60">
            Current auth state: <span className="font-medium text-white">{isConnected ? `Signed in as ${user?.name}` : "Signed out"}</span>
          </div>

          <div className="flex flex-wrap gap-3 mb-4">
            {mockUsers.map((u) => (
              <button
                key={u.email}
                type="button"
                onClick={() => connect(u)}
                className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white hover:bg-white/[0.06] transition-colors"
              >
                Sign in as {u.name}
              </button>
            ))}
            <button
              type="button"
              onClick={() => disconnect()}
              disabled={!isConnected}
              className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white hover:bg-white/[0.06] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Sign out
            </button>
          </div>

          <div className="text-xs text-white/50 space-y-1">
            <div>Scroll &lt;20px: default glass (dark/40 + blur-md)</div>
            <div>Scroll &gt;20px: scrolled glass (dark/80 + blur-xl + shadow)</div>
            <div>Scroll &gt;100px down: header hides (-translate-y-full)</div>
            <div>Scroll &gt;100px up: header revealed (translate-y-0)</div>
          </div>
        </div>
      </section>

      {/* Long content to exercise scroll */}
      <section className="mx-auto max-w-4xl px-6 py-12 space-y-8">
        {Array.from({ length: 30 }, (_, i) => (
          <div key={i} className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
            <div className="text-xs font-mono text-white/40 mb-2">Block {i + 1}</div>
            <div className="text-sm text-white/70">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
