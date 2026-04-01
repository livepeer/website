"use client";

import { useEffect, useRef, useState } from "react";

/**
 * MintingDiagram — renders the minting.svg illustration with dynamic
 * participation rate and inflation rate text overlaid on top of the
 * static path-based text in the blockchain machine control panel.
 *
 * Also overlays a rotated needle on the small gauge meter embedded
 * in the machine, animated from 0 % to the live participation rate.
 *
 * SVG viewBox: 0 0 972 915  →  overlay positions are percentages.
 */
type MintingDiagramProps = {
  participationRate: string; // e.g. "52.82%"
  inflationRate: string; // e.g. "0.0628%"
};

const IMG = "/images/primer";

export default function MintingDiagram({
  participationRate,
  inflationRate,
}: MintingDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setAnimated(true), 300);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Needle rotation. Gauge: left = 0 %, right = 100 % (180° sweep).
  // The minting.svg needle was drawn pointing at ~41.7 % (≈ –14.9° from
  // vertical), computed from the tip vector (–5.6, –20.9) relative to hub.
  const rate = parseFloat(participationRate) / 100;
  const targetRotation = (rate - 0.417) * 180;
  const startRotation = (0 - 0.417) * 180; // –75°
  const currentRotation = animated ? targetRotation : startRotation;

  // Needle center in the minting.svg coordinate system
  const cx = 789.305;
  const cy = 606.46;

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-[1100px] flex-shrink-0 lg:max-w-none lg:w-[58vw]"
    >
      <img
        src={`${IMG}/minting.svg`}
        alt="Token minting — blockchain machine"
        className="block w-full"
      />

      {/* ── Animated needle (old static needle removed from minting.svg) ── */}
      <svg
        className="absolute pointer-events-none overflow-visible"
        style={{
          left: `${((cx - 35) / 972) * 100}%`,
          top: `${((cy - 25) / 915) * 100}%`,
          width: `${(70 / 972) * 100}%`,
          height: `${(50 / 915) * 100}%`,
        }}
        viewBox={`${cx - 35} ${cy - 25} 70 50`}
        fill="none"
      >
        <g
          style={{
            transform: `rotate(${currentRotation}deg)`,
            transformOrigin: `${cx}px ${cy}px`,
            transition: animated
              ? "transform 1.8s cubic-bezier(0.34, 1.3, 0.64, 1)"
              : "none",
          }}
        >
          {/* Center hub */}
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M789.305 605.378C788.708 605.378 788.223 605.863 788.223 606.46C788.223 607.057 788.708 607.542 789.305 607.542C789.901 607.542 790.386 607.057 790.386 606.46C790.386 605.863 789.901 605.378 789.305 605.378ZM789.305 608.873C787.974 608.873 786.891 607.791 786.891 606.46C786.891 605.129 787.974 604.047 789.305 604.047C790.635 604.047 791.718 605.129 791.718 606.46C791.718 607.791 790.635 608.873 789.305 608.873Z"
            fill="black"
          />
          {/* Needle pointer */}
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M790.112 604.895C790.031 605.033 789.899 605.141 789.735 605.191C789.383 605.298 789.011 605.101 788.904 604.749L787.161 599.049L788.328 604.822C788.4 605.183 788.167 605.534 787.807 605.608C787.447 605.68 787.095 605.447 787.022 605.086L783.149 585.923C783.081 585.575 783.296 585.233 783.639 585.146C783.983 585.058 784.335 585.257 784.439 585.597L790.177 604.36C790.234 604.547 790.205 604.74 790.112 604.895Z"
            fill="black"
          />
        </g>
      </svg>

      {/* ── Cover old "%participation" path text and show live value ── */}
      <div
        className="absolute flex items-center justify-center"
        style={{
          /* "%participation" text sits between the meter and the inflation box,
             roughly centered at x≈789, y≈620 in 972×915 viewBox. */
          left: `${(738 / 972) * 100}%`,
          top: `${(612 / 915) * 100}%`,
          width: `${(102 / 972) * 100}%`,
          height: `${(18 / 915) * 100}%`,
          backgroundColor: "#97F2EF",
          fontSize: "min(1.1vw, 11px)",
          fontFamily: "var(--font-sans), system-ui, sans-serif",
          fontWeight: 600,
          color: "#131418",
          letterSpacing: "-0.01em",
        }}
      >
        {participationRate}
      </div>

      {/* ── Cover old "0.0224% inflation" path text and show live value ── */}
      <div
        className="absolute flex items-center justify-center"
        style={{
          /* The purple inflation box: (734.277, 633.141) → (844.147, 649.339)
             in 972×915 viewBox. */
          left: `${(734 / 972) * 100}%`,
          top: `${(633 / 915) * 100}%`,
          width: `${(110 / 972) * 100}%`,
          height: `${(16.5 / 915) * 100}%`,
          backgroundColor: "#A6ADEB",
          fontSize: "min(0.82vw, 8.2px)",
          fontFamily: "var(--font-mono), ui-monospace, monospace",
          fontWeight: 700,
          color: "#131418",
          letterSpacing: "0.01em",
          whiteSpace: "nowrap",
        }}
      >
        {inflationRate} inflation
      </div>
    </div>
  );
}
