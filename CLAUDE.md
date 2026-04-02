# CLAUDE.md

**Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS v4, Framer Motion 11. Package manager: npm. No test framework.

**Environment variables** (set in Vercel / `.env.local`):

- `MAILCHIMP_API_KEY` — Mailchimp API key (early access signups)
- `MAILCHIMP_AUDIENCE_ID` — Mailchimp audience/list ID
- `MAILCHIMP_TAG` — Mailchimp tag applied to new subscribers (default: "v2 Website Signups")
- `THEGRAPH_API_KEY` — optional; authenticated subgraph requests for live protocol stats (falls back to hardcoded values)

## Commands

- `npm run dev` — start Next.js dev server on localhost:3000
- `npm run build` — production build (use to verify changes compile)
- `npm run start` — start production server (requires prior build)
- `npm run lint` — run ESLint

## Project Structure

### `app/`

- **Routes**: home (`/`), blog, blog/[slug], primer, foundation, brand
- **Redirects**: developers, lpt, community → `/` via `redirect()`; use-cases/world-models → `/`
- **API routes**: `api/early-access` — POST endpoint that subscribes contacts to a Mailchimp audience
- **Use cases**: `use-cases/` has 7 sub-routes — all currently redirect to home. No `/use-cases` index page.
- **Layout**: `layout.tsx` wraps all pages with Header + Footer. Global metadata and font classes defined here.
- **SEO**: OG images generated via `next/og` at root and `/blog` levels. Primer and blog pages have per-page metadata.
- **Styling**: `globals.css` — Tailwind v4 `@theme` block, utility classes, keyframe animations.

### `components/`

- **`home/`** — self-contained homepage sections. Render order in `app/page.tsx`: Hero, BuiltOnLivepeer, CommunityCTA. (`NetworkParticipants.tsx` exists but is not currently rendered.)
- **`layout/`** — Header, Footer. Header has headroom behavior on `/primer` (hides on scroll down, reveals on scroll up).
- **`ui/`** — shared primitives (Button, Card, Container, SectionHeader, Badge, ImageMask, GlowOverlay, EarlyAccessCTA, etc.). Reuse these; don't create new wrappers for the same purpose. Also contains canvas components: `GenerativeCanvas.tsx` (GLSL shader), `LiveNetwork.tsx` (Canvas 2D particle trails), `AiVideoHero.tsx` (Sobel edge detection on video texture). All canvas components follow `useEffect` + `useRef<HTMLCanvasElement>` + `requestAnimationFrame` + cleanup.
- **`blog/`** — blog listing page (`BlogListingClient`, `BlogCategoryFilter`, `BlogPostCard`) and post detail (`BlogPostHeader`, `BlogPostContent`).
- **`primer/`** — 10-chapter educational primer with chapter navigation, scroll-based background color transitions, and live protocol stats from subgraph. Primer uses a light theme override. Components: `PrimerContent`, `InflationMeter`, `MintingDiagram`.
- **`icons/`** — `LivepeerLogo.tsx` exports `LivepeerSymbol` (icon), `LivepeerWordmark` (text), `LivepeerLockup` (icon + text).

### `lib/`

- `constants.ts` — `NAV_ITEMS` and `EXTERNAL_LINKS`
- `fonts.ts` — Favorit Pro and Favorit Mono config via `next/font/local`
- `useCountUp.ts` — IntersectionObserver-triggered count-up animation hook
- `blog.ts` — blog content loading, markdown→HTML pipeline (gray-matter + unified/remark/rehype), reading time calculation
- `subgraph.ts` — fetches live protocol stats (inflation, participation, supply) from The Graph Livepeer subgraph with hardcoded fallbacks

### `public/`

- `images/` — static images and SVGs (including `primer/` and `blog/` subdirectories)
- `videos/` — MP4 files for hero backgrounds and visual effects
- `fonts/` — Favorit Pro (.woff2, .otf) and Favorit Mono (.woff2)

### `content/`

- `blog/` — markdown blog posts with YAML frontmatter (title, description, date, author, category, tags, image, draft). Draft posts are hidden in production.

### Reference docs

- `brand-tokens.md` — full brand spec (colors, typography, logo, gradients, greyscale ramp, graphic elements)
- `livepeer-website-brief.md` — project brief with messaging and positioning context

## Conventions

### Component patterns

- All homepage sections and interactive components use `"use client"`.
- Scroll animations: Framer Motion `whileInView` with `viewport={{ once: true }}` and staggered children. Hero/brand pages use `initial`/`animate` (fires on mount) instead.
- Section headers: use the `SectionHeader` component with `label`, `title`, `description` props.
- Section dividers: `.divider-gradient` divs between sections.
- Imports: path alias `@/*` maps to repo root. Use `@/components/...`, `@/lib/...`.

### Assets

- Static files in `public/images/`, `public/videos/`, `public/fonts/`.
- Videos use `autoPlay muted loop playsInline`.
- `globals.css` includes `prefers-reduced-motion` to blanket-disable all animations.

### Grid system — "Holographik" visual language

The site's signature visual is a layered grid system that combines B&W video/imagery, geometric shapes, animated particle trails, and liquid glass effects. This creates an "outer space control room" aesthetic — technical, cinematic, and distinctly Livepeer.

**Layer stack (bottom to top):**

1. **Media layer** — B&W video or image with green tint, darkened (`ImageMask`)
2. **Tile grid** — 9-column square grid with 1px white borders, overlaid on the media
3. **Geometric shapes** — circles, crosshairs, and a starburst node positioned at grid intersections
4. **Pulse trail** — an animated dot that traverses the grid lines and shape edges via SVG `getPointAtLength()`, creating a living-network feel
5. **Liquid glass overlay** — frosted panel with subtle gradient fill, chromatic rainbow refraction, specular highlights, and corner crosshairs, snapped to grid lines
6. **Content** — text, CTAs, rendered on top of everything

**`ImageMask`** (`components/ui/ImageMask.tsx`) — Pure CSS grid, the core brand component. Uses `container-type: inline-size` with `100cqw / cols` row heights so tiles stay square relative to their container (not the viewport). Columns are `1fr`. Used on the homepage hero and brand page hero. The homepage overlays geometric shapes positioned with `${N * TILE}vw` units (`Hero.tsx`); the brand page uses percentage-based positions inside an `aspect-ratio: 9/5` wrapper. **Do not cap tile size independently on the homepage** — the vw-based positions of every overlay element depend on tiles spanning the full viewport. To control tile size on wide screens, adjust the column count or constrain the section width.

### Don't

- **No `next/image`** — use raw `<img>` tags. `ImageMask` needs direct CSS filter/absolute stacking that `next/image`'s wrapper breaks. Primer SVGs are incompatible with required width/height props. WebGL components use `<video>` as GPU textures. Don't introduce without discussion.
- **No global state** — local `useState` only. No context providers, no state libraries.
- **No CMS** — page content is static/hardcoded. Blog posts are local markdown files, not fetched from an external CMS.
- **Minimal server-side fetching** — the only external data sources are the Livepeer subgraph (protocol stats, ISR-cached) and Mailchimp (email signups via API route). Don't add new external dependencies without discussion.

## Brand & Styling

Full spec in `brand-tokens.md` — colors, typography, logo rules, greyscale ramp, gradients, graphic elements.

**Theme tokens** (`globals.css` `@theme`):

- Colors: `green`, `green-light`, `green-dark`, `green-bright`, `green-subtle`, `blue`, `blue-light`, `blue-bright`, `blue-dark`, `blue-subtle`, `dark`, `dark-lighter`, `dark-card`, `dark-border`
- Fonts: `--font-sans` (Favorit Pro — Light/Book/Regular/Medium/Bold), `--font-mono` (Favorit Mono — Regular/Medium/Bold)

**Primary colors:** Green `#18794E`, Black `#121212`, White `#FFFFFF`. Use Tailwind tokens, not raw hex.

**Utility classes:** `.text-gradient` (green gradient text), `.divider-gradient` (section separator), `.tile-bg` (subtle grid)

**Keyframes:** `breathe`, `node-pulse`, `scanLine`, `imageMaskFlow`

Dark theme only — except `/primer`, which uses a light theme override with scroll-based background color transitions per chapter.

## Messaging

### Positioning (v2 Thesis — March 2026)

- **Thesis statement:** "Livepeer is the open network for GPU-powered video."
- **Canonical headline:** "The open network for GPU-powered video"
- **Tagline (footer):** "The open network for GPU-powered video."
- Lead with solutions (builds on the network), not raw protocol capabilities.
- The network provides GPU infrastructure. Solutions provide the product experience.
- **Three competitive variables (cost / capability / community):**
  - **Cost:** 60–85% cheaper than centralized alternatives (AWS, RunPod, Fal). [FLAG: pending validation with Rick — do not scale to "10x" without confirmed data]
  - **Capability:** Specialized for real-time, streaming video inference. Nine years of video processing optimization. BYOC flexibility for custom models and pipelines. No other network is built specifically for this.
  - **Community:** The network is operated by independent orchestrators, expanded by builders building on builders, and open to permissionless participation. This is a structural property of the infrastructure — not a Discord server or governance forum. A centralized provider structurally cannot replicate this.
- Not a trilemma — cost, capability, and community interact.
- **External competitive frame:** Livepeer solutions (powered by community-operated GPU infrastructure) vs. centralized alternatives (AWS, RunPod, Fal, Replicate) for GPU-powered video. Name competitors explicitly — the target audience is comparison-shopping.
- **Internal only (not for website copy):** DePIN comparisons (Theta, Render, Akash). These are relevant for internal strategy but not for developer-facing positioning.
- **Narrative routing principle:** Every piece of external communication should route audiences to solutions on the network. The question the website answers: "What's being built on Livepeer, and how can I use it?"
- **Solutions on the network:** Daydream (real-time generative video), Frameworks (sovereign live streaming), Streamplace (decentralized social video), Embody (AI avatars). These are the ecosystem, not Livepeer products.
- **CTA pattern:** All CTAs point to Discord ("Build with Livepeer"). No email capture.

### Voice

- Confident, technical but accessible, no-nonsense.
- Lead with what builders can do on the network and why it matters. Use concrete numbers where validated.
- Name competitors directly — credibility comes from honest comparison, not avoidance.
- Be honest about constraints. The network has ~100 AI-capable GPUs, estimated 90–95% uptime, no formal SLAs. Don't oversell what doesn't exist yet.
- Explain technical concepts simply on first reference.
- **Avoid:** "revolutionary," "game-changing," empty superlatives, hype language, "web3 bro" tone, "decentralized" as a selling point, "the platform," lorem ipsum.

### Terminology

| Use                                        | Don't use                                             |
| ------------------------------------------ | ----------------------------------------------------- |
| "the network"                              | "the platform," "the service"                         |
| "open network"                             | "decentralized infrastructure" (too web3-coded)       |
| "solutions"                                | "builds" (internal only), "gateways," "tools," "DGEs" |
| "GPU providers" (dev-facing)               | "nodes" (too generic)                                 |
| "orchestrators" (protocol/network context) | "miners," "validators" (wrong mental model)           |
| "inference"                                | "processing" (when referring to AI specifically)      |
| "GPU-powered video"                        | "real-time AI video" (previous headline, now retired) |

### What the v2 thesis kills (do not use this framing)

- ~~"The network is the product."~~ → The network is infrastructure. Solutions are the products.
- ~~"Livepeer is a generalized GPU compute network."~~ → It's specialized. GPU-powered video.
- ~~"We need to attract developers to the raw protocol."~~ → Route audiences to solutions.
- ~~"Enterprise is the near-term market."~~ → The edges are.
- ~~"Centralized vs. decentralized."~~ → The tension is centralized-proprietary vs. community-operated/open.
- ~~"10x cost reduction."~~ → 60–85% cheaper. [FLAG: pending Rick validation]
- ~~"100K+ GPUs."~~ → ~100 AI-capable GPUs currently. Don't inflate supply numbers.

## Strategic Context

This website reflects Livepeer's v2 positioning as a specialized GPU network for real-time video inference. The thesis organizes everything around a three-layer stack: supply (GPUs contributed by orchestrators), protocol (routing that matches workloads to GPUs), and demand (builds that package network capabilities for their audiences).

### The Stack

```
┌─────────────────────────────────────────────┐
│              DEMAND (top)                    │
│  Builds. Products and businesses on the     │
│  protocol that serve their own audiences.   │
├─────────────────────────────────────────────┤
│             PROTOCOL (middle)               │
│  Routing. Orchestrator discovery, job       │
│  routing, staking, delegation, payments.    │
├─────────────────────────────────────────────┤
│              SUPPLY (bottom)                │
│  GPUs. Physical compute contributed by      │
│  independent orchestrators.                 │
└─────────────────────────────────────────────┘
```

### Current Builds (the ecosystem)

- **Scope / Daydream** — Creative AI tools for real-time video. ~30-person creative technologist cohort. Demand R&D partner, not primary demand driver.
- **Frameworks (Marco)** — Live streaming infrastructure. Bare-metal video pipelines on the network.
- **Embody (George)** — Embodied AI avatars. ~70% dev time on integration infrastructure.
- **Streamplace (Eli)** — Open-source video infrastructure for decentralized social (AT Protocol).

### Target Audience: The Edges

The near-term audience is the edges — builders drawn to frontier, specialized infrastructure for emerging use cases. They tolerate constraints (reliability, polish) because cost, capability, or community alignment makes their work possible. This is not the enterprise market.

Three segments: creative technologists (enter through Scope), early-stage AI video builders (enter through whichever build fits), orchestrator-entrepreneurs (enter through the network itself).

### 2026 Foundation Priorities

1. Route audiences to builds — the ecosystem page is the website's primary routing surface
2. Validate edges audience motivations through builder discovery and audience research
3. Ship case studies proving cost, capability, and community claims before they become headlines
4. Grow the builder ecosystem — the network's demand story is the builds' story

### Website Design Direction

- **Specialized, not generic** — lead with video inference specialization, not "open infrastructure"
- **Brand source of truth:** Holographic Agency brand guidelines (see `brand-tokens.md`)
- **Design references:** Vercel, Linear, Stripe, Raycast — clean, developer-focused, premium feel
- **Primary audience:** Builders evaluating GPU infrastructure for real-time video AI applications
- **Ecosystem page is the primary routing surface** — every visitor should be able to answer "what's being built here and how do I use it?"
- **Honest about constraints.** Don't mock up product UI that doesn't exist. The CTA is "Build with Livepeer" (Discord) — match the copy to that reality.

### Open Flags

These claims require validation before shipping as headlines. Use [FLAG] markers in copy:

- 60–85% cost claim — needs Rick validation against current network pricing
- "Agents can discover and pay directly" — pending Rick's architecture confirmation
- Framework case study — blocked on Marco discovery conversation
- Specific GPU/node counts — verify current numbers before publishing
