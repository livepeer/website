# The organisations — fallback copy

**The live source is Notion**, in **Organizations** under *Livepeer.org
content*. That is what `/organizations/<slug>` renders, and where a body is
added or edited. Each property there carries a description explaining what
belongs in it; read those rather than this file when filling one in.

Every file beside this one is that table as it stood when Notion took over.
`lib/register.ts` reads them **only when `NOTION_TOKEN` is absent** — so a
clone with no workspace credential still builds and `pnpm dev` renders pages of
real shape. **Editing them does not change the deployed site.**

Keep them valid; do not try to keep them current. See
`content/roadmap/README.md`, which says the same thing at length about the
register these bodies own work on.

## What an organisation is

A party that can be answerable for delivering something: a foundation, a
company, an SPE, a collective, a DAO. Not a funding mechanism — an RFP or a
grant programme is how work was paid for, and belongs in a commitment's
`funding`. Not an individual; people have their own table.

## The shape

`name` has to slugify to the filename — `Protocol R&D SPE` →
`protocol-r-d-spe.md` — because a commitment's owner is linked by that slug and
the two cannot disagree. The build fails when they do.

`description` is one sentence, ~140 chars, and is **not rendered on the page**.
It is the line a search result and an unfurl carry. The body is what a reader
who has arrived gets.

`link` is one URL, optional and genuinely so: both SPEs have no page of their
own. `cover` must be on `cdn.sanity.io`, the only host `next.config.ts` allows.
`logo` is a bare filename in `public/organizations`, and `people[].avatar` a
bare filename in `public/people` — both are checked at build time, because a
name pointing at a file nobody committed renders as a hole rather than an
error.

## What is deliberately not here

**What each body owns.** A commitment names its own owner, and the pages derive
the list by filtering the register on it. Storing it here as well would be a
second copy of a fact the register already holds, and the two would disagree
the first time an owner changed.
