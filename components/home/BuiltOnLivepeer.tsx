"use client";

import { motion } from "framer-motion";
import Container from "@/components/ui/Container";
import SectionHeader from "@/components/ui/SectionHeader";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

/* ── Logos ── */

function DaydreamLogo({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className ?? ""}`}>
      {/* Gradient mark */}
      <div
        className="h-5 w-5 rounded-md"
        style={{
          background: "linear-gradient(135deg, #F73B41, #FF982E, #2FBEC5, #36619D)",
        }}
      />
      <span
        className="text-[17px] font-bold tracking-tight"
        style={{
          background: "linear-gradient(90deg, #FF982E, #2FBEC5)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        Daydream
      </span>
    </div>
  );
}

function StudioLogo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="112"
      height="28"
      viewBox="0 0 112 28"
      fill="none"
    >
      <path d="M27.7245 12.9546V0.631836H30.1511V10.8407H37.264V12.9546H27.7245Z" fill="white" />
      <path d="M38.7062 12.9546V0.631836H41.1329V12.9546H38.7062Z" fill="white" />
      <path d="M52.3521 0.631836H55.0161L50.2947 12.9546H47.1471L42.3202 0.631836H45.037L48.7736 10.4626L52.3521 0.631836Z" fill="white" />
      <path d="M56.2561 12.9546V7.87488H58.6828V5.70968H56.2561V0.631836H65.7957V2.74579H58.6828V5.70968H64.7142V7.87488H58.6828V10.8407H65.9803V12.9546H56.2561Z" fill="white" />
      <path d="M67.8006 12.9546V0.631836H73.4716C75.9246 0.631836 77.5248 1.84837 77.5248 4.27684C77.5248 6.43432 75.9246 7.88779 73.4716 7.88779H70.2273V12.9546H67.8006ZM70.2273 5.69698H73.199C74.4299 5.69698 75.0893 5.1149 75.0893 4.25122C75.0893 3.32151 74.4299 2.74579 73.199 2.74579H70.2273V5.69698Z" fill="white" />
      <path d="M79.1869 12.9546V7.87488H81.6135V5.70968H79.1869V0.631836H88.7264V2.74579H81.6135V5.70968H87.6449V7.87488H81.6135V10.8407H88.911V12.9546H79.1869Z" fill="white" />
      <path d="M90.7313 12.9546V7.87488H93.158V5.70968H90.7313V0.631836H100.271V2.74579H93.158V5.70968H99.1894V7.87488H93.158V10.8407H100.455V12.9546H90.7313Z" fill="white" />
      <path d="M102.276 12.9546V0.631836H108.131C110.35 0.632284 112 1.69461 112 3.70141C112 5.23015 111.297 6.1599 109.855 6.68409C111.165 6.68409 111.815 7.26844 111.815 8.42853V12.9546H109.389V9.02147C109.389 8.13636 109.125 7.87856 108.219 7.87856H104.702V12.9546H102.276ZM104.702 5.70509H107.41C108.826 5.70509 109.565 5.243 109.565 4.23372C109.565 3.22443 108.852 2.74579 107.41 2.74579H104.702V5.70509Z" fill="white" />
      <path d="M26.7639 23.2386H29.1136C29.1984 24.4675 30.1145 25.3788 31.8959 25.3788H32.0655C33.3379 25.3788 34.0505 24.7183 34.0505 23.9241C34.0505 23.1968 33.7196 22.8122 32.6763 22.6032L30.5047 22.1601C28.3756 21.717 27.3746 20.5299 27.3746 18.699C27.3407 16.8765 29.1051 15.0707 31.9807 15.1042C34.8648 15.0791 36.6122 16.7678 36.5868 19.0418H34.2371C34.1607 17.8296 33.27 17.1608 31.9807 17.1608H31.8026C30.5386 17.1608 29.7243 17.8379 29.7243 18.6154C29.7243 19.3929 30.1485 19.7608 31.2003 19.9698L33.0241 20.3292C35.1871 20.7556 36.3916 21.8675 36.3916 23.7485C36.4171 25.8051 34.6357 27.4521 31.7177 27.427C28.4434 27.427 26.8657 25.7717 26.7639 23.2386Z" fill="white" />
      <path d="M41.4342 27.2598V17.328H37.2353V15.2714H48.0082V17.328H43.7838V27.2598H41.4342Z" fill="white" />
      <path d="M49.3414 23.063V15.2714H51.6826V22.7202C51.6826 24.5846 52.4375 25.3788 54.0322 25.3788H54.2019C55.7881 25.3788 56.5516 24.5846 56.5516 22.7202V15.2714H58.8928V23.063C58.8928 25.872 57.3405 27.427 54.1171 27.427C50.8937 27.427 49.3414 25.872 49.3414 23.063Z" fill="white" />
      <path d="M60.8038 27.2598V15.2714H64.9687C68.6417 15.2546 71.161 17.4032 71.1356 21.2656C71.161 25.1363 68.7181 27.2849 65.062 27.2598H60.8038ZM63.145 25.2032H64.7991C66.063 25.2032 67.047 24.9022 67.7425 24.3003C68.4466 23.6984 68.7944 22.6868 68.7944 21.2656C68.7944 19.8527 68.4466 18.8411 67.7425 18.2392C67.047 17.6289 66.063 17.328 64.7991 17.328H63.145V25.2032Z" fill="white" />
      <path d="M72.3564 27.2598V15.2714H74.6976V27.2598H72.3564Z" fill="white" />
      <path d="M76.087 21.2656C76.0531 17.4868 78.53 15.0624 81.9909 15.1042C85.4518 15.0624 87.9457 17.4868 87.9033 21.2656C87.9457 25.0444 85.4518 27.4688 81.9909 27.427C78.53 27.4688 76.0531 25.0444 76.087 21.2656ZM81.9061 25.3788H82.0842C84.2473 25.3788 85.5536 23.8238 85.5536 21.2656C85.5536 18.699 84.2473 17.1608 82.0842 17.1608H81.9061C79.743 17.1608 78.4367 18.699 78.4367 21.2656C78.4367 23.8238 79.743 25.3788 81.9061 25.3788Z" fill="white" />
      {/* Diamond symbol */}
      <path d="M0 6.83208V2.87255H4.00769V6.83208H0Z" fill="white" />
      <path d="M7.35362 11.4427V7.48319H11.3613V11.4427H7.35362Z" fill="white" />
      <path d="M14.7072 16.0584V12.0988H18.7149V16.0584H14.7072Z" fill="white" />
      <path d="M7.35362 20.664V16.7045H11.3613V20.664H7.35362Z" fill="white" />
      <path d="M0 25.2797V21.3201H4.00769V25.2797H0Z" fill="white" />
      <path d="M0 16.0584V12.0988H4.00769V16.0584H0Z" fill="white" />
    </svg>
  );
}

function StreamplaceLogo({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className ?? ""}`}>
      {/* Crystal gem mark from actual logo */}
      <svg width="20" height="20" viewBox="0 0 493.29 481.09" fill="none">
        <path d="m253.76 445.69-208.02-93.734-45.742-290.22 243.33-61.739 249.95 58.678-9.9427 310.8z" fill="#f8baca" />
        <path d="m253.59 481.09-241.31-105.15-12.277-314.2 253.59 70.875 239.69-73.936-85.842 261.91z" fill="#de91a6" />
        <path d="m493.29 58.678-239.7 73.933-0.59253 348.48 230.34-111.61z" fill="#ac6e81" />
      </svg>
      <span className="text-[17px] font-bold tracking-tight text-white">
        Streamplace
      </span>
    </div>
  );
}

function EmbodyLogo({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className ?? ""}`}>
      {/* Abstract avatar mark */}
      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-purple-400/40 to-emerald-400/30">
        <div className="h-2.5 w-2.5 rounded-full bg-white/20" />
      </div>
      <span className="text-[17px] font-bold tracking-tight text-white">
        Embody
      </span>
    </div>
  );
}

/* ── Product visual: Daydream — real-time AI video ── */
function DaydreamVisual() {
  return (
    <div className="relative h-[220px] overflow-hidden bg-[#121212]">
      {/* Gradient blobs — Daydream brand: orange + cyan */}
      <div
        className="absolute h-[200px] w-[200px] rounded-full opacity-30 blur-[80px]"
        style={{ left: "10%", top: "-20%", background: "#ff982e" }}
      />
      <div
        className="absolute h-[160px] w-[160px] rounded-full opacity-20 blur-[70px]"
        style={{ right: "5%", bottom: "-10%", background: "#1ff4ff" }}
      />

      {/* Canvas viewport */}
      <div className="absolute inset-4 rounded-md border border-white/[0.08]">
        {/* Generated scene — abstract flowing forms */}
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 400 200"
          preserveAspectRatio="xMidYMid slice"
          fill="none"
        >
          <path
            d="M-20 110 C80 50, 160 170, 240 90 S380 130, 420 70"
            stroke="rgba(255,152,46,0.25)"
            strokeWidth="1.5"
          />
          <path
            d="M-20 150 C100 90, 180 190, 280 120 S400 160, 440 100"
            stroke="rgba(31,244,255,0.15)"
            strokeWidth="1"
          />
          <path
            d="M-40 70 C60 30, 140 110, 220 50 S360 90, 440 40"
            stroke="rgba(255,255,255,0.04)"
            strokeWidth="0.8"
          />
          {/* Nodes */}
          {[
            [80, 68, "#ff982e"], [160, 130, "#1ff4ff"], [240, 90, "#ff982e"],
            [320, 108, "#1ff4ff"], [120, 118, "#ff982e"], [200, 155, "#1ff4ff"],
          ].map(([x, y, c], i) => (
            <circle
              key={i}
              cx={x as number}
              cy={y as number}
              r={i % 2 === 0 ? 2.5 : 1.8}
              fill={`${c}66`}
            />
          ))}
        </svg>

        {/* Timeline */}
        <div className="absolute bottom-0 left-0 right-0 flex items-center gap-2 border-t border-white/[0.06] bg-black/40 px-3 py-1.5">
          <div className="h-1 flex-1 rounded-full bg-white/[0.06]">
            <div className="h-full w-[45%] rounded-full" style={{ background: "linear-gradient(to right, #ff982e, #1ff4ff)" }} />
          </div>
          <span className="font-mono text-[8px] text-white/25">02:34</span>
        </div>
      </div>

      {/* HUD */}
      <div className="absolute left-7 top-7 flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: "#ff982e" }} />
        <span className="font-mono text-[9px] uppercase" style={{ color: "rgba(255,152,46,0.6)" }}>
          Generating
        </span>
      </div>

      {/* Bottom gradient + logo */}
      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#121212] to-transparent" />
      <div className="absolute bottom-3.5 left-5">
        <DaydreamLogo />
      </div>
    </div>
  );
}

/* ── Product visual: Livepeer Studio — developer gateway ── */
function StudioVisual() {
  return (
    <div className="relative h-[220px] overflow-hidden bg-[#0a0a0a]">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0d1117] via-[#0a0a0a] to-[#0d0d10]" />

      {/* Subtle brand gradient accent */}
      <div
        className="absolute h-[120px] w-[200px] rounded-full opacity-10 blur-[60px]"
        style={{ left: "30%", top: "20%", background: "linear-gradient(135deg, #DC3D42, #F0C000, #299764, #3A5CCC)" }}
      />

      {/* Mini API dashboard */}
      <div className="absolute inset-4 rounded-md border border-white/[0.06] bg-[#0c0c0c]">
        <div className="flex items-center gap-2 border-b border-white/[0.06] px-3 py-2">
          <div className="flex gap-1">
            <div className="h-1.5 w-1.5 rounded-full bg-white/10" />
            <div className="h-1.5 w-1.5 rounded-full bg-white/10" />
            <div className="h-1.5 w-1.5 rounded-full bg-white/10" />
          </div>
          <div className="ml-2 h-3 w-24 rounded bg-white/[0.04]" />
        </div>

        <div className="p-3">
          <div className="space-y-2">
            {[
              { method: "POST", color: "#299764", path: "/api/stream", status: "200" },
              { method: "GET", color: "#3A5CCC", path: "/api/asset/:id", status: "200" },
              { method: "POST", color: "#299764", path: "/api/ai/generate", status: "..." },
              { method: "GET", color: "#3A5CCC", path: "/api/pipeline/:id", status: "200" },
            ].map((row, i) => (
              <div key={i} className="flex items-center gap-2">
                <span
                  className="rounded px-1.5 py-0.5 font-mono text-[7px] font-medium"
                  style={{ background: `${row.color}22`, color: `${row.color}cc` }}
                >
                  {row.method}
                </span>
                <span className="font-mono text-[8px] text-white/30">{row.path}</span>
                <span className="ml-auto font-mono text-[8px]" style={{ color: row.status === "200" ? "rgba(41,151,100,0.6)" : "rgba(255,255,255,0.2)" }}>
                  {row.status}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-3 flex gap-2">
            {[
              { label: "Requests", value: "2.4M" },
              { label: "Latency", value: "23ms" },
              { label: "Uptime", value: "99.9%" },
            ].map((s) => (
              <div key={s.label} className="rounded border border-white/[0.06] bg-white/[0.02] px-2 py-1.5">
                <div className="font-mono text-[7px] text-white/20">{s.label}</div>
                <div className="font-mono text-[12px] font-semibold text-white/60">{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom gradient + logo */}
      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
      <div className="absolute bottom-3 left-5">
        <StudioLogo className="h-5 w-auto opacity-90" />
      </div>
    </div>
  );
}

/* ── Product visual: Streamplace — live collaborative streaming ── */
function StreamplaceVisual() {
  return (
    <div className="relative h-[220px] overflow-hidden bg-[#0a0a0a]">
      {/* Streamplace brand: pink/mauve tones */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#140d10] via-[#0a0a0a] to-[#110d0f]" />

      {/* Multi-participant layout */}
      <div className="absolute inset-4">
        <div className="grid h-full grid-cols-3 gap-1.5">
          {/* Main speaker */}
          <div className="relative col-span-2 row-span-2 overflow-hidden rounded-md border border-white/[0.06] bg-[#111]">
            <div className="flex h-full items-center justify-center">
              <div className="relative flex flex-col items-center">
                <div className="h-10 w-10 rounded-full bg-white/[0.06]" />
                <div className="mt-1 h-8 w-14 rounded-t-full bg-white/[0.04]" />
              </div>
            </div>
            <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1.5 rounded bg-black/50 px-2 py-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
              <span className="font-mono text-[7px] text-white/40">Speaker</span>
            </div>
          </div>

          {/* Thumbnails */}
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="relative overflow-hidden rounded-md border border-white/[0.06] bg-[#111]"
            >
              <div className="flex h-full items-center justify-center">
                <div className="h-5 w-5 rounded-full bg-white/[0.04]" />
              </div>
            </div>
          ))}
        </div>

        {/* Stream toolbar */}
        <div className="absolute bottom-1 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/60 px-3 py-1.5">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex h-5 w-5 items-center justify-center rounded-full bg-white/[0.08]"
            >
              <div className="h-2 w-2 rounded-sm bg-white/20" />
            </div>
          ))}
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500/25">
            <div className="h-2 w-2 rounded-sm bg-red-400/60" />
          </div>
        </div>
      </div>

      {/* LIVE indicator */}
      <div className="absolute right-7 top-7 flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" />
        <span className="font-mono text-[9px] text-red-400/60">LIVE</span>
      </div>

      {/* Bottom gradient + logo */}
      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
      <div className="absolute bottom-3.5 left-5">
        <StreamplaceLogo />
      </div>
    </div>
  );
}

/* ── Product visual: Embody — AI agent avatars ── */
function EmbodyVisual() {
  return (
    <div className="relative h-[220px] overflow-hidden bg-[#0a0a0a]">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f0d14] via-[#0a0a0a] to-[#0d100f]" />

      {/* Subtle glow */}
      <div
        className="absolute h-[140px] w-[140px] rounded-full opacity-15 blur-[60px]"
        style={{ left: "35%", top: "25%", background: "linear-gradient(135deg, #a78bfa, #34d399)" }}
      />

      {/* Agent avatar interface */}
      <div className="absolute inset-4">
        <div className="flex h-full items-center justify-center gap-6">
          {/* Avatar circle */}
          <div className="relative">
            <div className="h-[90px] w-[90px] rounded-full border border-purple-400/15 bg-gradient-to-b from-purple-500/[0.08] to-emerald-500/[0.04]">
              {/* Abstract face features */}
              <div className="flex h-full flex-col items-center justify-center gap-1.5">
                <div className="flex gap-4">
                  <div className="h-2 w-3 rounded-full bg-purple-400/20" />
                  <div className="h-2 w-3 rounded-full bg-purple-400/20" />
                </div>
                <div className="h-1 w-5 rounded-full bg-purple-400/10" />
              </div>
            </div>
            {/* Voice wave ring */}
            <div className="absolute -inset-2 rounded-full border border-purple-400/10 animate-[breathe_3s_ease-in-out_infinite]" />
            <div className="absolute -inset-4 rounded-full border border-purple-400/[0.05] animate-[breathe_3s_ease-in-out_infinite_1s]" />
          </div>

          {/* Agent info panel */}
          <div className="flex flex-col gap-2">
            <div className="rounded-md border border-white/[0.06] bg-white/[0.02] px-3 py-2">
              <div className="font-mono text-[7px] text-purple-400/50 uppercase">Agent Status</div>
              <div className="mt-0.5 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/70" />
                <span className="font-mono text-[10px] text-white/50">Active</span>
              </div>
            </div>
            <div className="rounded-md border border-white/[0.06] bg-white/[0.02] px-3 py-2">
              <div className="font-mono text-[7px] text-purple-400/50 uppercase">Mode</div>
              <div className="mt-0.5 font-mono text-[10px] text-white/50">Voice + Avatar</div>
            </div>
            <div className="rounded-md border border-white/[0.06] bg-white/[0.02] px-3 py-2">
              <div className="font-mono text-[7px] text-purple-400/50 uppercase">Latency</div>
              <div className="mt-0.5 font-mono text-[10px] text-white/50">18ms</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient + logo */}
      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
      <div className="absolute bottom-3.5 left-5">
        <EmbodyLogo />
      </div>
    </div>
  );
}

const projects = [
  {
    Visual: DaydreamVisual,
    description:
      "Open platform for real-time AI video workflows — from generative effects to interactive streaming.",
    href: "https://daydream.live",
    linkLabel: "Visit Daydream",
  },
  {
    Visual: StudioVisual,
    description:
      "Developer gateway to the Livepeer network. APIs for livestreaming, on-demand video, and AI-powered video processing at scale.",
    href: "https://livepeer.studio",
    linkLabel: "Visit Studio",
  },
  {
    Visual: StreamplaceVisual,
    description:
      "The video layer for decentralized social networks. Open-source infrastructure for high-quality video on the AT Protocol.",
    href: "https://stream.place",
    linkLabel: "Visit Streamplace",
  },
  {
    Visual: EmbodyVisual,
    description:
      "Embodied AI avatars for real-time tutoring, telepresence, and branded content powered by Livepeer infrastructure.",
    href: "https://embody.zone",
    linkLabel: "Visit Embody",
  },
];

export default function BuiltOnLivepeer() {
  return (
    <section className="relative py-24 lg:py-32">
      <div className="divider-gradient absolute top-0 left-0 right-0" />

      <Container>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          transition={{ staggerChildren: 0.1 }}
        >
          <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
            <SectionHeader
              label="Ecosystem"
              title="Built on Livepeer"
              description="A growing ecosystem of applications and services powered by the Livepeer network."
            />
          </motion.div>

          <div className="mt-16 grid gap-5 sm:grid-cols-2">
            {projects.map((project, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                transition={{ duration: 0.5 }}
              >
                <a
                  href={project.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block h-full overflow-hidden rounded-2xl border border-dark-border bg-dark-card transition-colors hover:border-green/20"
                >
                  <project.Visual />
                  <div className="px-5 py-4">
                    <p className="text-[13px] leading-relaxed text-white/50">
                      {project.description}
                    </p>
                    <span className="mt-3 inline-flex items-center gap-1 text-[13px] font-medium text-green-bright transition-colors group-hover:text-green-light">
                      {project.linkLabel}
                      <span aria-hidden="true">&rarr;</span>
                    </span>
                  </div>
                </a>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
