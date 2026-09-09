import type { MetadataRoute } from "next";
import { getBlogRegister, getRegister, getUpdates } from "@/lib/register";
import { roundups } from "@/lib/changelog";
import { categoriesInUse, categorySlug } from "@/lib/blog";
import { getAppSlugs } from "@/lib/ecosystem";

const BASE_URL = "https://livepeer.org";

/**
 * Only canonical, resolvable URLs belong here.
 *
 * The five /use-cases/* routes are deliberately absent: they are 308s to
 * /agent and /compute now, and listing a redirect asks a crawler to discover
 * the destination the long way round. Their replacements are listed directly.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, commitments, updates] = await Promise.all([
    getBlogRegister(),
    getRegister(),
    getUpdates(),
  ]);
  // One page per month with something in it. The month under way changes
  // whenever an update is posted; a finished month is settled.
  const now = new Date();
  const changelogEntries: MetadataRoute.Sitemap = roundups(
    commitments,
    updates,
    now
  ).map((r) => ({
    url: `${BASE_URL}/changelog/${r.month}`,
    lastModified: r.current ? now : new Date(`${r.month}-01T00:00:00Z`),
    changeFrequency: r.current ? "weekly" : "monthly",
    priority: 0.5,
  }));
  const blogEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  // One page per category with a post in it, matching the index's rail.
  const categoryEntries: MetadataRoute.Sitemap = categoriesInUse(posts).map(
    (name) => ({
      url: `${BASE_URL}/blog/category/${categorySlug(name)}`,
      changeFrequency: "weekly",
      priority: 0.5,
    })
  );

  const ecosystemEntries: MetadataRoute.Sitemap = getAppSlugs().map((slug) => ({
    url: `${BASE_URL}/ecosystem/${slug}`,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: "weekly", priority: 1 },
    // The flagship product surface — the highest-priority page after home.
    { url: `${BASE_URL}/agent`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/ecosystem`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/blog`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/changelog`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/compute`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/roadmap`, changeFrequency: "weekly", priority: 0.7 },
    // The destination the forum's welcome post and the Foundation's Notion
    // page are being repointed at, so it is worth more than its age suggests.
    {
      url: `${BASE_URL}/contribute`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    { url: `${BASE_URL}/primer`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/token`, changeFrequency: "monthly", priority: 0.5 },
    {
      url: `${BASE_URL}/foundation`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/ecosystem/submit`,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    { url: `${BASE_URL}/brand`, changeFrequency: "monthly", priority: 0.3 },
  ];

  return [
    ...staticRoutes,
    ...ecosystemEntries,
    ...categoryEntries,
    ...blogEntries,
    ...changelogEntries,
  ];
}
