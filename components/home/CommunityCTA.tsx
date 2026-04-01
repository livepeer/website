"use client";

import { motion } from "framer-motion";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import ImageMask from "@/components/ui/ImageMask";
import GlowOverlay from "@/components/ui/GlowOverlay";
import { EXTERNAL_LINKS } from "@/lib/constants";

const channels = [
  {
    name: "Discord",
    description: "Join the conversation with developers and the core team.",
    href: EXTERNAL_LINKS.discord,
    icon: (
      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
      </svg>
    ),
  },
  {
    name: "Governance",
    description: "Participate in proposals that shape the network's future.",
    href: "https://explorer.livepeer.org/voting",
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    name: "Treasury",
    description:
      "Submit proposals for grants and funding from the Livepeer Treasury.",
    href: "/blog/using-the-livepeer-community-treasury",
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
        <path
          d="M2 7h20M2 7v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7M2 7l2-4h16l2 4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="13" r="3" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    name: "Forum",
    description: "Long-form discussion on protocol development and ideas.",
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
          background:
            "linear-gradient(to bottom, #121212 0%, #121212 20%, transparent 100%)",
        }}
      />

      {/* Animated green glow */}
      <GlowOverlay x={50} y={30} radius={70} opacity={0.2} duration={10} />

      {/* B&W Muybridge plate photo behind tile mask — bold background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-15"
        aria-hidden="true"
      >
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
              Community
            </p>
            <h2 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              Join the network
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-white/50 text-pretty">
              Livepeer is built by a global community of developers, operators,
              and token holders working together to create open video
              infrastructure.
            </p>
            <div className="mt-8">
              <Button href={EXTERNAL_LINKS.discord} variant="primary">
                Join Discord <span aria-hidden="true">&rarr;</span>
              </Button>
            </div>
          </motion.div>

          <div className="mt-16 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {channels.map((channel) => (
              <motion.a
                key={channel.name}
                href={channel.href}
                target={channel.href.startsWith("http") ? "_blank" : undefined}
                rel={
                  channel.href.startsWith("http")
                    ? "noopener noreferrer"
                    : undefined
                }
                variants={fadeUp}
                transition={{ duration: 0.4 }}
                className="group flex items-start gap-4 rounded-xl border border-white/[0.07] bg-[#1a1a1a] p-6 transition-colors duration-200 hover:border-white/[0.12]"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03] text-green transition-colors duration-200 group-hover:border-white/[0.10]">
                  {channel.icon}
                </div>
                <div>
                  <h3 className="text-sm font-medium">{channel.name}</h3>
                  <p className="mt-1 text-sm text-white/50">
                    {channel.description}
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
