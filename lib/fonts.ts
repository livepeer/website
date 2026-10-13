import localFont from "next/font/local";
import { Geist_Mono, Raleway } from "next/font/google";

// Inter — the one face for everything: nav, body, forms, data, docs, and
// every heading and display line. Self-hosted from Rasmus Andersson's own
// distribution (rsms.me/inter, v4.1) rather than Google Fonts: the variable
// build there carries the optical-size axis and the full feature set, and it
// is the canonical cut. `InterVariable` covers 100–900 in one file.
//
// Subset to the Latin ranges (basic, Latin-1, extended A/B and additional,
// general punctuation, currency, letterlike, arrows, maths, box and
// geometric shapes, the fi/fl ligatures), both axes and every feature kept,
// with pyftsubset — 352KB to 213KB, the italic 388KB to 236KB. The site is
// set in English and the Cyrillic, Greek and Vietnamese glyphs were being
// downloaded on every cold load. Regenerate from the full build at
// rsms.me/inter with the same ranges if a script is ever missing.
//
// `block`, not `swap`: text waits for the face rather than painting in the
// size-adjusted Arial stand-in and swapping — which on a cold load, and on
// every hard refresh, read as the page changing typeface a beat in. The
// files are preloaded in production, so the wait is the font's own
// download and nothing else; in development nothing is preloaded, so
// the wait is longer there. `optional` would never swap either, but a
// slow first visit would keep the stand-in for the whole page, and a
// brand face that sometimes is not there is worse than one that arrives a
// beat late.
export const inter = localFont({
  variable: "--font-inter",
  display: "block",
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
  display: "block",
});

export const raleway = Raleway({
  subsets: ["latin"],
  variable: "--font-raleway",
  display: "swap",
  weight: ["300", "400", "700", "800", "900"],
});
