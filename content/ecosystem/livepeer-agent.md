---
name: Livepeer Agent
url: https://livepeer.org/agent
description: Connect your agent over MCP and reach image, video, audio, 3D, editing, and production tools across the Livepeer network.
categories:
  - Agents
  - API
  - AI Video
# The mark is a single ink, so it flips with the theme rather than sitting on
# a fixed plate: black here, inverted to white under .dark. That keeps it on
# the same neutral tile as every other entry, which is theme-aware, instead of
# a hard-coded colour that is right in one theme and wrong in the other.
logo: livepeer-agent.svg
logoMonochrome: true
order: 5
madeBy: Livepeer Foundation
madeByUrl: https://livepeer.org/foundation
twitter: https://x.com/Livepeer
github: https://github.com/livepeer
docs: https://docs.livepeer.org/v1/ai/builders/get-started
support: https://livepeer.org/discord
---

## Overview

Livepeer Agent is the network's own agent surface: one MCP server that gives any
agent harness the ability to generate, edit, and finish moving image and audio.
Point your agent's connector settings at `https://agent.livepeer.org/api/mcp`
and the tools appear alongside whatever else it already has. The first
connection opens a browser and signs you in.

It is aimed at people who are already working in an agent — in an editor, a
chat harness, or their own product — rather than at a separate web app to switch
into. The network answers on the other side with models, compute, and a growing
library of production skills, so the agent gains capabilities instead of the
user gaining another tab.

## What you can build

- **Generation across media** — image, video, audio, and 3D from a single connector, without wiring up a model provider per modality
- **Editing and finishing** — background removal, colour grading, overlays, subtitle burn-in, concatenation, and muxing, exposed as tools the agent can call in sequence
- **Playbooks** — production-ready multi-step workflows that run in the Agent Console rather than being reassembled from scratch each time
- **Agent capabilities in your own product** — point an app you already ship at the same server and it gains the same image and video workflows

## Developer surface

- **How it runs** — a hosted MCP server; add the URL to any agent harness that speaks the protocol, no SDK to install
- **What ships with it** — hundreds of capabilities spanning generation, editing, rendering, CAD, and speech, all callable as MCP tools
- **How to extend it** — the same connector embeds the workflows in your own product, and a playbook library packages repeatable multi-step jobs

## Powered by Livepeer

Every job routes to the open network of independent compute providers rather
than a single vendor's cluster. That is what lets one connector cover this much
surface area: capabilities are contributed and served by orchestrators across
the network, so the tool list grows without the agent needing a new integration
each time.
