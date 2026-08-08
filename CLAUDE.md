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

Eight linked pages, all designed in the mockup set (`/docs/public-beta/livepeer-org`), plus the primer kept intact but unlinked.

| Page | Route | Notes |
| --- | --- | --- |
| Home | `/` | |
| Agent | `/agent` | flagship product surface |
| Ecosystem | `/ecosystem` (`/[slug]`, `/submit`) | markdown-driven catalog |
| Provide GPU compute | `/compute` | one page for running + earning (`/earn` is an alias → `/compute`) |
| Token | `/token` | no live protocol stats in the new design |
| Foundation | `/foundation` | |
| Latest (blog) | `/blog` | nav labels it "Latest"; URL stays `/blog` |
| Brand | `/brand` | **no mockup** — designed from design.md + registry Foundations. Signed off; no CD review pending |
| Primer | `/primer` | **keep intact, unlinked** — its own scoped legacy CSS; only consumer of `lib/subgraph.ts` |

Redirect changes live in `next.config.ts`: `/network` & `/orchestrate` → `/compute`; the five `/use-cases/*` → `/agent` (transcoding one → `/compute`); `/delegate` stays external (explorer). Keep existing blog host + slug redirects.

## Content — deliberate: in-repo, no CMS

Content lives in the repo and is edited in-repo (with Claude Code), not through a CMS. This is a considered decision, not an inherited rule: the registry is Sanity-native (its `contracts.ts` is a full Sanity content schema, and the header ships a `sanity/` client), but we don't want a CMS dependency — copy is easy to update in-repo.

- **Page content:** author static, typed objects that match the registry's content contracts in `components/livepeer-ui/contracts.ts` (e.g. `LivepeerOrgSite`, `LivepeerOrgPage`). `lib/site.ts` is the pattern. This uses registry components exactly as designed — they just take a content object — and keeps a clean seam to adopt Sanity later if that ever changes.
- **Sanity is stubbed, not used:** `sanity/lib/livepeer-org-navigation.ts` is a static, no-CMS replacement (returns no images). Don't install `next-sanity` or wire a real Sanity client.
- **Blog + ecosystem:** local **markdown** + YAML frontmatter (`content/blog/*`, `content/ecosystem/*`), rendered via gray-matter + unified/remark/rehype in `lib/blog.ts` / `lib/ecosystem.ts`. `content/ecosystem-template.md` is the live contributor schema.

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
- **No CMS** (deliberate — see Content). Author page content as typed objects matching the registry contracts; keep the Sanity client stubbed. Don't add `next-sanity`.
- **Green is never an interactive/affordance color.**
