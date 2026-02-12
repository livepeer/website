"use client";

import { motion } from "framer-motion";
import Container from "@/components/ui/Container";
import SectionHeader from "@/components/ui/SectionHeader";
import Card from "@/components/ui/Card";
import ImageMask from "@/components/ui/ImageMask";

const roles = [
  {
    title: "Orchestrators",
    description:
      "GPU operators who perform video transcoding and AI processing work. They stake LPT to signal reliability and compete for jobs based on price, performance, and uptime.",
    color: "border-green/50",
    icon: (
      <svg className="h-8 w-8" viewBox="0 0 32 32" fill="none">
        <rect x="6" y="6" width="20" height="20" rx="4" stroke="currentColor" strokeWidth="1.5" />
        <rect x="11" y="11" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.15" />
      </svg>
    ),
  },
  {
    title: "Gateways",
    description:
      "Entry points that route video jobs to the best-suited orchestrators. They handle job selection, load balancing, and quality assurance on behalf of developers.",
    color: "border-white/20",
    icon: (
      <svg className="h-8 w-8" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="8" cy="24" r="4" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="24" cy="24" r="4" stroke="currentColor" strokeWidth="1.5" />
        <path d="M16 12v4m-4 4l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Delegators",
    description:
      "LPT holders who stake tokens with orchestrators to help secure the network and earn a share of the fees and rewards generated.",
    color: "border-white/20",
    icon: (
      <svg className="h-8 w-8" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 26c0-4.418 3.582-8 8-8s8 3.582 8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Developers",
    description:
      "Builders who integrate the Livepeer network into their applications through gateways. They send video processing jobs and receive transcoded or AI-processed output.",
    color: "border-white/20",
    icon: (
      <svg className="h-8 w-8" viewBox="0 0 32 32" fill="none">
        <path d="M12 10l-6 6 6 6M20 10l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export default function NetworkParticipants() {
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      <div className="divider-gradient absolute top-0 left-0 right-0" />

      {/* B&W server rack photo behind tile mask */}
      <div className="pointer-events-none absolute inset-0 opacity-20" aria-hidden="true">
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
          viewport={{ once: true, margin: "-100px" }}
          transition={{ staggerChildren: 0.1 }}
        >
          <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
            <SectionHeader
              label="Network"
              title="Who runs the network"
              description="Four key roles work together to power open video infrastructure."
            />
          </motion.div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2">
            {roles.map((role) => (
              <motion.div key={role.title} variants={fadeUp} transition={{ duration: 0.5 }}>
                <Card className={`h-full ${role.color}`}>
                  <div className="text-green">{role.icon}</div>
                  <h3 className="mt-4 text-lg font-medium">{role.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/50">
                    {role.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
