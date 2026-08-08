/**
 * The symbol, drafted.
 *
 * Recovered from the old token page's specimen card (deleted in the redesign
 * cutover) and re-aimed at the brand page, where the geometry is the subject
 * rather than framing for LPT. The token chrome is gone with it — no chain
 * label, no live staking figure — so this page keeps its zero data
 * dependencies.
 *
 * It earns its place by showing the rule instead of asserting it: the lattice
 * lines all pass through real square edges, the tick rows carry the actual
 * measures, and the +6u optical shift is drawn as a labelled delta between the
 * two centres rather than described in a caption.
 *
 * Drafting derivation:
 *   • Six square modules of side a = 15.5 (the "module")
 *   • Horizontal column step  dx = 28.469  ≈ 1.84a
 *   • Vertical row step       dy = 18.061  ≈ 1.17a
 *   • Bounding box            W = 4.67a   H = 5.66a   H:W = 1.21
 *
 * Colour is currentColor throughout, at foreground alphas, so the whole drawing
 * inverts with the theme instead of needing a second set of values.
 */

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
export function MarkConstructionDiagram() {
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
        className="pointer-events-none absolute left-5 top-5 z-10 hidden font-mono sm:block text-[9.5px] uppercase tracking-[0.26em] text-foreground/65"
        aria-hidden="true"
      >
        SYMBOL · 01
      </div>

      {/* Top-right chain context — small bullet dot + chain label. The dot
          uses currentColor so it inherits the same color as the text next
          to it (foreground/55) rather than reading as a separate accent. */}
      <div
        className="pointer-events-none absolute right-5 top-5 z-10 hidden items-center gap-1.5 font-mono sm:flex text-[9.5px] uppercase tracking-[0.26em] text-foreground/55"
        aria-hidden="true"
      >
        <span
          className="inline-block h-1 w-1 rounded-full bg-current"
        />
        6 MODULES
      </div>

      {/* Bottom-left — live staking participation from subgraph */}
      <div
        className="pointer-events-none absolute bottom-5 left-5 z-10 hidden font-mono sm:block text-[9.5px] uppercase tracking-[0.26em] text-foreground/50 tabular-nums"
        aria-hidden="true"
      >
        A · 15.5U
      </div>

      {/* Bottom-right metadata */}
      <div
        className="pointer-events-none absolute bottom-5 right-5 z-10 hidden font-mono sm:block text-[9.5px] uppercase tracking-[0.26em] text-foreground/60"
        aria-hidden="true"
      >
        H:W · 1.21
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
                LIVEPEER · SYMBOL
              </text>
            </g>
          );
        })()}
      </svg>
    </div>
  );
}
