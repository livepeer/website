import type { Metadata } from "next";
import Link from "next/link";

import { getOrganizationRegister, getRegister } from "@/lib/register";
import type { Commitment } from "@/lib/roadmap";

/**
 * Who delivers the work.
 *
 * The register names an owner on every commitment and, until this page, that
 * name went nowhere — the one claim the roadmap makes about accountability was
 * the only one a reader could not follow up. This is where it lands.
 *
 * Ordered alphabetically, not by how much each body owns. Ranking organisations
 * by their share of the register would make a claim this page has no business
 * making, and it would reorder itself as work shipped.
 */

const TITLE = "Livepeer Organizations — who builds the network.";
const DESCRIPTION =
  "The foundations, companies, SPEs and DAOs delivering work on the Livepeer network, and what each of them owns.";

export const metadata: Metadata = {
  title: "Organizations",
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION, type: "website" },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

/** The register's three tenses, in the order work moves through them. */
const STATE_LABEL: Record<Commitment["state"], string> = {
  building: "in progress",
  next: "committed",
  shipped: "shipped",
};
const STATE_ORDER: Commitment["state"][] = ["building", "next", "shipped"];

/**
 * What this body has on the register, counted.
 *
 * The "at a glance" line. A count reads at two commitments and at six, which
 * a time axis does not — the strip this replaces was cut from the roadmap for
 * covering too short a span, and one organisation's slice is thinner still.
 *
 * Silent when there is nothing: three of these bodies own no commitments, and
 * "0 in progress · 0 shipped" states that at length rather than leaving it to
 * the absence.
 */
function Tally({ commitments }: { commitments: Commitment[] }) {
  if (commitments.length === 0) return null;
  const parts = STATE_ORDER.map((state) => {
    const n = commitments.filter((c) => c.state === state).length;
    return n > 0 ? `${n} ${STATE_LABEL[state]}` : null;
  }).filter(Boolean);

  return (
    <p className="mt-4 font-mono text-xs text-muted-foreground">
      {parts.join(" · ")}
    </p>
  );
}

/**
 * First and last initial, not the first letter.
 *
 * Three of these bodies begin with "Livepeer", so a single letter drew the
 * same "L" on the Foundation, Inc and the Treasury — the collision that rules
 * out putting one shared mark on all of them.
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
 * The mark, or the initial standing in for one.
 *
 * Most of these bodies have no logo committed yet, and a card that rendered
 * nothing for them would read as broken rather than as incomplete. The
 * monogram is the same treatment a person with no portrait gets.
 *
 * A raw <img>: these are SVGs served straight from public/, and next/image
 * needs dangerouslyAllowSVG to touch them — a global loosening to render seven
 * files the repo itself controls.
 */
function Mark({ logo, name }: { logo?: string; name: string }) {
  return logo ? (
    <img
      src={`/organizations/${logo}`}
      alt=""
      className="size-10 shrink-0 rounded-md object-contain"
    />
  ) : (
    <span
      aria-hidden
      className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-medium text-muted-foreground"
    >
      {initials(name)}
    </span>
  );
}

export default async function OrganizationsPage() {
  const [organizations, commitments] = await Promise.all([
    getOrganizationRegister(),
    getRegister(),
  ]);

  return (
    <div className="pt-10 pb-32">
      <div className="mx-auto w-full max-w-page px-4 sm:px-6 lg:px-10">
        <div className="max-w-[68rem]">
          <header className="pt-6 lg:pt-8">
            <span className="text-[0.6875rem] leading-4 font-medium tracking-[0.09em] text-muted-foreground uppercase">
              Organizations
            </span>
            <h1 className="mt-3 text-page-title text-balance">
              Who builds the network.
            </h1>
            <p className="mt-5 max-w-[46ch] text-lg leading-relaxed text-muted-foreground">
              Every commitment on the roadmap names one body answerable for
              delivering it. These are those bodies.
            </p>
          </header>

          <ul className="mt-14 grid gap-4 sm:grid-cols-2">
            {organizations.map((org) => (
              <li key={org.slug} className="relative">
                <div className="h-full rounded-xl border border-border bg-card p-6 transition-colors hover:bg-accent/40">
                  <div className="flex items-start gap-4">
                    <Mark logo={org.logo} name={org.name} />
                    <div className="min-w-0">
                      <h2 className="text-base font-medium">
                        {/* Stretched, so the whole card is the target without
                            nesting anything inside an anchor. */}
                        <Link
                          href={`/organizations/${org.slug}`}
                          className="rounded-xl outline-none before:absolute before:inset-0 before:rounded-xl focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          {org.name}
                        </Link>
                      </h2>
                      <p className="mt-1 font-mono text-xs text-muted-foreground">
                        {org.type}
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                    {org.description}
                  </p>
                  <Tally
                    commitments={commitments.filter(
                      (c) => c.ownerSlug === org.slug
                    )}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
