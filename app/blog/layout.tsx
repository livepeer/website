import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog | Livepeer",
  description:
    "News, insights, and updates from across the Livepeer ecosystem.",
  alternates: {
    types: { "application/atom+xml": "/blog/feed.xml" },
  },
  openGraph: {
    title: "Blog | Livepeer",
    description:
      "News, insights, and updates from across the Livepeer ecosystem.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog | Livepeer",
    description:
      "News, insights, and updates from across the Livepeer ecosystem.",
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
