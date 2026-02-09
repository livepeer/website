"use client";

import { motion } from "framer-motion";
import Container from "@/components/ui/Container";
import SectionHeader from "@/components/ui/SectionHeader";

const differentiators = [
  {
    stat: "10x+",
    title: "Cost Reduction",
    description:
      "Scale on-demand and pay only for what you use. No idle GPUs, no overprovisioned infrastructure.",
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    stat: "<1s",
    title: "Latency",
    description:
      "Purpose-built for real-time. Deploy AI workflows on live video with sub-second latency that generic GPU clouds can't match.",
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M12 6v6l4 2"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    stat: "∞",
    title: "Scalable",
    description:
      "A global network of GPU providers scales automatically with demand. No capacity planning, no cold starts.",
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
        <path
          d="M4 14l4-4 4 4 8-8"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M16 6h4v4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    stat: "OSS",
    title: "Open Infrastructure",
    description:
      "Fully open-source software stack with decentralized ownership. No vendor lock-in, no platform risk.",
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    ),
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export default function WhyLivepeer() {
  return (
    <section className="border-t border-white/5 bg-dark-lighter py-24 lg:py-32">
      <Container>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          transition={{ staggerChildren: 0.1 }}
        >
          <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
            <SectionHeader
              label="Why Livepeer"
              title="Built different"
              description="Purpose-built infrastructure for the next generation of real-time video and AI experiences."
            />
          </motion.div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2">
            {differentiators.map((item) => (
              <motion.div
                key={item.title}
                variants={fadeUp}
                transition={{ duration: 0.5 }}
                className="flex gap-5"
              >
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-dark-border bg-dark text-green">
                  {item.icon}
                </div>
                <div>
                  <div className="font-mono text-2xl font-bold text-green">
                    {item.stat}
                  </div>
                  <h3 className="mt-1 text-lg font-medium">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/50">
                    {item.description}
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
