import type { Metadata } from "next";

const description =
  "The Livepeer Foundation is an independent non-profit accountable to network participants, advancing Livepeer's long-term health through strategy, core development, and ecosystem growth.";

export const metadata: Metadata = {
  title: "Foundation | Livepeer",
  description,
  openGraph: {
    title: "Foundation | Livepeer",
    description,
  },
  twitter: {
    card: "summary_large_image",
    title: "Foundation | Livepeer",
    description,
  },
};

// No ForceDarkTheme. The old Foundation page was dark-only artwork that broke
// on a light canvas; the migrated one is registry-native and verified in both
// themes, so pinning the route would only mean a user on Light hits one page
// that ignores them.
export default function FoundationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
