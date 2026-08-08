import {
  Card, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card"

export type ComputeMetric = { label: string; value: string; period?: string }

/**
 * `align` exists because the label row is a flex container: it ignores an
 * inherited text-align, so on a centred surface the value would centre while
 * the label above it stayed packed left. The value is a block and follows
 * text-align on its own, so only this row needs steering.
 */
export function ComputeMetrics({
  align = "start",
  stats,
}: {
  align?: "start" | "center"
  stats: ComputeMetric[]
}) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:w-fit sm:grid-cols-[repeat(2,14rem)]">
      {stats.map((stat) => (
        <Card key={stat.label} variant="metric">
          <CardHeader>
            <CardDescription
              className={
                align === "center"
                  ? "flex w-full items-baseline justify-center gap-1.5"
                  : "flex w-full items-baseline gap-1.5"
              }
            >
              <span>{stat.label}</span>
              {stat.period && (
                <span className="shrink-0 font-sans text-muted-foreground tabular-nums">
                  {stat.period}
                </span>
              )}
            </CardDescription>
            {/* w-full because CardHeader sets items-start: without it the
                title shrinks to its content and hugs the left edge, so
                text-align has no room to do anything. */}
            <CardTitle
              className={
                align === "center"
                  ? "w-full text-center font-sans text-3xl leading-none font-medium tracking-tight tabular-nums"
                  : "font-sans text-3xl leading-none font-medium tracking-tight tabular-nums"
              }
            >
              {stat.value}
            </CardTitle>
          </CardHeader>
        </Card>
      ))}
    </div>
  )
}
