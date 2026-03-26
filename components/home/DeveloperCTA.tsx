"use client";

import { motion } from "framer-motion";
import Container from "@/components/ui/Container";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

export default function DeveloperCTA() {
  return (
    <section className="relative py-24 lg:py-32">
      <div className="divider-gradient absolute top-0 left-0 right-0" />

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
              Builders
            </p>
            <h2 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              Start building
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-white/50 text-pretty">
              Explore the codebase, read the primer, or jump into Discord and
              talk to the builders and operators who run the network.
            </p>
            <div className="mt-8 flex justify-center">
              <a
                href="https://discord.gg/livepeer"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-medium text-white transition-all duration-200 hover:brightness-110 active:brightness-95"
                style={{
                  background: "linear-gradient(135deg, #1E9960 0%, #18794E 60%, #115C3B 100%)",
                }}
              >
                Let&apos;s build <span aria-hidden="true">&rarr;</span>
              </a>
            </div>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}
