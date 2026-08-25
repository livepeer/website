# The commitment register

Every file beside this one is a commitment: **a dated, owned undertaking to
deliver a named outcome to the Livepeer network, with a source anyone can
identified.** Nothing else belongs here. Ideas, requests and open questions stay
in the suggestions pipeline until they meet that bar.

`/roadmap` renders these as two views of one dataset — Roadmap and Shipped — so
the two surfaces can never disagree about the same record.

## Adding or updating one

Copy `content/roadmap-template.md`, fill the frontmatter, save it as
`content/roadmap/<slug>.md`. `lib/roadmap.ts` validates at build time and fails
loudly rather than rendering a half-record: unknown workstream, missing owner,
missing source, or a `state`/`shippedAt` disagreement all stop the build.

Marking something shipped is two edits — `state: shipped` and `shippedAt` — and
it moves views on its own.

## For an agent

This is deliberately markdown-in-git rather than a CMS, matching the rest of the
site (see CLAUDE.md → Content). An agent updates the register by opening a pull
request: no CMS credentials to hold, a human diff on every state change, and the
build validating the result.

The intended flow is:

```
merged PR / forum thread / LIP / SPE update
        ↓
agent proposes a frontmatter change
        ↓
pull request → review → build validation
        ↓
livepeer.org/roadmap
```

`owners` is the accountable party and `people` are the individuals doing the
work. They render as one credit on the closed card — **Owner**, the team
name, and the faces beside it. A face links to GitHub only when that person has
a `github` handle; never invent one to fill the gap, and never write a URL —
the field is a bare username and the card builds the link.

**The invented people carry invented handles, all ending `-dev`.** Their faces
have to link somewhere for the interaction to be real, and the obvious fakes are
not free: `johnsmith`, `meitanaka`, `tomwhitfield`, `peterlindqvist` and
`anjaliraman` are all live GitHub accounts belonging to actual people, so a
made-up-looking handle will happily point a placeholder face at a stranger.
Every handle here was checked against GitHub and returns 404. If you add
another, check it the same way:

```bash
curl -sL -o /dev/null -w "%{http_code}\n" https://github.com/HANDLE
```

They go when the placeholder people do: `grep -rn "\-dev$" content/roadmap`.

**Doug Petkanics and Rich O'Grady are real,** so they carry real handles and
their own GitHub avatars rather than generated portraits.

**`people` is placeholder data on most records.** The names are invented and
the portraits are generated — they exist so the page can be reviewed with its
roster in place. `owners` is real; `people` largely is not. Replace it with the
actual team before launch, or delete the field, the same way the
the `_placeholder-*` records go. `validating-livepeer-2-0-upgrades` is the
exception: its roster is real, and carries no portraits.

`related` is the field that makes this checkable — every record names at least
one place its claims can be verified — and `lastVerified` records when that last
happened. It was two fields, `sources` and `links`, split on where a claim is
checked versus where the work lives. That distinction does not survive contact
with the register: a forum thread is both, a LIP is both, and a shipped product
page is its own evidence. One list, no duplicates.

## Field mapping — board item → record

The board is the source of truth, so the register's schema is derived from it.
Where a name differs, this is the mapping a sync has to implement:

| API field | Record field | Notes |
| --- | --- | --- |
| `title` | `title` | |
| `slug` | first `related` entry | `roadmap.livepeer.org/p/{slug}`, labelled "Roadmap board" |
| `postStatus.name` / `.type` | `state` | The board's six statuses collapse to our three tenses: `In Progress`/`Now` → `building`, `Next`/`Beyond`/`Under Review` → `next`, `Completed` → `shipped`. The three tenses are deliberate — do not mirror all six. The frontmatter value stays `building`; the interface renders it as **In progress**, matching the board's own wording. |
| `statusChangedAt` | `shippedAt` | Only meaningful once the status is `Completed`. |
| `eta` | `target` | ISO instant. The board's own precision is a day; ours is whatever the record states, so a quarter-precision target is a deliberate widening, not a loss. |
| `date` | `issued` | When the item was created — the board has no separate "Opportunity Issued" field, so this is the closest true equivalent. |
| `customInputValues` | — | Keyed by field id; the definitions live in `/api/v1/organization` under `customInputFields`. Today the only one is **Phase** (select, required, public). |
| `Canon source`, `Based On`, `Staging URL` | `related` | One entry each, alongside the board link. |
| `content` (HTML) → `Owner:` line | `owners` + `people` | **Prose.** The board writes both in one line: "Steph Alinsug, Livepeer Foundation". People go to `people`, parties to `owners`. |
| `content` (HTML) → `Funding Mechanism:` line | `funding` | **Prose.** Verbatim, never paraphrased. |
| `content` (HTML) → `1. Purpose` | `outcome` + body | The one-line promise is ours; the body is background. |
| `user.name` | — | The author, which is not the same as the owner. Do not credit it. |
| `postCategory.category` | — | `Live Projects` / `NaaP` / `Suggest Ecosystem Projects`. Does not map onto Protocol / Network / Agent. |
| — | `workstream` | Ours. See above. |
| — | `lastVerified` | Ours. No board equivalent. |

## The API

Public and unauthenticated — no key, no cookie:

```bash
curl "https://roadmap.livepeer.org/api/v1/submission?limit=50"    # paginated list
curl "https://roadmap.livepeer.org/api/v1/submission?id={id}"     # one item
curl "https://roadmap.livepeer.org/api/v1/organization"           # statuses, categories, custom-field definitions
```

The resource is `submission`, not `posts`. Statuses at the time of writing:
`Completed`, `Now`, `Next`, `Beyond`, `Under Review`, `In Progress`.

**What is already structured:** status, status-change time, eta, category,
created/modified dates, author, upvotes, slug, id. A sync can read all of those
directly.

**What is still prose:** `Owner` and `Funding Mechanism`, which live as bold
lines inside the HTML `content` field, in a template that differs between an
Opportunity, a suggestion (`Who Are You? / What Is The Problem?`) and a proposal
(`Category / Proposed By / Proposed On`). Scraping those will break the first
time someone writes a line differently.

**The fix is two custom fields**, and the mechanism is already proven on this
board — `Phase` is a required, public select that the API returns under
`customInputValues`. Adding `Owner` and `Funding mechanism` alongside it would
make every field this register needs structured, at which point the sync is
straightforward. That is a board-configuration decision rather than a code one.

Do not add a custom field for state: Featurebase's native post status already
drives the board's own columns, and duplicating it guarantees the two disagree.

## The board, and what this page replaces

The requirements doc splits `roadmap.livepeer.org` in two. Its roadmap half is
what this register replaces; its **Suggestions Pipeline stays where it is**, and
this page "links to it rather than absorbing it". So the board is not being
switched off, and two fields point at it deliberately:

- `related` — the board item goes here, labelled **Roadmap board**, first in the
  list. It had a field of its own and a row of its own on the card; one list of
  useful links is simpler, and a reader following a link does not need to be
  told which category of link they are following. Not every record has one:
  several predate the board.
- `SUGGESTIONS_HREF` in `app/roadmap/page.tsx` — the standing way in, shown in
  the rail and again at the foot of the roadmap view.

`related` also carries the venues the work happens in — the forum for proposals,
RFCs, LIPs and SPE updates; GitHub for code and LIP text; the docs and explorer
for what shipped. One entry per destination: a second label on a URL already
listed fails the build.

**Unresolved:** which artifact should trigger each state change. Candidates are
a merged PR for `building → shipped`, an SPE monthly update for target changes,
and an accepted proposal for `→ next`. Until that is decided, `lastVerified` is the
honest signal of freshness and should be updated whenever a record is confirmed.

**Five records carry a `source`.** Each was matched by fetching the board item
and checking its title and owner against ours, not by guessing at slugs — one
slug reads like a different record than the item it actually names. The rest
have no board item that could be found.

**Source precision:** most records still cite a venue root — `forum.livepeer.org`
rather than the thread, `github.com/livepeer` rather than the repo — because the
detail was read off the board's changelog rather than the underlying posts. Each
needs its precise permalink before `related` is genuinely checkable. The four
records with a `source` are covered by that link in the meantime; the rest are
not:

```bash
grep -L "^source:" content/roadmap/*.md
```

**Removed: `livepeer-payment-clearinghouse`.** Its board item is an unpromoted
suggestion — the raw submission template, with no `Owned By`, no roadmap state
and no funding mechanism. The record credited the person who *raised* it as its
owner and asserted `building` / Q3 2026 / "awarded as the first Direct Grant,
milestones 1 and 2 signed off", none of which the source supports. A suggestion
presented on the canonical register as funded work in progress is the exact
failure this page replaces. It comes back when the board promotes it with an
owner, a state and a funding line.
