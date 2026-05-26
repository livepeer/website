import type { Metadata } from "next";
import ForceDarkTheme from "./ForceDarkTheme";

const description =
  "The Livepeer Foundation exists to serve the Livepeer network \u2014 making it easier to build on, establishing it as open infrastructure for real-time AI video, and holding strategic decisions to the highest standard of accountability.";

export const metadata: Metadata = {
  title: "Foundation | Livepeer",
  description,
  openGraph: {
    title: "Foundation | Livepeer",
    description,
  },
  twitter: {
    card: "summary_large_image",
    title: "Foundation | Livepeer",
    description,
  },
};

export default function FoundationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ForceDarkTheme />
      {children}
    </>
  );
}
