import type { Metadata } from "next";

const description =
  "Month by month: what shipped on the Livepeer roadmap, how the work under way is going, and who has not reported.";

export const metadata: Metadata = {
  title: "Changelog | Livepeer",
  description,
  alternates: {
    types: { "application/atom+xml": "/changelog/feed.xml" },
  },
  openGraph: { title: "Changelog | Livepeer", description },
  twitter: {
    card: "summary_large_image",
    title: "Changelog | Livepeer",
    description,
  },
};

export default function ChangelogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
