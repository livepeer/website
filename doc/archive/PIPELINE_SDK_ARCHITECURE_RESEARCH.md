# Pipeline SDK Architecture Decision Record

This document explains the architectural decisions behind the Livepeer Pipeline
SDK, including competitive analysis, trade-offs considered, and rationale for
each choice.

## Problem Statement

Deploying AI capabilities to the Livepeer network currently demands extensive
manual work: custom Docker containers, trickle protocol configuration,
orchestrator coordination, frontend development, and comprehensive
documentation. This process is inaccessible to most AI developers.

Competing platforms (Replicate, Modal, Chutes, fal.ai) have simplified
deployment to a single command. Livepeer needs the same developer experience
while supporting workloads these platforms don't: real-time video/audio
streaming over its decentralized network.

## Competitive Landscape

### How others do it

| Platform | Pattern | Input Typing | Streaming | GPU Spec | Deploy |
|----------|---------|-------------|-----------|----------|--------|
| **Replicate (Cog)** | Class + `Input()` | `Input(ge=, le=, choices=)` on predict() | `ConcatenateIterator[str]` (yield tokens) | `cog.yaml: gpu: true` | `cog push` |
| **Modal** | Class + decorators | Python type hints | FastAPI `StreamingResponse` | `@app.cls(gpu="A100")` | `modal deploy` |
| **Chutes** | FastAPI subclass + `@cord()` | Pydantic `BaseModel` | `Cord(stream=True)` | `NodeSelector(min_vram_gb=80)` | `chutes deploy` |
| **Livepeer AI Runner** | ABC class + FastAPI router | Pydantic `BaseModel` | Trickle (video frames) | env var + Docker image | Container per pipeline |
| **Scope (Daydream)** | ABC class + `__call__` | Pydantic `BasePipelineConfig` | Trickle + WebRTC | `estimated_vram_gb` ClassVar | `daydream-scope` CLI |
| **Our SDK** | Class + `Input()` | `Input(ge=, le=, choices=)` on predict() | SSE (generators) + Trickle (frames) | `gpu = "A100"` class attr | `livepeer push` |

### Key observations

1. **Replicate is the developer experience benchmark.** Most AI developers
   have used Cog. Our `Input()` pattern is intentionally near-identical.

2. **Modal and Chutes use decorators** for serverless functions. But when GPU
   models are involved, even Modal uses classes (`@app.cls`) because models
   are inherently stateful.

3. **Both Livepeer-native projects (AI Runner, Scope) use Pydantic** for
   parameter validation internally. However, these are infrastructure
   projects, not developer-facing SDKs. The developer-facing platforms
   (Replicate, Modal, Chutes) use lighter patterns.

4. **No competing platform handles real-time video streaming** as a first-class
   primitive. This is Livepeer's differentiator.

## Decision: Class-Based with `Input()` Descriptors

### Why classes, not decorators

| Consideration | Classes | Decorators |
|---------------|---------|------------|
| Stateful lifecycle (load weights once, predict many) | Natural — `self` holds state | Requires globals or closures |
| Multiple methods (setup, predict, on_frame, on_params_update) | Natural | Scattered across multiple decorators |
| Resource declarations | Class attributes | Decorator arguments |
| Schema introspection | One class = one schema | Works but less discoverable |
| StreamPipeline (on_frame + on_params_update + shared state) | Natural | Awkward — fundamentally multi-method |

**Decision:** Class-based is primary. A `@pipeline` decorator is provided as a
shortcut for simple stateless functions, creating a class under the hood.

### Why `Input()` descriptors, not Pydantic

Both produce identical JSON Schema. The question is developer experience.

**`Input()` on the method signature (our approach, same as Replicate):**
```python
def predict(self,
    prompt: str = Input(description="...", min_length=1),
    steps: int = Input(default=30, ge=1, le=100),
) -> Output(type="image"):
```

**Separate Pydantic model (AI Runner/Scope approach):**
```python
class Params(BaseModel):
    prompt: str = Field(description="...", min_length=1)
    steps: int = Field(default=30, ge=1, le=100)

def predict(self, params: Params) -> bytes:
```

| Consideration | `Input()` | Pydantic |
|---------------|-----------|----------|
| All params visible at a glance | Yes — on the method signature | No — separate class |
| Familiar to Replicate users | Yes — identical pattern | No |
| Richer validation (regex, nested models) | Not yet | Yes |
| Free JSON Schema generation | We implement it | Built-in `model_json_schema()` |
| Boilerplate | Less | More (extra class) |

**Decision:** Keep `Input()` for the public API. It matches what the largest
developer community (Replicate) already knows. Pydantic compatibility can be
added later as an optional alternative without breaking changes.

## Decision: Three Communication Protocols

### The problem

Different AI workloads have fundamentally different communication needs:

- **Batch inference** (text-to-image): send request, get response
- **LLM streaming** (text generation): send request, stream tokens back
- **Real-time processing** (video style transfer): continuous bidirectional frames

No single protocol serves all three well.

### What others do

| Workload | Replicate | Modal | Chutes | Our SDK |
|----------|-----------|-------|--------|---------|
| Batch | HTTP POST → JSON | HTTP POST → JSON | HTTP POST → JSON | HTTP POST → JSON |
| LLM streaming | HTTP → **SSE** | HTTP → **SSE** (via FastAPI) | HTTP → **SSE** (`stream=True`) | HTTP → **SSE** (auto-detected) |
| Real-time video | Not supported | Not supported | Not supported | **Trickle** subscribe/publish |

**Decision:** Auto-select protocol based on workload type:

1. **HTTP** — `predict()` returns a value → single response
2. **SSE** — `predict()` yields values (generator) → `text/event-stream`
3. **Trickle** — `StreamPipeline.on_frame()` → continuous frame I/O

The developer doesn't choose the protocol — the SDK infers it from the code.
This is the key DX insight: write Python, get the right transport automatically.

### Why not WebSocket?

- Trickle already handles bidirectional streaming for real-time video
- WebSocket adds a parallel streaming path that doesn't integrate with the
  orchestrator/payment infrastructure
- No competing platform uses WebSocket for their primary serving path
- Can be added later if browser-based playgrounds need it

## Decision: Multi-Modal StreamPipeline

### The problem

Real-time pipelines may need to process both audio and video simultaneously
(lip sync, audio-reactive visuals, video narration). The initial `on_frame()`
API doesn't distinguish between media types.

### How others handle it

**Scope:** Named ports — `inputs = ["video", "vace_input_frames"]`. The
`__call__(**kwargs)` receives different keys. Flexible but tied to their video
tensor format and DAG executor.

**AI Runner:** Separate interfaces — `put_video_frame()` and
`get_processed_video_frame()`. Audio is a different pipeline type entirely.
Not composable.

**Replicate/Modal/Chutes:** Don't support real-time multi-modal at all.

### Our approach

Typed callbacks with modality declarations:

```python
class LipSync(StreamPipeline):
    inputs = ["video", "audio"]
    outputs = ["video"]

    def on_video_frame(self, frame, **params):
        return self.model.sync(frame, self._phonemes)

    def on_audio_frame(self, frame, **params):
        self._phonemes = self.model.extract(frame)
```

The serve layer dispatches decoded frames by type using the existing
`MediaOutput` decoder, which already demuxes both audio and video tracks
from MPEG-TS trickle streams. No transport or protocol changes needed.

**Pattern 1 (implemented):** One primary stream, one reference stream.
Audio updates state, video reads it and produces output. Independent
processing — no synchronization needed.

**Pattern 2 (future):** True synchronized processing with `on_av_frame(video, audio)`
that receives temporally aligned pairs. Requires a sync buffer. Deferred until
there's a concrete use case.

### Why this is more general than Scope

Scope's ports are tied to video tensor format `(B, H, W, C)`. Our callbacks
are typed but format-agnostic — `on_video_frame` receives whatever the
transport provides (`av.VideoFrame`, `DecodedMediaFrame`, or raw bytes).
This means the same interface works for video, audio, and future modalities.

## Decision: Pipeline Registry and Health States

### Learnings from AI Runner and Scope

Both projects independently converged on similar patterns:

| Feature | AI Runner | Scope | Our SDK |
|---------|-----------|-------|---------|
| Pipeline discovery | Hardcoded `match/case` | `PipelineRegistry` with register/get/list | `PipelineRegistry` (same pattern as Scope) |
| Health states | `LOADING \| OK \| ERROR \| IDLE` | Managed externally by `PipelineManager` | `LOADING \| READY \| ERROR \| IDLE` on pipeline instance |
| Model download | `prepare_models()` classmethod | `artifacts` ClassVar + `download_models` CLI | `prepare_models()` classmethod + `livepeer prepare` CLI |
| Pipeline metadata | `name` property only | Full `BasePipelineConfig` with ClassVars | `pipeline_id`, `version`, `description` class attributes |

**Decision:** Adopt the patterns both projects validated, but keep them simple:

- Registry: class-level dict, no metaclass magic, no plugin framework
- Health: enum on the instance, exposed via `/health` with HTTP status codes
- Prepare: classmethod, not a declarative artifact system (yet)
- Metadata: just identity + resource hints, not Scope's full config system

## Decision: What Goes in the SDK vs What Stays External

### In the SDK (developer interface)

- Base classes (`Pipeline`, `StreamPipeline`)
- Input/output type system (`Input()`, `Output()`)
- Schema generation from signatures
- HTTP serve layer with protocol auto-selection
- CLI for local development and deployment
- Pipeline registry and health states

### External (orchestrator/network concerns)

- Orchestrator discovery and selection
- Payment sessions and per-segment payments
- Capability advertisement on the network
- Container image → model ID mapping
- Multi-orchestrator routing

The SDK generates the schema and Docker image. The network uses the schema
for routing and the image for deployment. The boundary is clean: the SDK
owns the developer experience, the network owns the infrastructure.

## Architecture Overview

```
Developer writes:
    Pipeline class with typed predict() / on_frame()
        ↓
SDK generates:
    JSON Schema (from signature introspection)
    HTTP server (with protocol auto-selection)
    Docker image (via livepeer push)
        ↓
Network uses:
    Schema → Studio playground UI, API docs, capability catalog
    Docker image → container on orchestrator node
    Health endpoint → orchestrator readiness checks
    Registry endpoint → multi-pipeline discovery
```

### Module structure (~1100 lines)

```
src/livepeer_gateway/runner/
├── pipeline.py     (~230 lines)  Base classes, health states, modality declarations
├── inputs.py       (~110 lines)  Input/Output descriptors
├── schema.py       (~190 lines)  Signature → JSON Schema
├── serve.py        (~550 lines)  HTTP server, SSE, trickle dispatch
├── registry.py     (~100 lines)  Pipeline discovery
├── decorators.py   (~100 lines)  @pipeline shortcut
└── cli.py          (~420 lines)  predict, serve, schema, prepare, push
```

## Future Work

Tracked as separate issues, not blocking v0.1:

| Feature | Motivation | Complexity |
|---------|-----------|------------|
| **Pipeline chaining** | Multi-step workflows in one container | Medium — needs queue-based executor |
| **Artifact declaration** | Declarative model dependencies | Small — extend `prepare_models()` |
| **Progress callbacks** | Studio loading UI | Small — callback param on `setup()` |
| **Plugin discovery** | pip-installable pipeline packages | Medium — Python entry_points |
| **Pydantic params** | Optional alternative to `Input()` | Medium — parallel validation path |
| **Synchronized A/V** | `on_av_frame(video, audio)` with temporal alignment | Medium — sync buffer design |

## References

- [Replicate Cog SDK](https://github.com/replicate/cog) — `BasePredictor`, `Input()`, `ConcatenateIterator`
- [Modal](https://modal.com/docs) — `@app.cls`, `@modal.enter()`, `@modal.method()`
- [Chutes SDK](https://github.com/chutes-ai/chutes-sdk) — `Chute(FastAPI)`, `@cord()`, `NodeSelector`
- [Livepeer AI Runner](https://github.com/livepeer/ai-runner) — `Pipeline` ABC, `PipelineSpec`, `ProcessGuardian`
- [Scope (Daydream)](https://github.com/daydreamlive/scope) — `Pipeline` ABC, `PipelineRegistry`, `GraphExecutor`
