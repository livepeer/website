import { roundupFor } from "@/lib/changelog";
import { PERIOD, monthOf } from "@/lib/period";
import { HEALTH_LABEL, postHref } from "@/lib/health";
import { getRegister, getUpdates } from "@/lib/register";
import type { Commitment } from "@/lib/roadmap";

/**
 * One month's roundup as JSON, for whatever closes the loop.
 *
 * The page shows who has not reported; nobody is told they are on that
 * list. A weekly post to a Discord channel, or a reminder in Notion, is
 * where a roundup turns into a habit, and this is the list such a thing
 * reads. The month under way by default — which the page never publishes,
 * because a nudge is only useful before a period closes — or any period
 * by its key, `?period=2026-08`, `2026-Q3`, `2026-W36`, `2026`, whether or
 * not a row has been published for it. It is also where the facts for a
 * headline come from. Built from the same register and updates the page
 * reads, on the same minute.
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
  const wanted = new URL(request.url).searchParams.get("period");
  if (wanted && !PERIOD.test(wanted)) {
    return Response.json(
      {
        error:
          "period must be a month (2026-08), quarter (2026-Q3), week (2026-W36) or year (2026)",
      },
      { status: 400 }
    );
  }
  const r = roundupFor(
    wanted ?? monthOf(now.toISOString().slice(0, 10)),
    commitments,
    updates,
    now
  );

  return Response.json(
    {
      period: r.key,
      title: r.label,
      start: r.start,
      end: r.end,
      open: r.open,
      // The address the entry has, or will have: a period still under way is
      // not published (`open` above says so), and its page 404s until a row
      // closes it. A nudge built from this should link the records, not this.
      url: `${SITE}/changelog/${r.key}`,
      shipped: r.shipped.map(({ commitment, retro, update }) => ({
        ...ref(commitment),
        shippedAt: commitment.shippedAt,
        retro: retro?.summary,
        retroUrl: retro && `${SITE}${postHref(retro)}`,
        lastWord: update?.summary,
        lastWordUrl: update && `${SITE}${postHref(update)}`,
      })),
      // Shipped that month with no retrospective posted: the other thing
      // worth a nudge, beside the silent.
      noRetro: r.shipped
        .filter(({ retro }) => !retro)
        .map(({ commitment }) => ref(commitment)),
      reported: r.reported.map(({ commitment, update }) => ({
        ...ref(commitment),
        health: update.health,
        healthLabel: HEALTH_LABEL[update.health],
        date: update.date,
        summary: update.summary,
        author: update.author?.name,
        // The post itself, on the record page, and where the full update
        // was posted if it was written somewhere else.
        updateUrl: `${SITE}${postHref(update)}`,
        link: update.link,
      })),
      quiet: r.quiet.map(ref),
    },
    { headers: { "Cache-Control": "public, max-age=60" } }
  );
}
