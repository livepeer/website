import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LegalDocument } from "@/components/livepeer-ui/legal-document";
import { getLegalPage } from "@/lib/register";

/** The text is in Notion; see lib/legal.ts for when it is shown. */

const DESCRIPTION = "The terms that apply when you use livepeer.org.";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getLegalPage("terms-of-service");
  if (!page) return {};
  return {
    title: page.title,
    description: DESCRIPTION,
    // A draft is shown on previews only, and never indexed.
    ...(page.draft ? { robots: { index: false, follow: false } } : {}),
  };
}

export default async function TermsOfServicePage() {
  const page = await getLegalPage("terms-of-service");
  if (!page) notFound();
  return <LegalDocument page={page} />;
}
