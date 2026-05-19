import type { Metadata } from "next";

const title = "Non-protocol Reporting | Livepeer Security";
const description =
  "How to report vulnerabilities in livepeer.org, the explorer, and Foundation-operated developer services. Informal, gratitude-based program with public acknowledgment.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: { title, description },
  twitter: { card: "summary_large_image", title, description },
};

export default function NonProtocolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
