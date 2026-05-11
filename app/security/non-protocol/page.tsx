"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import PageHero from "@/components/ui/PageHero";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const SECURITY_EMAIL = "security@livepeer.foundation";
const INC_SECURITY_EMAIL = "security@livepeer.org";

const IN_SCOPE = [
  "livepeer.org (this website)",
  "explorer.livepeer.org",
];

const REPORT_FIELDS = [
  {
    label: "Affected URL or asset",
    body: "The endpoint, page, or service where you found the issue.",
  },
  {
    label: "Steps to reproduce",
    body: "Concise repro the team can follow without back-and-forth.",
  },
  {
    label: "Impact",
    body: "What an attacker could achieve and which users or systems are affected.",
  },
  {
    label: "Your name or handle",
    body: "How you'd like to be credited if the report is valid. Anonymous is fine too.",
  },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[11px] font-medium tracking-wider text-white/40 uppercase">
      {children}
    </p>
  );
}

function SectionH2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
      {children}
    </h2>
  );
}

export default function NonProtocolReportingPage() {
  return (
    <>
      <PageHero>
        <Container>
          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            className="font-mono text-xs text-white/40"
          >
            <Link
              href="/security"
              className="transition-colors hover:text-white/70"
            >
              Security
            </Link>
            <span className="mx-2 text-white/20">/</span>
            <span className="text-white/70">Reporting guide</span>
          </nav>

          {/* Header */}
          <header className="mt-8 flex max-w-3xl flex-col gap-4">
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Reporting guide
            </h1>
            <p className="text-base leading-relaxed text-white/60 sm:text-lg">
              Thank you for taking the time to report. This page covers
              livepeer.org, the explorer, and other public apps run by the
              Livepeer Foundation. Reports go to{" "}
              <a
                href={`mailto:${SECURITY_EMAIL}`}
                className="text-white/85 underline-offset-4 hover:text-white hover:underline"
              >
                {SECURITY_EMAIL}
              </a>
              . Smart contract issues go through{" "}
              <a
                href="https://immunefi.com/bug-bounty/livepeer/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/85 underline-offset-4 hover:text-white hover:underline"
              >
                Immunefi
              </a>{" "}
              instead.
            </p>
          </header>
        </Container>
      </PageHero>

      {/* ---- What to include ---- */}
      <section className="relative pb-12 sm:pb-16">
        <Container>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            transition={{ staggerChildren: 0.05 }}
            className="max-w-3xl"
          >
            <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
              <SectionLabel>What to include</SectionLabel>
              <SectionH2>Make the report easy to triage</SectionH2>
            </motion.div>
            <motion.ul
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="mt-6 divide-y divide-white/[0.06] rounded-2xl border border-dark-border bg-dark-card"
            >
              {REPORT_FIELDS.map((field) => (
                <li key={field.label} className="p-5 sm:p-6">
                  <p className="text-sm font-medium text-white">
                    {field.label}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-white/55">
                    {field.body}
                  </p>
                </li>
              ))}
            </motion.ul>
          </motion.div>
        </Container>
      </section>

      {/* ---- Scope ---- */}
      <section className="relative py-12 sm:py-16">
        <div className="divider-gradient absolute top-0 right-0 left-0" />
        <Container>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            transition={{ staggerChildren: 0.05 }}
            className="max-w-3xl"
          >
            <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
              <SectionLabel>Scope</SectionLabel>
              <SectionH2>What this program covers</SectionH2>
            </motion.div>
            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="mt-8 grid gap-10 md:grid-cols-2"
            >
              <div>
                <p className="font-mono text-[11px] tracking-wider text-white/40 uppercase">
                  In scope
                </p>
                <ul className="mt-4 space-y-3 text-sm text-white/70">
                  {IN_SCOPE.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-green-bright" />
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="mt-5 text-xs leading-relaxed text-white/45">
                  Found a security issue on another Foundation-operated
                  property we haven&apos;t listed? Report it anyway — safe
                  harbor still applies to good-faith research.
                </p>
              </div>
              <div>
                <p className="font-mono text-[11px] tracking-wider text-white/40 uppercase">
                  Out of scope
                </p>
                <ul className="mt-4 space-y-3 text-sm text-white/70">
                  <li className="flex items-start gap-3">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-white/30" />
                    <span>
                      Smart contracts &amp; on-chain protocol — use{" "}
                      <a
                        href="https://immunefi.com/bug-bounty/livepeer/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white/90 underline-offset-4 hover:text-white hover:underline"
                      >
                        Immunefi
                      </a>
                      .
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-white/30" />
                    <span>
                      Livepeer Inc-operated services (e.g.,{" "}
                      <code className="font-mono text-[12px] text-white/80">
                        livepeer.studio
                      </code>
                      ) — contact{" "}
                      <a
                        href={`mailto:${INC_SECURITY_EMAIL}`}
                        className="text-white/90 underline-offset-4 hover:text-white hover:underline"
                      >
                        {INC_SECURITY_EMAIL}
                      </a>
                      .
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-white/30" />
                    <span>
                      Findings from automated scanners or AI tools without
                      manual validation and a working proof of concept.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-white/30" />
                    <span>
                      Social engineering, DoS / volumetric attacks, theoretical
                      issues, hardening recommendations (missing headers,
                      outdated libs, weak TLS) without demonstrated impact, and
                      duplicates of already-reported issues.
                    </span>
                  </li>
                </ul>
              </div>
            </motion.div>
          </motion.div>
        </Container>
      </section>

      {/* ---- What you can expect ---- */}
      <section className="relative py-12 sm:py-16">
        <div className="divider-gradient absolute top-0 right-0 left-0" />
        <Container>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            transition={{ staggerChildren: 0.05 }}
            className="max-w-3xl"
          >
            <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
              <SectionLabel>What you can expect</SectionLabel>
              <SectionH2>Informal, gratitude-based program</SectionH2>
            </motion.div>
            <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
              <p className="mt-6 leading-relaxed text-white/65">
                We aim to acknowledge reports within 5 business days, triage
                quickly, and keep you informed as the issue is investigated and
                fixed. Valid reports are credited publicly with your consent —
                this informal program is discretionary, and credit is the
                Foundation&apos;s way of saying thanks.
              </p>
              <p className="mt-4 text-sm leading-relaxed text-white/50">
                Good-faith research conducted within the rules of our
                Vulnerability Disclosure Policy is authorized. Read the full
                safe harbor terms in the{" "}
                <Link
                  href="/security/non-protocol/policy"
                  className="text-white/80 underline-offset-4 hover:text-white hover:underline"
                >
                  Vulnerability Disclosure Policy
                </Link>
                .
              </p>
            </motion.div>
          </motion.div>
        </Container>
      </section>

      {/* ---- Send report CTA ---- */}
      <section className="relative py-12 sm:py-16">
        <div className="divider-gradient absolute top-0 right-0 left-0" />
        <Container>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            transition={{ staggerChildren: 0.05 }}
            className="max-w-3xl"
          >
            <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
              <SectionLabel>Send report</SectionLabel>
              <SectionH2>Ready to report?</SectionH2>
              <p className="mt-4 text-white/60 leading-relaxed">
                When you have the four details above, send them to{" "}
                {SECURITY_EMAIL}. We&apos;ll get back to you.
              </p>
              <div className="mt-6">
                <Button href={`mailto:${SECURITY_EMAIL}`}>
                  Email {SECURITY_EMAIL}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </Container>
      </section>

      {/* ---- Back to overview ---- */}
      <section className="relative py-10 sm:py-12">
        <div className="divider-gradient absolute top-0 right-0 left-0" />
        <Container>
          <div className="flex justify-center">
            <Link
              href="/security"
              className="group inline-flex items-center gap-2 font-mono text-sm text-white/30 transition-colors hover:text-white/60"
            >
              <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
              Back to security overview
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
