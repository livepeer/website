import { revalidatePath } from "next/cache";

/**
 * Every address rendered from Notion, so that one call clears them all.
 *
 * Six databases feed the site now — the roadmap register and the updates on
 * it, people, organizations, blog posts, the funding ladder and the changelog
 * entries (see CLAUDE.md → Content) — and a change to any of them can move
 * text on several addresses at once: an owner renamed in _Organizations_
 * appears on the register, on every record they own, on their own page and
 * in the panel that slides over the roadmap. Working out which surface an
 * event touched would be a second copy of that dependency graph to keep
 * true. Clearing all of them costs a rebuild each, on a site with a few
 * dozen such pages, so the list is deliberately blunt.
 *
 * A path with `layout` clears everything beneath it — the index, every
 * record, the guides and the intercepting panels under /roadmap; every post
 * and category under /blog; every period under /changelog. The feeds and
 * the sitemap are route handlers rather than pages, and the sitemap is what
 * a crawler reads to learn a record exists, so they are named on their own.
 *
 * Both endpoints call this rather than keeping a list each: the webhook and
 * the manual endpoint exist for the same edit, and a surface that one of
 * them forgot would be stale only for the caller who used it.
 */
const NOTION_SURFACES: ReadonlyArray<
  readonly [path: string, type?: "page" | "layout"]
> = [
  ["/roadmap", "layout"],
  ["/organizations", "layout"],
  ["/people", "layout"],
  ["/blog", "layout"],
  ["/blog/feed.xml"],
  ["/changelog", "layout"],
  ["/changelog/feed.xml"],
  ["/changelog/roundup.json"],
  ["/contribute"],
  ["/sitemap.xml"],
];

/** Clears every Notion-backed address, and says which. */
export function revalidateNotionSurfaces(): string[] {
  for (const [path, type] of NOTION_SURFACES) {
    if (type) revalidatePath(path, type);
    else revalidatePath(path);
  }
  return NOTION_SURFACES.map(([path]) => path);
}
