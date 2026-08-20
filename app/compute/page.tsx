import type { Metadata } from "next";

import type { LivepeerOrgPage } from "@/components/livepeer-ui/contracts";
import {
  ComputeBaselineSection,
  ComputeHeroSection,
  ComputeOnchainSection,
} from "@/components/livepeer-ui/livepeer-compute-sections";
import { fetchComputeMetrics } from "@/lib/compute-metrics";

// Static, in-repo page content matching the registry's content contract
// (see CLAUDE.md → Content). Copy mirrors the public-beta mockup.
//
// One page for running and earning: /earn and the old /network and
// /orchestrate all redirect here (next.config.ts).
type EarnContent = NonNullable<LivepeerOrgPage["earnContent"]>;

const earn: EarnContent = {
  earnings: {
    servicePayoutsLabel: "Service payouts",
    protocolRewardsLabel: "Protocol rewards",
    periodLabel: "24h",
  },
  hero: {
    heading: "Put your GPU to work on Livepeer.",
    description:
      "Livepeer routes inference and video work to GPUs on the open network. Run an orchestrator, serve real workloads, and earn from fees and protocol rewards.",
    cta: {
      label: "Orchestrator docs",
      href: "https://docs.livepeer.org/v2/orchestrators/setup/guide",
    },
  },
  // The "Choose the right path" section is no longer rendered. These fields
  // stay because `earnContent` requires them, and the copy is worth keeping
  // rather than retyping if the section returns — the component that rendered
  // it is in git history. Nothing below passes them to a section, so they
  // never reach the client.
  pathsHeading: "Choose the right path",
  pathsDescription:
    "Do not buy tokens or new hardware before deciding which role you actually want to run.",
  paths: [
    {
      _key: "pool",
      heading: "Join a pool",
      fit: "Fastest path",
      description:
        "Connect as a worker behind an existing Orchestrator. The operator handles registration, LPT, routing, and payouts; you provide GPU compute and receive off-chain earnings under the pool's terms.",
      icon: "cable",
      requirements: [
        "NVIDIA GPU and Linux",
        "Docker or go-livepeer",
        "Verified payout terms",
      ],
      note: "No LPT required",
      cta: {
        label: "Pool setup guide",
        href: "https://docs.livepeer.org/v2/orchestrators/guides/deployment-details/new-join-a-pool",
      },
    },
    {
      _key: "ai",
      heading: "Run AI-first",
      fit: "Best with 24 GB+ VRAM",
      description:
        "Serve inference workloads where capability, price, latency, and uptime matter more than active-set stake.",
      icon: "sparkles",
      requirements: ["CUDA 12+", "Docker", "NVIDIA Container Toolkit"],
      note: "Lower stake barrier",
      cta: {
        label: "AI operations",
        href: "https://docs.livepeer.org/v2/orchestrators/guides/ai-and-job-workloads/ai-inference-operations",
      },
    },
    {
      _key: "solo",
      heading: "Run a solo node",
      fit: "Full operator path",
      description:
        "Operate go-livepeer, publish your service address, manage the wallet, set prices, and monitor rewards.",
      icon: "server-cog",
      requirements: ["Arbitrum ETH", "LPT for video", "Public service URI"],
      note: "Most responsibility",
      cta: {
        label: "Solo setup guide",
        href: "https://docs.livepeer.org/v2/orchestrators/setup/guide",
      },
    },
  ],
  baselineHeading: "Baseline requirements",
  baselineDescription:
    "These are the practical requirements that apply before protocol configuration.",
  baseline: [
    {
      _key: "gpu",
      heading: "Supported GPU",
      description:
        "NVIDIA is the supported hardware-accelerated path. Confirm the host can see the card with nvidia-smi.",
      icon: "cpu",
    },
    {
      _key: "host",
      heading: "Production host",
      description:
        "Use Linux for production GPU workloads. AI also needs Docker, CUDA 12+, and NVIDIA Container Toolkit.",
      icon: "server",
    },
    {
      _key: "network",
      heading: "Public network",
      description:
        "Use stable, low-latency internet. You need a public domain or static IP and an open service port.",
      icon: "network",
    },
    {
      _key: "budget",
      heading: "Operating budget",
      description:
        "Account for electricity, storage, bandwidth, and maintenance. Work and earnings are not guaranteed.",
      icon: "dollar",
    },
  ],
  arbitrum: {
    heading: "Arbitrum One",
    description:
      "Orchestrators need ETH on Arbitrum One for activation, reward calls, ticket redemption, and ongoing gas.",
    imageAlt: "Arbitrum",
    disclaimer:
      "Use Arbitrum One, not Ethereum mainnet, for the operator wallet's gas. Confirm the network and destination address before bridging or withdrawing funds, keep an ETH buffer for ongoing transactions, and never paste a private key into a website.",
    cta: {
      label: "Official Arbitrum Bridge",
      href: "https://bridge.arbitrum.io",
    },
  },
  stake: {
    heading: "$LPT stake",
    description:
      "Video work requires enough self-stake and delegated LPT to enter the active orchestrator set. AI inference has a lower stake barrier.",
    cta: {
      label: "View active orchestrators",
      href: "https://explorer.livepeer.org",
    },
  },
};

// Not part of `earnContent` — the contract has no CTA on the baseline section.
// The hero's "Orchestrator docs" points at the reference; this points at the
// step-by-step tutorial, which is the actual next action after reading the
// requirements.
const baselineCta = {
  label: "Run your first orchestrator",
  href: "https://docs.livepeer.org/network/tutorials/run-your-first-orchestrator",
};

const DESCRIPTION =
  "Put your GPU to work on Livepeer. Join a pool, run AI-first, or operate a solo node — with the baseline hardware, network, and on-chain requirements for each.";

  // openGraph and twitter are declared, not inferred. Next does not fill
  // og:title from `title` or og:description from `description`, so a page
  // setting only those two inherits the root layout's openGraph object whole —
  // and served "Livepeer — The open inference network" with the home page's
  // description to every timeline it was shared into.
export const metadata: Metadata = {
  title: "Provide GPU compute",
  description: DESCRIPTION,
  openGraph: {
    title: "Provide GPU compute | Livepeer",
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "Provide GPU compute | Livepeer",
    description: DESCRIPTION,
  },
};

export default async function ComputePage() {
  // Server-side and revalidated hourly, so the figures are rendered into the
  // HTML — no loading state, and no client-side request that could leave the
  // cards empty. Returns null when the numbers can't be established, in which
  // case the hero simply has no metrics.
  const metrics = await fetchComputeMetrics();

  return (
    <>
      {/* Each section gets only the slice it renders. Passing the whole `earn`
          object type-checks, but it also serialises the unrendered path copy
          into the RSC payload. */}
      <ComputeHeroSection
        content={earn.hero}
        earnings={earn.earnings}
        metrics={metrics}
      />
      <ComputeBaselineSection
        content={{
          baselineHeading: earn.baselineHeading,
          baselineDescription: earn.baselineDescription,
          baseline: earn.baseline,
        }}
        cta={baselineCta}
      />
      <ComputeOnchainSection
        content={{ arbitrum: earn.arbitrum, stake: earn.stake }}
      />
    </>
  );
}
