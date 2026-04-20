import { getPmtHouseClient } from "@/lib/pymthouse/server";
import { PmtHouseError } from "@/lib/pymthouse/errors";
import type { SessionPayload } from "@/lib/session";

/**
 * Studio device flow only: upsert app user, mint user JWT, RFC 8693 device approval.
 * Not used for normal `/api/auth/login` (website stub session).
 */
export async function completeStudioDeviceApprovalWithPymthouse(params: {
  session: SessionPayload;
  userCode: string;
}): Promise<string> {
  if (
    !process.env.PYMTHOUSE_ISSUER_URL?.trim() ||
    !process.env.PYMTHOUSE_PUBLIC_CLIENT_ID?.trim() ||
    !process.env.PYMTHOUSE_M2M_CLIENT_ID?.trim() ||
    !process.env.PYMTHOUSE_M2M_CLIENT_SECRET?.trim()
  ) {
    throw new PmtHouseError(
      "Pymthouse is not configured. Set PYMTHOUSE_* environment variables.",
      { status: 503, code: "pymthouse_required" },
    );
  }

  const client = getPmtHouseClient();

  await client.upsertAppUser({
    externalUserId: params.session.externalUserId,
    email: params.session.email,
    status: "active",
  });

  const userToken = await client.mintUserAccessToken({
    externalUserId: params.session.externalUserId,
    scope: "sign:job",
  });

  await client.completeDeviceApproval({
    userJwt: userToken.access_token,
    userCode: params.userCode,
  });

  return userToken.access_token;
}
