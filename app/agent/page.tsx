import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDownIcon } from "lucide-react";

import { AgentWordmark, LivepeerWordmark } from "@/components/brand";
import {
  AgentHeroFilms,
  type AgentHeroFilm,
} from "@/components/livepeer-ui/agent-hero-film";
import {
  AgentInstallTabs,
  type AgentInstallTool,
} from "@/components/livepeer-ui/agent-install-tabs";
import {
  AgentShowcase,
  type AgentShowcaseItem,
} from "@/components/livepeer-ui/agent-showcase";
import { Button } from "@/components/ui/button";
import { agentApp } from "@/lib/site";
import { stockAssets } from "@/lib/stock-assets";

/*
 * The Agent page is the work, and then the reader's turn.
 *
 * Livepeer Agent has no interface of its own: a reader asks for a video in
 * the AI tool they already use, and the Agent plans, generates, scores and
 * edits it with the models on the network. So the page does not describe a
 * product and then list its parts. It opens on films the Agent made,
 * full-bleed, each with its credit (the request and the models); shows the
 * range beyond film, two more videos in the shapes they were made in, with
 * the requests that asked for them; and ends on the install, with the
 * builder's way in as a line beneath it.
 *
 * Video first and of every kind: one story read as a film tool, and a
 * picture book of stills read as an image tool. A section of pipeline stages
 * with capability ids, then a wall of follow-up asks, sat in the middle once;
 * both repeated what the work already shows and were cut.
 */

/*
 * What Livepeer Agent made for this page, and the requests that asked for it:
 * each clip was rendered through the Agent's Creative MCP surface on
 * 2026-10-06 (create_media, the model named, no fallback), then encoded for
 * the web without audio, since the player is muted, into public/videos/agent.
 * The request shown is the ask in a person's words; the prompt sent with it:
 *
 * - Hero films. Each was made in two steps, which is how the look was art
 *   directed: a 16:9 key frame from seedream-5-lite at 2848x1600 (Krea 2 was
 *   tried and returned squares), then veo-i2v (Veo 3.1) animating it for 8s
 *   at 4K, two takes a scene (seeds 101 and 202) with the better kept:
 *   coat 101, ringed 202 (101 ends on a flare that whites out the frame),
 *   monolith 101 (202 grows a second figure), lanterns 101. Each is served
 *   as AV1 at 2560 wide and 5 Mbps with film-grain synthesis, AV1 at 1280
 *   for phones, and H.264 at 1920 for browsers without AV1; see
 *   AgentHeroFilms. Each still prompt ended "The subject on the right third
 *   of the frame, calm open space on the left, the lower third falls into
 *   deep shadow", so the headline has a dark field, then
 *   film-stock and grade words. coat: "Editorial fashion photograph ... a
 *   woman in a sculptural oversized crimson wool coat ... in a vast field of
 *   tall pale pampas grass at dusk"; ringed: "A lone astronaut in a white
 *   suit stands on the rim of a pale dusty crater on a desolate moon,
 *   looking up at an enormous ringed gas giant ..." (seed 29); monolith: "A
 *   lone small figure in a long dark coat walks across a vast fog-filled
 *   brutalist concrete plaza toward a tall glowing white monolith ...";
 *   lanterns: "Textured gouache illustration ... not anime ... a child in a
 *   small wooden boat releases a glowing paper lantern ..." (seed 23).
 *   The motion prompts ask for one dramatic action and one camera move
 *   each: a gust that whips the coat as she turns to camera and the camera
 *   arcs in; a crane over the crater as the astronaut steps forward;
 *   hundreds of lanterns rising as the camera tilts up. The monolith's asked
 *   for its glow to "flare and pulse" first and Veo set it on fire; its
 *   prompt now asks for a slowly intensifying glow and drifting fog, and
 *   says no fire, smoke or bursting rays.
 *   A first pass animated with kling-o3-i2v, whose standard tier stops at
 *   720p, and a second with Veo at 1080p; both looked soft full-bleed.
 *   Earlier hero films (a lighthouse keeper, a glacier, a watch macro, a
 *   Tokyo street violinist) and stills of horses, an underwater dancer, moon
 *   dunes, koi and astronauts in a ring of ice were made and set aside.
 * - Vertical clip, veo-t2v, 6s, 9:16: "Vertical 9:16 sneaker commercial. Low
 *   close-up of a runner's bright neon running shoes striking a rain-soaked
 *   rooftop at dawn, water exploding in slow motion; the camera tilts up to
 *   reveal the runner sprinting toward a glowing city skyline. Crisp
 *   commercial look, high contrast, dynamic, no text, no logos." (Kling was
 *   asked first and returned 16:9.)
 * - Animation, kling-v3-turbo-pro-t2v, 6s, 16:9: "Stop-motion claymation. A
 *   tiny fox baker in a flour-dusted apron pulls a steaming loaf of bread
 *   from a little brick oven, sniffs it, and does a happy hop. Cosy handmade
 *   kitchen, visible fingerprints and textures in the clay, warm soft morning
 *   light, gentle stop-motion frame cadence, no text."
 */
/** The hero's films, and the credit each carries. */
const films: AgentHeroFilm[] = [
  {
    name: "coat",
    focus: 60,
    model: "Seedream → Veo · 4K · 8s",
    request:
      "An editorial shot of a woman in a crimson coat in a field of pampas grass at dusk.",
  },
  {
    name: "ringed",
    focus: 60,
    model: "Seedream → Veo · 4K · 8s",
    request: "An astronaut on a crater rim under a giant ringed planet.",
  },
  {
    name: "monolith",
    focus: 70,
    model: "Seedream → Veo · 4K · 8s",
    request:
      "A lone figure crossing a foggy concrete plaza toward a glowing monolith.",
  },
  {
    name: "lanterns",
    focus: 60,
    model: "Seedream → Veo · 4K · 8s",
    request:
      "A gouache-painted animation of a child releasing a paper lantern over a river at night.",
  },
];

/** The range beyond film, each in the shape it was made in. */
const range: AgentShowcaseItem[] = [
  {
    kind: "Vertical ad",
    model: "Veo · 6s",
    aspect: 9 / 16,
    request: "A 6-second vertical ad for our new running shoe, for Reels.",
    src: "/videos/agent/vertical.mp4",
    poster: "/videos/agent/vertical.jpg",
    label: "Running shoes splash across a wet rooftop at dawn",
  },
  {
    kind: "Animation",
    model: "Kling · 6s",
    aspect: 16 / 9,
    request:
      "A claymation scene of a fox baker pulling fresh bread out of the oven.",
    src: "/videos/agent/animation.mp4",
    poster: "/videos/agent/animation.jpg",
    label: "A claymation fox baker pulls a loaf from a brick oven",
  },
];

// The steps are the Agent's own get-started guide's:
// keyless, no header and no OAuth, and a restart for the terminal tools.
const install: AgentInstallTool[] = [
  {
    name: "Claude",
    logo: stockAssets.agentCompatibility.claude,
    snippet: agentApp.mcpServerUrl,
    steps: [
      "In Claude, open Settings, then Connectors, and choose Add custom connector.",
      "Name it Livepeer Agent, paste this address and save. Leave the OAuth fields empty.",
    ],
  },
  {
    name: "Claude Code",
    logo: stockAssets.agentCompatibility.claudeCode,
    command: true,
    snippet: `claude mcp add --transport http livepeer-agent ${agentApp.mcpServerUrl}`,
    steps: ["Run this in your terminal, then restart Claude Code."],
  },
  {
    name: "Codex",
    logo: stockAssets.agentCompatibility.codex,
    monochrome: true,
    opticalScale: true,
    command: true,
    snippet: `codex mcp add livepeer-agent --url ${agentApp.mcpServerUrl}`,
    steps: ["Run this in your terminal, then restart Codex."],
  },
  {
    name: "Other",
    snippet: agentApp.mcpServerUrl,
    steps: [
      "In Hermes, OpenClaw, Pi or any other MCP client, add this address as a remote (HTTP) server. No key or header.",
    ],
  },
];

const DESCRIPTION =
  "Ask for a video in the AI tool you already use. Livepeer Agent plans, generates, scores and edits it with the best models on Livepeer's open network.";

// openGraph and twitter are declared, not inferred. Next does not fill
// og:title from `title` or og:description from `description`, so a page
// setting only those two inherits the root layout's openGraph object whole —
// and served "Livepeer — The open inference network" with the home page's
// description to every timeline it was shared into.
export const metadata: Metadata = {
  title: "Livepeer Agent",
  description: DESCRIPTION,
  openGraph: {
    title: "Livepeer Agent | Livepeer",
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "Livepeer Agent | Livepeer",
    description: DESCRIPTION,
  },
};

export default function AgentPage() {
  return (
    <>
      {/* The hero is the work. The Agent's own short film runs full-bleed
          under the header, in a band that is dark in both themes because it
          is a picture, with the promise set over a scrim at its foot and the
          film's credit opposite: what was asked, and on what. Every earlier
          hero put the work somewhere below the words. */}
      <section className="bg-background px-3 sm:px-5">
        <AgentHeroFilms films={films}>
          <div className="max-w-xl">
            <div
              className="flex items-end gap-2 text-foreground"
              aria-label="Livepeer Agent"
            >
              <LivepeerWordmark className="h-5 w-auto" aria-hidden="true" />
              <AgentWordmark
                className="h-4 w-auto translate-y-[0.05em]"
                aria-hidden="true"
              />
            </div>
            <h1 className="mt-6 text-display-md text-balance sm:text-display-fluid">
              Ask for a video.
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-pretty text-foreground/75 sm:text-lg">
              Livepeer Agent works inside the AI tool you already use. Ask for
              any video and it plans, generates, scores and edits it with the
              best models on Livepeer&rsquo;s open network.
            </p>
            <Button
              size="lg"
              nativeButton={false}
              render={<Link href="#install" />}
              className="mt-8 h-12 rounded-sm px-5"
            >
              Add it to your AI tool
              <ArrowDownIcon className="size-4" aria-hidden="true" />
            </Button>
          </div>
        </AgentHeroFilms>
      </section>

      {/* The range beyond film: what else it makes, in a line, beside two
          more of its videos in the shapes they were made in. */}
      <section className="bg-background px-4 py-24 sm:px-6 sm:py-32 lg:px-10">
        <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,40rem)] lg:items-end lg:gap-20">
          <div className="lg:pb-24">
            <h2 className="text-display-sm text-balance sm:text-display-md">
              Any kind of video.
            </h2>
            <p className="mt-5 max-w-sm text-base leading-relaxed text-pretty text-muted-foreground">
              Ads for Reels, animation, product shots, explainers, or an edit of
              your own footage. Say what you want in your own words, and the
              Agent picks the models and does the work.
            </p>
          </div>
          <AgentShowcase items={range} />
        </div>
      </section>

      {/* Your turn, centred to answer the hero: the heading, one line, the
          install, and the builder's way in said once and quietly beneath. */}
      <section
        id="install"
        className="scroll-mt-16 border-t border-border bg-background px-4 pt-24 pb-28 sm:px-6 sm:pt-32 sm:pb-36 lg:px-10"
      >
        <div className="mx-auto flex max-w-xl flex-col items-start text-left sm:items-center sm:text-center">
          <h2 className="text-display-sm text-balance sm:text-display-md">
            Your turn.
          </h2>
          <p className="mt-5 max-w-md text-base leading-relaxed text-pretty text-muted-foreground">
            Try it free: add Livepeer Agent to your AI tool and it runs on demo
            credit, with no key or account. Ask it to email you an activation
            code for more, and{" "}
            <Link
              href={agentApp.createAccount}
              className="text-foreground underline underline-offset-4 transition-opacity hover:opacity-70"
            >
              create an account
            </Link>{" "}
            when you&rsquo;re ready to go past the demo.
          </p>
          <div className="mt-10 w-full">
            <AgentInstallTabs tools={install} />
          </div>
          <p className="mt-8 max-w-md text-sm leading-relaxed text-pretty text-muted-foreground">
            Building your own product? Point its agent runtime at the same
            server.{" "}
            <Link
              href={agentApp.createAccount}
              className="text-foreground underline underline-offset-4 transition-opacity hover:opacity-70"
            >
              Create an account
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
