import crypto from "node:crypto";

import { NextResponse } from "next/server";

import { revalidateNotionSurfaces } from "../notion-surfaces";

/**
 * Push what Notion holds live now, rather than waiting for the window.
 *
 * Everything read from Notion is rendered statically and refreshed on a
 * timer (see `NOTION_REVALIDATE` in lib/notion.ts). That timer is what serves
 * people editing a board in Notion, who are not going to call an endpoint.
 *
 * This is for the other case: an agent that has just written to a database
 * through the API and wants the site to reflect it immediately. Notion's own
 * automations do not run on API edits, so nothing else will notice.
 *
 *   curl -X POST "https://livepeer.org/api/revalidate" \
 *     -H "Authorization: Bearer $REVALIDATE_SECRET"
 *
 * Calling it is optional and cannot corrupt anything — the worst case is a
 * page rebuilt slightly early. Forgetting it is not an error either; the
 * change still lands within the window. That is deliberate: an agent that
 * skips this step should be late, never wrong.
 *
 * What gets cleared is the shared list in ../notion-surfaces.ts, the same one
 * the Notion webhook uses.
 */

/**
 * Compared in constant time, the way the webhook compares its signature. The
 * stakes are the same low ones — a forged call rebuilds pages early — but two
 * endpoints guarding the same thing with two standards of care would make the
 * weaker one look like an oversight rather than a choice.
 */
function tokenMatches(offered: string, secret: string): boolean {
  const a = Buffer.from(offered);
  const b = Buffer.from(secret);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function POST(request: Request): Promise<NextResponse> {
  const secret = process.env.REVALIDATE_SECRET;

  // No secret configured means no endpoint. Refusing is safer than defaulting
  // to open: this triggers work, and an unauthenticated caller could spend a
  // deployment's Notion quota by holding down a key.
  if (!secret) {
    return NextResponse.json(
      { revalidated: false, error: "REVALIDATE_SECRET is not configured." },
      { status: 503 }
    );
  }

  // The curl above sends `Bearer <secret>`; the prefix is stripped so a caller
  // who sends the bare secret is accepted too.
  const offered =
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  if (!tokenMatches(offered, secret)) {
    return NextResponse.json(
      { revalidated: false, error: "Bad or missing bearer token." },
      { status: 401 }
    );
  }

  const paths = revalidateNotionSurfaces();
  return NextResponse.json({ revalidated: true, paths });
}
