"use client";

import { motion } from "framer-motion";
import Container from "@/components/ui/Container";

const stats = [
  {
    value: "100K+",
    label: "GPUs on network",
    description: "Distributed globally across independent operators",
  },
  {
    value: "$40M+",
    label: "Total stake",
    description: "LPT staked securing the network",
  },
  {
    value: "150M+",
    label: "Minutes transcoded",
    description: "Video processed through the network to date",
  },
  {
    value: "10x",
    label: "Cost reduction",
    description: "Compared to centralized cloud alternatives",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export default function NetworkStats() {
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
            <p className="mb-3 text-center font-mono text-sm font-medium tracking-wider text-green uppercase">
              Network
            </p>
            <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Proven at scale
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-white/60">
              The Livepeer network is live, battle-tested, and growing every day.
            </p>
          </motion.div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <motion.div
                key={stat.label}
                variants={fadeUp}
                transition={{ duration: 0.5 }}
                className="rounded-2xl border border-dark-border bg-dark p-6 text-center"
              >
                <div className="font-mono text-4xl font-bold text-green">
                  {stat.value}
                </div>
                <div className="mt-2 text-sm font-medium">{stat.label}</div>
                <p className="mt-1 text-xs text-white/40">{stat.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
