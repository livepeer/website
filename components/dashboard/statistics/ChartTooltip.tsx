"use client";

interface TooltipPayloadItem {
  name?: string;
  value: number;
  color?: string;
}

/** Stacked/multi-series tooltip with optional total row. */
export function StackedChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const sorted = [...payload].sort((a, b) => (b.value || 0) - (a.value || 0));
  const total = sorted.reduce((sum, p) => sum + (p.value || 0), 0);
  return (
    <div className="rounded-lg border border-white/[0.08] bg-dark-card px-3 py-2 shadow-xl">
      <p className="mb-1 text-[10px] text-white/40">{label}</p>
      {sorted.map((p) => (
        <div key={p.name} className="flex items-center gap-2 text-xs">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: p.color }}
          />
          <span className="text-white/60">{p.name}</span>
          <span className="ml-auto font-mono text-white/80">
            {p.value.toLocaleString()}
          </span>
        </div>
      ))}
      {payload.length > 1 && (
        <div className="mt-1 border-t border-white/[0.06] pt-1 text-right font-mono text-xs text-white">
          {total.toLocaleString()}
        </div>
      )}
    </div>
  );
}

/** Simple single-value tooltip. */
export function SimpleChartTooltip({
  active,
  payload,
  label,
  formatValue,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
  formatValue?: (v: number) => string;
}) {
  if (!active || !payload?.length) return null;
  const formatted = formatValue
    ? formatValue(payload[0].value)
    : `$${payload[0].value.toLocaleString()}`;
  return (
    <div className="rounded-lg border border-white/[0.08] bg-dark-card px-3 py-2 shadow-xl">
      <p className="text-[10px] text-white/40">{label}</p>
      <p className="font-mono text-sm text-white">{formatted}</p>
    </div>
  );
}
