import Image from "next/image";
import { ChevronDownIcon, UploadIcon } from "lucide-react";

import { sanityStaticAssets } from "@/components/static-assets";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

/**
 * The "Generate video" playbook, shown as the Agent section's product surface.
 *
 * Built from the registry primitives the real UI uses and styled only with
 * semantic tokens, so it re-renders correctly in light and dark rather than
 * being baked to one theme like the screenshot it replaces. Its border is the
 * same hairline token as the page's section rules, so the card reads as part of
 * the page's structure instead of floating on top of it.
 *
 * Presentation only: the subtree is `inert` and `aria-hidden`, so nothing here
 * is focusable, announced, or submittable.
 */

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-ui-caption text-muted-foreground">{label}</span>
      {/* Mono is reserved for short technical annotations — these are the only
          measured values on the page, and setting them as data rather than
          prose is what makes the card read as instrumentation. */}
      <span className="font-mono text-sm text-foreground">{value}</span>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function FakeSelect({ value }: { value: string }) {
  return (
    <div className="flex h-9 items-center justify-between rounded-sm bg-input/50 px-3 text-sm text-foreground">
      <span>{value}</span>
      <ChevronDownIcon className="size-4 text-muted-foreground" />
    </div>
  );
}

function Toggle({ label, checked }: { label: string; checked?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <Checkbox checked={checked} />
      <span className="text-sm text-foreground">{label}</span>
    </div>
  );
}

export function PlaybookPreview({ className }: { className?: string }) {
  return (
    // Sized by its contents so the whole playbook is visible — nothing is
    // cropped. Panel treatment (hairline border, generous radius, lifted
    // surface, no shadow) keeps it flat and part of the page's structure.
    <div
      aria-hidden="true"
      inert
      className={cn(
        // muted rather than card: a darker surface that sits closer to the
        // section behind it, so the panel reads as recessed instead of lifted.
        "pointer-events-none relative w-full overflow-hidden rounded-2xl border border-border bg-muted select-none",
        className
      )}
    >
      {/* Window chrome. The controls are deliberately unpainted rather than
          the usual red/amber/green: it reads as a window — so the surface is
          understood as a depiction of the app rather than a form to fill in —
          without borrowing another product's colour language. */}
      <div className="flex items-center gap-2 border-b border-border px-5 py-3">
        <span className="size-2.5 rounded-full bg-muted-foreground/25" />
        <span className="size-2.5 rounded-full bg-muted-foreground/25" />
        <span className="size-2.5 rounded-full bg-muted-foreground/25" />
      </div>

      <div className="p-5 sm:p-6">
        <h3 className="text-2xl font-normal tracking-tight text-foreground">
          Generate video
        </h3>

        {/* Media preview beside the output list, as in the source UI — this
            pairing is what gives the card its landscape proportion. */}
        {/* Recessed against the darker panel — a lighter fill would no longer
            separate from it. */}
        <div className="mt-4 grid gap-4 rounded-sm bg-background/40 p-3 sm:grid-cols-[1.35fr_1fr]">
          <div className="relative h-32 overflow-hidden rounded-xs bg-background/60 sm:h-32">
            <Image
              src={sanityStaticAssets.playbooks.generateVideo}
              alt=""
              fill
              sizes="480px"
              className="object-cover"
            />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Output</p>
            <ul className="mt-3 flex flex-col gap-2 text-sm text-foreground">
              <li>Cinematic campaign short</li>
              <li>Final video in the selected aspect ratio</li>
              <li>Soundtrack and captions when selected</li>
            </ul>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-4">
          <Stat label="Time" value="2–8 minutes" />
          <Stat label="Budget" value="$0.25–$4.00" />
          <Stat label="Reliability" value="4.3 / 5" />
        </div>

        <Separator className="my-4" />

        <h4 className="text-sm font-medium text-foreground">
          Customize this playbook
        </h4>

        {/* Two columns, as in the source UI — it keeps the form landscape and
            lets every field show without the card running tall. */}
        <div className="mt-4 grid gap-x-6 gap-y-4 sm:grid-cols-2">
          <div className="flex flex-col gap-4">
            <Field label="Creative prompt">
              <Textarea
                readOnly
                tabIndex={-1}
                defaultValue="A cinematic brand film following a single product through a city at dawn."
              />
            </Field>
            <Field label="Audience">
              <Input readOnly tabIndex={-1} defaultValue="Creative directors" />
            </Field>
            <Field label="Visual direction">
              <Input
                readOnly
                tabIndex={-1}
                defaultValue="Warm, filmic, hand-held"
              />
            </Field>
          </div>

          <div className="flex flex-col gap-4">
            <Field label="Reference assets">
              <div className="flex flex-col items-center gap-1 rounded-sm border border-dashed border-border px-3 py-4">
                <UploadIcon className="size-4 text-muted-foreground" />
                <span className="text-sm text-foreground">
                  Drop files here or browse
                </span>
                <span className="text-ui-caption text-muted-foreground">
                  Images, video, audio, PDF, TXT, or Markdown
                </span>
              </div>
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Aspect ratio">
                <FakeSelect value="16:9" />
              </Field>
              <Field label="Target duration">
                <FakeSelect value="15 seconds" />
              </Field>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-4 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Toggle label="Preserve brand consistency" checked />
            <Toggle label="Generate soundtrack" checked />
            <Toggle label="Add captions" />
          </div>
          <Button className="h-10 shrink-0 rounded-sm px-5">Copy prompt</Button>
        </div>
      </div>
    </div>
  );
}
