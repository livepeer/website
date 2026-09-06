import { NextResponse } from "next/server";

import { getDiscord } from "@/lib/discord";

/**
 * livepeer.org/discord → the live invite. The one Discord URL the site owns,
 * for places that cannot fetch it themselves — markdown, Notion bodies, the
 * primer, the old /community-hub redirect. A temporary redirect, since the
 * destination is read from the server's widget and can change.
 */
export const revalidate = 3600;

export async function GET() {
  const { invite } = await getDiscord();
  return NextResponse.redirect(invite, 302);
}
