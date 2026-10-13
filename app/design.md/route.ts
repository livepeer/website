import { getDesignGuidelinesSource } from "@/lib/design-guidelines";

/**
 * The design guidelines as the raw file, for agents and for anyone who
 * wants the source, at the address the registry used for the original.
 * Plain text so a browser shows it rather than downloading it.
 */
export function GET() {
  return new Response(getDesignGuidelinesSource(), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
