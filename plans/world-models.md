# Claude Code Plan: Livepeer Use Case Page — World Models

Goal:
Create a new use case page at `/use-cases/world-models` that explains how Livepeer serves as infrastructure for real-time AI world models.

The page should position Livepeer as the streaming-native GPU infrastructure layer for interactive, frame-by-frame AI-generated environments.

Use prior transcripts only as inspiration. Do not quote them.

Constraints:

- No em dashes.
- Avoid hype language.
- No direct transcript quotes.
- Keep tone technical, product-forward, credible.
- Match existing livepeer.org layout and design system.
- Use “enables”, “supports”, “designed for” instead of absolute claims.

---

## 1. Discovery Phase

1. Inspect repo structure:
   - Identify framework (Next.js, Astro, etc.)
   - Locate how existing Use Case pages are structured
   - Identify shared components: Hero, Section, Grid, CTA, Layout

2. Review 1–2 existing use case pages:
   - Match section structure
   - Match typography and spacing
   - Mirror CTA patterns
   - Mirror metadata conventions

3. Confirm navigation structure:
   - How use case pages are registered
   - Whether they are linked in nav config
   - How SEO metadata is handled

Do not expose discovery notes in page content.

---

## 2. Route Definition

Create page:

`/use-cases/world-models`

SEO:

- Title: World Models Infrastructure | Livepeer
- Description: Run and stream real-time AI world models with low-latency video infrastructure. Livepeer enables scalable, interactive AI-generated environments.

Add OpenGraph metadata following site convention.

---

## 3. Page Structure

### Section A — Hero

H1:
World Models, Powered by Livepeer

Subhead:
Run interactive, frame-by-frame AI-generated environments with streaming-native GPU infrastructure.

Primary CTA:
Start Building (link to docs or quickstart)

Secondary CTA:
Explore Daydream (link to Daydream product page)

Optional tag line:
Built for real-time AI video workloads

---

### Section B — What Are World Models?

Explain clearly and simply:

World models:

- Generate environments frame-by-frame
- Maintain scene coherence over time
- Respond to camera movement and prompts
- Operate as interactive systems rather than static renders

Short bullet list:

- Interactive prompting
- Camera-aware generation
- Persistent scene state
- Real-time response loops

Keep it concise and technical.

---

### Section C — Why Real-Time Changes Infrastructure

Frame the infrastructure shift.

Explain that world models require:

- Low-latency GPU inference
- Continuous frame generation
- Stable throughput for video streams
- Elastic scaling for concurrency
- Streaming-native input and output

Clarify difference:
Most AI infra optimizes for batch inference and static outputs.
World models behave like live systems.

Key positioning line:
As AI shifts from generating clips to simulating environments, the bottleneck becomes real-time video infrastructure.

---

### Section D — Where Livepeer Fits

Position Livepeer as the infrastructure layer.

Use a grid layout:

| Capability                    | Why It Matters for World Models                    |
| ----------------------------- | -------------------------------------------------- |
| Low-latency video pipeline    | Supports interactive generation loops              |
| Distributed GPU orchestration | Handles frame-by-frame inference at scale          |
| Streaming-native delivery     | Makes model output production-ready                |
| Elastic scaling               | Supports live audiences and concurrency            |
| Open model access tooling     | Enables experimentation with emerging world models |

Mention:

- Daydream as real-time AI video gateway
- Scope for rapid open-source model experimentation
- Builder API for embedding real-time AI video

Keep it grounded and specific.

---

### Section E — Example Applications

Use cards or clean grid.

Include:

1. Virtual Production Previsualization
   Real-time AI environments that respond to camera movement.

2. Immersive Installations and Live Events
   AI visuals reacting to audience input or motion capture.

3. Interactive Streaming Experiences
   Live streams transformed by AI with viewer participation.

4. Game and Environment Prototyping
   Frame-by-frame world simulation for early-stage experimentation.

5. Robotics and Agent Training
   Simulated environments for training agents.

6. Education and Training Simulations
   Scenario-based interactive world generation.

Each card:

- 1 sentence problem
- 1 sentence Livepeer enablement

---

### Section F — Reference Architecture

Add simple diagram section.

Flow:

Inputs:

- Prompts
- Camera tracking
- Motion capture
- Audio signals
- Agent state

↓

Real-Time World Model Inference

↓

Livepeer Infrastructure:

- GPU orchestration
- Encoding
- Real-time streaming
- Audience delivery

↓

Outputs:

- Web player
- LED walls
- Broadcast streams
- Immersive displays

If diagram component exists, reuse it.
If not, implement minimal inline SVG consistent with brand.

---

### Section G — Why Now

Grounded market context:

- Research cycles are compressing
- Real-time world models are advancing quickly
- Open-source innovation is fragmented
- Builders need infrastructure to experiment and deploy quickly

Position Livepeer as:
A neutral infrastructure layer that makes emerging real-time world models accessible and deployable.

Avoid hype. Keep it measured.

---

### Section H — Final CTA

Title:
Build World Model Experiences on Livepeer

Buttons:

- View Docs
- Talk to the Team
- Join Builder Program (if page exists)

---

## 4. Implementation Steps

1. Create new page file under correct route.
2. Use existing layout wrapper for marketing pages.
3. Build sections using shared components.
4. Add metadata.
5. Wire CTAs correctly.
6. Add page to use case index or nav if required.
7. QA mobile layout.
8. Verify no em dashes.
9. Lint and typecheck.

---

## 5. Tone Requirements

- Clear and technical.
- Avoid buzzwords.
- Avoid exaggerated claims.
- Do not over-reference research names.
- Do not sound like a research paper.
- Do not sound like a creative agency.
- Focus on infrastructure strength.

Terminology to use consistently:

- Real-time AI video
- World models
- Interactive generation
- Low latency
- Streaming-native infrastructure

---

## 6. Acceptance Checklist

- [ ] Page renders at `/use-cases/world-models`
- [ ] Matches existing use case styling
- [ ] All sections implemented
- [ ] No em dashes
- [ ] No transcript quotes
- [ ] Links valid
- [ ] Mobile responsive
- [ ] Build passes

---

## 7. Suggested Commit Message

feat(site): add world models use case page
