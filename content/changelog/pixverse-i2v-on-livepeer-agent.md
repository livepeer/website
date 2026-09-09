---
title: Image-to-video with pixverse-i2v on Livepeer Agent
summary: Turn a still into a short clip from any agent runtime. pixverse-i2v takes a source image and a prompt and returns up to eight seconds of video, priced per second of output and metered like every other capability.
date: "2026-08-20"
---

Call it as `run_capability` with `capability: "pixverse-i2v"`, a `prompt`, a
public `source_url` for the still, and `inputs.duration` in seconds.
`describe_capability` returns the current price, the measured p50 and p95
render times, and the success rate over the last thirty days, so an agent can
size its timeout and its budget before it runs.

The clip comes back as a URL the agent can hand on or chain into the next
capability.
