import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog — Livepeer",
  description:
    "Updates, announcements, and insights from the Livepeer ecosystem.",
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
