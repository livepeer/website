# Livepeer Website

The official website for [Livepeer](https://livepeer.org) — the open inference network for AI video and image workloads.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI**: React 19, Tailwind CSS v4
- **Design system**: [Livepeer UI](https://livepeer.peaceno.de/design.md) — a shadcn component registry (semantic tokens, light + dark)
- **Language**: TypeScript
- **Fonts**: Inter (product UI), Favorit Pro (display), Favorit Mono (code)

## Prerequisites

- [Node.js 22.x](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
- [pnpm v10.x](https://pnpm.io/installation) — install with `corepack enable` (the version is pinned in `package.json`)
- [Docker](https://docs.docker.com/get-docker/) (optional) — required for the dev container

> [!TIP]
> Use `nvm install` or `asdf install` to automatically switch to the correct versions.

## Getting Started

### Install Dependencies

```bash
pnpm install
```

### Set Up Environment Variables

Copy the example env file and fill in the values:

```bash
cp .env.example .env.local
```

| Variable           | Required | Description                                                                              |
| ------------------ | -------- | ---------------------------------------------------------------------------------------- |
| `THEGRAPH_API_KEY` | No       | Authenticated subgraph requests for live protocol stats (falls back to hardcoded values) |

### Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

| Command          | Description              |
| ---------------- | ------------------------ |
| `pnpm dev`       | Start development server |
| `pnpm build`     | Create production build  |
| `pnpm start`     | Serve production build   |
| `pnpm lint`      | Run ESLint               |
| `pnpm typecheck` | Type-check with `tsc`    |

## Design System

UI is built from the [Livepeer UI](https://livepeer.peaceno.de/design.md) shadcn registry. Install the theme and components with the shadcn CLI:

```bash
pnpm dlx shadcn@latest add @livepeer-ui/theme
pnpm dlx shadcn@latest add @livepeer-ui/button
```

Compose with the registry's semantic tokens and roles. See `CLAUDE.md` for the working rules (token discipline, font roles, brand-green constraint, per-page checklist).

## Dev Container (Recommended)

Develop inside a pre-configured container — consistent tooling, zero local setup, and isolation from your host machine.

1. Install the [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) in VS Code
2. `Ctrl+Shift+P` → **"Dev Containers: Reopen in Container"**

## Project Structure

```
app/                  # Next.js App Router pages
  agent/              # Agent product page
  ecosystem/          # Ecosystem catalog (+ [slug], submit)
  compute/            # Provide GPU compute
  token/              # Livepeer Token (LPT)
  foundation/         # Foundation
  blog/               # Latest / blog (+ [slug])
  brand/              # Brand guidelines
  primer/             # Livepeer primer (kept, unlinked)
components/
  layout/             # Header and Footer
  ui/                 # Shared primitives + registry components
  blog/ ecosystem/    # Section-specific components
  primer/ icons/      # Primer chapters, logo components
content/
  blog/               # Markdown blog posts
  ecosystem/          # Markdown ecosystem entries
lib/                  # Content loaders, fonts, hooks, subgraph
public/               # Static assets (images, videos, fonts)
```

## License

See [LICENSE](LICENSE) for details.
