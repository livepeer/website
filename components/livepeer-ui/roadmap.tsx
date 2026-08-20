"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowUpRightIcon,
  ChevronDownIcon,
  SearchIcon,
} from "lucide-react";

import Image from "next/image";

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
 * word long. Green lands on "building now" alone — colour that appears on every
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
          ? "Building now"
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
 * A stable tilt for a pinned photograph, in degrees.
 *
 * Derived from the slug so it survives a server render and a client hydrate
 * identically — Math.random here would produce a different angle on each side
 * and React would throw. Signed, and biased away from zero, because a card at
 * 0.2deg reads as a mistake rather than as a choice.
 */
function tilt(slug: string) {
  // FNV-1a with a murmur3 finalizer. A plain `h * 31 + c` was the first version
  // and its low bits barely move between similar slugs — four cards came out at
  // -3.9, 2.8, 2.7 and 2.4, three of them leaning the same way by the same
  // amount, which is exactly the stamped look the tilt exists to avoid. The
  // finalizer is what makes sign and magnitude independent.
  let h = 2166136261;
  for (const ch of slug) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  h ^= h >>> 15;
  h = Math.imul(h, 2246822507);
  h ^= h >>> 13;
  h >>>= 0;
  const magnitude = 2.2 + (h % 21) / 10; // 2.2 – 4.2 degrees
  return (((h >>> 16) & 1 ? -1 : 1) * magnitude).toFixed(2);
}

/**
 * A stable fill for a monogram, from the registry's categorical five.
 *
 * Keyed on the name so a person keeps their tone across every card they appear
 * on — the point of a categorical colour is that it means the same thing twice.
 * Same hash as the lifeline's tilt: a plain character sum clusters badly on
 * similar strings, and the finalizer is what separates them.
 */
const FACE_TONES = [0, 25, 50, 75, 100].map((step) => ({
  // The light end of the ramp, not the whole of it.
  //
  // Spreading across all five put people on chart-3 and chart-5 — 0.439 and
  // 0.269 — which are darker than the card they sit on, so a monogram read as a
  // hole punched in the row rather than as a face. These five are steps between
  // chart-1 and chart-2 (0.87 down to 0.556), which keeps five distinguishable
  // fills inside a band that stays lighter than every surface on the page.
  //
  // One ink for all five, because the band is narrow enough that it does not
  // need to switch: chart-5 clears the darkest of them comfortably.
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
        {/* First row, ahead of Context: where this commitment came from.
            The board is where an idea is proposed and where its state is kept,
            so it outranks the material the record is assembled from. Related
            answers "where does this work live"; this answers "what is this a
            record of", which is the question a reader checking the page asks
            first.

            Absent on records that did not reach the register through the
            board, which is truer than linking a page that does not describe
            them. */}
        {c.source && (
          <>
            <dt>
              <Label>Source</Label>
            </dt>
            <dd className="text-sm">
              <LinkRow label="View on the roadmap board" href={c.source} />
            </dd>
          </>
        )}
        {/* Funding, next to Source, because the two together are what make
            this a commitment rather than an intention. The requirements doc
            defines one as "a dated, owned undertaking to deliver a named
            outcome to the network, with its funding source identified" — the
            card was carrying the owner, the date and the outcome and quietly
            dropping the fourth.

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
    <section className="mt-16 first-of-type:mt-0">
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
      <h2 className="sticky top-16 z-10 -mx-2 flex items-baseline justify-between gap-x-6 gap-y-2 bg-background px-2 py-6">
        {/* whitespace-nowrap on all three. As flex siblings they were free to
            shrink below their own content, and at 375px they all took the
            offer: "THIS QUARTER" broke in half and "Q3 2026" came apart into
            "Q3" over "2026", standing the band 112px tall against the 80px of
            every other quarter. Held whole they measure ~327px in a 343px row
            and fit. */}
        <span className="flex flex-wrap items-baseline gap-x-3 gap-y-2">
          <span className="text-2xl font-normal tracking-[-0.02em] whitespace-nowrap tabular-nums">
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
        <Label className="shrink-0 whitespace-nowrap">
          {commitments.length}{" "}
          {commitments.length === 1 ? "commitment" : "commitments"}
        </Label>
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
      <div className="mt-2 space-y-4">
        {commitments.map((c) => (
          <CommitmentCard key={c.slug} commitment={c} />
        ))}
      </div>
    </section>
  );
}

/** One filter control, in both of its layouts. */
function FilterRow({
  label,
  count,
  active,
  onClick,
  role,
}: {
  label: string;
  count?: number;
  active: boolean;
  onClick: () => void;
  role?: "tab";
}) {
  // A workstream with nothing in the current view is offered as information,
  // not as an affordance: the count says the filter is empty, and the control
  // stops short of letting you dead-end the list to prove it.
  const empty = count === 0 && !active;
  const isTab = role === "tab";
  return (
    <button
      type="button"
      role={role}
      disabled={empty}
      {...(isTab ? { "aria-selected": active } : { "aria-pressed": active })}
      onClick={onClick}
      className={cn(
        "relative inline-flex items-center gap-2 rounded-full text-left text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring lg:w-full",
        // The view is a control, so it takes a pill. A workstream is an item in
        // a list, so it takes weight and colour and a mark — two multi-select
        // rows and two view tabs styled alike is how you get a reader toggling
        // the wrong one.
        isTab
          ? cn(
              "px-3 py-1.5",
              active
                ? "bg-secondary font-medium text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )
          : cn(
              "justify-between py-1.5 pr-1 pl-0",
              active
                ? "font-medium text-foreground"
                : "text-muted-foreground hover:text-foreground"
            ),
        empty && "pointer-events-none opacity-40"
      )}
    >
      <span className="flex items-center gap-2">
        {!isTab && active && (
          // In the margin, not in the line. Given layout width it pushed every
          // workstream 12px right of the view pills and the rail's own
          // headings; hung outside, the labels all start on one edge and the
          // mark reads as an annotation against them.
          <span
            aria-hidden="true"
            className="absolute top-1/2 -left-3 size-1 -translate-y-1/2 rounded-full bg-foreground"
          />
        )}
        {label}
      </span>
      {/* Counts earn their place in the rail, where there is room and they warn
          you before you click into an empty filter. In the chip row they would
          double every chip's width, so they sit this one out. */}
      {count !== undefined && (
        <span className="hidden text-muted-foreground tabular-nums lg:inline">
          {count}
        </span>
      )}
    </button>
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
  query,
  onQueryChange,
  workstreams,
  counts,
  selected,
  onToggle,
  onClear,
  suggestionsHref,
}: {
  query: string;
  onQueryChange: (v: string) => void;
  workstreams: string[];
  counts: Record<string, number>;
  selected: string[];
  onToggle: (w: string) => void;
  onClear: () => void;
  suggestionsHref: string;
}) {
  const filtering = selected.length > 0 || query.length > 0;
  return (
    // The margins live here rather than on a wrapper. A sticky element only
    // travels within its parent's box, so wrapping this in a div sized to its
    // own height pinned it nowhere — the rail has to be a direct child of the
    // column that stretches to the register's height.
    <div className="lg:sticky lg:top-16 lg:pt-5">
      {/* Filled rather than outlined: one less line on a page built out of
          surfaces, and it matches the cards it searches. */}
      <div className="relative">
        <SearchIcon
          className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search"
          aria-label="Search commitments"
          className="h-10 w-full rounded-full bg-muted/70 pr-4 pl-10 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring dark:bg-card"
        />
      </div>

      <div className="mt-4 lg:mt-8">
        <div className="mb-2.5 hidden items-baseline justify-between lg:flex">
          <Label>Workstream</Label>
          {filtering && (
            <button
              type="button"
              onClick={onClear}
              className="text-xs text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            >
              Clear
            </button>
          )}
        </div>
        {/* A group, not a tablist: several can be on at once, and they filter
            rather than switch view. */}
        <div
          role="group"
          aria-label="Filter by workstream"
          className="flex flex-wrap gap-x-4 gap-y-1 lg:flex-col lg:gap-x-0"
        >
          {workstreams.map((w) => (
            <FilterRow
              key={w}
              label={w}
              count={counts[w] ?? 0}
              active={selected.includes(w)}
              onClick={() => onToggle(w)}
            />
          ))}
          {filtering && (
            <button
              type="button"
              onClick={onClear}
              className="py-1.5 text-sm text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring lg:hidden"
            >
              Clear
            </button>
          )}
        </div>
      </div>
      <SuggestBlock
        href={suggestionsHref}
        className="mt-8 hidden lg:block"
      />
    </div>
  );
}

/**
 * The track record, as a horizontal lifeline.
 *
 * One tick, one thing shipped. Grouping a year's work into a single column made
 * 2026 six entries deep while every other column held one, so the row was as
 * tall as its busiest year and mostly empty above the rest — and a tick stopped
 * meaning anything consistent. Given a tick each, the run reads at a steady
 * height and its density is the information: six ticks bunched at the right end
 * say more about 2026 than a number ever did.
 *
 * Quiet years keep a tick of their own. They cost 5rem, they carry the year in
 * grey, and they are why the row reads as a history rather than a list — the
 * thin stretch through 2019 and 2021 is the shape of the thing. Drop them and
 * eleven events space evenly and imply a steadiness that was never there.
 *
 * Columns are sized to their contents rather than to an even grid — measured
 * off the reference, where an empty year is 80px and a year with content is
 * 258px. That is what buys readable titles in a horizontal layout: an even grid
 * across this range gives each column ~120px, under half what the longest title
 * needs, which is what forced an earlier version down to bare dots.
 *
 * The range is derived, never hard-coded — oldest shipped record to newest — so
 * deleting the backfill or adding to it just moves the ends.
 */
const MIN_MILESTONES = 5;
/** Below this, a press is a click; above it, it is a pan. */
const DRAG_THRESHOLD = 4;
/** Velocity retained per 60fps frame after release. */
const GLIDE_FRICTION = 0.94;
/** Below this (px/ms) the glide has stopped being motion and is just drift. */
const GLIDE_FLOOR = 0.02;
/**
 * Ceiling on release velocity, px/ms.
 *
 * A hand flick lands around 2–4; the number only matters for the outliers.
 * Uncapped, one sharp throw sends the run from end to end in a handful of
 * frames, which reads as a glitch rather than as momentum — and a synthetic
 * pointer, which reports a few enormous jumps instead of many small ones,
 * produces ~20 and does exactly that every time.
 */
const GLIDE_MAX = 4;

type Tick =
  | { kind: "entry"; commitment: Commitment; stamp: string }
  | { kind: "quiet"; year: number };

export function Lifeline({
  commitments,
  all,
  view,
  onViewChange,
}: {
  /** What the filters left — the run the strip actually draws. */
  commitments: Commitment[];
  /**
   * The whole register, for the "is there enough history to draw" decision.
   *
   * The two are separate so filtering narrows the strip without deleting it.
   * Gating on the filtered set instead made the lifeline vanish the moment a
   * workstream took the count under the minimum, which reads as a bug rather
   * than as a result — and left the rail claiming "Protocol, 3" with nothing
   * above it. The minimum exists so a two-tick strip is not what greets you on
   * arrival; once you have narrowed it yourself, a short run is the answer.
   */
  all: Commitment[];
  view: View;
  onViewChange: (v: View) => void;
}) {
  // Above the early return: hooks have to run in the same order every render,
  // and MIN_MILESTONES bails out below this point.
  const scroller = useRef<HTMLDivElement>(null);
  const drag = useRef({
    active: false,
    captured: false,
    startX: 0,
    startLeft: 0,
    moved: 0,
    lastX: 0,
    lastT: 0,
    v: 0,
  });
  const glideFrame = useRef<number | null>(null);
  const stopGlide = () => {
    if (glideFrame.current !== null) {
      cancelAnimationFrame(glideFrame.current);
      glideFrame.current = null;
    }
  };
  // A glide left running after unmount would call scrollLeft on a detached node
  // every frame until it decayed.
  useEffect(() => stopGlide, []);

  /**
   * Both views open at their own left edge, and both open on now.
   *
   * Shipped used to open scrolled to its far end, so that the newest work led.
   * It got there, and it felt broken: you land in the middle of a run with
   * columns clipped off to the left, which reads as a page that has already
   * been touched rather than one you have just opened. Reversing the order
   * gets the same result honestly — see the note on how the ticks are built.
   */
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    stopGlide();
    el.scrollLeft = 0;
  }, [view]);

  const stamp = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
      timeZone: "UTC",
      month: "short",
      year: "numeric",
    });

  const ticks: Tick[] = [];
  if (view === "shipped") {
    if (all.filter((c) => c.state === "shipped").length < MIN_MILESTONES)
      return null;
    const shipped = commitments
      .filter((c) => c.state === "shipped")
      .sort((a, b) => a.shippedAt!.localeCompare(b.shippedAt!));
    if (shipped.length === 0) return null;
    // Quiet years belong to the past only. A year with nothing in it is a fact
    // about what happened; there is no equivalent claim to make about a future
    // quarter nobody has committed to yet, and inventing empty windows ahead of
    // the register would be the padding this page exists to refuse.
    //
    // Built forwards here and reversed at the end, so the quiet years still
    // land between the right entries.
    const yearOf = (iso: string) => Number(iso.slice(0, 4));
    const firstYear = yearOf(shipped[0]!.shippedAt!);
    const lastYear = yearOf(shipped[shipped.length - 1]!.shippedAt!);
    for (let year = firstYear; year <= lastYear; year++) {
      const inYear = shipped.filter((c) => yearOf(c.shippedAt!) === year);
      if (inYear.length === 0) ticks.push({ kind: "quiet", year });
      else
        for (const commitment of inYear)
          ticks.push({
            kind: "entry",
            commitment,
            stamp: stamp(commitment.shippedAt!),
          });
    }
  } else {
    // Forward, the stamp is the target window as written — "Q4 2026", "H1
    // 2027" — never normalised to a month. The register records each target at
    // the precision it actually has, and a lifeline that rendered "Oct 2026"
    // for a commitment dated "Q4 2026" would invent three months of confidence
    // nobody offered.
    if (all.filter((c) => c.state !== "shipped").length < MIN_MILESTONES)
      return null;
    const planned = commitments
      .filter((c) => c.state !== "shipped")
      .sort((a, b) => a.targetSort - b.targetSort);
    if (planned.length === 0) return null;
    for (const commitment of planned)
      ticks.push({ kind: "entry", commitment, stamp: commitment.target });
  }

  /**
   * One rule for both runs: distance from today grows to the right.
   *
   * Roadmap reads now → future left to right, which is already chronological.
   * Shipped reads now → past, which means reversing it — and the pair is more
   * coherent for it than a single strict left-to-right calendar was. Both open
   * on the present at the left edge, which is where a reader is standing and
   * where the register directly beneath them also opens.
   *
   * Reading a run of years backwards is legible because every tick carries its
   * own stamp; it is the same move a changelog makes, and the alternative was
   * opening Shipped eight years from anything anyone is working on.
   */
  if (view === "shipped") ticks.reverse();

  // Drag to pan, with the scrollbar hidden.
  //
  // A native bar under a hero strip reads as chrome and only appears on hover
  // on most desktop setups anyway, so the run looked static and nobody would
  // think to scroll it. A grab cursor says "this moves" before you touch it.
  //
  // Mouse only: touch already pans this natively, and intercepting pointermove
  // there would fight the browser's own momentum scrolling. `moved` is the
  // guard that keeps a drag from firing the link it happens to finish over —
  // without it, panning the row would open whatever source was under the
  // cursor when you let go.
  const startDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = scroller.current;
    if (!el || e.pointerType !== "mouse" || e.button !== 0) return;
    // Catching a moving strip stops it, the way it would if you put a finger
    // on a spinning record.
    stopGlide();
    drag.current = {
      active: true,
      captured: false,
      startX: e.clientX,
      startLeft: el.scrollLeft,
      moved: 0,
      lastX: e.clientX,
      lastT: e.timeStamp,
      v: 0,
    };
  };

  const moveDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = scroller.current;
    if (!el || !drag.current.active) return;
    const dx = e.clientX - drag.current.startX;
    drag.current.moved = Math.max(drag.current.moved, Math.abs(dx));
    // Velocity as a rolling average, not the last frame alone: a single jittery
    // sample at the moment of release would otherwise decide the whole throw.
    const dt = e.timeStamp - drag.current.lastT;
    if (dt > 0) {
      const vx = (e.clientX - drag.current.lastX) / dt;
      drag.current.v = drag.current.v * 0.7 + vx * 0.3;
      drag.current.lastX = e.clientX;
      drag.current.lastT = e.timeStamp;
    }
    if (drag.current.moved <= DRAG_THRESHOLD) return;
    // Capture only once this is unambiguously a drag.
    //
    // Capturing on pointerdown was the first version and it silently killed
    // every link on the strip: capture redirects the rest of the sequence to
    // the capturing element, so pointerup landed on the container and the click
    // target became their common ancestor — a <div> — instead of the anchor the
    // press started on. Deferring it means a plain click never enters capture
    // at all and behaves exactly as if none of this existed.
    if (!drag.current.captured) {
      el.setPointerCapture(e.pointerId);
      el.style.userSelect = "none";
      drag.current.captured = true;
    }
    el.scrollLeft = drag.current.startLeft - dx;
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = scroller.current;
    const wasDragging = drag.current.captured;
    if (wasDragging && el) {
      if (el.hasPointerCapture(e.pointerId))
        el.releasePointerCapture(e.pointerId);
      el.style.userSelect = "";
    }
    drag.current.active = false;
    if (wasDragging) glide(drag.current.v);
  };

  /**
   * Let go and it keeps going, slowing down — the reference's behaviour, and
   * the thing that makes a wide strip feel like an object rather than a
   * viewport. Without it a run this long takes four deliberate drags to cross.
   *
   * Friction is per-frame but applied against real elapsed time, so a dropped
   * frame shortens the glide rather than extending it. It stops at the ends
   * instead of grinding against them, and it does not run at all under
   * prefers-reduced-motion, where decaying movement is exactly the thing being
   * asked for less of.
   */
  const glide = (v0: number) => {
    const el = scroller.current;
    if (!el || Math.abs(v0) < 0.05) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let v = Math.max(-GLIDE_MAX, Math.min(GLIDE_MAX, v0));
    let prev = performance.now();
    const step = (now: number) => {
      // Capped so a backgrounded tab does not resume with one enormous jump.
      const dt = Math.min(now - prev, 32);
      prev = now;
      el.scrollLeft -= v * dt;
      v *= Math.pow(GLIDE_FRICTION, dt / 16.67);
      const atEnd =
        el.scrollLeft <= 0 || el.scrollLeft >= el.scrollWidth - el.clientWidth;
      glideFrame.current =
        Math.abs(v) > GLIDE_FLOOR && !atEnd
          ? requestAnimationFrame(step)
          : null;
    };
    glideFrame.current = requestAnimationFrame(step);
  };

  return (
    <section
      aria-label={view === "shipped" ? "Shipped, by year" : "Committed work"}
      // 40px, not 32. The three gaps above this — eyebrow to headline,
      // headline to lead, lead to here — express three different degrees of
      // belonging, and at 20/20/32 they were nearly flat: the same 20px sat
      // under a 13px eyebrow and under a 61px headline, generous below one and
      // tight below the other. 12/28/40 makes the eyebrow read as attached to
      // the headline it labels, the lead as a second beat, and this as a new
      // section.
      className="mt-10"
    >
      {/* The tabs live here, on the lifeline, rather than in the rail.
            They were a "View" section buried under the search field, which is a
            quiet home for the control that swaps the entire page — and the
            label sitting here said "SHIPPED" while doing nothing, occupying the
            exact spot the control wanted. Now the page reads top to bottom as
            the choice, the run of work under it, then the register of the same
            work.

            The cost is that they no longer sit in the sticky rail, so switching
            view from deep in the register means scrolling back up. The quarter
            headings are sticky, so the way back is short. */}
      <div
        role="tablist"
        aria-label="Roadmap views"
        className="-ml-3 flex flex-wrap items-center gap-1"
      >
        {/* Each tab carries the size of the run behind it.
              This is the one place on the page where a count is something a
              reader acts on rather than reads: the tabs are where the two sets
              are chosen between, so the number answers "how much is over
              there" before the click rather than after it. The lead's tally
              describes the register whole; these two describe the halves, and
              the three agree.

              Counted off the whole register, not the filtered set — a tab
              label that shrank as you filtered would be reporting on the
              filter rather than on the run it switches to. */}
        {(["roadmap", "shipped"] as const).map((v) => {
          const n = all.filter((c) =>
            v === "shipped" ? c.state === "shipped" : c.state !== "shipped"
          ).length;
          return (
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
                {n}
              </span>
            </button>
          );
        })}
      </div>
      {/* Bleeding to the container edge so the run can reach the edge of the
            page when it scrolls, rather than stopping short and looking
            truncated. The padding puts the first tick back on the measure. */}
      <div
        ref={scroller}
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        // The native link/image drag is the other thing that hijacks a press
        // and pull, and it is cancellable without touching the click.
        onDragStart={(e) => e.preventDefault()}
        // Capture, so the suppression lands before the anchor sees the click.
        onClickCapture={(e) => {
          if (drag.current.moved > DRAG_THRESHOLD) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
        className="mt-5 -mx-4 cursor-grab overflow-x-auto px-4 [scrollbar-width:none] active:cursor-grabbing [&::-webkit-scrollbar]:hidden sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10"
      >
        {/* An axis across the top with a tick hanging off it, not a rule down
              each column. Full-height rules made every column as tall as the
              tallest, so a thin entry showed a title above a long empty line. */}
        <ol className="relative flex min-w-max items-start pt-px">
          <span
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-px bg-border"
          />
          {ticks.map((tick) => (
            <li
              key={
                tick.kind === "entry"
                  ? tick.commitment.slug
                  : `quiet-${tick.year}`
              }
              className={cn(
                "relative shrink-0 pt-4 pl-4",
                tick.kind === "entry" ? "w-60 pr-6" : "w-20"
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "absolute top-0 left-0 w-px",
                  // The axis stays uniform: one mark per entry, one length.
                  // The lifeline no longer carries state at all — see the note
                  // on the heading row.
                  tick.kind !== "entry"
                    ? "h-1.5 bg-border"
                    : "h-2.5 bg-muted-foreground"
                )}
              />
              {tick.kind === "quiet" ? (
                <p className="text-sm leading-5 text-muted-foreground/50 tabular-nums">
                  {tick.year}
                </p>
              ) : (
                <>
                  {/* The stamp repeats when two entries share a window —
                        which is true, and the alternative is an unlabelled tick
                        floating free of the run. Looking back it is a month;
                        looking forward it is the target as the register wrote
                        it, at whatever precision that actually has. */}
                  {/* Date and workstream, and deliberately not state.
                        Marking live work here was tried several ways — a badge
                        on its own row, the words beside the roster, a longer
                        green tick, a node on the axis, a pulsing dot before the
                        date — and each either cost a line on every column or
                        marked the distinction in a way that had to be decoded
                        rather than read. The register below states it in words
                        on every card, which is where a reader who wants it will
                        look. The strip's job is when, what and who. */}
                  {/* items-center, not items-baseline. StateMark is itself a
                        flex row, so its baseline is taken from its first item —
                        the dot — whose baseline is its bottom edge, because it
                        holds no text. Aligning that to the date's baseline sat
                        the entire mark 2px low. Both children are 14px on a
                        20px line box, so centring lands them on the same
                        baseline anyway, without routing through the dot. */}
                  {/* A paragraph, not a heading. These label a column; they
                        do not open a section, and as h3s they sat directly
                        under the page h1 with the register's own h2 quarter
                        bands further down — a reader navigating by heading met
                        nine phantom sections before the first real one. The
                        section's aria-label is what names this region. */}
                  <p className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm leading-5">
                    <span className="font-medium tabular-nums">
                      {tick.stamp}
                    </span>
                    <Label>{tick.commitment.workstream}</Label>
                  </p>
                    {/* A pinned photograph, tilted, on the few milestones that
                        have one.
                        The treatment is measured off the reference: a card at a
                        few degrees, rounded-xl, a hairline ring and a lifted
                        shadow, straightening and growing 3% on hover over
                        200ms. Deliberately sparse — an image on every entry was
                        a uniform column of thumbnails and read as a spec sheet;
                        four across fourteen ticks read as punctuation, which is
                        what the reference is doing.

                        The angle is derived from the slug rather than stored or
                        randomised. Math.random would differ between the server
                        render and the client and blow up hydration; a hash is
                        stable, and it varies enough that the cards look pinned
                        by hand rather than stamped. */}
                  <div className="mt-3">
                    {tick.commitment.image && (
                      <span
                        className="group/photo relative mb-4 block w-[8.25rem] rotate-[var(--tilt)] cursor-grab transition-transform duration-200 ease-out hover:z-10 hover:rotate-0 motion-reduce:transition-none"
                        style={
                          {
                            "--tilt": `${tilt(tick.commitment.slug)}deg`,
                          } as React.CSSProperties
                        }
                      >
                        <span className="block overflow-hidden rounded-xl shadow-xl ring-1 ring-black/10 transition-[transform,box-shadow] duration-200 ease-out group-hover/photo:scale-[1.03] group-hover/photo:shadow-2xl motion-reduce:transition-none dark:ring-white/15">
                          <Image
                            src={`/roadmap/milestones/${tick.commitment.image}`}
                            alt=""
                            width={480}
                            height={360}
                            className="block h-auto w-full object-cover"
                          />
                        </span>
                      </span>
                    )}
                    <p className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-sm leading-snug">
                      {/* Each title carries its own source: a track record is
                          the claim on this page most worth checking.

                          The board item first, because that is where the
                          commitment is proposed and where its state is kept —
                          the same link the expanded card leads with. It falls
                          back to the first related link for records that did
                          not reach the register through the board, which is
                          better than a title that goes nowhere. */}
                      <LinkRow
                        label={tick.commitment.title}
                        href={
                          tick.commitment.source ??
                          tick.commitment.related[0]!.href
                        }
                      />
                      {tick.commitment.people &&
                        tick.commitment.people.length > 0 && (
                          <Faces people={tick.commitment.people} />
                        )}
                    </p>
                  </div>
                </>
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
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
    }>
  ) => {
    const p = new URLSearchParams(params.toString());
    if (next.view) {
      if (next.view === "roadmap") p.delete("view");
      else p.set("view", next.view);
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
        (selected.length === 0 || selected.includes(c.workstream))
    );
  }, [commitments, query, selected]);

  // Rail counts are scoped to the view and the query but NOT to the workstream
  // selection — a facet that recounted itself as you selected would show every
  // unselected workstream as 0, which is exactly when the number matters.
  const counts = useMemo(() => {
    const q = query.trim().toLowerCase();
    const tally: Record<string, number> = {};
    for (const c of commitments) {
      const inView =
        view === "shipped" ? c.state === "shipped" : c.state !== "shipped";
      if (!inView) continue;
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
  }, [commitments, query, view]);

  const building = matches.filter((c) => c.state === "building");
  const next = matches.filter((c) => c.state === "next");
  const shipped = matches.filter((c) => c.state === "shipped");

  // Shipped groups by month, newest first. getCommitments already sorts by
  // shippedAt, so insertion order carries the ordering.
  const shippedByPeriod = shipped.reduce<Record<string, Commitment[]>>(
    (acc, c) => {
      const period = new Date(c.shippedAt!).toLocaleDateString("en-US", {
        timeZone: "UTC",
        month: "long",
        year: "numeric",
      });
      (acc[period] ??= []).push(c);
      return acc;
    },
    {}
  );

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
      {/* The lifeline reads the view, so it lives inside the component that
          owns it rather than in the page shell. That puts it behind the same
          useSearchParams boundary as the register — which costs nothing extra,
          because the register was already what that boundary defers. */}
      <Lifeline
        commitments={matches}
        all={commitments}
        view={view}
        onViewChange={(v) => setParams({ view: v })}
      />
      {/* The working area: instruments left, work right, both starting on the
          same line. Deliberately no items-start — the rail has to stretch to
          the register's height, because that is the containing block it sticks
          inside. */}
      <div className="mt-10 lg:mt-12 lg:grid lg:grid-cols-[13rem_1fr] lg:gap-x-20">
        {/* The wrapper is the grid item, and the rail sticks inside it.
          Grid items stretch by default, so a sticky element that IS the item
          fills the row and has nowhere to travel — it reports position:sticky
          and scrolls away anyway. The wrapper takes the stretch; the rail keeps
          its own height. */}
        <div>
          <Filters
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
              setParams({ workstream: [] });
            }}
            suggestionsHref={suggestionsHref}
          />
        </div>

        <div className="mt-14 lg:mt-0">
          {/* Announced rather than shown: it changes on every keystroke, and a
            visible tally would compete with the rail's own counts. */}
          <p className="sr-only" role="status" aria-live="polite">
            {shown} of {total} commitments shown
          </p>

          {shown === 0 ? (
            <p className="py-16 text-reading-body text-muted-foreground">
              No commitments match that. Try another workstream, or clear the
              search.
            </p>
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
