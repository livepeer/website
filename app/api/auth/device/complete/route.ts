import { NextRequest, NextResponse } from "next/server";
import { PmtHouseError } from "@pymthouse/builder-api";
import { completeStudioDeviceApprovalWithPymthouse } from "@/lib/pmth-studio-device-approval";
import {
  applySessionCookies,
  clearDeviceFlowCookie,
  readDeviceFlowFromRequest,
  readSessionFromRequest,
} from "@/lib/session";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const session = await readSessionFromRequest(request);
  if (!session) {
    return NextResponse.json(
      {
        error: "unauthorized",
      },
      { status: 401 },
    );
  }

  const deviceFlow = await readDeviceFlowFromRequest(request);
  if (!deviceFlow) {
    return NextResponse.json(
      {
        error: "no_pending_device_flow",
      },
      { status: 400 },
    );
  }

  try {
    const pmthUserJwt = await completeStudioDeviceApprovalWithPymthouse({
      session,
      userCode: deviceFlow.userCode,
    });

    const response = NextResponse.json({
      success: true,
      redirectTo: "/studio/device-approved",
    });

    await applySessionCookies(response, {
      externalUserId: session.externalUserId,
      email: session.email,
      name: session.name,
      initials: session.initials,
      provider: session.provider,
      pmthUserJwt,
      apiTokens: session.apiTokens,
    });

    clearDeviceFlowCookie(response);
    return response;
  } catch (error) {
    console.error("Device approval completion failed", error);
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
        error: "device_approval_failed",
        error_description:
          error instanceof Error ? error.message : "Unknown device approval error",
      },
      { status: 500 },
    );
  }
}
