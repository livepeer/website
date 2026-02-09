"use client";

import { motion } from "framer-motion";
import Container from "@/components/ui/Container";
import SectionHeader from "@/components/ui/SectionHeader";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export default function WhatIsLivepeer() {
  return (
    <section className="border-t border-white/5 bg-dark-lighter py-24 lg:py-32">
      <Container>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          transition={{ staggerChildren: 0.15 }}
        >
          <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
            <SectionHeader
              label="What is Livepeer"
              title="AI infrastructure built for real-time video"
              description="Livepeer is a decentralized network of GPU providers that enables developers to deploy custom AI workflows for real-time video — with low latency, open-source tooling, and on-demand scalability."
            />
          </motion.div>

          {/* Flow diagram */}
          <motion.div
            className="mx-auto mt-16 max-w-3xl"
            variants={fadeUp}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-0">
              {[
                {
                  label: "Your App",
                  sub: "Video input",
                  color: "border-white/20",
                },
                {
                  label: "Gateway",
                  sub: "Route & optimize",
                  color: "border-white/20",
                },
                {
                  label: "Orchestrators",
                  sub: "GPU compute",
                  color: "border-green/50",
                },
                {
                  label: "Output",
                  sub: "Transcoded / AI-processed",
                  color: "border-white/20",
                },
              ].map((step, i) => (
                <div key={step.label} className="flex items-center">
                  <div
                    className={`flex flex-col items-center rounded-xl border ${step.color} bg-dark px-6 py-5 text-center`}
                  >
                    <span className="font-mono text-xs text-green uppercase tracking-wider">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="mt-1.5 text-sm font-medium">
                      {step.label}
                    </span>
                    <span className="mt-1 text-xs text-white/40">
                      {step.sub}
                    </span>
                  </div>
                  {i < 3 && (
                    <svg
                      className="mx-2 hidden h-4 w-8 flex-shrink-0 text-white/20 sm:block"
                      viewBox="0 0 32 16"
                      fill="none"
                    >
                      <path
                        d="M0 8h28m0 0l-6-6m6 6l-6 6"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                    </svg>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}
