"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth, type AuthProvider } from "@/components/dashboard/AuthContext";
import { LivepeerSymbol } from "@/components/icons/LivepeerLogo";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

export default function LoginPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const { connect } = useAuth();
  const router = useRouter();

  function handleEmailSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    const displayName = name || email.split("@")[0] || "Demo User";
    connect({
      name: displayName,
      email: email || "demo@livepeer.org",
      initials: getInitials(displayName),
      provider: "email",
    });
    router.push("/dashboard");
  }

  function handleOAuthSubmit(provider: AuthProvider) {
    // Mock OAuth — pretend the provider returned a profile.
    const mockProfiles: Record<"github" | "google", { name: string; email: string }> = {
      github: { name: "Rick Staa", email: "rick.staa@github.com" },
      google: { name: "Rick Staa", email: "rick.staa@gmail.com" },
    };
    const profile = mockProfiles[provider as "github" | "google"];
    connect({
      name: profile.name,
      email: profile.email,
      initials: getInitials(profile.name),
      provider,
    });
    router.push("/dashboard");
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* ─── Layer 1: dark base ─── */}
      <div className="absolute inset-0 bg-dark" />

      {/* ─── Layer 2: primary green glow — centered behind form ─── */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 65% 55% at 50% 44%, rgba(24,121,78,0.10) 0%, rgba(24,121,78,0.04) 35%, transparent 68%)",
        }}
        aria-hidden="true"
      />

      {/* ─── Layer 3: secondary warm glow — offset for depth ─── */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 50% 45% at 55% 58%, rgba(30,153,96,0.04) 0%, transparent 60%)",
        }}
        aria-hidden="true"
      />

      {/* ─── Layer 4: vignette — theatrical edge darkening ─── */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 75% 70% at 50% 48%, transparent 40%, rgba(18,18,18,0.5) 70%, rgba(18,18,18,0.85) 100%)",
        }}
        aria-hidden="true"
      />

      {/* ─── Form content ─── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="relative z-10 w-full max-w-sm px-6"
      >
        {/* Logo */}
        <div className="mb-10 flex justify-center">
          <LivepeerSymbol className="h-9 w-9 text-white" />
        </div>

        {/* Heading */}
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="mb-8 text-center"
          >
            <h1 className="text-[28px] font-medium tracking-tight text-white">
              {mode === "signin"
                ? "Log in to the Developer Dashboard"
                : "Create your account"}
            </h1>
            <p className="mt-2 text-sm text-white/40">
              {mode === "signin"
                ? "Welcome back"
                : "Get started with the open GPU network"}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Social auth buttons */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => handleOAuthSubmit("github")}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-medium text-white shadow-sm shadow-black/20 backdrop-blur-sm transition-colors hover:bg-white/[0.1] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-green/30 focus-visible:ring-offset-1 focus-visible:ring-offset-dark"
          >
            <GitHubIcon className="h-5 w-5" />
            Continue with GitHub
          </button>

          <button
            type="button"
            onClick={() => handleOAuthSubmit("google")}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-medium text-white shadow-sm shadow-black/20 backdrop-blur-sm transition-colors hover:bg-white/[0.1] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-green/30 focus-visible:ring-offset-1 focus-visible:ring-offset-dark"
          >
            <GoogleIcon className="h-5 w-5" />
            Continue with Google
          </button>
        </div>

        {/* Divider */}
        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/[0.06]" />
          <span className="text-xs uppercase tracking-widest text-white/20">
            or
          </span>
          <div className="h-px flex-1 bg-white/[0.06]" />
        </div>

        {/* Email/password form */}
        <form onSubmit={handleEmailSubmit} className="space-y-3">
          <AnimatePresence>
            {mode === "signup" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <label htmlFor="name" className="sr-only">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/30 transition-[border-color,box-shadow] focus:border-green/50 focus:outline-none focus:ring-1 focus:ring-green/20"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            <label htmlFor="email" className="sr-only">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/30 transition-[border-color,box-shadow] focus:border-green/50 focus:outline-none focus:ring-1 focus:ring-green/20"
            />
          </div>

          <div>
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/30 transition-[border-color,box-shadow] focus:border-green/50 focus:outline-none focus:ring-1 focus:ring-green/20"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-green py-3 text-sm font-medium text-white transition-colors hover:bg-green-light active:bg-green-dark focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-green-bright/50 focus-visible:ring-offset-1 focus-visible:ring-offset-dark"
          >
            {mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        {/* Mode toggle */}
        <p className="mt-6 text-center text-sm text-white/40">
          {mode === "signin" ? (
            <>
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={() => setMode("signup")}
                className="font-medium text-green-bright transition-colors hover:text-green-light"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setMode("signin")}
                className="font-medium text-green-bright transition-colors hover:text-green-light"
              >
                Sign in
              </button>
            </>
          )}
        </p>

        {/* Terms (signup only) */}
        <AnimatePresence>
          {mode === "signup" && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-4 text-center text-xs text-white/25"
            >
              By creating an account, you agree to our Terms of Service and
              Privacy Policy.
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
