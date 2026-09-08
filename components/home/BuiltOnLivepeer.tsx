"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Container from "@/components/ui/Container";
import SectionHeader from "@/components/ui/SectionHeader";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

/* ── Brand panels ── each project's poster: bold brand-colored panel with
   its logo + wordmark as the hero. Replaces the bespoke dashboard mocks. */

function DaydreamPanel() {
  return (
    <div
      className="relative flex h-full items-center justify-center overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #E84549 0%, #F38F3E 35%, #3DB5BE 70%, #406FA0 100%)",
      }}
    >
      <div
        className="absolute inset-0 opacity-25 mix-blend-overlay"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 30% 30%, rgba(255,255,255,0.4), transparent 70%)",
        }}
      />
      <div className="relative flex items-center gap-3 text-white">
        <svg
          width="42"
          height="40"
          viewBox="0 0 78 74"
          fill="none"
          aria-hidden="true"
        >
          <path d="M35 8 A28 28 0 0 0 35 64 L35 8 Z" fill="currentColor" />
          <circle cx="52" cy="36" r="15" fill="currentColor" />
        </svg>
        <span className="text-[32px] font-bold tracking-tight">Daydream</span>
      </div>
    </div>
  );
}

function FrameworksPanel() {
  return (
    <div
      className="relative flex h-full items-center justify-center overflow-hidden"
      style={{ background: "#1b1c28" }}
    >
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background:
            "repeating-linear-gradient(180deg, transparent 0, transparent 3px, rgba(255,255,255,0.025) 3px, rgba(255,255,255,0.025) 4px)",
        }}
      />
      <div className="relative flex items-center gap-3 text-white">
        <svg width="40" height="40" viewBox="0 0 20 20" fill="none">
          <path
            d="M3 4L7 10L3 16"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M17 4L13 10L17 16"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <line
            x1="8"
            y1="14"
            x2="12"
            y2="6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        <span className="text-[32px] font-bold tracking-tight">Frameworks</span>
      </div>
    </div>
  );
}

function StreamplacePanel() {
  return (
    <div
      className="relative flex h-full items-center justify-center overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #E967B8 0%, #D94BA8 50%, #B23A8C 100%)",
      }}
    >
      <div
        className="absolute inset-0 opacity-20 mix-blend-overlay"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 70% 30%, rgba(255,255,255,0.5), transparent 65%)",
        }}
      />
      <div className="relative flex items-center gap-3 text-white">
        <svg width="38" height="38" viewBox="0 0 493.29 481.09" fill="none">
          <path
            d="m253.76 445.69-208.02-93.734-45.742-290.22 243.33-61.739 249.95 58.678-9.9427 310.8z"
            fill="currentColor"
            fillOpacity="0.95"
          />
          <path
            d="m253.59 481.09-241.31-105.15-12.277-314.2 253.59 70.875 239.69-73.936-85.842 261.91z"
            fill="currentColor"
            fillOpacity="0.7"
          />
          <path
            d="m493.29 58.678-239.7 73.933-0.59253 348.48 230.34-111.61z"
            fill="currentColor"
            fillOpacity="0.45"
          />
        </svg>
        <span className="text-[32px] font-bold tracking-tight">Streamplace</span>
      </div>
    </div>
  );
}

const projects = [
  {
    slug: "daydream",
    name: "Daydream",
    category: "Generative",
    tagline: "Real-time generative AI video, open and remixable",
    Panel: DaydreamPanel,
  },
  {
    slug: "frameworks",
    name: "Frameworks",
    category: "Infrastructure",
    tagline: "The open streaming stack for live video",
    Panel: FrameworksPanel,
  },
  {
    slug: "streamplace",
    name: "Streamplace",
    category: "Social",
    tagline: "The video layer for decentralized social",
    Panel: StreamplacePanel,
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
          transition={{ staggerChildren: 0.06 }}
        >
          <motion.div variants={fadeUp} transition={{ duration: 0.4 }}>
            <SectionHeader
              label="Ecosystem"
              title={
                <>
                  Discover applications{" "}
                  <span className="text-foreground/50">built on Livepeer</span>
                </>
              }
              description="Explore applications and emerging capabilities on Livepeer, from real-time AI video and AI avatars to transcoding and streaming."
              align="split"
            />
          </motion.div>

          {/* Linear-style brand poster grid — each project is a bold,
              brand-colored panel with the logo as the hero, tagline + link
              sitting on the page below. */}
          <div className="mt-20 grid grid-cols-1 gap-x-6 gap-y-10 md:grid-cols-3 md:gap-y-12">
            {projects.map((project) => (
              <motion.div
                key={project.slug}
                variants={fadeUp}
                transition={{ duration: 0.4 }}
              >
                <Link
                  href={`/ecosystem/${project.slug}`}
                  className="group block"
                >
                  {/* Brand poster panel */}
                  <div className="relative aspect-[16/10] overflow-hidden rounded-xl ring-1 ring-foreground/[0.06] transition-all duration-300 group-hover:ring-foreground/[0.12] group-hover:-translate-y-0.5">
                    <project.Panel />
                  </div>
                  {/* Caption */}
                  <p className="mt-5 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-foreground/45">
                    {project.category}
                  </p>
                  <h3 className="mt-2 text-[19px] font-medium leading-snug tracking-tight text-foreground lg:text-[21px]">
                    {project.tagline}
                  </h3>
                  <span className="mt-3 inline-flex items-center gap-1.5 text-[13px] text-foreground/55 transition-colors group-hover:text-foreground">
                    Learn more
                    <span
                      className="transition-transform group-hover:translate-x-0.5"
                      aria-hidden="true"
                    >
                      →
                    </span>
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>

          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.4 }}
            className="mt-12 text-center"
          >
            <Link
              href="/ecosystem"
              className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-all duration-200 hover:bg-foreground/90 active:bg-foreground/80"
            >
              Explore the ecosystem <span aria-hidden="true">→</span>
            </Link>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}
