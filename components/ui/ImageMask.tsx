"use client";

import { useMemo } from "react";

/**
 * Holographik image mask — THE core brand component.
 *
 * B&W media visible through a mixed tile grid:
 * ~40% fully transparent (video shows clearly), ~60% liquid frosted glass.
 * 9×5 default → near-square tiles on 16:9 so circles fit 2-3 tiles.
 *
 * Performance: pure CSS, no canvas, no SVG, no JS animation.
 */

export default function ImageMask({
  src,
  alt,
  video,
  children,
  cols = 9,
  rows = 5,
  seed: _seed = 0,
  scanLine = true,
  className = "",
}: {
  src?: string;
  alt?: string;
  video?: string;
  children?: React.ReactNode;
  cols?: number;
  rows?: number;
  seed?: number;
  scanLine?: boolean;
  className?: string;
}) {
  const tiles = useMemo(() => {
    return Array.from({ length: cols * rows }).map(() => {
      return { blur: 0, tint: 0 };
    });
  }, [cols, rows]);

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ containerType: "inline-size" }}
    >
      {/* Layer 0: Dark green base */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(160deg, #030d09 0%, #051a10 40%, #071e14 100%)",
        }}
      />

      {/* Layer 1: Media (B&W, darkened) */}
      <div className="absolute inset-0">
        {children ? (
          <div className="h-full w-full">{children}</div>
        ) : video ? (
          <video
            src={video}
            autoPlay
            muted
            loop
            playsInline
            className="h-full w-full object-cover"
            style={{
              filter: "contrast(1.1) brightness(0.5)",
            }}
          />
        ) : src ? (

          <img
            src={src}
            alt={alt || ""}
            className="h-full w-full object-cover"
            style={{
              filter: "contrast(1.1) brightness(0.5)",
            }}
          />
        ) : null}

        {/* Green tint */}
        {!children && (
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(160deg, rgba(24,121,78,0.22) 0%, rgba(13,61,43,0.32) 50%, rgba(24,121,78,0.18) 100%)",
              mixBlendMode: "multiply",
            }}
          />
        )}
      </div>

      {/* Layer 2: Frosted glass tile grid — square tiles, enough rows to fill any viewport */}
      <div
        className="absolute inset-x-0 top-0"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridAutoRows: `calc(100cqw / ${cols})`,
        }}
      >
        {tiles.map((tile, i) => (
          <div
            key={i}
            style={{
              backgroundColor:
                tile.blur > 0
                  ? `rgba(24, 121, 78, ${tile.tint})`
                  : "transparent",
              backdropFilter:
                tile.blur > 0 ? `blur(${tile.blur}px) saturate(1.4)` : "none",
              WebkitBackdropFilter:
                tile.blur > 0 ? `blur(${tile.blur}px) saturate(1.4)` : "none",
              borderRight: "1px solid rgba(255,255,255,0.18)",
              borderBottom: "1px solid rgba(255,255,255,0.18)",
            }}
          />
        ))}
      </div>

      {/* Layer 3: Scan line sweep */}
      {scanLine && (
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden"
          aria-hidden="true"
        >
          <div
            className="scan-line absolute left-0 right-0 h-[2px]"
            style={{
              background:
                "linear-gradient(to bottom, transparent, rgba(64,191,134,0.08), transparent)",
              boxShadow: "0 0 20px 8px rgba(64,191,134,0.02)",
              willChange: "transform",
            }}
          />
        </div>
      )}

      {/* Layer 4: Vignette */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 75% 70% at 50% 50%, transparent 30%, rgba(6,6,6,0.7) 100%)",
        }}
      />
    </div>
  );
}
