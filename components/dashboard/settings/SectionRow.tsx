/**
 * Two-column settings section row.
 * Title + description on the left, fields/content on the right.
 * Collapses to single column on mobile.
 *
 * Used inside a `divide-y divide-white/[0.06]` parent to create the
 * Stripe/Linear settings rhythm.
 */
export function SectionRow({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid grid-cols-1 gap-y-4 py-6 md:grid-cols-3 md:gap-x-8 md:py-8">
      <div className="md:col-span-1">
        <h2 className="text-base font-medium text-white">{title}</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-white/60">
          {description}
        </p>
      </div>
      <div className="md:col-span-2">{children}</div>
    </section>
  );
}

export function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block text-xs font-medium text-white/50"
    >
      {children}
    </label>
  );
}
