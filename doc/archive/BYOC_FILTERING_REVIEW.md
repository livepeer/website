# BYOC Options Filtering — Research & Recommendations

Research conducted for review of [Cloud-SPE/go-livepeer#3](https://github.com/Cloud-SPE/go-livepeer/pull/3).

## Problem Statement

The current BYOC filtering is too limited. Jobs can only be routed using:
- Include/exclude lists based on orchestrator URLs
- Basic capacity > 0 checks

This means a request for FLUX.1 model execution can land on a worker running only Stable Diffusion 1.5, causing failures and wasting resources. Operators need the ability to filter on worker-level properties such as GPU type, VRAM, loaded model, and other dynamic capabilities.

## How Other Platforms Handle Node Filtering

We surveyed 7 decentralized compute platforms and 3 centralized platforms to understand common patterns.

### Centralized Platforms

#### Replicate — Fixed Hardware SKUs
- Single hardware SKU string: `"gpu-t4"`, `"gpu-a40-large"`, `"gpu-h100"`
- Set at model creation or deployment time, not per-request
- No dynamic filtering — you bind a model to hardware
- [Docs](https://replicate.com/docs/topics/models/hardware)

#### Modal — Typed Enum + Ordered Fallback List
```python
@app.function(gpu="H100")           # single GPU
@app.function(gpu="H100:8")         # multi-GPU
@app.function(gpu=["H100", "A100"]) # fallback list
```
- GPU is a typed enum from a known set
- Supports ordered fallback: "try H100 first, then A100"
- No generic key-value filtering
- [Docs](https://modal.com/docs/guide/gpu)

#### Chutes.ai — Typed Struct (5 Fields) + Hardware Attestation
```python
NodeSelector(
    gpu_count=1,
    min_vram_gb_per_gpu=24,
    include=["a100", "h100"],
    exclude=["k80", "v100"],
    max_hourly_price_per_gpu=2.50,
)
```
- Pydantic-validated struct with explicit fields
- Hardware verified via GraVal (CUDA timing challenges) and Intel TDX attestation
- Miner-side scheduler (Gepetto) ranks chutes by profitability
- [Docs](https://chutes.ai/docs/core-concepts/node-selection), [Source](https://github.com/chutesai/chutes/blob/main/chutes/chute/node_selector.py)

### Decentralized Platforms

#### Akash Network — Declarative Manifest (SDL) + Audited Attributes
```yaml
profiles:
  compute:
    gpu-profile:
      resources:
        gpu:
          units: 1
          attributes:
            vendor:
              nvidia:
                - model: a100
                  interface: sxm
  placement:
    us-east:
      attributes:
        datacenter: equinix-metal-ewr1
      signedBy:
        anyOf:
          - akash1365yvmc4s7aw...   # trusted auditor address
```
- Providers claim attributes, but a trusted third-party auditor must sign those claims on-chain
- Tenants choose which auditors they trust via `signedBy`
- No `signedBy` = self-reported only (buyer beware)
- Reverse auction: providers bid on deployments, lowest price wins
- [SDL Docs](https://github.com/akash-network/docs/blob/master/readme/stack-definition-language.md), [Audited Attributes](https://akash.network/docs/providers/audited-attributes/)

#### Golem Network — Bidirectional Demand/Offer Matching
- Both sides declare **properties** (what I have) and **constraints** (what I need)
- Constraints use an LDAP-filter-like syntax with typed operators
- The market resolver evaluates constraints in both directions — both must match
- Reputation system on top: success rate, uptime, price fairness
- Supports dynamic properties resolved at match time by the node
- [Provider Selection](https://docs.golem.network/docs/creators/javascript/examples/selecting-providers), [Reputation](https://docs.golem.network/docs/reputation)

#### Render Network — Reputation Tiers + GPU Matching
- 3-tier system: Tier 1 (trusted partners), Tier 2 (high quality), Tier 3 (economy)
- GPU matching based on an approved GPU list per subnet
- Rotational logic: underutilized nodes get priority
- Epoch-based rankings determine scheduling order
- [How It Works](https://rendernetwork.com/how-it-works)

#### Nosana — Market Segmentation by Hardware Class
- Nodes auto-report hardware (GPU type, RAM, CPU cores) via the Nosana Container Engine
- Network is divided into compute markets — groups of similar hardware
- Jobs are posted to a specific market, not filtered against individual nodes
- [Docs](https://learn.nosana.com/deployments/jobs/job_execution_flow)

#### io.net — Ray-Based Scheduling
- Built on a fork of Ray — uses Ray's numeric resource model
- Head node schedules tasks onto workers based on declared GPU resources
- Users select GPU type via API; platform handles placement
- Centralized head node acts as scheduler
- [Docs](https://developers.io.net/docs/overview)

#### Ritual/Infernet — Container-Level Configuration
- Nodes declare which containers they can run and their payment terms
- Routing is at the container level, not the hardware level
- New "Resonance" protocol adds a fee market for compute routing
- [Source](https://github.com/ritual-net/infernet-node)

### Kubernetes — The Industry Reference for Node Filtering

Kubernetes evolved through 3 stages of node filtering, which is instructive:

**Stage 1: `nodeSelector`** — Simple key-value exact match (like the PR's string match)
```yaml
nodeSelector:
  gpu-type: "a100"
```

**Stage 2: Node Affinity** — Structured operators with required/preferred distinction
```yaml
affinity:
  nodeAffinity:
    requiredDuringSchedulingIgnoredDuringExecution:
      nodeSelectorTerms:
      - matchExpressions:
        - key: gpu-type
          operator: In
          values: ["a100", "h100"]
        - key: vram-gb
          operator: Gt
          values: ["40"]
    preferredDuringSchedulingIgnoredDuringExecution:
    - weight: 80
      preference:
        matchExpressions:
        - key: region
          operator: In
          values: ["us-east"]
```

Key design choices:
- Operators (`In`, `NotIn`, `Exists`, `DoesNotExist`, `Gt`, `Lt`) are a separate field, not embedded in the value string
- Two modes: required (hard fail) vs preferred (soft, weighted)
- OR between terms, AND within a term

**Stage 3: Taints & Tolerations** — Nodes repel pods unless explicitly tolerated

- [Assigning Pods to Nodes](https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/)

### Ray — Resource-Based Scheduling
```python
@ray.remote(num_gpus=1, accelerator_type="A100")
def train(): pass

# Custom resources for placement control
ray start --resources='{"special_hardware": 1}'

@ray.remote(resources={"special_hardware": 1})
def specialized_task(): pass
```
- Numeric resource model: nodes declare resources, tasks request them
- Resources are static after startup
- `accelerator_type` for GPU model filtering
- [Docs](https://docs.ray.io/en/latest/ray-core/scheduling/resources.html)

## Summary of Patterns

| Approach | Used By | Trust Model |
|----------|---------|-------------|
| Typed struct (5-10 fields) | Chutes, Modal | Hardware attestation |
| Declarative manifest (YAML/SDL) | Akash | Audited attributes (3rd party signs) |
| Market segmentation | Nosana | Hardware auto-detection |
| Reputation tiers | Render, Golem | Track record over time |
| Bidirectional constraint matching | Golem | Reputation + constraints |
| Generic key-value filter | **This PR** | Self-reported (none) |

**No surveyed platform uses a generic key-value filter engine with string-embedded operators as their primary mechanism.**

## How Livepeer Discovery Works Today

Understanding the existing discovery pipeline is essential to evaluate the PR.

### Discovery Flow

```
Stage 1: On-Chain             Stage 2: Pool Cache          Stage 3: Job Request
──────────────────            ────────────────────         ────────────────────
ServiceURI (URL)              + Capabilities               + AvailableCapacity
EthereumAddr                  + CapabilitiesPrices          + Price
Stake                         + Hardware (GPU specs)        + TicketParams
PricePerPixel                 + Score / Latency
```

1. **On-chain registration:** Orchestrator calls `setServiceURI()` on the ServiceRegistry contract
2. **Pool cache:** Gateway periodically calls `GetOrchestratorInfo()` on each orchestrator (default every 25 minutes via `liveAICapReportInterval`), caching capabilities, hardware, and pricing
3. **Job request:** Gateway requests tokens from orchestrators in parallel via `GET /process/token`, filters by capacity > 0

### Existing Data Already Available

`OrchestratorInfo` (fetched during pool cache) already includes:
- `Capabilities` — what the orchestrator can do
- `Hardware` — GPU specs (via `WorkerHardware`)
- `CapabilitiesPrices` — per-capability pricing

The `remoteDiscoveryPool` already indexes orchestrators by capability key (e.g., `"pipeline/modelid"`).

### Worker Registration

Workers register via `POST /capability/register` with:
```json
{
  "name": "llm-inference",
  "url": "http://worker:8080",
  "capacity": 4,
  "price_per_unit": 100
}
```

`RegisterCapability()` is idempotent — re-calling updates the existing entry. Properties would update immediately in the orchestrator's memory.

## Analysis of the PR's Approach

### What the PR Does

The PR builds a parallel filtering pipeline:

1. Workers expose metadata via a new `/process/options` endpoint
2. Orchestrator caches worker options and attaches them to `JobToken.WorkerOptions`
3. Gateway evaluates `map[string]string` filters against worker options using `AnyOptionsMatch()`
4. New `EvaluateOptions()` engine supports: exact match (case-insensitive), boolean, and numeric comparisons (`>`, `<`, `>=`, `<=`)
5. `ExternalCapabilities` map restructured from `map[string]*ExternalCapability` to `map[string]map[string]*ExternalCapability` for per-runner tracking

### What's Good

- Solves a real problem — the FLUX.1 vs SD1.5 routing example is a valid use case
- `EvaluateOptions()` is clean and self-contained
- Test coverage for the filter engine and gateway integration
- Thread-safe design with proper mutex usage
- Race condition fix for cached pointer mutations
- Architecture doc included
- Kafka SASL was split to a separate PR (cleaned up after initial review)

### Concerns

1. **Parallel discovery system** — `/process/options` endpoint + `FetchCapabilityOptions()` fan-out duplicates what `GetOrchestratorInfo()` and `remoteDiscoveryPool` already do

2. **Gateway-side filtering on self-reported data** — The gateway re-evaluates worker options that were self-reported by the orchestrator. This doesn't add trust — it's checking the orchestrator's claims against themselves

3. **Operator-in-string ambiguity** — Filter values like `">=24"` embed operators in the value string. This works but creates parsing ambiguity (what if a value legitimately starts with `>`?)

4. **No error feedback** — `EvaluateOptions()` returns `bool` only. No indication of why a filter failed (typo in key? wrong operator? missing property?)

5. **Capabilities map restructure bundled in** — The `map[string]*ExternalCapability` → `map[string]map[string]*ExternalCapability` change is a significant refactor that could be its own PR

6. **Test coverage gaps** — No tests for `/process/options` endpoint, `getNetworkCapabilities` fan-out, concurrent access, dynamic property updates, or negative integration scenarios

## Recommendations

### On the Filter Format: Keep Generic `map[string]string`

For a decentralized network where different operators run different hardware and configurations, a generic key-value filter is the right choice. A typed struct would require code changes and releases for every new filterable property — that's the rigidity that operators are trying to escape.

**Improvement:** Consider separating operator from value to eliminate parsing ambiguity, or document clearly that operators are always a prefix. Also consider returning a reason on filter mismatch for debuggability.

### On Architecture: Filter at the Orchestrator

The orchestrator already knows its workers from registration. Rather than attaching all worker metadata to every token and having the gateway re-evaluate:

1. **Add `Properties map[string]interface{}` to `ExternalCapability`** — set at worker registration time, updates when worker re-registers (immediate, in-memory)
2. **Pass requirements to the orchestrator** in the token request — `GET /process/token?capability=X&requirements=...`
3. **Orchestrator filters its own workers** using live in-memory data (not a 25-min stale cache)
4. **Return a token only if a matching worker exists** — gateway doesn't need a filter engine

This removes the need for: `options_filter.go` on the gateway, `WorkerOptions` on `JobToken`, `/process/options` endpoint for routing (keep for discovery/UI), and the `FetchCapabilityOptions` fan-out.

### On the `/process/options` Endpoint

Keep it for **discovery purposes** (answering "what's available on the network?") but don't use it for per-request routing decisions. The gateway already has capability data from the pool cache.

### On the Capabilities Map Restructure

The `map[string]map[string]*ExternalCapability` change enables per-runner tracking and is valuable, but it's a significant refactor touching all capability access paths. Consider splitting it into its own PR.

### Future: Hardware Verification

Worker options are self-reported. In a decentralized network, this is a trust gap. Recommended phases:

**Phase 1 — NVML Hardware Queries:**
Use [NVIDIA NVML](https://developer.nvidia.com/management-library-nvml) (Go bindings: [go-nvml](https://github.com/NVIDIA/go-nvml)) to read actual GPU identity at registration time. Workers can't claim A100 if `device.GetName()` returns "Tesla T4".

**Phase 2 — Orchestrator-Signed Attestation:**
Orchestrators sign hardware claims with their staked ETH key. Creates economic accountability — the signature is verifiable against the on-chain staked address.

**Phase 3 — Challenge-Response Verification:**
Orchestrator sends a compute challenge (timed matrix multiplication + VRAM allocation) to the worker at registration. Timing proves GPU class (a T4 physically cannot match A100 performance). VRAM allocation proves memory capacity. Similar to Chutes' GraVal approach.

**Phase 4 — Audited Attributes (Akash Model):**
A trusted auditor verifies hardware and signs the claim. Clients specify `signedBy` in their requirements. Decouples trust from self-reporting.

## References

### Decentralized Compute Platforms
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

### Centralized Platforms
- [Replicate — Model Hardware](https://replicate.com/docs/topics/models/hardware)
- [Modal — GPU Acceleration](https://modal.com/docs/guide/gpu)

### Scheduling & Filtering References
- [Kubernetes — Assigning Pods to Nodes](https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/)
- [Ray — Resources & Scheduling](https://docs.ray.io/en/latest/ray-core/scheduling/resources.html)

### Hardware Verification
- [NVIDIA NVML API Reference](https://docs.nvidia.com/deploy/nvml-api/group__nvmlDeviceQueries.html)
- [NVIDIA go-nvml Go Bindings](https://github.com/NVIDIA/go-nvml)
- [NVIDIA Attestation Documentation](https://docs.nvidia.com/attestation/index.html)
