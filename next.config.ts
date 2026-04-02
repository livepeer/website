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
        destination: "/",
        permanent: false,
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
        permanent: false,
      },
      {
        source: "/primer-new-design",
        destination: "/primer",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
