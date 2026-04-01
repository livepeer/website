# Livepeer Website

The official website for [Livepeer](https://livepeer.org) — open infrastructure for real-time AI video.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI**: React 19, Tailwind CSS v4, Framer Motion 11
- **Language**: TypeScript
- **Fonts**: Favorit Pro & Favorit Mono (Dinamo Typefaces)

## Prerequisites

- **Node.js 22.x** — use `nvm install` to automatically switch (reads `.nvmrc`)
- **pnpm** — run `corepack enable` to activate pnpm at the version pinned in `package.json`
- **Docker** (optional) — required for the dev container

> **Tip:** Use `nvm install` or `asdf install` to automatically switch to the correct Node version.

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

| Variable | Required | Description |
|----------|----------|-------------|
| `MAILCHIMP_API_KEY` | Yes | Mailchimp API key for early access signups |
| `MAILCHIMP_AUDIENCE_ID` | Yes | Mailchimp audience/list ID |
| `MAILCHIMP_TAG` | No | Tag applied to new subscribers (default: "v2 Website Signups") |
| `THEGRAPH_API_KEY` | No | Authenticated subgraph requests for live protocol stats (falls back to hardcoded values) |

### Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Create production build |
| `pnpm start` | Serve production build |
| `pnpm lint` | Run ESLint |

## Dev Container (Recommended)

This project includes a dev container to isolate your development environment from your host machine, protecting against supply chain attacks by not exposing global credentials (`~/.ssh`, `~/.aws`, `~/.config`) to compromised packages.

### Setup

1. Install the [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) in VS Code
2. Open this project in VS Code
3. Press `Ctrl+Shift+P` → **"Dev Containers: Reopen in Container"**
4. The container will automatically install dependencies via `pnpm install`

The dev server runs on port 3000, which is forwarded to your host automatically.

pnpm 10 blocks dependency install scripts by default. If a package needs to run a build script (e.g., native bindings), approve it with `pnpm approve-builds && pnpm rebuild`.

## Project Structure

```
app/                  # Next.js App Router pages
  brand/              # Brand guidelines page
  primer/             # Livepeer primer page
  use-cases/          # Use-case pages
components/
  home/               # Homepage sections (Hero, Capabilities, etc.)
  layout/             # Header and Footer
  ui/                 # Shared UI primitives (Button, Card, Container, etc.)
  icons/              # Logo components (Symbol, Wordmark, Lockup)
lib/                  # Constants, fonts, and custom hooks
public/               # Static assets (images, videos, fonts)
```

## License

See [LICENSE](LICENSE) for details.
