export type FetchLike = (
  input: string | URL | Request,
  init?: RequestInit,
) => Promise<Response>;

export interface OidcDiscoveryDocument {
  issuer: string;
  authorization_endpoint: string;
  token_endpoint: string;
  jwks_uri: string;
  userinfo_endpoint?: string;
  device_authorization_endpoint?: string;
}

export interface PmtHouseClientOptions {
  issuerUrl: string;
  publicClientId: string;
  m2mClientId: string;
  m2mClientSecret: string;
  fetch?: FetchLike;
  logger?: {
    debug?: (message: string, details?: Record<string, unknown>) => void;
    warn?: (message: string, details?: Record<string, unknown>) => void;
  };
}

export interface UpsertAppUserInput {
  externalUserId: string;
  email?: string;
  status?: "active" | "inactive";
}

export interface AppUserRecord {
  id: string;
  clientId: string;
  externalUserId: string;
  email: string | null;
  status: string;
  role: string;
  createdAt: string;
}

export interface MintUserAccessTokenInput {
  externalUserId: string;
  scope?: string;
}

export interface MintUserAccessTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: "Bearer";
  expires_in: number;
  scope: string;
  subject_type: "app_user";
  correlation_id?: string;
}

export interface DeviceApprovalInput {
  userJwt: string;
  userCode: string;
}

export interface TokenExchangeResponse {
  access_token: string;
  token_type: "Bearer";
  expires_in: number;
  scope: string;
  issued_token_type: string;
}

export interface UsageQueryInput {
  startDate?: string;
  endDate?: string;
  groupBy?: "none" | "user";
  userId?: string;
}

export interface UsageTotals {
  requestCount: number;
  totalFeeWei: string;
}

export interface UsageByUserRow {
  endUserId: string;
  externalUserId: string | null;
  requestCount: number;
  feeWei: string;
  userType?: "system_managed" | "oidc_authorized" | "unknown";
  identifier?: string;
}

export interface UsageApiResponse {
  clientId: string;
  period: {
    start: string | null;
    end: string | null;
  };
  totals: UsageTotals;
  byUser?: UsageByUserRow[];
}

export interface ClientCredentialsTokenResponse {
  access_token: string;
  token_type: "Bearer";
  expires_in?: number;
  scope?: string;
  [key: string]: unknown;
}

export interface ParsedDeviceApprovalRedirect {
  issuer: string;
  targetLinkUri: string;
  userCode: string;
  clientId: string;
}
