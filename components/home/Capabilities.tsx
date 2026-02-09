"use client";

import { motion } from "framer-motion";
import Container from "@/components/ui/Container";
import SectionHeader from "@/components/ui/SectionHeader";
import Card from "@/components/ui/Card";

const capabilities = [
  {
    title: "Video Transcoding",
    description:
      "Adaptive bitrate transcoding that scales on demand. Deliver video to any device, any format, at a fraction of legacy cloud costs.",
    icon: (
      <svg className="h-8 w-8" viewBox="0 0 32 32" fill="none">
        <rect
          x="3"
          y="6"
          width="26"
          height="18"
          rx="3"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M13 12l6 4-6 4V12z"
          fill="currentColor"
          fillOpacity="0.3"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "Livestreaming",
    description:
      "Low-latency live video delivery powered by a global network of GPU providers. No single point of failure, no vendor lock-in.",
    icon: (
      <svg className="h-8 w-8" viewBox="0 0 32 32" fill="none">
        <circle
          cx="16"
          cy="16"
          r="4"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M8.5 8.5a11 11 0 0 1 15 0M5 5a16 16 0 0 1 22 0"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M23.5 23.5a11 11 0 0 1-15 0M27 27a16 16 0 0 1-22 0"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    title: "Real-Time AI Processing",
    description:
      "Deploy custom AI workflows — object detection, generative overlays, world models — on real-time video streams with sub-second latency.",
    icon: (
      <svg className="h-8 w-8" viewBox="0 0 32 32" fill="none">
        <rect
          x="4"
          y="4"
          width="10"
          height="10"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <rect
          x="18"
          y="4"
          width="10"
          height="10"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <rect
          x="4"
          y="18"
          width="10"
          height="10"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <rect
          x="18"
          y="18"
          width="10"
          height="10"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="currentColor"
          fillOpacity="0.15"
        />
        <path
          d="M22 22l2 2 4-4"
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
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export default function Capabilities() {
  return (
    <section className="py-24 lg:py-32">
      <Container>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          transition={{ staggerChildren: 0.1 }}
        >
          <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
            <SectionHeader
              label="Capabilities"
              title="What you can build"
              description="From traditional video streaming to cutting-edge AI-powered real-time experiences — all on open, decentralized infrastructure."
            />
          </motion.div>

          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {capabilities.map((cap) => (
              <motion.div
                key={cap.title}
                variants={fadeUp}
                transition={{ duration: 0.5 }}
              >
                <Card className="h-full transition-colors hover:border-green/20">
                  <div className="text-green">{cap.icon}</div>
                  <h3 className="mt-4 text-lg font-medium">{cap.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/50">
                    {cap.description}
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
