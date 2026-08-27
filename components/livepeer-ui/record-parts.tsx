import Image from "next/image";
import type { AlignLeft } from "lucide-react";

import type { Person } from "@/lib/roadmap";

/** Where a credited face links; the record builds the URL from a handle. */
const PROFILE_HOST = "forum.livepeer.org";

/**
 * The furniture a record page is built from.
 *
 * Shared because two record types now use it — a commitment and an
 * organisation — and they render into the same surface, swapping places when a
 * reader follows an owner's name. Two copies of a banner and a property row
 * would drift the first time one of them changed, and the drift would be
 * visible in the same panel within a second of each other.
 */

/**
 * The banner, full-bleed above the record.
 *
 * Rendered by each route rather than inside CommitmentRecord, because the two
 * carry different horizontal padding and a cover has to escape whichever it
 * is sitting in. Kept here so the sizing and treatment are stated once.
 *
 * Fixed height and object-cover: the library's images are 1456x816, and a
 * banner that changed height per record would make the register's pages feel
 * like different templates. Priority, because it is the largest thing above
 * the fold on a page whose whole point is to be read.
 */
export function RecordCover({ src, alt }: { src: string; alt: string }) {
  return (
    // shrink-0 is load-bearing. The sheet is a flex column, so a child with a
    // fixed height still shrinks when the content overflows — which collapsed
    // this to 0px and made the banner render as nothing at all while every
    // measurement said it was present and positioned correctly.
    <div className="relative h-40 w-full shrink-0 overflow-hidden sm:h-56">
      <Image
        src={src}
        alt=""
        aria-hidden
        fill
        sizes="(max-width: 46rem) 100vw, 46rem"
        className="object-cover"
        priority
      />
      <span className="sr-only">{alt}</span>
    </div>
  );
}

/**
 * A property row.
 *
 * `<div>` inside `<dl>` is valid and is what keeps a label and its value in
 * one grid row without a wrapper element per column.
 *
 * No hover state. Notion highlights a property row because clicking it edits
 * the value; here the record is read-only, so the same highlight would be
 * promising an interaction that does not exist.
 */
export function RecordRow({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof AlignLeft;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 items-start gap-x-3 gap-y-1 px-2 py-1.5 sm:grid-cols-[11rem_1fr]">
      <dt className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="size-4 shrink-0" aria-hidden />
        {label}
      </dt>
      <dd className="text-sm leading-relaxed">{children}</dd>
    </div>
  );
}

/**
 * A credited person: portrait, then name.
 *
 * The card shows faces alone and identifies them on hover, which is right
 * where the space is tight. Here there is room for both, and a record that
 * made you hover to learn who worked on something would be worse than the
 * plain list of names it replaced — recognition and identification at once,
 * no interaction required.
 *
 * A monogram where there is no portrait, so a roster does not become a ragged
 * mix of pictures and bare text.
 */
export function RecordCredit({ person }: { person: Person }) {
  const name = (
    <span className="flex items-center gap-2">
      {person.avatar ? (
        <Image
          src={`/people/${person.avatar}`}
          alt=""
          width={20}
          height={20}
          className="size-5 shrink-0 rounded-full object-cover"
        />
      ) : (
        <span
          aria-hidden
          className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-[0.625rem] font-medium text-muted-foreground"
        >
          {person.name.charAt(0)}
        </span>
      )}
      {person.name}
    </span>
  );

  return person.profile ? (
    <a
      href={`https://${PROFILE_HOST}/u/${person.profile}`}
      target="_blank"
      rel="noreferrer"
      className="underline decoration-transparent underline-offset-4 transition-colors hover:decoration-border"
    >
      {name}
    </a>
  ) : (
    name
  );
}
