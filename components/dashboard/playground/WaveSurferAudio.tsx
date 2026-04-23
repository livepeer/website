"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, TriangleAlert } from "lucide-react";
import WaveSurfer from "wavesurfer.js";

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

type LoadState = "loading" | "ready" | "error";

/**
 * WaveSurfer-backed audio player. Drop-in replacement for the decorative
 * waveform once real audio URLs are available — visual language matches the
 * hand-rolled placeholder bars (bar width, gap, radius) so the transition
 * from "generating" to "rendered" feels continuous.
 *
 * If the audio URL doesn't serve CORS headers, WaveSurfer's peak fetch will
 * fail silently — we surface that through a 10s watchdog + the error event
 * rather than spinning forever.
 */
export default function WaveSurferAudio({ url }: { url: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WaveSurfer | null>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loadState, setLoadState] = useState<LoadState>("loading");

  useEffect(() => {
    if (!containerRef.current) return;

    setLoadState("loading");
    setPlaying(false);
    setCurrentTime(0);
    setDuration(0);

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: "rgba(255, 255, 255, 0.35)",
      progressColor: "#40bf86",
      cursorColor: "rgba(255, 255, 255, 0.6)",
      cursorWidth: 1,
      barWidth: 2,
      barGap: 3,
      barRadius: 2,
      height: 80,
      normalize: true,
      url,
    });
    wsRef.current = ws;

    // Watchdog — if peaks haven't decoded after 10s, assume CORS/network
    // failure and stop spinning. Keeps the UI honest.
    const timeout = window.setTimeout(() => {
      setLoadState((s) => (s === "loading" ? "error" : s));
    }, 10_000);

    ws.on("ready", () => {
      window.clearTimeout(timeout);
      setLoadState("ready");
      setDuration(ws.getDuration());
    });
    ws.on("error", (err) => {
      window.clearTimeout(timeout);
      console.warn("WaveSurfer load error:", err);
      setLoadState("error");
    });
    ws.on("play", () => setPlaying(true));
    ws.on("pause", () => setPlaying(false));
    ws.on("finish", () => setPlaying(false));
    ws.on("timeupdate", (t) => setCurrentTime(t));

    return () => {
      window.clearTimeout(timeout);
      ws.destroy();
      wsRef.current = null;
    };
  }, [url]);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative h-20 w-full">
        <div
          ref={containerRef}
          className={`h-full w-full transition-opacity duration-300 ${loadState === "ready" ? "opacity-100" : "opacity-0"}`}
        />
        {loadState === "loading" && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/10 border-t-green-bright" />
          </div>
        )}
        {loadState === "error" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-center">
            <TriangleAlert className="h-4 w-4 text-white/40" aria-hidden="true" />
            <p className="text-[11px] text-white/50">Couldn&apos;t load audio</p>
            <p className="text-[10px] text-white/30">
              The host may be blocking cross-origin requests.
            </p>
          </div>
        )}
      </div>

      <div className="flex h-8 items-center gap-3">
        <button
          type="button"
          onClick={() => wsRef.current?.playPause()}
          disabled={loadState !== "ready"}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/[0.08] text-white transition-colors hover:bg-white/[0.12] focus:outline-none disabled:opacity-40"
          aria-label={playing ? "Pause" : "Play"}
        >
          {playing ? (
            <Pause className="h-3.5 w-3.5 fill-white" />
          ) : (
            <Play className="h-3.5 w-3.5 translate-x-[1px] fill-white" />
          )}
        </button>
        <span className="font-mono text-[11px] text-white/60">
          {formatTime(currentTime)}
        </span>
        <div className="flex-1" />
        <span className="font-mono text-[11px] text-white/60">
          {formatTime(duration)}
        </span>
      </div>
    </div>
  );
}
