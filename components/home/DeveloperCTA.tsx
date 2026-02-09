"use client";

import { motion } from "framer-motion";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { EXTERNAL_LINKS } from "@/lib/constants";

const resources = [
  {
    title: "Documentation",
    description: "Comprehensive guides to integrate Livepeer into your application.",
    href: EXTERNAL_LINKS.docs,
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
        <path
          d="M4 4h16v16H4V4zm4 4h8m-8 4h8m-8 4h4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "SDKs & Tools",
    description: "Client libraries, CLI tools, and developer utilities.",
    href: EXTERNAL_LINKS.github,
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
        <path
          d="M16 18l6-6-6-6M8 6l-6 6 6 6"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "Grants Program",
    description: "Funding for teams building on the Livepeer network.",
    href: EXTERNAL_LINKS.grants,
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
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

export default function DeveloperCTA() {
  return (
    <section className="py-24 lg:py-32">
      <Container>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          transition={{ staggerChildren: 0.1 }}
        >
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-3xl text-center"
          >
            <p className="mb-3 font-mono text-sm font-medium tracking-wider text-green uppercase">
              Developers
            </p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Start building today
            </h2>
            <p className="mt-4 text-lg text-white/60">
              Everything you need to integrate real-time video and AI processing
              into your application.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button href={EXTERNAL_LINKS.docs} variant="primary">
                Read the Docs <span aria-hidden="true">&rarr;</span>
              </Button>
              <Button href={EXTERNAL_LINKS.github} variant="secondary">
                View on GitHub
              </Button>
            </div>
          </motion.div>

          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {resources.map((resource) => (
              <motion.a
                key={resource.title}
                href={resource.href}
                target="_blank"
                rel="noopener noreferrer"
                variants={fadeUp}
                transition={{ duration: 0.5 }}
                className="group rounded-2xl border border-dark-border bg-dark-card p-6 transition-colors hover:border-green/20"
              >
                <div className="text-green">{resource.icon}</div>
                <h3 className="mt-4 text-lg font-medium">{resource.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/50">
                  {resource.description}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm text-green opacity-0 transition-opacity group-hover:opacity-100">
                  Learn more <span aria-hidden="true">&rarr;</span>
                </span>
              </motion.a>
            ))}
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
