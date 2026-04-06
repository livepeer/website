"use client";

import { useState, useEffect, useRef } from "react";
import { Copy, Check, Download } from "lucide-react";
import type { PlaygroundOutputType } from "@/lib/studio/types";
import { getModelIcon } from "@/lib/studio/utils";
import type { ModelCategory } from "@/lib/studio/types";

interface PlaygroundOutputProps {
  outputType: PlaygroundOutputType;
  result: string | null;
  isRunning: boolean;
  inferenceTime?: number;
  category?: ModelCategory;
  modelName?: string;
}

function ShimmerLoader() {
  return (
    <div className="flex h-full min-h-[300px] items-center justify-center">
      <div className="relative flex flex-col items-center gap-3">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-white/10 border-t-green-bright" />
        <p className="text-xs text-white/50 animate-pulse">Running inference...</p>
      </div>
    </div>
  );
}

function EmptyState({
  category,
  modelName,
}: {
  category?: ModelCategory;
  modelName?: string;
}) {
  const Icon = category ? getModelIcon(category) : null;
  return (
    <div className="flex h-full min-h-[300px] flex-col items-center justify-center text-center">
      {Icon && (
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.04]">
          <Icon className="h-8 w-8 text-white/40" />
        </div>
      )}
      <p className="mt-4 text-sm text-white/50">Ready to run</p>
      <p className="mt-1 text-xs text-white/40">
        {modelName ? `Run ${modelName} to see output here` : "Fill in the form and click Run"}
      </p>
    </div>
  );
}

function ImageOutput({ url }: { url: string }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="relative overflow-hidden rounded-lg">
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-white/[0.03] via-white/[0.06] to-white/[0.03]" />
      )}
      <img
        src={url}
        alt="Generated output"
        className={`w-full rounded-lg transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
        onLoad={() => setLoaded(true)}
      />
    </div>
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
    <div className="rounded-lg border border-white/[0.06] bg-black/40 p-4 font-mono text-sm leading-relaxed text-white/70">
      <pre className="whitespace-pre-wrap">{displayed}</pre>
      {isStreaming && (
        <span className="inline-block h-4 w-0.5 animate-pulse bg-green-bright" />
      )}
    </div>
  );
}

function AudioOutput() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-lg border border-white/[0.06] bg-black/40 p-6">
      <div className="flex h-12 w-full items-center gap-1">
        {Array.from({ length: 40 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 rounded-full bg-green-bright/40"
            style={{
              height: `${20 + Math.sin(i * 0.5) * 15 + Math.random() * 10}px`,
              opacity: 0.3 + Math.random() * 0.5,
            }}
          />
        ))}
      </div>
      <div className="flex items-center gap-3 text-xs text-white/40">
        <span>0:00</span>
        <div className="h-1 w-48 rounded-full bg-white/10">
          <div className="h-1 w-0 rounded-full bg-green-bright" />
        </div>
        <span>0:10</span>
      </div>
      <p className="text-xs text-white/40">Audio playback available after generation</p>
    </div>
  );
}

function JsonOutput({ data }: { data: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(data);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative rounded-lg border border-white/[0.06] bg-black/40">
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
}: PlaygroundOutputProps) {
  const [viewMode, setViewMode] = useState<"preview" | "json">("preview");

  if (isRunning) return <ShimmerLoader />;
  if (!result) return <EmptyState category={category} modelName={modelName} />;

  return (
    <div className="flex flex-col gap-3">
      {/* View mode tabs */}
      <div className="flex items-center gap-0 border-b border-white/[0.06]">
        <button
          onClick={() => setViewMode("preview")}
          className={`border-b-2 px-3 py-1.5 text-xs font-medium transition-colors focus:outline-none ${
            viewMode === "preview"
              ? "border-green-bright text-white"
              : "border-transparent text-white/50 hover:text-white/60"
          }`}
        >
          Preview
        </button>
        <button
          onClick={() => setViewMode("json")}
          className={`border-b-2 px-3 py-1.5 text-xs font-medium transition-colors focus:outline-none ${
            viewMode === "json"
              ? "border-green-bright text-white"
              : "border-transparent text-white/50 hover:text-white/60"
          }`}
        >
          JSON
        </button>
      </div>

      {/* Output content */}
      {viewMode === "json" ? (
        <JsonOutput
          data={JSON.stringify(
            {
              status: "succeeded",
              output: outputType === "text" ? result : result,
              metrics: {
                inference_time: inferenceTime ?? 0.5,
                orchestrators_matched: 3,
              },
            },
            null,
            2,
          )}
        />
      ) : (
        <>
          {outputType === "image" && <ImageOutput url={result} />}
          {outputType === "text" && <StreamingTextOutput text={result} />}
          {outputType === "audio" && <AudioOutput />}
          {outputType === "video" && <ImageOutput url={result} />}
          {outputType === "json" && <JsonOutput data={result} />}
        </>
      )}

      {/* Metadata */}
      {inferenceTime && (
        <p className="text-xs text-white/50">
          Generated in{" "}
          <span className="font-mono text-white/50">{inferenceTime}s</span>
        </p>
      )}

      {/* Action buttons */}
      {(outputType === "image" || outputType === "audio") && (
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
