"use client";

import { motion } from "framer-motion";
import Container from "@/components/ui/Container";
import SectionHeader from "@/components/ui/SectionHeader";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

const projects = [
  {
    name: "Livepeer Studio",
    description:
      "The gateway to the Livepeer network. A developer platform with APIs for livestreaming, on-demand video, and AI processing.",
    badge: "Gateway",
    href: "https://livepeer.studio",
  },
  {
    name: "Daydream",
    description:
      "AI-powered creative tools for real-time video generation and interactive streaming experiences built on Livepeer.",
    badge: "AI Video",
    href: "#",
  },
  {
    name: "Streamplace",
    description:
      "Live collaborative streaming studio powered by Livepeer's real-time infrastructure for multi-participant broadcasts.",
    badge: "Streaming",
    href: "#",
  },
  {
    name: "Your Project",
    description:
      "Build the next breakthrough in real-time video and AI. Open infrastructure means anyone can build on top.",
    badge: "Build",
    href: "https://docs.livepeer.org",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export default function BuiltOnLivepeer() {
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
              label="Ecosystem"
              title="Built on Livepeer"
              description="A growing ecosystem of applications and services powered by the Livepeer network."
            />
          </motion.div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2">
            {projects.map((project) => (
              <motion.div
                key={project.name}
                variants={fadeUp}
                transition={{ duration: 0.5 }}
              >
                <a
                  href={project.href}
                  target={project.href.startsWith("http") ? "_blank" : undefined}
                  rel={
                    project.href.startsWith("http")
                      ? "noopener noreferrer"
                      : undefined
                  }
                  className="block h-full"
                >
                  <Card className="h-full transition-colors hover:border-green/20">
                    <Badge>{project.badge}</Badge>
                    <h3 className="mt-4 text-lg font-medium">{project.name}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/50">
                      {project.description}
                    </p>
                  </Card>
                </a>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
