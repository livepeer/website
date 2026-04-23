import type { Model, ModelCategory } from "./types";

export type StatsPeriod = "24h" | "7d" | "30d";

export interface RequestBucket {
  label: string;
  value: number;
}

export interface LatencyBucket {
  label: string;
  p50: number;
  p90: number;
  p99: number;
}

export interface RegionBreakdown {
  region: string;
  orchestrators: number;
  latency: number;
  share: number;
}

export interface ModelStats {
  kpis: {
    latencyLabel: string;
    latencyValue: string;
    latencyDelta: string;
    latencyTrend: "up" | "down" | "flat";

    throughputLabel: string;
    throughputValue: string;
    throughputDelta: string;
    throughputTrend: "up" | "down" | "flat";

    orchestrators: number;
    orchestratorsDelta: string;
    orchestratorsTrend: "up" | "down" | "flat";

    uptime: string;
    uptimeDelta: string;
    uptimeTrend: "up" | "down" | "flat";
  };
  requests: RequestBucket[];
  latency: LatencyBucket[];
  regions: RegionBreakdown[];
  uptimeGrid: ("up" | "down")[];
}

const REGIONS = [
  "NA-East",
  "NA-West",
  "EU-West",
  "EU-Central",
  "Asia-Pacific",
];

function hashString(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function throughputUnit(category: ModelCategory): {
  label: string;
  unit: string;
  baseRate: number;
} {
  switch (category) {
    case "Language":
      return { label: "Throughput", unit: "tok/s", baseRate: 180 };
    case "Image Generation":
      return { label: "Throughput", unit: "img/s", baseRate: 4 };
    case "Video Generation":
    case "Video Editing":
      return { label: "Throughput", unit: "fps", baseRate: 28 };
    case "Video Understanding":
      return { label: "Throughput", unit: "seg/s", baseRate: 12 };
    case "Live Transcoding":
      return { label: "Throughput", unit: "streams", baseRate: 240 };
    case "Speech":
      return { label: "Throughput", unit: "words/s", baseRate: 160 };
    default:
      return { label: "Throughput", unit: "req/s", baseRate: 20 };
  }
}

function latencyKpiLabel(category: ModelCategory): string {
  if (category === "Language") return "Time to First Token";
  if (category === "Live Transcoding") return "Segment Latency";
  return "P90 Latency";
}

function formatLatency(ms: number, category: ModelCategory): string {
  if (category === "Language") {
    return ms >= 1000 ? `${(ms / 1000).toFixed(2)}s` : `${Math.round(ms)}ms`;
  }
  return `${Math.round(ms)}ms`;
}

function bucketCount(period: StatsPeriod): number {
  if (period === "24h") return 24;
  if (period === "7d") return 7;
  return 30;
}

function bucketLabel(period: StatsPeriod, i: number, total: number): string {
  if (period === "24h") {
    const hour = (i + 24 - total) % 24;
    return `${hour.toString().padStart(2, "0")}:00`;
  }
  if (period === "7d") {
    return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i];
  }
  return `D${i + 1}`;
}

function trend(
  delta: number,
  positiveIsUp: boolean,
): "up" | "down" | "flat" {
  if (Math.abs(delta) < 0.5) return "flat";
  const direction = delta > 0 ? "up" : "down";
  if (positiveIsUp) return direction;
  return direction === "up" ? "down" : "up";
}

export function generateModelStats(
  model: Model,
  period: StatsPeriod,
): ModelStats {
  const rng = mulberry32(hashString(`${model.id}:${period}`));
  const count = bucketCount(period);

  // Request buckets — scale runs7d to the selected period
  const avgPerBucket =
    period === "24h"
      ? model.runs7d / 7 / 24
      : period === "7d"
        ? model.runs7d / 7
        : model.runs7d / 7;
  const requests: RequestBucket[] = Array.from({ length: count }, (_, i) => {
    const noise = 0.6 + rng() * 0.9;
    return {
      label: bucketLabel(period, i, count),
      value: Math.round(avgPerBucket * noise),
    };
  });

  // Latency time-series (p50/p90/p99)
  const baseP50 = model.latency;
  const latency: LatencyBucket[] = Array.from({ length: count }, (_, i) => {
    const jitter = 0.85 + rng() * 0.3;
    const p50 = Math.round(baseP50 * jitter);
    const p90 = Math.round(p50 * (1.6 + rng() * 0.4));
    const p99 = Math.round(p50 * (2.8 + rng() * 0.6));
    return {
      label: bucketLabel(period, i, count),
      p50,
      p90,
      p99,
    };
  });

  // KPI values — use the latest two buckets to derive deltas
  const latestLatency = latency[latency.length - 1];
  const prevLatency = latency[Math.max(0, latency.length - 2)];
  const latencyDeltaMs = latestLatency.p90 - prevLatency.p90;
  const latencyPct =
    prevLatency.p90 > 0 ? (latencyDeltaMs / prevLatency.p90) * 100 : 0;

  const tp = throughputUnit(model.category);
  const throughputNow = tp.baseRate * (0.9 + rng() * 0.25);
  const throughputPrev = tp.baseRate * (0.85 + rng() * 0.25);
  const throughputDeltaPct =
    throughputPrev > 0
      ? ((throughputNow - throughputPrev) / throughputPrev) * 100
      : 0;

  const orchestratorsDelta = Math.round((rng() - 0.4) * 4);
  const uptimeDelta = (rng() - 0.5) * 0.2;

  // Regions — derive orchestrator split from model.orchestrators
  const shares = [0.34, 0.26, 0.18, 0.14, 0.08];
  const regions: RegionBreakdown[] = REGIONS.map((region, i) => {
    const share = shares[i];
    const orchestrators = Math.max(1, Math.round(model.orchestrators * share));
    const regionLatency = Math.round(
      baseP50 * (0.9 + i * 0.18 + rng() * 0.15),
    );
    return { region, orchestrators, latency: regionLatency, share };
  });

  // Uptime heatmap — 90 days
  const uptimeGrid: ("up" | "down")[] = Array.from({ length: 90 }, () =>
    rng() > 0.03 ? "up" : "down",
  );

  return {
    kpis: {
      latencyLabel: latencyKpiLabel(model.category),
      latencyValue: formatLatency(latestLatency.p90, model.category),
      latencyDelta: `${latencyDeltaMs >= 0 ? "+" : ""}${latencyPct.toFixed(1)}%`,
      latencyTrend: trend(latencyPct, false),

      throughputLabel: `${tp.label} (${tp.unit})`,
      throughputValue: throughputNow.toFixed(
        tp.unit === "img/s" || tp.unit === "req/s" ? 1 : 0,
      ),
      throughputDelta: `${throughputDeltaPct >= 0 ? "+" : ""}${throughputDeltaPct.toFixed(1)}%`,
      throughputTrend: trend(throughputDeltaPct, true),

      orchestrators: model.orchestrators,
      orchestratorsDelta: `${orchestratorsDelta >= 0 ? "+" : ""}${orchestratorsDelta}`,
      orchestratorsTrend: trend(orchestratorsDelta, true),

      uptime: `${model.uptime.toFixed(2)}%`,
      uptimeDelta: `${uptimeDelta >= 0 ? "+" : ""}${uptimeDelta.toFixed(2)}%`,
      uptimeTrend: trend(uptimeDelta, true),
    },
    requests,
    latency,
    regions,
    uptimeGrid,
  };
}
