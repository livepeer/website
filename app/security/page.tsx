"use client";

import { ArrowRight, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import Container from "@/components/ui/Container";
import PageHero from "@/components/ui/PageHero";
import SectionHeader from "@/components/ui/SectionHeader";
import Button from "@/components/ui/Button";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const IMMUNEFI_URL = "https://immunefi.com/bug-bounty/livepeer/";

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M3 7l9 6 9-6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
      <path
        d="M12 3l8 3v6c0 4.5-3.2 8.4-8 9-4.8-.6-8-4.5-8-9V6l8-3z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M9 12l2 2 4-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function SecurityPage() {
  return (
    <>
      <PageHero>
        <Container>
          <SectionHeader
            label="Security Disclosure"
            title="Report a vulnerability"
            description="Security researchers help keep Livepeer's open infrastructure safe. Thank you for taking the time to report what you find — pick the channel below that matches the issue."
            align="center"
          />
        </Container>
      </PageHero>

      {/* ---- Reporting channels ---- */}
      <section className="relative pb-24 sm:pb-32 lg:pb-40">
        <Container>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            transition={{ staggerChildren: 0.1 }}
            className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2"
          >
            {/* Protocol — Immunefi */}
            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="flex h-full flex-col rounded-2xl border border-dark-border bg-dark-card p-6 sm:p-8"
            >
              <div className="text-green-bright">
                <ShieldIcon />
              </div>
              <p className="mt-6 font-mono text-[11px] tracking-wider text-white/40 uppercase">
                01 — Protocol
              </p>
              <h3 className="mt-2 text-xl font-semibold leading-snug text-white lg:text-2xl">
                Smart contracts &amp; on-chain protocol
              </h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-white/55">
                On-chain protocol issues — contracts, staking, delegation,
                reward logic. Cash bounties scaled by severity, handled on
                Immunefi.
              </p>
              <div className="mt-6">
                <Button
                  href={IMMUNEFI_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open Immunefi program
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </motion.div>

            {/* Non-protocol — reporting guide */}
            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="flex h-full flex-col rounded-2xl border border-dark-border bg-dark-card p-6 sm:p-8"
            >
              <div className="text-white/80">
                <MailIcon />
              </div>
              <p className="mt-6 font-mono text-[11px] tracking-wider text-white/40 uppercase">
                02 — Non-protocol
              </p>
              <h3 className="mt-2 text-xl font-semibold leading-snug text-white lg:text-2xl">
                Websites, explorer &amp; public apps
              </h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-white/55">
                Issues in livepeer.org, the explorer, and other public apps
                operated by the Foundation. Informal program with public
                acknowledgment for valid reports.
              </p>
              <div className="mt-6">
                <Button href="/security/non-protocol" variant="secondary">
                  Reporting guide
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </Container>
      </section>
    </>
  );
}
