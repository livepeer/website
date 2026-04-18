import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getPmtHouseClient, PmtHouseError } from "@/lib/pymthouse";
import {
  applySessionCookies,
  readSessionFromRequest,
  type StoredApiTokenMeta,
  upsertApiTokenMeta,
} from "@/lib/session";

export const runtime = "nodejs";

function makeTokenPrefix(token: string): string {
  if (!token) return "pmth_";
  return `${token.slice(0, 12)}${"*".repeat(12)}`;
}

export async function GET(request: NextRequest) {
  const session = await readSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    tokens: session.apiTokens,
  });
}

export async function POST(request: NextRequest) {
  const session = await readSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const requestedName =
      typeof body.name === "string" && body.name.trim()
        ? body.name.trim()
        : "Token";

    const client = getPmtHouseClient();
    const tokenResponse = await client.createSignerSessionToken({
      userJwt: session.pmthUserJwt,
    });

    const metadata: StoredApiTokenMeta = {
      id: randomUUID(),
      name: requestedName,
      prefix: makeTokenPrefix(tokenResponse.access_token),
      createdAt: new Date().toISOString(),
      lastUsedAt: null,
      status: "active",
    };
    const updatedApiTokens = upsertApiTokenMeta(session, metadata);

    const response = NextResponse.json({
      id: metadata.id,
      name: metadata.name,
      token: tokenResponse.access_token,
      prefix: metadata.prefix,
      createdAt: metadata.createdAt,
      expiresIn: tokenResponse.expires_in,
      scope: tokenResponse.scope,
      issuedTokenType: tokenResponse.issued_token_type,
      message: "Store this token securely. It will not be shown again.",
    });

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
  } catch (error) {
    console.error("Token creation failed", error);
    if (error instanceof PmtHouseError) {
      return NextResponse.json(
        {
          error: error.code,
          error_description: error.message,
        },
        { status: error.status },
      );
    }

    return NextResponse.json(
      {
        error: "token_creation_failed",
        error_description:
          error instanceof Error ? error.message : "Failed to create token",
      },
      { status: 500 },
    );
  }
}
