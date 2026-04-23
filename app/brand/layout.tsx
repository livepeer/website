import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Brand | Livepeer",
  description:
    "Logos, colors, typography, and a downloadable brand kit for Livepeer.",
  openGraph: {
    title: "Brand | Livepeer",
    description:
      "Logos, colors, typography, and a downloadable brand kit for Livepeer.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Brand | Livepeer",
    description:
      "Logos, colors, typography, and a downloadable brand kit for Livepeer.",
  },
};

export default function BrandLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
