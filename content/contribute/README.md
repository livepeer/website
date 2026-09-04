# The funding ladder — fallback copy

**The ladder lives in Notion**, in **Funding paths** under *Livepeer.org
content*. That is what `/contribute` renders, and where a path is added, its
ceiling changed, or a programme retired. Each property there carries a
description explaining what belongs in it; read those rather than this file
when you are filling one in.

Every file beside this one is the ladder as it stood when Notion took over.
`lib/register.ts` reads them **only when `NOTION_TOKEN` is absent** — so a clone
with no workspace credential still builds, and `pnpm dev` still renders the
page with five real rungs. **Editing them does not change the deployed site.**

Keep them valid; do not try to keep them current. Chasing Notion by hand would
recreate the drift that moving to a CMS removed, and a row here that fails
`lib/contribute.ts` breaks the build for everyone working without a token.

A file is frontmatter only — a rung has no body. `decidedBy` is an
organisation's name exactly as it appears in `content/organizations`, because
the caption links to that body's page and the build checks it exists. A retired programme needs just
a name, a link and `status: Retired`; it renders as one line at the foot of the
page, not as a rung.
