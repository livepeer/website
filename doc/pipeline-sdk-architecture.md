# Pipeline SDK — Architecture Decision Record

This document explains the architectural decisions behind the Livepeer Pipeline SDK, the competitive analysis that informed them, and the contract-level alignment work required between the SDK and go-livepeer's BYOC (Bring Your Own Container) layer.

For the developer-facing SDK reference (quick start, API, CLI), see [`pipeline-sdk.md`](./pipeline-sdk.md). For orchestrator-side container isolation and BYOC runtime concerns, see [`runtime.md`](./runtime.md).

## Problem Statement

Deploying AI capabilities to the Livepeer network currently demands extensive manual work: custom Docker containers, trickle protocol configuration, orchestrator coordination, frontend development, and comprehensive documentation. This process is inaccessible to most AI developers.

Competing platforms (Replicate, Modal, Chutes, fal.ai) have simplified deployment to a single command. Livepeer needs the same developer experience — while supporting a workload those platforms don't: real-time video/audio streaming over its decentralized network.

---

## Competitive Landscape

### How others do it

| Platform | Pattern | Input typing | Streaming | GPU spec | Deploy |
|---|---|---|---|---|---|
| **Replicate (Cog)** | Class + `Input()` | `Input(ge=, le=, choices=)` on `predict()` | `ConcatenateIterator[str]` (yield tokens) | `cog.yaml: gpu: true` | `cog push` |
| **Modal** | Class + decorators | Python type hints | FastAPI `StreamingResponse` | `@app.cls(gpu="A100")` | `modal deploy` |
| **Chutes** | FastAPI subclass + `@cord()` | Pydantic `BaseModel` | `Cord(stream=True)` | `NodeSelector(min_vram_gb=80)` | `chutes deploy` |
| **Livepeer AI Runner** | ABC class + FastAPI router | Pydantic `BaseModel` | Trickle (video frames) | env var + Docker image | Container per pipeline |
| **Scope (Daydream)** | ABC class + `__call__` | Pydantic `BasePipelineConfig` | Trickle + WebRTC | `estimated_vram_gb` ClassVar | `daydream-scope` CLI |
| **Our SDK** | Class + `Input()` | `Input(ge=, le=, choices=)` on `predict()` | SSE (generators) + Trickle (frames) | `gpu = "A100"` class attr | `livepeer push` |

### Key observations

1. **Replicate is the developer experience benchmark.** Most AI developers have used Cog. Our `Input()` pattern is intentionally near-identical.
2. **Modal and Chutes use decorators** for serverless functions. But when GPU models are involved, even Modal uses classes (`@app.cls`) because models are inherently stateful.
3. **Both Livepeer-native projects (AI Runner, Scope) use Pydantic** for parameter validation internally. However, these are infrastructure projects, not developer-facing SDKs. The developer-facing platforms (Replicate, Modal, Chutes) use lighter patterns.
4. **No competing platform handles real-time video streaming** as a first-class primitive. This is Livepeer's differentiator.

---

## Decision: Class-Based with `Input()` Descriptors

### Why classes, not decorators

| Consideration | Classes | Decorators |
|---|---|---|
| Stateful lifecycle (load weights once, predict many) | Natural — `self` holds state | Requires globals or closures |
| Multiple methods (setup, predict, on_frame, on_params_update) | Natural | Scattered across multiple decorators |
| Resource declarations | Class attributes | Decorator arguments |
| Schema introspection | One class = one schema | Works but less discoverable |
| StreamPipeline (on_frame + on_params_update + shared state) | Natural | Awkward — fundamentally multi-method |

**Decision:** Class-based is primary. A `@pipeline` decorator is provided as a shortcut for simple stateless functions, creating a class under the hood.

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
|---|---|---|
| All params visible at a glance | Yes — on the method signature | No — separate class |
| Familiar to Replicate users | Yes — identical pattern | No |
| Richer validation (regex, nested models) | Not yet | Yes |
| Free JSON Schema generation | We implement it | Built-in `model_json_schema()` |
| Boilerplate | Less | More (extra class) |

**Decision:** Keep `Input()` for the public API. It matches what the largest developer community (Replicate) already knows. Pydantic compatibility can be added later as an optional alternative without breaking changes.

---

## Decision: Three Communication Protocols

### The problem

Different AI workloads have fundamentally different communication needs:
- **Batch inference** (text-to-image): send request, get response
- **LLM streaming** (text generation): send request, stream tokens back
- **Real-time processing** (video style transfer): continuous bidirectional frames

No single protocol serves all three well.

### What others do

| Workload | Replicate | Modal | Chutes | Our SDK |
|---|---|---|---|---|
| Batch | HTTP POST → JSON | HTTP POST → JSON | HTTP POST → JSON | HTTP POST → JSON |
| LLM streaming | HTTP → **SSE** | HTTP → **SSE** (via FastAPI) | HTTP → **SSE** (`stream=True`) | HTTP → **SSE** (auto-detected) |
| Real-time video | Not supported | Not supported | Not supported | **Trickle** subscribe/publish |

**Decision:** Auto-select protocol based on workload type:

1. **HTTP** — `predict()` returns a value → single response
2. **SSE** — `predict()` yields values (generator) → `text/event-stream`
3. **Trickle** — `StreamPipeline.on_frame()` → continuous frame I/O

The developer doesn't choose the protocol — the SDK infers it from the code. This is the key DX insight: **write Python, get the right transport automatically.**

### Why not WebSocket?

- Trickle already handles bidirectional streaming for real-time video
- WebSocket adds a parallel streaming path that doesn't integrate with the orchestrator/payment infrastructure
- No competing platform uses WebSocket for their primary serving path
- Can be added later if browser-based playgrounds need it

---

## Decision: Multi-Modal StreamPipeline

### The problem

Real-time pipelines may need to process both audio and video simultaneously (lip sync, audio-reactive visuals, video narration). The initial `on_frame()` API doesn't distinguish between media types.

### How others handle it

- **Scope:** Named ports — `inputs = ["video", "vace_input_frames"]`. The `__call__(**kwargs)` receives different keys. Flexible but tied to their video tensor format and DAG executor.
- **AI Runner:** Separate interfaces — `put_video_frame()` and `get_processed_video_frame()`. Audio is a different pipeline type entirely. Not composable.
- **Replicate / Modal / Chutes:** Don't support real-time multi-modal at all.

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

The serve layer dispatches decoded frames by type using the existing `MediaOutput` decoder, which already demuxes audio and video tracks from MPEG-TS trickle streams. No transport or protocol changes needed.

**Pattern 1 (implemented):** One primary stream, one reference stream. Audio updates state, video reads it and produces output. Independent processing — no synchronization needed.

**Pattern 2 (future):** True synchronized processing with `on_av_frame(video, audio)` receiving temporally aligned pairs. Requires a sync buffer. Deferred until there's a concrete use case.

### Why this is more general than Scope

Scope's ports are tied to video tensor format `(B, H, W, C)`. Our callbacks are typed but format-agnostic — `on_video_frame` receives whatever the transport provides (`av.VideoFrame`, `DecodedMediaFrame`, or raw bytes). This means the same interface works for video, audio, and future modalities.

---

## Decision: Pipeline Registry and Health States

### Learnings from AI Runner and Scope

Both projects independently converged on similar patterns:

| Feature | AI Runner | Scope | Our SDK |
|---|---|---|---|
| Pipeline discovery | Hardcoded `match/case` | `PipelineRegistry` with register/get/list | `PipelineRegistry` (same pattern as Scope) |
| Health states | `LOADING \| OK \| ERROR \| IDLE` | Managed externally by `PipelineManager` | `LOADING \| READY \| ERROR \| IDLE` on pipeline instance |
| Model download | `prepare_models()` classmethod | `artifacts` ClassVar + `download_models` CLI | `prepare_models()` classmethod + `livepeer prepare` CLI |
| Pipeline metadata | `name` property only | Full `BasePipelineConfig` with ClassVars | `pipeline_id`, `version`, `description` class attributes |

**Decision:** Adopt the patterns both projects validated, but keep them simple:

- **Registry:** class-level dict, no metaclass magic, no plugin framework
- **Health:** enum on the instance, exposed via `/health` with HTTP status codes
- **Prepare:** classmethod, not a declarative artifact system (yet)
- **Metadata:** just identity + resource hints, not Scope's full config system

---

## Decision: SDK Boundary

### What goes in the SDK (developer interface)

- Base classes (`Pipeline`, `StreamPipeline`)
- Input/output type system (`Input()`, `Output()`)
- Schema generation from signatures
- HTTP serve layer with protocol auto-selection
- CLI for local development and deployment
- Pipeline registry and health states

### What stays external (orchestrator/network concerns)

- Orchestrator discovery and selection
- Payment sessions and per-segment payments
- Capability advertisement on the network
- Container image → model ID mapping
- Multi-orchestrator routing

**Rationale:** The SDK generates the schema and Docker image. The network uses the schema for routing and the image for deployment. The boundary is clean: the SDK owns the developer experience, the network owns the infrastructure.

---

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

### Where it fits in the gateway repo

```
livepeer_gateway repo — three layers:

  gateway/    "I route requests TO the network"
              Eventually replaces Go gateway for multi-tenant Studio
              Auth, routing, billing, orchestrator selection

  runner/     "I run pipelines ON the network"
              Provider-facing SDK
              Pipeline classes, serve, push CLI

  (root)      Shared transport primitives
              Trickle, protobuf, media, orchestrator discovery
              Used by both gateway and runner
```

The `runner/` module ships first (small, high value — enables provider ecosystem). The `gateway/` module ships later (when Studio needs to replace the Go gateway for per-user orchestrator selection and custom billing logic).

### How `serve.py` bridges pipeline → transport

This is the key piece. It wraps a Pipeline class and connects it to the existing SDK transport:

**For request-response (`Pipeline`):**
- Starts HTTP server inside the container
- `POST /predict` → deserialize inputs → call `pipeline.predict()` → serialize → respond
- `GET /schema` → return input/output schema (auto-generated from `predict()` signature)
- `GET /health` → return status

**For streaming (`StreamPipeline`):**
- Uses existing `trickle_subscriber` to receive encoded frames from the gateway
- Decodes via `media_decode`
- Calls `pipeline.on_frame(frame, **params)` per frame
- Encodes result via `media_output`
- Sends back via `trickle_publisher`
- Parameter updates arrive via the control channel → forwarded to `on_params_update()`

The provider never imports trickle, protobuf, or media modules.

---

## BYOC Contract Alignment

The Pipeline SDK targets **BYOC** as its deployment path. For a container built with the SDK to "just work" on the Livepeer network, the SDK's container interface and go-livepeer's BYOC layer must agree on endpoints, request bodies, and control flow. This section documents the current gap and the proposed changes.

### Three container execution models in go-livepeer

| Model | Description | Container protocol |
|---|---|---|
| **Managed** | go-livepeer pulls and runs Docker containers via `DockerManager` | Livepeer runner API (OpenAPI-generated) |
| **External** | Operator runs container, registers URL via `Warm()` | Same runner API, just remote |
| **BYOC** | Container registers as external capability, requests proxied through | HTTP passthrough + trickle streaming |

The Pipeline SDK targets **BYOC**. PR #3884 (Serverless / Scope WebSocket) is a point integration for a non-standard external service and is not relevant to SDK containers.

### Current contract mismatches

**Streaming endpoints:**

| SDK exposes | BYOC calls on container | Match? |
|---|---|---|
| `POST /stream` | `POST {url}/stream/start` | Path mismatch |
| *(none)* | `POST {url}/stream/stop` | Missing |
| `POST /params` | `POST {url}/stream/params` | Path mismatch |
| `GET /health` | `GET /health` | **Match** |

**Batch job endpoints:**

| SDK exposes | BYOC calls | Match? |
|---|---|---|
| `POST /predict` | `POST {capabilityUrl}/{resourcePath}` | Works if registered as `http://container:8000/predict` |

**Request body for streaming:** BYOC sends trickle URLs in the `/stream/start` body:

```json
{
  "gateway_request_id": "abc123",
  "subscribe_url": "http://orch:8935/ai/trickle/abc123",
  "publish_url": "http://orch:8935/ai/trickle/abc123-out",
  "control_url": "http://orch:8935/ai/trickle/abc123-control",
  "events_url": "http://orch:8935/ai/trickle/abc123-events",
  "data_url": "http://orch:8935/ai/trickle/abc123-data"
}
```

The SDK's `StreamPipelineServer` does not currently parse these URLs or connect to them as a trickle client. **This is the main gap.**

### Design decisions

1. **The SDK defines the standard** — don't make endpoints configurable. The whole point is "it just works." Non-SDK containers can use BYOC directly with any shape they like.
2. **One stream endpoint** — simplify from 3 container endpoints to 1. Route stop/params through the trickle control channel instead of separate HTTP calls.
3. **Fix BYOC, not the SDK** — update go-livepeer's BYOC to call the SDK's standard paths. The SDK's developer experience drives the API design.
4. **Protocol versioning** — add a `"protocol": "v1"` field to capability registration for future evolution.

### Proposed changes to go-livepeer (BYOC)

**File:** `byoc/stream_orchestrator.go`

1. Change container call from `/stream/start` to `/stream`:
   ```go
   // Before:
   workerRoute := orchJob.Req.CapabilityUrl + "/stream/start"
   // After:
   workerRoute := orchJob.Req.CapabilityUrl + "/stream"
   ```

2. Remove direct HTTP calls for stop and params. Instead, send control messages through the trickle control channel:
   ```go
   // Before (stop):
   workerRoute := orchJob.Req.CapabilityUrl + "/stream/stop"
   req, err := http.NewRequestWithContext(ctx, "POST", workerRoute, bytes.NewBuffer(body))

   // After (stop):
   controlMsg := map[string]interface{}{"type": "stop"}
   controlBytes, _ := json.Marshal(controlMsg)
   controlPubCh.Write(bytes.NewReader(controlBytes))
   ```

   ```go
   // Before (params):
   workerRoute := orchJob.Req.CapabilityUrl + "/stream/params"
   req, err := http.NewRequestWithContext(ctx, "POST", workerRoute, bytes.NewBuffer(body))

   // After (params):
   controlMsg := map[string]interface{}{"type": "params", "data": json.RawMessage(body)}
   controlBytes, _ := json.Marshal(controlMsg)
   controlPubCh.Write(bytes.NewReader(controlBytes))
   ```

3. `monitorOrchStream` sends stop via the control channel instead of HTTP.
4. Gateway-facing endpoints stay the same — clients still call `/process/stream/{id}/stop` and `/process/stream/{id}/update`. Only the orchestrator-to-container contract changes.

**Note on the trickle bug:** The comment on line 1007-1008 of `stream_gateway.go` says:
```go
// had issues with control publisher not sending down full data when including base64 encoded binary data
// switched to using regular post request like /stream/start and /stream/stop
```
This is likely an implementation bug, not a protocol limitation. The trickle protocol uses `io.Pipe` + `io.Copy` with no size limits. The bug probably relates to timing with the `FirstByteTimeout` (10s) or pipe buffering edge cases with large payloads. Control messages for stop/params are small JSON — they won't hit this issue. Actual large data (video frames) already flows fine through publish/subscribe channels.

### Proposed changes to the Pipeline SDK

**File:** `src/livepeer_gateway/runner/serve.py`

In the `/stream` handler, parse trickle URLs from the request body and use the **existing** trickle primitives:

```python
async def handle_stream_start(self, request):
    body = await request.json()

    # Connect to trickle URLs provided by BYOC
    sub = TrickleSubscriber(body["subscribe_url"])     # input video
    pub = TricklePublisher(body["publish_url"])         # output video
    control = ChannelReader(body["control_url"])        # incoming commands
    events = ChannelWriter(body["events_url"])          # status events
    data = JSONLWriter(body.get("data_url"))            # JSONL data output

    # Wire control channel to on_params_update() and stop
    async for msg in control:
        if msg.get("type") == "params":
            self.pipeline.on_params_update(msg["data"])
        elif msg.get("type") == "stop":
            break

    # Wire subscribe -> on_frame() -> publish
    async for frame in sub:
        result = self.pipeline.on_frame(frame)
        await pub.write(result)
```

The existing `Control`, `Events`, `TricklePublisher`, `TrickleSubscriber`, `ChannelReader`, `JSONLWriter` classes are the building blocks. No new trickle code needed.

### Final container contract

After these changes, a container built with the SDK needs only:

| Endpoint | Purpose | Called by |
|---|---|---|
| `GET /health` | Returns `{"status": "OK"}` | go-livepeer readiness check |
| `POST /stream` | Receives trickle URLs, starts processing | BYOC orchestrator (once) |
| `POST /predict` | Request-response inference | BYOC job proxy |
| `GET /schema` | JSON Schema for inputs/outputs | Studio UI, auto-registration |

Everything else flows through trickle channels:
- **Input video:** container subscribes to `subscribe_url`
- **Output video:** container publishes to `publish_url`
- **Params / stop:** container reads from `control_url`
- **Status events:** container writes to `events_url`
- **Data output:** container writes JSONL to `data_url`

### What stays the same

- Gateway-to-client API (all `/process/stream/*` and `/process/request/*` endpoints)
- Trickle protocol and channel creation
- Payment/capacity management
- WHIP/RTMP ingress, WHEP egress
- SSE data output to clients
- Capability registration API (just add optional `protocol` field)
- Orchestrator discovery and selection

### Implementation order

1. **SDK serve layer** — wire `StreamPipelineServer` to trickle primitives (Python-only, can be done independently)
2. **BYOC simplification** — update `stream_orchestrator.go` to use `/stream` + control channel (Go change)
3. **Test end-to-end** — SDK container registered as BYOC capability, streaming works
4. **Batch jobs** — verify `Pipeline.predict()` works through BYOC job proxy (likely works already)
5. **Schema integration** — optionally use `/schema` for auto-registration or Studio UI generation

---

## Future Work

Tracked as separate issues, not blocking v0.1:

| Feature | Motivation | Complexity |
|---|---|---|
| **Pipeline chaining** | Multi-step workflows in one container | Medium — needs queue-based executor |
| **Artifact declaration** | Declarative model dependencies | Small — extend `prepare_models()` |
| **Progress callbacks** | Studio loading UI | Small — callback param on `setup()` |
| **Plugin discovery** | pip-installable pipeline packages | Medium — Python entry_points |
| **Pydantic params** | Optional alternative to `Input()` | Medium — parallel validation path |
| **Synchronized A/V** | `on_av_frame(video, audio)` with temporal alignment | Medium — sync buffer design |

---

## References

- [Replicate Cog SDK](https://github.com/replicate/cog) — `BasePredictor`, `Input()`, `ConcatenateIterator`
- [Modal](https://modal.com/docs) — `@app.cls`, `@modal.enter()`, `@modal.method()`
- [Chutes SDK](https://github.com/chutes-ai/chutes-sdk) — `Chute(FastAPI)`, `@cord()`, `NodeSelector`
- [Livepeer AI Runner](https://github.com/livepeer/ai-runner) — `Pipeline` ABC, `PipelineSpec`, `ProcessGuardian`
- [Scope (Daydream)](https://github.com/daydreamlive/scope) — `Pipeline` ABC, `PipelineRegistry`, `GraphExecutor`
- [livepeer-python-gateway PR #1](https://github.com/rickstaa/livepeer-python-gateway/pull/1) — Runner module introduction
