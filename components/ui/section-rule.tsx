import { Separator } from "@/components/ui/separator";

/**
 * Hairline marking a boundary between full-bleed sections.
 *
 * Inset to the same content gutter as the header's bottom rule (and using the
 * same `border` token) so every rule on the page lands on the same two vertical
 * lines. Sections share one background, so this is what carries the structure.
 */
export function SectionRule() {
  return (
    <div className="mx-auto w-full max-w-page px-4 sm:px-6 lg:px-10">
      <Separator />
    </div>
  );
}
