"use client";

import { motion } from "framer-motion";
import Container from "@/components/ui/Container";
import SectionHeader from "@/components/ui/SectionHeader";
import Button from "@/components/ui/Button";
import { EXTERNAL_LINKS } from "@/lib/constants";
import type { ProtocolStats } from "@/lib/subgraph";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

/* ── L-bracket viewfinder corners — two perpendicular hairlines forming
   an L, hugging each corner of an artboard. Reads like a film viewfinder
   or architectural title block. */
function CornerBracket({
  corner,
}: {
  corner: "tl" | "tr" | "bl" | "br";
}) {
  const isTop = corner === "tl" || corner === "tr";
  const isLeft = corner === "tl" || corner === "bl";
  const pos: Record<string, number | string> = {};
  if (isTop) pos.top = 0;
  else pos.bottom = 0;
  if (isLeft) pos.left = 0;
  else pos.right = 0;
  const armColor = "color-mix(in srgb, currentColor 60%, transparent)";
  return (
    <div
      className="pointer-events-none absolute"
      style={{ ...pos, width: 22, height: 22 }}
      aria-hidden="true"
    >
      <span
        className="absolute"
        style={{
          [isTop ? "top" : "bottom"]: 0,
          [isLeft ? "left" : "right"]: 0,
          width: 14,
          height: 1,
          background: armColor,
        }}
      />
      <span
        className="absolute"
        style={{
          [isTop ? "top" : "bottom"]: 0,
          [isLeft ? "left" : "right"]: 0,
          width: 1,
          height: 14,
          background: armColor,
        }}
      />
    </div>
  );
}
/* ── LPT Token Specimen — a drafted technical illustration of the LPT
   mark, framed as a specimen card for the token. The CONTENT of the sketch
   (bbox, dimensions, optical correction, mark squares) documents the
   brand mark's geometry. The FRAMING (corner labels, live delegators
   count from the subgraph, ETH MAINNET indicator, footer wordmark)
   contextualizes it as a specimen of the LPT token itself.

   Drafting derivation:
     • Six square modules of side a = 15.5 (the "module")
     • Horizontal column step  dx = 28.469  ≈ 1.84a
     • Vertical row step       dy = 18.061  ≈ 1.17a
     • Bounding box            W = 4.67a   H = 5.66a   H:W = 1.21 */
function LPTTokenSpecimen({ stats }: { stats: ProtocolStats }) {
  const { participationRate } = stats;
  const SCALE = 2.9;
  const SQ = 15.5;
  const unit = SQ * SCALE;

  // Raw mark squares, with y normalized so the topmost square sits at y=0.
  const RAW_SQUARES: Array<{ x: number; y: number }> = [
    { x: 0, y: 0.944 },
    { x: 28.469, y: 19.005 },
    { x: 56.894, y: 37.067 },
    { x: 28.469, y: 55.082 },
    { x: 0, y: 73.121 },
    { x: 0, y: 37.067 },
  ];
  const Y_MIN = Math.min(...RAW_SQUARES.map((s) => s.y));
  const squares = RAW_SQUARES.map((s) => ({ x: s.x, y: s.y - Y_MIN }));

  // Derived bounding box — exact extents of the mark in mark units.
  const MARK_W =
    Math.max(...squares.map((s) => s.x)) + SQ; // 72.394
  const MARK_H =
    Math.max(...squares.map((s) => s.y)) + SQ; // 87.677

  // Column-left positions and row-top positions — the natural construction lattice.
  const COL_X = [0, 28.469, 56.894];
  const ROW_Y = [0, 18.061, 36.123, 54.138, 72.177];

  const CX = 300;
  const CY = 300;
  // Optical centering: the mark's visual mass is left-weighted (3 squares in
  // col 1, 2 in col 2, 1 in col 3), so geometric centering makes the chevron
  // appear to drift left within the circle. Shift the mark + bbox + grid
  // right by ~6 mark-units (~17 viewBox px) so the visual centroid sits
  // closer to the construction-circle center. The clear-space circle stays
  // anchored at (CX, CY) — the optical illusion is the goal, so circle and
  // bbox are intentionally non-concentric. The grid remains mathematically
  // precise relative to the mark (every lattice line passes through a real
  // square edge).
  const OPTICAL_DX = 6;
  const offsetX = CX - (MARK_W * SCALE) / 2 + OPTICAL_DX * SCALE;
  const offsetY = CY - (MARK_H * SCALE) / 2;

  const proj = (x: number, y: number) => ({
    x: offsetX + x * SCALE,
    y: offsetY + y * SCALE,
  });

  // Bounding box in viewBox coordinates — wraps the squares exactly.
  const bbTL = proj(0, 0);
  const bbBR = proj(MARK_W, MARK_H);
  const bbW = bbBR.x - bbTL.x;
  const bbH = bbBR.y - bbTL.y;

  // Two reference points for the Δ OPT callout:
  //   • Optical center (CX, CY) — anchor of the clear-space circle, what the eye reads as middle.
  //   • Bbox geometric center — where the mark would sit if centered the lazy way.
  // The bbox geometric center sits +6.00u RIGHT of the optical center — a
  // deliberate partial optical correction. The diagram labels both and the
  // Δ callout below the tick row quantifies the gap.
  const bboxCenterX = (bbTL.x + bbBR.x) / 2;
  const bboxCenterY = (bbTL.y + bbBR.y) / 2;


  const lineColor = "currentColor";

  return (
    <div
      className="relative mx-auto w-full text-foreground"
      style={{ aspectRatio: "1 / 1", maxWidth: 484 }}
    >
      {/* Holographik corner crosshairs */}
      <CornerBracket corner="tl" />
      <CornerBracket corner="tr" />
      <CornerBracket corner="bl" />
      <CornerBracket corner="br" />

      {/* Top-left mono identifier */}
      <div
        className="pointer-events-none absolute left-5 top-5 z-10 font-mono text-[9.5px] uppercase tracking-[0.26em] text-foreground/65"
        aria-hidden="true"
      >
        LPT · 01
      </div>

      {/* Top-right chain context — small bullet dot + chain label. The dot
          uses currentColor so it inherits the same color as the text next
          to it (foreground/55) rather than reading as a separate accent. */}
      <div
        className="pointer-events-none absolute right-5 top-5 z-10 flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-[0.26em] text-foreground/55"
        aria-hidden="true"
      >
        <span
          className="inline-block h-1 w-1 rounded-full bg-current"
        />
        ETHEREUM
      </div>

      {/* Bottom-left — live staking participation from subgraph */}
      <div
        className="pointer-events-none absolute bottom-5 left-5 z-10 font-mono text-[9.5px] uppercase tracking-[0.26em] text-foreground/50 tabular-nums"
        aria-hidden="true"
      >
        <span className="normal-case">η</span> {participationRate} STAKED
      </div>

      {/* Bottom-right metadata */}
      <div
        className="pointer-events-none absolute bottom-5 right-5 z-10 font-mono text-[9.5px] uppercase tracking-[0.26em] text-foreground/60"
        aria-hidden="true"
      >
        ERC-20 · 2018
      </div>

      {/* ─────────── DIAGRAM ─────────── */}
      <svg
        viewBox="0 0 600 600"
        className="relative h-full w-full"
        aria-hidden="true"
      >
        {/* Background lattice — continuous dashed hairlines across the full
            artboard at the chevron's natural column-step × row-step spacing.
            Each line is anchored so it passes through one of the mark's
            construction positions, then runs off-page in both directions.
            Inside the bbox the higher-opacity solid construction lines
            overlay these dashed continuations: a single physical lattice
            that reads SOLID where it carries real construction geometry,
            DASHED where it just extends the universal grid across the page.
            Drawn as long <line> elements (not a <pattern>) so the dash
            phase stays continuous end-to-end — no tile-boundary artefacts. */}
        {(() => {
          const tileW = COL_X[1] * SCALE;
          const tileH = ROW_Y[1] * SCALE;
          const startN = Math.ceil((0 - offsetX) / tileW);
          const endN = Math.floor((600 - offsetX) / tileW);
          const verticals = Array.from(
            { length: endN - startN + 1 },
            (_, i) => offsetX + (startN + i) * tileW,
          );
          const startM = Math.ceil((0 - offsetY) / tileH);
          const endM = Math.floor((600 - offsetY) / tileH);
          const horizontals = Array.from(
            { length: endM - startM + 1 },
            (_, i) => offsetY + (startM + i) * tileH,
          );
          return (
            <g
              stroke={lineColor}
              strokeOpacity="0.24"
              strokeWidth="0.5"
              strokeDasharray="1.5 2.5"
            >
              {verticals.map((x) => (
                <line
                  key={`bv-${x.toFixed(2)}`}
                  x1={x}
                  y1="0"
                  x2={x}
                  y2="600"
                />
              ))}
              {horizontals.map((y) => (
                <line
                  key={`bh-${y.toFixed(2)}`}
                  x1="0"
                  y1={y}
                  x2="600"
                  y2={y}
                />
              ))}
            </g>
          );
        })()}

        {/* Artboard centerlines — horizontal at y=CY, vertical at x=CX,
            extending the full artboard. Classic drafting centerline pattern
            (long-dash short-dash long-dash). Establishes the artboard's
            true geometric center as a reference axis-pair: the symmetric
            scaffold against which the mark's optical-correction offset
            (+6.00u right) becomes visibly readable, not just numerically
            stated in the Δ OPT callout below. The mark squares draw OVER
            the centerlines where they cross, so the lines read as
            background reference, not foreground construction. */}
        <g
          stroke={lineColor}
          strokeOpacity="0.25"
          strokeWidth="0.5"
          strokeDasharray="8 2 1.5 2"
        >
          <line x1="0" y1={CY} x2="600" y2={CY} />
          <line x1={CX} y1="0" x2={CX} y2="600" />
        </g>

        {/* Construction lattice — every line passes through an actual square edge.
            Verticals at column-left positions (0, 28.469, 56.894) + bbox-right (72.394).
            Horizontals at row-top positions (0, 18.061, 36.123, 54.138, 72.177) + bbox-bottom (87.677). */}
        <g>
          {[...COL_X, MARK_W].map((markX, i) => {
            const x = offsetX + markX * SCALE;
            const isOuter = i === 0 || markX === MARK_W;
            return (
              <line
                key={`v-${markX}`}
                x1={x}
                y1={bbTL.y - unit * 0.75}
                x2={x}
                y2={bbBR.y + unit * 0.75}
                stroke={lineColor}
                strokeOpacity={isOuter ? 0.65 : 0.38}
                strokeWidth="0.5"
              />
            );
          })}
          {[...ROW_Y, MARK_H].map((markY, i) => {
            const y = offsetY + markY * SCALE;
            const isOuter = i === 0 || markY === MARK_H;
            return (
              <line
                key={`h-${markY}`}
                x1={bbTL.x - unit * 0.75}
                y1={y}
                x2={bbBR.x + unit * 0.75}
                y2={y}
                stroke={lineColor}
                strokeOpacity={isOuter ? 0.65 : 0.38}
                strokeWidth="0.5"
              />
            );
          })}
        </g>

        {/* Clear-space dashed rectangle — brand-spec convention: 1X padding
            on all sides around the mark. The rect is anchored to the bbox
            (not the optical center), so it sits faithfully around the mark
            even with the +6u optical shift in effect. */}
        <rect
          x={bbTL.x - unit}
          y={bbTL.y - unit}
          width={bbW + 2 * unit}
          height={bbH + 2 * unit}
          fill="none"
          stroke={lineColor}
          strokeOpacity="0.5"
          strokeWidth="0.7"
          strokeDasharray="3 5"
        />

        {/* Optical-reference circle — anchored at OPT (the artboard center),
            sized to wrap the mark's bbox with comfortable padding (~1.3X).
            Because the bbox sits +6u right of OPT, the circle is visibly
            asymmetric to the mark: more empty space on the LEFT, mark
            sits closer to the RIGHT edge. That asymmetry IS the visual
            argument for the Δ OPT +6u shift — without the correction, the
            left-weighted chevron mass would appear to drift left within
            this same circle. Distinct from the clear-space rect: anchored
            at OPT (not the bbox), and uses a finer dash rhythm so the two
            don't read as a redundant double-outline. */}
        <circle
          cx={CX}
          cy={CY}
          r={Math.hypot(bbW, bbH) / 2 + unit * 1.3}
          fill="none"
          stroke={lineColor}
          strokeOpacity="0.55"
          strokeWidth="0.7"
          strokeDasharray="2 4"
        />

        {/* Optical-center anchor dot — small filled circle at (CX, CY).
            With the centerlines + diagonals + OPT crosshair all converging
            here, the dot is the visual "punctum" of the whole composition,
            the way a transit's reticle has a single anchor point. */}
        <circle cx={CX} cy={CY} r="2" fill={lineColor} fillOpacity="0.75" />

        {/* Mark bounding rectangle */}
        <rect
          x={bbTL.x}
          y={bbTL.y}
          width={bbW}
          height={bbH}
          fill="none"
          stroke={lineColor}
          strokeOpacity="0.82"
          strokeWidth="0.85"
        />

        {/* Diagonal construction guides — strengthened from atmospheric guides
            to a more confident X, anchoring the bbox to its own four-fold
            symmetry. The X intersects the artboard centerlines at the bbox
            geometric center (GEO), reinforcing the symmetric scaffold. */}
        <line
          x1={bbTL.x}
          y1={bbTL.y}
          x2={bbBR.x}
          y2={bbBR.y}
          stroke={lineColor}
          strokeOpacity="0.6"
          strokeWidth="0.65"
        />
        <line
          x1={bbBR.x}
          y1={bbTL.y}
          x2={bbTL.x}
          y2={bbBR.y}
          stroke={lineColor}
          strokeOpacity="0.6"
          strokeWidth="0.65"
        />

        {/* Optical-center crosshair (CX, CY) — the artboard's true focal point,
            where the clear-space circle is anchored. */}
        <line
          x1={CX - 7}
          y1={CY}
          x2={CX + 7}
          y2={CY}
          stroke={lineColor}
          strokeOpacity="0.6"
          strokeWidth="0.55"
        />
        <line
          x1={CX}
          y1={CY - 7}
          x2={CX}
          y2={CY + 7}
          stroke={lineColor}
          strokeOpacity="0.6"
          strokeWidth="0.55"
        />

        {/* Bbox geometric center — a small + on the diagonal-guide intersection,
            +OPTICAL_DX·u to the right of (CX, CY). */}
        <line
          x1={bboxCenterX - 4}
          y1={bboxCenterY}
          x2={bboxCenterX + 4}
          y2={bboxCenterY}
          stroke={lineColor}
          strokeOpacity="0.55"
          strokeWidth="0.55"
        />
        <line
          x1={bboxCenterX}
          y1={bboxCenterY - 4}
          x2={bboxCenterX}
          y2={bboxCenterY + 4}
          stroke={lineColor}
          strokeOpacity="0.55"
          strokeWidth="0.55"
        />

        {/* OPT / GEO axis tags — name the two centers as faint annotations
            so the Δ callout below has clear referents. Low opacity + tighter
            letter spacing keeps them as supporting tags rather than primary
            visual elements. */}
        <g
          fontFamily="var(--font-mono, ui-monospace, monospace)"
          fontSize="7.5"
          fill={lineColor}
          fillOpacity="0.42"
          letterSpacing="0.14em"
        >
          <text x={CX - 12} y={CY - 11} textAnchor="end">
            OPT
          </text>
          <text x={bboxCenterX + 9} y={bboxCenterY - 8}>
            GEO
          </text>
        </g>

        {/* THE MARK — six modular squares, drawn in the "specimen sheet"
            convention seen in classic logo construction sheets (Facebook
            Messenger 2011, Bing 2013, CBS 1951): a medium-grey fill with a
            crisp hairline outline. The grey lets the construction grid sit
            ON TOP of the mark without competing, so geometric alignment
            reads clearly; the outline keeps each square crisply defined. */}
        {squares.map((sq, i) => {
          const a = proj(sq.x, sq.y);
          return (
            <rect
              key={`sq-${i}`}
              x={a.x}
              y={a.y}
              width={unit}
              height={unit}
              fill={lineColor}
              fillOpacity="0.45"
              stroke={lineColor}
              strokeOpacity="0.85"
              strokeWidth="0.7"
            />
          );
        })}

        {/* TOP dimension axis — brand-spec notation. Labels each column (X)
            and each horizontal gap (5/6X) along the top edge of the bbox,
            with tick brackets at each segment boundary. Matches the
            construction grammar from the Livepeer brand book (3 columns
            of width X, separated by 5/6X gaps). */}
        {(() => {
          const xGap = (SQ * 5) / 6;
          const segments = [
            { start: 0, end: SQ, label: "X" },
            { start: SQ, end: SQ + xGap, label: "5/6X" },
            { start: COL_X[1], end: COL_X[1] + SQ, label: "X" },
            { start: COL_X[1] + SQ, end: COL_X[2], label: "5/6X" },
            { start: COL_X[2], end: MARK_W, label: "X" },
          ];
          const boundaries = [
            0,
            SQ,
            COL_X[1],
            COL_X[1] + SQ,
            COL_X[2],
            MARK_W,
          ];
          const tickY = bbTL.y - 14;
          const labelY = bbTL.y - 20;
          return (
            <g
              fontFamily="var(--font-mono, ui-monospace, monospace)"
              fontSize="7.5"
              fill={lineColor}
              fillOpacity="0.78"
            >
              {/* Axis hairline */}
              <line
                x1={bbTL.x}
                y1={tickY}
                x2={bbBR.x}
                y2={tickY}
                stroke={lineColor}
                strokeOpacity="0.42"
                strokeWidth="0.5"
              />
              {/* Tick brackets at each segment boundary */}
              {boundaries.map((markX, i) => {
                const x = offsetX + markX * SCALE;
                return (
                  <line
                    key={`top-tick-${i}`}
                    x1={x}
                    y1={tickY - 2.5}
                    x2={x}
                    y2={tickY + 2.5}
                    stroke={lineColor}
                    strokeOpacity="0.6"
                    strokeWidth="0.55"
                  />
                );
              })}
              {/* Segment labels centered over each segment */}
              {segments.map((seg, i) => {
                const cx = offsetX + ((seg.start + seg.end) / 2) * SCALE;
                return (
                  <text
                    key={`top-label-${i}`}
                    x={cx}
                    y={labelY}
                    textAnchor="middle"
                    letterSpacing="0.1em"
                  >
                    {seg.label}
                  </text>
                );
              })}
            </g>
          );
        })()}

        {/* LEFT dimension axis — brand-spec notation. Labels each row (X)
            and each vertical gap (1/6X) along the left edge of the bbox.
            Same axis-hairline + tick-bracket pattern as the top, rotated
            for the vertical orientation (5 rows of height X, separated
            by 1/6X gaps). */}
        {(() => {
          const yGap = SQ / 6;
          const segments = [
            { start: 0, end: SQ, label: "X" },
            { start: SQ, end: SQ + yGap, label: "1/6X" },
            { start: ROW_Y[1], end: ROW_Y[1] + SQ, label: "X" },
            { start: ROW_Y[1] + SQ, end: ROW_Y[2], label: "1/6X" },
            { start: ROW_Y[2], end: ROW_Y[2] + SQ, label: "X" },
            { start: ROW_Y[2] + SQ, end: ROW_Y[3], label: "1/6X" },
            { start: ROW_Y[3], end: ROW_Y[3] + SQ, label: "X" },
            { start: ROW_Y[3] + SQ, end: ROW_Y[4], label: "1/6X" },
            { start: ROW_Y[4], end: MARK_H, label: "X" },
          ];
          const boundaries = [
            0,
            SQ,
            ROW_Y[1],
            ROW_Y[1] + SQ,
            ROW_Y[2],
            ROW_Y[2] + SQ,
            ROW_Y[3],
            ROW_Y[3] + SQ,
            ROW_Y[4],
            MARK_H,
          ];
          const tickX = bbTL.x - 14;
          const labelX = bbTL.x - 20;
          return (
            <g
              fontFamily="var(--font-mono, ui-monospace, monospace)"
              fontSize="6.5"
              fill={lineColor}
              fillOpacity="0.78"
            >
              {/* Axis hairline */}
              <line
                x1={tickX}
                y1={bbTL.y}
                x2={tickX}
                y2={bbBR.y}
                stroke={lineColor}
                strokeOpacity="0.42"
                strokeWidth="0.5"
              />
              {/* Tick brackets at each segment boundary */}
              {boundaries.map((markY, i) => {
                const y = offsetY + markY * SCALE;
                return (
                  <line
                    key={`left-tick-${i}`}
                    x1={tickX - 2.5}
                    y1={y}
                    x2={tickX + 2.5}
                    y2={y}
                    stroke={lineColor}
                    strokeOpacity="0.6"
                    strokeWidth="0.55"
                  />
                );
              })}
              {/* Segment labels rotated -90 so they read bottom-to-top */}
              {segments.map((seg, i) => {
                const cy = offsetY + ((seg.start + seg.end) / 2) * SCALE;
                return (
                  <text
                    key={`left-label-${i}`}
                    x={labelX}
                    y={cy}
                    textAnchor="middle"
                    letterSpacing="0.1em"
                    transform={`rotate(-90 ${labelX} ${cy})`}
                    dominantBaseline="middle"
                  >
                    {seg.label}
                  </text>
                );
              })}
            </g>
          );
        })()}

        {/* ─── Δ OPT — optical correction dimension callout ───
            A horizontal Δ between OPT (the optical center) and GEO (the bbox
            geometric center). This Δ is original analysis on top of the brand
            spec, not part of the spec itself — the brand book centers the
            mark geometrically; our +6u shift compensates for the perceived
            left-weighting of the mark's chevron mass. */}
        {(() => {
          const dy = bbBR.y + 28;
          const midX = (CX + bboxCenterX) / 2;
          return (
            <g
              fontFamily="var(--font-mono, ui-monospace, monospace)"
              fontSize="8.5"
              fill={lineColor}
              fillOpacity="0.78"
            >
              {/* Witness lines (dotted) from each center down to the dim line */}
              <line
                x1={CX}
                y1={CY + 9}
                x2={CX}
                y2={dy - 4}
                stroke={lineColor}
                strokeOpacity="0.28"
                strokeWidth="0.45"
                strokeDasharray="1 2.5"
              />
              <line
                x1={bboxCenterX}
                y1={bboxCenterY + 6}
                x2={bboxCenterX}
                y2={dy - 4}
                stroke={lineColor}
                strokeOpacity="0.28"
                strokeWidth="0.45"
                strokeDasharray="1 2.5"
              />
              {/* Dimension line + smaller arrowheads */}
              <line
                x1={CX + 0.5}
                y1={dy}
                x2={bboxCenterX - 0.5}
                y2={dy}
                stroke={lineColor}
                strokeOpacity="0.6"
                strokeWidth="0.55"
              />
              <path
                d={`M${CX + 0.5} ${dy} l3.5 -1.8 v3.6 z`}
                fill={lineColor}
                fillOpacity="0.65"
              />
              <path
                d={`M${bboxCenterX - 0.5} ${dy} l-3.5 -1.8 v3.6 z`}
                fill={lineColor}
                fillOpacity="0.65"
              />
              {/* Δ label */}
              <text
                x={midX}
                y={dy + 14}
                textAnchor="middle"
                letterSpacing="0.22em"
                fontSize="8"
                fillOpacity="0.85"
              >
                Δ OPT +{OPTICAL_DX.toFixed(2)}u
              </text>
            </g>
          );
        })()}

        {/* Footer wordmark — title-block style. Refined to lower weight and
            wider spacing, flanked by hairline rules so it reads like a spec
            sheet caption. */}
        {(() => {
          const fy = 554;
          // Approximate text half-width at fontSize 10 + 0.42em letterspacing.
          const halfW = 84;
          const ruleInset = 14;
          return (
            <g>
              <line
                x1={CX - 220}
                y1={fy - 4}
                x2={CX - halfW - ruleInset}
                y2={fy - 4}
                stroke={lineColor}
                strokeOpacity="0.32"
                strokeWidth="0.5"
              />
              <line
                x1={CX + halfW + ruleInset}
                y1={fy - 4}
                x2={CX + 220}
                y2={fy - 4}
                stroke={lineColor}
                strokeOpacity="0.32"
                strokeWidth="0.5"
              />
              <text
                x={CX}
                y={fy}
                textAnchor="middle"
                fontFamily="var(--font-mono, ui-monospace, monospace)"
                fontSize="10"
                fill={lineColor}
                fillOpacity="0.55"
                letterSpacing="0.42em"
              >
                LIVEPEER · LPT
              </text>
            </g>
          );
        })()}
      </svg>
    </div>
  );
}

/* ── Token Flow Visualization ── */
/* Theme-adaptive palette. Card surfaces, borders, and text colors are
   derived from `currentColor` via color-mix, so they invert cleanly when
   the page theme flips (currentColor inherits from the wrapper's
   `text-foreground` class). The brand green uses `--vis-accent-green`,
   which is defined per-theme in globals.css. */
const FC = {
  cardBg: "color-mix(in srgb, currentColor 5%, transparent)",
  cardBorder: "color-mix(in srgb, currentColor 12%, transparent)",
  cardBorderHover: "color-mix(in srgb, currentColor 22%, transparent)",
  green: "var(--vis-accent-green, #18794E)",
  greenDim:
    "color-mix(in srgb, var(--vis-accent-green, #18794E) 8%, transparent)",
  greenSoft:
    "color-mix(in srgb, var(--vis-accent-green, #18794E) 20%, transparent)",
  greenGlow:
    "color-mix(in srgb, var(--vis-accent-green, #18794E) 40%, transparent)",
  textPrimary: "color-mix(in srgb, currentColor 92%, transparent)",
  textSecondary: "color-mix(in srgb, currentColor 60%, transparent)",
  textTertiary: "color-mix(in srgb, currentColor 35%, transparent)",
};

function FlowNode({
  x,
  y,
  label,
  sublabel,
  number,
  isActive,
  width = 150,
  height = 64,
}: {
  x: number;
  y: number;
  label: string;
  sublabel: string;
  number: string;
  isActive: boolean;
  width?: number;
  height?: number;
}) {
  const r = 10;
  return (
    <g>
      {isActive && (
        <rect
          x={x - width / 2 - 6}
          y={y - height / 2 - 6}
          width={width + 12}
          height={height + 12}
          rx={r + 4}
          ry={r + 4}
          fill="none"
          stroke={FC.green}
          strokeWidth="1"
          opacity="0.25"
        >
          <animate
            attributeName="opacity"
            values="0.15;0.3;0.15"
            dur="2.5s"
            repeatCount="indefinite"
          />
        </rect>
      )}
      <rect
        x={x - width / 2}
        y={y - height / 2}
        width={width}
        height={height}
        rx={r}
        ry={r}
        fill={isActive ? FC.greenDim : FC.cardBg}
        stroke={isActive ? FC.greenSoft : FC.cardBorder}
        strokeWidth="1"
      />
      <text
        x={x - width / 2 + 14}
        y={y - height / 2 + 18}
        fill={FC.green}
        fontSize="10"
        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        fontWeight="500"
        opacity="0.5"
      >
        {number}
      </text>
      <text
        x={x}
        y={y + 2}
        fill={isActive ? "#fff" : FC.textPrimary}
        fontSize="13"
        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        fontWeight="700"
        textAnchor="middle"
      >
        {label}
      </text>
      <text
        x={x}
        y={y + 18}
        fill={FC.textSecondary}
        fontSize="8.5"
        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        fontWeight="400"
        textAnchor="middle"
      >
        {sublabel}
      </text>
    </g>
  );
}

function TokenPacket({
  path,
  dur,
  delay,
  label,
  size = 3.5,
  color,
  filterId = "soft-glow",
}: {
  path: string;
  dur: string;
  delay: string;
  label?: string;
  size?: number;
  color?: string;
  filterId?: string;
}) {
  const c = color || FC.green;
  return (
    <g>
      <circle r={size + 4} fill={c} opacity="0.1" filter={`url(#${filterId})`}>
        <animateMotion
          dur={dur}
          begin={delay}
          repeatCount="indefinite"
          path={path}
        />
        <animate
          attributeName="opacity"
          values="0;0.15;0.15;0"
          dur={dur}
          begin={delay}
          repeatCount="indefinite"
        />
      </circle>
      <circle r={size} fill={c} opacity="0.85">
        <animateMotion
          dur={dur}
          begin={delay}
          repeatCount="indefinite"
          path={path}
        />
        <animate
          attributeName="opacity"
          values="0;0.9;0.9;0"
          dur={dur}
          begin={delay}
          repeatCount="indefinite"
        />
      </circle>
      <circle r={size * 0.35} fill="#fff" opacity="0.7">
        <animateMotion
          dur={dur}
          begin={delay}
          repeatCount="indefinite"
          path={path}
        />
        <animate
          attributeName="opacity"
          values="0;0.7;0.7;0"
          dur={dur}
          begin={delay}
          repeatCount="indefinite"
        />
      </circle>
      {label && (
        <text
          fontSize="6.5"
          fontFamily="-apple-system, sans-serif"
          fontWeight="600"
          fill={c}
          textAnchor="middle"
          dy="-10"
          opacity="0"
        >
          <animateMotion
            dur={dur}
            begin={delay}
            repeatCount="indefinite"
            path={path}
          />
          <animate
            attributeName="opacity"
            values="0;0.6;0.6;0"
            dur={dur}
            begin={delay}
            repeatCount="indefinite"
          />
          {label}
        </text>
      )}
    </g>
  );
}

function FlowPath({ d, dashed = false }: { d: string; dashed?: boolean }) {
  return (
    <path
      d={d}
      fill="none"
      stroke={FC.green}
      strokeWidth="1"
      opacity={dashed ? 0.15 : 0.2}
      strokeDasharray={dashed ? "5 5" : "none"}
      strokeLinecap="round"
    />
  );
}

function TokenFlowVisualization() {
  const flowNodes = [
    {
      id: 0,
      label: "Applications",
      sublabel: "Request video compute jobs",
      number: "01",
      x: 400,
      y: 130,
    },
    {
      id: 1,
      label: "Gateway Nodes",
      sublabel: "Route jobs to orchestrators",
      number: "02",
      x: 400,
      y: 350,
    },
    {
      id: 2,
      label: "Orchestrator Nodes",
      sublabel: "GPU clusters process work",
      number: "03",
      x: 670,
      y: 130,
      width: 170,
    },
    {
      id: 3,
      label: "Delegators",
      sublabel: "Stake LPT and earn fees",
      number: "04",
      x: 670,
      y: 350,
    },
  ];

  /* ── Vertical (mobile) layout constants ── */
  const vCx = 160; // center x for vertical nodes
  const vNodeW = 200;
  const vNodeH = 72;
  const vGap = 110; // vertical spacing between node centers
  const vY = [60, 60 + vGap, 60 + vGap * 2, 60 + vGap * 3]; // y centers
  const vSvgH = vY[3] + vNodeH / 2 + 30; // total svg height

  return (
    <div>
      {/* ── Mobile: vertical stacked layout ── */}
      <div className="overflow-hidden md:hidden">
        <svg viewBox={`0 0 320 ${vSvgH}`} className="block w-full">
          <defs>
            <filter id="soft-glow-m">
              <feGaussianBlur stdDeviation="5" />
            </filter>
            <marker
              id="arrow-m"
              markerWidth="8"
              markerHeight="6"
              refX="8"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 8 3, 0 6" fill={FC.green} opacity="0.35" />
            </marker>
          </defs>

          {/* Applications → Gateways */}
          <FlowPath
            d={`M${vCx},${vY[0] + vNodeH / 2} L${vCx},${vY[1] - vNodeH / 2}`}
          />
          <line
            x1={vCx}
            y1={vY[0] + vNodeH / 2}
            x2={vCx}
            y2={vY[1] - vNodeH / 2 - 5}
            stroke={FC.green}
            strokeWidth="1"
            opacity="0.2"
            markerEnd="url(#arrow-m)"
          />
          <text
            x={vCx + 14}
            y={(vY[0] + vY[1]) / 2 + 4}
            fill={FC.green}
            fontSize="10"
            fontFamily="-apple-system, sans-serif"
            fontWeight="500"
            opacity="0.35"
          >
            REQUESTS
          </text>

          {/* Gateways → Orchestrators */}
          <FlowPath
            d={`M${vCx},${vY[1] + vNodeH / 2} L${vCx},${vY[2] - vNodeH / 2}`}
          />
          <line
            x1={vCx}
            y1={vY[1] + vNodeH / 2}
            x2={vCx}
            y2={vY[2] - vNodeH / 2 - 5}
            stroke={FC.green}
            strokeWidth="1"
            opacity="0.2"
            markerEnd="url(#arrow-m)"
          />
          <text
            x={vCx + 14}
            y={(vY[1] + vY[2]) / 2 + 4}
            fill={FC.green}
            fontSize="10"
            fontFamily="-apple-system, sans-serif"
            fontWeight="500"
            opacity="0.35"
          >
            JOBS + PAYMENTS
          </text>

          {/* Orchestrators → Delegators (fees) */}
          <FlowPath
            d={`M${vCx + 20},${vY[2] + vNodeH / 2} L${vCx + 20},${vY[3] - vNodeH / 2}`}
          />
          <line
            x1={vCx + 20}
            y1={vY[2] + vNodeH / 2}
            x2={vCx + 20}
            y2={vY[3] - vNodeH / 2 - 5}
            stroke={FC.green}
            strokeWidth="1"
            opacity="0.2"
            markerEnd="url(#arrow-m)"
          />
          <text
            x={vCx + 38}
            y={(vY[2] + vY[3]) / 2 + 4}
            fill={FC.green}
            fontSize="10"
            fontFamily="-apple-system, sans-serif"
            fontWeight="500"
            opacity="0.35"
          >
            FEES
          </text>

          {/* Delegators → Orchestrators (stake, dashed) */}
          <FlowPath
            d={`M${vCx - 20},${vY[3] - vNodeH / 2} L${vCx - 20},${vY[2] + vNodeH / 2}`}
            dashed
          />
          <line
            x1={vCx - 20}
            y1={vY[3] - vNodeH / 2}
            x2={vCx - 20}
            y2={vY[2] + vNodeH / 2 + 5}
            stroke={FC.green}
            strokeWidth="1"
            opacity="0.15"
            markerEnd="url(#arrow-m)"
          />
          <text
            x={vCx - 38}
            y={(vY[2] + vY[3]) / 2 + 4}
            fill={FC.green}
            fontSize="10"
            fontFamily="-apple-system, sans-serif"
            fontWeight="500"
            textAnchor="end"
            opacity="0.25"
          >
            STAKE
          </text>

          {/* Animated packets. filterId points at the mobile SVG's
              `soft-glow-m` filter (the desktop SVG further down defines its
              own `soft-glow` so each scope references the right defs). */}
          <TokenPacket
            path={`M${vCx},${vY[0] + vNodeH / 2} L${vCx},${vY[1] - vNodeH / 2}`}
            dur="2.2s"
            delay="0s"
            label="REQ"
            filterId="soft-glow-m"
          />
          <TokenPacket
            path={`M${vCx},${vY[1] + vNodeH / 2} L${vCx},${vY[2] - vNodeH / 2}`}
            dur="2.2s"
            delay="0.4s"
            label="JOB"
            filterId="soft-glow-m"
          />
          <TokenPacket
            path={`M${vCx + 20},${vY[2] + vNodeH / 2} L${vCx + 20},${vY[3] - vNodeH / 2}`}
            dur="3s"
            delay="0.2s"
            label="ETH"
            size={4}
            filterId="soft-glow-m"
          />
          <TokenPacket
            path={`M${vCx - 20},${vY[3] - vNodeH / 2} L${vCx - 20},${vY[2] + vNodeH / 2}`}
            dur="3.5s"
            delay="1.2s"
            label="LPT"
            size={3}
            color="rgba(0, 235, 136, 0.5)"
            filterId="soft-glow-m"
          />

          {/* Nodes */}
          {[
            {
              label: "Applications",
              sublabel: "Request video compute jobs",
              number: "01",
            },
            {
              label: "Gateway Nodes",
              sublabel: "Route jobs to orchestrators",
              number: "02",
            },
            {
              label: "Orchestrator Nodes",
              sublabel: "GPU clusters process work",
              number: "03",
            },
            {
              label: "Delegators",
              sublabel: "Stake LPT and earn fees",
              number: "04",
            },
          ].map((n, i) => (
            <FlowNode
              key={n.number}
              x={vCx}
              y={vY[i]}
              label={n.label}
              sublabel={n.sublabel}
              number={n.number}
              isActive={false}
              width={vNodeW}
              height={vNodeH}
            />
          ))}

          {/* Ambient particles */}
          {Array.from({ length: 6 }).map((_, i) => (
            <circle
              key={`pm-${i}`}
              cx={30 + ((i * 53) % 260)}
              cy={30 + ((i * 97) % (vSvgH - 60))}
              r="1"
              fill={FC.green}
              opacity="0"
            >
              <animate
                attributeName="opacity"
                values="0;0.2;0"
                dur={`${4 + (i % 4)}s`}
                begin={`${(i * 0.6) % 6}s`}
                repeatCount="indefinite"
              />
            </circle>
          ))}
        </svg>
      </div>

      {/* ── Desktop layout: 2-row grid.
              Top row:    Applications (left)  /  Orchestrator (right)
              Bottom row: Gateway (left)       /  Delegators (right)
            Apps→Gateway and Orch⇄Delegators are vertical pairs in their
            respective columns; Gateway⇄Orchestrator is connected by two
            diagonal arrows that cross in an X (jobs going up-right, video
            response going down-left). */}
      <div className="hidden overflow-hidden md:block">
        <svg viewBox="290 60 500 360" className="block w-full">
          <defs>
            <filter id="soft-glow">
              <feGaussianBlur stdDeviation="5" />
            </filter>
            <marker
              id="arrow"
              markerWidth="7"
              markerHeight="5"
              refX="7"
              refY="2.5"
              orient="auto"
            >
              <polygon
                points="0 0, 7 2.5, 0 5"
                fill={FC.green}
                opacity="0.35"
              />
            </marker>
          </defs>

          {/* Applications → Gateways (DOWN — requests) */}
          <FlowPath d="M400,162 L400,318" />
          <line
            x1="400"
            y1="162"
            x2="400"
            y2="313"
            stroke={FC.green}
            strokeWidth="1"
            opacity="0.2"
            markerEnd="url(#arrow)"
          />

          {/* Gateway → Orchestrator (DIAGONAL up-right — jobs + payments).
              Parallel pair with VIDEO RESPONSE below; same slope (-2.0),
              vertical separation 20 at both endpoints. */}
          <FlowPath d="M475,340 L585,120" />
          <line
            x1="475"
            y1="340"
            x2="583"
            y2="124"
            stroke={FC.green}
            strokeWidth="1"
            opacity="0.2"
            markerEnd="url(#arrow)"
          />

          {/* Orchestrator → Gateway (DIAGONAL down-left — processed video).
              Parallel pair with JOBS above; lines never cross. */}
          <FlowPath d="M585,140 L475,360" />
          <line
            x1="585"
            y1="140"
            x2="477"
            y2="356"
            stroke={FC.green}
            strokeWidth="1"
            opacity="0.2"
            markerEnd="url(#arrow)"
          />

          {/* Orchestrators → Delegators (fees down) */}
          <FlowPath d="M690,162 L690,318" />
          <line
            x1="690"
            y1="162"
            x2="690"
            y2="313"
            stroke={FC.green}
            strokeWidth="1"
            opacity="0.2"
            markerEnd="url(#arrow)"
          />

          {/* Delegators → Orchestrators (stake up, dashed) */}
          <FlowPath d="M650,318 L650,162" dashed={true} />
          <line
            x1="650"
            y1="318"
            x2="650"
            y2="167"
            stroke={FC.green}
            strokeWidth="1"
            opacity="0.15"
            markerEnd="url(#arrow)"
          />

          {/* Path labels */}
          <text
            x="385"
            y="240"
            fill={FC.green}
            fontSize="8"
            fontFamily="-apple-system, sans-serif"
            fontWeight="500"
            opacity="0.35"
            transform="rotate(-90, 385, 240)"
          >
            REQUESTS
          </text>
          {/* JOBS + PAYMENTS — rotated along the parallel diagonal pair
              (both lines share slope -2.0 → angle -63.4°). Label sits on
              the upper-left side of the top track. */}
          <text
            x="503"
            y="258"
            fill={FC.green}
            fontSize="8"
            fontFamily="-apple-system, sans-serif"
            fontWeight="500"
            textAnchor="middle"
            opacity="0.35"
            transform="rotate(-63.4, 503, 258)"
          >
            JOBS + PAYMENTS
          </text>
          {/* VIDEO RESPONSE — same rotation as JOBS (parallel lines).
              Label sits on the lower-right side of the bottom track. */}
          <text
            x="557"
            y="222"
            fill={FC.green}
            fontSize="8"
            fontFamily="-apple-system, sans-serif"
            fontWeight="500"
            textAnchor="middle"
            opacity="0.3"
            transform="rotate(-63.4, 557, 222)"
          >
            VIDEO RESPONSE
          </text>
          <text
            x="705"
            y="240"
            fill={FC.green}
            fontSize="8"
            fontFamily="-apple-system, sans-serif"
            fontWeight="500"
            opacity="0.35"
            transform="rotate(90, 705, 240)"
          >
            FEES
          </text>
          <text
            x="635"
            y="240"
            fill={FC.green}
            fontSize="8"
            fontFamily="-apple-system, sans-serif"
            fontWeight="500"
            opacity="0.25"
            transform="rotate(-90, 635, 240)"
          >
            STAKE
          </text>

          {/* Animated packets — all moving at ~49 units/s (matches the
              LPT/ETH reference speed). Vertical 156-unit paths take 3.2s;
              diagonal ~246-unit paths take 5.0s. Same speed across all
              flows regardless of path length. */}
          <TokenPacket
            path="M400,162 L400,318"
            dur="3.2s"
            delay="0s"
            label="REQ"
          />
          <TokenPacket
            path="M400,162 L400,318"
            dur="3.2s"
            delay="1.6s"
            size={2.5}
          />
          <TokenPacket
            path="M475,340 L585,120"
            dur="5.0s"
            delay="0.4s"
            label="JOB"
          />
          <TokenPacket
            path="M475,340 L585,120"
            dur="5.0s"
            delay="2.9s"
            size={2.5}
          />
          <TokenPacket
            path="M585,140 L475,360"
            dur="5.0s"
            delay="0.9s"
            label="VID"
            size={3}
          />
          <TokenPacket
            path="M690,162 L690,318"
            dur="3.2s"
            delay="0.2s"
            label="ETH"
            size={4}
          />
          <TokenPacket
            path="M650,318 L650,162"
            dur="3.2s"
            delay="1.2s"
            label="LPT"
            size={3}
          />

          {/* Nodes */}
          {flowNodes.map((n) => (
            <FlowNode
              key={n.id}
              x={n.x}
              y={n.y}
              label={n.label}
              sublabel={n.sublabel}
              number={n.number}
              isActive={false}
              width={(n as { width?: number }).width || 150}
            />
          ))}

          {/* Ambient particles — distributed across the viewBox bounds */}
          {Array.from({ length: 10 }).map((_, i) => (
            <circle
              key={`p-${i}`}
              cx={310 + ((i * 71) % 460)}
              cy={75 + ((i * 31) % 330)}
              r="1"
              fill={FC.green}
              opacity="0"
            >
              <animate
                attributeName="opacity"
                values="0;0.2;0"
                dur={`${4 + (i % 4)}s`}
                begin={`${(i * 0.6) % 6}s`}
                repeatCount="indefinite"
              />
            </circle>
          ))}
        </svg>
      </div>
    </div>
  );
}

function BinanceLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 126 126" fill="#F0B90B">
      <path d="M38.4 53.6L63 29l24.6 24.6 14.3-14.3L63 .6 24.1 39.3l14.3 14.3zM.6 63l14.3-14.3L29.2 63 14.9 77.3.6 63zm37.8 9.4L63 97l24.6-24.6 14.3 14.3L63 125.4 24.1 86.7l14.3-14.3zM96.8 63l14.3-14.3L125.4 63l-14.3 14.3L96.8 63z" />
      <path d="M77.5 63L63 48.5 52.2 59.3l-1.2 1.2L48.5 63 63 77.5 77.5 63z" />
    </svg>
  );
}

function CoinbaseLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 1024 1024" fill="#0052FF">
      <path d="M512 0C229.2 0 0 229.2 0 512s229.2 512 512 512 512-229.2 512-512S794.8 0 512 0zm0 716.8c-113.1 0-204.8-91.7-204.8-204.8S398.9 307.2 512 307.2 716.8 398.9 716.8 512 625.1 716.8 512 716.8z" />
    </svg>
  );
}

function KrakenLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 42 32" fill="#5741d9">
      <path d="M20.9964832,0 C9.39735269,0 0,9.11917531 0,20.3663948 L0,29.0927818 C0,30.6995672 1.34340172,32 2.99584756,32 C4.65059006,32 6.00102529,30.6995672 6.00102529,29.0927818 L6.00102529,20.3663948 C6.00102529,18.7575216 7.33753704,17.4547226 8.99916951,17.4547226 C10.653912,17.4547226 11.9974573,18.7575216 11.9974573,20.3663948 L11.9974573,29.0927818 C11.9974573,30.6995672 13.340859,32 14.9956015,32 C16.6549373,32 17.998339,30.6995672 17.998339,29.0927818 L17.998339,20.3663948 C17.998339,18.7575216 19.3418843,17.4547226 20.9964832,17.4547226 C22.6581157,17.4547226 24.001661,18.7575216 24.001661,20.3663948 L24.001661,29.0927818 C24.001661,30.6995672 25.3450627,32 26.9975085,32 C28.652251,32 29.9956528,30.6995672 29.9956528,29.0927818 L29.9956528,20.3663948 C29.9956528,18.7575216 31.339198,17.4547226 33.0008305,17.4547226 C34.655573,17.4547226 35.9991182,18.7575216 35.9991182,20.3663948 L35.9991182,29.0927818 C35.9991182,30.6995672 37.34252,32 39.0018558,32 C40.6565983,32 42,30.6995672 42,29.0927818 L42,20.3663948 C42,9.11917531 32.5957573,0 20.9964832,0" />
    </svg>
  );
}

function UniswapLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 641 640" fill="none">
      <path
        d="M224.534 123.226C218.692 122.32 218.445 122.213 221.195 121.791C226.464 120.98 238.905 122.085 247.479 124.123C267.494 128.881 285.707 141.069 305.148 162.714L310.313 168.465L317.701 167.277C348.828 162.275 380.493 166.25 406.978 178.485C414.264 181.851 425.752 188.552 427.187 190.274C427.645 190.822 428.485 194.355 429.053 198.124C431.02 211.164 430.036 221.16 426.047 228.625C423.877 232.688 423.756 233.975 425.215 237.452C426.38 240.227 429.627 242.28 432.843 242.276C439.425 242.267 446.509 231.627 449.791 216.823L451.095 210.943L453.678 213.868C467.846 229.92 478.974 251.811 480.885 267.393L481.383 271.455L479.002 267.762C474.903 261.407 470.785 257.08 465.512 253.591C456.006 247.301 445.955 245.161 419.337 243.758C395.296 242.491 381.69 240.438 368.198 236.038C345.244 228.554 333.672 218.587 306.405 182.812C294.294 166.923 286.808 158.131 279.362 151.051C262.442 134.964 245.816 126.527 224.534 123.226Z"
        fill="#FF007A"
      />
      <path
        d="M432.61 158.704C433.215 148.057 434.659 141.033 437.562 134.62C438.711 132.081 439.788 130.003 439.954 130.003C440.12 130.003 439.621 131.877 438.844 134.167C436.733 140.392 436.387 148.905 437.84 158.811C439.686 171.379 440.735 173.192 454.019 186.769C460.25 193.137 467.497 201.168 470.124 204.616L474.901 210.886L470.124 206.405C464.282 200.926 450.847 190.24 447.879 188.712C445.89 187.688 445.594 187.705 444.366 188.927C443.235 190.053 442.997 191.744 442.84 199.741C442.596 212.204 440.897 220.204 436.797 228.203C434.58 232.529 434.23 231.606 436.237 226.723C437.735 223.077 437.887 221.474 437.876 209.408C437.853 185.167 434.975 179.339 418.097 169.355C413.821 166.826 406.776 163.178 402.442 161.249C398.107 159.32 394.664 157.639 394.789 157.514C395.267 157.038 411.727 161.842 418.352 164.39C428.206 168.181 429.833 168.672 431.03 168.215C431.832 167.909 432.22 165.572 432.61 158.704Z"
        fill="#FF007A"
      />
      <path
        d="M235.883 200.175C224.022 183.846 216.684 158.809 218.272 140.093L218.764 134.301L221.463 134.794C226.534 135.719 235.275 138.973 239.369 141.459C250.602 148.281 255.465 157.263 260.413 180.328C261.862 187.083 263.763 194.728 264.638 197.317C266.047 201.483 271.369 211.214 275.696 217.534C278.813 222.085 276.743 224.242 269.853 223.62C259.331 222.67 245.078 212.834 235.883 200.175Z"
        fill="#FF007A"
      />
      <path
        d="M418.223 321.707C362.793 299.389 343.271 280.017 343.271 247.331C343.271 242.521 343.437 238.585 343.638 238.585C343.84 238.585 345.985 240.173 348.404 242.113C359.644 251.128 372.231 254.979 407.076 260.062C427.58 263.054 439.119 265.47 449.763 269C483.595 280.22 504.527 302.99 509.518 334.004C510.969 343.016 510.118 359.915 507.766 368.822C505.91 375.857 500.245 388.537 498.742 389.023C498.325 389.158 497.917 387.562 497.81 385.389C497.24 373.744 491.355 362.406 481.472 353.913C470.235 344.257 455.137 336.569 418.223 321.707Z"
        fill="#FF007A"
      />
      <path
        d="M379.31 330.978C378.615 326.846 377.411 321.568 376.633 319.25L375.219 315.036L377.846 317.985C381.481 322.065 384.354 327.287 386.789 334.241C388.647 339.549 388.856 341.127 388.842 349.753C388.828 358.221 388.596 359.996 386.88 364.773C384.174 372.307 380.816 377.649 375.181 383.383C365.056 393.688 352.038 399.393 333.253 401.76C329.987 402.171 320.47 402.864 312.103 403.299C291.016 404.395 277.138 406.661 264.668 411.04C262.875 411.67 261.274 412.052 261.112 411.89C260.607 411.388 269.098 406.326 276.111 402.948C285.999 398.185 295.842 395.586 317.897 391.913C328.792 390.098 340.043 387.897 342.9 387.021C369.88 378.749 383.748 357.402 379.31 330.978Z"
        fill="#FF007A"
      />
      <path
        d="M404.719 376.105C397.355 360.273 395.664 344.988 399.698 330.732C400.13 329.209 400.824 327.962 401.242 327.962C401.659 327.962 403.397 328.902 405.103 330.05C408.497 332.335 415.303 336.182 433.437 346.069C456.065 358.406 468.966 367.959 477.74 378.873C485.423 388.432 490.178 399.318 492.467 412.593C493.762 420.113 493.003 438.206 491.074 445.778C484.99 469.653 470.85 488.406 450.682 499.349C447.727 500.952 445.075 502.269 444.788 502.275C444.501 502.28 445.577 499.543 447.18 496.191C453.965 482.009 454.737 468.214 449.608 452.859C446.467 443.457 440.064 431.985 427.135 412.596C412.103 390.054 408.417 384.054 404.719 376.105Z"
        fill="#FF007A"
      />
      <path
        d="M196.519 461.525C217.089 444.157 242.682 431.819 265.996 428.032C276.043 426.399 292.78 427.047 302.084 429.428C316.998 433.245 330.338 441.793 337.276 451.978C344.057 461.932 346.966 470.606 349.995 489.906C351.189 497.519 352.489 505.164 352.882 506.895C355.156 516.897 359.583 524.892 365.067 528.907C373.779 535.283 388.78 535.68 403.536 529.924C406.041 528.947 408.215 528.271 408.368 528.424C408.903 528.955 401.473 533.93 396.23 536.548C389.177 540.071 383.568 541.434 376.115 541.434C362.6 541.434 351.379 534.558 342.016 520.539C340.174 517.78 336.032 509.516 332.813 502.176C322.928 479.628 318.046 472.759 306.568 465.242C296.579 458.701 283.697 457.53 274.006 462.282C261.276 468.523 257.724 484.791 266.842 495.101C270.465 499.198 277.223 502.732 282.749 503.419C293.086 504.705 301.97 496.841 301.97 486.404C301.97 479.627 299.365 475.76 292.808 472.801C283.852 468.76 274.226 473.483 274.272 481.897C274.292 485.484 275.854 487.737 279.45 489.364C281.757 490.408 281.811 490.491 279.929 490.1C271.712 488.396 269.787 478.49 276.394 471.913C284.326 464.018 300.729 467.502 306.362 478.279C308.728 482.805 309.003 491.82 306.94 497.264C302.322 509.448 288.859 515.855 275.201 512.368C265.903 509.994 262.117 507.424 250.906 495.876C231.425 475.809 223.862 471.92 195.777 467.536L190.395 466.696L196.519 461.525Z"
        fill="#FF007A"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M49.6202 12.0031C114.678 90.9638 214.977 213.901 219.957 220.784C224.068 226.467 222.521 231.576 215.478 235.58C211.561 237.807 203.508 240.063 199.476 240.063C194.916 240.063 189.779 237.867 186.038 234.318C183.393 231.81 172.721 215.874 148.084 177.646C129.233 148.396 113.457 124.131 113.027 123.725C112.032 122.785 112.049 122.817 146.162 183.854C167.582 222.181 174.813 235.731 174.813 237.543C174.813 241.229 173.808 243.166 169.261 248.238C161.681 256.694 158.293 266.195 155.847 285.859C153.104 307.902 145.394 323.473 124.026 350.122C111.518 365.722 109.471 368.581 106.315 374.869C102.339 382.786 101.246 387.221 100.803 397.219C100.335 407.79 101.247 414.619 104.477 424.726C107.304 433.575 110.255 439.417 117.8 451.104C124.311 461.188 128.061 468.683 128.061 471.614C128.061 473.947 128.506 473.95 138.596 471.672C162.741 466.219 182.348 456.629 193.375 444.877C200.199 437.603 201.801 433.586 201.853 423.618C201.887 417.098 201.658 415.733 199.896 411.982C197.027 405.877 191.804 400.801 180.292 392.932C165.209 382.621 158.767 374.32 156.987 362.904C155.527 353.537 157.221 346.928 165.565 329.44C174.202 311.338 176.342 303.624 177.79 285.378C178.725 273.589 180.02 268.94 183.407 265.209C186.939 261.317 190.119 260 198.861 258.805C213.113 256.858 222.188 253.171 229.648 246.297C236.119 240.334 238.827 234.588 239.243 225.938L239.558 219.382L235.942 215.166C222.846 199.896 40.85 0 40.044 0C39.8719 0 44.1813 5.40178 49.6202 12.0031ZM135.412 409.18C138.373 403.937 136.8 397.195 131.847 393.902C127.167 390.79 119.897 392.256 119.897 396.311C119.897 397.548 120.582 398.449 122.124 399.243C124.72 400.579 124.909 402.081 122.866 405.152C120.797 408.262 120.964 410.996 123.337 412.854C127.162 415.849 132.576 414.202 135.412 409.18Z"
        fill="#FF007A"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M248.552 262.244C241.862 264.299 235.358 271.39 233.344 278.826C232.116 283.362 232.813 291.319 234.653 293.776C237.625 297.745 240.499 298.791 248.282 298.736C263.518 298.63 276.764 292.095 278.304 283.925C279.567 277.229 273.749 267.948 265.736 263.874C261.601 261.772 252.807 260.938 248.552 262.244ZM266.364 276.172C268.714 272.834 267.686 269.225 263.69 266.785C256.08 262.138 244.571 265.983 244.571 273.173C244.571 276.752 250.572 280.656 256.074 280.656C259.735 280.656 264.746 278.473 266.364 276.172Z"
        fill="#FF007A"
      />
    </svg>
  );
}

function OKXLogo({ className }: { className?: string }) {
  // OKX doesn't have a signature brand color baked into this glyph (unlike
  // Binance/Coinbase/Kraken/Uniswap), so we inherit the parent's text color.
  // That keeps the logo readable in both themes: white on dark, dark on light.
  return (
    <svg className={className} viewBox="0 0 32 32" fill="currentColor">
      <rect x="1" y="1" width="9" height="9" rx="1.5" />
      <rect x="11.5" y="1" width="9" height="9" rx="1.5" />
      <rect x="22" y="1" width="9" height="9" rx="1.5" />
      <rect x="1" y="11.5" width="9" height="9" rx="1.5" />
      <rect x="22" y="11.5" width="9" height="9" rx="1.5" />
      <rect x="1" y="22" width="9" height="9" rx="1.5" />
      <rect x="11.5" y="22" width="9" height="9" rx="1.5" />
      <rect x="22" y="22" width="9" height="9" rx="1.5" />
    </svg>
  );
}

const exchanges = [
  {
    name: "Binance",
    href: "https://www.binance.com/en/trade/LPT_USDT",
    Logo: BinanceLogo,
  },
  {
    name: "Coinbase",
    href: "https://www.coinbase.com/price/livepeer",
    Logo: CoinbaseLogo,
  },
  {
    name: "Kraken",
    href: "https://www.kraken.com/prices/livepeer",
    Logo: KrakenLogo,
  },
  {
    name: "Uniswap",
    href: "https://app.uniswap.org/tokens/ethereum/0x58b6a8a3302369daec383334672404ee733ab239",
    Logo: UniswapLogo,
  },
  {
    name: "OKX",
    href: "https://www.okx.com/trade-spot/lpt-usdt",
    Logo: OKXLogo,
  },
];

export default function TokenPageContent({
  stats,
}: {
  stats: ProtocolStats;
}) {
  return (
    <>
      {/* Hero — editorial left-aligned, token specimen card on the right */}
      <section className="relative overflow-hidden bg-background pt-28 pb-20 lg:pt-32 lg:pb-32">
        {/* Top-edge highlight + green glow stack — mirrors the subtle gradient
            used at the top of the Ecosystem page hero (see PageHero.tsx).
            Three layered effects: hairline highlight at y=0, primary radial
            glow centered above the fold, and a secondary offset glow for
            depth. All pointer-events-none so they don't intercept clicks. */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px"
          style={{
            background:
              "linear-gradient(to right, transparent, rgba(24,121,78,0.15) 30%, rgba(24,121,78,0.20) 50%, rgba(24,121,78,0.15) 70%, transparent)",
          }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[500px]"
          style={{
            background:
              "radial-gradient(ellipse 100% 40% at 50% -5%, rgba(24,121,78,0.09) 0%, transparent 70%)",
          }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[500px]"
          style={{
            background:
              "radial-gradient(ellipse 70% 35% at 65% 0%, rgba(52,199,89,0.045) 0%, transparent 70%)",
          }}
          aria-hidden="true"
        />
        <Container className="relative">
          <motion.div
            className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {/* LEFT — typography column */}
            <div className="relative">
              {/* Eyebrow + metadata badge */}
              <div className="mb-6 flex flex-wrap items-center gap-3">
                <p className="font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-foreground/55">
                  Livepeer Token
                </p>
                <span
                  className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.14em]"
                  style={{
                    borderColor:
                      "color-mix(in srgb, var(--vis-accent-green) 30%, transparent)",
                    background:
                      "color-mix(in srgb, var(--vis-accent-green) 8%, transparent)",
                    color: "var(--vis-accent-green)",
                  }}
                >
                  <span
                    className="inline-block h-1 w-1 rounded-full bg-current"
                    aria-hidden="true"
                  />
                  ERC-20 · Ethereum
                </span>
              </div>

              {/* Tonal two-line headline (Colossus rhythm: solid first line, muted second) */}
              <h1 className="text-4xl font-medium leading-[1.04] tracking-[-0.022em] sm:text-5xl lg:text-[64px] lg:leading-[1.0]">
                <span className="block text-foreground">The token that</span>
                <span className="block text-foreground/40">
                  aligns the network.
                </span>
              </h1>

              <p className="mt-7 max-w-lg text-[16.5px] leading-[1.6] text-foreground/65">
                Livepeer Token (LPT) is part of the coordination mechanism
                behind the Livepeer network — aligning incentives between the
                GPU providers who do the work, the applications that need
                video, and the stakeholders who help secure the network.
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
                <Button href="#exchanges" variant="white">
                  Find an Exchange
                </Button>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground/65 transition-colors hover:text-foreground"
                >
                  Learn how it works
                  <span aria-hidden="true">↓</span>
                </a>
              </div>
            </div>

            {/* RIGHT — token specimen card (desktop only) */}
            <div
              className="relative mx-auto hidden w-full max-w-[484px] lg:mx-0 lg:block"
              aria-hidden="true"
            >
              <LPTTokenSpecimen stats={stats} />
            </div>
          </motion.div>
        </Container>

        {/* Ruler tick marks across the bottom — Colossus signature flourish */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 flex h-12 items-end overflow-hidden"
          aria-hidden="true"
        >
          <div className="flex w-full items-end justify-between px-6">
            {Array.from({ length: 60 }).map((_, i) => (
              <span
                key={i}
                className="block w-px bg-foreground/[0.18]"
                style={{ height: i % 5 === 0 ? "14px" : "7px" }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Network Architecture */}
      <section id="how-it-works" className="relative py-24 lg:py-32">
        <div className="divider-gradient absolute top-0 left-0 right-0" />
        <Container>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            transition={{ staggerChildren: 0.06 }}
            className="grid items-center gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-14"
          >
            {/* Left column — SectionHeader (allowed to wrap to two lines if
                the title doesn't fit the column at the current size) + body
                paragraphs styled to match the section description. */}
            <motion.div variants={fadeUp} transition={{ duration: 0.4 }}>
              <SectionHeader
                label="Tokenomics"
                title={
                  <>
                    <span className="block">The role of</span>
                    <span className="block text-foreground/40">
                      Livepeer token
                    </span>
                  </>
                }
                align="left"
                size="small"
              />
              {/* Multi-paragraph body — rendered as a separate block since
                  SectionHeader's description prop is a single <p>. Styling
                  matches the SectionHeader description (text-lg leading-
                  relaxed text-foreground/50 text-pretty) so the visual
                  rhythm reads as a unified header + body. */}
              <div className="mt-5 max-w-2xl space-y-4 text-lg leading-relaxed text-foreground/50 text-pretty">
                <p>
                  LPT secures and coordinates the network through staking,
                  selection, and governance.
                </p>
                <p>
                  Orchestrators — the providers who supply compute — stake LPT
                  as a commitment to do reliable work. The more stake behind
                  an orchestrator, the more work it earns, but it has to keep
                  performing to keep it. Apps pay fees for that work, which
                  flow to the orchestrators performing it.
                </p>
                <p>
                  Delegators stake LPT behind orchestrators they trust,
                  sharing in those fees and rewards — directing capital toward
                  the best operators. And as the governance token, LPT lets
                  holders shape the protocol and treasury.
                </p>
              </div>
            </motion.div>

            {/* Interactive flow visualization — theme-adaptive, no forced dark */}
            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.4 }}
              className="text-foreground overflow-hidden rounded-2xl"
            >
              <TokenFlowVisualization />
            </motion.div>
          </motion.div>
        </Container>
      </section>

      {/* Exchanges */}
      <section id="exchanges" className="relative py-24 lg:py-32">
        <div className="divider-gradient absolute top-0 left-0 right-0" />
        <Container>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            transition={{ staggerChildren: 0.06 }}
          >
            <motion.div variants={fadeUp} transition={{ duration: 0.4 }}>
              <SectionHeader
                label="Exchanges"
                title="Get Livepeer Token"
                align="center"
                size="small"
              />
            </motion.div>

            <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {exchanges.map((exchange) => (
                <motion.a
                  key={exchange.name}
                  href={exchange.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  variants={fadeUp}
                  transition={{ duration: 0.4 }}
                  className="group flex flex-col items-center gap-4 rounded-xl border border-foreground/[0.07] bg-card px-6 py-7 transition-all duration-200 hover:border-foreground/[0.15] hover:bg-surface"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-foreground/[0.06] transition-colors group-hover:bg-foreground/[0.1]">
                    <exchange.Logo className="h-5 w-5" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[14px] font-medium text-foreground/80 group-hover:text-foreground">
                      {exchange.name}
                    </span>
                    <svg
                      className="h-3 w-3 text-foreground/20 transition-all group-hover:text-foreground/40 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      fill="none"
                      viewBox="0 0 12 12"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path
                        d="M3.5 2H10v6.5M10 2L2 10"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </motion.a>
              ))}
            </div>
          </motion.div>
        </Container>
      </section>

      {/* Delegate LPT */}
      <section className="relative py-24 lg:py-32">
        <div className="divider-gradient absolute top-0 left-0 right-0" />
        <Container>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            transition={{ staggerChildren: 0.06 }}
          >
            <motion.div variants={fadeUp} transition={{ duration: 0.4 }}>
              <SectionHeader
                label="Delegate"
                title="Earn rewards by staking LPT"
                description="Back GPU providers you trust with your LPT and earn a share of the fees and inflation rewards they generate."
                align="center"
                size="small"
              />
            </motion.div>

            {/* CTA */}
            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.4 }}
              className="mt-10 flex justify-center"
            >
              <Button href={EXTERNAL_LINKS.explorer} variant="white">
                Open Explorer
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 12 12"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path
                    d="M3.5 2H10v6.5M10 2L2 10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Button>
            </motion.div>
          </motion.div>
        </Container>
      </section>
    </>
  );
}
