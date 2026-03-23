import type { Metadata } from "next";
import { favoritPro, favoritMono } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "https://livepeer.org"
  ),
  title: "Livepeer — Open Infrastructure for Real-Time AI Video",
  description:
    "Generate, transform, and interpret live video streams with low-latency AI inference on an open and permissionless elastic GPU network.",
  openGraph: {
    title: "Livepeer — Open Infrastructure for Real-Time AI Video",
    description:
      "Generate, transform, and interpret live video streams with low-latency AI inference on an open and permissionless elastic GPU network.",
    siteName: "Livepeer",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Livepeer — Open Infrastructure for Real-Time AI Video",
    description:
      "Generate, transform, and interpret live video streams with low-latency AI inference on an open and permissionless elastic GPU network.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${favoritPro.variable} ${favoritMono.variable}`}>
      <body className="min-h-screen bg-dark font-sans text-white antialiased">
        {children}
      </body>
    </html>
  );
}
