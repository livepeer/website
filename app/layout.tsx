import type { Metadata } from "next";
import Script from "next/script";
import { favoritPro, favoritMono } from "@/lib/fonts";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "https://livepeer.org"
  ),
  title: "Livepeer — Open Infrastructure for Real-Time AI Video",
  description:
    "Generate, transform, and interpret live video streams with low-latency AI inference on an open and permissionless elastic GPU network.",
  openGraph: {
    title: "Livepeer — Open Infrastructure for Real-Time AI Video",
    description:
      "Generate, transform, and interpret live video streams with low-latency AI inference on an open and permissionless elastic GPU network.",
    siteName: "Livepeer",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Livepeer — Open Infrastructure for Real-Time AI Video",
    description:
      "Generate, transform, and interpret live video streams with low-latency AI inference on an open and permissionless elastic GPU network.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${favoritPro.variable} ${favoritMono.variable}`}>
      <head>
        {/* Google Analytics 4 */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-4BFECXFFJD"
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-4BFECXFFJD');
            gtag('config', 'G-E4Q3BR9X93');
          `}
        </Script>

        {/* Hotjar */}
        <Script id="hotjar-init" strategy="afterInteractive">
          {`
            (function(h,o,t,j,a,r){
              h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
              h._hjSettings={hjid:6388940,hjsv:6};
              a=o.getElementsByTagName('head')[0];
              r=o.createElement('script');r.async=1;
              r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
              a.appendChild(r);
            })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
          `}
        </Script>
      </head>
      <body className="min-h-screen bg-dark font-sans text-white antialiased">
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
