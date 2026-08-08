import type { Metadata } from "next";
import Script from "next/script";
import { inter, favoritPro, favoritMono } from "@/lib/fonts";
import { LivepeerOrgHeader } from "@/components/livepeer-ui/livepeer-org-header";
import { LivepeerOrgFooter } from "@/components/livepeer-ui/livepeer-org-footer";
import { livepeerOrgSite } from "@/lib/site";
import { SectionRule } from "@/components/ui/section-rule";
import { livepeerOrgNavigationImages } from "@/sanity/lib/livepeer-org-navigation";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "https://livepeer.org"
  ),
  title: "Livepeer — The open inference network",
  description:
    "Run AI video and image workloads on Livepeer — the open inference network.",
  openGraph: {
    title: "Livepeer — The open inference network",
    description:
      "Run AI video and image workloads on Livepeer — the open inference network.",
    siteName: "Livepeer",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Livepeer — The open inference network",
    description:
      "Run AI video and image workloads on Livepeer — the open inference network.",
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
      className={`${inter.variable} ${favoritPro.variable} ${favoritMono.variable}`}
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
            // Unset means "system", not "dark". The footer toggle stores
            // "system" | "light" | "dark"; anything else (or no value at all)
            // resolves against prefers-color-scheme.
            //
            // Sets both hooks: the registry theme keys off the `dark` class,
            // the quarantined legacy CSS off html[data-theme]. See
            // components/theme-toggle.tsx.
            __html: `(function(){function apply(t){var de=document.documentElement;de.setAttribute('data-theme',t);de.classList.toggle('dark',t==='dark');}function sys(){return window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';}try{var s=localStorage.getItem('theme');apply(s==='light'||s==='dark'?s:sys());}catch(e){try{apply(sys());}catch(e2){apply('dark');}}})();`,
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
        <LivepeerOrgHeader
          site={livepeerOrgSite}
          navigationImages={livepeerOrgNavigationImages}
        />
        <main className="flex-1">{children}</main>
        {/* Closes the page against the footer on every route, on the same
            vertical lines as the header rule and the section rules. */}
        <SectionRule />
        <LivepeerOrgFooter site={livepeerOrgSite} />
      </body>
    </html>
  );
}
