import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ChangelogEntry } from "@/components/livepeer-ui/changelog-entry";
import { getChangelog, getChangelogEntry } from "@/lib/register";

type Props = {
  params: Promise<{ slug: string }>;
};

// No `dynamicParams = false`, for the reason the blog gives: an entry
// published in Notion after the last build must be served on first request.
// An unknown slug still 404s, because getChangelogEntry returns null for it.
export async function generateStaticParams() {
  const entries = await getChangelog();
  return entries.map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entry = await getChangelogEntry(slug);
  if (!entry) return { title: "Not Found — Livepeer Changelog" };
  const title = `${entry.title} | Livepeer Changelog`;
  return {
    title,
    description: entry.summary,
    openGraph: {
      title,
      description: entry.summary,
      type: "article",
      publishedTime: entry.date,
    },
    twitter: { card: "summary_large_image", title, description: entry.summary },
  };
}

export default async function ChangelogEntryPage({ params }: Props) {
  const { slug } = await params;
  const entry = await getChangelogEntry(slug);
  if (!entry) notFound();
  return <ChangelogEntry entry={entry} />;
}
