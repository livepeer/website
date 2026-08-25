"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowUpRightIcon,
  ChevronDownIcon,
  SearchIcon,
  XIcon,
} from "lucide-react";

import Image from "next/image";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { Commitment, Person } from "@/lib/roadmap";

type View = "roadmap" | "shipped";

/**
 * The page's only small-type role.
 *
 * Inter throughout — no second family. Everything a monospace face was doing
 * here (workstream tags, field names, dates) is carried by one setting: 11px,
 * uppercase, letterspaced, medium. Tracking is what makes small uppercase Inter
 * legible; without it the caps close up and read as a smudge.
 */
function Label({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "text-[0.6875rem] leading-4 font-medium tracking-[0.09em] text-muted-foreground uppercase",
        className
      )}
    >
      {children}
    </span>
  );
}

/**
 * State, as a dot and a word.
 *
 * A dot rather than a badge: three boxed chips per card would rebuild the
 * bordered look this design is getting away from, and the state is already one
 * word long. Green lands on "in progress" alone — colour that appears on every
 * state signals nothing, and this way the live work is findable at a glance.
 *
 * Green is brand expression, never an affordance; globals.css scopes
 * --color-brand to exactly this use. Light mode darkens it with the same mix
 * the home hero's chip uses, because display-p3 green on white is illegible.
 */
function StateMark({ state }: { state: Commitment["state"] }) {
  const building = state === "building";
  return (
    <span className="flex items-center gap-2">
      <span
        aria-hidden="true"
        className={cn(
          "size-1.5 shrink-0 rounded-full",
          building
            ? "bg-[color-mix(in_oklch,var(--color-brand),black_28%)] dark:bg-brand"
            : "bg-muted-foreground/40"
        )}
      />
      <span className={cn(building && "text-foreground")}>
        {building
          ? "In progress"
          : state === "next"
            ? "Committed next"
            : "Shipped"}
      </span>
    </span>
  );
}

/**
 * One date format across the page.
 *
 * The register stores ISO, which read as a deliberate stamp while the page had
 * a monospace face to set it in. Without one it just looks unformatted, and it
 * disagreed with the masthead's own "last verified" date two lines away.
 */
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    timeZone: "UTC",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Initials for a credit, from whatever the register calls the party.
 *
 * Two letters for a multi-word name, one for a handle. Parenthesised suffixes
 * are dropped — "John Mull (Elite Code Solutions)" is a person and a studio in
 * one string, and the mark should read as the person it leads with.
 */
function initials(name: string) {
  const words = name
    .replace(/\(.*?\)/g, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0]!.charAt(0).toUpperCase();
  return (
    words[0]!.charAt(0) + words[words.length - 1]!.charAt(0)
  ).toUpperCase();
}

/**
 * The faces behind the accountable party, set against its name.
 *
 * Owner and Team roster were two fields describing one thing: who is behind
 * this. Split across the footer's two ends they read as separate claims and
 * needed two labels to explain that they weren't. One field says it once —
 * the org that is on the hook, and the people doing the work beside it — and it
 * is the treatment the home page already uses for contributors, so the site
 * says "these people" the same way twice.
 *
 * The names go with the split. They were what made the roster wide enough to
 * need its own end of the row, and a tooltip on each face puts the name back
 * beside the face it belongs to rather than in a list a reader has to match up.
 * What the closed card owes a reader is that real, named people are behind
 * this — a face says that, and hovering one says which.
 *
 * Overlapped, but at 6px rather than the usual 8. An overlap of 8 on a 28px
 * circle covers the outer 8px, and a two-letter monogram runs to within 7.5px
 * of the edge — which is how "DP" rendered as "DF". Six clears the letters and
 * still reads as a stack, so the photo-less fallback survives the idiom.
 *
 * A face links to the person's page on the roadmap board only when the record
 * supplies an id. Nothing is inferred from a name: a guessed id is a link to a
 * stranger, and this page exists to be checkable. The board exposes no profile
 * links on its public item pages, so each id has to be confirmed by hand.
 *
 * The hover is the old home page's contributor strip, carried over from
 * components/home/CommunityCTA.tsx before the cutover deleted it: grey at rest,
 * and on hover it lifts, grows and comes up in colour over its neighbours. Two
 * deliberate departures from that original:
 *
 * - The ring warms to a foreground wash, not to green. The old strip predates
 *   the design system, which reserves green for non-interactive brand
 *   expression; a hover ring is the definition of an affordance.
 * - Every face moves, linked or not. Making the lift exclusive to a link was
 *   the first version and it left twenty of the register's twenty-one faces
 *   inert, which reads as broken rather than as informative. The hover is
 *   honest on an unlinked face anyway: it names the person either way. The
 *   link is a bonus on top of that, not the reason to reach for it.
 *
 * The name is the registry's Tooltip rather than a `title`, which the first
 * version used. A native title waits a second, cannot be styled or themed, and
 * never appears for a keyboard or touch user at all. Base UI opens the same
 * popup on focus as on hover, so tabbing the row reads it out.
 *
 * Grey at rest is doing real work beyond the reveal: six portraits from six
 * different sources arrive with six different colour casts, and desaturated
 * they read as one row instead of six stickers — which is what keeps a strip of
 * faces from outshouting the commitment it belongs to.
 */
/**
 * A stable fill for a monogram, from the registry's categorical five.
 *
 * Keyed on the name so a person keeps their tone across every card they appear
 * on — the point of a categorical colour is that it means the same thing twice.
 * FNV-1a with a murmur3 finalizer: a plain `h * 31 + c` barely moves its low
 * bits between similar strings, so near-identical names collide on one tone.
 */
const FACE_TONES = [0, 25, 50, 75, 100].map((step) => ({
  // The light end of the ramp, not the whole of it. Spreading across all five
  // put people on chart-3 and chart-5 — 0.439 and 0.269 — darker than the card
  // they sit on, so a monogram read as a hole punched in the row. These are
  // steps between chart-1 and chart-2, a band that stays lighter than every
  // surface on the page. One ink for all five: the band is narrow enough that
  // chart-5 clears the darkest of them.
  bg: `color-mix(in oklch, var(--chart-2) ${step}%, var(--chart-1))`,
  ink: "var(--chart-5)",
}));

function faceTone(name: string) {
  let h = 2166136261;
  for (const ch of name) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  h ^= h >>> 15;
  h = Math.imul(h, 2246822507);
  h ^= h >>> 13;
  h >>>= 0;
  return FACE_TONES[h % FACE_TONES.length]!;
}

function Faces({ people }: { people: Person[] }) {
  // The lift and the grow ride on the outer element, not the portrait: it is
  // what clips to a circle, so scaling the image inside it would crop the face
  // rather than enlarge the mark.
  //
  // In colour at rest. These were desaturated so that portraits from six
  // different sources would read as one row rather than six stickers, with
  // colour arriving on hover as the reveal. The cost was that a row of people
  // — the one thing on a card that is unambiguously human — was the only
  // greyed-out element on the page, and it read as disabled rather than as
  // restrained.
  const face = cn(
    // A filled monogram, tone assigned per person.
    //
    // Opaque first: foreground/8% let whatever sat behind it through, and these
    // overlap by 6px, so a lettered face stacked on a photographed one showed
    // the photo through the letters.
    //
    // The fill comes from chart-1..5 — the registry's categorical role, which
    // is exactly what "one of a set of things that must be told apart" means.
    // In this theme those five are greyscale (chroma 0), so what a reader gets
    // is five tones rather than five hues. That is the design system's answer,
    // not a compromise reached for: green is brand expression and never a
    // per-person label, and inventing hues here would be the second token layer
    // CLAUDE.md rules out.
    //
    // Ink is drawn from the same palette, so the pairing cannot drift from it.
    "relative flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--face)] text-[0.625rem] font-medium text-[var(--face-ink)] ring-2 ring-muted outline-none dark:ring-card",
    "transition duration-200 motion-reduce:transition-none"
  );
  // The lift belongs to the ones that go somewhere. Giving it to all of them
  // made an unlinked face rise and glow and then do nothing on click, which is
  // a promise the card cannot keep — the card opens instead, and the click
  // reads as a link that failed. With colour no longer the hover reveal, the
  // lift is the whole affordance, so it carries the ring on its own.
  const linked =
    "hover:z-10 hover:-translate-y-1 hover:scale-110 hover:ring-foreground/20 focus-visible:z-10 focus-visible:ring-ring";
  return (
    <span className="flex -space-x-1.5">
      {people.map((person) => {
        const inner = person.avatar ? (
          <Image
            src={`/roadmap/people/${person.avatar}`}
            alt=""
            width={64}
            height={64}
            className="size-full object-cover"
          />
        ) : (
          initials(person.name)
        );
        // The card is a <details> and this sits in its <summary>, so a click
        // here would follow the link and toggle the card on the way out.
        // stopPropagation keeps the card from opening behind the new tab; the
        // anchor's own navigation is untouched, and the keydown does the same
        // for Enter.
        //
        // No preventDefault, and no window.open standing in for the href. An
        // earlier version had both, on the theory that <summary> swallows link
        // activation — that theory came from test clicks that were landing on
        // the page container rather than on the avatar. Retested against the
        // real element: a plain anchor here navigates, tooltip trigger and all.
        const tone = faceTone(person.name);
        const toneVars = {
          "--face": tone.bg,
          "--face-ink": tone.ink,
        } as React.CSSProperties;
        const trigger = person.profile ? (
          <a
            style={toneVars}
            href={`https://roadmap.livepeer.org/u/${person.profile}`}
            target="_blank"
            rel="noopener noreferrer"
            // The portrait is decorative — its alt is empty, because the name
            // beside it is the content — so without this the anchor has no
            // accessible name at all and a screen reader reads out "link" once
            // per face. The tooltip carries the name for a sighted reader; this
            // is the same fact, for everyone else.
            aria-label={person.name}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            className={cn(face, linked)}
          >
            {inner}
          </a>
        ) : (
          // Not a button, and not focusable: a face with no profile goes
          // nowhere, and putting it in the tab order would make a keyboard
          // reader stop at something that does nothing. The name still reaches
          // them — it is in the sentence the row is built from.
          <span style={toneVars} className={face}>
            {inner}
          </span>
        );
        return (
          <Tooltip key={person.name}>
            {/* render, not a wrapper: Base UI's trigger is a <button> by
                default, and a button around an anchor is invalid and
                double-focusable. This hands it the element we already have. */}
            <TooltipTrigger render={trigger} />
            <TooltipContent>
              {person.name}
            </TooltipContent>
          </Tooltip>
        );
      })}
    </span>
  );
}

function LinkRow({ label, href }: { label: string; href: string }) {
  const external = href.startsWith("http");
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
    >
      {label}
      {/* Inline, not a flex sibling. As inline-flex the icon became its own
          item, so any label that wrapped to two lines left the arrow stranded
          at the far right, vertically centred against the whole block instead
          of sitting after the last word. Panel labels never wrapped, so this
          only surfaced once the lifeline set long titles in a narrow column. */}
      {external && (
        <ArrowUpRightIcon className="ml-1 inline size-3.5 -translate-y-px align-middle text-muted-foreground" />
      )}
    </a>
  );
}

/**
 * One commitment, as a quiet card that opens.
 *
 * A native <details> rather than a drawer or modal: keyboard operable, survives
 * no-JS, needs no focus trap, respects reduced motion for free.
 *
 * A placeholder is drawn as an unfilled card with a dashed edge. That is the
 * one piece of structure on this page doing real work — a roadmap padded with
 * aspirations should look padded, and here it does, without a reader having to
 * parse a badge to find out. The fill is what a real commitment earns.
 *
 * The fill is per-theme, the same split the ecosystem cards make: one value
 * cannot serve both on a pure-black background. Light rests on `muted` — at
 * muted/50 it was 0.015 off white and read as nothing — and hovers to a 6%
 * foreground wash, because muted is the darkest surface role light has and the
 * hover has to go somewhere. Dark rests on `card` and steps to `secondary`.
 */
function CommitmentCard({ commitment: c }: { commitment: Commitment }) {
  return (
    <details
      className={cn(
        "group rounded-lg transition-colors",
        c.placeholder
          ? "border border-dashed border-border hover:bg-muted/50 dark:hover:bg-card"
          : "bg-muted hover:bg-foreground/[0.06] dark:bg-card dark:hover:bg-secondary"
      )}
    >
      <summary className="block cursor-pointer list-none rounded-lg p-6 outline-none focus-visible:ring-2 focus-visible:ring-ring sm:p-7 [&::-webkit-details-marker]:hidden">
        {/* The index line: what kind of work, and where it stands.
            The state used to sit in the footer beside the owner, which put
            three unlike things on one line — a status, a party and a roster —
            and left the top of the card as an eyebrow with an empty right half.
            Workstream and state are the two attributes you sort and filter by,
            so they belong together and they belong first; the footer is then
            free to be about people only. It also rhymes with the quarter band
            above, which is already label-left, count-right.

            The chevron keeps the far right and a gap-5 between: pressed up
            against the state it read as a control with a label on it. */}
        {/* Reordered rather than duplicated. At 375px "PROTOCOL" and
            "Committed next · Placeholder" and the chevron want 349px of a 326px
            row, so the state broke mid-phrase and left a dangling "·" above an
            orphaned "Placeholder". Given its own full-width line below the
            workstream it stays one phrase; order swaps it back in beside the
            eyebrow at sm, where there is room. One element either way — a
            second copy behind a `hidden` would be read out twice. */}
        <div className="flex items-center gap-x-5">
          <Label>{c.workstream}</Label>
          {/* 44px touch target on a 20px glyph, and the only moving part. */}
          <span className="-m-3 ml-auto flex size-11 shrink-0 items-center justify-center p-3 text-muted-foreground transition-colors group-hover:text-foreground">
            <ChevronDownIcon className="size-5 transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none" />
          </span>
        </div>
        {/* Bigger than the 16px it was. The quarter heading above is 24px, so
            at 16 the register's actual content was set smaller than the
            scaffolding holding it — the title is what anyone scans for, and it
            should outrank everything inside the card. */}
        <h3 className="mt-3 text-lg font-medium tracking-[-0.015em]">
          {c.title}
        </h3>
        <p className="mt-2 max-w-[62ch] text-sm leading-relaxed text-muted-foreground">
          {c.outcome}
        </p>
        {/* The card's two corners, carrying its two registers: where the work
            stands on the left, who is behind it on the right.

            The state used to ride the index line at the top and the credit sat
            alone at the bottom left, which left the footer half empty and put a
            status in the same row as a taxonomy label. Down here the pair reads
            as a caption on the record — one glance answers "is this live?" and
            "whose is it?" without either question borrowing the other's row.

            justify-between rather than an auto margin, because both ends wrap:
            at 375px the credit drops to its own line and each end keeps its own
            left edge, which is what an auto margin would not do.

            The faces are optional and genuinely so — a register that credits
            foundations, SPEs and pseudonymous contributors should not imply a
            roster exists when it does not.

            Not the target: the quarter is the heading this card sits under, and
            repeating it is noise. */}
        <div className="mt-7 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-x-2">
            <StateMark state={c.state} />
            {c.placeholder && (
              <>
                <span aria-hidden="true">·</span>
                <span>Placeholder</span>
              </>
            )}
          </span>
          <span className="flex flex-wrap items-center gap-x-3 gap-y-2">
            {/* "by", lowercase, rather than an OWNER eyebrow.
                The uppercase label was the same treatment as the workstream at
                the top of the card, which made one visual language mean two
                things: a value up there, a field name down here. Uppercase now
                marks a value and nothing else.

                A party name sitting beside portraits does not need announcing —
                "by" is enough to make it a credit, and unlike "Built by" it
                carries no tense, which matters when two thirds of this register
                has not happened yet.

                The party takes foreground. It is the fact in this row; at muted
                it was set at the same weight as the word introducing it. */}
            <span className="shrink-0">by</span>
            <span className="text-foreground">{c.owners.join(", ")}</span>
            {c.people && c.people.length > 0 && <Faces people={c.people} />}
          </span>
        </div>
      </summary>

      {/* Only what the card does not already say. State, workstream, the
          accountable party, the roster and the quarter are all in the summary,
          so repeating any of them made opening a card feel like it revealed
          nothing. Sources lead: they are why this page can call itself
          canonical. */}
      {/* 8rem, not the 10 it was: that was widened for a "Built and funded by"
          label that no longer exists, and left 70px of dead column beside every
          remaining one.

          Below sm this collapses to one column, where gap-y-5 spaced a label
          from its own value exactly as far as from the next pair — so the list
          read as disconnected blocks rather than pairs. Tight to its value,
          loose to the next.

          The sm reset repeats the :not() rather than targeting bare dt: the
          selectors would otherwise differ in specificity, the reset would lose,
          and every desktop label would sit 20px below the value it names. */}
      {/* px-6/sm:px-7, matching the summary's own p-6/sm:p-7. At px-5/sm:px-6
          every label in the panel started 4px left of "Owner" directly above
          it — small enough to look like a rendering fault rather than a
          decision. The panel is a continuation of the summary's last row, so it
          keeps its measure. */}
      {/* 6rem and a 1.5rem gutter, down from 8rem and 2rem. Measured, the
          longest label in this list — LAST VERIFIED — is 92.6px, so an 8rem
          track carried 35px that nothing in it ever used and pushed every value
          out to 160px. 6rem clears the longest by 3px. */}
      <dl className="grid gap-x-6 gap-y-1.5 px-6 pb-6 [&>dt:not(:first-of-type)]:mt-5 sm:grid-cols-[6rem_1fr] sm:gap-y-5 sm:px-7 sm:pb-7 sm:[&>dt:not(:first-of-type)]:mt-0">
        {/* Funding leads the panel: with the owner on the card face and the
            date in the band above it, this is the fourth thing the requirements
            doc names in its definition of a commitment — "a dated, owned
            undertaking to deliver a named outcome to the network, with its
            funding source identified" — and the card was quietly dropping it.

            Free text, as the board's own field is. */}
        {c.funding && (
          <>
            <dt>
              <Label>Funding</Label>
            </dt>
            <dd className="max-w-[58ch] text-sm leading-relaxed">
              {c.funding}
            </dd>
          </>
        )}
        {/* Context, not Outcome. This row renders the record's markdown body,
            while the field actually called `outcome` is the sentence under the
            title on the closed card — so the page had two different things
            labelled Outcome, showing different text, one of them not even the
            field of that name. What the bodies hold is background: how the work
            was funded, what has landed so far, what it is downstream of. */}
        {c.detail && (
          <>
            <dt>
              <Label>Context</Label>
            </dt>
            <dd className="max-w-[58ch] text-sm leading-relaxed">{c.detail}</dd>
          </>
        )}
        {/* One row, because it was always one idea. Source of truth and
            Related asked a reader to hold a distinction the register itself
            could not keep: the forum thread that proves a commitment is also
            where the work is happening. Every record carries at least one, so
            this row is never absent — the evidence is the point of the page. */}
        <dt>
          <Label>Related</Label>
        </dt>
        <dd className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
          {c.related.map((link) => (
            <LinkRow key={link.href} {...link} />
          ))}
        </dd>
        {/* When the commitment was made, not when it lands.
            A target that has moved says nothing on its own; a target that has
            moved since a known commitment date is a slip a reader can see. */}
        {c.issued && (
          <>
            <dt>
              <Label>Committed</Label>
            </dt>
            <dd className="text-sm tabular-nums">{formatDate(c.issued)}</dd>
          </>
        )}
        {/* Shipped keeps its date: the summary drops the target for shipped
            work, so this is the one place it appears. */}
        {c.state === "shipped" && (
          <>
            <dt>
              <Label>Shipped</Label>
            </dt>
            <dd className="text-sm tabular-nums">{formatDate(c.shippedAt!)}</dd>
          </>
        )}
        {c.lastVerified && (
          <>
            <dt>
              <Label>Last verified</Label>
            </dt>
            <dd className="text-sm text-muted-foreground tabular-nums">
              {formatDate(c.lastVerified)}
            </dd>
          </>
        )}
      </dl>
    </details>
  );
}

/**
 * A quarter, and the work inside it.
 *
 * The heading pins under the site header while its own quarter scrolls beneath
 * it, then gets pushed out by the next one — Stripe's behaviour, and not
 * scripted: each heading is sticky inside its own <section>, so the section's
 * bottom edge is what evicts it.
 *
 * Opaque, not the glass the rest of the site uses. This pins directly under a
 * header that is already glass, and two translucent layers over the same
 * content read as a rendering fault rather than as depth.
 */
function Group({
  period,
  commitments,
  current,
}: {
  period: string;
  commitments: Commitment[];
  current?: boolean;
}) {
  return (
    // first-of-type, not first: the column opens with a screen-reader-only
    // status paragraph, so `first` never matches a section and every quarter
    // including the top one took the between-quarters margin — which is what
    // pushed the register 56px below the masthead it is supposed to start level
    // with.
    <section
      className={cn(
        "first-of-type:mt-0",
        // A month nothing landed in is a thinner beat than a month that did.
        commitments.length === 0 ? "mt-8" : "mt-16"
      )}
    >
      {/* The band is generous, and the arithmetic is what lets it be.
          Sizing it to exactly match the search field's 40px box was the wrong
          constraint — what reads as aligned is the two CENTRES, not the two
          boxes, and centring leaves the height free. A card used to slide up to
          within 4px of this baseline before it disappeared; now it has 24px of
          air on both sides.

          Centres stay locked because the padding difference is derived, not
          guessed: a 32px line box inside py-6 centres 40px down, and a 40px
          input inside the rail's pt-5 centres 40px down too. Both stick at
          top-16, so they hold the same line at rest and pinned alike. Change
          one padding and the other has to move by the same amount.

          Flush under the 64px site header rather than clear of it: a gap would
          show cards sliding through it unblurred. */}
      {/* top-30, not top-16: the view tabs stick at top-16 and stand 56px
          tall, so a band pinned to the same line would slide under them. The
          offset is that row's height — change one and the other has to move. */}
      <h2
        className={cn(
          "sticky top-30 z-10 -mx-2 flex items-baseline justify-between gap-x-6 gap-y-2 bg-background px-2",
          commitments.length === 0 ? "py-2" : "py-6"
        )}
      >
        {/* whitespace-nowrap on all three. As flex siblings they were free to
            shrink below their own content, and at 375px they all took the
            offer: "THIS QUARTER" broke in half and "Q3 2026" came apart into
            "Q3" over "2026", standing the band 112px tall against the 80px of
            every other quarter. Held whole they measure ~327px in a 343px row
            and fit. */}
        <span className="flex flex-wrap items-baseline gap-x-3 gap-y-2">
          <span
            className={cn(
              "font-normal tracking-[-0.02em] whitespace-nowrap tabular-nums",
              // A month that held nothing is set smaller and quieter. At the
              // same weight as a month that shipped work, an empty band read as
              // a heading for content that had failed to load.
              commitments.length === 0
                ? "text-sm text-muted-foreground/50"
                : "text-2xl"
            )}
          >
            {period}
          </span>
          {/* The one thing a roadmap has to know and this page did not: where
              today falls on it. Without it a reader has to bring the date
              themselves and work out which column is live. Green marks now
              here as it does on a card — brand expression, never an
              affordance. */}
          {current && (
            <span className="flex items-baseline gap-2 whitespace-nowrap">
              <span
                aria-hidden="true"
                className="size-1.5 translate-y-[-0.15em] rounded-full bg-[color-mix(in_oklch,var(--color-brand),black_28%)] dark:bg-brand"
              />
              <Label>This quarter</Label>
            </span>
          )}
        </span>
        {/* The band ran the register's full width with a single label at one
            end of it. The count gives the other end something true to hold, and
            it tracks the filters — so it doubles as the answer to "did that
            narrow anything?" */}
        {commitments.length > 0 && (
          <Label className="shrink-0 whitespace-nowrap">
            {commitments.length}{" "}
            {commitments.length === 1 ? "commitment" : "commitments"}
          </Label>
        )}
      </h2>
      {/* 16px between cards, against 28px of padding inside one.
          At 8 the gap between two separate commitments was less than a third
          of the margin inside a single one, so each card sat three and a half
          times closer to its neighbour than to its own content — and proximity
          is how a reader decides what is one object and what is several. The
          register read as a table with rounded corners rather than as nine
          records. Sixteen is still comfortably under the padding, so a quarter
          still coheres as a group; it just stops being one continuous surface.

          It costs ~64px across the current nine cards, and more as the register
          grows. Worth it: this is separation doing a job, unlike the hero
          spacing above it, which was air doing nothing. */}
      {commitments.length > 0 && (
        <div className="mt-2 space-y-4">
          {commitments.map((c) => (
            <CommitmentCard key={c.slug} commitment={c} />
          ))}
        </div>
      )}
    </section>
  );
}

/**
 * One filter, as a checkbox.
 *
 * Every control in this rail asks the same kind of question — is this on? —
 * and several can be on at once, which is what a checkbox is for. They spent
 * two passes as toggle buttons carrying aria-pressed: a defensible pattern,
 * but one that leaves a reader to work out from styling alone whether picking
 * Protocol replaces Network or joins it. A checkbox answers that before it is
 * clicked.
 *
 * Same at every width. The rows were chips below lg, back when they were
 * buttons and a wrapped row of plain words did not read as controls. A
 * checkbox reads as a control anywhere, so the rail is one list at every size
 * and there is no breakpoint at which it changes its mind about what it is.
 */
function FilterRow({
  label,
  count,
  active,
  onChange,
}: {
  label: string;
  count: number;
  active: boolean;
  onChange: (v: boolean) => void;
}) {
  // A workstream with nothing in the current view is offered as information,
  // not as an affordance: the count says the filter is empty, and the control
  // stops short of letting you dead-end the list to prove it.
  const empty = count === 0 && !active;
  return (
    <label
      className={cn(
        "flex items-center gap-2.5 py-1.5 text-sm transition-colors select-none",
        empty
          ? "pointer-events-none opacity-40"
          : "cursor-pointer hover:text-foreground",
        active ? "font-medium text-foreground" : "text-muted-foreground"
      )}
    >
      <Checkbox
        checked={active}
        disabled={empty}
        onCheckedChange={(checked) => onChange(checked === true)}
      />
      <span className="whitespace-nowrap">{label}</span>
      <span
        className={cn(
          "ml-auto tabular-nums",
          active ? "text-muted-foreground" : "text-muted-foreground/70"
        )}
      >
        {count}
      </span>
    </label>
  );
}

/**
 * The way in, and where it sits depends on the layout.
 *
 * At lg it is the foot of the sticky rail: the invitation travels with the
 * register instead of waiting at the end of it. Below lg there is no rail —
 * the controls stack above the work — and putting a secondary action there
 * meant a full screen of "not on the roadmap?" between the filters and the
 * first commitment, which is the wrong order for someone who came to read the
 * roadmap. On mobile it goes after the register, where a footer belongs.
 *
 * Rendered twice, hidden either way with `display: none`, which takes the
 * unused one out of the accessibility tree as well as off the screen — so a
 * screen reader meets one copy, not two.
 *
 * Deliberately not a button. Per the requirements doc the pipeline stays where
 * it is and this page "links to it rather than absorbing it" — a filled CTA
 * would claim the submission happens here.
 */
function SuggestBlock({
  href,
  className,
}: {
  href: string;
  className?: string;
}) {
  return (
    <div className={cn("border-t border-border pt-5", className)}>
      <Label>Not on the roadmap?</Label>
      <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
        Ideas are proposed and discussed on the roadmap board. They appear here
        once they are owned and dated.
      </p>
      <p className="mt-3 text-sm">
        <LinkRow label="Suggest an item" href={href} />
      </p>
    </div>
  );
}

/**
 * The filter rail.
 *
 * The site's shared CatalogueSearch folds query and categories behind a button
 * that opens a centred overlay. That fits /ecosystem and /blog — centred
 * headers, a long category list, and a grid you filter once and then browse.
 * A register is read differently: you arrive asking about one workstream and
 * keep re-aiming as you scroll. So the controls stay put and stay visible, in a
 * column that sticks alongside the work.
 *
 * Below lg there is no room for a second column, so the same buttons wrap into
 * a row above the list.
 */
function Filters({
  view,
  buildingOnly,
  onBuildingOnlyChange,
  buildingCount,
  query,
  onQueryChange,
  workstreams,
  counts,
  selected,
  onToggle,
  onClear,
  suggestionsHref,
}: {
  view: View;
  buildingOnly: boolean;
  onBuildingOnlyChange: (v: boolean) => void;
  buildingCount: number;
  query: string;
  onQueryChange: (v: string) => void;
  workstreams: string[];
  counts: Record<string, number>;
  selected: string[];
  onToggle: (w: string) => void;
  onClear: () => void;
  suggestionsHref: string;
}) {
  const filtering = selected.length > 0 || query.length > 0 || buildingOnly;
  return (
    // The margins live here rather than on a wrapper. A sticky element only
    // travels within its parent's box, so wrapping this in a div sized to its
    // own height pinned it nowhere — the rail has to be a direct child of the
    // column that stretches to the register's height.
    <div className="lg:sticky lg:top-16 lg:pt-5">
      {/* Search first, where a search field goes.
          It was moved to the foot on the argument that fourteen records are
          scanned rather than searched. True, and beside the point: a reader
          who wants to type a name looks top-left for the box, and finding it
          under the filters costs them more than its position saved. */}
      <div className="relative">
        <SearchIcon
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search"
          aria-label="Search commitments"
          className="pl-9"
        />
      </div>

      {view === "roadmap" && (
        /* The bare state name, which a checkbox can carry where a list row
           could not: "In progress" beside a box is unambiguous, while the same
           words as a row in a list read as a category with one member.

           "In progress" rather than "Building now" throughout, matching the
           board this register is derived from — its own statuses are Completed,
           In Progress, Now, Next, Beyond, Under Review, and a page that renames
           the one it shows makes the two surfaces disagree in the vocabulary a
           reader carries between them. */
        <div className="mt-3 lg:mt-4">
          <FilterRow
            label="In progress"
            count={buildingCount}
            active={buildingOnly}
            onChange={onBuildingOnlyChange}
          />
        </div>
      )}

      {/* Broad, then narrow. "In progress" cuts the whole register in half and
          the workstreams divide what is left, so it is read first — and it
          hangs off the search field with a tighter gap than the one below it,
          which is what keeps it from reading as part of this heading. */}
      <div className="mt-6 lg:mt-8">
        <div className="mb-1.5">
          <Label>Workstream</Label>
        </div>
        <div role="group" aria-label="Filter by workstream">
          {workstreams.map((w) => (
            <FilterRow
              key={w}
              label={w}
              count={counts[w] ?? 0}
              active={selected.includes(w)}
              onChange={() => onToggle(w)}
            />
          ))}
        </div>
      </div>

      {/* A checkbox, because this is one yes-or-no question.
          It spent two passes as a row in the workstream list and as a facet
          under its own heading, and both made a binary look like a list with
          one item missing — a list implies siblings. Nobody expects a checkbox
          to have any. The design system's own control, so the checked state is
          `primary`: an affordance colour, never the brand green.

          Roadmap only. Behind us every record shipped, so it would filter the
          view away. */}
      {/* One reset, at the foot of everything it resets, and only when there is
          something to undo. It used to sit in the Workstream heading, naming
          one facet while operating on three. */}
      {filtering && (
        <button
          type="button"
          onClick={onClear}
          className="mt-5 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring lg:mt-6"
        >
          <XIcon className="size-3.5" aria-hidden="true" />
          Clear filters
        </button>
      )}

      <SuggestBlock href={suggestionsHref} className="mt-8 hidden lg:block" />
    </div>
  );
}

/**
 * The view tabs — the one control that swaps the whole register.
 *
 * They lived on the horizontal lifeline while that existed. With the strip
 * gone they sit at the head of the register they switch, and they stick there:
 * a reader deep in Q1 2027 who wants the track record should not have to
 * scroll back to the top to ask for it.
 *
 * top-16 puts them flush under the site header, and the quarter bands stick to
 * the row's own bottom edge rather than to the viewport, so the two stack
 * instead of overlapping. The band's own offset is derived from this row's
 * height — change one and the other has to move.
 *
 * Each tab carries the size of the run behind it, counted off the whole
 * register rather than the filtered set: a label that shrank as you filtered
 * would report on the filter instead of on the run it switches to.
 */
function ViewTabs({
  view,
  onViewChange,
  counts,
}: {
  view: View;
  onViewChange: (v: View) => void;
  counts: { roadmap: number; shipped: number };
}) {
  return (
    <div
      role="tablist"
      aria-label="Roadmap views"
      className="sticky top-16 z-20 -mx-2 -ml-5 flex flex-wrap items-center gap-1 bg-background px-2 py-3"
    >
      {(["roadmap", "shipped"] as const).map((v) => (
        <button
          key={v}
          type="button"
          role="tab"
          aria-selected={view === v}
          onClick={() => onViewChange(v)}
          className={cn(
            "flex items-center gap-2 rounded-full px-3 py-1.5 text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
            view === v
              ? "bg-secondary font-medium text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {v === "roadmap" ? "Roadmap" : "Shipped"}
          <span
            className={cn(
              "tabular-nums",
              view === v ? "text-muted-foreground" : "text-muted-foreground/60"
            )}
          >
            {counts[v]}
          </span>
        </button>
      ))}
    </div>
  );
}

export function Roadmap({
  commitments,
  workstreams,
  suggestionsHref,
}: {
  commitments: Commitment[];
  workstreams: string[];
  suggestionsHref: string;
}) {
  const router = useRouter();
  const params = useSearchParams();

  // View and workstream live in the URL so a filtered roadmap can be linked.
  // The query does not: it changes on every keystroke, and a history entry per
  // character is worse than losing the text on share.
  const view: View = params.get("view") === "shipped" ? "shipped" : "roadmap";
  // Forward only. Behind us every record shipped, so the flag would filter the
  // whole view away — and one carried across a tab switch would blank the list
  // with nothing on screen to explain why.
  const buildingOnly = view === "roadmap" && params.get("state") === "building";
  const selected = (params.get("workstream") ?? "")
    .split(",")
    .filter((w) => workstreams.includes(w));
  const [query, setQuery] = useState("");

  // Read after mount, not at render. This page is statically prerendered, so a
  // build-time "today" would ship frozen and quietly claim the wrong quarter
  // was live for the next three months. The marker simply appears once the
  // browser can answer.
  const [today, setToday] = useState<Date | null>(null);
  useEffect(() => setToday(new Date()), []);
  const currentQuarter = today
    ? `Q${Math.floor(today.getMonth() / 3) + 1} ${today.getFullYear()}`
    : null;

  const setParams = (
    next: Partial<{
      view: View;
      workstream: string[];
      buildingOnly: boolean;
    }>
  ) => {
    const p = new URLSearchParams(params.toString());
    if (next.view) {
      if (next.view === "roadmap") p.delete("view");
      else p.set("view", next.view);
      // Shipped holds nothing that is still being built.
      if (next.view === "shipped") p.delete("state");
    }
    if (next.buildingOnly !== undefined) {
      if (next.buildingOnly) p.set("state", "building");
      else p.delete("state");
    }
    if (next.workstream) {
      if (next.workstream.length === 0) p.delete("workstream");
      else p.set("workstream", next.workstream.join(","));
    }
    router.replace(p.toString() ? `/roadmap?${p}` : "/roadmap", {
      scroll: false,
    });
  };

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    const hit = (c: Commitment) =>
      !q ||
      [c.title, c.outcome, c.workstream, ...c.owners]
        .join(" ")
        .toLowerCase()
        .includes(q);
    return commitments.filter(
      (c) =>
        hit(c) &&
        (selected.length === 0 || selected.includes(c.workstream)) &&
        (!buildingOnly || c.state === "building")
    );
  }, [commitments, query, selected, buildingOnly]);

  // Counted against the query and the workstream selection but not against
  // itself — a toggle whose own count fell to 0 the moment you switched it off
  // would be reporting on its own state rather than on what it would give you.
  const buildingCount = useMemo(() => {
    const q = query.trim().toLowerCase();
    return commitments.filter(
      (c) =>
        c.state === "building" &&
        (selected.length === 0 || selected.includes(c.workstream)) &&
        (!q ||
          [c.title, c.outcome, c.workstream, ...c.owners]
            .join(" ")
            .toLowerCase()
            .includes(q))
    ).length;
  }, [commitments, query, selected]);

  // Rail counts are scoped to the view, the query and the state toggle, but NOT
  // to the workstream selection — a facet that recounted itself as you selected
  // would show every unselected workstream as 0, which is exactly when the
  // number matters.
  //
  // The state toggle does count, and has to: with "In progress" on, this was
  // still reporting "Protocol 3" off the whole roadmap while clicking Protocol
  // delivered one. A facet that promises a number the next click does not
  // honour is worse than a facet with no numbers at all.
  const counts = useMemo(() => {
    const q = query.trim().toLowerCase();
    const tally: Record<string, number> = {};
    for (const c of commitments) {
      const inView =
        view === "shipped" ? c.state === "shipped" : c.state !== "shipped";
      if (!inView) continue;
      if (buildingOnly && c.state !== "building") continue;
      if (
        q &&
        ![c.title, c.outcome, c.workstream, ...c.owners]
          .join(" ")
          .toLowerCase()
          .includes(q)
      )
        continue;
      tally[c.workstream] = (tally[c.workstream] ?? 0) + 1;
    }
    return tally;
  }, [commitments, query, view, buildingOnly]);

  const building = matches.filter((c) => c.state === "building");
  const next = matches.filter((c) => c.state === "next");
  const shipped = matches.filter((c) => c.state === "shipped");

  // Shipped runs on a continuous month axis, newest first — every month
  // between the newest record and the oldest, including the ones nothing
  // landed in.
  //
  // This is the half of the register where a gap is information. Looking back,
  // a quiet month is a fact about what happened, and the density of a track
  // record is most of what a track record says. Looking forward it is not: an
  // empty future quarter is an absence of commitments rather than evidence of
  // anything, and drawing it is exactly the padding this page replaces — so
  // the roadmap view below still renders only the windows that hold work.
  //
  // Derived from the records at both ends, so backfilling history just extends
  // the axis. Capped, because a single mis-typed year would otherwise render
  // several thousand empty months.
  const shippedByPeriod: Record<string, Commitment[]> = {};
  if (shipped.length > 0) {
    const monthKey = (iso: string) =>
      new Date(iso).toLocaleDateString("en-US", {
        timeZone: "UTC",
        month: "long",
        year: "numeric",
      });
    const stamps = shipped.map((c) => c.shippedAt!).sort();
    const oldest = new Date(stamps[0]! + "T00:00:00Z");
    const newest = new Date(stamps[stamps.length - 1]! + "T00:00:00Z");
    const cursor = new Date(
      Date.UTC(newest.getUTCFullYear(), newest.getUTCMonth(), 1)
    );
    const floor = Date.UTC(oldest.getUTCFullYear(), oldest.getUTCMonth(), 1);
    for (let i = 0; cursor.getTime() >= floor && i < 600; i++) {
      shippedByPeriod[
        cursor.toLocaleDateString("en-US", {
          timeZone: "UTC",
          month: "long",
          year: "numeric",
        })
      ] = [];
      cursor.setUTCMonth(cursor.getUTCMonth() - 1);
    }
    for (const c of shipped) shippedByPeriod[monthKey(c.shippedAt!)]!.push(c);
  }

  // The roadmap runs chronologically by target window, as Stripe's does —
  // "Q3 2026", then "Q4 2026" — rather than splitting into a Building block and
  // a Next block. State stays legible on each card, so grouping by time costs
  // nothing and answers "when" first, which is what the page is for.
  //
  // Only windows that actually hold work get a heading. The board this replaces
  // renders empty future quarters, which reads as a roadmap with nothing in it
  // rather than as an honest edge; the closing line says that once.
  const roadmapByPeriod = [...building, ...next]
    .sort((a, b) => a.targetSort - b.targetSort)
    .reduce<Record<string, Commitment[]>>((acc, c) => {
      (acc[c.target] ??= []).push(c);
      return acc;
    }, {});

  // Read from the whole register, never from what is on screen.
  //
  // "Nothing is committed past X" is a claim about Livepeer's commitments, not
  // about the current filter — derived from the filtered set it stated, under
  // ?state=building, that nothing was committed past Q3 2026 while five
  // committed records sat in Q4 and Q1 with the filter hiding them. Any
  // workstream filter told the same lie more quietly.
  const lastPeriod = commitments
    .filter((c) => c.state !== "shipped")
    .sort((a, b) => a.targetSort - b.targetSort)
    .at(-1)?.target;

  const shown =
    view === "shipped" ? shipped.length : building.length + next.length;
  const total =
    view === "shipped"
      ? commitments.filter((c) => c.state === "shipped").length
      : commitments.filter((c) => c.state !== "shipped").length;

  return (
    // 150ms rather than the provider default of 0: at zero, dragging the
    // pointer across a row of faces fires several popups in a row. Long enough
    // to mean you stopped on one, short enough not to feel gated.
    <TooltipProvider delay={150}>
      {/* The working area: instruments left, work right, both starting on the
          same line. Deliberately no items-start — the rail has to stretch to
          the register's height, because that is the containing block it sticks
          inside. */}
      <div className="mt-8 lg:mt-10 lg:grid lg:grid-cols-[13rem_1fr] lg:gap-x-20">
        {/* The wrapper is the grid item, and the rail sticks inside it.
          Grid items stretch by default, so a sticky element that IS the item
          fills the row and has nowhere to travel — it reports position:sticky
          and scrolls away anyway. The wrapper takes the stretch; the rail keeps
          its own height. */}
        <div>
          <Filters
            view={view}
            buildingOnly={buildingOnly}
            onBuildingOnlyChange={(v) => setParams({ buildingOnly: v })}
            buildingCount={buildingCount}
            query={query}
            onQueryChange={setQuery}
            workstreams={workstreams}
            counts={counts}
            selected={selected}
            onToggle={(w) =>
              setParams({
                workstream: selected.includes(w)
                  ? selected.filter((x) => x !== w)
                  : [...selected, w],
              })
            }
            onClear={() => {
              setQuery("");
              setParams({ workstream: [], buildingOnly: false });
            }}
            suggestionsHref={suggestionsHref}
          />
        </div>

        <div className="mt-14 lg:mt-0">
          <ViewTabs
            view={view}
            onViewChange={(v) => setParams({ view: v })}
            counts={{
              roadmap: commitments.filter((c) => c.state !== "shipped").length,
              shipped: commitments.filter((c) => c.state === "shipped").length,
            }}
          />
          {/* Announced rather than shown: it changes on every keystroke, and a
            visible tally would compete with the rail's own counts. */}
          <p className="sr-only" role="status" aria-live="polite">
            {shown} of {total} commitments shown
          </p>

          {shown === 0 ? (
            /* An empty result is a place to act, not a place to apologise.
               The old copy named two of the three inputs — "try another
               workstream, or clear the search" — which read as a shrug from a
               page that knows exactly what it is filtering by and can undo it
               in one click. */
            <div className="py-16">
              <p className="text-reading-body text-muted-foreground">
                Nothing matches those filters.
              </p>
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setParams({ workstream: [], buildingOnly: false });
                }}
                className="mt-4 inline-flex items-center gap-1.5 text-sm text-foreground underline decoration-border underline-offset-4 transition-colors outline-none hover:decoration-foreground focus-visible:ring-2 focus-visible:ring-ring"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <>
              {view === "shipped"
                ? Object.entries(shippedByPeriod).map(([period, items]) => (
                    <Group key={period} period={period} commitments={items} />
                  ))
                : Object.entries(roadmapByPeriod).map(([period, items]) => (
                    <Group
                      key={period}
                      period={period}
                      commitments={items}
                      current={period === currentQuarter}
                    />
                  ))}

              {/* The closing line, set to answer the opening one.
                The page opens on what every entry has and ends on where the
                entries stop, in the same voice and at the same weight. A
                roadmap padded with aspirations is what this replaces, so the
                edge of what Livepeer has committed to is stated rather than
                left to be inferred from the absence of further quarters.

                Shipped has no closing line: it runs backwards, and its end is
                just where the register started being kept. */}
              {view === "roadmap" && lastPeriod && (
                <div className="mt-16 max-w-[46ch]">
                  <p className="text-2xl font-normal tracking-[-0.02em] text-balance text-muted-foreground">
                    Nothing is committed past {lastPeriod}.
                  </p>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                    Work appears here once it has an owner, a date and a source
                    you can check — not before.{" "}
                    <LinkRow
                      label="View or submit suggestions"
                      href={suggestionsHref}
                    />
                  </p>
                </div>
              )}
            </>
          )}
          <SuggestBlock
            href={suggestionsHref}
            className="mt-16 lg:hidden"
          />
        </div>
      </div>
    </TooltipProvider>
  );
}
