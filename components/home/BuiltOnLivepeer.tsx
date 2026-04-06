"use client";

import { motion } from "framer-motion";
import Container from "@/components/ui/Container";
import SectionHeader from "@/components/ui/SectionHeader";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
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
          background:
            "linear-gradient(135deg, #F73B41, #FF982E, #2FBEC5, #36619D)",
        }}
      />
      <span className="text-[17px] font-bold tracking-tight text-white">
        Daydream
      </span>
    </div>
  );
}

function FrameworksLogo({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className ?? ""}`}>
      {/* Interlocking brackets mark */}
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M3 4L7 10L3 16"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M17 4L13 10L17 16"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <line
          x1="8"
          y1="14"
          x2="12"
          y2="6"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
      <span className="text-[17px] font-bold tracking-tight text-white">
        Frameworks
      </span>
    </div>
  );
}

function StreamplaceLogo({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className ?? ""}`}>
      {/* Crystal gem mark from actual logo */}
      <svg width="20" height="20" viewBox="0 0 493.29 481.09" fill="none">
        <path
          d="m253.76 445.69-208.02-93.734-45.742-290.22 243.33-61.739 249.95 58.678-9.9427 310.8z"
          fill="#f8baca"
        />
        <path
          d="m253.59 481.09-241.31-105.15-12.277-314.2 253.59 70.875 239.69-73.936-85.842 261.91z"
          fill="#de91a6"
        />
        <path
          d="m493.29 58.678-239.7 73.933-0.59253 348.48 230.34-111.61z"
          fill="#ac6e81"
        />
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
  const frames = [
    { label: "Input", gradient: "from-orange-500/20 to-orange-600/5" },
    { label: "Depth", gradient: "from-cyan-500/15 to-cyan-600/5" },
    { label: "Style", gradient: "from-orange-400/20 to-cyan-500/10" },
    { label: "Output", gradient: "from-cyan-400/20 to-orange-500/10" },
  ];

  return (
    <div className="relative h-full min-h-[220px] overflow-hidden bg-[#0e0e0e]">
      {/* Ambient glow */}
      <div
        className="absolute h-[300px] w-[300px] rounded-full opacity-20 blur-[100px]"
        style={{ left: "20%", top: "10%", background: "#ff982e" }}
      />
      <div
        className="absolute h-[250px] w-[250px] rounded-full opacity-15 blur-[90px]"
        style={{ right: "10%", bottom: "5%", background: "#1ff4ff" }}
      />

      {/* Main canvas area */}
      <div className="absolute inset-4 flex flex-col">
        {/* Toolbar */}
        <div className="flex items-center justify-between rounded-t-md border border-b-0 border-white/[0.08] bg-black/30 px-3 py-2">
          <div className="flex items-center gap-1.5">
            <span
              className="h-1.5 w-1.5 rounded-full animate-pulse"
              style={{ background: "#ff982e" }}
            />
            <span
              className="font-mono text-[9px] uppercase"
              style={{ color: "rgba(255,152,46,0.6)" }}
            >
              Generating
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[8px] text-white/20">
              1920×1080
            </span>
            <span className="font-mono text-[8px] text-white/20">30fps</span>
            <span className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[8px] text-cyan-400/50">
              GPU×4
            </span>
          </div>
        </div>

        {/* Video preview area — large central frame */}
        <div className="relative flex-1 rounded-b-md border border-white/[0.08] bg-black/20">
          {/* Abstract "generated scene" — layered geometric shapes */}
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 500 300"
            preserveAspectRatio="xMidYMid slice"
            fill="none"
          >
            {/* Landscape horizon */}
            <path
              d="M0 200 Q60 140, 120 170 T240 150 T360 160 T500 130 V300 H0 Z"
              fill="rgba(255,152,46,0.06)"
            />
            <path
              d="M0 220 Q80 180, 160 200 T320 185 T500 170 V300 H0 Z"
              fill="rgba(31,244,255,0.04)"
            />
            {/* Flowing energy lines */}
            <path
              d="M0 140 C80 90, 180 180, 280 120 S420 150, 500 100"
              stroke="rgba(255,152,46,0.2)"
              strokeWidth="1.5"
            />
            <path
              d="M0 170 C100 130, 200 200, 320 150 S460 180, 500 140"
              stroke="rgba(31,244,255,0.12)"
              strokeWidth="1"
            />
            <path
              d="M0 110 C120 60, 220 130, 340 80 S480 110, 500 70"
              stroke="rgba(255,255,255,0.04)"
              strokeWidth="0.8"
            />
            {/* Scattered particles */}
            {[
              [60, 120, "#ff982e", 3],
              [140, 95, "#1ff4ff", 2],
              [230, 140, "#ff982e", 2.5],
              [310, 110, "#1ff4ff", 2],
              [380, 130, "#ff982e", 1.8],
              [440, 100, "#1ff4ff", 3],
              [100, 160, "#ff982e", 1.5],
              [270, 170, "#1ff4ff", 2],
              [190, 115, "#ff982e", 2],
              [350, 155, "#1ff4ff", 1.5],
            ].map(([x, y, c, r], i) => (
              <circle
                key={i}
                cx={x as number}
                cy={y as number}
                r={r as number}
                fill={`${c}44`}
              />
            ))}
            {/* Central bright node */}
            <circle cx="250" cy="135" r="6" fill="rgba(255,152,46,0.15)" />
            <circle cx="250" cy="135" r="3" fill="rgba(255,152,46,0.3)" />
            <circle
              cx="250"
              cy="135"
              r="18"
              fill="none"
              stroke="rgba(255,152,46,0.08)"
              strokeWidth="0.5"
            />
          </svg>

          {/* Pipeline frame strip at bottom */}
          <div className="absolute inset-x-0 bottom-0 border-t border-white/[0.06] bg-black/50 px-3 py-2">
            <div className="flex gap-2">
              {frames.map((f, i) => (
                <div key={i} className="flex-1">
                  <div
                    className={`aspect-video rounded border border-white/[0.08] bg-gradient-to-br ${f.gradient}`}
                  >
                    {/* Mini abstract content per frame */}
                    <svg
                      className="h-full w-full"
                      viewBox="0 0 80 45"
                      fill="none"
                    >
                      {i === 0 && (
                        <>
                          <rect
                            x="20"
                            y="10"
                            width="40"
                            height="25"
                            rx="2"
                            fill="rgba(255,255,255,0.06)"
                          />
                          <circle
                            cx="40"
                            cy="22"
                            r="8"
                            fill="rgba(255,152,46,0.15)"
                          />
                        </>
                      )}
                      {i === 1 && (
                        <>
                          <path
                            d="M0 35 Q20 15, 40 25 T80 18"
                            stroke="rgba(31,244,255,0.3)"
                            strokeWidth="1"
                            fill="none"
                          />
                          <path
                            d="M0 40 Q30 20, 50 30 T80 25"
                            stroke="rgba(31,244,255,0.15)"
                            strokeWidth="0.8"
                            fill="none"
                          />
                        </>
                      )}
                      {i === 2 && (
                        <>
                          <rect
                            x="15"
                            y="8"
                            width="50"
                            height="30"
                            rx="2"
                            fill="rgba(255,152,46,0.08)"
                          />
                          <path
                            d="M20 30 Q40 12, 60 28"
                            stroke="rgba(255,152,46,0.25)"
                            strokeWidth="1"
                            fill="none"
                          />
                        </>
                      )}
                      {i === 3 && (
                        <>
                          <rect
                            x="10"
                            y="5"
                            width="60"
                            height="35"
                            rx="2"
                            fill="rgba(31,244,255,0.06)"
                          />
                          <circle
                            cx="40"
                            cy="22"
                            r="10"
                            fill="rgba(255,152,46,0.1)"
                          />
                          <circle
                            cx="40"
                            cy="22"
                            r="5"
                            fill="rgba(31,244,255,0.15)"
                          />
                        </>
                      )}
                    </svg>
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="font-mono text-[7px] text-white/25">
                      {f.label}
                    </span>
                    {i < 3 && (
                      <span className="font-mono text-[7px] text-white/15">
                        &rarr;
                      </span>
                    )}
                    {i === 3 && (
                      <span className="h-1 w-1 rounded-full bg-emerald-400/50" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient + logo */}
      <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#0e0e0e] via-[#0e0e0e]/80 to-transparent" />
      <div className="absolute bottom-3.5 left-5">
        <DaydreamLogo />
      </div>
    </div>
  );
}

/* ── Product visual: Frameworks — developer tools ── */
function StudioVisual() {
  return (
    <div className="relative h-[220px] overflow-hidden bg-[#0a0a0a]">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0d1117] via-[#0a0a0a] to-[#0d0d10]" />

      {/* Subtle brand gradient accent */}
      <div
        className="absolute h-[120px] w-[200px] rounded-full opacity-10 blur-[60px]"
        style={{
          left: "30%",
          top: "20%",
          background:
            "linear-gradient(135deg, #DC3D42, #F0C000, #299764, #3A5CCC)",
        }}
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
              {
                method: "POST",
                color: "#299764",
                path: "/api/stream",
                status: "200",
              },
              {
                method: "GET",
                color: "#3A5CCC",
                path: "/api/asset/:id",
                status: "200",
              },
              {
                method: "POST",
                color: "#299764",
                path: "/api/ai/generate",
                status: "...",
              },
              {
                method: "GET",
                color: "#3A5CCC",
                path: "/api/pipeline/:id",
                status: "200",
              },
            ].map((row, i) => (
              <div key={i} className="flex items-center gap-2">
                <span
                  className="rounded px-1.5 py-0.5 font-mono text-[7px] font-medium"
                  style={{
                    background: `${row.color}22`,
                    color: `${row.color}cc`,
                  }}
                >
                  {row.method}
                </span>
                <span className="font-mono text-[8px] text-white/30">
                  {row.path}
                </span>
                <span
                  className="ml-auto font-mono text-[8px]"
                  style={{
                    color:
                      row.status === "200"
                        ? "rgba(41,151,100,0.6)"
                        : "rgba(255,255,255,0.2)",
                  }}
                >
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
              <div
                key={s.label}
                className="rounded border border-white/[0.06] bg-white/[0.02] px-2 py-1.5"
              >
                <div className="font-mono text-[7px] text-white/20">
                  {s.label}
                </div>
                <div className="font-mono text-[12px] font-semibold text-white/60">
                  {s.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom gradient + logo */}
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/90 to-transparent" />
      <div className="absolute bottom-3 left-5">
        <FrameworksLogo className="h-5 w-auto opacity-90" />
      </div>
    </div>
  );
}

/* ── Product visual: Streamplace — decentralized social livestreaming ── */
function StreamplaceVisual() {
  return (
    <div className="relative h-[220px] overflow-hidden bg-[#0a0a0a]">
      {/* Streamplace brand: pink/mauve tones */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#140d10] via-[#0a0a0a] to-[#110d0f]" />

      {/* Subtle brand glow */}
      <div
        className="absolute h-[120px] w-[120px] rounded-full opacity-15 blur-[50px]"
        style={{ left: "20%", top: "15%", background: "#de91a6" }}
      />

      <div className="absolute inset-4 flex gap-3">
        {/* Stream viewer — main content area */}
        <div className="relative flex-1 overflow-hidden rounded-md border border-white/[0.06] bg-[#111]">
          {/* Video placeholder with silhouette */}
          <div className="flex h-full items-center justify-center">
            <div className="relative flex flex-col items-center">
              <div className="h-12 w-12 rounded-full bg-white/[0.06]" />
              <div className="mt-1 h-8 w-16 rounded-t-full bg-white/[0.04]" />
            </div>
          </div>

          {/* LIVE badge */}
          <div className="absolute left-2 top-2 flex items-center gap-1.5 rounded bg-red-500/20 px-2 py-0.5">
            <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" />
            <span className="font-mono text-[8px] font-medium text-red-400/80">
              LIVE
            </span>
          </div>

          {/* Viewer count */}
          <div className="absolute right-2 top-2 rounded bg-black/40 px-2 py-0.5">
            <span className="font-mono text-[8px] text-white/30">
              847 watching
            </span>
          </div>

          {/* Streamer handle */}
          <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
            <div className="h-4 w-4 rounded-full bg-[#de91a6]/30" />
            <span className="font-mono text-[8px] text-white/40">
              @alice.bsky.social
            </span>
          </div>

          {/* AT Protocol badge */}
          <div className="absolute bottom-2 right-2 rounded bg-white/[0.04] px-1.5 py-0.5">
            <span className="font-mono text-[7px] text-white/20">
              AT Protocol
            </span>
          </div>
        </div>

        {/* Chat / social sidebar */}
        <div className="flex w-[100px] flex-col gap-1.5 overflow-hidden rounded-md border border-white/[0.06] bg-[#0c0c0c] p-2">
          <div className="font-mono text-[7px] text-white/25 uppercase">
            Chat
          </div>
          {[
            { handle: "bob", msg: "this is amazing" },
            { handle: "cara", msg: "how is this decentralized?" },
            { handle: "dave", msg: "built on livepeer infra" },
            { handle: "eve", msg: "no cold starts either" },
            { handle: "frank", msg: "open source too" },
          ].map((c, i) => (
            <div key={i} className="text-[7px] leading-tight">
              <span style={{ color: "rgba(222,145,166,0.6)" }}>
                @{c.handle}
              </span>
              <span className="text-white/25"> {c.msg}</span>
            </div>
          ))}
          {/* Chat input */}
          <div className="mt-auto rounded border border-white/[0.06] bg-white/[0.02] px-1.5 py-1">
            <span className="font-mono text-[7px] text-white/15">
              Say something...
            </span>
          </div>
        </div>
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
        style={{
          left: "35%",
          top: "25%",
          background: "linear-gradient(135deg, #a78bfa, #34d399)",
        }}
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
              <div className="font-mono text-[7px] text-purple-400/50 uppercase">
                Agent Status
              </div>
              <div className="mt-0.5 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/70" />
                <span className="font-mono text-[10px] text-white/50">
                  Active
                </span>
              </div>
            </div>
            <div className="rounded-md border border-white/[0.06] bg-white/[0.02] px-3 py-2">
              <div className="font-mono text-[7px] text-purple-400/50 uppercase">
                Mode
              </div>
              <div className="mt-0.5 font-mono text-[10px] text-white/50">
                Voice + Avatar
              </div>
            </div>
            <div className="rounded-md border border-white/[0.06] bg-white/[0.02] px-3 py-2">
              <div className="font-mono text-[7px] text-purple-400/50 uppercase">
                Latency
              </div>
              <div className="mt-0.5 font-mono text-[10px] text-white/50">
                18ms
              </div>
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
    Logo: DaydreamLogo,
    description:
      "Turn a live camera feed into AI-generated video, in real time.",
    domain: "daydream.live",
  },
  {
    Visual: StudioVisual,
    Logo: FrameworksLogo,
    description:
      "Stream to any device, any format, any scale, from a single source.",
    domain: "frameworks.network",
  },
  {
    Visual: StreamplaceVisual,
    Logo: StreamplaceLogo,
    description:
      "Open-source video infrastructure powering AT Protocol social apps.",
    domain: "stream.place",
  },
  {
    Visual: EmbodyVisual,
    Logo: EmbodyLogo,
    description: "Deploy AI avatars that see, speak, and respond in real time.",
    domain: "embody.zone",
  },
];

export default function BuiltOnLivepeer() {
  const [featured, ...rest] = projects;

  return (
    <section className="relative py-24 lg:py-32">
      <div className="divider-gradient absolute top-0 left-0 right-0" />

      <Container>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          transition={{ staggerChildren: 0.06 }}
        >
          <motion.div variants={fadeUp} transition={{ duration: 0.4 }}>
            <SectionHeader
              label="Ecosystem"
              title="Discover applications built on Livepeer"
              description="Explore applications and emerging capabilities on Livepeer, from real-time AI video and AI avatars to transcoding and streaming."
              align="split"
            />
          </motion.div>

          {/* Bento grid: featured card + 3 smaller cards */}
          <div className="mt-20 grid gap-4 lg:grid-cols-2 lg:grid-rows-3">
            {/* Featured — Daydream (spans all 3 rows on desktop) */}
            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.4 }}
              className="lg:row-span-3"
            >
              <div className="flex h-full flex-col overflow-hidden rounded-xl border border-white/[0.07] bg-[#1a1a1a]">
                <div className="relative flex-1 min-h-[220px]">
                  <div className="absolute inset-0">
                    <featured.Visual />
                  </div>
                </div>
                <div className="px-6 py-5">
                  <p className="text-sm leading-relaxed text-white/50">
                    {featured.description}
                  </p>
                  <span className="mt-3 inline-block text-[13px] text-white/25">
                    {featured.domain}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* 3 smaller cards stacked on the right */}
            {rest.map((project, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                transition={{ duration: 0.4 }}
              >
                <div className="flex h-full flex-col overflow-hidden rounded-xl border border-white/[0.07] bg-[#1a1a1a]">
                  <div className="px-5 pt-5 pb-4">
                    <project.Logo />
                    <p className="mt-3 text-[13px] leading-relaxed text-white/50">
                      {project.description}
                    </p>
                    <span className="mt-3 inline-block text-[13px] text-white/25">
                      {project.domain}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.4 }}
            className="mt-12 text-center"
          >
            <a
              href="/ecosystem"
              className="inline-flex items-center gap-1.5 rounded-lg px-5 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:brightness-110 active:brightness-95"
              style={{
                background:
                  "linear-gradient(135deg, #1E9960 0%, #18794E 60%, #115C3B 100%)",
              }}
            >
              Explore the ecosystem <span aria-hidden="true">→</span>
            </a>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}
