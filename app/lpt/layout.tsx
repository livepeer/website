import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Token — Livepeer",
  description:
    "Learn about the Livepeer Token (LPT): its role in coordinating, securing, and governing the Livepeer network. Stake LPT to earn rewards.",
};

export default function LPTLayout({ children }: { children: React.ReactNode }) {
  return children;
}
