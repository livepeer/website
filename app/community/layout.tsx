import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Community — Livepeer",
  description:
    "Join the Livepeer community: governance, events, ecosystem projects, and social channels for developers, operators, and token holders.",
};

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  return children;
}
