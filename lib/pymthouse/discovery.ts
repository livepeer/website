import type { FetchLike, OidcDiscoveryDocument } from "@/lib/pymthouse/types";
import { PmtHouseError } from "@/lib/pymthouse/errors";

const CACHE_TTL_MS = 5 * 60 * 1000;

type CacheEntry = {
  document: OidcDiscoveryDocument;
  fetchedAt: number;
};

const discoveryCache = new Map<string, CacheEntry>();

export async function fetchDiscoveryDocument(
  issuerUrl: string,
  fetchImpl: FetchLike,
): Promise<OidcDiscoveryDocument> {
  const normalizedIssuer = issuerUrl.replace(/\/+$/, "");
  const cached = discoveryCache.get(normalizedIssuer);
  const now = Date.now();

  if (cached && now - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.document;
  }

  const discoveryUrl =
    `${normalizedIssuer}/.well-known/openid-configuration`;

  const response = await fetchImpl(discoveryUrl, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new PmtHouseError(
      `Failed to load OIDC discovery (${response.status})`,
      {
        status: response.status,
        code: "oidc_discovery_failed",
      },
    );
  }

  const payload = (await response.json()) as Partial<OidcDiscoveryDocument>;

  if (!payload.issuer || !payload.token_endpoint || !payload.jwks_uri) {
    throw new PmtHouseError("OIDC discovery document is missing fields", {
      status: 500,
      code: "oidc_discovery_invalid",
      details: payload,
    });
  }

  const document: OidcDiscoveryDocument = {
    issuer: payload.issuer,
    authorization_endpoint: payload.authorization_endpoint ?? "",
    token_endpoint: payload.token_endpoint,
    jwks_uri: payload.jwks_uri,
    userinfo_endpoint: payload.userinfo_endpoint,
    device_authorization_endpoint: payload.device_authorization_endpoint,
  };

  discoveryCache.set(normalizedIssuer, { document, fetchedAt: now });
  return document;
}

export function clearDiscoveryCache(issuerUrl?: string): void {
  if (!issuerUrl) {
    discoveryCache.clear();
    return;
  }

  discoveryCache.delete(issuerUrl.replace(/\/+$/, ""));
}
