# Livepeer Pipeline SDK

The Pipeline SDK is the developer-facing interface for deploying AI capabilities to the Livepeer network. Developers write a standard Python class; the SDK handles trickle transport, protobuf serialization, Docker packaging, and orchestrator registration. This is Livepeer's answer to Replicate's `cog push` or Chutes' `chutes deploy` — with first-class support for real-time video streaming that those platforms don't offer.

## Why This Exists

Getting a new AI capability onto Livepeer today requires:

1. Building a custom Docker container with the right inference code and dependencies
2. Manually configuring it to speak Livepeer's trickle protocol
3. Coordinating with orchestrators to pull and run the container
4. Building a frontend so developers can try and integrate it
5. Writing API docs, client libraries, and integration guides

This process is manual, undocumented, and inaccessible to most AI developers. The SDK collapses it to: **write a Python class, run `livepeer push`, done**. The developer never touches trickle, protobuf, Docker, or orchestrator APIs. The schema-first design means AI coding agents (Claude, Cursor, Copilot) can generate Pipeline classes directly from natural language and integrate the result into Studio — the schema is the contract.

For the architectural rationale behind these choices — why classes over decorators, why `Input()` over Pydantic, why three protocols — see [`pipeline-sdk-architecture.md`](./pipeline-sdk-architecture.md).

---

## Quick Start

### 1. Define a Pipeline

```python
from livepeer_gateway.runner import Input, Output, Pipeline

class TextToImage(Pipeline):
    pipeline_id = "text-to-image"
    version = "1.0.0"
    description = "Generate images from text prompts"
    gpu = "A100"
    min_vram_gb = 24

    @classmethod
    def prepare_models(cls):
        # Download model weights (runs during Docker build)
        ...

    def setup(self):
        # Load model into GPU memory (runs at container start)
        self.model = load_model("/models/checkpoint.safetensors")

    def predict(
        self,
        prompt: str = Input(description="Text description of the image"),
        steps: int = Input(default=30, ge=1, le=100, description="Diffusion steps"),
        guidance_scale: float = Input(default=7.5, ge=1.0, le=20.0),
    ) -> Output(type="image", media_type="image/png"):
        return self.model.generate(prompt, steps=steps, guidance=guidance_scale)
```

### 2. Test Locally

```bash
# Run a prediction
livepeer predict my_pipeline.py -i prompt="a cat in space" -i steps=50

# Start a local HTTP server
livepeer serve my_pipeline.py

# Print the auto-generated JSON schema
livepeer schema my_pipeline.py
```

### 3. Deploy

```bash
# Download models (during Docker build)
livepeer prepare my_pipeline.py

# Package and push to the network
livepeer push my_pipeline.py

# Or build locally first
livepeer push my_pipeline.py --local
livepeer push my_pipeline.py --dry-run  # just see the Dockerfile
```

---

## Pipeline Types

### Pipeline (Request-Response)

For workloads that take an input and return a single result: text-to-image, image-to-image, audio transcription, etc.

```python
class ImageUpscale(Pipeline):
    pipeline_id = "image-upscale"
    gpu = "T4"

    def setup(self):
        self.model = load_upscaler()

    def predict(
        self,
        image: bytes = Input(media_type="image/png"),
        scale: int = Input(default=2, choices=[2, 4]),
    ) -> Output(type="image"):
        return self.model.upscale(image, scale)
```

### Pipeline with SSE Streaming (LLM)

When `predict()` yields values (is a generator), the SDK automatically streams responses as Server-Sent Events. This matches the pattern used by Replicate, OpenAI, and other LLM serving platforms.

```python
class TextGenerator(Pipeline):
    pipeline_id = "text-generator"
    gpu = "A100"

    def setup(self):
        self.model = load_llm()

    def predict(
        self,
        prompt: str = Input(description="The input prompt"),
        max_tokens: int = Input(default=256, ge=1, le=4096),
        temperature: float = Input(default=0.7, ge=0.0, le=2.0),
    ) -> Output(type="text_stream"):
        for token in self.model.generate(prompt, max_tokens=max_tokens, temp=temperature):
            yield token
```

**SSE response format:**
```
data: {"output": "Hello", "type": "token"}

data: {"output": " world", "type": "token"}

data: [DONE]
```

SSE is triggered by any of:
- `predict()` returning a generator (sync or async)
- `Output(type="text_stream")`
- Client sending `Accept: text/event-stream` header

### StreamPipeline (Real-Time)

For real-time video/audio processing with continuous frame-by-frame I/O via trickle transport and dynamic parameter updates.

```python
class StyleTransfer(StreamPipeline):
    pipeline_id = "style-transfer"
    gpu = "T4"

    def setup(self):
        self.model = load_style_model()
        self.current_style = "starry_night"

    def on_frame(
        self,
        frame: bytes,
        style: str = Input(default="starry_night", choices=["starry_night", "mosaic"]),
        strength: float = Input(default=0.8, ge=0.0, le=1.0),
    ) -> bytes:
        return self.model.apply(frame, style, strength)

    def on_params_update(self, params):
        # Called when the control channel sends parameter updates mid-stream
        if "style" in params:
            self.current_style = params["style"]
```

StreamPipelines support multi-modal input via typed callbacks — see `pipeline-sdk-architecture.md` for `on_video_frame` / `on_audio_frame` patterns.

---

## Communication Protocols

The SDK automatically selects the transport based on the workload. The developer writes Python; the SDK infers the protocol from the code.

| Workload | Protocol | Endpoint |
|---|---|---|
| Batch (image, audio, one-shot) | HTTP POST/response | `POST /predict` |
| LLM token streaming | SSE (`text/event-stream`) | `POST /predict` |
| Real-time video/audio | Trickle subscribe/publish | `POST /stream` |
| Parameter updates (streaming) | Control channel | via trickle control URL |

---

## API Endpoints

All pipeline servers expose:

| Endpoint | Method | Description |
|---|---|---|
| `/predict` | POST | Run inference (Pipeline only) |
| `/stream` | POST | Start streaming (StreamPipeline only) |
| `/schema` | GET | Auto-generated JSON Schema |
| `/health` | GET | Pipeline health state |
| `/pipelines` | GET | List all registered pipelines |

### Health states

The `/health` endpoint returns the pipeline's current state:

| State | HTTP status | Meaning |
|---|---|---|
| `loading` | 503 | Pipeline is loading model weights |
| `ready` | 200 | Pipeline is ready to accept requests |
| `error` | 503 | Pipeline encountered a fatal error |
| `idle` | 503 | Pipeline is loaded but not yet initialized |

```json
{
    "status": "ready",
    "pipeline_id": "text-to-image",
    "version": "1.0.0"
}
```

---

## Input / Output System

### `Input()`

Annotate `predict()` / `on_frame()` parameters with constraints and metadata:

```python
Input(
    description="Human-readable description",
    default=30,              # Default value (makes parameter optional)
    ge=1,                    # Minimum value (>=)
    le=100,                  # Maximum value (<=)
    min_length=1,            # Minimum string length
    max_length=1000,         # Maximum string length
    choices=[256, 512],      # Allowed values (enum)
    media_type="image/png",  # MIME type for binary inputs
)
```

### `Output()`

Declare the return type of `predict()`:

```python
Output(
    type="image",              # json | image | audio | video | text | text_stream
    media_type="image/png",    # MIME type for binary outputs
    description="Description",
)
```

---

## Pipeline Metadata

Pipeline classes declare identity and resource requirements as class attributes:

```python
class MyPipeline(Pipeline):
    pipeline_id = "my-pipeline"        # Unique ID (auto-derived from class name if omitted)
    version = "1.0.0"                  # Semantic version
    description = "What this does"     # Human-readable description
    gpu = "A100"                       # GPU type hint
    min_vram_gb = 24                   # Minimum VRAM requirement
    cpu_only = False                   # Set True for CPU-only pipelines
```

This metadata appears in:
- The JSON schema (`x-pipeline-id`, `x-version`, `x-gpu`, etc.)
- The `/health` endpoint response
- The `/pipelines` registry listing
- The Studio marketplace catalog (see [`studio.md`](./studio.md))

---

## Pipeline Lifecycle

```
1. prepare_models()        ← Docker build time: download weights
2. __init__()              ← Container start: construct instance
3. setup()                 ← Container start: load model into GPU
4. predict() / on_frame()  ← Runtime: handle requests
```

`prepare_models()` is a classmethod called separately from `setup()`. This enables downloading large model files during Docker image build so container startup only needs to load weights into memory.

---

## Pipeline Registry

Pipelines are automatically registered when loaded via the CLI. You can also register manually:

```python
from livepeer_gateway.runner import PipelineRegistry

PipelineRegistry.register(TextToImage)
PipelineRegistry.register(ImageUpscale)

# Look up by ID
cls = PipelineRegistry.get("text-to-image")

# List all registered
ids = PipelineRegistry.list()

# List with full metadata
info = PipelineRegistry.list_with_info()
```

---

## Schema Generation

The SDK introspects `predict()` / `on_frame()` signatures to generate JSON Schema automatically. This schema drives:

- Studio playground UI generation (form controls, validators)
- API documentation
- AI-agent code generation from natural language
- Request validation in the serve layer

Example output from `livepeer schema my_pipeline.py`:

```json
{
    "title": "TextToImage",
    "type": "object",
    "x-pipeline-id": "text-to-image",
    "x-version": "1.0.0",
    "description": "Generate images from text prompts",
    "properties": {
        "prompt": {
            "type": "string",
            "description": "Text description of the image"
        },
        "steps": {
            "type": "integer",
            "description": "Diffusion steps",
            "minimum": 1,
            "maximum": 100,
            "default": 30
        }
    },
    "required": ["prompt"],
    "x-gpu": "A100",
    "x-min-vram-gb": 24,
    "x-output": {
        "type": "image",
        "media_type": "image/png"
    }
}
```

---

## CLI Reference

| Command | Description |
|---|---|
| `livepeer predict <module> -i key=value` | Run local inference |
| `livepeer serve <module> [--host] [--port]` | Start HTTP server |
| `livepeer schema <module>` | Print JSON schema |
| `livepeer prepare <module>` | Download model artifacts |
| `livepeer push <module> [--tag] [--dry-run] [--local]` | Package and deploy |

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

---

## Architecture

The SDK lives inside the existing `livepeer-python-gateway` repo as a `runner` module:

```
livepeer-python-gateway/
  src/livepeer_gateway/
    runner/                 # New — run pipelines ON the network
      __init__.py           # Public API exports
      pipeline.py           # Pipeline, StreamPipeline base classes, health states
      inputs.py             # Input() and Output() descriptors
      schema.py             # Signature → JSON Schema
      serve.py              # HTTP server (PipelineServer, StreamPipelineServer)
      registry.py           # Pipeline discovery
      decorators.py         # @pipeline shortcut
      cli.py                # CLI entry point (predict, serve, schema, prepare, push)

    # Existing — shared transport (reused by runner)
    trickle_publisher.py
    trickle_subscriber.py
    channel_reader.py
    channel_writer.py
    control.py
    media_decode.py
    media_output.py
    lp_rpc_pb2.py
    ...
```

Three layers, one repo:
- `livepeer_gateway.runner` — "I run pipelines on the network" (this SDK)
- `livepeer_gateway.gateway` — "I route requests to the network" (future, eventually replaces Go gateway)
- `livepeer_gateway` (root) — Shared transport primitives (trickle, protobuf, media)

The serve layer is intentionally thin: it validates inputs, calls into the Pipeline, and serializes responses. Streaming I/O is delegated to the existing trickle transport primitives — the SDK reuses all existing transport code and does not reimplement trickle or media handling.

### End-to-end data flow

**Request-response:**
```
Developer's app
  → POST https://studio.livepeer.org/v1/run/text-to-image
  → Studio → Gateway → Orchestrator
  → Container: serve.py receives HTTP → calls predict() → returns result
  → Result flows back to developer's app
```

**Real-time streaming:**
```
User's browser (webcam)
  → WebRTC → Gateway
  → Trickle protocol → Orchestrator
  → serve.py: trickle_subscriber → on_frame() → trickle_publisher
  → Trickle → Gateway → WebRTC
  → User's browser (AI output)

Param updates: browser → control channel → on_params_update() kwargs
```

---

## Integration with the Rest of the Stack

- **Studio** consumes the schema to auto-generate catalog entries and playground UIs. Push a Python class, get a full product page in the marketplace with zero frontend code. See [`studio.md`](./studio.md).
- **Runtime** (orchestrator-side) pulls and runs the container the SDK produces, applies isolation (runc/gVisor/Kata) based on image policy, and advertises the capability. See [`runtime.md`](./runtime.md).
- **BYOC** is the mechanism by which SDK-built containers register on the network. The architectural contract between the SDK and BYOC is described in [`pipeline-sdk-architecture.md`](./pipeline-sdk-architecture.md#byoc-contract-alignment).

---

## Future Extensions

The following improvements are planned but not yet implemented:

### Pipeline Chaining

Chain multiple pipelines together inside a single container:

```python
# Future API (not yet implemented)
chain = PipelineChain([FaceDetect, StyleTransfer, Upscale])
```

This runs pipelines in sequence, passing output to input, using in-process queues. More practical than network-level chaining which would require routing between orchestrators with high latency.

### Pydantic Parameter Models

Optional Pydantic integration for developers who prefer separate parameter classes:

```python
# Future API (not yet implemented)
class Params(BaseModel):
    prompt: str = Field(description="...")
    steps: int = Field(default=30, ge=1, le=100)
```

### Artifact Declaration

Declarative model dependencies so the framework knows what to download:

```python
# Future API (not yet implemented)
class MyPipeline(Pipeline):
    artifacts = [
        HuggingFaceModel("stabilityai/sdxl-turbo"),
    ]
```

### Progress Callbacks

Report loading progress during `setup()` for Studio UI:

```python
# Future API (not yet implemented)
def setup(self, progress=None):
    progress("Loading VAE...", 0.3)
    progress("Loading UNet...", 0.7)
```

### Decorator Shortcut

A thin decorator for simple stateless pipelines (class-based remains primary):

```python
# Future API (not yet implemented)
@livepeer.pipeline(gpu="A100")
def upscale(image: bytes = Input(...)) -> Output(type="image"):
    return do_upscale(image)
```

This creates a Pipeline class under the hood. Inspired by Modal/Chutes decorator patterns, but the class-based approach remains the primary interface since AI models are inherently stateful (load weights once, predict many times).

### Pipeline Discovery via Entry Points

Publish pipelines as pip packages that are auto-discovered:

```toml
# Future: pyproject.toml
[project.entry-points."livepeer.pipelines"]
my-pipeline = "my_package:MyPipeline"
```

### Synchronized A/V

`on_av_frame(video, audio)` receiving temporally aligned pairs, for pipelines that need true multi-modal synchronization (lip sync, audio-reactive visuals). Requires a sync buffer — deferred until there's a concrete use case.
