import localFont from "next/font/local";
import { Inter, Raleway } from "next/font/google";

// Inter — the Livepeer UI product/interface typeface (font-sans). Default for
// nav, body, forms, data, docs, and ordinary headings.
export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
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
