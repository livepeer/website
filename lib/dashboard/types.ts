export type ModelCategory =
  | "Video Generation"
  | "Video Editing"
  | "Video Understanding"
  | "Live Transcoding"
  | "Image Generation"
  | "Speech"
  | "Language";

export type ModelStatus = "hot" | "cold";

export type PricingUnit = "M Tokens" | "Second" | "Request" | "Minute" | "Step";

export type PlaygroundFieldType =
  | "text"
  | "textarea"
  | "number"
  | "range"
  | "file"
  | "select"
  | "boolean";

export type PlaygroundOutputType = "image" | "text" | "video" | "audio" | "json";

export interface PlaygroundField {
  name: string;
  label: string;
  type: PlaygroundFieldType;
  description?: string;
  placeholder?: string;
  required?: boolean;
  defaultValue?: string | number | boolean;
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
}

export interface PlaygroundConfig {
  fields: PlaygroundField[];
  outputType: PlaygroundOutputType;
  mockOutputUrl?: string;
  mockOutputText?: string;
  /** Realistic mock response for the JSON tab. When provided, the Output's JSON
   *  tab renders this shape instead of the generic `{ status, output, metrics }`
   *  envelope — useful for models whose value IS the structured data (detection
   *  boxes, depth stats, segmentation polygons, etc.). */
  mockOutputJson?: unknown;
  /** Selects the playground UI. "webcam" mocks live video-in/video-out with the user's camera. "transcoding" shapes the output like a Livepeer HLS stream (playbackId, rendition ladder, copyable URLs). Defaults to "form". */
  playgroundVariant?: "form" | "webcam" | "transcoding";
}

export interface UsageDataPoint {
  date: string;
  requests: number;
  cost: number;
}

export interface NetworkStat {
  label: string;
  value: string;
  delta?: string;
  trend: "up" | "down" | "flat";
}

export interface Model {
  id: string;
  name: string;
  provider: string;
  category: ModelCategory;
  description: string;
  coverImage?: string;
  status: ModelStatus;
  pricing: {
    amount: number;
    unit: PricingUnit;
    inputPrice?: number;
    outputPrice?: number;
  };
  latency: number;
  orchestrators: number;
  precision?: string;
  runs7d: number;
  uptime: number;
  featured?: boolean;
  /** Supports streaming (WebRTC) inference in addition to request/response. The differentiator on the network — flagged as a capability pill and filterable on Explore. */
  realtime?: boolean;
  /** ISO-8601 date the model was published on the network. Drives the "NEW" badge and Recently-added sort. */
  releasedAt?: string;
  tags?: string[];
  sla?: {
    uptime: string;
    latencyP99: string;
  };
  apiEndpoint?: string;
  providerUrl?: string;
  networkPrice?: {
    amount: number;
    unit: PricingUnit;
  };
  playgroundConfig?: PlaygroundConfig;
  readme?: string;
}

/**
 * Routing scope for an API token. Tokens route requests to:
 *  - "any": any connected payment provider (falls back to free tier)
 *  - a specific SignerKey: only that provider
 * Kept in sync with SignerKey so the dropdown can enumerate providers.
 */
export type ApiKeyScope = "any" | SignerKey;

export interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  status: "active" | "revoked";
  created: string;
  lastUsed: string;
  calls7d: number;
  isDefault?: boolean;
  scope?: ApiKeyScope;
}

export interface SolutionProvider {
  id: string;
  name: string;
  provider: string;
  description: string;
  dashboardUrl: string;
  capabilities: ModelCategory[];
  pricingSummary: string;
  trustBadges: ("Managed" | "SLA" | "Enterprise")[];
}

export interface EcosystemApp {
  id: string;
  name: string;
  url: string;
  domain: string;
  description: string;
  categories: string[];
  featured?: boolean;
}

// ─── Stats: GPUs ─────────────────────────────────────────────────────────────

export interface GpuNode {
  name: string;
  count: number;
  memory: string;
  tflops: number;
  maxPower: string;
}

export interface GpuGrowthPoint {
  date: string;
  total: number;
  byType?: Record<string, number>;
}

// ─── Stats: Utilization ──────────────────────────────────────────────────────

export type PipelineStatus = "active" | "degraded" | "cold";

export interface PipelineUtilization {
  id: string;
  name: string;
  warmOrchestrators: number;
  totalCapacity: number;
  utilizationPct: number;
  avgLatencyMs: number;
  status: PipelineStatus;
  price: number;
  priceUnit: string;
}

export type LiveJobStatus = "online" | "degraded" | "completed";

export interface LiveJob {
  id: string;
  pipeline: string;
  model: string;
  fpsIn?: number;
  fpsOut?: number;
  latencyMs?: number;
  age: string;
  status: LiveJobStatus;
}

// ─── Stats: Payments ─────────────────────────────────────────────────────────

export interface PaymentDayData {
  date: string;
  volumeEth: number;
  volumeUsd: number;
}

export interface PaymentStats {
  lastDay: { eth: number; usd: number };
  lastMonth: { eth: number; usd: number };
  allTime: { eth: number; usd: number };
}

export interface PaymentTransaction {
  id: string;
  date: string;
  orchestrator: string;
  pipeline: string;
  amountEth: number;
  amountUsd: number;
  block: number;
  txHash: string;
}

// ─── Settings: Remote Signers & Payment ─────────────────────────────────────

export interface RemoteSigner {
  id: string;
  name: string;
  description: string;
  currencies: string[];
  status: "available" | "coming-soon";
  /** Inline usage shown when this signer is connected (mock). */
  monthlyUsage?: {
    requests: number;
    spentDisplay: string; // e.g. "$4.50", "€3.20", "0.012 ETH"
  };
}

export interface UsageSummary {
  requests: number;
  creditsUsed: number;
  creditsLimit: number | null;
  tier: string;
}

/**
 * Account-wide routing breakdown for the current month.
 * Used on the Billing tab to show where requests are going.
 * Percentages are integers and should sum to ~100.
 */
export interface RoutingSummary {
  totalRequests: number;
  routes: {
    label: string;
    percent: number;
    requests: number;
    color: "green" | "blue" | "neutral";
  }[];
}

// ─── Account Usage (per-account, distinct from network-wide stats) ──────────
//
// Keys here must stay in sync with REMOTE_SIGNERS (by id) and the two
// non-signer sources: the foundation free tier and direct ETH wallet payments.
// `paymthouse` / `livepeerCloud` correspond to REMOTE_SIGNERS ids
// `paymthouse` / `livepeer-cloud`. `coinbase-pay` is omitted until it exits
// coming-soon.

export type SignerKey =
  | "freeTier"
  | "paymthouse"
  | "livepeerCloud"
  | "ethWallet";

export interface AccountUsageSummary {
  requests: number;
  spendDisplay: string;
  freeTierUsed: number;
  freeTierLimit: number;
  freeTierResetIn: string;
}

export interface AccountUsageBySigner {
  signer: SignerKey;
  label: string;
  requests: number;
  percent: number;
  spendDisplay: string;
  color: "green" | "blue" | "neutral" | "violet";
}

export interface AccountUsageByToken {
  tokenId: string;
  tokenName: string;
  requests: number;
  lastUsed: string;
  spendDisplay: string;
}

export interface AccountUsageDailyPoint {
  date: string;
  freeTier: number;
  paymthouse: number;
  livepeerCloud: number;
  ethWallet: number;
}

export type AccountActivityStatus = "success" | "failed" | "timeout";

export interface AccountActivityRow {
  id: string;
  /** ISO-8601 timestamp; rendered as relative on Home, absolute on UsageTab. */
  timestamp: string;
  model: string;
  pipeline: string;
  status: AccountActivityStatus;
  /** null when status !== "success" */
  latencyMs: number | null;
  signer: SignerKey;
  signerLabel: string;
  tokenId: string;
  tokenName: string;
  /** Pre-formatted cost string, "—" when failed. */
  costDisplay: string;
}

// ─── Stats: Overview ─────────────────────────────────────────────────────────

export interface ApiRequestSeries {
  date: string;
  [apiName: string]: string | number;
}
