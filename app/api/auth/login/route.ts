import { NextRequest, NextResponse } from "next/server";
import { applySessionCookies } from "@/lib/session";
import {
  deriveExternalUserId,
  resolveLoginProfile,
  type StudioAuthProvider,
} from "@/lib/studio-auth";

export const runtime = "nodejs";

function toProvider(value: unknown): StudioAuthProvider {
  if (value === "github" || value === "google" || value === "email") {
    return value;
  }
  return "email";
}

/**
 * Studio sign-in: website-only stub session. No Pymthouse.
 * Device approval uses Pymthouse only from `/api/auth/device/complete` or
 * `GET /api/auth/initiate-login` when a session already exists.
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const provider = toProvider(body.provider);
    const profile = resolveLoginProfile({
      provider,
      email: typeof body.email === "string" ? body.email : undefined,
      name: typeof body.name === "string" ? body.name : undefined,
    });

    const externalUserId = deriveExternalUserId(profile.email);

    const userPayload = {
      name: profile.name,
      email: profile.email,
      initials: profile.initials,
      provider: profile.provider,
    };

    const response = NextResponse.json({
      success: true,
      redirectTo: "/studio",
      deviceApproved: false,
      user: userPayload,
    });

    await applySessionCookies(response, {
      externalUserId,
      email: profile.email,
      name: profile.name,
      initials: profile.initials,
      provider: profile.provider,
      pmthUserJwt: "",
    });

    return response;
  } catch (error) {
    console.error("Studio login failed", error);
    return NextResponse.json(
      {
        error: "login_failed",
        error_description:
          error instanceof Error ? error.message : "Unexpected login error",
      },
      { status: 500 },
    );
  }
}
