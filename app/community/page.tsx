"use client";

import { motion } from "framer-motion";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { EXTERNAL_LINKS } from "@/lib/constants";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const communityLinks = [
  {
    title: "Discord",
    description:
      "The primary hub for real-time conversation with the Livepeer community, core team, and fellow builders.",
    href: EXTERNAL_LINKS.discord,
    members: "10K+",
    icon: (
      <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
      </svg>
    ),
  },
  {
    title: "Forum",
    description:
      "Long-form discussion about protocol development, governance proposals, and technical research.",
    href: EXTERNAL_LINKS.forum,
    members: "Community",
    icon: (
      <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none">
        <path
          d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "X / Twitter",
    description:
      "Follow for the latest updates, announcements, and ecosystem news from the Livepeer community.",
    href: EXTERNAL_LINKS.twitter,
    members: "50K+",
    icon: (
      <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    title: "GitHub",
    description:
      "All Livepeer protocol and tooling code is open source. Contribute, file issues, or fork and build.",
    href: EXTERNAL_LINKS.github,
    members: "Open Source",
    icon: (
      <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
      </svg>
    ),
  },
];

const governanceItems = [
  {
    title: "Livepeer Improvement Proposals",
    description:
      "LIPs are the formal mechanism for proposing changes to the Livepeer protocol. Anyone can submit a proposal for community review.",
  },
  {
    title: "On-chain Voting",
    description:
      "LPT holders and delegators vote on protocol parameters and upgrades directly through the staking contract.",
  },
  {
    title: "Treasury Governance",
    description:
      "The community governs a treasury fund that finances grants, bounties, and ecosystem development initiatives.",
  },
];

export default function CommunityPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative flex items-center overflow-hidden py-32 lg:py-40">
        <Container className="relative">
          <motion.div
            className="mx-auto max-w-3xl text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <p className="mb-3 font-mono text-sm font-medium tracking-wider text-white/40 uppercase">
              Community
            </p>
            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-7xl">
              Built by the community
            </h1>
            <p className="mt-6 text-lg text-white/60">
              Livepeer is an open protocol governed by its community. Join
              thousands of developers, operators, and token holders building the
              future of video infrastructure.
            </p>
            <div className="mt-10">
              <Button href={EXTERNAL_LINKS.discord} variant="primary">
                Join Discord <span aria-hidden="true">&rarr;</span>
              </Button>
            </div>
          </motion.div>
        </Container>
      </section>

      {/* Community channels */}
      <section className="relative py-24 lg:py-32">
        <div className="divider-gradient absolute top-0 left-0 right-0" />
        <Container>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            transition={{ staggerChildren: 0.1 }}
          >
            <motion.div variants={fadeUp} transition={{ duration: 0.5 }} className="text-center">
              <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
                Connect
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-white/60">
                Find the Livepeer community across these channels.
              </p>
            </motion.div>

            <div className="mt-16 grid gap-6 sm:grid-cols-2">
              {communityLinks.map((link) => (
                <motion.a
                  key={link.title}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  variants={fadeUp}
                  transition={{ duration: 0.5 }}
                  className="block"
                >
                  <Card className="h-full transition-colors hover:border-green/20">
                    <div className="flex items-center justify-between">
                      <div className="text-green">{link.icon}</div>
                      <span className="font-mono text-xs text-white/40">
                        {link.members}
                      </span>
                    </div>
                    <h3 className="mt-4 text-lg font-medium">{link.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/50">
                      {link.description}
                    </p>
                  </Card>
                </motion.a>
              ))}
            </div>
          </motion.div>
        </Container>
      </section>

      {/* Governance */}
      <section className="relative py-24 lg:py-32">
        <div className="divider-gradient absolute top-0 left-0 right-0" />
        <Container>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            transition={{ staggerChildren: 0.1 }}
          >
            <motion.div variants={fadeUp} transition={{ duration: 0.5 }} className="text-center">
              <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
                Governance
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-white/60">
                The Livepeer protocol is governed by its community through
                transparent, on-chain mechanisms.
              </p>
            </motion.div>

            <div className="mt-16 grid gap-6 md:grid-cols-3">
              {governanceItems.map((item) => (
                <motion.div key={item.title} variants={fadeUp} transition={{ duration: 0.5 }}>
                  <Card className="h-full">
                    <h3 className="text-lg font-medium">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/50">
                      {item.description}
                    </p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </Container>
      </section>

      {/* Contribute CTA */}
      <section className="relative py-24 lg:py-32">
        <div className="divider-gradient absolute top-0 left-0 right-0" />
        <Container>
          <motion.div
            className="mx-auto max-w-2xl text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Contribute
            </h2>
            <p className="mt-4 text-lg text-white/60">
              Whether you&apos;re a developer, designer, researcher, or community
              organizer — there&apos;s a place for you in the Livepeer ecosystem.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button href={EXTERNAL_LINKS.grants} variant="primary">
                Grants Program <span aria-hidden="true">&rarr;</span>
              </Button>
              <Button href={EXTERNAL_LINKS.github} variant="secondary">
                Open Source
              </Button>
            </div>
          </motion.div>
        </Container>
      </section>
    </>
  );
}
