import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Brand | Livepeer",
  description:
    "Livepeer brand guidelines, logos, colors, and typography for consistent use across all communications.",
  openGraph: {
    title: "Brand | Livepeer",
    description:
      "Livepeer brand guidelines, logos, colors, and typography for consistent use across all communications.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Brand | Livepeer",
    description:
      "Livepeer brand guidelines, logos, colors, and typography for consistent use across all communications.",
  },
};

export default function BrandLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
