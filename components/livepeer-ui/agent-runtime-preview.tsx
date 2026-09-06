"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
} from "framer-motion";
import { ArrowUpIcon, PaperclipIcon, PlayIcon } from "lucide-react";

import { sanityStaticAssets } from "@/components/static-assets";
import {
  Conversation,
  ConversationContent,
} from "@/components/ui/conversation";
import { Message, MessageContent } from "@/components/ui/message";
import { ShimmeringText } from "@/components/ui/shimmering-text";
import { cn } from "@/lib/utils";

/**
 * The Agent section's product surface: an agent runtime mid-task, calling
 * Livepeer Agent over MCP, played once each time it scrolls into view.
 *
 * It replaced a mocked-up "Generate video" form. A form shows a product's
 * controls; this shows the product being used, which is the thing a visitor
 * cannot picture from a feature list — a prompt goes in, a tool call goes out
 * to the network with a price on it, and a clip comes back. Built on
 * ElevenLabs UI's Conversation, Message and Shimmering Text (components/ui,
 * vendored), so the runtime reads as the agent runtimes people already use
 * rather than as a diagram of one.
 *
 * Everything in the tool call is true of the network: `pixverse-i2v` is the
 * default image-to-video capability, the arguments are the ones its
 * invocation takes, and the quote line — $0.34 for five seconds, about 23s,
 * 94% success this week — was read from the network's own describe call the
 * day this was written. A made-up model name here would be the one thing a
 * developer would check.
 *
 * The runtime is unnamed on purpose: a path and an `mcp` label rather than a
 * dressing as Claude Code or Codex, since the row of marks under the copy
 * already says it works in all of them.
 *
 * Scripted, not simulated: one timeline, driven by requestAnimationFrame
 * from the moment the card enters view, with each phase derived from elapsed
 * time so a tab that was hidden resumes at the right place rather than
 * piling up timeouts. It runs to the result and holds there; leaving and
 * re-entering view replays it. Under reduced motion the finished state is
 * shown still. The conversation area has a fixed height, so nothing on the
 * page reflows as messages appear; Conversation's stick-to-bottom keeps the
 * newest in view.
 * Presentation only: `inert` and hidden from assistive tech, as the form was.
 */

const PROMPT =
  "Turn this still into a 5-second clip: slow push-in, dust in the light.";

// The one call, as the network takes it. Quote figures from describe_capability
// on 2026-09-06: $0.06825/s, p50 22.9s, 94% ok over 7 days (n=49).
const CALL = [
  `{`,
  `  "capability": "pixverse-i2v",`,
  `  "prompt": "Slow push-in, dust drifting in the light",`,
  `  "source_url": "https://…/dawn.jpg",`,
  `  "inputs": { "duration": 5 },`,
  `  "timeout": 240`,
  `}`,
];
const QUOTE = "$0.34 · ~23s · 94% ok this week";

/** Seconds into the run at which each phase begins. The run ends on `done`
 *  and holds there: the finished frame — prompt, folded call with its price,
 *  clip — is the one that explains the product, and looping threw it away
 *  every twenty seconds to fade back to an empty window. Scrolling away and
 *  back replays it from the typing. */
const T = {
  typing: 0.4,
  typed: 2.6, // the prompt is fully typed
  sent: 3.1,
  thinking: 3.6,
  call: 5.0,
  quoted: 6.6,
  rendering: 7.4,
  done: 12.4,
} as const;

type Phase =
  | "idle"
  | "typing"
  | "sent"
  | "thinking"
  | "call"
  | "quoted"
  | "rendering"
  | "done";

function phaseAt(t: number): Phase {
  if (t < T.typing) return "idle";
  if (t < T.sent) return "typing";
  if (t < T.thinking) return "sent";
  if (t < T.call) return "thinking";
  if (t < T.quoted) return "call";
  if (t < T.rendering) return "quoted";
  if (t < T.done) return "rendering";
  return "done";
}

const ORDER: Phase[] = [
  "idle",
  "typing",
  "sent",
  "thinking",
  "call",
  "quoted",
  "rendering",
  "done",
];
const reached = (phase: Phase, at: Phase) =>
  ORDER.indexOf(phase) >= ORDER.indexOf(at);

/**
 * Elapsed time on the loop while `active`, as the three numbers the render
 * needs: the phase, how many characters of the prompt are typed, and how far
 * the render has got. State only changes when one of them does, so the tree
 * re-renders a few times a second rather than sixty.
 */
function useTimeline(active: boolean, still: boolean) {
  const [frame, setFrame] = useState({
    phase: "idle" as Phase,
    typed: 0,
    progress: 0,
  });

  useEffect(() => {
    if (still) {
      setFrame({ phase: "done", typed: PROMPT.length, progress: 100 });
      return;
    }
    if (!active) return;
    let raf = 0;
    const start = performance.now();
    let last = { phase: "idle" as Phase, typed: 0, progress: 0 };
    const tick = (now: number) => {
      const t = (now - start) / 1000;
      const phase = phaseAt(t);
      const typed =
        phase === "idle"
          ? 0
          : Math.min(
              PROMPT.length,
              Math.round(
                ((t - T.typing) / (T.typed - T.typing)) * PROMPT.length
              )
            );
      const progress =
        phase === "rendering"
          ? Math.round(((t - T.rendering) / (T.done - T.rendering)) * 100)
          : reached(phase, "done")
            ? 100
            : 0;
      if (
        phase !== last.phase ||
        typed !== last.typed ||
        progress !== last.progress
      ) {
        last = { phase, typed, progress };
        setFrame(last);
      }
      // Done is the end: no frame after it changes, so the loop stops rather
      // than ticking for as long as the card is on screen.
      if (phase !== "done") raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, still]);

  return frame;
}

const rise = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, ease: "easeOut" as const },
};

function Attachment() {
  return (
    <span className="flex w-fit items-center gap-2 rounded-md bg-background/40 py-1 pr-2.5 pl-1 text-xs">
      <span className="relative size-6 overflow-hidden rounded-sm">
        <Image
          src={sanityStaticAssets.playbooks.generateVideo}
          alt=""
          fill
          sizes="24px"
          className="object-cover"
        />
      </span>
      dawn.jpg
    </span>
  );
}

function ToolCall({ phase, progress }: { phase: Phase; progress: number }) {
  const running = phase === "rendering";
  const done = reached(phase, "done");
  return (
    <div className="w-full max-w-[32rem] overflow-hidden rounded-lg border border-border bg-background/50 font-mono text-xs">
      <div className="flex items-center justify-between gap-3 px-3 py-2">
        <span className="flex items-center gap-2 text-foreground">
          <span
            className={cn(
              "size-1.5 rounded-full",
              done ? "bg-foreground" : "bg-muted-foreground",
              running && "animate-pulse"
            )}
          />
          run_capability
        </span>
        {/* The status slot carries the render's progress text, so the
            rendering phase adds nothing below the call. */}
        <span className="text-muted-foreground">
          {done ? (
            "done"
          ) : running ? (
            <>
              {/* The full line wrapped beside the call name on a phone. */}
              <span className="sm:hidden">
                <ShimmeringText
                  text="Rendering…"
                  startOnView={false}
                  duration={1.6}
                />
              </span>
              <span className="hidden sm:inline">
                <ShimmeringText
                  text="Rendering on the network…"
                  startOnView={false}
                  duration={1.6}
                />
              </span>
            </>
          ) : (
            "queued"
          )}
        </span>
      </div>
      {/* The arguments fold away once the call is done, as a runtime collapses
          a finished call, so the finished conversation fits the window
          without scrolling: prompt, call, quote, clip, all in view. */}
      <AnimatePresence initial={false}>
        {!done && (
          <motion.div
            key="args"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="border-t border-border px-3 py-2.5 leading-relaxed text-muted-foreground">
              {CALL.map((line, i) => (
                <motion.div
                  key={line}
                  {...rise}
                  transition={{ ...rise.transition, delay: i * 0.06 }}
                  className="whitespace-pre-wrap"
                >
                  {line}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {reached(phase, "quoted") && (
          <motion.div
            {...rise}
            className="border-t border-border px-3 py-2 text-foreground"
          >
            {QUOTE}
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {running && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-px w-full bg-border"
          >
            <div
              className="h-full bg-foreground transition-[width] duration-200 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Result() {
  return (
    <div className="flex w-full max-w-[32rem] items-start gap-3">
      <div className="relative aspect-video w-36 shrink-0 overflow-hidden rounded-md bg-background/60 sm:w-44">
        <Image
          src={sanityStaticAssets.playbooks.generateVideo}
          alt=""
          fill
          sizes="176px"
          className="object-cover"
        />
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex size-8 items-center justify-center rounded-full bg-background/70 text-foreground backdrop-blur-sm">
            <PlayIcon
              className="ml-0.5 size-3 fill-current"
              aria-hidden="true"
            />
          </span>
        </span>
        <span className="absolute right-1.5 bottom-1.5 rounded-sm bg-background/70 px-1 py-0.5 font-mono text-[0.625rem] text-foreground backdrop-blur-sm">
          0:05
        </span>
      </div>
      <div className="min-w-0 pt-0.5">
        <p className="text-sm text-foreground">
          Done. 5 seconds, 16:9, no audio. $0.34 charged.
        </p>
        <p className="mt-1 font-mono text-xs text-muted-foreground">
          saved ./out/dawn-teaser.mp4
        </p>
      </div>
    </div>
  );
}

export function AgentRuntimePreview({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.3 });
  const still = useReducedMotion() ?? false;
  const { phase, typed, progress } = useTimeline(inView, still);
  const composing = phase === "typing";
  const prompt = PROMPT.slice(0, typed);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      inert
      className={cn(
        // muted rather than card: a darker surface that sits closer to the
        // section behind it, so the panel reads as recessed instead of lifted.
        "pointer-events-none relative flex w-full flex-col overflow-hidden rounded-2xl border border-border bg-muted select-none",
        className
      )}
    >
      {/* Window chrome. The controls are unpainted rather than red/amber/green:
          it reads as a window without borrowing another product's colour
          language. The title is a path and the transport, not a runtime's
          name. */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center border-b border-border px-5 py-3">
        <div className="flex gap-2">
          <span className="size-2.5 rounded-full bg-muted-foreground/25" />
          <span className="size-2.5 rounded-full bg-muted-foreground/25" />
          <span className="size-2.5 rounded-full bg-muted-foreground/25" />
        </div>
        {/* The path hides on a phone, where it ran into the window dots. */}
        <span className="font-mono text-xs whitespace-nowrap text-muted-foreground">
          <span className="hidden sm:inline">
            ~/campaign
            <span className="mx-2 text-border">·</span>
          </span>
          livepeer-agent · mcp
        </span>
        <span />
      </div>

      {/* The height lives on this wrapper, not on Conversation: its root is a
          stick-to-bottom scroller that fills a flex parent, and given a height
          class directly it rendered at the height of its content — 132px while
          idle, growing as messages arrived, which is the reflow a fixed height
          exists to prevent. Sized so the finished conversation fits without
          scrolling at either width — the tool call folds its arguments away
          once done, and the clip sits beside its caption, to make that true. */}
      <div className="flex h-[24rem] flex-col sm:h-[23rem]">
        {/* No scrollbar: the surface is presentational and inert, and a track
          down the edge of a window nobody can scroll reads as a glitch. The
          stick-to-bottom scroller still scrolls the newest message into
          view. */}
        <Conversation className="min-h-0 flex-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <ConversationContent className="px-4 py-2 sm:px-5">
            <AnimatePresence>
              {reached(phase, "sent") && (
                <motion.div key="user" {...rise} exit={{ opacity: 0 }}>
                  {/* flat for both: the contained user bubble takes the
                    library's primary fill, which in dark is near-white and
                    dominated the card. Flat gives the user a quiet secondary
                    surface and the assistant none. */}
                  <Message from="user" className="py-2.5">
                    <MessageContent variant="flat" className="gap-2.5">
                      <Attachment />
                      <span>{PROMPT}</span>
                    </MessageContent>
                  </Message>
                </motion.div>
              )}
              {reached(phase, "thinking") && (
                <motion.div key="assistant" {...rise} exit={{ opacity: 0 }}>
                  <Message from="assistant" className="py-2.5">
                    <MessageContent variant="flat" className="gap-3">
                      {phase === "thinking" && (
                        <ShimmeringText
                          text="Checking Livepeer capabilities…"
                          className="text-sm"
                          startOnView={false}
                          duration={1.6}
                        />
                      )}
                      {reached(phase, "call") && (
                        <ToolCall phase={phase} progress={progress} />
                      )}
                      {reached(phase, "done") && (
                        <motion.div {...rise}>
                          <Result />
                        </motion.div>
                      )}
                    </MessageContent>
                  </Message>
                </motion.div>
              )}
            </AnimatePresence>
          </ConversationContent>
        </Conversation>
      </div>

      {/* The composer. The prompt types here and is sent, rather than
          appearing in a bubble already written — that is the half-second in
          which the surface reads as a runtime someone is using. */}
      <div className="border-t border-border px-4 py-3 sm:px-5">
        <div className="flex items-center gap-3 rounded-lg bg-background/50 px-3 py-2.5 text-sm">
          <PaperclipIcon
            className="size-4 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          {/* The still sits in the composer while the prompt is typed and
              travels into the message on send, as an attachment does in a
              runtime; appearing only in the sent message, it came from
              nowhere. */}
          {composing && <Attachment />}
          <span
            className={cn(
              "min-h-5 flex-1 truncate",
              !composing && "text-muted-foreground"
            )}
          >
            {composing ? (
              <>
                {prompt}
                <span className="ml-px inline-block h-4 w-px translate-y-0.5 bg-foreground align-baseline motion-safe:animate-pulse" />
              </>
            ) : (
              "Ask for a render…"
            )}
          </span>
          <span
            className={cn(
              "flex size-7 shrink-0 items-center justify-center rounded-md transition-colors",
              composing && typed === PROMPT.length
                ? "bg-primary text-primary-foreground"
                : "bg-muted-foreground/15 text-muted-foreground"
            )}
          >
            <ArrowUpIcon className="size-3.5" aria-hidden="true" />
          </span>
        </div>
      </div>
    </div>
  );
}
