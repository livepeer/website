---
name: Daydream
url: https://daydream.live
description: Live sample generation for your DAW — create original, royalty-free samples in real time from your own audio.
categories:
  - Music
  - Generative
  - API
logo: daydream.svg
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

Daydream generates original audio samples in real time, from sound you already have. Feed **DreamSampler** a riff, a vocal, or a field recording and it produces new royalty-free material with synth-style control — chop it, perform it, and drop it into a track without touching a sample library or clearing rights.

The distinction it draws is against batch-mode tools: rather than writing a prompt and waiting for a render, you move a control and hear the result in roughly 81ms. The model responds to a performance instead of replacing it.

## What you can build

- **Original samples and stems** — generate new material from your own audio rather than splitting what is already there
- **Performed, not prompted** — map the model's latent space to faders, knobs, and MIDI hardware, with control propagating at 25Hz
- **Sessions inside a DAW** — a native VST3 plugin automates generation curves from standard envelope lanes and macro knobs
- **Agentic and generative workflows** — an MCP server and API expose every parameter for programmatic control

## Developer surface

- **DEMON** — the diffusion-native audio engine behind every Daydream instrument, open source and self-hostable, with sub-100ms parameter latency on a single consumer GPU
- **Supported models** — ACE-Step v1.5 (2B turbo and 5B XL turbo) today, with Stable Audio 3.0 and Magenta RT2 announced
- **Runs anywhere** — a browser app needing no install or GPU, a VST3 plugin, and a TouchDesigner operator, all on hosted infrastructure
- **Scope** — Daydream's real-time video project, also open source, for running generation from any source locally or in the cloud

## Powered by Livepeer

Daydream's hosted inference is powered by Livepeer's GPU network. Workloads are routed to independent orchestrators, giving builders elastic, cost-efficient real-time inference without a centralized provider.
