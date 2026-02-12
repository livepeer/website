# Livepeer.org Website Redesign Brief

## Project Overview

Build a production-ready marketing website for Livepeer.org. This is a full redesign, not a refresh. The current site does not meet the standard Livepeer should be setting in terms of design execution, messaging clarity, or brand expression. The goal is a site that immediately communicates what Livepeer is, looks world-class, and positions Livepeer as the serious infrastructure layer it is.

---

## Brand Positioning

**What Livepeer is:** Livepeer is the world's open video infrastructure. It is a decentralized network of GPU operators (orchestrators) that performs video transcoding, distribution, and AI video processing at scale, at dramatically lower cost than centralized alternatives.

**The product is the network itself.** Livepeer is not Daydream, not Livepeer Studio, not Streamplace. Those are applications built *on top of* the Livepeer network. The website must make this distinction crystal clear. The network is the product.

**Core value proposition:** High-speed, ultra cost-efficient video transcoding and AI video processing, powered by a decentralized global network of GPU operators. Developers and platforms plug into Livepeer's network to power their video experiences without building expensive infrastructure from scratch.

**Positioning statement:** Livepeer is the open video infrastructure layer that every social platform, content platform, and video-enabled application can build upon.

**Strategic context:** Livepeer is positioning itself as the universal video infrastructure solution for open, programmable social networks (Farcaster, AT Protocol, Nostr) and beyond. The site should reflect this ambition without being overly niche.

---

## Target Audiences (ranked by priority)

1. **Developers and builders** building video-enabled applications who need transcoding, livestreaming, or AI video capabilities. They want clear docs, quick integration, and cost savings.
2. **Protocols and platforms** (open social networks, streaming services, content platforms) evaluating Livepeer as infrastructure. They want credibility, scale proof, and technical depth.
3. **Node operators / orchestrators** who want to run infrastructure on the network and earn fees.
4. **Token holders / delegators** who stake LPT and participate in governance.
5. **General crypto/web3 community** interested in the ecosystem.

---

## Brand Identity

**CRITICAL: The Livepeer brand identity was created by Holographic Agency. All visual identity decisions (colors, typography, logo usage, color theory, iconography) must strictly follow the existing Holographic brand guidelines.** These guidelines exist but have never been properly rolled out or leveraged on the website. This redesign should be the first proper execution of these brand guidelines.

Do NOT pull colors, fonts, or brand elements from the layout inspiration sites listed below. Those sites are referenced ONLY for layout, UX patterns, interactions, and overall website aesthetic.

**Design quality bar:** The current site and recent redesign attempts have felt junior in execution (poor color application, stock imagery, raster assets instead of clean SVGs). This site must feel senior, polished, and intentional. Every design decision should feel considered. Think: clean SVG illustrations/graphics, thoughtful use of whitespace, considered color application per the brand guidelines, sophisticated typography hierarchy.

---

## Layout & Aesthetic Inspiration

The following sites should be referenced ONLY for structural and experiential decisions: layout patterns, navigation styles, hero section treatments, scroll interactions, content pacing, visual rhythm, section transitions, and overall website feel. Do NOT pull brand identity elements (colors, fonts, etc.) from these sites.

**[INSERT YOUR INSPIRATION SITES HERE]**

For each site, note what specifically to reference:
- Site A: [what you admire — e.g. "hero section energy," "navigation interaction," "how they pace content sections"]
- Site B: [what you admire]
- Site C: [what you admire]

*(Adam: Replace this section with your actual inspiration sites and specific callouts before passing to Claude Code.)*

---

## Site Structure

### Primary Navigation
- **Home**
- **Network** (the product)
- **Developers** (dev hub, docs, SDKs, grants)
- **LPT** (token, staking, delegation)
- **Community** (governance, events, ecosystem)
- **Blog/Updates**

### Homepage Sections (in order)

1. **Hero:** A clear, compelling headline that communicates what Livepeer is in one sentence. Not abstract, not buzzwordy. Something a smart person outside crypto could understand. Subheadline reinforces the value prop. Primary CTA: "Start Building" (links to dev docs). Secondary CTA: "Explore the Network."

2. **What is Livepeer (immediately below hero):** A concise, plain-language explanation of what Livepeer is and what problem it solves. This was missing from the current site and previous redesign. It must be here. 2-3 sentences max, possibly with a simple visual/diagram showing how the network works (apps → gateways → orchestrators → output).

3. **Network capabilities:** Showcase what the network can do: video transcoding, livestreaming, AI video processing (real-time AI video generation, video understanding, communication AI). Use clean iconography or illustrations, not stock photos.

4. **Why Livepeer / Key differentiators:** Cost efficiency (up to 50x reduction vs centralized), decentralized reliability (no single point of failure), scalability (elastic to demand), open infrastructure (permissionless, censorship-resistant).

5. **Built on Livepeer:** Showcase applications built on the network (Daydream, Streamplace, Livepeer Studio, and ecosystem apps). Frame these clearly as products built ON the network, not Livepeer products. This reinforces the network-as-product narrative.

6. **Network stats / social proof:** Live or near-live network statistics (orchestrators, stake, minutes transcoded, etc.). This builds credibility and shows the network is real and active.

7. **Developer CTA section:** Clear path to start building. Link to docs, SDKs, grants program, accelerator.

8. **Community / Governance:** Brief section on the community, governance participation, upcoming events. Link to community hub.

9. **Footer:** Standard footer with nav links, social links (Discord, Twitter/X, GitHub, Forum), newsletter signup.

### Network Page
Deep dive into how the network works. Visual diagram of the protocol architecture (apps → gateways → orchestrators → delegators). Explain the roles clearly. Link to the Network Explorer.

### Developer Hub Page
- Getting started guide links
- SDK documentation links
- AI video pipeline documentation
- Grants and accelerator programs
- Example use cases / integrations

### LPT Page
- What LPT is and its role in the network
- How staking/delegation works
- Where to acquire LPT
- Link to staking providers
- Link to governance

### Community Page
- Governance proposals and participation
- Events calendar
- Ecosystem projects
- Bounties and contribution opportunities
- Social links

---

## Technical Stack

- **Next.js 14+ with App Router**
- **TypeScript**
- **Tailwind CSS** for styling
- **Framer Motion** for animations and interactions
- **Responsive, mobile-first design**
- Deploy-ready for Vercel

---

## Design Principles

1. **Clarity over cleverness:** Every section should communicate its point immediately. No abstract hero sections that require scrolling to understand what the product is.
2. **The network is the product:** The site architecture and messaging must reinforce that the Livepeer network itself is the product. Applications built on it are showcased as ecosystem proof, not as the product.
3. **Senior execution:** No stock photography. Clean SVG graphics and illustrations. Thoughtful whitespace. Considered typography hierarchy. Sophisticated color application per brand guidelines.
4. **Progressive disclosure:** Lead with simple, clear messaging. Let users drill deeper into technical detail on subpages.
5. **Performance:** Lighthouse score >90. Fast load times (<2s FCP). Optimized assets.
6. **Accessible:** WCAG AA compliant.

---

## Content & Copy Guidelines

- **Voice:** Confident, technical but accessible, no-nonsense. Not hype-driven. Not "web3 bro" tone.
- **Avoid:** "Revolutionary," "game-changing," and similar empty superlatives. Avoid jargon without explanation.
- **Do:** Lead with what the network does and why it matters. Use concrete numbers where possible. Explain technical concepts simply on first reference.
- **Placeholder copy:** Where final copy isn't provided, write thoughtful placeholder content that follows the brand voice. Do not use lorem ipsum.

---

## Key CTAs

1. **Start Building** → Developer docs
2. **Explore the Network** → Network Explorer
3. **Run a Node** → Orchestrator setup guide
4. **Stake LPT** → Delegation/staking page
5. **Join the Community** → Discord

---

## Acceptance Criteria

- Fully responsive across all breakpoints (mobile, tablet, desktop)
- Smooth page transitions and micro-interactions (subtle, purposeful, not gratuitous)
- Accessible (WCAG AA)
- Fast load times (<2s FCP)
- Lighthouse performance score >90
- Clean, semantic HTML
- All images/graphics as SVG where possible
- No stock photography
- Follows Holographic brand guidelines for all visual identity decisions
- Clear "what is Livepeer" explanation visible on homepage without scrolling past the fold
- Network-as-product narrative is clear throughout

---

## What Success Looks Like

A visitor landing on Livepeer.org for the first time should be able to:
1. Understand what Livepeer is within 5 seconds
2. Understand who it's for within 10 seconds
3. Find their way to the right next step (build, stake, run a node, learn more) within 15 seconds
4. Walk away feeling that Livepeer is a serious, world-class infrastructure project — not a scrappy crypto startup

---

## Notes for Claude Code

- Prioritize visual polish and professional execution above all else.
- When in doubt about a design decision, choose the more restrained, sophisticated option.
- Use the Holographic brand guidelines as the single source of truth for all visual identity decisions. Reference them before making any color, typography, or brand element choices.
- The inspiration sites provided are for layout, interaction, and structural reference ONLY.
- Build this as a complete, deployable site. Every page should feel finished, not templated.
- After first pass, Adam will review and provide a detailed feedback doc for iteration.
