# The blog — fallback copy

**The blog lives in Notion**, in **Blog posts** under *Livepeer.org content*.
That is what `/blog` renders, and where a post is written, edited, or published.
The post itself is the Notion page body; the properties around it are what the
index card, the share image and the metadata read. Each property carries a
description explaining what belongs in it, and *Publishing a blog post* beside
the database explains the rest — read those rather than this file when you are
writing one.

The byline relates to **Livepeer people**, the same table the roadmap credits
from, so a person is described once.

Every file beside this one is the archive as it stood when Notion took over.
`lib/register.ts` reads them **only when `NOTION_TOKEN` is absent** — so a clone
with no workspace credential still builds, and `pnpm dev` still renders twelve
real posts to develop a layout against. **Editing them does not change the
deployed site.**

Keep them valid; do not try to keep them current. Chasing Notion by hand would
recreate the drift that moving to a CMS removed, and a post here that fails
`lib/blog.ts` breaks the build for everyone working without a token.

## What is still served from here

The art is the exception, and it is not a fallback. Every image and video inside
a post is a file committed under `public/images/blog/` and `public/videos/`, and
Notion links to it by its `https://livepeer.org/...` address — Notion previews it
from the live site, and the site rewrites the address back to the repo copy it
already has. Notion never holds the file, because an upload comes back from the
API as a link that expires within the hour.

So adding art to a post is still a pull request: commit the file, then paste its
livepeer.org address into the page. The build fails on an address that does not
resolve to something in `public/`.
