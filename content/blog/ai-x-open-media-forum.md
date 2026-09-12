---
title: "AI x Open Media Forum: Building New Wave Creativity"
description: "Artists, technologists, and researchers gathered at Devconnect Buenos Aires to explore how real-time AI is reshaping media production, distribution, and creative economies."
date: "2025-12-29"
category: "Community"
tags: ["events", "ai", "open-media", "creativity", "devconnect"]
image: "https://cdn.sanity.io/images/l36s876e/production/4a527a2ef16f7ef5aed60fc3a87cfe31f67844e8-1456x816.png?fm=webp&q=82"
imageAlt: "People gathering in a bright green-lit workspace"
draft: false
---

The AI x Open Media Forum, hosted by the Livepeer Foundation and Refraction during Devconnect Buenos Aires, brought together artists, technologists, curators, protocol designers, founders and researchers at a moment when media is being reshaped at its foundations. Real-time AI has moved from experimental edges into active use, influencing how creative work is made, how it circulates, how it is authenticated and how value flows through entire ecosystems.

The Forum was designed as a symposium rather than a conventional conference. Instead of panels, participants sat together in tightly focused groups, comparing lived experience with emerging technical capabilities and identifying where the next wave of open media infrastructure must come from. The premise was simple:

> If AI is rewriting the conditions of cultural production, the people building the tools and the people using them need to be in the same room.

Across the day, it became clear that AI has begun to reconfigure creative labour. Participants described shifts in authorship, changes in access to tools and compute and growing pressure to navigate accelerated production cycles. The discussions documented in this report trace how these changes are being felt on the ground and outline the early primitives that may support an open, verifiable and creatively expansive media ecosystem.

## I. Methodology and framing questions for the forum

The Forum opened with a set of framing questions that clarified the core pressures at the intersection of AI and culture. They were selected because they touch the foundations of creative practice, technical design and the incentives that organise contemporary media systems. These questions served as a shared structure for the day, guiding both creative and technical groups toward the points where their worlds intersect most directly.

![](/images/blog/ai-x-open-media-forum/questions.png)

These questions created a common orientation for participants with very different backgrounds. Artists used them to describe how these pressures appear in their work. Technologists used them to identify where current systems break and where new primitives might be possible. The result was a focused dialogue in which creative insight and technical reasoning informed one another. As the day progressed, these initial questions became more specific, grounded in concrete examples and shaped by the experiences of the people who are building and creating with AI right now.

## II. Creative track: New wave creativity in the age of AI

The creative discussions opened a clear window into how AI is reshaping cultural practice. Artists, designers and musicians described shifts they are already living through: changes in authorship, new pressures around speed, and the expanding role of computation in what can be made and shared. Their experiences formed the human foundation for understanding the technical challenges that surfaced later in the day.

### 1. The persistence of authorship and the idea of "code"

One of the most important contributions came a Venezuelan 3D artist artist who articulated how personal history and cultural memory form a kind of creative signature. They described this as their "code": a composite of experience, environment and emotional texture that cannot be reduced to visual style alone.

![](/images/blog/ai-x-open-media-forum/franco.jpg)

_Argentine Daydream ambassador Franco presents his work_

"My code is my personal language, shaped by the places I come from," they explained. "I photograph the decadence of Venezuela and turn it into something romantic. AI can remix it, but it cannot replace where I'm from."

This idea resonated widely across the room. Participants recognised that while AI can convincingly emulate aesthetics, it cannot reconstruct lived experience. The concern is not simply stylistic mimicry; it is the potential erosion of the cultural grounding that gives creative work its meaning.

Serpentine Gallery curator Alice Scope added context from contemporary art: "Some artists will use these tools to push aesthetic extremes. Others will return to minimalism. That tension has always driven art history." The consensus was that AI is entering a lineage of tools that have historically reshaped creative practice, but its scale introduces new stakes around identity and authorship.

### 2. Compute access as a determinant of creative possibility

A structural insight emerged as creators discussed their workflows: access to compute is not evenly distributed. Several participants from Latin America and other regions described how GPU scarcity and cost have become the limiting factor in pursuing their practice.

> One participant underscored the issue: "I couldn't do what I do without Daydream. GPUs are too expensive here. This is the only way I can work at the level I want."

This was not framed as a complaint but as a recognition that compute access is now a primary determinant of who can participate in emerging creative forms. It became clear that compute, not talent or tools, is increasingly the gatekeeper of participation. This topic resurfaced repeatedly across both tracks and became one of the keystones of the entire Forum.

### 3. Discovery systems and the changing behaviour of audiences

Creators then turned to the challenge of reaching audiences. Traditional distribution remains shaped by opaque algorithms and engagement-driven incentives, often misaligned with the values and intentions of artists.

Almond Hernandez from Base described the dilemma: "If you remove algorithms entirely, you place the burden of discovery back on users. But if you keep them, they can distort culture. We need ways for people to shape their own feeds."

This tension produced no single consensus, but it clarified a shared frustration: discovery should not force creators into optimising for platform dynamics. Instead, systems must emerge where identity, provenance and community input meaningfully influence what is surfaced.

Friends With Benefits CEO Greg Breznitz articulated the broader implication: "Culture and technology cannot be separated anymore. What gets rewarded changes the art that gets made." The group recognised that discovery systems are not neutral and actively shape the evolution of cultural forms.

### 4. How AI is reshaping the creative process from the inside

![](/images/blog/ai-x-open-media-forum/malcolm-alice.jpg)

_Refraction founder Malcolm Levy and Serpentine Gallery curator Alice Scope_

Perhaps the most nuanced discussion centred on how AI alters creative labour. Participants avoided easy dichotomies of "AI as threat" versus "AI as tool." Instead, they articulated a more layered understanding: AI accelerates exploration but also compresses the time available for deeper creative development.

Franco noted that the pressure to produce quickly "can corrupt the process," a sentiment echoed by musicians and digital artists who described being pulled toward workflows optimised for speed, not refinement.

A music platform founder contextualised this through the lens of distribution: "Platforms can train bots to listen to the AI music they create, just to farm plays." This raised concerns about synthetic ecosystems that siphon attention away from human artists.

Yet the group also acknowledged that AI unlocks new capacities. It lowers technical barriers, enabling more people to express ideas without specialised training. For many, it expands the field of imagination.

Malcolm Levy of Refraction offered a framing rooted in art history: "Every movement in art is shaped by the tools of its time. Digital art was marginal until suddenly it wasn't. AI will be the same. What matters is who shapes it."

Across this discussion, an essential truth emerged: AI does not eliminate creativity. It redistributes the labour involved, elevates the importance of intention and shifts the points at which authorship is asserted.

## III. Technical track: Shaping the infrastructure for trust, agency and scale

![](/images/blog/ai-x-open-media-forum/technical-track.jpg)

While the Creative Track articulated what must be protected and what must remain possible, the Technical Track explored how to design systems that support those needs.

### 1. Provenance as foundational infrastructure

The technical discussion on provenance opened with a recognition that no single method can guarantee trust in an AI-saturated media environment. Participants approached provenance as an infrastructure layer that must operate across the entire lifecycle of media creation. They examined device-level capture signals, cryptographic attestations, model watermarking, social proof, dataset lineage and content signatures, emphasising that each approach addresses a different vector of uncertainty.

The importance of this layered approach became clear through the most grounded example offered during the session. A team building a voice-data contribution platform described their experience collecting human audio samples. Even after implementing voice-signature checks and running deepfake detectors, they found that "about ten percent of the data was actually faked." Contributors were training small voice models on their own samples and then using those models to fake additional submissions. "Validation needs human listeners, model detection and economic incentives working together," they explained. It illustrated a key point: provenance is a dynamic adversarial problem and must be treated as such.

This example shifted the discussion from idealised architectures to applied constraints. Participants concluded that provenance must be multi-layered, adversarially robust and economically grounded. A validator network that incorporates human judgment, machine detection and stake-based incentives was seen as a promising direction, not because it solves provenance outright but because it distributes trust across diverse mechanisms rather than centralising it in a single authority or detector. In a digital landscape stricken with antiquated copyright frameworks that hinder both the creation, dissemination and remuneration of artistic works, a multi-nodal, human-centric approach to provenance feels refreshing, urgent and necessary.

The discussion also connected provenance to discovery and reputation. If identity and content lineage can be verified at creation time, those signals can later inform how media is surfaced, filtered or contextualised. Provenance, in this framing, is not only about defending against deepfakes but about enabling a more trustworthy environment for cultural production, circulation and monetisation.

### 2. Infrastructure for global creativity: compute, identity and discovery as interdependent primitives

Over the course of the day, participants identified a pattern: compute, provenance and discovery are not separate concerns. They form an interdependent system that determines:

![](/images/blog/ai-x-open-media-forum/livepeer-asset.webp)

Compute inequality emerged again as a core issue. Without access to real-time inference, creators are excluded from participating in emerging media forms. Provenance systems ensure that outputs can be trusted, and discovery mechanisms determine whether meaningful work reaches an audience.

This preceded a rich conversation about discovery architecture. What if users could port their data across platforms to surface relevant content, instead of the platforms selling this data back to users?

Participants explored how portable identity, content signatures, verifiable histories and community-shaped surfacing could form a new discovery layer that operates independently of platform-level ranking algorithms. In this model, discovery becomes a protocol rather than a product: a configurable, interoperable layer where authorship, reputation and provenance act as first-class signals.

Building open media requires a tightly interwoven stack. Compute enables creation; provenance secures identity and authorship; discovery amplifies credible work in ways that reflect the values of specific communities rather than a single optimisation function.

Treating these components as independent problems would reproduce the failures of existing platforms. Treating them as interdependent primitives opens the possibility for a healthier and more diverse media ecosystem.

## IV. Synthesis

When the creative and Technical tracks were read side by side, several coherent themes emerged.

![](/images/blog/ai-x-open-media-forum/synthesis-flowchart.png)

## VI. Conclusion

The Forum made clear that the future of media will depend on coordination between creative and technical communities.

Artists articulated what must be preserved: identity, context, agency and the integrity of the creative process. Technologists outlined the systems that can support those needs at scale.

This event functioned as a working laboratory. The insights surfaced here will inform follow-up research, prototypes and collaborative development. Livepeer and Refraction will continue publishing materials from the Forum and supporting teams exploring these early ideas.

Open media will not emerge from a single protocol or organisation, but from a community building the foundation together.

![](/images/blog/ai-x-open-media-forum/refraction.jpeg)
