import localFont from "next/font/local";
import { Geist_Mono, Raleway } from "next/font/google";

// Inter — the one face for everything: nav, body, forms, data, docs, and
// every heading and display line. Self-hosted from Rasmus Andersson's own
// distribution (rsms.me/inter, v4.1) rather than Google Fonts: the variable
// build there carries the optical-size axis and the full feature set, and it
// is the canonical cut. `InterVariable` covers 100–900 in one file.
export const inter = localFont({
  variable: "--font-inter",
  display: "swap",
  src: [
    {
      path: "../public/fonts/InterVariable.woff2",
      weight: "100 900",
      style: "normal",
    },
    {
      path: "../public/fonts/InterVariable-Italic.woff2",
      weight: "100 900",
      style: "italic",
    },
  ],
});

// Geist Mono — code, paths, IDs, timestamps, and the small mono labels.
export const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const raleway = Raleway({
  subsets: ["latin"],
  variable: "--font-raleway",
  display: "swap",
  weight: ["300", "400", "700", "800", "900"],
});
