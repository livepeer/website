import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Network — Livepeer",
  description:
    "Learn how the Livepeer network works: a decentralized protocol of GPU operators performing video transcoding and AI processing at scale.",
};

export default function NetworkLayout({ children }: { children: React.ReactNode }) {
  return children;
}
