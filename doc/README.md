# Livepeer Runtime & Developer Interface — Design Docs

Design documents for the Livepeer runtime and developer interface: how providers author AI pipelines, how orchestrators execute them safely, and how developers discover and use them through Studio.

## Component map

The Livepeer stack splits into four components covered by the docs here:

```
  Provider writes Pipeline class in Python
                 │
                 │ livepeer push
                 ▼
  ┌──────────────────────────┐         Studio auto-generates:
  │   Pipeline SDK            │ ──────▶ • catalog entry
  │   (runner/ module)        │ schema  • playground form/live UI
  │                           │         • API docs + snippets
  │   Produces: container,    │
  │   JSON schema, manifest   │
  └──────────────┬────────────┘
                 │ capability registration
                 ▼
  ┌──────────────────────────┐         Developer hits Studio /run/:
  │   Orchestrator Runtime    │ ◀────── Studio → Gateway → Orchestrator
  │                           │
  │   • GPU tier filtering    │
  │   • runc / gVisor / Kata  │
  │   • Worker properties     │
  │   • BYOC image policy     │
  │                           │
  │   Runs: the container     │
  └───────────────────────────┘
```

## Documents

- **[runtime.md](./runtime.md)** — Orchestrator-side runtime. GPU tier classification, worker property filtering, container isolation (runc/gVisor/Kata/CC), BYOC custom containers, image policy, hardware attestation roadmap.
- **[pipeline-sdk.md](./pipeline-sdk.md)** — Developer-facing SDK reference. Pipeline / StreamPipeline classes, `Input()` / `Output()` descriptors, CLI (`livepeer push/predict/serve/schema/prepare`), health & registry endpoints, schema generation.
- **[pipeline-sdk-architecture.md](./pipeline-sdk-architecture.md)** — SDK architecture decision record. Why classes over decorators, why `Input()` over Pydantic, protocol auto-selection, multi-modal streaming; competitive analysis; BYOC contract alignment with go-livepeer.
- **[studio.md](./studio.md)** — Developer portal. Catalog, playground, API keys, billing, provider onboarding, auth architecture (Clerk + OAuth + HMAC), SDK→Studio integration, live WebRTC playground.

## Archive

Pre-consolidation source documents are preserved in [`archive/`](./archive/) for provenance. They should not be edited — all updates go to the canonical docs above.
