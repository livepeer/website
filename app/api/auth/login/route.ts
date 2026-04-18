import { NextRequest, NextResponse } from "next/server";
import { getPmtHouseClient, PmtHouseError } from "@/lib/pymthouse";
import {
  applySessionCookies,
  clearDeviceFlowCookie,
  readDeviceFlowFromRequest,
} from "@/lib/session";
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

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const provider = toProvider(body.provider);
    const profile = resolveLoginProfile({
      provider,
      email: typeof body.email === "string" ? body.email : undefined,
      name: typeof body.name === "string" ? body.name : undefined,
    });

    const client = getPmtHouseClient();
    const externalUserId = deriveExternalUserId(profile.email);

    await client.upsertAppUser({
      externalUserId,
      email: profile.email,
      status: "active",
    });

    const userToken = await client.mintUserAccessToken({
      externalUserId,
      scope: "sign:job",
    });

    const deviceFlow = await readDeviceFlowFromRequest(request);
    let redirectTo = "/studio";
    let deviceApproved = false;

    if (deviceFlow) {
      await client.completeDeviceApproval({
        userJwt: userToken.access_token,
        userCode: deviceFlow.userCode,
      });
      redirectTo = "/studio/device-approved";
      deviceApproved = true;
    }

    const response = NextResponse.json({
      success: true,
      redirectTo,
      deviceApproved,
      user: {
        name: profile.name,
        email: profile.email,
        initials: profile.initials,
        provider: profile.provider,
      },
    });

    await applySessionCookies(response, {
      externalUserId,
      email: profile.email,
      name: profile.name,
      initials: profile.initials,
      provider: profile.provider,
      pmthUserJwt: userToken.access_token,
    });

    if (deviceFlow) {
      clearDeviceFlowCookie(response);
    }

    return response;
  } catch (error) {
    console.error("Studio login failed", error);
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
        error: "login_failed",
        error_description:
          error instanceof Error ? error.message : "Unexpected login error",
      },
      { status: 500 },
    );
  }
}
