# The people — fallback copy

**The live source is Notion**, in **Livepeer people** under *Livepeer.org
content*. That is what `/people/<slug>` renders, and where a person is added or
edited. Each property there carries a description; read those rather than this
file when filling one in.

Every file beside this one is that table as it stood when Notion took over.
`lib/register.ts` reads them **only when `NOTION_TOKEN` is absent**, so a clone
with no workspace credential still builds. **Editing them does not change the
deployed site.**

## These are real people

The body is a bio. Write it from what is known and attributable — a post they
wrote, a role they hold, work the register already credits them with — and
never from what can be assumed about a name.

An empty body renders "No bio yet", which is a prompt. An invented one is a
biography of someone who may not exist, published under their own face, and it
will read as true to everyone who finds it. The same rule governs `profile`: a
plausible handle resolves to a real stranger, so leave it empty rather than
guess and the page simply carries no forum row.

## The shape

`name` has to slugify to the filename — `Rich O'Grady` → `rich-ogrady.md` —
because a credited face is linked by that slug and the two cannot disagree.

`avatar` is a bare filename in `public/people`, checked at build time; clear it
and the face renders as a monogram. `profile` is the bare forum handle, not the
URL. `affiliation` is an organisation's name, and association only — a
commitment names the party answerable for it in its own `owner`, which is often
not the body a contributor belongs to. `cover` must be on `cdn.sanity.io`.

## What is deliberately not here

**What each person worked on.** Commitments name their own contributors, and
the page derives both lists — contributed to, and leading — by filtering
the register. A second copy would disagree with it the first time a roster
changed.
