export type ModelCategory =
  | "LLM"
  | "Image Generation"
  | "Video"
  | "Speech"
  | "Object Detection"
  | "Embeddings";

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
  managed?: boolean;
  featured?: boolean;
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

export interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  status: "active" | "revoked";
  created: string;
  lastUsed: string;
  calls7d: number;
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
