import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Bundler-agnostic polling interval for file watching — works with both
  // Turbopack (default in Next 15) and Webpack. Needed because the native
  // file watcher doesn't pick up changes reliably in git worktrees.
  watchOptions: {
    pollIntervalMs: 1000,
  },
  images: {
    // Registry landing sections reference static brand imagery on Sanity's CDN.
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
  },
  // `.wgsl` shaders (the contribute hero) go through vgpu's loader, which
  // resolves their import graph at build time and hands the effect one
  // finished source. Both bundlers are told: `next dev` and `next build` both
  // run webpack in this repo, but `next dev --turbopack` reads only the block
  // below, so the rule is stated for each. Neither validates the WGSL — that
  // is `vgpu check`, run by hand.
  turbopack: {
    rules: {
      "*.wgsl": {
        loaders: ["@vgpu/wgsl/loader-webpack"],
        as: "*.js",
      },
    },
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
    config.module.rules.push({
      test: /\.wgsl$/,
      loader: "@vgpu/wgsl/loader-webpack",
    });
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
      // /network and /orchestrate used to bounce off-site because there was no
      // page here to send them to. /compute is now that page — one surface for
      // running a node and earning from it — so they resolve on-site.
      {
        source: "/network",
        destination: "/compute",
        permanent: false,
      },
      {
        source: "/orchestrate",
        destination: "/compute",
        permanent: false,
      },
      // /earn is an alias for the same page, not a separate one (CLAUDE.md).
      {
        source: "/earn",
        destination: "/compute",
        permanent: false,
      },
      // Delegation stays external — it's an explorer action, not a page here.
      {
        source: "/delegate",
        destination: "https://explorer.livepeer.org/",
        permanent: false,
      },
      // The five use-case pages collapse into the surfaces that replaced them:
      // four were AI/agent stories, the transcoding one is a compute story.
      ...[
        "/use-cases/ai-avatars-and-agents",
        "/use-cases/composable-ai-pipelines",
        "/use-cases/real-time-video-analysis",
        "/use-cases/synthetic-data-generation",
      ].map((source) => ({
        source,
        destination: "/agent",
        permanent: true,
      })),
      {
        source: "/use-cases/live-transcoding-and-streaming",
        destination: "/compute",
        permanent: true,
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
      // Nav labels the blog "Latest Updates" and links to /latest; the canonical
      // URL stays /blog (preserves SEO + existing slug redirects).
      {
        source: "/latest",
        destination: "/blog",
        permanent: false,
      },
      {
        source: "/latest/:slug*",
        destination: "/blog/:slug*",
        permanent: false,
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
      // blog.livepeer.org → livepeer.org/blog (path-preserving catch-all)
      {
        source: "/:path*",
        has: [{ type: "host", value: "blog.livepeer.org" }],
        destination: "https://livepeer.org/blog/:path*",
        permanent: true,
      },
      // Renamed blog slugs — old name → new name.
      // Matched with and without /blog/ prefix so they work both from
      // the catch-all above and from any cached bare-path links.
      ...["", "/blog"].flatMap((prefix) => [
        {
          source: `${prefix}/ai-x-open-media-forum-building-new-wave-creativity`,
          destination: "/blog/ai-x-open-media-forum",
          permanent: true,
        },
        {
          source: `${prefix}/livepeer-onchain-builders-streamplace-building-the-video-backbone-of-decentralized-social`,
          destination: "/blog/onchain-builders-streamplace",
          permanent: true,
        },
      ]),
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
