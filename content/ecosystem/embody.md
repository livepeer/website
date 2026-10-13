---
name: Embody
url: https://embody.zone
description: Open-source network for embodied AI avatars — real-time tutoring, telepresence, and on-demand branded content.
categories:
  - AI Video
  - Agents
logo: embody.svg
order: 7
madeBy: DeFine
twitter:
github: https://github.com/its-DeFine
contact:
docs:
support:
terms:
privacy:
---

## Overview

Embody is an open-source network for embodied AI avatars. It provides real-time agent avatars for tutoring, telepresence, and branded content — built so developers can drop expressive, low-latency characters into learning platforms, agent products, and live experiences without building the underlying video pipeline themselves.

## What you can build

- **Real-time AI tutors and tutoring platforms** — embodied agents that see, listen, and respond in live conversations
- **Telepresence experiences** — agent avatars that represent humans or AI personalities in real time
- **Branded on-demand avatars** — personalized characters for marketing, customer experience, and education
- **Custom agent integrations** — drop avatars into your own product instead of building the rendering and inference stack from scratch

## Developer surface

- **Hosted product** — try avatars directly at [embody.zone](https://embody.zone) without writing any integration code
- **Multiple rendering backends** — implementation packages for **Unreal Engine**, **Live2D**, and **Three.js**
- **Open-source pipeline** — extend or fork the core network for your own avatar workloads

## Powered by Livepeer

Embody runs on Livepeer's GPU infrastructure as a Special Purpose Entity (SPE), using the Agent SPE pipeline to generate real-time agent avatars. Workloads are routed across Livepeer orchestrators, giving builders elastic real-time inference for character rendering and agent video without standing up their own GPU fleet.
