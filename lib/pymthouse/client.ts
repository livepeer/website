import { fetchDiscoveryDocument } from "@/lib/pymthouse/discovery";
import { PmtHouseError } from "@/lib/pymthouse/errors";
import type {
  AppUserRecord,
  ClientCredentialsTokenResponse,
  DeviceApprovalInput,
  FetchLike,
  MintUserAccessTokenInput,
  MintUserAccessTokenResponse,
  OidcDiscoveryDocument,
  ParsedDeviceApprovalRedirect,
  PmtHouseClientOptions,
  TokenExchangeResponse,
  UpsertAppUserInput,
  UsageApiResponse,
  UsageQueryInput,
} from "@/lib/pymthouse/types";

const TOKEN_EXCHANGE_GRANT = "urn:ietf:params:oauth:grant-type:token-exchange";
const SUBJECT_ACCESS_TOKEN_TYPE =
  "urn:ietf:params:oauth:token-type:access_token";
const DEVICE_RESOURCE_PREFIX = "urn:pmth:device_code:";

export class PmtHouseClient {
  private readonly issuerUrl: string;
  private readonly publicClientId: string;
  private readonly m2mClientId: string;
  private readonly m2mClientSecret: string;
  private readonly fetchImpl: FetchLike;
  private readonly logger?: PmtHouseClientOptions["logger"];

  constructor(options: PmtHouseClientOptions) {
    this.issuerUrl = options.issuerUrl.replace(/\/+$/, "");
    this.publicClientId = options.publicClientId;
    this.m2mClientId = options.m2mClientId;
    this.m2mClientSecret = options.m2mClientSecret;
    this.fetchImpl = options.fetch ?? fetch;
    this.logger = options.logger;
  }

  async getDiscovery(): Promise<OidcDiscoveryDocument> {
    return fetchDiscoveryDocument(this.issuerUrl, this.fetchImpl);
  }

  verifyIssuer(iss: string): boolean {
    const candidate = iss.trim().replace(/\/+$/, "");
    return candidate === this.issuerUrl;
  }

  parseDeviceApprovalRedirect(
    searchParams: URLSearchParams,
  ): ParsedDeviceApprovalRedirect {
    const issuer = searchParams.get("iss")?.trim() ?? "";
    const targetLinkUri = searchParams.get("target_link_uri")?.trim() ?? "";

    if (!issuer || !targetLinkUri) {
      throw new PmtHouseError("Missing iss or target_link_uri", {
        status: 400,
        code: "invalid_request",
      });
    }

    if (!this.verifyIssuer(issuer)) {
      throw new PmtHouseError("Issuer mismatch for initiate login", {
        status: 400,
        code: "invalid_issuer",
      });
    }

    let targetUrl: URL;
    try {
      targetUrl = new URL(targetLinkUri);
    } catch {
      throw new PmtHouseError("target_link_uri is not a valid URL", {
        status: 400,
        code: "invalid_target",
      });
    }

    const issuerOrigin = new URL(this.issuerUrl).origin;
    if (targetUrl.origin !== issuerOrigin || targetUrl.pathname !== "/oidc/device") {
      throw new PmtHouseError("target_link_uri does not point to the issuer device path", {
        status: 400,
        code: "invalid_target",
      });
    }

    const userCode = this.normalizeUserCode(
      targetUrl.searchParams.get("user_code") ?? "",
    );
    const clientId = targetUrl.searchParams.get("client_id")?.trim() ?? "";

    if (!userCode || !clientId) {
      throw new PmtHouseError("target_link_uri is missing user_code or client_id", {
        status: 400,
        code: "invalid_target",
      });
    }

    return {
      issuer,
      targetLinkUri,
      userCode,
      clientId,
    };
  }

  async listAppUsers(): Promise<{ users: AppUserRecord[] }> {
    const url = `${this.getAppsBaseUrl()}/users`;
    return this.requestJson<{ users: AppUserRecord[] }>(url, {
      method: "GET",
      headers: this.builderHeaders(),
      cache: "no-store",
    });
  }

  async upsertAppUser(input: UpsertAppUserInput): Promise<AppUserRecord> {
    const payload: Record<string, unknown> = {
      externalUserId: input.externalUserId,
    };
    if (input.email) payload.email = input.email;
    if (input.status) payload.status = input.status;

    const url = `${this.getAppsBaseUrl()}/users`;
    return this.requestJson<AppUserRecord>(url, {
      method: "POST",
      headers: this.builderHeaders(),
      body: JSON.stringify(payload),
      cache: "no-store",
    });
  }

  async deleteAppUser(params: { externalUserId: string }): Promise<{ success: boolean }> {
    const url = new URL(`${this.getAppsBaseUrl()}/users`);
    url.searchParams.set("externalUserId", params.externalUserId);
    return this.requestJson<{ success: boolean }>(url.toString(), {
      method: "DELETE",
      headers: this.builderHeaders(),
      cache: "no-store",
    });
  }

  async mintUserAccessToken(
    input: MintUserAccessTokenInput,
  ): Promise<MintUserAccessTokenResponse> {
    const url = `${this.getAppsBaseUrl()}/users/${encodeURIComponent(input.externalUserId)}/token`;
    const body = input.scope ? { scope: input.scope } : {};

    return this.requestJson<MintUserAccessTokenResponse>(url, {
      method: "POST",
      headers: this.builderHeaders(),
      body: JSON.stringify(body),
      cache: "no-store",
    });
  }

  async completeDeviceApproval(
    input: DeviceApprovalInput,
  ): Promise<TokenExchangeResponse> {
    const discovery = await this.getDiscovery();
    const form = new URLSearchParams();
    form.set("grant_type", TOKEN_EXCHANGE_GRANT);
    form.set("subject_token", input.userJwt);
    form.set("subject_token_type", SUBJECT_ACCESS_TOKEN_TYPE);
    form.set(
      "resource",
      `${DEVICE_RESOURCE_PREFIX}${this.normalizeUserCode(input.userCode)}`,
    );

    return this.requestJson<TokenExchangeResponse>(discovery.token_endpoint, {
      method: "POST",
      headers: this.oidcFormHeaders(),
      body: form.toString(),
      cache: "no-store",
    });
  }

  async issueMachineAccessToken(
    scope = "sign:job",
  ): Promise<ClientCredentialsTokenResponse> {
    const discovery = await this.getDiscovery();
    const form = new URLSearchParams();
    form.set("grant_type", "client_credentials");
    form.set("scope", scope);

    return this.requestJson<ClientCredentialsTokenResponse>(discovery.token_endpoint, {
      method: "POST",
      headers: this.oidcFormHeaders(),
      body: form.toString(),
      cache: "no-store",
    });
  }

  async exchangeForSignerSession(input: {
    userJwt: string;
  }): Promise<TokenExchangeResponse> {
    const discovery = await this.getDiscovery();
    const form = new URLSearchParams();
    form.set("grant_type", TOKEN_EXCHANGE_GRANT);
    form.set("subject_token", input.userJwt);
    form.set("subject_token_type", SUBJECT_ACCESS_TOKEN_TYPE);
    form.set("scope", "sign:job");

    return this.requestJson<TokenExchangeResponse>(discovery.token_endpoint, {
      method: "POST",
      headers: this.oidcFormHeaders(),
      body: form.toString(),
      cache: "no-store",
    });
  }

  async createSignerSessionToken(params: {
    userJwt?: string;
  }): Promise<TokenExchangeResponse> {
    if (params.userJwt) {
      try {
        return await this.exchangeForSignerSession({ userJwt: params.userJwt });
      } catch (error) {
        const err = this.asError(error);
        this.logger?.warn?.("User JWT exchange failed, falling back to machine exchange", {
          code: err.code,
          status: err.status,
        });
      }
    }

    const machineToken = await this.issueMachineAccessToken("sign:job");
    if (!machineToken.access_token) {
      throw new PmtHouseError("Client credentials flow did not return access_token", {
        status: 502,
        code: "invalid_token_response",
      });
    }

    return this.exchangeForSignerSession({ userJwt: machineToken.access_token });
  }

  async getUsage(input: UsageQueryInput = {}): Promise<UsageApiResponse> {
    const url = new URL(`${this.getAppsBaseUrl()}/usage`);
    if (input.startDate) url.searchParams.set("startDate", input.startDate);
    if (input.endDate) url.searchParams.set("endDate", input.endDate);
    if (input.groupBy) url.searchParams.set("groupBy", input.groupBy);
    if (input.userId) url.searchParams.set("userId", input.userId);

    return this.requestJson<UsageApiResponse>(url.toString(), {
      method: "GET",
      headers: this.builderHeaders(),
      cache: "no-store",
    });
  }

  private normalizeUserCode(value: string): string {
    return value
      .replace(/[a-z]/g, (char) => char.toUpperCase())
      .replace(/\W/g, "");
  }

  private getAppsBaseUrl(): string {
    return `${this.getIssuerOrigin()}/api/v1/apps/${encodeURIComponent(this.publicClientId)}`;
  }

  private getIssuerOrigin(): string {
    return new URL(this.issuerUrl).origin;
  }

  private builderHeaders(): HeadersInit {
    return {
      Authorization: this.basicAuthorizationHeader(),
      "Content-Type": "application/json",
      Accept: "application/json",
    };
  }

  private oidcFormHeaders(): HeadersInit {
    return {
      Authorization: this.basicAuthorizationHeader(),
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    };
  }

  private basicAuthorizationHeader(): string {
    const raw = `${this.m2mClientId}:${this.m2mClientSecret}`;
    return `Basic ${Buffer.from(raw).toString("base64")}`;
  }

  private async requestJson<T>(
    url: string,
    init: RequestInit,
  ): Promise<T> {
    this.logger?.debug?.("PmtHouse request", {
      method: init.method ?? "GET",
      url,
    });

    const response = await this.fetchImpl(url, init);
    const raw = await response.text();
    const parsed = raw ? this.safeParseJson(raw) : null;

    if (!response.ok) {
      const details = (parsed ?? {}) as Record<string, unknown>;
      const description =
        typeof details.error_description === "string"
          ? details.error_description
          : typeof details.error === "string"
            ? details.error
            : `Request failed (${response.status})`;

      throw new PmtHouseError(description, {
        status: response.status,
        code:
          typeof details.error === "string"
            ? details.error
            : "pymthouse_http_error",
        details,
      });
    }

    if (!parsed) {
      return {} as T;
    }

    return parsed as T;
  }

  private safeParseJson(value: string): unknown {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }

  private asError(error: unknown): PmtHouseError {
    if (error instanceof PmtHouseError) {
      return error;
    }

    if (error instanceof Error) {
      return new PmtHouseError(error.message, {
        code: "unexpected_error",
        status: 500,
      });
    }

    return new PmtHouseError("Unexpected error", {
      code: "unexpected_error",
      status: 500,
    });
  }
}
