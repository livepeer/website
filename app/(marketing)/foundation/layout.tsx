import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Foundation | Livepeer",
  description:
    "The Livepeer Foundation is a neutral, non-profit steward of the Livepeer protocol, coordinating long-term strategy, core development and ecosystem growth.",
  openGraph: {
    title: "Foundation | Livepeer",
    description:
      "The Livepeer Foundation is a neutral, non-profit steward of the Livepeer protocol, coordinating long-term strategy, core development and ecosystem growth.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Foundation | Livepeer",
    description:
      "The Livepeer Foundation is a neutral, non-profit steward of the Livepeer protocol, coordinating long-term strategy, core development and ecosystem growth.",
  },
};

export default function FoundationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
