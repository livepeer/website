import Link from "next/link";

import { cn } from "@/lib/utils";

/**
 * The rules for whoever owns something on the roadmap, as one page.
 *
 * Three obligations, one section each, in the order they fall due: track
 * the work where anyone can check it, post an update every month, close
 * with a retrospective. Each section ends on what the roadmap reads from
 * it, so the rule and the mechanism are one thing rather than a policy
 * page and a tool page a reader has to reconcile.
 *
 * The rules are Mehrdad Sadeghi's, from the three "roadmap item owner"
 * articles on the old help site; this page keeps their substance and their
 * templates and drops what was specific to that site. Left-aligned in the
 * ladder's column rather than centred like Brand: it is read, not browsed.
 */

export type GuideField = { name: string; note?: string };

export type GuideSection = {
  /** The fragment other pages link to: "updates", "retrospective". */
  id: string;
  title: string;
  body: React.ReactNode[];
  /** A template, when the section has one: the fields a post must carry. */
  template?: { title: string; fields: GuideField[] };
  /** What the roadmap reads from it. */
  reads: React.ReactNode;
};

const prose =
  "[&_a]:text-foreground [&_a]:underline [&_a]:decoration-border [&_a]:underline-offset-4 [&_a]:transition-colors [&_a:hover]:decoration-foreground";

function Template({ title, fields }: NonNullable<GuideSection["template"]>) {
  return (
    <div className="mt-8 rounded-xl border border-border p-5 sm:p-6">
      <h3 className="text-[0.6875rem] leading-4 font-medium tracking-[0.09em] text-muted-foreground uppercase">
        {title}
      </h3>
      <ol className="mt-4 divide-y divide-border">
        {fields.map((f, i) => (
          <li
            key={f.name}
            className="grid grid-cols-[1.5rem_minmax(0,1fr)] gap-x-3 py-3 text-sm first:pt-0 last:pb-0"
          >
            <span className="font-mono text-xs leading-5 text-muted-foreground tabular-nums">
              {i + 1}
            </span>
            <span>
              <span className="font-medium">{f.name}</span>
              {f.note && (
                <span className="text-muted-foreground"> — {f.note}</span>
              )}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function ReportingGuide({
  eyebrow,
  heading,
  intro,
  sections,
  closing,
}: {
  eyebrow: { label: string; href: string };
  heading: string;
  intro: React.ReactNode;
  sections: GuideSection[];
  closing: React.ReactNode;
}) {
  return (
    <div className="pt-12 pb-24 sm:pt-16">
      <div className="mx-auto w-full max-w-page px-4 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-3xl">
          <header>
            <p className="font-mono text-xs text-muted-foreground">
              <Link
                href={eyebrow.href}
                className="transition-colors hover:text-foreground"
              >
                {eyebrow.label}
              </Link>
            </p>
            <h1 className="mt-5 text-display-sm text-balance sm:text-display-md">
              {heading}
            </h1>
            <p
              className={cn(
                "mt-6 max-w-[56ch] text-reading-body text-pretty text-muted-foreground",
                prose
              )}
            >
              {intro}
            </p>
          </header>

          {sections.map((s, i) => (
            <section
              key={s.id}
              id={s.id}
              className="mt-12 scroll-mt-24 border-t border-border pt-10 sm:mt-16 sm:pt-12"
            >
              <p className="font-mono text-xs text-muted-foreground tabular-nums">
                {i + 1} / {sections.length}
              </p>
              <h2 className="mt-3 text-page-title text-balance">{s.title}</h2>
              <div
                className={cn(
                  "mt-5 max-w-[60ch] space-y-4 text-reading-body text-pretty text-muted-foreground",
                  prose
                )}
              >
                {s.body.map((p, j) => (
                  <p key={j}>{p}</p>
                ))}
              </div>
              {s.template && <Template {...s.template} />}
              {/* What the roadmap reads from it: the mechanism under the
                  rule, set apart so a reader who knows the rule can find
                  the row to fill in. */}
              <div
                className={cn(
                  "mt-8 max-w-[60ch] border-l-2 border-border pl-5 text-sm leading-relaxed text-muted-foreground",
                  prose
                )}
              >
                <p className="text-[0.6875rem] leading-4 font-medium tracking-[0.09em] uppercase">
                  What the roadmap reads
                </p>
                <p className="mt-2">{s.reads}</p>
              </div>
            </section>
          ))}

          <p
            className={cn(
              "mt-12 max-w-[60ch] border-t border-border pt-8 text-sm leading-relaxed text-muted-foreground sm:mt-16",
              prose
            )}
          >
            {closing}
          </p>
        </div>
      </div>
    </div>
  );
}
