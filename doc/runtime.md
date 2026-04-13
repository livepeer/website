# Livepeer Runtime — Orchestrator-Side Execution

This document covers the orchestrator-side runtime layer of go-livepeer: how worker hardware is classified and discovered, how jobs are filtered and routed to appropriate workers, how containers are isolated, and how custom third-party containers are supported through BYOC.

## Overview

The runtime layer sits between the Livepeer network protocol (discovery, payment, routing) and the actual AI workload (the container executing inference). It is responsible for:

- **Hardware classification** — knowing what GPU tier each worker offers (consumer, datacenter, CC-capable)
- **Worker property filtering** — matching a job's requirements (model, VRAM, region) against available workers
- **Container isolation** — running containers with appropriate sandboxing (runc, gVisor, Kata) based on trust level
- **Custom containers (BYOC)** — letting operators run third-party AI containers with verified images and enforced isolation
- **Trust tiers** — combining hardware, isolation, and image policy into a routable "trust level" for the gateway

These concerns are entangled: hardware-aware routing only matters if the hardware tier is trustworthy, and custom containers only make sense if they run in isolation that matches their trust level. This doc treats them as one system.

---

## Current State

### What exists in go-livepeer today

| Area | File | What it does |
|---|---|---|
| Container lifecycle | `ai/worker/docker.go` | Pull, warm, borrow, return, health-check containers via `DockerManager` |
| gVisor runtime | `ai/worker/runtime.go` | Downloads & installs runsc binary; basic `--ai-runtime gvisor` support |
| Hardware info | `net/lp_rpc.proto` | `HardwareInformation` + `GPUComputeInfo` (name, memory, compute version) |
| Capability bitstring | `core/capabilities.go` | 38 capabilities defined, including `Capability_BYOC` |
| Remote AI workers | `core/ai_orchestrator.go` | Remote worker management with capacity tracking |
| Selection algorithm | `server/selection_algorithm.go` | Probability-based + live selection |
| Orchestrator discovery | `server/rpc.go`, `core/orchestrator.go` | `OrchestratorInfo` returned with hardware info to gateways |

### Discovery flow today

```
Stage 1: On-Chain             Stage 2: Pool Cache          Stage 3: Job Request
──────────────────            ────────────────────         ────────────────────
ServiceURI (URL)              + Capabilities               + AvailableCapacity
EthereumAddr                  + CapabilitiesPrices          + Price
Stake                         + Hardware (GPU specs)        + TicketParams
PricePerPixel                 + Score / Latency
```

1. **On-chain registration:** Orchestrator calls `setServiceURI()` on the ServiceRegistry contract.
2. **Pool cache:** Gateway periodically calls `GetOrchestratorInfo()` on each orchestrator (default every 25 minutes via `liveAICapReportInterval`), caching capabilities, hardware, and pricing.
3. **Job request:** Gateway requests tokens from orchestrators in parallel via `GET /process/token`, filters by capacity > 0.

`OrchestratorInfo` already includes `Capabilities`, `Hardware`, and `CapabilitiesPrices`. The `remoteDiscoveryPool` indexes orchestrators by capability key (e.g., `"pipeline/modelid"`).

### Worker registration

Workers register with their orchestrator via `POST /capability/register`:

```json
{
  "name": "llm-inference",
  "url": "http://worker:8080",
  "capacity": 4,
  "price_per_unit": 100
}
```

`RegisterCapability()` is idempotent — re-calling updates the existing entry in the orchestrator's memory immediately.

### What's missing

- GPU class/tier classification (consumer vs datacenter vs CC-capable)
- Hardware-aware job routing at the gateway level
- Worker property filtering beyond capacity + URL allow/deny lists
- Container isolation enforcement appropriate for GPU workloads
- Custom container image support (currently hardcoded to `livepeer/ai-runner:*`)
- Container image verification (signatures, allowlists)
- Resource limits and network isolation per container

---

## Problem Statement

Current job routing can filter only on:
- Include/exclude lists of orchestrator URLs
- `capacity > 0`

This is too coarse. A request for FLUX.1 can land on a worker running only Stable Diffusion 1.5, causing failures. Operators cannot express "route only to A100+ workers" or "route only to orchestrators offering VM-level isolation." And once a container is selected, there is no enforced isolation boundary — everything runs as a plain Docker container with the NVIDIA runtime, trusting that the image is benign.

We need three things, in sequence:
1. **Know** what hardware each worker has (tier classification).
2. **Filter** workers by arbitrary properties (model loaded, VRAM, region, isolation tier).
3. **Isolate** containers — especially custom/untrusted ones — at a level appropriate to their trust and GPU needs.

---

## How Other Platforms Handle This

We surveyed 7 decentralized compute platforms and 3 centralized platforms to understand common patterns for node filtering and hardware declaration.

| Platform | Approach | Trust model |
|---|---|---|
| **Replicate** | Fixed hardware SKUs (`gpu-t4`, `gpu-h100`) bound at deploy time | Centralized |
| **Modal** | Typed enum + ordered fallback (`gpu=["H100", "A100"]`) | Centralized |
| **Chutes** | Pydantic-validated `NodeSelector` struct (5 fields) | Hardware attestation (GraVal + Intel TDX) |
| **Akash** | Declarative SDL manifest with auditor-signed attributes (`signedBy`) | 3rd-party auditor signs |
| **Golem** | Bidirectional demand/offer matching with LDAP-like constraint syntax | Reputation + constraints |
| **Nosana** | Market segmentation by hardware class; jobs posted to a market | Hardware auto-detection |
| **io.net** | Ray-based numeric resource scheduling via a centralized head node | Centralized scheduler |
| **Render** | 3-tier reputation system + approved GPU list per subnet | Reputation over time |
| **Ritual / Infernet** | Container-level config (which containers a node can run) | Self-declared |
| **Kubernetes** | `nodeSelector` → node affinity → taints/tolerations (3 stages) | Cluster trust |
| **Ray** | Numeric resource model + `accelerator_type` | Cluster trust |

**Key observation:** no surveyed platform uses a generic key-value filter engine with string-embedded operators as its primary mechanism. The dominant patterns are (1) typed structs with ~5–10 fields, (2) declarative manifests backed by auditor signatures, or (3) market segmentation by hardware class.

**Kubernetes node affinity** is the instructive reference for operator design — operators (`In`, `NotIn`, `Exists`, `Gt`, `Lt`) are a separate field, not embedded in the value string; required vs preferred are distinct; OR between terms, AND within a term.

---

## GPU Tier Classification

### Tier enum

Add a GPU tier to `net/lp_rpc.proto`:

```protobuf
enum GPUTier {
  GPU_TIER_UNKNOWN = 0;
  GPU_TIER_CONSUMER = 1;       // RTX 3090, 4090
  GPU_TIER_DATACENTER = 2;     // A100, L40
  GPU_TIER_CC_CAPABLE = 3;     // H100, H200, B100, B200
}

message GPUComputeInfo {
  // ... existing fields ...
  GPUTier tier = 8;
  bool cc_enabled = 9;          // Actually running in CC mode
  bytes attestation_report = 10; // Optional CC attestation
}
```

### Detection & classification

New file: `ai/worker/gpu_classify.go`

- Map GPU names to tiers via a lookup table ("H100" → CC_CAPABLE, "A100" → DATACENTER, "RTX 4090" → CONSUMER).
- Parse the GPU name from the existing `GPUComputeInfo.name` field.
- Detect CC mode via NVIDIA driver sysfs/NVML (when available).
- Populate the new tier fields when `HardwareInformation` is built in `ai/worker/container.go`.

### Gateway-side selection

Files: `server/selection_algorithm.go`, `server/selection.go`, `discovery/discovery.go`, `server/rpc.go`, `core/orchestrator.go`

- Add `RequiredGPUTier` field to job/session requests.
- Extend `ProbabilitySelectionAlgorithm.Select()` to filter orchestrators by GPU tier before scoring.
- Add `HardwareFilter` predicate in `discovery/discovery.go` for pool filtering.
- Gateway CLI flag: `--min-gpu-tier` (default: `0`/any).
- Cache hardware tier at orchestrator startup (no need to re-detect per request).

**Deliverable:** Gateway filters orchestrators by GPU class. Jobs requiring CC-capable hardware route only to H100+ nodes.

---

## Worker Property Filtering

### Problem with gateway-side generic filters

A parallel filtering pipeline that pushes all worker metadata up to the gateway (via a new `/process/options` endpoint, attached to every `JobToken`, re-evaluated on the gateway) would:

- **Duplicate discovery** — `GetOrchestratorInfo()` and `remoteDiscoveryPool` already serve this purpose.
- **Add no trust** — the gateway would be re-evaluating self-reported data against itself.
- **Use stale data** — the 25-minute pool cache is far staler than live in-memory worker registration.
- **Introduce operator-in-string ambiguity** — embedding operators in filter values (`">=24"`) creates parsing ambiguity.

### Recommended architecture: filter at the orchestrator

The orchestrator already knows its workers from registration. Rather than attaching all worker metadata to every token:

1. **Add `Properties map[string]interface{}` to `ExternalCapability`** — set at worker registration time, updates when the worker re-registers (immediate, in-memory, no cache staleness).
2. **Pass requirements to the orchestrator** in the token request — `GET /process/token?capability=X&requirements=...`.
3. **Orchestrator filters its own workers** using live in-memory data.
4. **Return a token only if a matching worker exists** — the gateway does not need its own filter engine.

This eliminates: the gateway-side `options_filter.go`, `WorkerOptions` on `JobToken`, `/process/options` for routing (keep for discovery/UI), and the `FetchCapabilityOptions` fan-out.

### Filter format

For a decentralized network where operators run heterogeneous hardware, a **generic `map[string]string`** filter is the right choice. A typed struct requires a code release for every new filterable property — exactly the rigidity operators are trying to escape.

Improvements over embedding operators in the value string:
- **Separate operator from value** — eliminates parsing ambiguity (what if a legitimate value starts with `>`?).
- **Return a reason on mismatch** — aids debugging (typo in key? wrong operator? missing property?).

### The `/process/options` endpoint

Keep it for **discovery purposes** ("what's available on the network?") but don't use it for per-request routing decisions. The gateway already has capability data from the pool cache.

### Capabilities map restructure

The change from `map[string]*ExternalCapability` to `map[string]map[string]*ExternalCapability` enables per-runner tracking and is valuable. It's a significant refactor touching all capability access paths and should be its own PR.

---

## Container Isolation Tiers

### The GPU problem

AI inference containers need direct GPU access via NVIDIA kernel modules. This constrains which isolation technologies are viable:

| Approach | GPU support | Isolation level | Overhead | Status |
|---|---|---|---|---|
| **Kata + Cloud Hypervisor** | Full (VFIO passthrough) | Strong (lightweight VM) | Low-medium | Recommended |
| **Kata + QEMU** | Full (VFIO passthrough) | Strong (VM) | Medium | Mature fallback |
| **gVisor + nvproxy** | Partial (experimental) | Medium (syscall filter) | Low | Limited CUDA support |
| **Plain containers + NVIDIA runtime** | Full | Weak (namespaces only) | Lowest | Current default |

### Tier definitions

| Tier | Runtime | GPU | Use case |
|---|---|---|---|
| **Tier 0 — None** | Default Docker (runc) | NVIDIA runtime | Trusted Livepeer images, development |
| **Tier 1 — Syscall filter** | gVisor (runsc) | nvproxy (limited) | CPU-only or light GPU tasks |
| **Tier 2 — VM isolation** | Kata + Cloud Hypervisor | VFIO passthrough | Custom/untrusted containers needing GPU |
| **Tier 3 — Confidential** | Kata + CC hardware | VFIO + CC attestation | Sensitive data, privacy-required inference |

### Why Kata over gVisor for GPU workloads

gVisor intercepts syscalls in userspace and uses `nvproxy` for experimental GPU support. This has three fundamental limitations for production CUDA workloads:

1. **nvproxy coverage** — Not all NVIDIA ioctls are implemented; complex CUDA operations (multi-stream, unified memory, NCCL) may fail.
2. **Driver compatibility** — Each NVIDIA driver update can introduce new ioctls nvproxy doesn't handle.
3. **Performance** — Syscall interception adds latency to every GPU kernel launch.

Kata with VFIO passthrough gives the GPU direct access to a real kernel, so all CUDA operations work natively with no compatibility risk.

### When gVisor remains the right choice

- CPU-only inference (ONNX Runtime, lightweight models)
- Preprocessing / postprocessing containers
- Containers that do not need GPU access
- Development / testing environments where Kata is unavailable

### Implementation

**New file:** `ai/worker/runtime_kata.go`
- Detect Kata runtime availability (`kata-runtime` or `kata-fc` in Docker daemon config)
- Configure VFIO GPU passthrough for Kata containers
- Health-check that Kata runtime + GPU passthrough is functional before accepting isolated jobs
- Operator config: `--ai-runtime kata|gvisor|runc` (default: `runc`)

**Hardening `ai/worker/runtime.go` (gVisor):**
- Verify runsc binary integrity (checksum enforcement)
- Health-check that gVisor is actually functional before accepting jobs
- Log clearly when gVisor is selected for a GPU workload (warn about nvproxy limitations)

**Per-container runtime selection in `ai/worker/docker.go`** (in `createContainer()`):
1. **Image trust level** — Livepeer-signed → runc (Tier 0); unknown → Kata (Tier 2)
2. **GPU requirement** — GPU-heavy → Kata (not gVisor); CPU-only → gVisor is fine
3. **Operator config** — `--ai-runtime` flag as override
4. **Job request** — Gateway can request a specific isolation tier

Add a `runtime` field to `RunnerContainer` for tracking.

### Security hardening (all runtimes)

Applied to `createContainer()` HostConfig regardless of runtime:
- Seccomp profile (default Docker profile at minimum)
- Drop all Linux capabilities, add back only what is needed (`SYS_ADMIN` for GPU)
- Read-only root filesystem where possible
- Network isolation: `--network none` for inference containers (they only need GPU + model volume)
- Memory/CPU limits from operator config
- PID limits to prevent fork bombs

### Reporting isolation status

```protobuf
enum IsolationType {
  ISOLATION_NONE = 0;       // runc (default Docker)
  ISOLATION_GVISOR = 1;     // Syscall filtering
  ISOLATION_KATA = 2;       // VM-based (Cloud Hypervisor / QEMU)
  ISOLATION_CC = 3;         // Confidential Computing (Kata + CC hardware)
}

// Added to HardwareInformation or OrchestratorInfo:
IsolationType isolation_type = N;
```

The gateway can then route sensitive workloads to appropriately isolated orchestrators.

---

## Custom Containers (BYOC)

### Image policy

**New file:** `ai/worker/image_policy.go`

```go
type ImagePolicy struct {
    AllowedRegistries []string          // e.g., ["docker.io/livepeer", "ghcr.io/livepeer"]
    AllowedImages     []string          // Exact image names
    PinnedDigests     map[string]string // image -> sha256 digest
    RequireSignature  bool
    SigningKeys       []string          // cosign public keys
}
```

- Allowlist of trusted image registries/repos (configurable via CLI/config)
- Image signature verification using cosign/notary
- Image hash pinning (operator can pin exact digests)
- Default policy: only `livepeer/*` images; operator opts in to custom images

### Dynamic container registration

Files: `ai/worker/docker.go`, `core/ai.go`

Extend `AIModelConfig` to accept custom container images:

```
--aiModels pipeline=custom-model,model_id=my-model,container_image=myregistry/my-runner:v1
```

- `DockerManager.Warm()` and `Borrow()` use the model config's container image instead of hardcoded `livepeer/ai-runner:*`
- The existing `ImageOverrides` in `docker.go` partially supports this — extend it to per-model
- **Custom containers requiring GPU must use Kata isolation (Tier 2+)** unless explicitly trusted via image policy

### Container interface contract

**New file:** `ai/worker/container_interface.go`

Define the HTTP API contract that custom containers must implement:

| Endpoint | Response |
|---|---|
| `GET /health` | `{"status": "IDLE"\|"LOADING"\|"ERROR"}` |
| `GET /hardware/info` | `HardwareInformation` JSON |
| `POST /{pipeline}` | Pipeline-specific request/response |

Document this as a spec for third-party container builders. (The Pipeline SDK — see `pipeline-sdk.md` — is the canonical way to author containers that implement this contract.)

### Resource isolation per container

In `ai/worker/docker.go`:
- GPU memory partitioning via NVIDIA MIG (on supported hardware) or `CUDA_MEM_LIMIT`
- Read-only model directory mount, no host filesystem access
- Tmpfs for scratch space with size limits
- Container-specific environment (no host env leakage)

### Capability advertisement

Files: `core/capabilities.go`, `net/lp_rpc.proto`

- Custom containers register as `Capability_BYOC` (already in proto)
- The `constraint` field carries the custom pipeline/model identifier
- The gateway discovers custom capabilities through the existing capability-constraints system
- Pricing is set per custom model via the existing `SetBasePriceForCap` mechanism

---

## Unified Trust Tiers

Combining hardware, isolation, and image policy:

| Trust tier | Hardware | Isolation | Container policy | Use case |
|---|---|---|---|---|
| **Tier 3 — Open** | Any | None (runc) | Livepeer images only | Standard AI inference |
| **Tier 2 — Sandboxed** | Any | Kata VM | Verified custom images | Semi-trusted custom models |
| **Tier 1 — Confidential** | H100+ | CC mode + Kata | Any verified image | Sensitive data processing |

Attestation flow for CC-capable nodes:
1. Orchestrator generates NVIDIA CC attestation report on startup
2. Attestation is included in `OrchestratorInfo` response
3. Gateway/client verifies attestation before sending sensitive data
4. On-chain attestation registry (optional, longer term)

Monitoring:
- Per-container isolation type in Prometheus metrics
- Alert on isolation downgrades (Kata unavailable → falling back to runc)
- Container escape detection (unexpected host namespace access)

---

## Phased Implementation

### Phase 1 — Hardware-aware orchestrator selection

**Goal:** Gateways route jobs by GPU tier.

Files modified: `net/lp_rpc.proto`, `ai/worker/container.go`, `server/selection_algorithm.go`, `server/selection.go`, `discovery/discovery.go`, `server/rpc.go`, `core/orchestrator.go`
Files created: `ai/worker/gpu_classify.go`

### Phase 2 — Container isolation enforcement

**Goal:** Containers run with isolation matching their trust level and GPU needs.

Files modified: `ai/worker/runtime.go`, `ai/worker/docker.go`, `net/lp_rpc.proto`
Files created: `ai/worker/runtime_kata.go`

### Phase 3 — Worker property filtering + custom containers (BYOC)

**Goal:** Orchestrators run arbitrary verified AI containers; jobs filter on worker properties.

Files modified: `ai/worker/docker.go`, `core/ai.go`, `core/capabilities.go`, `core/external_capabilities.go`
Files created: `ai/worker/image_policy.go`, `ai/worker/container_interface.go`

### Phase 4 — Trust tiers + attestation (future)

Unified enforcement combining Phases 1–3; CC attestation flow; monitoring.

### Execution order

**Phase 1 → Phase 2 → Phase 3 → Phase 4** (sequential, each builds on the previous)

- Phase 1 is foundational — everything depends on knowing what hardware you're routing to.
- Phase 2 should precede Phase 3: establish isolation *before* allowing custom containers.
- Phase 3 benefits from Phase 2's security foundation.

---

## Trust Roadmap: Hardware Verification

Worker options are self-reported today. In a decentralized network this is a trust gap. Recommended phases:

**Phase A — NVML hardware queries.**
Use [NVIDIA NVML](https://developer.nvidia.com/management-library-nvml) (Go: [go-nvml](https://github.com/NVIDIA/go-nvml)) to read actual GPU identity at registration time. A worker cannot claim A100 if `device.GetName()` returns "Tesla T4".

**Phase B — Orchestrator-signed attestation.**
Orchestrators sign hardware claims with their staked ETH key. Creates economic accountability: the signature is verifiable against the on-chain staked address.

**Phase C — Challenge-response verification.**
Orchestrator sends a compute challenge (timed matrix multiplication + VRAM allocation) to the worker at registration. Timing proves GPU class (a T4 physically cannot match A100 performance). VRAM allocation proves memory capacity. Similar to Chutes' GraVal.

**Phase D — Audited attributes (Akash model).**
A trusted auditor verifies hardware and signs the claim. Clients specify `signedBy` in their requirements. Decouples trust from self-reporting.

---

## References

### Decentralized compute platforms
- [Akash Network — SDL Specification](https://github.com/akash-network/docs/blob/master/readme/stack-definition-language.md)
- [Akash Network — Audited Attributes](https://akash.network/docs/providers/audited-attributes/)
- [Chutes.ai — Node Selection](https://chutes.ai/docs/core-concepts/node-selection)
- [Chutes.ai — Security Architecture](https://chutes.ai/docs/core-concepts/security-architecture)
- [Golem Network — Provider Selection](https://docs.golem.network/docs/creators/javascript/examples/selecting-providers)
- [Golem Network — Reputation System](https://docs.golem.network/docs/reputation)
- [Nosana — Job Execution Flow](https://learn.nosana.com/deployments/jobs/job_execution_flow)
- [Render Network — How It Works](https://rendernetwork.com/how-it-works)
- [io.net — Developer Docs](https://developers.io.net/docs/overview)
- [Ritual — Infernet Node](https://github.com/ritual-net/infernet-node)

### Centralized platforms
- [Replicate — Model Hardware](https://replicate.com/docs/topics/models/hardware)
- [Modal — GPU Acceleration](https://modal.com/docs/guide/gpu)

### Scheduling & filtering
- [Kubernetes — Assigning Pods to Nodes](https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/)
- [Ray — Resources & Scheduling](https://docs.ray.io/en/latest/ray-core/scheduling/resources.html)

### Hardware verification
- [NVIDIA NVML API Reference](https://docs.nvidia.com/deploy/nvml-api/group__nvmlDeviceQueries.html)
- [NVIDIA go-nvml Go Bindings](https://github.com/NVIDIA/go-nvml)
- [NVIDIA Attestation Documentation](https://docs.nvidia.com/attestation/index.html)

### Container isolation
- [Kata Containers](https://katacontainers.io/)
- [Cloud Hypervisor](https://www.cloudhypervisor.org/)
- [gVisor — nvproxy](https://gvisor.dev/docs/user_guide/gpu/)
- [NVIDIA Confidential Computing](https://www.nvidia.com/en-us/data-center/solutions/confidential-computing/)
