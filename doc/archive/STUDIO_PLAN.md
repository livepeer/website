# Livepeer Studio — Complete Plan

# PART 1: PRODUCT SPEC

## What We're Building

Livepeer Studio is a developer portal — like Replicate, but for the Livepeer AI network. Developers discover AI APIs, try them instantly (some without even creating an account), and integrate them into their apps with one API key.

## Why We're Building It

1. **Discoverability** — Developers can't easily find what's available on the Livepeer network
2. **Onboarding friction** — Using raw network capabilities requires understanding orchestrators, gateways, tickets
3. **Fragmented experience** — Each provider (Daydream, Blueclaw, Pipelines) has their own auth, billing, docs
4. **No try-before-you-buy** — You can't just click "run" and see what happens

Studio solves all four: one catalog, one account, one key, one bill. And selected network APIs can be tried without even signing up.

## How It Relates to Website & Explorer

```
livepeer.org                     ← Marketing site (livepeer/website repo, keep as-is)
  /                              ← Landing, blog, docs, brand
  /explorer                      ← Network explorer (separate repo, linked via Vercel rewrite)
  /studio                        ← Developer portal (NEW repo, linked via Vercel rewrite)
```

Three independent apps, one domain. Connected via Vercel rewrites in the website's `next.config.js`:
```js
async rewrites() {
  return [
    { source: '/studio/:path*', destination: 'https://studio.livepeer.org/:path*' },
    { source: '/explorer/:path*', destination: 'https://explorer.livepeer.org/:path*' },
  ]
}
```

- **Website** links to Studio via "Start Building" / "Try AI APIs" CTAs
- **Explorer** links to Studio via "Use this capability" on orchestrator/pipeline pages
- **Studio** links back to Explorer for network stats ("47 orchestrators available → View on Explorer")

## Who Uses It

1. **Developers (primary)** — Browse APIs, try them, get API key, integrate
2. **Providers** — Register their API on the marketplace, get traffic and revenue
3. **Casual explorers** — Try a text-to-image API without creating an account, maybe convert later

---

## Naming & Taxonomy

**Everything is an "API" in the UI.** The Livepeer network has raw capabilities AND third-party services built on top. We don't distinguish between them in the UI — developers don't care about the infrastructure.

| Term | Used where | Meaning |
|------|-----------|---------|
| API | Cards, pages, sidebar | Any callable AI service |
| LIVEPEER (green badge) | Cards | Runs directly on the network |
| by [Provider] (gray badge) | Cards | Third-party managed service |
| Explore | Sidebar, page title | Browse the catalog |
| Run | Playground button | Execute an API call |
| Connect | Settings page | Link account to a provider via OAuth |
| Provider | Registration flow | Company/dev who listed an API |

**Terms we DON'T use in UI:** ~~Capability~~, ~~Solution~~, ~~Pipeline~~, ~~Orchestrator~~, ~~Model~~, ~~Marketplace~~

---

## Pages — Detailed Wireframes

### Page 1: Explore (`/studio` and `/studio/explore`) — NO ACCOUNT REQUIRED

The homepage. The Replicate browse page. Public, no login wall.

```
┌─────────────────────────────────────────────────────────────────┐
│  LIVEPEER STUDIO                          [Sign in] [Get started]│
│                                                                   │
│  Build with AI APIs on the open network                          │
│  One API key. Hundreds of AI capabilities. Try free.             │
│                                                                   │
│  🔍 [Search APIs...]                                             │
│  [All] [Video] [Image] [Text] [Audio]          ← use-case tabs  │
│                                                                   │
│  ── Featured ─────────────────────────────────────────────────── │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐    │
│  │ Live Video │ │ Text to    │ │ Daydream   │ │ Blueclaw   │    │
│  │ to Video   │ │ Image      │ │ Real-Time  │ │ LLM        │    │
│  │            │ │            │ │ Video AI   │ │ Inference  │    │
│  │ LIVEPEER   │ │ LIVEPEER   │ │ by Daydream│ │ by Blueclaw│    │
│  │ $0.02/min  │ │ $0.005/req │ │ $0.05/min  │ │ Free beta  │    │
│  │ ⚡ 200ms   │ │ ⚡ 2s      │ │ ⚡ 150ms   │ │ ⚡ 80ms    │    │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘    │
│                                                                   │
│  ── Popular ──────────────────────────────────────────────────── │
│  (cards sorted by usage...)                                       │
│                                                                   │
│  ── Recently Added ───────────────────────────────────────────── │
│  (newest cards...)                                                │
└─────────────────────────────────────────────────────────────────┘
```

**Content:** Hero text + search, use-case tabs, Featured (curated), Popular (by usage), Recently Added.
**Card fields:** name, one-line description, provider badge, pricing, latency.

### Page 2: API Detail + Playground (`/studio/explore/[slug]`) — NO ACCOUNT for subsidized APIs

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Back to Explore                                               │
│                                                                   │
│  Text to Image                                    LIVEPEER       │
│  Generate images from text prompts using Stable Diffusion        │
│                                                                   │
│  Pricing: $0.005/req  │  Latency: ~2s  │  47 orchestrators      │
│                                                                   │
│  ┌─ Playground ─────────────────────────────────────────────┐    │
│  │  Prompt: [a cat wearing a top hat, oil painting style ]  │    │
│  │  Model:  [stable-diffusion-xl ▾]                         │    │
│  │  Size:   [1024x1024 ▾]                                   │    │
│  │                                                           │    │
│  │  [▶ Run]  ← works without account (10 free runs)         │    │
│  │                                                           │    │
│  │  ┌─────────────────────────────────┐                     │    │
│  │  │     (result appears here)       │                     │    │
│  │  └─────────────────────────────────┘                     │    │
│  │                                                           │    │
│  │  ⓘ Free trial: 10 runs without an account.               │    │
│  │    Sign up for unlimited access.                          │    │
│  └───────────────────────────────────────────────────────────┘    │
│                                                                   │
│  ┌─ Quick Start ────────────────────────────────────────────┐    │
│  │  [Python] [curl] [JavaScript]                             │    │
│  │  curl -X POST studio.livepeer.org/v1/run/text-to-image \ │    │
│  │    -H "Authorization: Bearer YOUR_KEY" \                  │    │
│  │    -d '{"prompt": "a cat wearing a top hat"}'             │    │
│  └───────────────────────────────────────────────────────────┘    │
│                                                                   │
│  ┌─ About ──────────────────────────────────────────────────┐    │
│  │  Runs on the Livepeer decentralized network.              │    │
│  │  [View on Explorer →]                                     │    │
│  └───────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

**Playground is auto-generated** from endpoint params schema: string→input, enum→dropdown, number→slider, file→upload. Response renderer adapts: image, video player, text, JSON.

**For third-party APIs**, the detail page shows the same structure but:
- Provider attribution: "Provided by Daydream" with link to provider
- "Run" button says "Sign in to try" (unless provider offers free tier)
- Quick start shows both: "Using provider's API directly" and "Through Studio (unified billing)"
- "Connect" option in addition to "Use via Studio"

### Page 3: Dashboard (`/studio/dashboard`) — REQUIRES ACCOUNT

The logged-in home. Overview of your activity.

```
┌──────────────────────────────────────────────────────────────┐
│  ◀ SIDEBAR          │  Dashboard                              │
│                      │                                         │
│  Dashboard      ●    │  ┌─────────┐ ┌─────────┐ ┌─────────┐ │
│  Explore             │  │API Calls│ │ Active  │ │ Credits │ │
│  API Keys            │  │ 1,247   │ │ Keys: 3 │ │ $42.50  │ │
│  Usage & Billing     │  │this week│ │         │ │remaining│ │
│  Settings            │  └─────────┘ └─────────┘ └─────────┘ │
│                      │                                         │
│  ─── Provider ───    │  ── Recent Activity ────────────────── │
│  My APIs             │  │ Time  │ API         │ Status│ Cost│ │
│  (if provider)       │  │ 2m ago│ text-to-img │ 200   │$0.01│ │
│                      │  │ 5m ago│ daydream    │ 200   │$0.05│ │
│                      │                                         │
│                      │  ── Quick Actions ──────────────────── │
│                      │  [Create API Key]  [Explore APIs]      │
│                      │  [Add Credits]     [View Docs]         │
└──────────────────────────────────────────────────────────────┘
```

**Content:** Stat cards (API calls, active keys, credits), recent activity table, quick actions.

### Page 4: API Keys (`/studio/keys`) — REQUIRES ACCOUNT

```
┌──────────────────────────────────────────────────────────────┐
│  API Keys                                   [+ Create Key]   │
│                                                               │
│  Your API key works for all APIs on Studio.                  │
│                                                               │
│  │ Name       │ Key             │ Status │ Last Used     │   │
│  │ production │ lp_studio_a1b...│ Active │ 2 min ago     │   │
│  │ dev        │ lp_studio_c3d...│ Active │ 1 hour ago    │   │
│  │ old-key    │ lp_studio_e5f...│ Revoked│ 3 days ago    │   │
│                                                               │
│  Click a key for details and actions.                        │
└──────────────────────────────────────────────────────────────┘
```

**Create flow (2-step modal from NAAP):** Enter name → raw key shown with copy + warning → key in table.
**Actions (side panel on click):** Rename, rotate, revoke (with confirm), per-key usage breakdown.

### Page 5: Usage & Billing (`/studio/usage`) — REQUIRES ACCOUNT

```
┌──────────────────────────────────────────────────────────────┐
│  Usage & Billing                                              │
│                                                               │
│  Credits: $42.50 remaining              [Add Credits]         │
│  [7d] [30d] [90d]         Key: [All keys ▾]                 │
│                                                               │
│  ┌─ API Calls ──────────────────────────────────────────┐    │
│  │  (area chart over time)                               │    │
│  └───────────────────────────────────────────────────────┘    │
│  ┌─ Cost ───────────────────────────────────────────────┐    │
│  │  (area chart over time)                               │    │
│  └───────────────────────────────────────────────────────┘    │
│                                                               │
│  ── By API ───────────────────────────────────────────────── │
│  │ API           │ Calls │ Cost  │ Avg Latency │             │
│  │ text-to-image │ 847   │ $4.24 │ 2.1s        │             │
│  │ daydream      │ 312   │ $15.60│ 0.15s       │             │
│                                                               │
│  ── Billing History ──────────────────────────────────────── │
│  │ Date    │ Amount │ Status │                                │
│  │ Mar 15  │ $50.00 │ Paid   │                                │
└──────────────────────────────────────────────────────────────┘
```

**Content:** Credit balance, date range, per-key filter, charts (calls + cost), per-API breakdown, billing history.

### Page 6: Settings (`/studio/settings`) — REQUIRES ACCOUNT

```
┌──────────────────────────────────────────────────────────────┐
│  Settings                                                     │
│                                                               │
│  ── Profile ──────────────────────────────────────────────── │
│  Name:  [editable]   Email: [from Clerk, read-only]          │
│                                                               │
│  ── Connected APIs ───────────────────────────────────────── │
│  Pipelines   ✅ Connected   [Disconnect]                      │
│  Daydream    ⚪ Not connected [Connect →]                      │
│                                                               │
│  ── Payment Methods ──────────────────────────────────────── │
│  Visa ending 4242    [Remove]                                 │
│  [+ Add payment method]                                       │
│                                                               │
│  ── Danger Zone ──────────────────────────────────────────── │
│  [Delete Account]                                             │
└──────────────────────────────────────────────────────────────┘
```

**Content:** Profile, OAuth connections (connect/disconnect per provider), payment methods (Stripe), account deletion.

Billing is NOT a separate page. Credits + charts live on Usage. Payment methods live in Settings.

### Page 7: Provider Dashboard (`/studio/provider`) — FOR PROVIDERS ONLY

```
┌──────────────────────────────────────────────────────────────┐
│  Provider Dashboard                                           │
│                                                               │
│  ── My APIs ──────────────────────────────────────────────── │
│  │ Name         │ Status   │ Calls (7d)│ Revenue │            │
│  │ Ghibli Video │ Published│ 1,247     │ $62.35  │            │
│  │ Style Xfer   │ Draft    │ —         │ —       │            │
│  [+ Register New API]                                         │
│                                                               │
│  ── Traffic ──────────────────────────────────────────────── │
│  (area chart)                                                 │
│                                                               │
│  ── Integration ──────────────────────────────────────────── │
│  HMAC verification: ✅ Passing                                │
│  Last health check: 200 OK (143ms)                            │
│  [Rotate shared secret]  [View docs]                          │
└──────────────────────────────────────────────────────────────┘
```

### What does NOT get its own page

- **Docs** — Link to docs.livepeer.org. Don't build a docs viewer.
- **Streams/Assets/Webhooks** — Old Studio concepts. This product is about AI APIs.
- **Teams** — Not v1. Individual accounts only.

---

## Try Without Account — The Growth Funnel

```
1. Developer lands on /studio (from website CTA, Google, Twitter)
2. Browses APIs — no login wall
3. Clicks "Text to Image" → playground
4. Types prompt, clicks "Run"
5. Gets result — no account needed
6. Tries 9 more times
7. "You've used 10 free runs. Sign up to continue (free)."
8. Signs up via Clerk (Google/GitHub, 2 clicks)
9. Creates API key → integrates into their app
```

**What's subsidized (free, no account):**
- Selected LIVEPEER-badged APIs only (Livepeer subsidizes compute cost)
- 10 runs per IP/fingerprint
- Rate limited: 1 request per 10 seconds
- Only "safe" endpoints (no long-running jobs, no streaming)

**What requires an account:**
- Third-party APIs (provider needs to know who for billing)
- Network APIs after free tier
- Creating API keys, viewing usage, all dashboard features

**Implementation:**
```
Guest hits "Run" on subsidized API:
  → Check: is endpoint marked subsidized?
  → Yes: check IP+fingerprint in guest_usage table
  → Under 10 runs? Execute via Gateway with Studio's service key
  → Over 10? Return "Sign up to continue" prompt
  → Log as anonymous (analytics only, no billing)
```

---

## Sidebar Navigation

**Not logged in (Explore pages only):**
```
LIVEPEER STUDIO
─────────────
Explore              ← /studio/explore
─────────────
[Sign in]
[Get started]
```

**Logged in (full dashboard):**
```
LIVEPEER STUDIO
─────────────
Dashboard            ← /studio/dashboard
Explore              ← /studio/explore
API Keys             ← /studio/keys
Usage & Billing      ← /studio/usage
Settings             ← /studio/settings
─────────────
── Provider ──       ← only if user has registered APIs
My APIs              ← /studio/provider
```

---

---
---

# PART 2: EXECUTION PLAN

## Architecture

```
livepeer-studio/               ← NEW repo
  apps/
    studio/                    ← Next.js 15, App Router
  packages/
    ui/                        ← 18 components extracted from NAAP
    theme/                     ← Design tokens extracted from NAAP
```

**Backend strategy — no separate backend service:**
```
Network APIs:      Studio API route → Go Gateway HTTP API → Livepeer orchestrators
Third-party APIs:  Studio API route → OAuth token forwarding → Provider's API
```

All API routes are Next.js API routes inside the Studio app. No separate Express/FastAPI service needed for v1.

**OAuth from day one for third-party providers.** No HMAC bootstrapping phase. Building two auth systems (HMAC now, OAuth later) is more work than building one (OAuth). It's 2026 — OAuth libraries exist for every language. Providers who want to be listed implement OAuth. This gives us revocable, scoped tokens from the start.

## What to Extract from NAAP

**Important: We do NOT copy NAAP's styling or components verbatim.** NAAP uses a dark glass-card aesthetic with Inter/JetBrains Mono. The website (`livepeer/website`) uses Favorit Pro/Mono fonts, Tailwind v4, and its own design language. Studio must match the website's look and feel, not NAAP's.

**What we take from NAAP as functional patterns (logic, not styling):**
- DataTable: pagination logic, sorting, column config, row click — rebuild with website styling
- Modal: keyboard escape, backdrop click, portal rendering, scroll lock — rebuild styled
- CreateKeyModal: 2-step flow pattern (name input → raw key display with copy + warning)
- ApiKeyTable: column definitions, status badge mapping, action patterns
- UsageCharts: Recharts area chart config, date range filtering logic, data aggregation
- KeyDetailPanel: side panel pattern with usage drill-down
- ModelsTab: search + filter + card grid pattern
- Auth context: login/logout flow structure, token management, session validation

**What we take from NAAP as utilities (copy as-is, no styling):**
- `api/response.ts` — standardized success/error response helpers
- `rateLimit.ts` — in-memory rate limiters
- `api/csrf.ts` — HMAC-SHA256 CSRF tokens

**What we build fresh, matching website design:**
- All UI components (buttons, cards, inputs, badges, tables, modals)
- Layout shell (sidebar, topbar, content area)
- Theme tokens — inherit from website's Tailwind config + Favorit fonts
- Color palette, spacing, typography — all from website

### Layout Shell (adapt pattern, restyle)
Pattern from: `rickstaa/naap/apps/web-next/src/components/layout/`
- `app-layout.tsx` — sidebar + content grid pattern
- `sidebar.tsx` — collapsible nav pattern (strip plugin system)
- `top-bar.tsx` — page title pattern
All rebuilt with website's design language.

---

## Day-by-Day Commit Plan

### Day 1: Scaffold + UI extraction

**Commit 1: Init Next.js 15 app**
```bash
npx create-next-app@latest studio --app --tailwind --typescript --eslint
```
- Delete boilerplate
- Verify: `pnpm dev` works, blank page renders

**Commit 2: Set up design system matching website**
- Pull typography (Favorit Pro/Mono), color palette, and spacing from livepeer/website
- Set up Tailwind v4 config inheriting website's design tokens
- Add globals.css with font imports, base styles
- Verify: fonts load, base styling matches website

**Commit 3: Build core UI components (website-styled)**
- Build from scratch, matching website's design language:
  - Button (primary/secondary/ghost/destructive, 3 sizes, loading)
  - Card, Badge, Input/Textarea/Select
  - Modal (keyboard escape, backdrop, portal)
  - DataTable (sorting, pagination — use NAAP's logic as reference)
- Reference NAAP's component logic for functionality, but style to match website
- Verify: components render correctly

**Commit 4: Add layout shell**
- Build app-layout, sidebar, top-bar — styled to match website
- Sidebar nav: Dashboard, Explore, API Keys, Usage & Billing, Settings
- Wire into `app/(dashboard)/layout.tsx`
- Verify: layout renders, sidebar collapses

### Day 2: Auth + public Explore page

**Commit 5: Add Clerk auth**
- Install `@clerk/nextjs`
- Create auth context wrapping Clerk
- Provide: user, isAuthenticated, isLoading
- Verify: Clerk provider renders

**Commit 6: Add Explore page (public, no auth required)**
- Create `app/explore/page.tsx` — the public homepage
- Create `app/explore/layout.tsx` — minimal layout (no sidebar, just topbar + content)
- Card grid with search + use-case filter tabs
- Mock data for now (6-8 sample APIs)
- This page is OUTSIDE the `(dashboard)` route group — no auth needed
- Verify: page loads at `/explore`, no login required

**Commit 7: Add API detail + playground page (public)**
- Create `app/explore/[slug]/page.tsx`
- Auto-generated playground form from params schema
- "Run" button for subsidized APIs (mock result for now)
- Quick start code snippets
- Verify: click card → detail → playground form renders

### Day 3: Dashboard + protected routes

**Commit 8: Add login page + protected route middleware**
- Create `app/login/page.tsx` — Clerk sign-in component
- Create `middleware.ts` — protect `/dashboard/*`, `/keys/*`, `/usage/*`, `/settings/*`
- `/explore` and `/explore/*` remain public
- Verify: can't access dashboard without login, explore works without login

**Commit 9: Add Dashboard page**
- Create `app/(dashboard)/dashboard/page.tsx`
- Stat cards: API calls, active keys, credits
- Recent activity table (DataTable, mock data for now)
- Quick action buttons
- Verify: renders after login

**Commit 10: Wire Explore to real API data**
- Create `app/api/v1/apis/route.ts` — returns list of APIs (seed from DB or JSON file)
- Explore page fetches from this endpoint
- Detail page fetches single API
- Verify: cards show real data from API endpoint

### Day 4: API Keys

**Commit 11: Add API Keys list page**
- Create `app/(dashboard)/keys/page.tsx`
- Copy NAAP's ApiKeyTable → `components/keys/key-table.tsx`
- DataTable: name, key prefix, status badge, created, last used
- Empty state when no keys
- Verify: page loads, shows keys or empty state

**Commit 12: Add create API key flow**
- Copy NAAP's CreateKeyModal → `components/keys/create-key-modal.tsx`
- 2-step flow: name → raw key + copy + "store securely" warning
- POST to `/api/v1/keys` to create
- Verify: create key, see in list, copy works

**Commit 13: Add key actions**
- Copy NAAP's KeyDetailPanel → side panel
- Actions: rename, rotate, revoke (ConfirmDialog)
- Verify: each action works, table updates

### Day 5: Usage + Gateway wiring

**Commit 14: Add Usage & Billing page**
- Create `app/(dashboard)/usage/page.tsx`
- Copy NAAP's UsageCharts → `components/usage/usage-charts.tsx`
- Credit balance display, date range selector, per-key filter
- Area charts: API calls, cost over time
- Per-API breakdown table
- Verify: charts render, filters work

**Commit 15: Wire playground to Go Gateway**
- Create `app/api/v1/run/[api]/[...path]/route.ts` — the unified proxy
- For network APIs: forward to Go Gateway with Studio service key
- For guest users on subsidized APIs: check IP limit, execute if under 10
- Verify: playground "Run" button actually calls the network and returns a result

### Day 6: Third-party provider support (OAuth)

**Commit 16: Add OAuth Connect flow**
- Create `app/api/v1/connect/[provider]/start/route.ts` — generate state + PKCE, redirect
- Create `app/api/v1/connect/[provider]/callback/route.ts` — exchange code, store tokens
- Extend `app/api/v1/run/[api]/[...path]/route.ts` — if third-party API, load OAuth token, forward
- Token refresh if expired
- Verify: OAuth flow works end-to-end, request proxied with token

**Commit 17: Add provider registration flow**
- Create `app/(dashboard)/provider/page.tsx` — provider dashboard
- Create `app/(dashboard)/provider/register/page.tsx` — registration wizard
- Steps: name + URL → OAuth config (authorize/token endpoints, client_id, scopes) → define endpoints (or upload OpenAPI spec) → configure listing
- Verify: full registration works, API appears in catalog

### Day 7: Settings + Polish + Deploy

**Commit 18: Add Settings page**
- Create `app/(dashboard)/settings/page.tsx`
- Profile section (name, email from Clerk)
- Connected APIs section (OAuth connections, connect/disconnect)
- Payment methods placeholder
- Verify: settings render, profile editable

**Commit 19: Polish + end-to-end test**
- Loading states, error states, empty states on all pages
- Mobile responsive pass on sidebar
- Test full flow: land on explore → try API as guest → sign up → create key → run API → check usage

**Commit 20: Deploy**
- Configure Vercel project
- Set env vars: GATEWAY_URL, CLERK_SECRET_KEY, DATABASE_URL
- Add rewrite to livepeer/website: `/studio/:path*` → Studio
- Verify: studio.livepeer.org works

---

## Verification Checklist

After each day:
- [ ] `pnpm dev` starts without errors
- [ ] All pages render without console errors
- [ ] Navigation works
- [ ] No NAAP-specific imports remain (no `@naap/*`)

End-to-end (Day 7):
- [ ] Visit `/explore` without account — browse works
- [ ] Click API card → detail page with playground
- [ ] Run subsidized API without account — get result
- [ ] After 10 runs, prompted to sign up
- [ ] Sign up via Clerk (Google/GitHub)
- [ ] Create API key
- [ ] Run API with key from code snippet
- [ ] Check usage page — see the API call logged
- [ ] Provider registers new API — appears in catalog

---

## Post-Launch Roadmap

**Week 2: Provider ecosystem**
- Provider registration fully live
- HMAC integration docs published
- Seed 3-5 providers (Daydream, Blueclaw, Pipelines)

**Week 3-4: Billing**
- Stripe Checkout for credits
- Usage metering per API call
- Free tier: $5 in credits for new signups

**Month 2: OAuth Connect + Stripe Connect**
- OAuth flow for providers who support it
- Stripe Connect for automatic provider payouts
- Studio takes 10% platform fee

**Month 3+: Scale**
- Evaluate Python SDK for multi-user orchestrator selection
- Provider analytics dashboard
- Team/org accounts

---

## Commit Rules (Anti-Slop)

1. **One concern per commit** — "Add API keys page" not "Add API keys, usage, and settings"
2. **Each commit must build and run** — `pnpm dev` works
3. **No placeholder code** — No empty files, TODO components, stub functions
4. **Copy from NAAP then simplify** — Don't rewrite from scratch
5. **Read every line you copy** — Remove NAAP-specific imports, plugin refs, tenant isolation
6. **No abstractions until third use** — Inline `fetch()` before creating `useGatewayClient`
7. **Manual UI test after each commit** — Click every state: empty, loading, data, error
8. **When working with AI:** Tell it "Copy X from NAAP, strip plugin system, make it work standalone. One file at a time."

---

## Repo Structure

```
livepeer-studio/
├── apps/studio/
│   ├── src/
│   │   ├── app/
│   │   │   ├── explore/                          # PUBLIC (no auth)
│   │   │   │   ├── page.tsx                      # Browse catalog
│   │   │   │   ├── [slug]/page.tsx               # API detail + playground
│   │   │   │   └── layout.tsx                    # Minimal layout (no sidebar)
│   │   │   ├── (dashboard)/                      # PROTECTED (requires auth)
│   │   │   │   ├── dashboard/page.tsx            # Overview
│   │   │   │   ├── keys/page.tsx                 # API key management
│   │   │   │   ├── usage/page.tsx                # Usage & billing
│   │   │   │   ├── settings/page.tsx             # Profile, connections, payment
│   │   │   │   ├── provider/                     # Provider dashboard + registration
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── register/page.tsx
│   │   │   │   └── layout.tsx                    # Full layout (sidebar)
│   │   │   ├── login/page.tsx                    # Clerk sign-in
│   │   │   ├── api/v1/
│   │   │   │   ├── apis/route.ts                 # List APIs (public)
│   │   │   │   ├── run/[api]/[...path]/route.ts  # Unified proxy (gateway + HMAC)
│   │   │   │   ├── keys/route.ts                 # CRUD API keys
│   │   │   │   ├── usage/route.ts                # Usage data
│   │   │   │   ├── admin/apis/route.ts           # Provider registration
│   │   │   │   └── connect/[provider]/
│   │   │   │       ├── start/route.ts            # OAuth start
│   │   │   │       └── callback/route.ts         # OAuth callback
│   │   │   ├── layout.tsx                        # Root layout
│   │   │   └── middleware.ts                     # Auth protection
│   │   ├── components/
│   │   │   ├── layout/{app-layout,sidebar,top-bar}.tsx
│   │   │   ├── explore/{api-card,api-detail,playground-form}.tsx
│   │   │   ├── keys/{key-table,create-key-modal,key-detail-panel}.tsx
│   │   │   ├── usage/usage-charts.tsx
│   │   │   └── provider/{register-form,provider-dashboard}.tsx
│   │   ├── contexts/auth-context.tsx
│   │   └── lib/
│   │       ├── api/{response,gateway,csrf}.ts
│   │       ├── auth/{hmac,oauth}.ts
│   │       ├── encryption.ts
│   │       └── rateLimit.ts
│   ├── next.config.js
│   ├── tailwind.config.ts
│   └── package.json
├── packages/
│   ├── ui/src/                                   # Components built fresh, website-styled
│   └── theme/src/                                # Design tokens from website
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

Key structural decision: `/explore` is OUTSIDE the `(dashboard)` route group. It has its own minimal layout (no sidebar). This is what makes the "try without account" flow work — the explore pages never hit the auth middleware.

---
---

# PART 3: TECHNICAL APPENDICES

All architectural decisions, technical details, and context from our design discussions.

---

## Appendix 1: Why Studio is a Separate Repo (Not in NAAP)

NAAP (`rickstaa/naap`) is a Livepeer network monitor built on a plugin architecture. It includes:
- Plugin system with EventBus, dynamic connector registration, tenant isolation
- ShellContext providing IAuthService, IEventBus, INotificationService, ILoggerService, IThemeService, IPermissionService, IIntegrationService, ITenantService, ITeamContext, ICapabilityService, IApiClient
- PluginContext that loads plugin manifests from `/api/v1/base/plugins/personalized`
- Ably realtime with fallback polling for live updates
- useDashboardQuery hook (GraphQL queries via EventBus to plugins)
- Full service gateway with 26 connectors (Stripe, OpenAI, Replicate, etc.)
- Middleware plugin routing for custom paths

Studio is a developer portal. Different product, different audience, different release cadence. NAAP's plugin architecture would add complexity Studio doesn't need.

**What we take from NAAP:**
- UI components (18 components, ~1,700 lines) — pure React+Tailwind, no @naap imports
- Theme tokens (~240 lines) — colors, typography, spacing, motion
- Developer-web workflow app (~2,000 lines) — proto-Studio reference with API keys, usage charts, model catalog
- Auth patterns from auth-context.tsx (~434 lines) — login/logout, token management, CSRF
- API utilities — response helpers, rate limiting, CSRF tokens
- Layout shell — sidebar, topbar, content area patterns

**What we skip:**
- Plugin system (PluginContext, plugin loading, plugin-sdk)
- ShellContext EventBus (over-engineered for a single app)
- useDashboardQuery (GraphQL-over-EventBus — Studio uses REST)
- Ably realtime (nice-to-have later, not needed at launch)
- Middleware plugin routing (NAAP-specific route rewriting)
- Network monitor types (Gateway, Orchestrator, Ticket, Job, etc.)

**Key NAAP file paths for extraction:**
```
packages/ui/src/                              # All 18 UI components
packages/theme/src/                           # Design tokens + CSS
packages/types/src/index.ts                   # Type definitions (take developer subset)
packages/utils/src/index.ts                   # Shared utilities
apps/workflows/developer-web/src/             # Proto-Studio reference app
  pages/DeveloperView.tsx                     # Main tab interface
  components/tabs/APIKeysTab.tsx              # API key management
  components/api-keys/CreateKeyModal.tsx       # Key creation 2-step flow
  components/api-keys/ApiKeyTable.tsx          # Key list table
  components/api-keys/KeyDetailPanel.tsx       # Key detail side panel
  components/tabs/UsageBillingTab.tsx          # Usage & billing
  components/usage/UsageCharts.tsx             # Recharts area charts
  components/tabs/ModelsTab.tsx                # Model catalog (rename to APIs)
  components/ModelCard.tsx                     # Model card component
  components/ModelDetailPanel.tsx              # Model detail panel
  components/CompareDrawer.tsx                 # Side-by-side comparison
apps/web-next/src/components/layout/          # Layout shell
  app-layout.tsx                              # Main layout grid
  sidebar.tsx                                 # Collapsible sidebar
  top-bar.tsx                                 # Top bar
apps/web-next/src/contexts/auth-context.tsx   # Auth context (~434 lines)
apps/web-next/src/lib/api/response.ts         # API response helpers
apps/web-next/src/lib/rateLimit.ts            # Rate limiting
apps/web-next/src/lib/api/csrf.ts             # CSRF tokens
```

---

## Appendix 2: Why Studio is Not in livepeer/website

`livepeer/website` is a standalone Next.js 15 marketing site:
- React 19, Tailwind CSS v4, Framer Motion 11
- Custom typography: Favorit Pro & Favorit Mono (Dinamo Typefaces)
- Not a monorepo — single focused application
- Content: landing pages, blog, brand guidelines, use cases

Converting it into a monorepo would add complexity for no benefit. Studio has different dependencies (Clerk, Recharts, Prisma/database), different deployment concerns, different release cadence.

**Connection strategy:** Vercel rewrites in website's `next.config.js`:
```js
async rewrites() {
  return [
    { source: '/studio/:path*', destination: 'https://studio.livepeer.org/:path*' },
    { source: '/explorer/:path*', destination: 'https://explorer.livepeer.org/:path*' },
  ]
}
```

One domain (`livepeer.org`), three independent apps, three independent deployments.

Website adds CTAs linking to Studio: "Start Building" / "Try AI APIs" buttons in the hero, nav bar "Studio" link.

---

## Appendix 3: Two Types of APIs (Unified in UI)

### The internal distinction

**Network APIs** = raw pipelines on Livepeer orchestrators (text-to-image, image-to-video, LV2V, LLM inference). No intermediary. User's request goes through Studio → Gateway → orchestrators. Pricing is network compute rate.

**Third-party APIs** = services built on top of Livepeer by independent providers. Examples:
- **Daydream** (daydream.live): Real-time AI video transformation via WebRTC. Runs their own Scope API server, manages model selection, presets, WebRTC streaming. Routes jobs to Livepeer network + cloud compute. Their own auth.
- **Blueclaw** (blueclaw.network): OpenAI-compatible inference API. Runs LLM, diffusion, and generative models. Subscription pricing ($10-15/mo), unlimited rate limits. Their own routing layer.
- **livepeer/pipelines**: API for running AI pipelines. Fastify backend with Clerk JWT + API key auth. Runs on Livepeer network.

Key differences: third-party services run their own production infrastructure (routing, cloud fallback, SLAs, support), have their own auth systems, abstract away network details, often add value (presets, model curation, managed streaming).

### The UI decision

**Developers don't care** whether their text-to-image call goes through Daydream's managed service or raw to an orchestrator. They care: "what can I build, how do I call it, what does it cost."

So we DON'T split "Capabilities" vs "Solutions" in the UI. Everything is an "API." The only distinction is a provider badge: `LIVEPEER` (green) for network APIs, `by Daydream` (gray) for third-party.

This is exactly how Replicate does it: "Official" badge for maintained models, creator attribution for community. Same card, same browse.

### DB schema (unified `apis` table)

```sql
CREATE TABLE apis (
  id              UUID PRIMARY KEY,
  name            TEXT NOT NULL,
  slug            TEXT UNIQUE NOT NULL,
  description     TEXT,
  provider_type   TEXT NOT NULL,           -- 'network' | 'third_party'
  provider_name   TEXT NOT NULL,           -- 'Livepeer' | 'Daydream' | 'Blueclaw'
  provider_url    TEXT,                    -- null for network APIs
  upstream_url    TEXT,                    -- null for network (uses gateway), URL for third-party
  shared_secret   TEXT,                    -- null for network, generated for third-party (HMAC)
  auth_type       TEXT DEFAULT 'studio',   -- 'studio' (network) | 'hmac' | 'oauth'
  oauth_config    JSONB,
  category        TEXT NOT NULL,           -- 'video' | 'image' | 'text' | 'audio'
  tags            TEXT[],                  -- ['real-time', 'generative', 'streaming']
  pricing_model   JSONB,                  -- { type: 'per_minute'|'per_request'|'subscription', amount: 0.05 }
  latency_p50_ms  INT,
  featured        BOOLEAN DEFAULT FALSE,
  status          TEXT DEFAULT 'draft',
  owner_user_id   TEXT,                    -- null for network APIs (owned by Livepeer)
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE api_endpoints (
  id              UUID PRIMARY KEY,
  api_id          UUID REFERENCES apis(id),
  method          TEXT NOT NULL,
  path            TEXT NOT NULL,
  description     TEXT,
  params          JSONB,                   -- input schema for auto-generated playground
  response_type   TEXT,                    -- 'image' | 'video' | 'text' | 'json' | 'stream'
  pricing         JSONB,                   -- per-endpoint pricing override
  rate_limit      INT                      -- requests per minute
);
```

Network APIs are pre-seeded rows with `provider_type = 'network'`. Third-party APIs are registered by providers via the registration flow.

### Auto-generated playground from endpoint params

When a provider registers endpoints with a params schema:
```json
{
  "method": "POST",
  "path": "/generate",
  "params": [
    { "name": "prompt", "type": "string", "required": true },
    { "name": "model", "type": "enum", "values": ["sd-turbo", "sdxl"], "default": "sd-turbo" },
    { "name": "num_frames", "type": "number", "min": 1, "max": 120, "default": 30 }
  ],
  "response_type": "video"
}
```

Studio auto-generates the playground form:
- String → text input
- Enum → dropdown
- Number → slider or number input
- File → upload button
- Boolean → toggle
- Response type → renderer (image viewer, video player, text block, JSON tree)

Provider writes zero frontend code. This is how Replicate's playground works — auto-generated from the model's input schema.

---

## Appendix 4: Auth Architecture

Studio has TWO auth layers:

### Layer 1: Marketplace login (who is this user?)

Use **Clerk** as the identity provider:
- Login methods: Google, GitHub, email magic link (configurable in Clerk dashboard)
- Clerk issues a JWT per session
- This is Studio's own auth — has nothing to do with providers

### Layer 2: Provider connections (can we call this provider's API as this user?)

Per-provider auth mechanism. Three modes depending on the provider:

```
USER
  ├── Login to Studio (Clerk) ──── Layer 1: "Who are you?"
  │
  ├── Use Network APIs ─────────── Studio API key → Gateway (Studio IS the provider)
  ├── Use Third-party (HMAC) ───── Studio signs request, provider verifies
  └── Use Third-party (OAuth) ──── User connects account, Studio forwards OAuth token
```

### Network APIs auth (Livepeer network)

Studio IS the auth layer. No third-party auth needed.

```
User → Studio API key → Studio backend → Go Gateway → Orchestrators
```

- User creates a Studio API key in the dashboard
- Studio backend validates the key (SHA-256 hash lookup)
- Studio backend calls Go Gateway with its own service credential
- Usage metered per user in Studio's DB

Key format: `lp_studio_[32-hex]`
Storage: SHA-256 hash in DB, raw key shown once at creation

### Third-party auth — Phase 1: HMAC Proxy (ships fast, week 2)

For providers who don't have OAuth yet (most indie developers).

**Provider onboarding:**
1. Provider registers on Studio → gets `shared_secret`
2. Provider adds HMAC verification to their API (~10 lines)
3. Done — their API is on the marketplace

**Request flow:**
```
User (logged into Studio via Clerk)
  → POST /api/v1/run/ghibli-video/generate { body }
  → Studio backend:
      1. Verify user's Clerk session
      2. Look up provider's shared_secret from DB
      3. Compute: signature = HMAC-SHA256(shared_secret, timestamp + body)
      4. Forward to provider:
           POST https://ghibli-api.dev/generate
           X-Studio-Signature: <signature>
           X-Studio-Timestamp: <timestamp>
           X-Studio-User-Id: <clerk_user_id>
           X-Studio-Plan: <user_plan>
           Body: <original body>
      5. Provider verifies HMAC, serves request
      6. Studio logs usage for billing
```

**Provider-side verification (~10 lines):**
```python
import hmac, hashlib, time

def verify_studio_request(request, shared_secret):
    signature = request.headers["X-Studio-Signature"]
    timestamp = request.headers["X-Studio-Timestamp"]

    # Reject if older than 5 minutes (replay protection)
    if abs(time.time() - int(timestamp)) > 300:
        return False

    payload = f"{timestamp}.{request.body}".encode()
    expected = hmac.new(
        shared_secret.encode(), payload, hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(signature, expected)
```

### Third-party auth — Phase 2: OAuth Connect (week 3-4, for mature providers)

For providers like `livepeer/pipelines` that already have auth and can add OAuth.

**What providers implement:**
```
Required:
  POST /oauth/authorize  — authorization endpoint
  POST /oauth/token      — token exchange endpoint
Optional:
  POST /oauth/revoke     — token revocation
  GET  /oauth/userinfo   — user info endpoint
```

**What Studio implements (provider-agnostic):**
```
GET  /connect/:providerId/start    — generate state + PKCE, redirect to provider
GET  /connect/:providerId/callback — exchange code for tokens, store encrypted
POST /connect/:providerId/disconnect — revoke + delete tokens
```

**OAuth Connect flow:**
```
1. User clicks "Connect Pipelines" in Studio
2. Studio redirects to:
     https://pipelines.livepeer.org/oauth/authorize?
       client_id=studio-marketplace&
       redirect_uri=https://studio.livepeer.org/connect/pipelines/callback&
       scope=run-jobs+read-usage&
       state=<csrf_state>&
       code_challenge=<pkce_challenge>&
       code_challenge_method=S256
3. User sees consent screen: "Allow Livepeer Studio to run jobs?"
4. User approves → redirected back with code
5. Studio exchanges code for tokens (POST /oauth/token)
6. Studio stores encrypted access_token + refresh_token
7. User can now "Try it" — Studio proxies with OAuth token
```

**DB schema for connections:**
```sql
CREATE TABLE provider_connections (
  id                    UUID PRIMARY KEY,
  marketplace_user_id   TEXT NOT NULL,       -- Clerk user ID
  provider_id           UUID REFERENCES apis(id),
  provider_user_id      TEXT,                -- user ID from provider's system
  access_token_enc      TEXT NOT NULL,       -- AES-256-GCM encrypted
  refresh_token_enc     TEXT,                -- AES-256-GCM encrypted
  token_expires_at      TIMESTAMPTZ,
  scopes                TEXT[],
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  revoked_at            TIMESTAMPTZ,
  UNIQUE(marketplace_user_id, provider_id)
);
```

**Security: OAuth tokens vs stored API keys:**

| Property | Raw API Keys | OAuth Tokens |
|----------|-------------|--------------|
| Revocable by user | No (must ask provider) | Yes (disconnect in Studio or provider) |
| Revocable by provider | Must rotate all keys | Revoke specific token |
| Scoped | No (full access) | Yes (e.g., run-jobs only) |
| Expires | No | Yes (refresh token rotation) |
| If Studio breached | All keys compromised forever | Tokens revocable, provider can mass-revoke |

---

## Appendix 5: livepeer/pipelines Integration (Clerk Shortcut)

`livepeer/pipelines` already uses Clerk for auth (`apps/api/src/plugins/auth.ts`):
1. Extract Bearer token from Authorization header
2. Try Clerk JWT verification (`@clerk/backend verifyToken`) → sets `request.userId = sub`
3. Fallback: SHA-256 hash token → look up in API keys table → sets `request.userId`
4. Special hard-coded `FISHTANK_API_KEY` for a specific user
5. Credit/usage tracked by `request.userId`

This gives us a faster path than full OAuth for Pipelines specifically:

**Option 1: Shared Clerk instance (fastest)**
- Studio and Pipelines use the same Clerk project
- Studio gets a Clerk JWT for the user → forwards it to Pipelines
- Pipelines already verifies it — no changes needed on their side
- Just ensure `CLERK_SECRET_KEY` is from the same Clerk project

```ts
// Studio backend — proxy to Pipelines
const token = await clerkClient.sessions.getToken(sessionId);
const resp = await fetch(`${PIPELINES_URL}${path}`, {
  headers: { Authorization: `Bearer ${token}` },
  body: req.body,
});
```

**Option 2: Pipelines adds OAuth endpoints (better long-term)**
- Studio is just another OAuth client
- Works even if Studio and Pipelines use different identity systems
- Same pattern as any other provider

**Recommendation:** Start with Option 1 (shared Clerk) for Pipelines. Build generic OAuth Connect for other providers. Migrate Pipelines to OAuth later if needed.

---

## Appendix 6: Security — Why We Don't Store API Keys

If Studio stored raw API keys for 50 providers x 10,000 users = 500,000 keys in one DB. One breach = every user's access to every provider compromised.

NAAP does this with AES-256-GCM encryption (`apps/web-next/src/lib/gateway/encryption.ts`), but the server-side `ENCRYPTION_KEY` env var is a single point of compromise. The server MUST be able to decrypt because it needs to inject the real key into upstream requests. If someone gets `ENCRYPTION_KEY` + database access → they get every stored key.

**Studio's approach instead — no key vault at all:**

- **Network APIs:** No third-party keys. Studio IS the auth layer. Studio API key → Gateway.
- **Third-party (HMAC):** No user keys stored. Studio signs requests with provider's shared_secret. Provider verifies HMAC. Users never provide or store provider credentials.
- **Third-party (OAuth):** OAuth tokens stored encrypted (AES-256-GCM). But these are revocable, scoped, expiring. If breached: providers mass-revoke all Studio tokens, users disconnect individually. Blast radius is limited and recoverable.

**For the "Try it" playground:**
- Network APIs: Studio uses its own service key to call the Gateway. User never touches a key.
- Third-party APIs via HMAC: Same — Studio's HMAC signature is the auth. User never provides a provider key.
- Third-party APIs before HMAC is set up: pass-through proxy — user pastes their key per session (sessionStorage only, never persisted to disk or DB).

**If we later need encrypted storage (for OAuth tokens), mitigations:**

| Mitigation | What it does |
|------------|-------------|
| AWS KMS / GCP Cloud HSM | Encryption key lives in hardware, never on disk |
| Key rotation | Rotate encryption key periodically, re-encrypt all tokens |
| Audit log | Log every decryption event (who, when, which token) |
| Short-lived tokens | Store refresh tokens, mint short-lived access tokens |
| Scoped access | Each service only decrypts what it needs |

---

## Appendix 7: NAAP's Service Gateway — What It Does (Reference)

NAAP has a full API gateway (`plugins/service-gateway/`) that abstracts multiple upstream APIs behind a single NAAP API key. This is the system we're simplifying for Studio.

**NAAP gateway flow (13-step pipeline):**
1. **Authorize** — Validate JWT or API key (SHA-256 hash lookup)
2. **Resolve** — Find connector + endpoint config (3-tier cache: in-memory → Redis → DB)
3. **Access Control** — Team isolation + endpoint scoping
4. **IP Allowlist** — CIDR-based restrictions per API key
5. **Request Size** — Enforce payload limits
6. **Policy Enforcement** — Rate limits (per-minute) & quotas (daily/monthly)
7. **Validation** — Schema & header validation
8. **Cache** — GET response caching with TTL
9. **Secrets Resolution** — Decrypt and inject upstream API keys (AES-256-GCM)
10. **Transform** — Body transformation (passthrough, template, binary, extract, form-encode)
11. **Proxy** — Forward to upstream with retry + circuit breaker + SSRF protection
12. **Respond** — Normalize response
13. **Async Logging** — Non-blocking usage telemetry

**Key NAAP gateway files:**
- Main proxy: `apps/web-next/src/app/api/v1/gw/[connector]/[...path]/route.ts` (372 lines)
- Authorization: `apps/web-next/src/lib/gateway/authorize.ts`
- Connector resolution: `apps/web-next/src/lib/gateway/resolve.ts` (3-tier cache)
- Secret decryption: `apps/web-next/src/lib/gateway/secrets.ts`
- Request transformation: `apps/web-next/src/lib/gateway/transform.ts`
- Policy enforcement: `apps/web-next/src/lib/gateway/policy.ts`
- Encryption utils: `apps/web-next/src/lib/gateway/encryption.ts`
- Admin routes: `apps/web-next/src/app/api/v1/gw/admin/` (connectors, keys, plans, secrets)
- Connector definitions: `plugins/service-gateway/connectors/*.json` (26 connectors)
- Seed script: `bin/seed-leaderboard-gateway.ts` (full setup example)

**NAAP connector examples (26 total):**
Stripe, OpenAI, Gemini, Replicate, fal.ai, Modal, RunPod, Cloudflare AI, Daydream, Livepeer Gateway, Livepeer Leaderboard, Livepeer Studio, Neon, Supabase, Upstash Redis, Pinecone, Confluent Kafka, ClickHouse, Resend, Twilio, Vercel Blob, Storj S3, GitHub Releases, Baseten, SSH Bridge

**NAAP DB schema (7 tables):**
- `ServiceConnector` — upstream API definitions (slug, URL, auth type, secret refs)
- `ConnectorEndpoint` — consumer routes mapped to upstream paths
- `GatewayApiKey` — consumer credentials (SHA-256 hashed, with scoping)
- `GatewayPlan` — rate limits & quotas
- `SecretVault` — encrypted upstream secrets (AES-256-GCM)
- `GatewayHealthCheck` — upstream health monitoring
- `GatewayUsageRecord` — analytics/billing logs

**Why Studio simplifies this:**
Studio doesn't need connectors, secret vault, endpoint scoping, IP allowlists, or multi-tenant isolation. Studio has ONE proxy route that either calls the Gateway (network) or signs with HMAC (third-party). The complexity moves from the gateway layer to the auth layer (Clerk + OAuth).

---

## Appendix 8: Go Gateway vs Python SDK vs JS SDK

### Go Gateway (go-livepeer)
- Deployed binary with HTTP REST endpoints
- Already running and production-proven
- Studio calls it via `fetch()` from API routes
- Single process, single wallet, shared state
- Endpoints: `/api/v1/pipelines/*`, stream management, etc.

### Python SDK (j0sh/livepeer-python-gateway)
- Python library (not a web server) for direct orchestrator communication
- 21 modules: capabilities, channel_reader/writer, control, events, lv2v, media_decode/output/publish, orchestrator selection, remote_signer, trickle_publisher/subscriber, etc.
- Uses protobuf/gRPC for Livepeer protocol, trickle protocol for frame streaming
- Supports on-chain payments (remote signer) and off-chain mode
- Examples: start_job, write_frames, camera_capture, subscribe_events, orchestrator selection
- Needs FastAPI/Flask wrapper to expose HTTP endpoints
- Gives full control over orchestrator selection, per-user pricing logic

### JS SDK (doesn't exist yet)
- Would be a partial port of the Python SDK's control plane only
- ~1,000 lines: protobuf definitions, orchestrator selection, job lifecycle
- Could run directly in Next.js API routes (no separate service)
- Media encode/decode is hard in JS — only control plane is portable
- `protobufjs` or `buf` for protobuf, `ethers.js` for payment signing

### Why Go Gateway for Studio v1
Studio is a Next.js app. Calling HTTP endpoints from API routes is trivial. No new service to deploy, no Python runtime, no protobuf setup. The Go Gateway is production-proven and already deployed.

### Migration path
```
Week 1-4:   Go Gateway (HTTP API, already deployed)
              Studio API route → fetch(GATEWAY_URL + path) → network

Month 2-3:  Evaluate Python SDK for multi-user support
              If needed: FastAPI wrapper around SDK
              Studio → fetch(PYTHON_SERVICE_URL + path) → SDK → orchestrators

Later:      JS SDK port (control plane only)
              Studio → import { startJob } from '@livepeer/sdk'
              No external service needed for basic operations
```

**When to migrate:** When you need per-user orchestrator selection, custom pricing logic, or the Go Gateway becomes a bottleneck for multi-user workloads. The Python SDK gives full control — the Go Gateway is a "one size fits all" proxy.

---

## Appendix 9: NAAP UI Component Library (Full Inventory)

All 18 components from `packages/ui/src/`. Every one is pure React + Tailwind, no `@naap/*` imports, ready to copy.

| # | Component | Lines | Props/Variants | Dependencies | Studio Use |
|---|-----------|-------|----------------|-------------|-----------|
| 1 | **Badge** | 28 | 5 variants: emerald, blue, amber, rose, secondary | — | API status, provider badges |
| 2 | **Button** | 97 | 4 variants (primary/secondary/ghost/destructive), 3 sizes, loading, icon | — | Every page |
| 3 | **Card** | 34 | title, subtitle, action slot | — | Dashboard stats, settings sections |
| 4 | **ConfirmDialog** | 99 | default/danger variant, loading | lucide-react, Modal | Revoke key, delete account |
| 5 | **DataTable** | 246 | Generic `<T>`, sortable columns, pagination (10/page), row click | lucide-react | Keys table, usage table, activity |
| 6 | **EmptyState** | 60 | icon, title, description, action | lucide-react | No keys yet, no usage yet |
| 7 | **FilterBar** | 67 | Generic `<T>`, options with counts, 3 sizes | — | API category filters |
| 8 | **Input** | 117 | Input + Textarea + Select + Label, error state, icon | — | Every form |
| 9 | **LoadingState** | 106 | LoadingSpinner (3 sizes) + Skeleton + SkeletonCard | — | Page loading |
| 10 | **Modal** | 140 | 5 sizes (sm-full), keyboard escape, backdrop click, portal | lucide-react | Create key, settings modals |
| 11 | **ReleaseNotesViewer** | 104 | version string | framer-motion, lucide-react | Version/changelog (generalize) |
| 12 | **SearchInput** | 92 | debounced (300ms), clear button | lucide-react | API search |
| 13 | **Stat** | 27 | label, value, trend, prefix, suffix | Card | Dashboard KPI cards |
| 14 | **Tabs** | 103 | Generic `<T>`, icons, badges, 3 sizes | lucide-react | Use-case tabs, settings tabs |
| 15 | **Toggle** | 84 | 3 sizes, label + description | — | Settings toggles |
| 16 | **Tooltip** | 93 | 4 positions, configurable delay | — | Help text on forms |
| 17 | **VersionBadge** | 39 | current version, click handler | lucide-react | Version display (generalize) |
| 18 | **index.ts** | 27 | Barrel export | — | — |

**Total: ~1,700 lines. External deps: lucide-react (13 icons used), framer-motion (1 component), react-dom (createPortal in Modal).**

**Theme tokens from `packages/theme/src/index.ts`:**
- Colors: dark surfaces (#121212, #1A1A1A, #222222), 6-level text hierarchy, brand green (#18794E/#1E9960), accent palette (blue, amber, rose, purple)
- Typography: Inter (sans) + JetBrains Mono (mono), 7-step scale (display→label)
- Spacing: xs-2xl (4px-48px)
- Border radius: sm-2xl + full
- Motion: instant-slow (100-300ms) with easing curves
- Dark mode by default via CSS custom properties

---

## Appendix 10: Billing Architecture

### Phase 1: Free tier (Week 1)
- Meter usage in `usage_records` table — no payments
- Subsidized network APIs: 10 free runs for anonymous users, unlimited for signed-up users (Livepeer pays)
- This is the growth phase — maximize trial usage

### Phase 2: Credits via Stripe Checkout (Week 3-4)

```sql
CREATE TABLE credits (
  user_id    TEXT PRIMARY KEY,       -- Clerk user ID
  balance    DECIMAL NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE usage_records (
  id              UUID PRIMARY KEY,
  user_id         TEXT NOT NULL,
  api_id          UUID REFERENCES apis(id),
  endpoint        TEXT NOT NULL,
  cost            DECIMAL NOT NULL,
  request_at      TIMESTAMPTZ DEFAULT NOW(),
  response_status INT,
  latency_ms      INT
);
```

- New users get $5 free credits on signup
- User buys more credits via Stripe Checkout
- Each API call deducts from balance based on API pricing
- Low balance → warning email → block at zero (with grace period)

### Phase 3: Stripe Connect for providers (Month 2)
- Providers connect their Stripe account
- Studio splits payment: Studio fee (e.g., 10%) + provider payout
- Automatic monthly payouts to providers
- Provider dashboard shows revenue metrics

---

## Appendix 11: Provider Onboarding Requirements & Flow

### Minimum requirements (HMAC — gets listed immediately)
- API base URL
- Endpoint documentation (OpenAPI spec preferred)
- HMAC signature verification on incoming requests (~10 lines of code)
- Pricing information

### Enhanced requirements (OAuth — gets "Connect" button)
Everything above, plus:
- OAuth 2.0 authorization endpoint
- OAuth 2.0 token endpoint
- Token revocation endpoint
- Scoped permissions (e.g., run-jobs, read-usage)

### Registration flow

```
Provider visits studio.livepeer.org/studio/provider/register

Step 1: Register
  - Company/project name, API base URL, description + docs link
  → Studio generates shared_secret for HMAC

Step 2: Define endpoints
  - Add endpoints manually (method, path, params schema, pricing)
  - Or upload OpenAPI spec → auto-populate endpoints
  - Set pricing per endpoint (per-request, per-minute, subscription)

Step 3: Verify integration
  - Provider adds HMAC verification to their API
  - Studio sends test request → verify HMAC is accepted
  - ✅ "Integration verified"

Step 4: Configure listing
  - Upload logo, add screenshots
  - Write description for catalog
  - Choose category (video, image, text, audio)
  - Add tags (real-time, generative, streaming, etc.)
  - Submit for review

Step 5: Review & publish
  - Studio team reviews (manual for now)
  - Published → appears in catalog
  - Provider gets dashboard with traffic stats
```

### Provider dashboard features
- Subscriber/usage count
- Request volume and latency charts
- Revenue (when billing is live)
- API health status (Studio pings endpoints periodically)
- Shared_secret rotation
- Endpoint management (add/edit/disable)

### Why no plugin required
NAAP's Daydream integration required a custom plugin with its own frontend (React components, WebRTC handling) and backend (Express server, DB schema). Studio's approach: provider defines endpoints + params schema, Studio auto-generates the playground. Provider writes zero frontend code. Much lower barrier to entry.

---

## Appendix 12: Complete Request Flow Diagrams

### Flow 1: Anonymous user tries subsidized network API

```
Guest visits /studio/explore/text-to-image
  → Clicks "Run" with prompt "a cat in a top hat"
  → Browser POST /api/v1/run/text-to-image/generate
      No auth header (anonymous)
  → Studio API route:
      1. Check: is text-to-image marked as subsidized? Yes
      2. Get IP + fingerprint from request
      3. Query guest_usage: how many runs for this fingerprint?
      4. Count = 3 (under 10 limit)
      5. POST ${GATEWAY_URL}/api/v1/pipelines/text-to-image
           Authorization: Bearer ${STUDIO_SERVICE_KEY}
           Body: {"prompt": "a cat in a top hat"}
      6. Gateway → orchestrators → result
      7. Insert guest_usage record (fingerprint, api, timestamp)
      8. Return image to browser
  → Playground renders the generated image
```

### Flow 2: Authenticated user calls network API with Studio key

```
Developer's app makes API call:
  POST https://studio.livepeer.org/v1/run/text-to-image/generate
    Authorization: Bearer lp_studio_a1b2c3d4...
    Body: {"prompt": "a cat in a top hat", "model": "sdxl"}

  → Studio API route:
      1. Extract key from header
      2. SHA-256 hash → look up in api_keys table
      3. Found, status=active, belongs to user_123
      4. Check credits balance for user_123: $42.50
      5. Look up api record for "text-to-image": provider_type=network
      6. POST ${GATEWAY_URL}/api/v1/pipelines/text-to-image
           Authorization: Bearer ${STUDIO_SERVICE_KEY}
           Body: {"prompt": "...", "model": "sdxl"}
      7. Gateway → orchestrators → result
      8. Cost: $0.005
      9. Deduct from credits: $42.50 → $42.495
      10. Insert usage_record (user_123, text-to-image, $0.005, 200, 2100ms)
      11. Return result to developer's app
```

### Flow 3: User calls third-party API via HMAC proxy

```
User clicks "Run" on Daydream's API in playground (logged in via Clerk):
  → Browser POST /api/v1/run/daydream/streams
      Cookie: __clerk_session=<jwt>
      Body: {"model": "sd-turbo", "prompt": "anime style"}

  → Studio API route:
      1. Verify Clerk session from cookie → userId = user_123
      2. Check credits: $42.495
      3. Look up api record for "daydream": provider_type=third_party, auth_type=hmac
      4. Load shared_secret from apis table
      5. timestamp = Date.now().toString()
      6. signature = HMAC-SHA256(shared_secret, timestamp + "." + body)
      7. POST https://api.daydream.live/streams
           X-Studio-Signature: <signature>
           X-Studio-Timestamp: <timestamp>
           X-Studio-User-Id: user_123
           X-Studio-Plan: free
           Body: {"model": "sd-turbo", "prompt": "anime style"}
      8. Daydream verifies HMAC, creates stream, returns result
      9. Cost: $0.05
      10. Deduct credits, insert usage_record
      11. Return result to browser
```

### Flow 4: User calls third-party API via OAuth token

```
User clicks "Run" on Pipelines' text-to-image (logged in, Pipelines connected via OAuth):
  → Browser POST /api/v1/run/pipelines/text-to-image
      Cookie: __clerk_session=<jwt>
      Body: {"prompt": "a sunset over mountains"}

  → Studio API route:
      1. Verify Clerk session → userId = user_123
      2. Check credits: $42.445
      3. Look up api record for "pipelines": auth_type=oauth
      4. Load provider_connection for (user_123, pipelines)
      5. Decrypt access_token (AES-256-GCM)
      6. If expired: use refresh_token to get new access_token
      7. POST https://pipelines.livepeer.org/api/text-to-image
           Authorization: Bearer <access_token>
           Body: {"prompt": "a sunset over mountains"}
      8. Pipelines processes, returns result
      9. Deduct credits, insert usage_record
      10. Return result to browser
```

---

*End of Part 3: Technical Appendices.*

---

## Summary: Key Decisions

| Decision | Choice | Why |
|----------|--------|-----|
| Where Studio lives | Separate repo | Different product, audience, release cadence |
| Monorepo with website? | No | Connect via Vercel rewrites. Independent deploys |
| What to call things | "APIs" | Not Capabilities, Solutions, Pipelines, or Models |
| Auth provider | Clerk | Pipelines already uses it, proven, OAuth social login |
| Network API backend | Go Gateway (for now) | Already deployed, HTTP API. Swap to Python SDK later |
| Third-party auth | OAuth Connect from day one | One system, not two. Revocable, scoped, standard. Providers implement OAuth to get listed |
| Store user API keys? | No | HMAC means no user keys. OAuth tokens are revocable |
| Try without account? | Yes, subsidized | 10 free runs on LIVEPEER APIs. Growth funnel |
| Billing | Credits (Stripe) | Buy credits, deduct per call. Stripe Connect for providers |
| Provider playground | Auto-generated | From endpoint params schema. Provider writes no frontend |
| UI components | Build fresh, website-styled | Use NAAP as functional reference, style to match livepeer/website |

---

## Appendix 13: Pipeline SDK & Network Deployment (`livepeer_gateway.runner`)

### Overview

To let providers deploy new AI capabilities onto the Livepeer network (like Replicate's `cog push` or Chutes' `chutes deploy`), we extend the existing Python SDK (`j0sh/livepeer-python-gateway`) with a **runner** module. Providers write a Python class, the SDK handles transport, containerization, and deployment.

### How Replicate & Chutes do it (reference)

**Replicate:** Provider writes `predict.py` with a `Predictor` class (inherits `BasePredictor`). `setup()` loads model once, `predict()` runs per request. Inputs defined via `Input()` type annotations with description, default, constraints. `cog push` builds container and deploys. Replicate auto-generates HTTP API + web playground from the `predict()` signature.

**Chutes:** Similar pattern with Python decorators. `@chute()` decorator on a class defines GPU requirements and image. `@chute.endpoint()` defines callable routes. `chutes deploy` pushes to their serverless infra. Also offers pre-built vLLM chutes for common models (just specify model name, no code).

**Common pattern:** Typed function signature IS the API contract. Platform reads it and generates everything else (HTTP server, playground UI, docs, client libraries).

### Repo structure: `livepeer-python-gateway`

```
livepeer-python-gateway/
  src/livepeer_gateway/

    gateway/                # Gateway — routes requests TO the network
      __init__.py
      proxy.py              # HTTP server accepting user requests
      routing.py            # Pick orchestrator for a request
      auth.py               # Validate API keys, rate limit
      billing.py            # Meter usage, deduct credits
      trickle_bridge.py     # WebRTC/HTTP ↔ trickle translation

    runner/                 # Runner — runs pipelines ON the network
      __init__.py
      pipeline.py           # Pipeline, StreamPipeline base classes
      inputs.py             # Input(), LiveParam(), Output()
      serve.py              # Wraps pipeline in HTTP + trickle server
      schema.py             # Extract schema from predict() signature
      cli.py                # `livepeer push` command

    # Shared transport (used by both gateway and runner)
    orchestrator.py         # Discovery, selection
    selection.py            # Orchestrator selection logic
    trickle_publisher.py    # Send frames via trickle
    trickle_subscriber.py   # Receive frames via trickle
    channel_reader.py       # Frame-level I/O
    channel_writer.py       # Frame-level I/O
    media_decode.py         # Video decode
    media_output.py         # Video encode
    media_publish.py        # Media publishing
    lp_rpc_pb2.py           # Protobuf definitions
    remote_signer.py        # Payment signing
    ...
```

Three layers, one repo:
- `livepeer_gateway.gateway` → "I route requests to the network" (eventually replaces Go gateway)
- `livepeer_gateway.runner` → "I run pipelines on the network" (new)
- `livepeer_gateway` (root) → Shared transport primitives (exists today)

### Provider experience

**Request-response pipeline (text-to-image, image-to-video):**
```python
from livepeer_gateway.runner import Pipeline, Input, Output

class TextToImage(Pipeline):
    gpu = "A100"

    def setup(self):
        from diffusers import StableDiffusionXLPipeline
        self.pipe = StableDiffusionXLPipeline.from_pretrained("stabilityai/sdxl-1.0")

    def predict(self,
        prompt: str = Input(description="Text prompt"),
        width: int = Input(default=1024, choices=[512, 768, 1024]),
        height: int = Input(default=1024, choices=[512, 768, 1024]),
        steps: int = Input(default=30, ge=1, le=100),
    ) -> Output(type="image"):
        image = self.pipe(prompt, width=width, height=height, 
                         num_inference_steps=steps).images[0]
        return image
```

**Real-time streaming pipeline (LV2V, Scope-like):**
```python
from livepeer_gateway.runner import StreamPipeline, LiveParam, VideoFrame

class RealtimeStyle(StreamPipeline):
    gpu = "A100"

    def setup(self):
        from streamdiffusion import StreamDiffusion
        self.stream = StreamDiffusion("sd-turbo")

    def on_frame(self,
        frame: VideoFrame,
        prompt: str = LiveParam(description="Style prompt"),
        strength: float = LiveParam(default=0.6, min=0, max=1),
    ) -> VideoFrame:
        return self.stream(frame, prompt=prompt, strength=strength)
```

**CLI workflow:**
```bash
# Install
pip install livepeer-gateway

# Test locally
livepeer predict my_pipeline.py -i prompt="a cat in space"

# Deploy to network
livepeer push my_pipeline.py
#  → Reads pipeline class, extracts input/output schema
#  → Generates Dockerfile (base image + deps + model weights)
#  → Builds container
#  → Pushes to registry
#  → Registers capability on network
#  → Orchestrators pull and run it
#  → Appears in Studio catalog with auto-generated playground
```

### How `serve.py` works (the bridge)

`serve.py` wraps a Pipeline class and connects it to the existing SDK transport. It reuses everything the SDK already has:

**For request-response pipelines:**
```
serve.py starts HTTP server inside container:
  POST /predict → deserialize inputs → call pipeline.predict() → serialize → respond
  GET /schema → return input/output types (auto-generated from predict() signature)
  GET /health → return status
```

**For streaming pipelines:**
```
serve.py uses existing SDK trickle transport:
  trickle_subscriber ← receives encoded frames from gateway
      ↓
  media_decode → raw frames
      ↓
  pipeline.on_frame(frame, **live_params) → processed frame
      ↓
  media_output → encode
      ↓
  trickle_publisher → sends frames back to gateway
  
  Parameter updates arrive via separate channel → forwarded to on_frame() kwargs
```

The provider never imports trickle, protobuf, or media modules. They import `Pipeline`, `Input`, write `predict()`. The SDK does the rest.

### Transport: End-to-end data flow

**Request-response (e.g., text-to-image):**
```
User's browser
  → POST https://studio.livepeer.org/v1/run/text-to-image
  → Studio API route
  → Go Gateway (or livepeer_gateway.gateway eventually)
  → HTTP to orchestrator
  → Orchestrator → container's POST /predict
  → Container runs predict()
  → Result flows back the same path
```

**Real-time streaming (e.g., Scope-like LV2V):**
```
User's browser
  ↓ WebRTC (SDP offer/answer, ICE, camera stream)
Studio/Gateway
  ↓ Trickle protocol (HTTP segment streaming)
Orchestrator runtime
  ↓ trickle_subscriber → media_decode → raw frames
Container (serve.py calls on_frame() per frame)
  ↓ processed frames → media_output → trickle_publisher
Orchestrator runtime
  ↓ Trickle protocol
Studio/Gateway
  ↓ WebRTC
User's browser

Parameter updates (user moves slider in playground):
  Browser → WebRTC data channel → Gateway → forwarded to container → on_frame() sees new kwargs
```

### Schema → Studio playground (auto-generation)

The `predict()` / `on_frame()` signature maps directly to Studio's `api_endpoints.params` schema:

```python
# Provider writes:
def predict(self,
    prompt: str = Input(description="Text prompt"),
    steps: int = Input(default=30, ge=1, le=100),
    model: str = Input(default="sdxl", choices=["sd15", "sdxl", "sd3"]),
) -> Output(type="image"):
```

```json
// Studio receives (via schema endpoint or registry):
{
  "params": [
    { "name": "prompt", "type": "string", "required": true, "description": "Text prompt" },
    { "name": "steps", "type": "number", "default": 30, "min": 1, "max": 100 },
    { "name": "model", "type": "enum", "default": "sdxl", "values": ["sd15", "sdxl", "sd3"] }
  ],
  "response_type": "image",
  "interaction_type": "request_response"
}
```

Studio auto-generates the playground form from this. For `StreamPipeline`, `interaction_type` is `"webrtc_stream"` and `LiveParam` fields become real-time sliders.

### Communication: Provider ↔ Network (after deployment)

No direct channel between provider and orchestrator. The registry is the intermediary.

| What | How | Who sees it |
|------|-----|-------------|
| Request volume, latency, errors | Studio logs every proxied request | Provider Dashboard in Studio |
| Container health | Orchestrator pings `/health` inside container | Network health monitoring |
| Container crashes | Orchestrator reports to network | Provider sees in Studio |
| Revenue per request | Studio tracks billing | Provider Dashboard |
| Push new version | `livepeer push` → registry → orchestrators pull | Rolling update, zero downtime |
| View logs (MVP) | Metrics only (request count, error rate, latency) | Provider Dashboard |
| View logs (later) | Container stdout/stderr → log aggregation | Provider Dashboard |

### Code size estimate

| Component | Lines | Who builds it |
|-----------|-------|--------------|
| `runner/pipeline.py` — base classes | ~100 | Livepeer (SDK) |
| `runner/inputs.py` — type annotations | ~50 | Livepeer (SDK) |
| `runner/serve.py` — HTTP + trickle bridge | ~350 | Livepeer (SDK) |
| `runner/schema.py` — extract schema from signature | ~50 | Livepeer (SDK) |
| `runner/cli.py` — `livepeer push` | ~200 | Livepeer (SDK) |
| **Runner total** | **~750** | |
| `gateway/` — full gateway (replaces Go) | ~1,000 | Livepeer (later) |
| **Provider writes** | **~20-50** | **Provider** |

### Timeline

```
Month 2:    runner/ module — Pipeline, StreamPipeline, serve, push CLI
            Providers can deploy request-response pipelines
Month 3:    StreamPipeline support (on_frame + trickle bridge)
            WebRTC playground in Studio for streaming pipelines
Month 4+:   gateway/ module — Python replacement for Go gateway
            Full control over routing, auth, billing per user
```

### How this changes the Studio catalog

When a provider does `livepeer push`:
1. Container built and pushed to registry
2. Capability registered on network with schema
3. Orchestrators opt-in, pull container, advertise capability
4. Studio's `/api/v1/apis` endpoint detects new network capability
5. Auto-creates catalog entry with `provider_type = 'network'`
6. Playground auto-generated from schema
7. Badge: `LIVEPEER · by ProviderName`

The provider goes from "I have a model" to "it's live on the network with a playground" in one `livepeer push`.

---

## Appendix 14: Live Playground for WebRTC/Streaming APIs

### The problem

Most APIs are request-response: form → run → result. But Scope/Daydream and LV2V pipelines are real-time streaming: webcam in → AI processing → video out, with live parameter tweaking.

### Two playground types

**Type 1: Request-Response (auto-generated from params schema)**
Standard form: text inputs, dropdowns, sliders, file upload → Run button → result renderer.
Covers: text-to-image, image-to-video, LLM inference, upscaling, etc.

**Type 2: Live (WebRTC, for streaming APIs)**
```
┌─────────────────────────────────────────────────────────────┐
│  ┌──────────────┐    ┌──────────────┐                      │
│  │  Input        │    │  Output       │                      │
│  │  (webcam)    │ →  │  (AI result) │                      │
│  └──────────────┘    └──────────────┘                      │
│                                                              │
│  Prompt: [cyberpunk neon city                          ]    │
│  Noise:  ├────────●──────────┤ 0.6                         │
│  Steps:  [1, 2, 4, 8 ▾]                                    │
│  Paused: [ ]                                                │
│                                                              │
│  [Start Session]  [Stop]                                    │
│  ⓘ Uses webcam. 3 free minutes without account.            │
└─────────────────────────────────────────────────────────────┘
```

### How Studio knows which type to render

From the pipeline schema:
- `interaction_type: "request_response"` → form playground (Input fields)
- `interaction_type: "webrtc_stream"` → live playground (LiveParam fields)

Studio checks this field and renders the appropriate component.

### WebRTC playground implementation (~200 lines reusable component)

```
1. Call provider's ICE servers endpoint → get TURN config
2. Create RTCPeerConnection with those servers
3. getUserMedia() → add local webcam stream as track
4. Create SDP offer → POST to provider's offer endpoint → get answer
5. Set remote description → connection established
6. Render remote stream in <video> element
7. Open RTCDataChannel for live parameter updates
8. User moves slider → send JSON param update over data channel
9. On stop: close connection, stop tracks
```

This is a single reusable React component. Every streaming API provider uses the same pattern — the only difference is the `live_params` schema which determines what sliders/inputs appear.

### Subsidized free tier for streaming

- 3 free minutes per session for anonymous users (vs 10 runs for request-response)
- Metered by session duration, not request count
- Timer shown in playground UI
- After 3 minutes: "Sign up to continue"

### Timeline

```
Week 1-2:   Request-response playground (auto-generated forms)
Week 3-4:   Live WebRTC playground component
            Works for Scope/Daydream and any future streaming API
```
