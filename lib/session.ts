import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import type { NextRequest, NextResponse } from "next/server";

export const SESSION_COOKIE_NAME = "lp_session";
export const SESSION_USER_COOKIE_NAME = "lp_session_user";
export const BROWSER_JWT_COOKIE_NAME = "lp_browser_jwt";
export const DEVICE_FLOW_COOKIE_NAME = "lp_device_flow";

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
const BROWSER_JWT_TTL_SECONDS = 60 * 15;
const DEVICE_FLOW_TTL_SECONDS = 60 * 10;

type StudioAuthProvider = "github" | "google" | "email";

export type StoredApiTokenMeta = {
  id: string;
  name: string;
  prefix: string;
  createdAt: string;
  lastUsedAt: string | null;
  status: "active" | "revoked";
};

export interface SessionPayload extends JWTPayload {
  sub: string;
  externalUserId: string;
  email: string;
  name: string;
  initials: string;
  provider: StudioAuthProvider;
  pmthUserJwt: string;
  apiTokens: StoredApiTokenMeta[];
}

export interface SessionPublicUser {
  externalUserId: string;
  email: string;
  name: string;
  initials: string;
  provider: StudioAuthProvider;
  hasPmthouseBinding: boolean;
}

export interface IssueSessionInput {
  externalUserId: string;
  email: string;
  name: string;
  initials: string;
  provider: StudioAuthProvider;
  pmthUserJwt: string;
  apiTokens?: StoredApiTokenMeta[];
}

export interface DeviceFlowPayload extends JWTPayload {
  iss: string;
  targetLinkUri: string;
  userCode: string;
  clientId: string;
}

function getSessionSecret(): Uint8Array {
  const raw = process.env.LP_SESSION_SECRET;
  if (raw && raw.trim()) {
    return new TextEncoder().encode(raw.trim());
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("LP_SESSION_SECRET is required in production");
  }

  return new TextEncoder().encode("dev-only-unsafe-session-secret");
}

async function signJwt(
  payload: JWTPayload,
  expiresInSeconds: number,
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt(now)
    .setExpirationTime(now + expiresInSeconds)
    .sign(getSessionSecret());
}

export async function createSessionToken(
  input: IssueSessionInput,
): Promise<string> {
  const payload: SessionPayload = {
    sub: input.externalUserId,
    externalUserId: input.externalUserId,
    email: input.email,
    name: input.name,
    initials: input.initials,
    provider: input.provider,
    pmthUserJwt: input.pmthUserJwt,
    apiTokens: input.apiTokens ?? [],
  };
  return signJwt(payload, SESSION_TTL_SECONDS);
}

export async function createBrowserJwt(
  payload: SessionPublicUser,
): Promise<string> {
  return signJwt(
    {
      sub: payload.externalUserId,
      email: payload.email,
      name: payload.name,
      initials: payload.initials,
      provider: payload.provider,
      hasPmthouseBinding: payload.hasPmthouseBinding,
      aud: "studio-browser",
    },
    BROWSER_JWT_TTL_SECONDS,
  );
}

export async function verifySessionToken(
  token: string,
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSessionSecret(), {
      algorithms: ["HS256"],
    });
    if (
      typeof payload.sub !== "string" ||
      typeof payload.externalUserId !== "string" ||
      typeof payload.pmthUserJwt !== "string"
    ) {
      return null;
    }

    return {
      ...payload,
      sub: payload.sub,
      externalUserId: payload.externalUserId,
      email: String(payload.email ?? ""),
      name: String(payload.name ?? ""),
      initials: String(payload.initials ?? ""),
      provider: (payload.provider as StudioAuthProvider) ?? "email",
      pmthUserJwt: payload.pmthUserJwt,
      apiTokens: Array.isArray(payload.apiTokens)
        ? (payload.apiTokens as StoredApiTokenMeta[])
        : [],
    };
  } catch {
    return null;
  }
}

export async function createDeviceFlowToken(
  payload: Omit<DeviceFlowPayload, "iat" | "exp">,
): Promise<string> {
  return signJwt(payload, DEVICE_FLOW_TTL_SECONDS);
}

export async function verifyDeviceFlowToken(
  token: string,
): Promise<DeviceFlowPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSessionSecret(), {
      algorithms: ["HS256"],
    });
    if (
      typeof payload.iss !== "string" ||
      typeof payload.targetLinkUri !== "string" ||
      typeof payload.userCode !== "string" ||
      typeof payload.clientId !== "string"
    ) {
      return null;
    }

    return {
      ...payload,
      iss: payload.iss,
      targetLinkUri: payload.targetLinkUri,
      userCode: payload.userCode,
      clientId: payload.clientId,
    };
  } catch {
    return null;
  }
}

export async function readSessionFromRequest(
  request: NextRequest,
): Promise<SessionPayload | null> {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }
  return verifySessionToken(token);
}

export async function readDeviceFlowFromRequest(
  request: NextRequest,
): Promise<DeviceFlowPayload | null> {
  const token = request.cookies.get(DEVICE_FLOW_COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }
  return verifyDeviceFlowToken(token);
}

export function toSessionPublicUser(payload: SessionPayload): SessionPublicUser {
  return {
    externalUserId: payload.externalUserId,
    email: payload.email,
    name: payload.name,
    initials: payload.initials,
    provider: payload.provider,
    hasPmthouseBinding: Boolean(payload.pmthUserJwt),
  };
}

export async function applySessionCookies(
  response: NextResponse,
  input: IssueSessionInput,
): Promise<void> {
  const sessionToken = await createSessionToken(input);
  const publicUser = toSessionPublicUser({
    ...input,
    sub: input.externalUserId,
    apiTokens: input.apiTokens ?? [],
  });
  const browserJwt = await createBrowserJwt(publicUser);

  const secure = process.env.NODE_ENV === "production";
  response.cookies.set(SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
  response.cookies.set(
    SESSION_USER_COOKIE_NAME,
    Buffer.from(JSON.stringify(publicUser), "utf-8").toString("base64"),
    {
    httpOnly: false,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
    },
  );
  response.cookies.set(BROWSER_JWT_COOKIE_NAME, browserJwt, {
    httpOnly: false,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: BROWSER_JWT_TTL_SECONDS,
  });
}

export function clearSessionCookies(response: NextResponse): void {
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  response.cookies.set(SESSION_USER_COOKIE_NAME, "", {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  response.cookies.set(BROWSER_JWT_COOKIE_NAME, "", {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  clearDeviceFlowCookie(response);
}

export async function setDeviceFlowCookie(
  response: NextResponse,
  payload: Omit<DeviceFlowPayload, "iat" | "exp">,
): Promise<void> {
  const token = await createDeviceFlowToken(payload);
  response.cookies.set(DEVICE_FLOW_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: DEVICE_FLOW_TTL_SECONDS,
  });
}

export function clearDeviceFlowCookie(response: NextResponse): void {
  response.cookies.set(DEVICE_FLOW_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export function upsertApiTokenMeta(
  payload: SessionPayload,
  token: StoredApiTokenMeta,
): StoredApiTokenMeta[] {
  const filtered = payload.apiTokens.filter((item) => item.id !== token.id);
  return [...filtered, token];
}

export function revokeApiTokenMeta(
  payload: SessionPayload,
  tokenId: string,
): StoredApiTokenMeta[] {
  return payload.apiTokens.map((item) =>
    item.id === tokenId
      ? {
          ...item,
          status: "revoked",
        }
      : item,
  );
}
