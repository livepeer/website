#!/usr/bin/env node
// Build public/downloads/livepeer-brand-kit.zip from the logo SVGs in
// public/brand-assets/ plus a color reference and README. Runs manually
// when brand assets change — not wired into the production build.
//
// Requires the `zip` CLI (preinstalled on macOS and most Linux).

import { execSync } from "node:child_process";
import { mkdtempSync, cpSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");
const srcDir = join(repoRoot, "public", "brand-assets");
const outDir = join(repoRoot, "public", "downloads");
const outFile = join(outDir, "livepeer-brand-kit.zip");

const work = mkdtempSync(join(tmpdir(), "livepeer-brand-kit-"));
const kitDir = join(work, "livepeer-brand-kit");

try {
  mkdirSync(join(kitDir, "logos"), { recursive: true });
  mkdirSync(join(kitDir, "colors"), { recursive: true });

  // Logos — copy all 6 SVG variants.
  for (const name of [
    "livepeer-symbol-white.svg",
    "livepeer-symbol-black.svg",
    "livepeer-wordmark-white.svg",
    "livepeer-wordmark-black.svg",
    "livepeer-lockup-white.svg",
    "livepeer-lockup-black.svg",
  ]) {
    cpSync(join(srcDir, name), join(kitDir, "logos", name));
  }

  // Colors — plain text grouped by family.
  const colors = `Livepeer Brand Colors

Primary
  Green           #18794E
  Black           #181818
  White           #FFFFFF

Green variants
  Green           #18794E
  Green Light     #1E9960
  Green Dark      #115C3B
  Green Bright    #40BF86
  Green Subtle    rgba(24,121,78,0.15)

Blue variants
  Blue            #146A8F
  Blue Light      #1380AE
  Blue Dark       #145571
  Blue Bright     #25ABD0
  Blue Subtle     rgba(20,106,143,0.15)

Dark surfaces
  Dark            #181818
  Dark Lighter    #1E1E1E
  Dark Card       #242424
  Dark Border     #2A2A2A

Greyscale (Black 100 → White)
  #181818  #2F2F2F  #464646  #5D5D5D  #747474  #8B8B8B
  #A3A3A3  #BABABA  #D1D1D1  #E8E8E8  #FFFFFF
`;
  writeFileSync(join(kitDir, "colors", "livepeer-colors.txt"), colors);

  const readme = `Livepeer Brand Kit

Logos (SVG, scalable)
  logos/livepeer-symbol-{white,black}.svg
  logos/livepeer-wordmark-{white,black}.svg
  logos/livepeer-lockup-{white,black}.svg

  Use white variants on dark backgrounds, black variants on light.
  Never rotate, stretch, recolor, or apply effects to the logos.

Colors
  colors/livepeer-colors.txt — hex values for the brand palette.

Typography (not included)
  Favorit Pro (primary) and Favorit Mono are licensed from Dinamo Type.
  We cannot redistribute the font files. License them directly from Dinamo.

More
  Full brand guidelines:  https://livepeer.org/brand
  Questions:              https://discord.gg/livepeer
`;
  writeFileSync(join(kitDir, "README.txt"), readme);

  mkdirSync(outDir, { recursive: true });
  try {
    rmSync(outFile);
  } catch {}

  execSync(`zip -r "${outFile}" livepeer-brand-kit`, {
    cwd: work,
    stdio: "inherit",
  });

  console.log(`\nWrote ${outFile}`);
} finally {
  rmSync(work, { recursive: true, force: true });
}
