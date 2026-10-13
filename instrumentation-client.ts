import posthog from "posthog-js";

/**
 * PostHog, beside Vercel Web Analytics (<Analytics /> in app/layout.tsx), at
 * Mehrdad's ask: the team's PostHog project (us.posthog.com, project 541730)
 * is where the Foundation reads product analytics, and the site's visits
 * belong in it.
 *
 * Runs only where a project token is set, so a clone or a local dev server
 * sends nothing; Vercel sets it for production. Events go straight to
 * PostHog's US host rather than through a rewrite on this domain: the proxy
 * PostHog recommends needs `skipTrailingSlashRedirect`, which changes how
 * every trailing-slash address on the site resolves, and some events lost to
 * ad blockers was the cheaper side of that trade at launch.
 *
 * PostHog keeps an identifier in a cookie and local storage. The Privacy
 * Policy (/privacy-policy, in Notion) said the site set no cookies when
 * Vercel's analytics were the only ones, and has to say otherwise now.
 */
const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;

if (token) {
  posthog.init(token, {
    api_host:
      process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
    defaults: "2026-05-30",
  });
}
