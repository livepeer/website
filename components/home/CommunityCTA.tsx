"use client";

import { motion } from "framer-motion";
import Container from "@/components/ui/Container";
import ImageMask from "@/components/ui/ImageMask";
import GlowOverlay from "@/components/ui/GlowOverlay";
import CyclingWords from "@/components/ui/CyclingWords";
import { EXTERNAL_LINKS } from "@/lib/constants";
import {
  CONTRIBUTORS,
  CONTRIBUTOR_STATS,
  type Contributor,
} from "@/lib/contributors";

const sizedAvatar = (avatar: string, size: number) => `${avatar}&s=${size}`;
const contributorName = (c: Contributor) =>
  c.name && c.name !== "-" ? c.name : c.login;
const spotlightAvatars = CONTRIBUTORS.slice(0, 12);
const remainingContributors =
  CONTRIBUTOR_STATS.contributors - spotlightAvatars.length;

const resources = [
  {
    name: "Discord",
    description:
      "Join the operators, developers, and stakeholders building Livepeer.",
    href: EXTERNAL_LINKS.discord,
    icon: (
      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
      </svg>
    ),
  },
  {
    name: "Forum",
    description: "Explore protocol design, upgrades, and long-range ideas.",
    href: EXTERNAL_LINKS.forum,
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
        <path
          d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    name: "Roadmap",
    description: "See where the network is today, and where it's headed.",
    href: "https://roadmap.livepeer.org/roadmap",
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
        <path
          d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

export default function CommunityCTA() {
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      {/* Top fade — blends into section above */}
      <div
        className="pointer-events-none absolute top-0 left-0 right-0 z-10 h-64"
        aria-hidden="true"
        style={{
          background:
            "linear-gradient(to bottom, var(--color-background) 0%, var(--color-background) 20%, transparent 100%)",
        }}
      />

      {/* Bottom fade — blends into footer */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 h-64"
        aria-hidden="true"
        style={{
          background:
            "linear-gradient(to top, var(--color-background) 0%, var(--color-background) 20%, transparent 100%)",
        }}
      />

      {/* Animated green glow */}
      <GlowOverlay x={50} y={30} radius={70} opacity={0.2} duration={10} />

      {/* B&W Muybridge plate photo behind tile mask — bold background.
          Dropped the wrapper `filter: blur(2px)` (it was being re-applied
          to every frame of the autoplaying video, dragging scroll perf)
          and disabled the scan-line sweep in this instance — the video
          already sits at 15% opacity behind text + overlays, so neither
          treatment was visually load-bearing. */}
      <div
        className="pointer-events-none absolute inset-0 opacity-15 light:opacity-[0.045]"
        aria-hidden="true"
      >
        <ImageMask
          video="/videos/ai-face.mp4"
          cols={5}
          rows={4}
          seed={55}
          scanLine={false}
          className="h-full w-full"
        />
      </div>

      <Container className="relative">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          transition={{ staggerChildren: 0.06 }}
        >
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.4 }}
            className="mx-auto max-w-3xl text-center"
          >
            <p className="mb-4 font-mono text-xs font-medium tracking-wider text-foreground/60 uppercase">
              The Network
            </p>
            <h2 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              <span className="block">Powered by independent</span>
              <CyclingWords
                className="text-gradient"
                interval={4000}
                words={["GPU providers", "video engineers", "builders"]}
              />
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-foreground/50 text-pretty">
              Livepeer is a global network of independent GPU providers,
              builders, and engineers who run the network and shape its
              direction. Open-source. Permissionless.
            </p>
            <div className="mt-8">
              <a
                href="/primer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-all duration-200 hover:bg-foreground/90 active:bg-foreground/80"
              >
                About the network <span aria-hidden="true">→</span>
              </a>
            </div>
          </motion.div>

          <div className="mt-16 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {resources.map((resource) => (
              <motion.a
                key={resource.name}
                href={resource.href}
                target="_blank"
                rel="noopener noreferrer"
                variants={fadeUp}
                transition={{ duration: 0.4 }}
                className="group flex items-start gap-4 rounded-xl border border-foreground/[0.07] bg-card p-6 transition-colors duration-200 hover:border-foreground/[0.12]"
              >
                <div className="icon-accent flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-foreground/[0.06] bg-foreground/[0.03] transition-colors duration-200 group-hover:border-foreground/[0.10]">
                  {resource.icon}
                </div>
                <div>
                  <h3 className="text-sm font-medium">{resource.name}</h3>
                  <p className="mt-1 text-sm text-foreground/50">
                    {resource.description}
                  </p>
                </div>
              </motion.a>
            ))}
          </div>

          {/* Open-source contributor strip — understated proof of the
              "builders and engineers who run the network" line above.
              Pulled close to the resource cards so the cards + people read
              as one community hub. Overlapping cluster keeps the visual
              weight centered rather than stretched edge-to-edge. */}
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.4 }}
            className="mt-12 flex flex-col items-center gap-4 text-center"
          >
            <div className="flex items-center justify-center">
              {spotlightAvatars.map((c, i) => (
                <a
                  key={c.login}
                  href={`https://github.com/${c.login}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={`${contributorName(c)} · ${c.yearly.toLocaleString()} contributions`}
                  style={{ zIndex: spotlightAvatars.length - i }}
                  className="group relative -ml-2 transition-transform duration-200 first:ml-0 hover:z-20 hover:-translate-y-1"
                >
                  <img
                    src={sizedAvatar(c.avatar, 96)}
                    alt={contributorName(c)}
                    width={40}
                    height={40}
                    loading="lazy"
                    className="h-10 w-10 rounded-full object-cover ring-2 ring-background grayscale transition duration-200 group-hover:scale-110 group-hover:grayscale-0 group-hover:ring-green/60"
                  />
                </a>
              ))}
              <a
                href={EXTERNAL_LINKS.github}
                target="_blank"
                rel="noopener noreferrer"
                title={`+${remainingContributors} more contributors`}
                style={{ zIndex: 0 }}
                className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full bg-foreground/[0.06] font-mono text-[10px] font-medium text-foreground/60 ring-2 ring-background transition-colors duration-200 hover:bg-foreground/[0.1] hover:text-green-bright"
              >
                +{remainingContributors}
              </a>
            </div>
            <p className="max-w-xl text-sm text-foreground/90">
              Built in the open by{" "}
              <span className="font-medium text-foreground">
                {CONTRIBUTOR_STATS.contributors} contributors
              </span>
              .{" "}
              <a
                href={EXTERNAL_LINKS.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-medium text-foreground underline decoration-foreground/30 underline-offset-4 transition-colors duration-200 hover:text-green-bright hover:decoration-green-bright"
              >
                Contribute on GitHub <span aria-hidden="true">→</span>
              </a>
            </p>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}
