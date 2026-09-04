# CLAUDE.md

**Stack:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4. Package manager: **pnpm** (pinned via `packageManager` — use `corepack`). No test framework.

This repo is mid-migration to the **Livepeer UI design system** (a shadcn registry). Read the "Design system" section below before touching UI — it overrides older habits.

## Design system — Livepeer UI (source of truth)

The design system lives outside this repo and is the authority for tokens, type, color, and components. Do not invent a parallel system.

- **Guidelines:** https://livepeer.peaceno.de/design.md — read the "Agent workflow" section and follow it.
- **Registry docs:** https://livepeer.peaceno.de/docs
- **Registry items:** `https://livepeer.peaceno.de/r/{name}.json`, namespaced `@livepeer-ui` in `components.json`.

Install the theme, then only the items a page needs:

```bash
pnpm dlx shadcn@latest add @livepeer-ui/theme
pnpm dlx shadcn@latest add @livepeer-ui/button @livepeer-ui/card
```

**Agent workflow (from design.md):** pick one surface → inspect the nearest existing mockup/section/demo → install theme + only the registry items the job needs → build real content and **loading / empty / error / unavailable / disabled / ready** states before visual polish → compose with **semantic tokens and existing roles** (invent a pattern only when the registry doesn't cover it) → verify supported themes + **390px**, meaningful **sm** and **md** transitions, and **wide desktop**.

### Hard rules

- **Semantic tokens only.** `background`/`foreground`, `card`, `muted`, `primary`, `secondary`/`accent`, `border`/`input`/`ring`, `destructive`, `chart-1..5`, `radius`. No hard-coded theme colors. **No second token layer** — the registry theme is the only one.
- **Livepeer green is not an affordance color.** Green is non-interactive brand expression only. Actions use `primary`, never green.
- **Fonts are role-split:** `font-sans` = **Inter** (all product UI, nav, body, docs); `font-display` = **Favorit Pro** (opt-in — major marketing/editorial statements only); `font-mono` = **Favorit Mono** (code, paths, IDs, timestamps; usually `text-xs`/`text-sm`). Use the semantic type utilities (`text-ui-body`, `text-reading-body`, `text-page-title`, `text-display-sm/md/lg/fluid`).
- **Light and dark are both first-class.** Neither is a fallback. Verify both.
- **Lucide icons only** (`lucide-react`).

## Commands

- `pnpm dev` — dev server on localhost:3000
- `pnpm build` — production build (verify changes compile)
- `pnpm lint` / `pnpm typecheck`

## Information architecture (redesign)

Eleven linked pages, designed in the mockup set (`/docs/public-beta/livepeer-org`) except where noted, plus the primer kept intact but unlinked.

| Page | Route | Notes |
| --- | --- | --- |
| Home | `/` | |
| Agent | `/agent` | flagship product surface |
| Ecosystem | `/ecosystem` (`/[slug]`, `/submit`) | markdown-driven catalog |
| Provide GPU compute | `/compute` | one page for running + earning (`/earn` is an alias → `/compute`) |
| Token | `/token` | no live protocol stats in the new design |
| Foundation | `/foundation` | |
| Latest (blog) | `/blog` | nav labels it "Latest"; URL stays `/blog`. Notion-backed |
| Contribute | `/contribute` | **no mockup** — replaces the Foundation's Grants & Funding Mechanisms Notion page as the canonical destination. Answers "how can I get involved?" in two parts: a sentence and a Discord button (in-repo copy), and the **funding ladder** — every way work gets paid for, ordered by size, read from the Notion *Funding paths* database. The roadmap's "Not on the roadmap?" block points here rather than straight at the forum. The hero's ground is a contribution graph drawn with **vgpu** (`components/livepeer-ui/contribute-graph.tsx` and its `.wgsl`): the grid a contributor's year is drawn on, filling the hero and running up under the transparent header, four levels of the brand green moving through it as slow bands, with a CSS mask on the canvas clearing the ground around the text. Colour from the theme tokens, one still frame under reduced motion, DPR capped at 1.5. The empty grid is CSS behind the canvas, so with no WebGPU adapter the ground is simply empty and the page never shifts; the shader and that CSS share pitch, cell and centring, so change both together. `.wgsl` imports go through `@vgpu/wgsl/loader-webpack`, wired in `next.config.ts` for both bundlers, with the type shim in `wgsl-env.d.ts`; the loader does not validate, so check a shader with `pnpm exec vgpu check <file> --require-validation` |
| Brand | `/brand` | **no mockup** — designed from design.md + registry Foundations. Signed off; no CD review pending |
| Roadmap | `/roadmap` (`/[slug]`) | **no mockup** — built from the requirements doc. Notion-backed; records have their own pages, and an intercepting route slides one over the register |
| Organizations | `/organizations/[slug]` | **no mockup**. Notion-backed, rendered like a roadmap record and slid over the register by an intercepting route (`app/roadmap/@modal/(..)organizations`), and **no index** — with one logo and three bodies owning nothing, seven cards read thin. Reached only from an owner's name on a roadmap card. What each owns is derived by filtering the register on `ownerSlug`, never stored on the organization |
| People | `/people/[slug]` | **no mockup**. Notion-backed, same record/sheet treatment, **no index**. Reached from a credited face on a roadmap card. A bio is the page body and is optional — a person with none renders "No bio yet" rather than an invented one. What they worked on is derived from the register |
| Primer | `/primer` | **keep intact, unlinked** — its own scoped legacy CSS; only consumer of `lib/subgraph.ts` |

Redirect changes live in `next.config.ts`: `/network` & `/orchestrate` → `/compute`; the five `/use-cases/*` → `/agent` (transcoding one → `/compute`); `/delegate` stays external (explorer). Keep existing blog host + slug redirects.

## Content — split on shape and update frequency

Page copy lives in the repo and is edited in-repo (with Claude Code), not through a CMS. This is a considered decision, not an inherited rule: the registry is Sanity-native (its `contracts.ts` is a full Sanity content schema, and the header ships a `sanity/` client), but we don't want a CMS dependency — copy is easy to update in-repo.

**Templated content that gets updated frequently** goes to Notion instead — many records sharing one shape, maintained by people on their own schedule. Three surfaces do: the **roadmap register**, edited by people across several organisations who do not open pull requests and where a commitment a week stale is worse than no page at all; the **blog**, where publishing should not require a deploy; and the **funding ladder** on /contribute, whose caps and programmes the Foundation maintains. Scope is those three — this is not a general migration of the site into a CMS, and bespoke page copy stays here. See below.

- **Page content:** author static, typed objects that match the registry's content contracts in `components/livepeer-ui/contracts.ts` (e.g. `LivepeerOrgSite`, `LivepeerOrgPage`). `lib/site.ts` is the pattern. This uses registry components exactly as designed — they just take a content object — and keeps a clean seam to adopt Sanity later if that ever changes.
- **Sanity is stubbed, not used:** `sanity/lib/livepeer-org-navigation.ts` is a static, no-CMS replacement — a plain module of 11 hard-coded `cdn.sanity.io` URLs for the nav dropdown thumbnails, no client and no query. It is **load-bearing**: `app/layout.tsx` imports the value and two registry header components import its type, so it cannot be deleted. It lives under `sanity/` only because that is the import path the registry components expect. Don't install `next-sanity` or wire a real Sanity client.
- **Ecosystem:** local **markdown** + YAML frontmatter (`content/ecosystem/*`), rendered via gray-matter + unified/remark/rehype in `lib/ecosystem.ts`. `content/ecosystem-template.md` is the live contributor schema.
- **Roadmap, blog and funding ladder: Notion.** Five databases under *Livepeer.org content* in the Livepeer Foundation workspace — *Roadmap commitments* (`0a51970884f44514a405f63d6bdb68db`), *Livepeer people* (`cdaf4aff05034435aed838eb2a8676ab`), *Organizations* (`728d4f42db6d4ba4925ae177c08b1d70`) and *Blog posts* (below). The register relates to the middle two so a person's name, portrait and profile id, and an owner's name and type, are each stated once. They sit beside the register rather than under it, and are named for everyone rather than the roadmap, because the same rows credit people elsewhere — which is what *Blog posts* now does for `Author`. `lib/notion.ts` reads them over plain `fetch` (no `@notionhq/client`) and maps them onto the same `Commitment` type the markdown reader produces, enforcing every rule the markdown reader enforced. `lib/register.ts` picks the source: Notion when `NOTION_TOKEN` is set, `content/roadmap/*.md` when it is not, so a clone with no workspace credential still runs. A Notion failure *with* a token throws — a build that quietly served stale markdown would publish a roadmap that looks current and is not. ISR at one minute (`NOTION_REVALIDATE`), so a card moved to Shipped reaches the site without a deploy.
  - **Blog posts** (`ed74ac33f630497d8c3cf23599de462b`), added the same way: the post *is* the Notion page body, and `lib/register.ts` gains `getBlogRegister()` (the index, metadata only) and `getBlogPost(slug)` (one post, with its body). The split is deliberate — twelve bodies fetched to render a list of cards that show none of them is twelve wasted round-trips. `content/blog/*.md` stays as the no-token fallback, exactly like `content/roadmap`. Drafts are filtered in the register rather than at each of the four routes that read a post.
  - `Slug` is an explicit property, not derived from the title the way commitment ids are: a published URL is quoted back by everyone who links to it, and a headline gets edited.
  - **`Author` relates to *Livepeer people***, which is what that database was named generically for. One or none, enforced by the reader.
  - `Tags` are carried but rendered nowhere today — the index filters on `Category`, a closed set of five that both readers enforce.
  - **Funding paths** (`e2a8b7e07c92459f81e06af6e15a3440`) is the smallest: one row per way work gets paid for, and the only Notion-backed surface with no page body — the site reads Name, Best for, Ceiling, Decided by, Link, Link label, Order and Status, and nothing else. **`Decided by` relates to *Organizations***, exactly one, so the caption above a group of rungs links to the body's page; groups are ordered by their lowest rung, so the ladder climbs across bodies as well as within them and nothing about which bodies exist is in code. It is record-shaped on purpose: the ladder's design (mono ceiling column, grouped captions, size order) survives only because the data is five fixed fields rather than prose. `lib/contribute.ts` holds the one validator both readers use; `Order` must be unique among active rows because two rungs at one height would render in whichever order Notion returned them. **Retired is a status, not a deletion** — a retired row renders as the "no longer takes requests" line for the reader who followed an old link. `content/contribute/*.md` is the frontmatter-only fallback. The hero and the two notes on that page are the site's voice and stay in the repo.
  - **A post's art is its page cover**, not a property — one image serving the index card, the post's header and the share card. It started as a `Card image`/`Hero image` pair beside a cover holding the same URL, which is two visible copies of one fact and a rule the roadmap does not have. Required: a post with no cover fails the build.
  - Portraits stay in `public/people`; Notion's **Portrait** property holds a Files entry linking to that same committed file, so Notion can preview the face while the site serves the repo copy. The site takes the filename off the end of that link and never loads it.
  - **Media in a page body must be a link, never an upload** — `lib/notion-media.ts` is the allowlist and the reasoning. `cdn.sanity.io` passes through; a `livepeer.org` address is rewritten to the committed file under `public/` and checked for existence, so Notion previews it from the live site while the site serves its own copy. Anything else fails the build. A caption doubles as alt text, because Notion has no separate field for it.
  - **Every commitment needs a page cover**, and it must be an **external** image on `cdn.sanity.io` from Peace Node's stock library (`livepeer.peaceno.de/marketing/stock-images`) — never an upload. Notion returns an uploaded image as a signed URL that expires within the hour, so a page built at noon would show a broken banner by one. Same reason portraits are committed rather than hosted in Notion. This rule is repeated in the *Roadmap commitments* database description, because a cover is not a property and an agent reading the schema would otherwise never learn of it.
  - A Notion automation sets `Shipped on` when someone drags a card to Shipped — but **Notion does not run automations on API edits**, so anything writing `Status` through the API or an MCP must write `Shipped on` in the same edit. The reader fails the build when the two disagree.

## Migration state — complete

The registry theme is now the only token layer. The old hand-rolled `--color-*`
layer, the Holographik grid, the hero classes, `.blog-prose`, and 17 bespoke
keyframes are gone; `app/globals.css` went 1209 → ~610 lines and holds only the
`@theme` type scale, the two theme roots, `.reading-prose` / `.article-prose`,
and four live keyframes. The primer keeps its own scoped slice and its Raleway
face — it is the one page deliberately left unmigrated.

Also deleted with the cutover: `components/home/*`, `components/legacy/*`,
`components/ecosystem/*` (superseded by `components/livepeer-ui/*`), the
PascalCase `components/ui/*` visuals, `lib/constants.ts`, and the five
`app/use-cases/*` routes — the redirects in `next.config.ts` are what serve
those URLs now, so the pages were unreachable anyway.

The Foundation page **deliberately drops** content the old page carried — the
three pillars spelled out individually, and the "About The Project" block with
the Messari citation. That is a considered editorial cut, not migration loss:
don't restore it from git history.

**Share images** (`lib/og.tsx`): `/` renders the registry's `@livepeer-ui/og`
card verbatim — the lockup centred on `#000000`. Every other page renders the
same canvas with a page title, and each segment carries a `twitter-image`
re-export beside its `opengraph-image`, because metadata files cascade and a
segment without one serves the *root's* Twitter card. Blog posts override both
with their own frontmatter art.

## Positioning

- **Thesis:** "The open inference network — run AI video and image workloads on Livepeer." Agent-centric. Name the workloads concretely (video, images); "AI and media workloads" was the earlier, vaguer framing.
- Lead with what builders do on the network; route audiences to **solutions/the ecosystem**. The network is infrastructure; solutions are the products.
- **CTAs point to the Agent / Discord.** No email capture, no newsletter.
- **Voice:** confident, technical, accessible. Name competitors honestly. Be honest about constraints. Avoid "revolutionary," hype, "web3 bro" tone, and "decentralized" as a selling point.
- **Terminology:** "the network" (not "the platform"), "open network," "solutions," "orchestrators," "GPU providers," "inference."

## Don't

- **`next/image`:** registry components use it (with `cdn.sanity.io` allowed in `next.config.ts`) — that's fine. The legacy exception still holds: keep raw `<img>` for `ImageMask`/canvas/WebGL components and primer SVGs, which depend on direct CSS filter/stacking that `next/image` breaks.
- **No second token layer**, no one-off color/spacing/radius values outside the registry roles.
- **No global state** — local `useState` only.
- **No CMS for page copy** — author it as typed objects matching the registry contracts. This rule is scoped to copy that changes with its design; it is *not* an argument against the roadmap and blog living in Notion (see Content). Equally, don't propose moving other surfaces there unasked. Keep the Sanity client stubbed and don't add `next-sanity`.
- **Green is never an interactive/affordance color.**
