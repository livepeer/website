import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Bundler-agnostic polling interval for file watching — works with both
  // Turbopack (default in Next 15) and Webpack. Needed because the native
  // file watcher doesn't pick up changes reliably in git worktrees.
  watchOptions: {
    pollIntervalMs: 1000,
  },
  webpack: (config) => {
    // Additional Webpack-specific watch tweaks for git worktree symlinks
    // (only takes effect when Turbopack is disabled).
    config.watchOptions = {
      ...config.watchOptions,
      followSymlinks: true,
      poll: 1000,
      aggregateTimeout: 300,
    };
    return config;
  },
  async redirects() {
    return [
      // Old livepeer.org routes → new site equivalents
      {
        source: "/lpt",
        destination: "/token",
        permanent: true,
      },
      {
        source: "/learn",
        destination: "/primer",
        permanent: false,
      },
      {
        source: "/network",
        destination: "https://explorer.livepeer.org",
        permanent: false,
      },
      {
        source: "/delegate",
        destination: "https://explorer.livepeer.org/",
        permanent: false,
      },
      {
        source: "/orchestrate",
        destination:
          "https://docs.livepeer.org/v1/orchestrators/guides/get-started",
        permanent: false,
      },
      {
        source: "/dev-hub",
        destination: "https://docs.livepeer.org",
        permanent: false,
      },
      {
        source: "/community-hub",
        destination: "https://discord.gg/livepeer",
        permanent: false,
      },
      {
        source: "/jobs",
        destination: "/",
        permanent: false,
      },
      {
        source: "/media-kit",
        destination: "/brand",
        permanent: true,
      },
      {
        source: "/primer-new-design",
        destination: "/primer",
        permanent: true,
      },
      // Legal pages — not yet implemented, redirect to home for now
      {
        source: "/terms-of-service",
        destination: "/",
        permanent: false,
      },
      {
        source: "/privacy-policy",
        destination: "/",
        permanent: false,
      },
      {
        source: "/terms-of-service-p",
        destination: "/",
        permanent: false,
      },
      {
        source: "/privacy-policy-p",
        destination: "/",
        permanent: false,
      },
      // Old blog.livepeer.org post slugs → new /blog/* paths
      // (blog.livepeer.org redirects to livepeer.org via Vercel domain config,
      //  these catch the old slugs that land on the apex domain)
      ...[
        "/a-real-time-update-to-the-livepeer-network-vision",
        "/livepeer-incorporated-and-realtime-ai",
        "/why-delegation-still-matters-in-a-low-inflation-environment",
        "/introducing-the-livepeer-foundation",
        "/introducing-livepeer-cascade-a-vision-for-livepeers-future-in-the-age-of-real-time-ai-video",
      ].map((slug) => ({
        source: slug,
        destination: `/blog${slug}`,
        permanent: true,
      })),
      // Old blog slugs that changed on the new site
      {
        source: "/ai-x-open-media-forum-building-new-wave-creativity",
        destination: "/blog/ai-x-open-media-forum",
        permanent: true,
      },
      {
        source:
          "/livepeer-onchain-builders-streamplace-building-the-video-backbone-of-decentralized-social",
        destination: "/blog/onchain-builders-streamplace",
        permanent: true,
      },
      // Deprecated pages — old marketing/campaign routes, redirect to home
      // to avoid 404s from existing links and search engine indexes
      ...[
        "/pipelines-demo-email",
        "/comfyui-live-video-hacker-program",
        "/learn-about-pipelines",
        "/learn-about-pipelines---dev",
        "/daydream-waitlist",
      ].map((source) => ({
        source,
        destination: "/",
        permanent: true,
      })),
    ];
  },
};

export default nextConfig;
