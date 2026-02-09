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
        <p className="mb-3 font-mono text-sm font-medium tracking-wider text-green uppercase">
          {label}
        </p>
      )}
      <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      {description && (
        <p className="mt-4 max-w-2xl text-lg text-white/60 mx-auto">
          {description}
        </p>
      )}
    </div>
  );
}
