---
name: Daydream
url: https://daydream.live
description: Open-source, local-first platform for running real-time interactive generative AI video pipelines.
categories:
  - AI Video
  - Generative
  - API
logo: /ecosystem/daydream.svg
order: 1
madeBy: Livepeer Inc
twitter: https://x.com/DaydreamLiveAI
github: https://github.com/daydreamlive/scope
contact: hello@daydream.live
docs: https://docs.daydream.live/
support: https://discord.com/invite/mnfGR4Fjhp
terms: https://daydream.live/terms
privacy: https://daydream.live/privacy-policy
---

## Overview

Daydream is an open-source, local-first platform for real-time generative AI video. Its flagship project, **Daydream Scope**, runs autoregressive video diffusion models on your own GPU — or in the cloud — and exposes a node-based workflow for composing live, interactive pipelines from text, video, and live camera inputs.

It's built for developers and creative technologists who want continuous, real-time AI video instead of asynchronous batch generation.

## What you can build

- **Real-time generative video pipelines** — compose text-to-video, video-to-video, and live camera workflows from a node-based graph
- **Interactive installations and live visuals** — drive output reactively with audio, MIDI, OSC, or DMX
- **Custom nodes and models** — extend Scope with your own pipelines, LoRAs, and inference logic in Python
- **Tooling integrations** — share output to TouchDesigner, OBS, Resolume, Unity, Ableton Live, and other creative tools via Spout, Syphon, and NDI

## Developer surface

- **Self-hosted runtime** — Scope runs locally as a server on `localhost:8000` with a WebRTC-based API for programmatic, low-latency control
- **Bundled diffusion models** — ships with StreamDiffusion V2, LongLive, Krea Realtime, RewardForcing, and MemFlow
- **Open-source Python codebase** — fork it, build custom nodes, contribute pipelines back upstream
- **Cloud inference** — run pipelines on remote GPUs when local hardware isn't available

## Powered by Livepeer

Daydream's cloud inference is powered by Livepeer's GPU network. Workloads are routed to independent orchestrators, giving builders elastic, cost-efficient real-time video inference without a centralized provider.
