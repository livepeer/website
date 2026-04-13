# Research: Aligning BYOC with the Pipeline SDK

## Goal

Enable any container built with the [livepeer-python-gateway](https://github.com/rickstaa/livepeer-python-gateway) Pipeline SDK to plug into the Livepeer network via BYOC and "just work" -- similar to how Replicate's Cog lets developers deploy custom containers.

## Context: Three Container Execution Models in go-livepeer

go-livepeer currently has three ways to run AI containers:

| Model | Description | Container Protocol |
|-------|-------------|-------------------|
| **Managed** | go-livepeer pulls and runs Docker containers via `DockerManager` | Livepeer runner API (OpenAPI-generated) |
| **External** | Operator runs container, registers URL via `Warm()` | Same runner API, just remote |
| **BYOC** | Container registers as external capability, requests proxied through | HTTP passthrough + trickle streaming |

The Pipeline SDK targets **BYOC** as the deployment path.

### PR #3884 (Serverless) -- Not Relevant Here

PR #3884 adds a `ServerlessWorker` that connects to Scope's WebSocket API. It's a point integration for one external service that doesn't speak Livepeer's protocol. It does NOT replace live-video-to-video or BYOC. The SDK solves the opposite problem: making it trivial to build containers that DO speak the standard protocol.

---

## Current State of the Pipeline SDK

**Repo:** `rickstaa/livepeer-python-gateway` ([PR #1](https://github.com/rickstaa/livepeer-python-gateway/pull/1))

### What exists (main branch -- Josh's gateway SDK)

Client/gateway-side Python code that already talks to go-livepeer:

| Module | Purpose |
|--------|---------|
| `trickle_publisher.py` | Streams bytes to `POST {url}/{seq}` endpoints |
| `trickle_subscriber.py` | Reads bytes from `GET {url}/{seq}` endpoints |
| `channel_reader.py` | Subscribes to trickle JSON event channels |
| `channel_writer.py` | Publishes JSONL to trickle channels |
| `control.py` | Writes JSON dicts to the control trickle channel |
| `events.py` | Reads from the events trickle channel (alias for `ChannelReader`) |
| `lv2v.py` | Orchestrates live-video-to-video jobs |
| `orchestrator.py` | Discovery, HTTP helpers, payment sessions |
| `capabilities.py` | Capability ID enum, capacity tracking |

### What PR #1 adds (container/runner side)

Developer-facing abstractions for building containers:

| Class | Purpose |
|-------|---------|
| `Pipeline` | Base class for request-response workloads (e.g. text-to-image) |
| `StreamPipeline` | Base class for real-time streaming (e.g. live video style transfer) |
| `Input()` / `Output()` | Typed parameter descriptors with validation constraints |
| `PipelineServer` | HTTP server: `POST /predict`, `GET /schema`, `GET /health` |
| `StreamPipelineServer` | HTTP server: `POST /stream`, `POST /params`, `GET /health` |
| Schema generation | Auto-generates JSON Schema from `predict()` / `on_frame()` signatures |
| CLI (`livepeer push`) | Generates Dockerfile, builds container, pushes to registry |

### Example: Developer experience

```python
class StyleTransfer(StreamPipeline):
    gpu = "T4"

    def setup(self):
        self.model = load_model()

    def on_frame(self, frame: bytes, style: str = Input(default="starry_night")) -> bytes:
        return self.model.apply(frame, style)

    def on_params_update(self, params: dict):
        self.current_style = params.get("style", self.current_style)
```

The SDK handles serving, schema generation, and deployment. Developer just implements `on_frame()`.

---

## Current Contract Mismatches

### Streaming endpoints

| SDK exposes | BYOC calls on container | Match? |
|------------|------------------------|--------|
| `POST /stream` | `POST {url}/stream/start` | Path mismatch |
| _(none)_ | `POST {url}/stream/stop` | Missing |
| `POST /params` | `POST {url}/stream/params` | Path mismatch |
| `GET /health` | `GET /health` | **Match** |

### Batch job endpoints

| SDK exposes | BYOC calls | Match? |
|------------|-----------|--------|
| `POST /predict` | `POST {capabilityUrl}/{resourcePath}` | Works if registered as `http://container:8000/predict` |

### Request body for streaming

BYOC sends trickle URLs in the `/stream/start` body:

```json
{
  "gateway_request_id": "abc123",
  "subscribe_url": "http://orch:8935/ai/trickle/abc123",
  "publish_url": "http://orch:8935/ai/trickle/abc123-out",
  "control_url": "http://orch:8935/ai/trickle/abc123-control",
  "events_url": "http://orch:8935/ai/trickle/abc123-events",
  "data_url": "http://orch:8935/ai/trickle/abc123-data",
  ...user params from client body...
}
```

The SDK's `StreamPipelineServer` does NOT currently parse these URLs or connect to them as a trickle client. This is the main gap.

---

## Proposed Changes

### Design Decisions

1. **SDK defines the standard** -- don't make endpoints configurable. The whole point is "it just works." Non-SDK containers can use BYOC directly.

2. **One stream endpoint** -- simplify from 3 container endpoints to 1. Route stop/params through the trickle control channel instead of separate HTTP calls.

3. **Fix BYOC, not the SDK** -- update go-livepeer's BYOC to call the SDK's standard paths. The SDK's developer experience should drive the API design.

4. **Protocol versioning** -- add a `"protocol": "v1"` field to capability registration for future evolution.

### Changes to go-livepeer (BYOC)

**File: `byoc/stream_orchestrator.go`**

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

3. The `monitorOrchStream` function sends stop via control channel instead of HTTP.

4. Gateway-facing endpoints stay the same -- clients still call `/process/stream/{id}/stop` and `/process/stream/{id}/update`. Only the orchestrator-to-container contract changes.

**Note on the trickle bug:** The comment on line 1007-1008 of `stream_gateway.go` says:
```go
//had issues with control publisher not sending down full data when including base64 encoded binary data
// switched to using regular post request like /stream/start and /stream/stop
```
This is likely an implementation bug, not a protocol limitation. The trickle protocol uses `io.Pipe` + `io.Copy` with no size limits. The bug probably relates to timing with the `FirstByteTimeout` (10s) or pipe buffering edge cases with large payloads. Control messages for stop/params are small JSON -- they won't hit this issue. The actual large data (video frames) already flows fine through publish/subscribe channels.

### Changes to the Pipeline SDK

**File: `src/livepeer_gateway/runner/serve.py`**

1. In the `/stream` handler, parse trickle URLs from the request body and use the **existing** trickle primitives from the same repo:

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

2. The existing `Control`, `Events`, `TricklePublisher`, `TrickleSubscriber`, `ChannelReader`, `JSONLWriter` classes from the main branch are the building blocks. No new trickle code needed.

---

## Final Container Contract

After these changes, a container built with the SDK needs:

| Endpoint | Purpose | Called by |
|----------|---------|----------|
| `GET /health` | Returns `{"status": "OK"}` | go-livepeer readiness check |
| `POST /stream` | Receives trickle URLs, starts processing | BYOC orchestrator (once) |
| `POST /predict` | Request-response inference | BYOC job proxy |
| `GET /schema` | JSON Schema for inputs/outputs | Future: Studio UI, auto-registration |

Everything else flows through trickle channels:
- **Input video**: container subscribes to `subscribe_url`
- **Output video**: container publishes to `publish_url`
- **Params/stop**: container reads from `control_url`
- **Status events**: container writes to `events_url`
- **Data output**: container writes JSONL to `data_url`

---

## What Stays the Same

- Gateway-to-client API (all `/process/stream/*` and `/process/request/*` endpoints)
- Trickle protocol and channel creation
- Payment/capacity management
- WHIP/RTMP ingress, WHEP egress
- SSE data output to clients
- Capability registration API (just add optional `protocol` field)
- Orchestrator discovery and selection

## Implementation Order

1. **SDK serve layer** -- wire `StreamPipelineServer` to trickle primitives (Python-only, can be done independently)
2. **BYOC simplification** -- update `stream_orchestrator.go` to use `/stream` + control channel (Go change)
3. **Test end-to-end** -- SDK container registered as BYOC capability, streaming works
4. **Batch jobs** -- verify `Pipeline.predict()` works through BYOC job proxy (likely works already)
5. **Schema integration** -- optionally use `/schema` for auto-registration or Studio UI generation
