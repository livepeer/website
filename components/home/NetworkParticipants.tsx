"use client";

import { motion } from "framer-motion";
import Container from "@/components/ui/Container";
import SectionHeader from "@/components/ui/SectionHeader";
import ImageMask from "@/components/ui/ImageMask";

const roles = [
  {
    title: "Orchestrators",
    description:
      "GPU operators who perform video transcoding and AI processing work. They stake LPT to signal reliability and compete for jobs based on price, performance, and uptime.",
    icon: (
      <svg className="h-8 w-8" viewBox="0 0 32 32" fill="none">
        <rect
          x="6"
          y="6"
          width="20"
          height="20"
          rx="4"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <rect
          x="11"
          y="11"
          width="10"
          height="10"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="currentColor"
          fillOpacity="0.15"
        />
      </svg>
    ),
  },
  {
    title: "Gateways",
    description:
      "Entry points that route video jobs to the best-suited orchestrators. They handle job selection, load balancing, and quality assurance on behalf of developers.",
    icon: (
      <svg className="h-8 w-8" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="8" cy="24" r="4" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="24" cy="24" r="4" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M16 12v4m-4 4l4-4 4 4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    title: "Delegators",
    description:
      "LPT holders who stake tokens with orchestrators to help secure the network and earn a share of the fees and rewards generated.",
    icon: (
      <svg className="h-8 w-8" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M8 26c0-4.418 3.582-8 8-8s8 3.582 8 8"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    title: "Developers",
    description:
      "Builders who integrate the Livepeer network into their applications through gateways. They send video processing jobs and receive transcoded or AI-processed output.",
    icon: (
      <svg className="h-8 w-8" viewBox="0 0 32 32" fill="none">
        <path
          d="M12 10l-6 6 6 6M20 10l6 6-6 6"
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

export default function NetworkParticipants() {
  return (
    <section className="relative py-20 lg:py-28 overflow-hidden">
      {/* B&W server rack photo behind tile mask */}
      <div
        className="pointer-events-none absolute inset-0 opacity-10"
        aria-hidden="true"
      >
        <ImageMask
          video="/videos/ai-world.mp4"
          cols={5}
          rows={4}
          seed={77}
          className="h-full w-full"
        />
      </div>

      <Container className="relative">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-120px" }}
          transition={{ staggerChildren: 0.06 }}
        >
          <motion.div variants={fadeUp} transition={{ duration: 0.4 }}>
            <SectionHeader
              label="Network"
              title="Who runs the network"
              description="Four key roles work together to power open video infrastructure."
              size="small"
              align="split"
            />
          </motion.div>

          <div className="mt-16 space-y-4">
            {roles.map((role) => (
              <motion.div
                key={role.title}
                variants={fadeUp}
                transition={{ duration: 0.4 }}
                className="flex items-start gap-5 rounded-xl border border-white/[0.07] bg-[#1a1a1a] p-6 transition-colors duration-200 hover:border-white/[0.12]"
              >
                <div className="flex-shrink-0 text-green">{role.icon}</div>
                <div>
                  <h3 className="text-base font-medium">{role.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-white/40">
                    {role.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
