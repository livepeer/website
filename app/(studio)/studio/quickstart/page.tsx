"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Search,
  Play,
  Key,
  Code,
  ExternalLink,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { LivepeerWordmark } from "@/components/icons/LivepeerLogo";

const STEPS = [
  {
    number: 1,
    title: "Browse the catalog",
    description:
      "Explore 18+ AI models available on the Livepeer network. Filter by category, status, and price. See managed solutions with SLA guarantees alongside raw network capabilities.",
    icon: Search,
    action: { label: "Open Catalog", href: "/studio?tab=explore" },
  },
  {
    number: 2,
    title: "Try a model in the playground",
    description:
      "Click any model to open its detail page. Fill in the playground form and click Run to see a live inference result. Switch between Form, Python, Node.js, and cURL views.",
    icon: Play,
    action: { label: "Try FLUX.1 schnell", href: "/studio/models/flux-schnell" },
  },
  {
    number: 3,
    title: "Get your API key from a provider",
    description:
      "Choose a solutions provider (Daydream, Livepeer Studio, or the raw Livepeer Network) and create an API key from their dashboard. Each provider manages their own authentication.",
    icon: Key,
    action: { label: "View Providers", href: "/studio?tab=api" },
  },
  {
    number: 4,
    title: "Integrate with code",
    description:
      "Copy the auto-generated code snippet from any model's API tab. Paste it into your app, replace YOUR_API_KEY, and you're live. Supports cURL, Python, Node.js, and raw HTTP.",
    icon: Code,
    action: {
      label: "Read the Docs",
      href: "https://docs.livepeer.org",
      external: true,
    },
  },
];

export default function QuickstartPage() {
  return (
    <div className="flex min-h-screen flex-col bg-dark">
      {/* Header */}
      <header className="border-b border-white/[0.06] bg-dark-lighter">
        <div className="flex h-12 items-center justify-between px-5">
          <div className="flex items-center gap-2.5">
            <Link
              href="/studio"
              aria-label="Back to Studio"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-white/30 transition-colors hover:bg-white/[0.06] hover:text-white/60 focus:outline-none"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
            </Link>
            <div className="h-5 w-px bg-white/[0.08]" />
            <Link href="/studio" aria-label="Livepeer Studio home" className="flex items-center gap-2.5">
              <LivepeerWordmark className="h-3.5 w-auto text-white" />
              <span className="rounded-md border border-green-bright/25 bg-green-bright/10 px-1.5 py-0.5 text-[10px] font-semibold text-green-bright">
                STUDIO
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl px-5 py-12">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Get started with Livepeer Studio
          </h1>
          <p className="mt-2 text-sm text-white/50">
            Four steps from discovery to integration. No credit card required.
          </p>

          <div className="mt-10 space-y-8">
            {STEPS.map((step) => (
              <div
                key={step.number}
                className="relative flex gap-5 rounded-xl border border-white/[0.06] bg-white/[0.02] p-6"
              >
                {/* Step number + icon */}
                <div className="flex flex-col items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-bright/10 text-green-bright">
                    <step.icon className="h-5 w-5" />
                  </div>
                  <span className="font-mono text-[10px] text-white/40">
                    {step.number}/4
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h2 className="text-base font-semibold text-white">
                    {step.title}
                  </h2>
                  <p className="mt-1.5 text-sm leading-relaxed text-white/50">
                    {step.description}
                  </p>
                  {step.action &&
                    ("external" in step.action && step.action.external ? (
                      <a
                        href={step.action.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-green-bright hover:underline"
                      >
                        {step.action.label}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <Link
                        href={step.action.href}
                        className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-green-bright hover:underline"
                      >
                        {step.action.label}
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    ))}
                </div>
              </div>
            ))}
          </div>

          {/* Done CTA */}
          <div className="mt-12 rounded-xl border border-green-bright/20 bg-green-bright/5 p-6 text-center">
            <CheckCircle2 className="mx-auto h-8 w-8 text-green-bright/50" />
            <h3 className="mt-3 text-lg font-semibold text-white">
              Ready to build
            </h3>
            <p className="mt-1 text-sm text-white/50">
              You have everything you need to start building on the Livepeer
              network.
            </p>
            <div className="mt-4 flex justify-center gap-3">
              <Link
                href="/studio"
                className="rounded-lg bg-green px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-light focus:outline-none"
              >
                Back to Catalog
              </Link>
              <Link
                href="/studio?tab=api"
                className="rounded-lg border border-white/[0.08] px-4 py-2 text-sm text-white/50 transition-colors hover:bg-white/[0.04] focus:outline-none"
              >
                API Keys
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
