import type { Commitment } from "@/lib/roadmap";
import { shippedPeriod } from "@/lib/roadmap";

/**
 * One commitment, rendered once.
 *
 * Two routes show this: the page at /roadmap/<slug>, and the intercepting
 * route that slides it over the index. Sharing the body is the point of doing
 * the overlay that way round — a drawer with its own copy of the layout is two
 * things to keep in step, and they drift the first time one of them changes.
 */

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

export function CommitmentRecord({
  commitment: c,
}: {
  commitment: Commitment;
}) {
  return (
    <>
      <p className="text-xs tracking-[0.08em] text-muted-foreground uppercase">
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
          sitting among facts. Here it is the body and the facts are the aside,
          so a label would be announcing the obvious.

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
    </>
  );
}
