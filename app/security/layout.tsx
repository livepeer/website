import type { Metadata } from "next";

const title = "Security | Livepeer";
const description =
  "Report a vulnerability in the Livepeer protocol or in Foundation-operated services. Smart contract issues are handled through Immunefi; everything else through security@livepeer.foundation.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: { title, description },
  twitter: { card: "summary_large_image", title, description },
};

export default function SecurityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
