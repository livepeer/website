import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Container from "@/components/ui/Container";
import PageHero from "@/components/ui/PageHero";
import { getLegalDocument } from "@/lib/legal";

const title = "Vulnerability Disclosure Policy | Livepeer";
const description =
  "The Livepeer Foundation Vulnerability Disclosure Policy — scope, expectations, official channels, and safe harbor for good-faith security research.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: { title, description },
  twitter: { card: "summary_large_image", title, description },
};

export default async function VulnerabilityDisclosurePolicyPage() {
  const html = await getLegalDocument("vulnerability-disclosure-policy");

  return (
    <main>
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
            <Link
              href="/security/non-protocol"
              className="transition-colors hover:text-white/70"
            >
              Non-protocol
            </Link>
            <span className="mx-2 text-white/20">/</span>
            <span className="text-white/70">
              Vulnerability Disclosure Policy
            </span>
          </nav>

          {/* Header */}
          <header className="mt-8 flex max-w-3xl flex-col gap-4">
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Vulnerability Disclosure Policy
            </h1>
            <p className="text-base leading-relaxed text-white/60 sm:text-lg">
              Adapted from the disclose.io Core Terms. Last reviewed by Livepeer
              Foundation prior to publication.
            </p>
          </header>
        </Container>
      </PageHero>
      <Container>
        <div className="max-w-3xl pb-24">
          <article
            className="blog-prose"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </Container>
      <section className="relative py-10 sm:py-12">
        <div className="divider-gradient absolute top-0 right-0 left-0" />
        <Container>
          <div className="flex justify-center">
            <Link
              href="/security/non-protocol"
              className="group inline-flex items-center gap-2 font-mono text-sm text-white/30 transition-colors hover:text-white/60"
            >
              <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
              Back to reporting guide
            </Link>
          </div>
        </Container>
      </section>
    </main>
  );
}
