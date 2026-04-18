import { NextRequest, NextResponse } from "next/server";
import {
  BROWSER_JWT_COOKIE_NAME,
  readSessionFromRequest,
  toSessionPublicUser,
} from "@/lib/session";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const session = await readSessionFromRequest(request);
  if (!session) {
    return NextResponse.json(
      {
        authenticated: false,
      },
      { status: 401 },
    );
  }

  const browserJwt = request.cookies.get(BROWSER_JWT_COOKIE_NAME)?.value ?? null;
  return NextResponse.json({
    authenticated: true,
    user: toSessionPublicUser(session),
    browserJwt,
  });
}
