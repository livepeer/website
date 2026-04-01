import {
  BrainCircuit,
  ImageIcon,
  Clapperboard,
  Mic2,
  ScanSearch,
  Network,
  type LucideIcon,
} from "lucide-react";
import type { Model, ModelCategory } from "./types";

const CATEGORY_ICONS: Record<ModelCategory, LucideIcon> = {
  LLM: BrainCircuit,
  "Image Generation": ImageIcon,
  Video: Clapperboard,
  Speech: Mic2,
  "Object Detection": ScanSearch,
  Embeddings: Network,
};

export function getModelIcon(category: ModelCategory): LucideIcon {
  return CATEGORY_ICONS[category] ?? BrainCircuit;
}

export function formatRuns(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export function formatPrice(model: Model): string {
  if (
    model.pricing.inputPrice !== undefined &&
    model.pricing.outputPrice !== undefined
  ) {
    return `$${model.pricing.inputPrice} in / $${model.pricing.outputPrice} out /${model.pricing.unit}`;
  }
  return `$${model.pricing.amount} /${model.pricing.unit}`;
}

export function generateMockUsageData(days: number = 30) {
  const data = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const base = 1200 + Math.sin(i * 0.3) * 400;
    const requests = Math.round(base + Math.random() * 600);
    data.push({
      date: date.toISOString().split("T")[0],
      requests,
      cost: parseFloat((requests * 0.0032).toFixed(2)),
    });
  }
  return data;
}

const CATEGORY_GRADIENTS: Record<ModelCategory, string> = {
  LLM: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
  "Image Generation": "linear-gradient(135deg, #1a1a2e 0%, #2d1b4e 50%, #4a1942 100%)",
  Video: "linear-gradient(135deg, #0a1628 0%, #0d2137 50%, #0f3460 100%)",
  Speech: "linear-gradient(135deg, #1a1a1a 0%, #2a1f1a 50%, #3d2b1a 100%)",
  "Object Detection": "linear-gradient(135deg, #0a1a0a 0%, #1a2e1a 50%, #0f3d2e 100%)",
  Embeddings: "linear-gradient(135deg, #1a1a2e 0%, #1a2e3e 50%, #1a3e4e 100%)",
};

export function getCategoryGradient(category: ModelCategory): string {
  return CATEGORY_GRADIENTS[category] ?? CATEGORY_GRADIENTS.LLM;
}

export function generateSparklineData(points: number = 7): number[] {
  const data = [];
  let value = 50 + Math.random() * 30;
  for (let i = 0; i < points; i++) {
    value += (Math.random() - 0.45) * 15;
    data.push(Math.max(10, Math.round(value)));
  }
  return data;
}
