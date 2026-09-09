import type { Metadata } from "next";

const description =
  "What shipped on the Livepeer network, the Agent, the protocol and livepeer.org, by day.";

export const metadata: Metadata = {
  title: "Changelog | Livepeer",
  description,
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
