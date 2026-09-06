import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

/**
 * Push the roadmap live now, rather than waiting for the window.
 *
 * The register is read from Notion and rendered statically, refreshed on a
 * timer (see `NOTION_REVALIDATE` in lib/notion.ts). That timer is what serves
 * people editing the board in Notion, who are not going to call an endpoint.
 *
 * This is for the other case: an agent that has just written to the register
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
 */

/** Only the register reads Notion, so this is the only path worth clearing. */
const PATH = "/roadmap";

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

  const offered =
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  if (offered !== secret) {
    return NextResponse.json(
      { revalidated: false, error: "Bad or missing bearer token." },
      { status: 401 }
    );
  }

  revalidatePath(PATH);
  return NextResponse.json({ revalidated: true, path: PATH });
}
