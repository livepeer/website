"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Video, VideoOff, Play, Square, Zap } from "lucide-react";
import type { Model } from "@/lib/dashboard/types";
import Select from "@/components/ui/Select";
import CodeSnippets from "./CodeSnippets";

const STYLE_FILTERS: Record<string, string> = {
  none: "",
  cinematic: "contrast(1.2) saturate(0.85) brightness(0.95) sepia(0.15)",
  anime: "saturate(1.7) contrast(1.2) hue-rotate(10deg) brightness(1.05)",
  watercolor: "saturate(1.4) blur(0.6px) brightness(1.08) contrast(0.95)",
  neon: "saturate(2.2) hue-rotate(280deg) contrast(1.35) brightness(1.1)",
  sketch: "grayscale(1) contrast(1.6) brightness(0.95)",
  // pipeline aliases for live-video-to-video
  "style-transfer": "saturate(1.7) contrast(1.2) hue-rotate(20deg)",
  "depth-estimation": "grayscale(1) contrast(1.7) brightness(1.1) invert(0.05)",
  segmentation: "saturate(2.5) contrast(1.4) hue-rotate(180deg)",
  compositing: "contrast(1.3) saturate(1.5) brightness(1.05) hue-rotate(-15deg)",
};

const INPUT_MODES = [
  { key: "form", label: "Form" },
  { key: "json", label: "JSON" },
  { key: "python", label: "Python" },
  { key: "node", label: "Node.js" },
  { key: "http", label: "HTTP" },
] as const;
type InputMode = (typeof INPUT_MODES)[number]["key"];

type Status = "idle" | "starting" | "live" | "applied" | "error";

export default function WebcamPlayground({ model }: { model: Model }) {
  const cfg = model.playgroundConfig!;
  const [inputMode, setInputMode] = useState<InputMode>("form");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const styleField = cfg.fields.find(
    (f) => f.name === "style" || f.name === "pipeline",
  );
  const promptField = cfg.fields.find((f) => f.name === "prompt");
  const strengthField = cfg.fields.find((f) => f.name === "strength");

  const [selectedStyle, setSelectedStyle] = useState<string>(
    (styleField?.defaultValue as string) ?? "none",
  );
  const [prompt, setPrompt] = useState<string>(
    (promptField?.defaultValue as string) ?? "",
  );
  const [strength, setStrength] = useState<number>(
    (strengthField?.defaultValue as number) ?? 0.6,
  );

  const sourceVideoRef = useRef<HTMLVideoElement>(null);
  const outputVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [hasStream, setHasStream] = useState(false);

  const startCamera = useCallback(async () => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices) {
      setStatus("error");
      setErrorMsg("Camera API not available in this browser");
      return;
    }
    setStatus("starting");
    setErrorMsg(null);
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 360 } },
        audio: false,
      });
      streamRef.current = s;
      if (sourceVideoRef.current) sourceVideoRef.current.srcObject = s;
      if (outputVideoRef.current) outputVideoRef.current.srcObject = s;
      setHasStream(true);
      setStatus("live");
    } catch (err) {
      setStatus("error");
      setErrorMsg(
        err instanceof Error ? err.message : "Camera access was denied",
      );
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (sourceVideoRef.current) sourceVideoRef.current.srcObject = null;
    if (outputVideoRef.current) outputVideoRef.current.srcObject = null;
    setHasStream(false);
    setStatus("idle");
  }, []);

  const toggleEffect = () => {
    setStatus((s) => (s === "applied" ? "live" : "applied"));
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, []);

  const filter =
    status === "applied" ? STYLE_FILTERS[selectedStyle] ?? "" : "";
  const isLive = status === "live" || status === "applied";

  const payloadJson = useMemo(() => {
    const payload: Record<string, unknown> = {
      model: model.id,
    };
    if (promptField) payload.prompt = prompt;
    if (styleField) payload[styleField.name] = selectedStyle;
    if (strengthField) payload.strength = strength;
    return JSON.stringify(payload, null, 2);
  }, [model.id, promptField, styleField, strengthField, prompt, selectedStyle, strength]);

  return (
    <div>
      {/* Input mode — segmented control, distinct from main tab bar. Label stacks above
          the picker on mobile to avoid overflow; inline at sm+. */}
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <span className="text-[11px] font-medium uppercase tracking-wider text-white/40">
          Request
        </span>
        <div
          role="tablist"
          aria-label="Request format"
          className="scrollbar-none flex shrink-0 items-center overflow-x-auto rounded-lg border border-white/[0.06] bg-white/[0.02] p-0.5"
        >
          {INPUT_MODES.map((m) => {
            const selected = inputMode === m.key;
            return (
              <button
                key={m.key}
                role="tab"
                aria-selected={selected}
                onClick={() => setInputMode(m.key)}
                className={`flex h-9 shrink-0 items-center rounded-md px-2.5 text-xs font-medium transition-colors focus:outline-none sm:h-7 ${
                  selected
                    ? "bg-white/[0.08] text-white shadow-sm"
                    : "text-white/50 hover:text-white/80"
                }`}
              >
                {m.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* ── Left column: input (form / JSON / code) ──────── */}
        {inputMode === "form" ? (
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-medium text-white/50">Source</h3>
              {isLive && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-warm-subtle px-2 py-0.5 text-[11px] font-medium text-warm">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-warm opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-warm" />
                  </span>
                  Live
                </span>
              )}
            </div>
            <div className="relative aspect-video overflow-hidden rounded-lg border border-white/[0.06] bg-black">
              <video
                ref={sourceVideoRef}
                autoPlay
                playsInline
                muted
                className={`h-full w-full object-cover ${hasStream ? "" : "hidden"}`}
              />
              {!hasStream && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-4 text-center">
                  <Video className="h-8 w-8 text-white/20" />
                  <p className="max-w-xs text-xs text-white/40">
                    {status === "error"
                      ? errorMsg
                      : "Start your camera to preview live input. The webcam is processed locally — nothing is uploaded in this mock."}
                  </p>
                  <button
                    onClick={startCamera}
                    disabled={status === "starting"}
                    className="mt-1 flex items-center gap-1.5 rounded-lg bg-green px-3 py-1.5 text-xs font-medium text-white hover:bg-green-light disabled:opacity-50 focus:outline-none"
                  >
                    {status === "starting" ? (
                      <>
                        <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Requesting camera…
                      </>
                    ) : (
                      <>
                        <Video className="h-3.5 w-3.5" />
                        {status === "error" ? "Retry" : "Start camera"}
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="mt-4 space-y-4">
              {promptField && (
                <div>
                  <label
                    htmlFor="webcam-prompt"
                    className="mb-1.5 block text-xs font-medium text-white/50"
                  >
                    {promptField.label}
                  </label>
                  <textarea
                    id="webcam-prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={promptField.placeholder}
                    rows={2}
                    className="w-full resize-y rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-white/20 transition-colors"
                  />
                </div>
              )}

              {styleField?.options && (
                <div>
                  <label
                    htmlFor="webcam-style"
                    className="mb-1.5 block text-xs font-medium text-white/50"
                  >
                    {styleField.label}
                  </label>
                  <Select
                    id="webcam-style"
                    value={selectedStyle}
                    options={styleField.options.map((o) => ({ value: o, label: o }))}
                    onChange={setSelectedStyle}
                  />
                </div>
              )}

              {strengthField && (
                <div>
                  <label
                    htmlFor="webcam-strength"
                    className="mb-1.5 block text-xs font-medium text-white/50"
                  >
                    {strengthField.label}
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      id="webcam-strength"
                      type="range"
                      min={strengthField.min ?? 0}
                      max={strengthField.max ?? 1}
                      step={strengthField.step ?? 0.05}
                      value={strength}
                      onChange={(e) => setStrength(Number(e.target.value))}
                      className="flex-1 accent-green-bright"
                    />
                    <span className="w-12 text-right font-mono text-xs text-white/50">
                      {strength}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 border-t border-white/[0.06] pt-4">
                {hasStream ? (
                  <>
                    <button
                      onClick={toggleEffect}
                      className="flex items-center gap-2 rounded-lg bg-green px-4 py-2 text-sm font-medium text-white transition-all hover:bg-green-light focus:outline-none"
                    >
                      {status === "applied" ? (
                        <>
                          <Square className="h-3.5 w-3.5" />
                          Stop effect
                        </>
                      ) : (
                        <>
                          <Play className="h-3.5 w-3.5" />
                          Apply effect
                        </>
                      )}
                    </button>
                    <button
                      onClick={stopCamera}
                      className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] px-3 py-2 text-xs text-white/50 transition-colors hover:bg-white/[0.04] hover:text-white/60 focus:outline-none"
                    >
                      <VideoOff className="h-3 w-3" />
                      Stop camera
                    </button>
                  </>
                ) : (
                  <span className="text-[11px] text-white/40">
                    Start your camera, then apply real-time effects.
                  </span>
                )}
                <span className="ml-auto flex items-center gap-1 font-mono text-[10px] text-white/40">
                  <Zap className="h-2.5 w-2.5" />
                  {model.latency}ms
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-medium text-white/50">Request</h3>
            </div>
            {inputMode === "json" ? (
              <pre className="scrollbar-dark overflow-x-auto rounded-lg border border-white/[0.06] bg-black/40 p-4 font-mono text-xs leading-relaxed text-white/60">
                {payloadJson}
              </pre>
            ) : (
              <CodeSnippets model={model} fixedLang={inputMode} />
            )}
            <p className="mt-3 text-[11px] text-white/40">
              This pipeline streams in real time — the Playground form is the
              fastest way to try it without wiring up a client.
            </p>
          </div>
        )}

        {/* ── Output (always rendered) ───────────────────────── */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-medium text-white/50">Output</h3>
              {status === "applied" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-bright/10 px-2 py-0.5 text-[11px] font-medium text-green-bright">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-bright" />
                  Effect active
                </span>
              )}
            </div>
            <div className="relative aspect-video overflow-hidden rounded-lg border border-white/[0.06] bg-black">
              <video
                ref={outputVideoRef}
                autoPlay
                playsInline
                muted
                className={`h-full w-full object-cover transition-[filter] duration-300 ${hasStream ? "" : "hidden"}`}
                style={{ filter }}
              />
              {!hasStream && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-center">
                  <p className="text-xs text-white/40">
                    Output preview appears here
                  </p>
                  <p className="text-[11px] text-white/30">
                    {model.orchestrators} GPUs ready
                  </p>
                </div>
              )}
            </div>
            {hasStream && (
              <p className="mt-3 text-xs text-white/50">
                {status === "applied" ? "Streaming through " : "Pass-through · "}
                <span className="font-mono text-white/70">{model.name}</span>
              </p>
            )}
          </div>
        </div>
    </div>
  );
}
