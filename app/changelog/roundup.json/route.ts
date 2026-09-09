import { MONTH, roundupFor, roundups } from "@/lib/changelog";
import { HEALTH_LABEL } from "@/lib/health";
import { getRegister, getUpdates } from "@/lib/register";
import type { Commitment } from "@/lib/roadmap";

/**
 * One month's roundup as JSON, for whatever closes the loop.
 *
 * The page shows who has not reported; nobody is told they are on that
 * list. A weekly post to a Discord channel, or a reminder in Notion, is
 * where a roundup turns into a habit, and this is the list such a thing
 * reads. The month under way by default, or `?month=yyyy-mm`. Built from
 * the same register and updates the page reads, on the same minute.
 */
export const revalidate = 60;

const SITE = "https://livepeer.org";

function ref(c: Commitment) {
  return {
    slug: c.slug,
    title: c.title,
    owner: c.owner,
    lead: c.lead?.name,
    url: `${SITE}/roadmap/${c.slug}`,
  };
}

export async function GET(request: Request) {
  const [commitments, updates] = await Promise.all([
    getRegister(),
    getUpdates(),
  ]);
  const now = new Date();
  const wanted = new URL(request.url).searchParams.get("month");
  if (wanted && !MONTH.test(wanted)) {
    return Response.json({ error: "month must be yyyy-mm" }, { status: 400 });
  }
  const r = wanted
    ? roundupFor(wanted, commitments, updates, now)
    : (roundups(commitments, updates, now)[0] ??
      roundupFor(now.toISOString().slice(0, 7), commitments, updates, now));

  return Response.json(
    {
      month: r.month,
      title: r.title,
      current: r.current,
      url: `${SITE}/changelog/${r.month}`,
      shipped: r.shipped.map(({ commitment, update }) => ({
        ...ref(commitment),
        shippedAt: commitment.shippedAt,
        lastWord: update?.summary,
      })),
      reported: r.reported.map(({ commitment, update }) => ({
        ...ref(commitment),
        health: update.health,
        healthLabel: HEALTH_LABEL[update.health],
        date: update.date,
        summary: update.summary,
        author: update.author?.name,
      })),
      quiet: r.quiet.map(ref),
    },
    { headers: { "Cache-Control": "public, max-age=60" } }
  );
}
