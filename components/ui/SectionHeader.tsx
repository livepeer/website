export default function SectionHeader({
  label,
  title,
  description,
  align = "center",
  size = "default",
  action,
}: {
  label?: string;
  title: string;
  description?: string;
  align?: "left" | "center" | "split";
  size?: "default" | "small";
  action?: React.ReactNode;
}) {
  const headingClass =
    size === "small"
      ? "text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl text-balance"
      : "text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl text-balance";

  if (align === "split") {
    const splitHeadingClass =
      size === "small"
        ? "text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl"
        : "text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl";

    return (
      <div>
        {label && (
          <p className="mb-4 font-mono text-xs font-medium tracking-wider text-white/30 uppercase">
            {label}
          </p>
        )}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between lg:gap-12">
          <h2 className={`${splitHeadingClass} lg:max-w-[30rem] lg:shrink-0`}>
            {title}
          </h2>
          {description && (
            <p className="max-w-md text-xl leading-relaxed text-white/50 text-pretty lg:max-w-[30rem]">
              {description}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={align === "center" ? "text-center" : ""}>
      {label && (
        <p className="mb-4 font-mono text-xs font-medium tracking-wider text-white/30 uppercase">
          {label}
        </p>
      )}
      {action ? (
        <div className="flex items-center justify-between gap-4">
          <h2 className={headingClass}>{title}</h2>
          {action}
        </div>
      ) : (
        <h2 className={headingClass}>{title}</h2>
      )}
      {description && (
        <p
          className={`mt-5 max-w-2xl text-lg leading-relaxed text-white/50 text-pretty ${align === "center" ? "mx-auto" : ""}`}
        >
          {description}
        </p>
      )}
    </div>
  );
}
