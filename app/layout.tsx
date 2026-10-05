import type { Metadata } from "next";
import { inter, geistMono } from "@/lib/fonts";
import { LivepeerOrgHeader } from "@/components/livepeer-ui/livepeer-org-header";
import { LivepeerOrgFooter } from "@/components/livepeer-ui/livepeer-org-footer";
import { Analytics } from "@vercel/analytics/next";
import { getDiscord, withDiscordInvite } from "@/lib/discord";
import { livepeerOrgSite } from "@/lib/site";
import { SectionRule } from "@/components/ui/section-rule";
import { livepeerOrgNavigationImages } from "@/lib/navigation-images";
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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // The footer's Discord link is the live invite, not the hand-typed vanity
  // that was taken over. See lib/discord.ts.
  const { invite } = await getDiscord();
  const site = withDiscordInvite(livepeerOrgSite, invite);

  return (
    <html
      lang="en"
      suppressHydrationWarning
      // globals.css sets scroll-behavior: smooth on the root. Next needs
      // telling, so it can switch to instant scrolling for the length of a
      // route change: without this its scroll-to-top animates, its "is the
      // new content visible" check runs before the animation finishes, and
      // it falls back to scrolling the new segment into view under the
      // header, so a page opened from a scrolled list started 64px down.
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${geistMono.variable}`}
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
      </head>
      <body className="flex min-h-screen flex-col bg-background font-sans text-foreground antialiased">
        <LivepeerOrgHeader
          site={site}
          navigationImages={livepeerOrgNavigationImages}
        />
        <main className="flex-1">{children}</main>
        {/* Closes the page against the footer on every route, on the same
            vertical lines as the header rule and the section rules. */}
        <SectionRule />
        <LivepeerOrgFooter site={site} />
        {/* Vercel Web Analytics: page views without cookies, so no consent
            banner. Google Analytics and Hotjar were removed for that reason;
            the Privacy Policy (/privacy-policy, in Notion) describes this. */}
        <Analytics />
      </body>
    </html>
  );
}
