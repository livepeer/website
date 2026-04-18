import { NextRequest, NextResponse } from "next/server";
import { getPmtHouseClient, PmtHouseError } from "@/lib/pymthouse";
import {
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
    const client = getPmtHouseClient();
    await client.completeDeviceApproval({
      userJwt: session.pmthUserJwt,
      userCode: deviceFlow.userCode,
    });

    const response = NextResponse.json({
      success: true,
      redirectTo: "/studio/device-approved",
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
