import { NextRequest, NextResponse } from "next/server";
import { getPmtHouseClient } from "@/lib/pymthouse";
import { completeStudioDeviceApprovalWithPymthouse } from "@/lib/pymthouse/complete-studio-device-approval";
import {
  applySessionCookies,
  clearDeviceFlowCookie,
  readSessionFromRequest,
  setDeviceFlowCookie,
} from "@/lib/session";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const client = getPmtHouseClient();
    const parsed = client.parseDeviceApprovalRedirect(request.nextUrl.searchParams);
    const session = await readSessionFromRequest(request);

    if (!session) {
      const loginUrl = new URL("/studio/login", request.url);
      loginUrl.searchParams.set("flow", "device");
      const response = NextResponse.redirect(loginUrl);
      await setDeviceFlowCookie(response, {
        iss: parsed.issuer,
        targetLinkUri: parsed.targetLinkUri,
        userCode: parsed.userCode,
        clientId: parsed.clientId,
      });
      return response;
    }

    const pmthUserJwt = await completeStudioDeviceApprovalWithPymthouse({
      session,
      userCode: parsed.userCode,
    });

    const approvedUrl = new URL("/studio/device-approved", request.url);
    const response = NextResponse.redirect(approvedUrl);
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
    console.error("Device initiate-login failed", error);
    const loginUrl = new URL("/studio/login", request.url);
    loginUrl.searchParams.set("error", "device_init_failed");
    return NextResponse.redirect(loginUrl);
  }
}
