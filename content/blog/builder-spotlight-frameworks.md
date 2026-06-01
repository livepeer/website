---
title: "Built from Inside the Stack"
description: "Building on Open Compute: Marco van Dijk, Founder of FrameWorks"
date: "2026-05-29"
category: "Ecosystem"
tags: ["builder-spotlight", "frameworks", "SPE", "live-streaming"]
image: "/images/blog/builder-spotlight-frameworks.svg"
imageAlt: "FrameWorks - Builder Spotlight"
draft: false
---

Livepeer has had no shortage of builders over its nine-year history. Far fewer have worked on its core infrastructure from the inside, run a top-ranked orchestrator node on the supply side, and then founded a platform to succeed one of its flagship applications. Marco van Dijk has done all three.

![Marco van Dijk's timeline with Livepeer](/images/blog/builder-spotlight-frameworks/01_timeline.png)

Marco is a video streaming engineer and founder based in the Netherlands. His fingerprints are found across the Livepeer stack: in the media infrastructure that powered Studio, on the supply side as an independent GPU orchestrator, and now in **FrameWorks**, the next-generation live video platform built on Livepeer's open GPU network.

Marco has been building on Livepeer for five years. He arrived with an outsider's perspective on the network's capacity limits and a clear view of its potential to deliver a world-class streaming experience.

![Marco's contributions across the Livepeer stack](/images/blog/builder-spotlight-frameworks/02_stack.png)

## Skin in the game

Through his work with MistServer, an open source media toolkit, he contributed the backbone of Livepeer's original flagship product, Livepeer Studio. He built the ingest, real-time audio transcoding, protocol translation, transmuxing, VOD, and delivery capabilities that made up the lion's share of Studio's end-to-end live streaming infrastructure.

> "My work was already entangled with Livepeer through MistServer and the way I came to fully understand the protocol was by running it myself."

Marco soon came to understand Livepeer not just as a developer building on top of it, but as an operator with economic skin in the game. He spun up an orchestrator node, and what began as a way to learn how the pieces fit together quickly became something more serious: a top-ranked position, one of the largest independent stakes, and a community as passionate about tech and streaming as Marco was.

> "In December 2021 I brought a node online, mostly to learn how the supply side actually worked. It started as a way to learn. It did not stay that way. The first transcoding rewards rolled in and I came into contact with the community properly for the first time. I was overwhelmed by both their extreme hospitality and passion for discussing the tech. Pretty soon, I was hooked."

![Marco quote](/images/blog/builder-spotlight-frameworks/03_quote.png)

## Inspiration strikes

Marco's time working on the early network gave him a powerful combination of deep technical insight and the high-agency approach that only a founder-builder brings to complex advances like Livepeer's low-latency open compute stack. Not content with shaping Studio and running an orchestrator node, Marco started building a full media pipeline in 2023 to put himself in the position of a new broadcaster.

This experiment saw him wade deeper into the swirling waters of streaming at production scale, grappling with transcoding audio in real-time, transmuxing content between container formats and load-balancing across regions. These were productive years for Marco, during which he shipped a browser-based broadcast studio, network tooling, dashboards, orchestrator documentation, and **added text-to-video, picture-to-picture, and image-to-video to Livepeer's then-nascent AI capabilities.**

That's when the first seeds of FrameWorks came into being. The idea took shape in early 2025: **a fully self-contained, vertically integrated live video stack built on Livepeer, one that could handle ingest, transcoding, and delivery end-to-end, with Livepeer's open GPU network doing the heavy lifting.** A platform that realized the original Livepeer vision of open video infrastructure, from the encoder to the viewer's screen.

By February 2025, the proposal was [live on the Livepeer forum](https://forum.livepeer.org/t/pre-proposal-livepeer-frameworks-spe-pilot-phase/2773), and it soon received the community's endorsement. The build was underway.

![FrameWorks key capabilities](/images/blog/builder-spotlight-frameworks/04_keys.png)

## The convergence

Over a year down the line and Marco has built a brand new dev-focused live streaming and video platform on Livepeer, bringing a developer toolkit, embeddable players, a GraphQL API and full documentation making building streaming applications easy.

The platform also contains multi-framework player packages and embeddable video players for React, Svelte, Web Components and vanilla JavaScript, so video developers can drop FrameWorks playback into the stack they're already using.

Marco's half decade of building on Livepeer have shown how his deep knowledge of media and streaming can be implemented across the platform. FrameWorks is where that long stretch of work converges into a single platform a developer can pick up and build on.
