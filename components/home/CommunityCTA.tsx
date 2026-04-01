"use client";

import { motion } from "framer-motion";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import ImageMask from "@/components/ui/ImageMask";
import GlowOverlay from "@/components/ui/GlowOverlay";
import { EXTERNAL_LINKS } from "@/lib/constants";

const resources = [
  {
    name: "Documentation",
    description: "Technical guides and API references for builders and GPU providers.",
    href: EXTERNAL_LINKS.docs,
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
        <path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    name: "Forum",
    description: "Explore protocol design, upgrades, and long-range ideas.",
    href: EXTERNAL_LINKS.forum,
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    name: "Roadmap",
    description: "See where the network is today, and where it's headed.",
    href: "https://roadmap.livepeer.org/roadmap",
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
        <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
    <section className="relative py-32 lg:py-44 overflow-hidden">
      {/* Top fade — blends into section above */}
      <div
        className="pointer-events-none absolute top-0 left-0 right-0 z-10 h-64"
        aria-hidden="true"
        style={{
          background: "linear-gradient(to bottom, #121212 0%, #121212 20%, transparent 100%)",
        }}
      />

      {/* Animated green glow */}
      <GlowOverlay x={50} y={30} radius={70} opacity={0.2} duration={10} />

      {/* B&W Muybridge plate photo behind tile mask — bold background */}
      <div className="pointer-events-none absolute inset-0 opacity-15" aria-hidden="true">
        <ImageMask
          video="/videos/ai-face.mp4"
          cols={5}
          rows={4}

          seed={55}
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
            <p className="mb-4 font-mono text-xs font-medium tracking-wider text-white/30 uppercase">
              The Network
            </p>
            <h2 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              Powered by independent GPU providers
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-white/50 text-pretty">
              Livepeer is a global network of independent GPU providers, builders,
              and engineers who run the network and shape its direction. Open-source.
              Permissionless.
            </p>
            <div className="mt-8">
              <Button href="/primer" variant="primary">
                About the Network <span aria-hidden="true">&rarr;</span>
              </Button>
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
                className="group flex items-start gap-4 rounded-xl border border-white/[0.07] bg-[#1a1a1a] p-6 transition-colors duration-200 hover:border-white/[0.12]"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03] text-green transition-colors duration-200 group-hover:border-white/[0.10]">
                  {resource.icon}
                </div>
                <div>
                  <h3 className="text-sm font-medium">{resource.name}</h3>
                  <p className="mt-1 text-sm text-white/50">
                    {resource.description}
                  </p>
                </div>
              </motion.a>
            ))}
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
