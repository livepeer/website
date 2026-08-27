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
owner, a list where one owner belongs, no checkable link, an unparseable
target, or a `state`/`shippedAt` disagreement all stop the build.

`lib/notion.ts` enforces the same rules against the Notion rows, so the two
readers cannot accept different things. Marking something shipped is two edits
in either source — the state and the date — and it moves views on its own.

## Owners and people

`owner` is the one party answerable for delivering — a company, foundation,
SPE, collective or funded programme. In Notion it is a relation to the
**Organizations** table rather than free text, so an owner is a record with a
type and a link and cannot be typed into existence twice. `contributors` are the individuals doing the work — **Contributors** in Notion
too, since "People" said what was on the other end of the relation rather than
what it meant, and three fields there now point at people.

`accountable` is the individual to ask about a commitment, rendered in the
expanded panel as **Contact** and linked to their forum profile where there is
a handle. One person or none: an organisation cannot answer "when will this
actually land", and until this existed a reader with that question had nowhere
to take it. Absent rather than placeheld when nobody is named — inventing a
contact sends someone to a person who has not agreed to be asked. They
render as one credit on the closed card: **by**, the owner's name, and the
faces beside it. A record that credits an organisation and no individuals is
normal.

Exactly one owner, on the convention that accountability cannot be split: two
parties equally answerable means each can assume the other has it. Notion
cannot cap a relation at one, so `lib/notion.ts` enforces it and fails the
build on a second. Where work
is genuinely shared, name the lead and put the rest where it belongs —
`funding` for joint money, `people` for the individuals. Both of the register's
two-owner records resolved that way: 2.0 validation is Foundation-owned with
Inc named in `funding`, and LIP-118 is SPE-owned with rickstaa credited under
`people`.

`avatar` is a bare filename in `public/people`, never a path or a URL.
`profile` is a bare handle from a `forum.livepeer.org/u/…` URL — the card
builds the link from it. Both are optional: a face with no portrait falls back
to a monogram, and one that links nowhere is better than one that links at a
guess.

**Most `people` entries here are invented**, with generated portraits, so the
page could be reviewed with its rosters in place. The same invented names were
carried into Notion. `owners` is real throughout; `people` largely is not, and
should be replaced with the actual teams before launch.

Only Doug Petkanics carries a `profile`, and it is his forum handle. The
records used to hold fabricated board ids — sequential zero-padded numbers,
with the same person holding a different one on each record — and those are
gone. Everyone else renders unlinked, which is the honest treatment. Never
invent one to fill a gap.

## Covers

Each record carries a banner, shown at the top of its page and its panel the
way Notion shows a page cover. In Notion it is the page cover itself; in the
markdown fallback it is a `cover:` URL.

It must be **external**, on `cdn.sanity.io`. Notion returns an uploaded image
as a signed URL that expires within the hour, so a page built at noon would
show a broken banner by one — the same reason portraits are committed to the
repo. An external cover comes back verbatim. The reader ignores uploads
rather than baking one in, and the markdown reader fails the build on any
other host, since `next.config.ts` allows that one and no other.

Images come from Peace Node's stock library. Fourteen distinct ones are in
use, matched to subject where there was an obvious fit — the agent images on
the Agent records, the GPU one on non-GPU node capabilities — and filled from
the abstract set otherwise.

## The write-up

A commitment's body is its long-form explanation, and it has its own page at
`/roadmap/<slug>`. The card carries the facts and links through; several
hundred words in a definition list beside a 6rem label is not a layout.

A real page rather than only a panel, because the reason to write at length is
to be read elsewhere: an address, an unfurl and a place in search are things a
drawer does not have.

Clicking from the index still slides it in from the right, Notion-style. That
is an intercepting route — `app/roadmap/@modal/(.)[slug]` — rendering the same
`CommitmentRecord` over the register, with the URL becoming the real one, so
it is shareable and the back button closes it. A direct visit or a refresh
bypasses the overlay and lands on the page. Building the page first is what
made the overlay cheap: it is presentation over a route that already works,
not a second rendering path with no address behind it.

Two things it has to get right, both found by testing rather than by reading:
the sheet sits above the site header's `z-80`, or the header paints over the
panel and its menu button covers the close control; and its width overrides
are written with the same `data-[side=right]` prefix as the defaults they
replace, or a bare `w-full` loses to `w-3/4` and a phone gets a 281px column
of prose.

Both sources hand the page **HTML**, so nothing downstream knows where a body
came from. The markdown register renders through the blog's remark pipeline;
Notion's blocks go through `lib/notion-blocks.ts`, because Notion does not
store markdown — a body is a tree of typed blocks, and the markdown you see
reading a page through an MCP client is that client converting for display.

Supported: headings, both list types with nesting, quotes, code, dividers,
links, bold, italic, inline code, strikethrough. Not images — a Notion-hosted
image is a signed URL that expires within the hour, the same reason portraits
are committed to the repo.

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

Nothing points at `roadmap.livepeer.org` any more. The **Roadmap board**
entries are out of `related`, and a credited face links to the forum.
