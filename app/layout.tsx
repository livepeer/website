import type { Metadata } from "next";
import { favoritPro, favoritMono } from "@/lib/fonts";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "Livepeer — The World's Open Video Infrastructure",
  description:
    "Livepeer is a decentralized video infrastructure network powering video transcoding, livestreaming, and AI video processing at a fraction of the cost.",
  openGraph: {
    title: "Livepeer — The World's Open Video Infrastructure",
    description:
      "Livepeer is a decentralized video infrastructure network powering video transcoding, livestreaming, and AI video processing at a fraction of the cost.",
    siteName: "Livepeer",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Livepeer — The World's Open Video Infrastructure",
    description:
      "Livepeer is a decentralized video infrastructure network powering video transcoding, livestreaming, and AI video processing at a fraction of the cost.",
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
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
