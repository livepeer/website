"use client";

import { useEffect, useRef } from "react";
import WaveSurfer from "wavesurfer.js";

// Pre-computed "fake peaks" — a stylised envelope that looks like real audio
// (louder in the middle, detail from two overlaid sines) so the placeholder
// reads as music without pretending to be a specific waveform. 200 samples is
// plenty: WaveSurfer resamples to fit the container width regardless.
const PLACEHOLDER_PEAKS: number[] = Array.from({ length: 200 }, (_, i) => {
  const envelope = Math.sin((i / 200) * Math.PI);
  const detail = Math.sin(i * 0.9) * 0.35 + Math.sin(i * 0.31) * 0.25;
  return Math.max(0.05, Math.min(0.95, 0.18 + envelope * 0.7 + detail * 0.25));
});

interface WaveformStaticProps {
  /** Loading hint — subtle pulse animation on the waveform. */
  dimmed?: boolean;
}

/**
 * Decorative, non-interactive waveform rendered by WaveSurfer using
 * pre-computed peaks. Same renderer as the playback waveform, so the
 * placeholder → result transition keeps identical bar geometry — only the
 * colour swaps.
 */
export default function WaveformStatic({ dimmed = false }: WaveformStaticProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: "rgba(255, 255, 255, 0.18)",
      progressColor: "transparent",
      cursorColor: "transparent",
      cursorWidth: 0,
      barWidth: 2,
      barGap: 3,
      barRadius: 2,
      height: 80,
      normalize: false,
      interact: false,
      peaks: [PLACEHOLDER_PEAKS],
      duration: 10,
    });
    return () => ws.destroy();
  }, []);

  return (
    <div
      ref={containerRef}
      className={`h-20 w-full ${dimmed ? "animate-pulse" : ""}`}
      aria-hidden="true"
    />
  );
}
