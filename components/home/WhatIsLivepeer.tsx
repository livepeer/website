"use client";

import { motion } from "framer-motion";
import Container from "@/components/ui/Container";
import SectionHeader from "@/components/ui/SectionHeader";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

export default function WhatIsLivepeer() {
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      <div className="divider-gradient absolute top-0 left-0 right-0" />

      <Container className="relative">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          transition={{ staggerChildren: 0.08 }}
        >
          <motion.div variants={fadeUp} transition={{ duration: 0.4 }}>
            <SectionHeader
              label="Livepeer Solutions"
              title="Specialized real time AI GPUs"
              description="Access real-time video inference through Livepeer Ecosystem solutions like Daydream and Frameworks — or build your own."
              align="split"
            />
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}
