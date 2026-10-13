# The blog — fallback copy

**The blog lives in Notion**, in **Blog posts** under _Livepeer.org content_.
That is what `/blog` renders, and where a post is written, edited, or published.
The post itself is the Notion page body; the properties around it are what the
index card, the share image and the metadata read. Each property carries a
description explaining what belongs in it, and _Publishing a blog post_ beside
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

Images and video inside a post can get there two ways, and only one involves
this repo.

- **Uploaded into Notion** (drag the file into the page): no pull request. The
  site links it through `/api/notion-media/[id]`, which asks Notion for a fresh
  address on each request, since Notion signs an upload's address for only
  about an hour (`lib/notion-blocks.ts`). Use this for screenshots and one-off
  art.
- **Committed here**, under `public/images/blog/` or `public/videos/`, and
  linked from Notion by its `https://livepeer.org/...` address: Notion previews
  it from the live site, and the site rewrites the address back to the repo
  copy. Use this for art several posts share. The build fails on an address
  that does not resolve to something in `public/`.

Media linked from any other host fails the build (`lib/notion-media.ts`).

A post's own art — the index card, the header, the share image — is the Notion
**page cover**, and needs no pull request at all: the covers are stock images on
`cdn.sanity.io`. Here in the fallback that is the `image` frontmatter key.
