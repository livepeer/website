# Recommendation: Livepeer Pipeline SDK (`livepeer_gateway.runner`)

## Problem

Today, getting a new AI capability onto the Livepeer network requires:

1. Building a custom Docker container with the right inference code, model weights, and dependencies
2. Manually configuring it to speak Livepeer's trickle protocol for frame transport
3. Coordinating with orchestrators to pull and run the container
4. Building a frontend to let developers try and integrate it
5. Writing API docs, client libraries, and integration guides

This process is manual, undocumented, and inaccessible to most AI developers. The people building state-of-the-art models (researchers, ML engineers, indie developers) shouldn't need to understand Livepeer's transport layer, orchestrator selection, or payment protocol. They should write their inference code and deploy.

Meanwhile, platforms like Replicate (`cog push`) and Chutes (`chutes deploy`) have made this a one-command experience. A developer writes a Python class, runs a CLI command, and their model is live with an auto-generated API, playground, and docs. Livepeer needs the same — but for a decentralized compute network instead of centralized cloud.

## What We're Proposing

A **Pipeline SDK** added to the existing `livepeer-python-gateway` repo (`j0sh/livepeer-python-gateway`) as a `runner` module. It gives developers and AI agents a way to:

1. **Define** a capability as a Python class with typed inputs and outputs
2. **Test** it locally with a single CLI command
3. **Push** it to the Livepeer network where orchestrators automatically pick it up
4. **Display** it in Studio with an auto-generated playground — no frontend code required

The SDK bridges two worlds: the provider writes standard Python (the same code they'd write for any inference server), and the SDK translates it into something the Livepeer network understands (trickle transport, protobuf, orchestrator registration).

## Why This Matters

### For developers building AI capabilities

The barrier to getting a model onto Livepeer drops from "weeks of custom integration" to "write a Python class and run `livepeer push`":

```python
from livepeer_gateway.runner import Pipeline, Input, Output

class TextToImage(Pipeline):
    gpu = "A100"

    def setup(self):
        from diffusers import StableDiffusionXLPipeline
        self.pipe = StableDiffusionXLPipeline.from_pretrained("stabilityai/sdxl-1.0")

    def predict(self,
        prompt: str = Input(description="Text prompt"),
        width: int = Input(default=1024, choices=[512, 768, 1024]),
        height: int = Input(default=1024, choices=[512, 768, 1024]),
        steps: int = Input(default=30, ge=1, le=100),
    ) -> Output(type="image"):
        image = self.pipe(prompt, width=width, height=height,
                         num_inference_steps=steps).images[0]
        return image
```

```bash
livepeer predict my_pipeline.py -i prompt="a cat in space"   # test locally
livepeer push my_pipeline.py                                  # deploy to network
```

That's it. The developer never touches trickle, protobuf, Docker, or orchestrator APIs.

### For AI agents

AI coding agents (Claude, Cursor, Copilot) can generate Pipeline classes from natural language descriptions. The typed interface (`Input()`, `Output()`) gives agents a clear contract to code against. An agent could:

1. Receive: "Build a pipeline that upscales images using Real-ESRGAN"
2. Generate: A `Pipeline` class with the right `setup()` and `predict()`
3. Test: `livepeer predict` to verify it works
4. Deploy: `livepeer push` to put it on the network

The schema-first design means agents don't need to understand Livepeer internals — just Python classes with type annotations.

### For Studio (the developer portal)

The `predict()` function signature IS the API schema. When a provider pushes a pipeline:

```python
def predict(self,
    prompt: str = Input(description="Text prompt"),
    steps: int = Input(default=30, ge=1, le=100),
    model: str = Input(default="sdxl", choices=["sd15", "sdxl", "sd3"]),
) -> Output(type="image"):
```

Studio automatically receives:

```json
{
  "params": [
    { "name": "prompt", "type": "string", "required": true, "description": "Text prompt" },
    { "name": "steps", "type": "number", "default": 30, "min": 1, "max": 100 },
    { "name": "model", "type": "enum", "default": "sdxl", "values": ["sd15", "sdxl", "sd3"] }
  ],
  "response_type": "image",
  "interaction_type": "request_response"
}
```

From this schema, Studio auto-generates:
- **Catalog card** with name, description, pricing, latency
- **Playground** with form controls (text input → string, dropdown → enum, slider → number, upload → file)
- **Response renderer** (image viewer, video player, text block, JSON tree)
- **Quick-start code snippets** (curl, Python, JavaScript)
- **API documentation**

The provider writes zero frontend code. Push a Python class → get a full product page in the marketplace.

### For real-time streaming capabilities (WebRTC)

Livepeer's differentiator over Replicate/Chutes is real-time video. The SDK supports this with `StreamPipeline` — same simplicity, but for live video processing:

```python
from livepeer_gateway.runner import StreamPipeline, LiveParam, VideoFrame

class RealtimeStyle(StreamPipeline):
    gpu = "A100"

    def setup(self):
        from streamdiffusion import StreamDiffusion
        self.stream = StreamDiffusion("sd-turbo")

    def on_frame(self,
        frame: VideoFrame,
        prompt: str = LiveParam(description="Style prompt"),
        strength: float = LiveParam(default=0.6, min=0, max=1),
    ) -> VideoFrame:
        return self.stream(frame, prompt=prompt, strength=strength)
```

Studio detects `StreamPipeline` and renders a **live playground** with webcam input and real-time sliders — something Replicate and Chutes can't do.

`LiveParam` values update in real-time over the WebRTC data channel. Users move a slider and see the output change instantly. This is the Daydream Scope experience, but available to any developer who writes an `on_frame()` function.

### For the network (more capabilities = more value)

Every pipeline pushed via the SDK is a new capability on the Livepeer network. More capabilities → more developers using the network → more compute demand → more orchestrator revenue. The SDK is the growth engine for the supply side of the marketplace.

## How It Works Technically

### Where it lives

Added to the existing `livepeer-python-gateway` repo as a submodule:

```
livepeer-python-gateway/
  src/livepeer_gateway/
    runner/                 # NEW — run pipelines ON the network
      pipeline.py           # Pipeline, StreamPipeline base classes (~100 lines)
      inputs.py             # Input(), LiveParam(), Output() types (~50 lines)
      serve.py              # Wraps pipeline in HTTP + trickle server (~350 lines)
      schema.py             # Extract schema from predict() signature (~50 lines)
      cli.py                # `livepeer push` command (~200 lines)

    # Existing — shared transport (reused by runner)
    trickle_publisher.py
    trickle_subscriber.py
    media_decode.py
    media_output.py
    lp_rpc_pb2.py
    ...
```

~750 lines of new code. The runner reuses all existing transport primitives — it doesn't reimplement trickle or media handling.

### The bridge: `serve.py`

This is the key piece. It wraps a Pipeline class and connects it to the existing SDK transport:

**For request-response (`Pipeline`):**
- Starts HTTP server inside the container
- `POST /predict` → deserialize inputs → call `pipeline.predict()` → serialize → respond
- `GET /schema` → return input/output schema (auto-generated from `predict()` signature)
- `GET /health` → return status

**For streaming (`StreamPipeline`):**
- Uses existing `trickle_subscriber` to receive encoded frames from the gateway
- Decodes via `media_decode`
- Calls `pipeline.on_frame(frame, **live_params)` per frame
- Encodes result via `media_output`
- Sends back via `trickle_publisher`
- Parameter updates arrive via separate channel → forwarded as kwargs

The provider never imports trickle, protobuf, or media modules.

### End-to-end data flow

**Request-response:**
```
Developer's app
  → POST https://studio.livepeer.org/v1/run/text-to-image
  → Studio API route → Gateway → Orchestrator
  → Container: serve.py receives HTTP request → calls predict() → returns result
  → Result flows back to developer's app
```

**Real-time streaming:**
```
User's browser (webcam)
  → WebRTC → Gateway
  → Trickle protocol → Orchestrator
  → serve.py: trickle_subscriber → decode → on_frame() → encode → trickle_publisher
  → Trickle → Gateway → WebRTC
  → User's browser (AI output)

Param updates: browser → data channel → gateway → container → on_frame() kwargs
```

### What `livepeer push` does

```
1. Read pipeline.py → find Pipeline subclass
2. Extract predict()/on_frame() signature → generate schema JSON
3. Read dependencies (imports, requirements.txt, or pyproject.toml)
4. Generate Dockerfile:
     - Base image with GPU support + Python
     - Install dependencies
     - Copy pipeline code + model weights
     - Entrypoint: python -m livepeer_gateway.runner.serve my_pipeline:MyPipeline
5. Build container image
6. Push to container registry
7. Register capability on Livepeer network:
     - Pipeline name, schema, GPU requirements
     - Container image reference
8. Orchestrators discover new capability → pull container → advertise it
9. Studio detects new capability → auto-creates catalog entry + playground
```

### After deployment: provider observability

No direct communication channel between provider and orchestrators. The registry is the intermediary.

| What | How | Where provider sees it |
|------|-----|----------------------|
| Request volume, latency | Studio logs every proxied request | Provider Dashboard |
| Error rate | Studio tracks 4xx/5xx responses | Provider Dashboard |
| Revenue per request | Studio metering + billing | Provider Dashboard |
| Container health | Orchestrator pings `/health` | Network monitoring |
| Push new version | `livepeer push` again → rolling update | Zero downtime |

## How It Fits Into the Bigger Picture

```
livepeer_gateway repo — three layers:

  gateway/    "I route requests TO the network"
              Eventually replaces Go gateway for multi-tenant Studio
              Auth, routing, billing, orchestrator selection

  runner/     "I run pipelines ON the network"        ← THIS RECOMMENDATION
              Provider-facing SDK
              Pipeline classes, serve, push CLI

  (root)      Shared transport primitives
              Trickle, protobuf, media, orchestrator discovery
              Used by both gateway and runner
```

The `runner/` module ships first (small, high value — enables provider ecosystem). The `gateway/` module ships later (when Studio needs to replace Go gateway for per-user orchestrator selection and custom billing logic).

## Effort Estimate

| Component | Lines | Effort |
|-----------|-------|--------|
| `runner/pipeline.py` | ~100 | 1 day |
| `runner/inputs.py` | ~50 | Half day |
| `runner/serve.py` (HTTP mode) | ~150 | 1 day |
| `runner/serve.py` (trickle/streaming mode) | ~200 | 2 days |
| `runner/schema.py` | ~50 | Half day |
| `runner/cli.py` | ~200 | 2 days |
| Examples + docs | ~300 | 1 day |
| **Total** | **~750 + 300** | **~1 week** |

The first usable version (request-response only, no streaming) could ship in 3-4 days. Streaming support adds 2-3 more days.

## Summary

The Pipeline SDK turns Livepeer from "a network you have to deeply understand to deploy on" into "write a Python class, push, done." It makes the network accessible to every AI developer and AI agent, while automatically populating Studio with rich, interactive API listings. It's the supply-side growth engine for the entire platform.
