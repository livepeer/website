import type { Metadata } from "next";
import Script from "next/script";
import { favoritPro, favoritMono, instrumentSerif } from "@/lib/fonts";
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
  title: "Livepeer — The world's open video infrastructure",
  description:
    "Generate, transform, and interpret video on a permissionless GPU network built for AI video inference.",
  openGraph: {
    title: "Livepeer — The world's open video infrastructure",
    description:
      "Generate, transform, and interpret video on a permissionless GPU network built for AI video inference.",
    siteName: "Livepeer",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Livepeer — The world's open video infrastructure",
    description:
      "Generate, transform, and interpret video on a permissionless GPU network built for AI video inference.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${favoritPro.variable} ${favoritMono.variable} ${instrumentSerif.variable}`}
    >
      <head>
        {/* No-FOUC theme init — must run synchronously before paint so
            the user's stored preference is applied before any CSS resolves.
            We use a raw <script> via dangerouslySetInnerHTML rather than
            `next/script` with beforeInteractive: in the App Router, that
            strategy doesn't actually inject a synchronous inline tag for
            children content (it encodes the source as JSON data for
            Next's runtime to evaluate post-hydration). A raw inline script
            in <head> is the only reliable pre-paint hook. */}
        <script
          id="theme-init"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var p=window.location.pathname;var force=p==='/foundation'||p.indexOf('/foundation/')===0;var t;if(force){t='dark';}else{var s=localStorage.getItem('theme');if(s==='system'){t=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';}else if(s==='light'||s==='dark'){t=s;}else{t='dark';}}document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();`,
          }}
        />
        {process.env.NEXT_PUBLIC_VERCEL_ENV === "production" && (
          <>
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
          </>
        )}
      </head>
      <body className="flex min-h-screen flex-col bg-background font-sans text-foreground antialiased">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
