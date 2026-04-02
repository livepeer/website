interface PageHeroProps {
  children: React.ReactNode;
}

export default function PageHero({ children }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden">
      {/* Grid background — 9-col CSS Grid to avoid sub-pixel rounding */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[600px]"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(9, 1fr)",
          maskImage: "linear-gradient(to bottom, black 25%, transparent 85%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, black 25%, transparent 85%)",
        }}
      >
        {Array.from({ length: 9 * 5 }).map((_, i) => (
          <div
            key={i}
            className="border-r border-b border-white/[0.04]"
            style={{ aspectRatio: "1" }}
          />
        ))}
      </div>
      {/* Top edge highlight — anchors glow to a visible source */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(to right, transparent, rgba(24,121,78,0.15) 30%, rgba(24,121,78,0.20) 50%, rgba(24,121,78,0.15) 70%, transparent)",
        }}
      />
      {/* Primary green glow */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[500px]"
        style={{
          background:
            "radial-gradient(ellipse 100% 40% at 50% -5%, rgba(24,121,78,0.09) 0%, transparent 70%)",
        }}
      />
      {/* Secondary green glow — brighter, offset for depth */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[500px]"
        style={{
          background:
            "radial-gradient(ellipse 70% 35% at 65% 0%, rgba(52,199,89,0.045) 0%, transparent 70%)",
        }}
      />

      <div className="relative pt-24 pb-16 lg:pt-32 lg:pb-24">{children}</div>
    </section>
  );
}
