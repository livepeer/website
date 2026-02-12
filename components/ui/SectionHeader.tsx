export default function SectionHeader({
  label,
  title,
  description,
  align = "center",
}: {
  label?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={align === "center" ? "text-center" : ""}>
      {label && (
        <p className="mb-3 font-mono text-sm font-medium tracking-wider text-white/40 uppercase">
          {label}
        </p>
      )}
      <h2 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
        {title}
      </h2>
      {description && (
        <p className={`mt-4 max-w-xl text-lg text-white/60 ${align === "center" ? "mx-auto" : ""}`}>
          {description}
        </p>
      )}
    </div>
  );
}
