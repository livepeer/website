import { NextRequest, NextResponse } from "next/server";
import {
  applySessionCookies,
  readSessionFromRequest,
  revokeApiTokenMeta,
} from "@/lib/session";

export const runtime = "nodejs";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await readSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const exists = session.apiTokens.some((token) => token.id === id);
  if (!exists) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const updatedApiTokens = revokeApiTokenMeta(session, id);

  const response = NextResponse.json({ success: true });
  await applySessionCookies(response, {
    externalUserId: session.externalUserId,
    email: session.email,
    name: session.name,
    initials: session.initials,
    provider: session.provider,
    pmthUserJwt: session.pmthUserJwt,
    apiTokens: updatedApiTokens,
  });
  return response;
}
