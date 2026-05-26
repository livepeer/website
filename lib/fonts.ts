import localFont from "next/font/local";
import { Raleway, Instrument_Serif } from "next/font/google";

// Editorial display serif — used sparingly (currently Foundation page hero)
// as an elegant counter-voice to Favorit Pro sans.
export const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-instrument-serif",
  display: "swap",
  weight: "400",
  style: ["normal", "italic"],
});

export const favoritPro = localFont({
  variable: "--font-favorit-pro",
  display: "swap",
  src: [
    {
      path: "../public/fonts/FavoritPro-Light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../public/fonts/FavoritPro-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/FavoritPro-Book.woff2",
      weight: "450",
      style: "normal",
    },
    {
      path: "../public/fonts/FavoritPro-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/FavoritPro-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
});

export const raleway = Raleway({
  subsets: ["latin"],
  variable: "--font-raleway",
  display: "swap",
  weight: ["300", "400", "700", "800", "900"],
});

export const favoritMono = localFont({
  variable: "--font-favorit-mono",
  display: "swap",
  src: [
    {
      path: "../public/fonts/FavoritMono-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/FavoritMono-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/FavoritMono-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
});
