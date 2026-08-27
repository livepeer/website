import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getRegister } from "@/lib/register";
import { shippedPeriod, type Commitment } from "@/lib/roadmap";

/**
 * One commitment, at length.
 *
 * The index states what a commitment is and who owns it; this is where the
 * write-up behind it lives — how the work is funded, what has landed, what it
 * is downstream of. That outgrew the card the moment the bodies stopped being
 * two or three sentences: an accordion is a fine place for six short facts and
 * a poor one for several hundred words.
 *
 * A real page rather than a panel, because the reason to write at length is to
 * be read elsewhere. A write-up worth linking into a forum thread needs an
 * address, an unfurl and a place in search, and none of those exist for a
 * drawer. Notion's slide-over convention can still be layered on top later
 * through an intercepting route, which renders this same page over the index
 * while the URL changes — best had in that order, since the overlay is cheap
 * once the page exists and awkward the other way round.
 */

export const dynamicParams = false;

export async function generateStaticParams() {
  const commitments = await getRegister();
  return commitments.map((c) => ({ slug: c.slug }));
}

async function find(slug: string): Promise<Commitment | undefined> {
  const commitments = await getRegister();
  return commitments.find((c) => c.slug === slug);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const c = await find((await params).slug);
  if (!c) return {};

  // The outcome is already one sentence written to be read away from the page,
  // which is exactly what a description is for. Nothing to compose.
  const title = `${c.title} — Livepeer Roadmap`;
  return {
    title: c.title,
    description: c.outcome,
    openGraph: { title, description: c.outcome, type: "article" },
    twitter: {
      card: "summary_large_image",
      title,
      description: c.outcome,
    },
  };
}

const STATE_LABEL: Record<Commitment["state"], string> = {
  next: "Committed",
  building: "In progress",
  shipped: "Shipped",
};

function Fact({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <dt className="text-xs tracking-[0.08em] text-muted-foreground uppercase">
        {label}
      </dt>
      <dd className="mb-5 text-sm sm:mb-0">{children}</dd>
    </>
  );
}

export default async function CommitmentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const c = await find((await params).slug);
  if (!c) notFound();

  return (
    <article className="mx-auto w-full max-w-[46rem] px-6 pt-24 pb-28 sm:px-8">
      {/* Back to the list, not to the site. Someone arriving from a shared
          link has no history to go back to, so this is the only way onward
          into the rest of the register. */}
      <Link
        href="/roadmap"
        className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        Roadmap
      </Link>

      <p className="mt-10 text-xs tracking-[0.08em] text-muted-foreground uppercase">
        {c.workstream}
      </p>
      <h1 className="mt-3 text-page-title text-balance">{c.title}</h1>
      <p className="mt-5 max-w-[52ch] text-reading-body text-muted-foreground">
        {c.outcome}
      </p>

      <dl className="mt-12 grid gap-x-8 border-t border-border pt-8 sm:grid-cols-[7rem_1fr] sm:gap-y-5">
        <Fact label="State">{STATE_LABEL[c.state]}</Fact>
        <Fact label="By">{c.owner}</Fact>
        {c.state === "shipped" ? (
          <Fact label="Shipped">{shippedPeriod(c.shippedAt!)}</Fact>
        ) : (
          <Fact label="Target">{c.target}</Fact>
        )}
        {c.funding && <Fact label="Funding">{c.funding}</Fact>}
        {c.accountable && (
          <Fact label="Contact">
            {c.accountable.profile ? (
              <a
                href={`https://forum.livepeer.org/u/${c.accountable.profile}`}
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-4"
              >
                {c.accountable.name}
              </a>
            ) : (
              c.accountable.name
            )}
          </Fact>
        )}
        {c.contributors && c.contributors.length > 0 && (
          <Fact label="Contributors">
            {c.contributors.map((p) => p.name).join(", ")}
          </Fact>
        )}
        <Fact label="Related">
          <ul className="space-y-1">
            {c.related.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="underline underline-offset-4"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </Fact>
      </dl>

      {/* The write-up, unlabelled.
          On the card it needed the word "Context" to say why a paragraph was
          sitting among facts. Here it is the body of the page and the facts
          are the aside, so a label would be announcing the obvious.

          HTML from either source: the markdown register renders through the
          blog's pipeline, Notion's blocks through lib/notion-blocks.ts. */}
      {c.detail && (
        <div
          className="reading-prose mt-14 border-t border-border pt-10"
          dangerouslySetInnerHTML={{ __html: c.detail }}
        />
      )}

      {c.lastUpdated && (
        <p className="mt-16 text-xs text-muted-foreground">
          Last updated {c.lastUpdated}
        </p>
      )}
    </article>
  );
}
