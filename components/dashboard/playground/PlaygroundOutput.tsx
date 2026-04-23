"use client";

import { useState, useEffect, useRef } from "react";
import { Copy, Check, Download } from "lucide-react";
import type { PlaygroundOutputType } from "@/lib/dashboard/types";
import { getModelIcon } from "@/lib/dashboard/utils";
import type { ModelCategory } from "@/lib/dashboard/types";
import WaveSurferAudio from "@/components/dashboard/playground/WaveSurferAudio";
import WaveformStatic from "@/components/dashboard/playground/WaveformStatic";

interface PlaygroundOutputProps {
  outputType: PlaygroundOutputType;
  result: string | null;
  isRunning: boolean;
  inferenceTime?: number;
  category?: ModelCategory;
  modelName?: string;
  /** Model-specific response shape for the JSON tab. When provided, replaces
   *  the generic { status, output, metrics } envelope — gives developers a real
   *  response shape (detection boxes, depth stats, masks) to integrate against. */
  mockOutputJson?: unknown;
}

// ─── Placeholders — sized per output type so the layout doesn't jump when a real result arrives ───

// Returns the Tailwind aspect-ratio class matching each output type. Keeps
// placeholder frames shaped like the real result they'll be replaced with.
function placeholderShape(outputType: PlaygroundOutputType): string {
  switch (outputType) {
    case "image":
      return "aspect-square";
    case "video":
      return "aspect-video"; // 16/9
    case "audio":
      return "min-h-[260px]";
    case "text":
      return "min-h-[320px]";
    case "json":
      return "min-h-[240px]";
  }
}

function PlaceholderFrame({
  outputType,
  children,
}: {
  outputType: PlaygroundOutputType;
  children: React.ReactNode;
}) {
  const shape = placeholderShape(outputType);
  return (
    <div
      className={`flex w-full flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-white/[0.08] bg-white/[0.02] p-6 text-center ${shape}`}
    >
      {children}
    </div>
  );
}

function ShimmerLoader({
  outputType,
  modelName,
}: {
  outputType: PlaygroundOutputType;
  modelName?: string;
}) {
  // Audio shares its bespoke frame across states — keep the waveform visible
  // while generating instead of swapping to a generic spinner card.
  if (outputType === "audio") {
    return <AudioPlaygroundOutput state="loading" modelName={modelName} />;
  }
  return (
    <PlaceholderFrame outputType={outputType}>
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-green-bright" />
      <p className="mt-3 animate-pulse text-xs text-white/50">Running inference…</p>
    </PlaceholderFrame>
  );
}

// ─── Audio output ─────────────────────────────────────────────────────────────
// Empty / loading states reuse the WaveSurfer library via `WaveformStatic` so
// the bar geometry, spacing, and radius are identical to the rendered player.
// Only the colour changes between states — not the visual "shape" of audio.

function AudioPlaygroundOutput({
  state,
  modelName,
  url,
}: {
  state: "empty" | "loading" | "result";
  modelName?: string;
  /** Audio URL for the rendered state. WaveSurfer extracts real peaks from it;
   * when real orchestrator-returned URLs land, this prop is all that changes. */
  url?: string;
}) {
  const label =
    state === "loading"
      ? "Generating audio…"
      : modelName
        ? `Run ${modelName} to hear output`
        : "Fill in the form and click Run";

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-white/[0.06] bg-dark-surface px-5 py-6">
      {state === "result" && url ? (
        <WaveSurferAudio url={url} />
      ) : (
        <>
          <WaveformStatic dimmed={state === "loading"} />
          {/* Bottom slot — fixed height so empty / loading / result frames match. */}
          <div className="flex h-8 items-center">
            <p
              className={`w-full text-center text-xs ${state === "loading" ? "animate-pulse text-white/50" : "text-white/40"}`}
            >
              {label}
            </p>
          </div>
        </>
      )}
    </div>
  );
}

function EmptyState({
  outputType,
  category,
  modelName,
}: {
  outputType: PlaygroundOutputType;
  category?: ModelCategory;
  modelName?: string;
}) {
  const Icon = category ? getModelIcon(category) : null;
  const label = modelName ? `Run ${modelName} to see output here` : "Fill in the form and click Run";

  // Chat-like empty state for LLM outputs — matches Replicate/Chutes convention
  if (outputType === "text") {
    return (
      <div className="flex min-h-[320px] w-full flex-col justify-end gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
        <div className="flex items-start gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/[0.04]">
            {Icon && <Icon className="h-3.5 w-3.5 text-white/60" strokeWidth={2} />}
          </div>
          <div className="flex min-h-[48px] flex-1 items-center rounded-lg bg-white/[0.03] px-3 py-2 text-xs text-white/40">
            {label}
          </div>
        </div>
      </div>
    );
  }

  // Audio gets its own unified frame — wave is the placeholder, no mic icon stacked.
  if (outputType === "audio") {
    return <AudioPlaygroundOutput state="empty" modelName={modelName} />;
  }

  return (
    <PlaceholderFrame outputType={outputType}>
      {Icon && (
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.04]">
          <Icon className="h-6 w-6 text-white/60" strokeWidth={2} aria-hidden="true" />
        </div>
      )}
      <p className="mt-3 text-sm text-white/55">Ready to run</p>
      <p className="mt-1 px-6 text-xs text-white/40">{label}</p>
    </PlaceholderFrame>
  );
}

function ImageOutput({ url }: { url: string }) {
  const [loaded, setLoaded] = useState(false);
  // Container aspect ratio. A hidden probe Image fires onload as soon as the
  // browser knows the dimensions — well before the visible <img> fades in —
  // so the placeholder locks to the output's natural aspect from the start,
  // avoiding the "big square shrinks to landscape" layout hop.
  const [aspect, setAspect] = useState<string>("1 / 1");

  useEffect(() => {
    setLoaded(false);
    setAspect("1 / 1");
    const probe = new Image();
    probe.onload = () => {
      if (probe.naturalWidth && probe.naturalHeight) {
        setAspect(`${probe.naturalWidth} / ${probe.naturalHeight}`);
      }
    };
    probe.src = url;
    return () => {
      probe.onload = null;
    };
  }, [url]);

  return (
    <div
      className="relative overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02] transition-[aspect-ratio] duration-500 ease-out"
      style={{ aspectRatio: aspect }}
    >
      {/* Full-frame pulse — soft opacity breath while the image bytes decode.
          Paired with the aspect-ratio transition above: container finds its
          shape, pulse covers the download wait, image fades in on top. */}
      <div
        className={`absolute inset-0 animate-pulse bg-white/[0.04] transition-opacity duration-700 ${
          loaded ? "opacity-0" : "opacity-100"
        }`}
      />
      <img
        src={url}
        alt="Generated output"
        decoding="async"
        className={`relative h-full w-full object-contain transition-opacity duration-700 ease-out ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}

function VideoOutput({ url }: { url: string }) {
  return (
    <video
      src={url}
      controls
      muted
      playsInline
      className="aspect-video w-full rounded-lg bg-black object-contain"
    />
  );
}

function StreamingTextOutput({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState("");
  const indexRef = useRef(0);

  useEffect(() => {
    setDisplayed("");
    indexRef.current = 0;
    const interval = setInterval(() => {
      if (indexRef.current < text.length) {
        setDisplayed(text.slice(0, indexRef.current + 1));
        indexRef.current++;
      } else {
        clearInterval(interval);
      }
    }, 15);
    return () => clearInterval(interval);
  }, [text]);

  const isStreaming = displayed.length < text.length;

  return (
    <div className="min-h-[320px] rounded-lg border border-white/[0.08] bg-white/[0.03] p-4 font-mono text-sm leading-relaxed text-white/70">
      <pre className="whitespace-pre-wrap">{displayed}</pre>
      {isStreaming && (
        <span className="inline-block h-4 w-0.5 animate-pulse bg-green-bright" />
      )}
    </div>
  );
}

function AudioOutput({ modelName, url }: { modelName?: string; url?: string }) {
  return <AudioPlaygroundOutput state="result" modelName={modelName} url={url} />;
}

function JsonOutput({ data }: { data: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(data);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative rounded-lg border border-white/[0.08] bg-white/[0.03]">
      <button
        onClick={handleCopy}
        className="absolute right-2 top-2 flex items-center gap-1 rounded-md bg-white/[0.06] px-2 py-1 text-[10px] text-white/40 hover:bg-white/[0.1] hover:text-white/60 focus:outline-none"
      >
        {copied ? <Check className="h-3 w-3 text-green-bright" /> : <Copy className="h-3 w-3" />}
        {copied ? "Copied" : "Copy"}
      </button>
      <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-white/60">
        {data}
      </pre>
    </div>
  );
}

export default function PlaygroundOutput({
  outputType,
  result,
  isRunning,
  inferenceTime,
  category,
  modelName,
  mockOutputJson,
}: PlaygroundOutputProps) {
  const [viewMode, setViewMode] = useState<"preview" | "json">("preview");

  // Three display states. No wrapper animation — each output component handles its own
  // reveal (e.g. ImageOutput cross-fades shimmer → image in place), which avoids the
  // double-fade flicker you get when both a wrapper and inner content animate at once.
  const state: "loading" | "empty" | "result" = isRunning
    ? "loading"
    : result
      ? "result"
      : "empty";

  return (
    <div className="flex flex-col gap-3">
      {/* View mode tabs — always rendered so the layout doesn't shift when a result arrives.
          Disabled (muted + not clickable) until there's a result to switch between. */}
      <div
        className={`flex items-center gap-0 border-b border-white/[0.06] transition-opacity duration-300 ${
          state === "result" ? "opacity-100" : "pointer-events-none opacity-40"
        }`}
        aria-disabled={state !== "result"}
      >
        <button
          onClick={() => setViewMode("preview")}
          disabled={state !== "result"}
          className={`border-b-2 px-3 py-1.5 text-xs font-medium transition-colors focus:outline-none ${
            state === "result" && viewMode === "preview"
              ? "border-green-bright text-white"
              : "border-transparent text-white/50 hover:text-white/60"
          }`}
        >
          Preview
        </button>
        <button
          onClick={() => setViewMode("json")}
          disabled={state !== "result"}
          className={`border-b-2 px-3 py-1.5 text-xs font-medium transition-colors focus:outline-none ${
            state === "result" && viewMode === "json"
              ? "border-green-bright text-white"
              : "border-transparent text-white/50 hover:text-white/60"
          }`}
        >
          JSON
        </button>
      </div>

      {state === "loading" && <ShimmerLoader outputType={outputType} modelName={modelName} />}
      {state === "empty" && (
        <EmptyState outputType={outputType} category={category} modelName={modelName} />
      )}
      {state === "result" && viewMode === "json" && (
        <JsonOutput
          data={JSON.stringify(
            mockOutputJson ?? {
              status: "succeeded",
              output: result,
              metrics: {
                inference_time: inferenceTime ?? 0.5,
                gpus_matched: 3,
              },
            },
            null,
            2,
          )}
        />
      )}
      {state === "result" && viewMode === "preview" && result && (
        <>
          {outputType === "image" && <ImageOutput url={result} />}
          {outputType === "text" && <StreamingTextOutput text={result} />}
          {outputType === "audio" && <AudioOutput modelName={modelName} url={result} />}
          {outputType === "video" && <VideoOutput url={result} />}
          {outputType === "json" && <JsonOutput data={result} />}
        </>
      )}

      {/* Metadata */}
      {state === "result" && inferenceTime && (
        <p className="text-xs text-white/50">
          Generated in{" "}
          <span className="font-mono text-white/50">{inferenceTime}s</span>
        </p>
      )}

      {/* Action buttons */}
      {state === "result" && (outputType === "image" || outputType === "audio") && (
        <div className="flex flex-wrap gap-2">
          <button className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] px-3 py-1.5 text-xs text-white/40 transition-colors hover:bg-white/[0.04] hover:text-white/60 focus:outline-none">
            <Download className="h-3 w-3" />
            Download
          </button>
        </div>
      )}
    </div>
  );
}
