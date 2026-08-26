# The commitment register — fallback copy

**The register lives in Notion**, in **Roadmap commitments** under *Livepeer.org
content*. That is what `/roadmap` renders, and where a commitment is added,
edited, or moved to Shipped. Each property there carries a description
explaining what belongs in it; read those rather than this file when you are
filling one in.

The people credited on those commitments live in **Livepeer people**, a sibling
rather than a child: the table is shared, and named for everyone rather than for
the roadmap, so the same rows can credit people elsewhere on the site later.

Every file beside this one is that register as it stood when Notion took over.
`lib/register.ts` reads them **only when `NOTION_TOKEN` is absent** — so a clone
with no workspace credential still builds, and `pnpm dev` still renders a page
of real shape. **Editing them does not change the deployed site.**

Keep them valid; do not try to keep them current. Chasing Notion by hand would
recreate the drift that moving to a CMS removed, and a record here that fails
`lib/roadmap.ts` breaks the build for everyone working without a token.

## What belongs in the register

A commitment: **a dated, owned undertaking to deliver a named outcome to the
Livepeer network, with its funding source identified.** Nothing else. Ideas,
requests and open questions are proposed and discussed on the forum, and
appear here once they are owned and dated — a suggestion presented on the
canonical register as funded work in progress is the exact failure this page
exists to prevent.

`/roadmap` renders the register as two views of one dataset — Roadmap and
Shipped — so the two surfaces can never disagree about the same record. A
commitment is never copied when it lands: it gains a ship date and changes view.

## The format

Copy `content/roadmap-template.md`, fill the frontmatter, save it as
`content/roadmap/<slug>.md`. `lib/roadmap.ts` validates at build time and fails
loudly rather than rendering a half-record: an unknown workstream, a missing
owner, no checkable link, an unparseable target, or a `state`/`shippedAt`
disagreement all stop the build.

`lib/notion.ts` enforces the same rules against the Notion rows, so the two
readers cannot accept different things. Marking something shipped is two edits
in either source — the state and the date — and it moves views on its own.

## Owners and people

`owners` is the accountable party — the team, company, foundation, SPE or RFP on
the hook. `people` are the individuals doing the work. They render as one credit
on the closed card: **by**, the owner's name, and the faces beside it. A record
that credits an organisation and no individuals is normal.

`avatar` is a bare filename in `public/people`, never a path or a URL.
`profile` is a bare 24-hex id from a `roadmap.livepeer.org/u/…` URL — the card
builds the link from it. Both are optional: a face with no portrait falls back
to a monogram, and one that links nowhere is better than one that links at a
guess.

**Most `people` entries here are invented**, with generated portraits, so the
page could be reviewed with its rosters in place. The same invented names were
carried into Notion. `owners` is real throughout; `people` largely is not, and
should be replaced with the actual teams before launch.

The markdown records also carry **fabricated `profile` ids** — sequential
zero-padded numbers, and the same person holds a different one on every record.
Notion dropped them: only Doug Petkanics has a real board id, and everyone else
renders unlinked, which is the honest treatment. Never invent one to fill a gap.

## `related`

The field that makes a record checkable: every one names at least one place its
claims can be verified. It was two fields, `sources` and `links`, split on where
a claim is checked versus where the work lives. That distinction does not
survive contact with the register — a forum thread is both, a LIP is both, and a
shipped product page is its own evidence. One list, and one entry per
destination: a second label on a URL already listed fails the build.

Most records still cite a venue root — `forum.livepeer.org` rather than the
thread — because the detail was read off a changelog rather than the underlying
posts. Each wants its precise permalink before the field is genuinely useful.

## Getting a change onto the site

Three paths, fastest first. None of them is required — the slowest one always
runs, so the others are optimisations rather than steps anyone must remember.

**The Notion webhook.** A subscription on the integration, which is not the
same thing as an automation inside the database: automations perform actions
and deliberately do not run on API edits, so an agent updating a commitment
triggers nothing. Webhooks are delivery, and their payload identifies the
author as `person`, `bot` or `agent` — so they should fire for both. `POST
/api/notion-webhook` handles it. Setup is an admin job:

1. In the integration's settings → **Webhooks** → **Create a subscription**,
   pointing at `https://<the live domain>/api/notion-webhook`. It must be the
   real domain: a preview URL changes with every deployment, and the
   subscription would go quiet the next time anyone pushes.
2. Notion immediately POSTs a one-off `verification_token`. The route logs it
   as `[notion-webhook] verification_token=…` — read it from the deployment
   logs.
3. Put that value in the project's environment as `NOTION_WEBHOOK_SECRET`, and
   paste it back into Notion's Webhooks tab to confirm. It is the signing key
   for every event afterwards and is not recoverable later; if it is lost,
   re-subscribe for a new one.
4. Subscribe to the page and data-source events — created, properties updated,
   content updated, deleted.

Then test the part the documentation does not answer: make an edit through the
API and check an event arrives. If bot edits turn out to be silent, the window
below is what covers them.

**`POST /api/revalidate`**, with `REVALIDATE_SECRET` as a bearer token. For an
agent that has just written through the API and wants the page now. It only
reaches whoever holds the secret, so it is a convenience for this repo rather
than a general mechanism.

**The window.** `NOTION_REVALIDATE`, one minute by default. This is the one
that serves the people editing the board, who are not going to call anything.
Nothing runs on it: Next regenerates on request, so a quiet site makes no
Notion calls at all, and a busy one stays an order of magnitude inside
Notion's rate limit.

It does not remove the stale serve — the first request after the window still
returns the old page while the new one builds behind it, so an editor reloads
twice either way. Only the webhook fixes that. Once it is live and proven,
put this back up; it becomes a backstop.

## Where ideas go

The forum. `SUGGESTIONS_HREF` in `app/roadmap/page.tsx` is the standing way in,
shown in the rail and at the foot of the roadmap view, and it points at
`forum.livepeer.org` — where proposals, RFCs, LIPs and SPE updates already
happen, and where `related` sends people on most records.

`roadmap.livepeer.org` is still referenced in two places that have not been
decided: the **Roadmap board** entries in four records' `related`, and the
profile link a credited face builds from `profile`. Both are dead ends if the
board is switched off.
