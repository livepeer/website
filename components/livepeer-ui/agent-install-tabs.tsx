"use client";

import Image from "next/image";
import { PlugIcon } from "lucide-react";
import { useId, useRef, useState } from "react";

import { CopyButton } from "@/components/copy-button";
import { cn } from "@/lib/utils";

export type AgentInstallTool = {
  name: string;
  /** The tool's mark, from the same set as the "Compatible with" panel. */
  logo?: string;
  /** Marks drawn in one tone, which follow the theme as they do there. */
  monochrome?: boolean;
  /** Marks drawn small within their own canvas, scaled up to match. */
  opticalScale?: boolean;
  /** What to paste: the server address, or the command that adds it. */
  snippet: string;
  /** Whether the snippet is a terminal command, shown after a prompt. */
  command?: boolean;
  /** The steps around the snippet, in order; `backticks` mark code. */
  steps: string[];
};

/**
 * How to add the server, one tab per tool. "Add this server in your agent's
 * MCP / connector settings" was the only instruction, and a creator in Claude
 * does not know where those settings are or what MCP is. Each tab gives the
 * thing to paste and the step or two around it, as the Agent's own
 * get-started page gives them.
 *
 * One card rather than a segmented control over a loose code box: the tabs
 * are its header and carry each tool's mark, the same marks as the
 * "Compatible with" panel further down, so a reader finds their tool by its
 * face before its name. A WAI-ARIA tablist, arrow keys included.
 */
export function AgentInstallTabs({ tools }: { tools: AgentInstallTool[] }) {
  const [active, setActive] = useState(0);
  const id = useId();
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  function onKeyDown(event: React.KeyboardEvent) {
    const step =
      event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    const next =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? tools.length - 1
          : step
            ? (active + step + tools.length) % tools.length
            : null;
    if (next === null) return;
    event.preventDefault();
    setActive(next);
    tabs.current[next]?.focus();
  }

  return (
    <div className="w-full max-w-xl overflow-hidden rounded-lg border border-border bg-card text-left text-card-foreground">
      <div
        role="tablist"
        aria-label="Add it to"
        onKeyDown={onKeyDown}
        className="flex overflow-x-auto border-b border-border [scrollbar-width:none] sm:px-2"
      >
        {tools.map((item, index) => {
          const selected = index === active;
          return (
            <button
              key={item.name}
              ref={(node) => {
                tabs.current[index] = node;
              }}
              type="button"
              role="tab"
              id={`${id}-tab-${index}`}
              aria-selected={selected}
              aria-controls={`${id}-panel-${index}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(index)}
              className={cn(
                "relative flex flex-1 shrink-0 items-center justify-center gap-1.5 px-1.5 py-3 text-[0.8125rem] whitespace-nowrap transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset sm:flex-none sm:gap-2 sm:px-3 sm:text-sm",
                selected
                  ? "text-foreground after:absolute after:inset-x-1.5 after:-bottom-px sm:after:inset-x-3 after:h-px after:bg-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {item.logo ? (
                <Image
                  src={item.logo}
                  alt=""
                  width={16}
                  height={16}
                  className={cn(
                    "size-4 object-contain transition-opacity",
                    !selected && "opacity-60",
                    item.monochrome && "brightness-0 dark:invert",
                    item.opticalScale && "scale-[1.75]"
                  )}
                />
              ) : (
                <PlugIcon className="size-4" aria-hidden="true" />
              )}
              {item.name}
            </button>
          );
        })}
      </div>
      {/* Every panel is drawn in one grid cell and only the selected one is
          shown, so the card is as tall as its tallest panel and the page
          below does not jump as the tabs change. */}
      <div className="grid">
        {tools.map((item, index) => {
          const selected = index === active;
          return (
            <div
              key={item.name}
              role="tabpanel"
              id={`${id}-panel-${index}`}
              aria-labelledby={`${id}-tab-${index}`}
              inert={!selected}
              className={cn(
                "[grid-area:1/1] p-4 sm:p-5",
                !selected && "invisible"
              )}
            >
              <div className="flex items-center gap-3 rounded-md bg-muted py-3 pr-2 pl-4">
                <code className="min-w-0 flex-1 font-mono text-xs leading-relaxed break-all sm:text-[0.8125rem]">
                  {item.command && (
                    <span className="text-muted-foreground select-none">
                      ${" "}
                    </span>
                  )}
                  {item.snippet}
                </code>
                <CopyButton value={item.snippet} className="size-8 shrink-0" />
              </div>
              <ol className="mt-4 grid gap-2.5">
                {item.steps.map((step, number) => (
                  <li
                    key={step}
                    className="flex gap-3 text-sm leading-relaxed text-muted-foreground"
                  >
                    <span className="mt-px font-mono text-xs leading-5 text-foreground">
                      {number + 1}
                    </span>
                    <span>{withCode(step)}</span>
                  </li>
                ))}
              </ol>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** A step's text, with anything in backticks set as code. */
function withCode(text: string) {
  return text.split("`").map((part, index) =>
    index % 2 ? (
      <code key={index} className="font-mono text-[0.8125rem] text-foreground">
        {part}
      </code>
    ) : (
      part
    )
  );
}
