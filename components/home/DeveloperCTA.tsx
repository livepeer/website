"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import EarlyAccessCTA from "@/components/ui/EarlyAccessCTA";
import { EXTERNAL_LINKS } from "@/lib/constants";

const resources = [
  {
    title: "GitHub",
    description: "Explore the open-source codebase, SDKs, and developer tools.",
    href: EXTERNAL_LINKS.github,
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
        <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.8-.22 1.65-.33 2.5-.33.85 0 1.7.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21.5c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "10-Minute Primer",
    description: "Learn how Livepeer works through storytelling, illustration, and data.",
    href: "/primer",
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
        <path d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Grants Program",
    description: "Funding for teams building on the Livepeer network.",
    href: EXTERNAL_LINKS.grants,
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

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
              Developers
            </p>
            <h2 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              Be first to build
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-white/50 text-pretty">
              Get early access to the Livepeer Gateway — a single API for
              real-time AI video inference, built for developers and AI agents
              alike.
            </p>
            <div className="mt-8 w-full max-w-lg mx-auto">
              <EarlyAccessCTA />
            </div>
            <div className="mt-4 flex justify-center">
              <Button href={EXTERNAL_LINKS.github} variant="secondary">
                View on GitHub
              </Button>
            </div>
          </motion.div>

          <div className="mt-16 grid gap-4 md:grid-cols-3">
            {resources.map((resource) => {
              const isExternal = resource.href.startsWith("http");
              const Tag = isExternal ? motion.a : motion(Link);
              const extraProps = isExternal
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {};

              return (
                <Tag
                  key={resource.title}
                  href={resource.href}
                  variants={fadeUp}
                  transition={{ duration: 0.4 }}
                  className="group rounded-xl border border-white/[0.07] bg-[#1a1a1a] p-6 transition-colors duration-200 hover:border-white/[0.12]"
                  {...extraProps}
                >
                  <div className="text-green">{resource.icon}</div>
                  <h3 className="mt-4 text-lg font-medium">{resource.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/50">
                    {resource.description}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm text-white/40 transition-colors group-hover:text-white/60">
                    Learn more <span aria-hidden="true">&rarr;</span>
                  </span>
                </Tag>
              );
            })}
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
