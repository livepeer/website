// Nav dropdown thumbnails, sourced from Peace Node's stock-image system
// (https://livepeer.peaceno.de/marketing/stock-images). These are static
// image URLs on the Sanity CDN — no CMS query, no `next-sanity` client — so
// they honor the in-repo/no-CMS decision (see CLAUDE.md). Keyed by nav item
// label; mirrors what the public-beta mockup renders. cdn.sanity.io is
// allowlisted in next.config.ts → images.remotePatterns.
export type LivepeerOrgNavigationImages = Record<string, string | null>;

const CDN = "https://cdn.sanity.io/images/l36s876e/production";

export const livepeerOrgNavigationImages: LivepeerOrgNavigationImages = {
  Ecosystem: `${CDN}/4a527a2ef16f7ef5aed60fc3a87cfe31f67844e8-1456x816.png`,
  "Provide GPUs": `${CDN}/111bb7231a9a5e9997fdcd53ccfbbba739d8706c-1456x816.png`,
  "Livepeer Token": `${CDN}/ca81ff8f671969141086bf1626a8df7386bb2cd4-1456x816.png`,
  "Delegate LPT": `${CDN}/7bd4492abf0c18ac08045592a5987d56e11e3e91-1456x816.png`,
  "Livepeer Agent": `${CDN}/284ddcce63e09dc485789f43254049e39f5a2e40-1456x816.png`,
  "Agent Playbooks": `${CDN}/c8bd525d1e15ddb91109450269e3d6eb484817ba-1456x816.png`,
  "Agent Documentation": `${CDN}/35e86eef94b247cae09883e48f991ba54b439c33-1456x816.png`,
  Blog: `${CDN}/4a527a2ef16f7ef5aed60fc3a87cfe31f67844e8-1456x816.png`,
  Brand: `${CDN}/7ed804401d8fac1f4d9d0dec7c79e0cdbf53fbc4-1456x816.png`,
  Roadmap: `${CDN}/05692e9bc603ddde4a3899e12e97c7d52b79a887-1456x816.png`,
  Documentation: `${CDN}/03bed02c0667d4017f995ac45d6339ea2a6c5cf0-1456x816.png`,
};

export function getLivepeerOrgNavigationImages(): Promise<LivepeerOrgNavigationImages> {
  return Promise.resolve(livepeerOrgNavigationImages);
}
