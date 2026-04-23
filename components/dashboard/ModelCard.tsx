"use client";

import Link from "next/link";
import { Sparkles, Snowflake, Zap } from "lucide-react";
import {
  getModelIcon,
  formatRuns,
  formatPrice,
  isModelNew,
} from "@/lib/dashboard/utils";
import { generateCardBackground } from "@/lib/dashboard/generate-card-visual";
import StarButton from "@/components/dashboard/StarButton";
import type { Model } from "@/lib/dashboard/types";

export default function ModelCard({
  model,
  hideNewBadge = false,
}: {
  model: Model;
  /** Starred/recently-viewed contexts already imply discovery — the NEW badge reads as noise there. */
  hideNewBadge?: boolean;
}) {
  const Icon = getModelIcon(model.category);
  const providerSlug = model.provider.toLowerCase().replace(/\s+/g, "-");
  const isWarm = model.status === "hot";
  const isNew = isModelNew(model) && !hideNewBadge;

  return (
    <Link
      href={`/dashboard/models/${model.id}`}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-white/[0.08] bg-dark-surface transition-colors duration-200 hover:border-white/[0.14] hover:bg-dark-card"
    >
      {/* Cover */}
      <div className="relative aspect-[16/10] max-h-48 w-full overflow-hidden sm:max-h-none">
        {model.coverImage ? (
          <img
            src={model.coverImage}
            alt={`${model.name} by ${model.provider}`}
            className="block h-full w-full object-cover"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center"
            style={{ background: generateCardBackground(model.id) }}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.08] ring-1 ring-white/[0.1] backdrop-blur-sm">
              <Icon
                className="h-5 w-5 text-white/80"
                strokeWidth={2}
                aria-hidden="true"
              />
            </div>
          </div>
        )}

        {/* NEW badge — top-left */}
        {isNew && (
          <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-md bg-green-bright px-2 py-1 text-[11px] font-medium text-dark">
            <Sparkles className="h-2.5 w-2.5" strokeWidth={2.25} />
            new
          </span>
        )}

        {/* Status pills — bottom-left. Warm/Cold + optional Realtime (moat signal). */}
        <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full bg-black/50 px-2 py-1 text-[11px] font-medium backdrop-blur-sm ${
              isWarm ? "text-warm" : "text-blue-bright"
            }`}
          >
            {isWarm ? (
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-warm opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-warm" />
              </span>
            ) : (
              <Snowflake className="h-2.5 w-2.5" />
            )}
            {isWarm ? "Warm" : "Cold"}
          </span>
          {model.realtime && (
            <span
              className="inline-flex items-center gap-1.5 rounded-full bg-black/50 px-2 py-1 text-[11px] font-medium text-green-bright backdrop-blur-sm"
              title="Supports streaming (WebRTC) inference"
            >
              <Zap className="h-2.5 w-2.5" fill="currentColor" />
              Realtime
            </span>
          )}
        </div>

        {/* Star — top-right, hover-reveal */}
        <StarButton modelId={model.id} className="absolute top-2 right-2" />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <p className="font-mono text-[11px] uppercase tracking-wider text-white/40">
          {providerSlug}
        </p>
        <p className="text-[15px] font-medium leading-snug text-white transition-colors group-hover:text-green-bright">
          {model.name}
        </p>
        <span className="mt-2 inline-flex items-center gap-1 self-start rounded-md bg-white/[0.05] px-2 py-1 text-[11px] text-white/60">
          <Icon className="h-3 w-3" />
          {model.category}
        </span>
        <p className="mt-2.5 line-clamp-2 text-[13px] leading-relaxed text-white/55">
          {model.description}
        </p>

        <div className="flex-1" />

        <div className="mt-4 flex items-center justify-between border-t border-white/[0.05] pt-4">
          <span className="font-mono text-[11px] text-white/40">
            {formatRuns(model.runs7d)} runs
          </span>
          <span className="font-mono text-[12px] text-white/70">
            {formatPrice(model)}
          </span>
        </div>
      </div>
    </Link>
  );
}
