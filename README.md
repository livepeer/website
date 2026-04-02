# Livepeer Website

The official website for [Livepeer](https://livepeer.org) — open infrastructure for real-time AI video.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI**: React 19, Tailwind CSS v4, Framer Motion 11
- **Language**: TypeScript
- **Fonts**: Favorit Pro & Favorit Mono (Dinamo Typefaces)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

| Command         | Description              |
| --------------- | ------------------------ |
| `npm run dev`   | Start development server |
| `npm run build` | Create production build  |
| `npm run start` | Serve production build   |
| `npm run lint`  | Run ESLint               |

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
