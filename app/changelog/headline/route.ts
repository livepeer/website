import { NextResponse } from "next/server";

import { MONTH, monthOf, roundupFor } from "@/lib/changelog";
import {
  draftHeadline,
  HEADLINE_MODEL,
  writeHeadline,
} from "@/lib/headline-draft";
import { getHeadlines, getRegister, getUpdates } from "@/lib/register";

/**
 * Write the headline for a closed changelog entry.
 *
 * Run by a Vercel cron on the first of each month (vercel.json), for the
 * month that just ended: compose the entry from the register and the
 * updates, ask the model for its title, and store it in _Changelog
 * entries_. Idempotent — an entry that already has a headline is left
 * alone unless `?force=1` — and safe to call by hand for an older month
 * with `?month=yyyy-mm`.
 *
 *   curl "https://livepeer.org/changelog/headline?month=2026-08" \
 *     -H "Authorization: Bearer $CRON_SECRET"
 *
 * Vercel sends that header itself on a cron invocation when CRON_SECRET
 * is set. No secret configured means no endpoint: this spends model and
 * Notion quota.
 */
export const dynamic = "force-dynamic";

function lastMonth(now: Date): string {
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 0));
  return monthOf(d.toISOString().slice(0, 10));
}

export async function GET(request: Request): Promise<NextResponse> {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "CRON_SECRET is not configured." },
      { status: 503 }
    );
  }
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const url = new URL(request.url);
  const now = new Date();
  const month = url.searchParams.get("month") ?? lastMonth(now);
  if (!MONTH.test(month) || month >= monthOf(now.toISOString())) {
    return NextResponse.json(
      { error: "month must be a finished month, yyyy-mm." },
      { status: 400 }
    );
  }
  const force = url.searchParams.get("force") === "1";

  const [commitments, updates, headlines] = await Promise.all([
    getRegister(),
    getUpdates(),
    getHeadlines(),
  ]);

  const existing = headlines.get(month);
  if (existing && !force) {
    return NextResponse.json({ month, headline: existing, wrote: false });
  }

  const r = roundupFor(month, commitments, updates, now);
  if (r.shipped.length + r.reported.length + r.quiet.length === 0) {
    return NextResponse.json(
      { month, error: "Nothing happened that month; no entry to title." },
      { status: 404 }
    );
  }

  const headline = await draftHeadline(r);
  await writeHeadline(month, headline, HEADLINE_MODEL);
  return NextResponse.json({ month, headline, wrote: true });
}
