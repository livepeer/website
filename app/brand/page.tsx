"use client";

import { useState } from "react";
import { Check, Copy, Download } from "lucide-react";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import {
  LivepeerSymbol,
  LivepeerWordmark,
  LivepeerLockup,
} from "@/components/icons/LivepeerLogo";
import { EXTERNAL_LINKS } from "@/lib/constants";

const greenVariants = [
  { name: "Green", hex: "#18794E", token: "green" },
  { name: "Green Light", hex: "#1E9960", token: "green-light" },
  { name: "Green Dark", hex: "#115C3B", token: "green-dark" },
  { name: "Green Bright", hex: "#40BF86", token: "green-bright" },
  { name: "Green Subtle", hex: "rgba(24,121,78,0.15)", token: "green-subtle" },
];

const blueVariants = [
  { name: "Blue", hex: "#146A8F", token: "blue" },
  { name: "Blue Light", hex: "#1380AE", token: "blue-light" },
  { name: "Blue Dark", hex: "#145571", token: "blue-dark" },
  { name: "Blue Bright", hex: "#25ABD0", token: "blue-bright" },
  { name: "Blue Subtle", hex: "rgba(20,106,143,0.15)", token: "blue-subtle" },
];

const darkSurfaces = [
  { name: "Dark", hex: "#181818", token: "dark" },
  { name: "Dark Lighter", hex: "#1E1E1E", token: "dark-lighter" },
  { name: "Dark Card", hex: "#242424", token: "dark-card" },
  { name: "Dark Border", hex: "#2A2A2A", token: "dark-border" },
];

const greyscale = [
  "#181818",
  "#2F2F2F",
  "#464646",
  "#5D5D5D",
  "#747474",
  "#8B8B8B",
  "#A3A3A3",
  "#BABABA",
  "#D1D1D1",
  "#E8E8E8",
  "#FFFFFF",
];

function CopyButton({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="group flex cursor-pointer select-none items-center gap-1.5 font-mono text-xs text-foreground/50 transition-colors hover:text-foreground/80"
      aria-label={`Copy ${label || value}`}
    >
      <span>{value}</span>
      {copied ? (
        <Check
          className="h-3 w-3 text-green-bright"
          strokeWidth={2.5}
          aria-hidden="true"
        />
      ) : (
        <Copy
          className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-60"
          strokeWidth={2}
          aria-hidden="true"
        />
      )}
    </button>
  );
}

function Swatch({
  name,
  hex,
  token,
  dark,
}: {
  name: string;
  hex: string;
  token?: string;
  dark?: boolean;
}) {
  return (
    <div>
      <div
        className={`h-20 rounded-lg border ${dark ? "border-foreground/10" : "border-border"}`}
        style={{ backgroundColor: hex }}
      />
      <p className="mt-2 text-sm text-foreground">{name}</p>
      <CopyButton value={hex} label={name} />
      {token && <p className="font-mono text-[11px] text-foreground/30">{token}</p>}
    </div>
  );
}

function LogoCard({
  variant,
  bg,
  file,
  children,
}: {
  variant: string;
  bg: "dark" | "light";
  file: string;
  children: React.ReactNode;
}) {
  const isDark = bg === "dark";
  // These cards demonstrate the white-on-dark and black-on-light logo
  // variants from the brand book, so their backgrounds MUST stay fixed
  // regardless of the active theme. Using theme-adaptive tokens (bg-card,
  // bg-foreground) would invert the cards in light mode and hide the
  // logos against same-colored backgrounds.
  return (
    <div
      className={`rounded-xl border ${
        isDark
          ? "border-white/10 bg-[#121212]"
          : "border-black/10 bg-white"
      }`}
    >
      <div className="flex h-40 items-center justify-center px-8">
        {children}
      </div>
      <div
        className={`flex items-center justify-between border-t px-4 py-3 text-xs ${
          isDark
            ? "border-white/10 text-white/50"
            : "border-black/10 text-black/50"
        }`}
      >
        <span className="font-mono uppercase tracking-wider">{variant}</span>
        <a
          href={`/brand-assets/${file}`}
          download
          className={`font-mono transition-colors ${
            isDark ? "hover:text-white" : "hover:text-black"
          }`}
        >
          Download SVG ↓
        </a>
      </div>
    </div>
  );
}

export default function BrandPage() {
  return (
    <>
      {/* Header */}
      <section className="relative pt-24 pb-16 lg:pt-32 lg:pb-20">
        <Container>
          <p className="mb-3 font-mono text-sm font-medium tracking-wider text-foreground/40 uppercase">
            Brand
          </p>
          <h1 className="max-w-2xl text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            Brand guidelines
          </h1>
          <p className="mt-6 max-w-xl text-lg text-foreground/60">
            Everything you need to use the Livepeer brand. Download the full
            kit or grab individual assets below.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button
              href="/downloads/livepeer-brand-kit.zip"
              download
              variant="primary"
              size="lg"
            >
              Download Brand Kit
              <Download className="h-4 w-4" strokeWidth={2.5} />
            </Button>
            <span className="font-mono text-xs text-foreground/40">
              ZIP · Logos + colors + usage notes
            </span>
          </div>
        </Container>
      </section>

      {/* Logo */}
      <section id="logo" className="relative py-16 lg:py-20">
        <div className="divider-gradient absolute top-0 left-0 right-0" />
        <Container>
          <div className="mb-10 flex flex-wrap items-baseline justify-between gap-4">
            <div>
              <p className="mb-2 font-mono text-xs tracking-wider text-foreground/40 uppercase">
                Logo
              </p>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Three variants
              </h2>
            </div>
            <p className="max-w-md text-sm text-foreground/60">
              Symbol, wordmark, and lockup. White on dark, black on light.
              Never rotate, stretch, recolor, or apply effects.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <LogoCard
              variant="Symbol"
              bg="dark"
              file="livepeer-symbol-white.svg"
            >
              <LivepeerSymbol className="h-16 w-auto text-white" />
            </LogoCard>
            <LogoCard
              variant="Wordmark"
              bg="dark"
              file="livepeer-wordmark-white.svg"
            >
              <LivepeerWordmark className="h-6 w-auto text-white" />
            </LogoCard>
            <LogoCard
              variant="Lockup"
              bg="dark"
              file="livepeer-lockup-white.svg"
            >
              <LivepeerLockup className="h-6 w-auto text-white" />
            </LogoCard>

            <LogoCard
              variant="Symbol"
              bg="light"
              file="livepeer-symbol-black.svg"
            >
              <LivepeerSymbol className="h-16 w-auto text-[#181818]" />
            </LogoCard>
            <LogoCard
              variant="Wordmark"
              bg="light"
              file="livepeer-wordmark-black.svg"
            >
              <LivepeerWordmark className="h-6 w-auto text-[#181818]" />
            </LogoCard>
            <LogoCard
              variant="Lockup"
              bg="light"
              file="livepeer-lockup-black.svg"
            >
              <LivepeerLockup className="h-6 w-auto text-[#181818]" />
            </LogoCard>
          </div>

          <dl className="mt-10 grid gap-x-10 gap-y-4 text-sm sm:grid-cols-2">
            <div className="flex gap-3">
              <dt className="w-28 flex-shrink-0 font-mono text-xs tracking-wider text-foreground/40 uppercase">
                Clear space
              </dt>
              <dd className="text-foreground/60">
                Maintain space equal to the symbol width on all sides.
              </dd>
            </div>
            <div className="flex gap-3">
              <dt className="w-28 flex-shrink-0 font-mono text-xs tracking-wider text-foreground/40 uppercase">
                Minimum size
              </dt>
              <dd className="text-foreground/60">
                Symbol: 16px. Wordmark and lockup: 24px tall.
              </dd>
            </div>
            <div className="flex gap-3">
              <dt className="w-28 flex-shrink-0 font-mono text-xs tracking-wider text-foreground/40 uppercase">
                Symbol
              </dt>
              <dd className="text-foreground/60">
                Favicons, avatars, app icons — compact spaces where the brand
                is known.
              </dd>
            </div>
            <div className="flex gap-3">
              <dt className="w-28 flex-shrink-0 font-mono text-xs tracking-wider text-foreground/40 uppercase">
                Lockup
              </dt>
              <dd className="text-foreground/60">
                Partner pages, press kits, event signage — anywhere the
                audience may not know the brand.
              </dd>
            </div>
          </dl>

        </Container>
      </section>

      {/* Color */}
      <section id="color" className="relative py-16 lg:py-20">
        <div className="divider-gradient absolute top-0 left-0 right-0" />
        <Container>
          <div className="mb-10">
            <p className="mb-2 font-mono text-xs tracking-wider text-foreground/40 uppercase">
              Color
            </p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Palette
            </h2>
          </div>

          <div className="space-y-10">
            <div>
              <p className="mb-4 font-mono text-xs tracking-wider text-foreground/40 uppercase">
                Green
              </p>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                {greenVariants.map((c) => (
                  <Swatch key={c.token} {...c} />
                ))}
              </div>
            </div>

            <div>
              <p className="mb-4 font-mono text-xs tracking-wider text-foreground/40 uppercase">
                Blue
              </p>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                {blueVariants.map((c) => (
                  <Swatch key={c.token} {...c} />
                ))}
              </div>
            </div>

            <div>
              <p className="mb-4 font-mono text-xs tracking-wider text-foreground/40 uppercase">
                Surfaces
              </p>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {darkSurfaces.map((c) => (
                  <Swatch key={c.token} {...c} />
                ))}
              </div>
            </div>

            <div>
              <p className="mb-4 font-mono text-xs tracking-wider text-foreground/40 uppercase">
                Greyscale
              </p>
              <div className="hidden overflow-hidden rounded-lg border border-border sm:flex">
                {greyscale.map((hex) => (
                  <div key={hex} className="flex-1">
                    <div className="h-16" style={{ backgroundColor: hex }} />
                    <div className="bg-card px-1 py-2 text-center">
                      <p className="font-mono text-[10px] text-foreground/40">
                        {hex}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3 sm:hidden">
                {greyscale.map((hex) => (
                  <div
                    key={hex}
                    className="flex items-center gap-3 rounded-lg border border-border bg-card p-2"
                  >
                    <div
                      className={`h-10 w-10 flex-shrink-0 rounded ${hex === "#FFFFFF" ? "border border-foreground/10" : ""}`}
                      style={{ backgroundColor: hex }}
                    />
                    <CopyButton value={hex} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Typography */}
      <section id="type" className="relative py-16 lg:py-20">
        <div className="divider-gradient absolute top-0 left-0 right-0" />
        <Container>
          <div className="mb-10">
            <p className="mb-2 font-mono text-xs tracking-wider text-foreground/40 uppercase">
              Typography
            </p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Two typefaces
            </h2>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-8">
              <div className="mb-6 flex items-baseline justify-between">
                <h3 className="text-xl font-medium">Favorit Pro</h3>
                <span className="font-mono text-xs text-foreground/40">Sans</span>
              </div>
              <p className="mb-8 text-sm text-foreground/50">
                Primary typeface. Headings, body, UI. Licensed from Dinamo
                Type.
              </p>
              <div className="space-y-5">
                <div>
                  <p className="font-mono text-[10px] tracking-wider text-foreground/30 uppercase">
                    Light 300
                  </p>
                  <p className="text-2xl font-light">The open network</p>
                </div>
                <div>
                  <p className="font-mono text-[10px] tracking-wider text-foreground/30 uppercase">
                    Regular 400
                  </p>
                  <p className="text-2xl">The open network</p>
                </div>
                <div>
                  <p className="font-mono text-[10px] tracking-wider text-foreground/30 uppercase">
                    Medium 500
                  </p>
                  <p className="text-2xl font-medium">The open network</p>
                </div>
                <div>
                  <p className="font-mono text-[10px] tracking-wider text-foreground/30 uppercase">
                    Bold 700
                  </p>
                  <p className="text-2xl font-bold">The open network</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-8">
              <div className="mb-6 flex items-baseline justify-between">
                <h3 className="text-xl font-medium">Favorit Mono</h3>
                <span className="font-mono text-xs text-foreground/40">Mono</span>
              </div>
              <p className="mb-8 text-sm text-foreground/50">
                Stats, labels, code. Licensed from Dinamo Type.
              </p>
              <div className="space-y-5">
                <div>
                  <p className="font-mono text-[10px] tracking-wider text-foreground/30 uppercase">
                    Regular 400
                  </p>
                  <p className="font-mono text-xl">GPU · 0123456789</p>
                </div>
                <div>
                  <p className="font-mono text-[10px] tracking-wider text-foreground/30 uppercase">
                    Medium 500
                  </p>
                  <p className="font-mono text-xl font-medium">
                    GPU · 0123456789
                  </p>
                </div>
                <div>
                  <p className="font-mono text-[10px] tracking-wider text-foreground/30 uppercase">
                    Bold 700
                  </p>
                  <p className="font-mono text-xl font-bold">
                    GPU · 0123456789
                  </p>
                </div>
              </div>
            </div>
          </div>

          <p className="mt-6 font-mono text-xs text-foreground/40">
            Line heights — 93% display headings · 100% body · 120% mono labels.
          </p>
        </Container>
      </section>

      {/* Footer CTA */}
      <section className="relative py-16 lg:py-20">
        <div className="divider-gradient absolute top-0 left-0 right-0" />
        <Container>
          <p className="text-foreground/60">
            Questions about using the Livepeer brand?{" "}
            <a
              href={EXTERNAL_LINKS.discord}
              target="_blank"
              rel="noreferrer"
              className="text-foreground underline-offset-4 hover:underline"
            >
              Ask on Discord →
            </a>
          </p>
        </Container>
      </section>
    </>
  );
}
