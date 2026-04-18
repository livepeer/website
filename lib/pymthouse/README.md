# PmtHouse SDK Integration (Website)

This module provides a server-safe, SDK-style integration layer for PymtHouse in the `website` app. It is designed to be reusable, typed, and explicit about OAuth/OIDC boundaries.

The implementation follows the contracts in:

- [`pymthouse/docs/builder-api.md`](/home/elite/repos/pymthouse/docs/builder-api.md)
- [`pymthouse/docs/naap-oidc-integration.md`](/home/elite/repos/pymthouse/docs/naap-oidc-integration.md)
- [`pymthouse/docs/usage-api.md`](/home/elite/repos/pymthouse/docs/usage-api.md)

## Standards Alignment

The flow uses the same standards and grant types documented by PymtHouse:

- OAuth 2.0 (RFC 6749)
- Bearer token usage (RFC 6750)
- Device Authorization Grant (RFC 8628)
- Token Exchange (RFC 8693)
- Resource Indicators (RFC 8707)
- JWT access token profile (RFC 9068)

## Environment Configuration

Set the following in your runtime environment:

```bash
PYMTHOUSE_ISSUER_URL=http://localhost:3001/api/v1/oidc
PYMTHOUSE_PUBLIC_CLIENT_ID=app_...
PYMTHOUSE_M2M_CLIENT_ID=m2m_...
PYMTHOUSE_M2M_CLIENT_SECRET=pmth_cs_...
LP_SESSION_SECRET=<openssl rand -base64 32>
```

Notes:

- `PYMTHOUSE_PUBLIC_CLIENT_ID` is the `app_...` client used in Builder path tenancy (`/api/v1/apps/{clientId}/...`).
- `PYMTHOUSE_M2M_CLIENT_ID` / `PYMTHOUSE_M2M_CLIENT_SECRET` authenticate confidential server-to-server calls.

## Module Layout

- `client.ts`: Main `PmtHouseClient` class
- `discovery.ts`: OIDC discovery fetch + cache
- `errors.ts`: structured `PmtHouseError`
- `types.ts`: request/response types
- `format.ts`: wei formatting helpers
- `server.ts`: singleton factory (`getPmtHouseClient()`)

## Typical Usage

```ts
import { getPmtHouseClient } from "@/lib/pymthouse";

const client = getPmtHouseClient();
const discovery = await client.getDiscovery();
console.log(discovery.issuer);
```

## API Reference

### `getDiscovery()`

Fetches and caches `{issuer}/.well-known/openid-configuration`.

```ts
const metadata = await client.getDiscovery();
```

### `verifyIssuer(iss)`

Exact issuer match guard used for third-party initiate-login callbacks.

```ts
if (!client.verifyIssuer(issFromQuery)) {
  throw new Error("Issuer mismatch");
}
```

### `parseDeviceApprovalRedirect(searchParams)`

Parses and validates `iss` + `target_link_uri`, and extracts `user_code`/`client_id`.

```ts
const parsed = client.parseDeviceApprovalRedirect(request.nextUrl.searchParams);
// parsed.userCode -> normalized RFC 8628 user code
```

### `upsertAppUser({ externalUserId, email, status })`

Calls Builder API `POST /api/v1/apps/{clientId}/users`.

```ts
await client.upsertAppUser({
  externalUserId: "ext_abc123",
  email: "dev@example.com",
  status: "active",
});
```

### `mintUserAccessToken({ externalUserId, scope })`

Calls Builder API `POST /api/v1/apps/{clientId}/users/{externalUserId}/token`.

```ts
const userToken = await client.mintUserAccessToken({
  externalUserId: "ext_abc123",
  scope: "sign:job",
});
```

### `completeDeviceApproval({ userJwt, userCode })`

Completes NaaP Option B device approval via RFC 8693:

`POST {issuer}/token` with `resource=urn:pmth:device_code:<user_code>`.

```ts
await client.completeDeviceApproval({
  userJwt: userToken.access_token,
  userCode: "ABCD-EFGH",
});
```

### `exchangeForSignerSession({ userJwt })`

Performs RFC 8693 gateway token exchange to obtain a `pmth_...` session token.

```ts
const signer = await client.exchangeForSignerSession({
  userJwt: userToken.access_token,
});
```

### `createSignerSessionToken({ userJwt })`

Production-safe helper used by the website token endpoint:

1. First attempts user-JWT exchange.
2. Falls back to `client_credentials` + gateway exchange when server policy rejects user-JWT exchange for this client pairing.

```ts
const signer = await client.createSignerSessionToken({
  userJwt: session.pmthUserJwt,
});
```

### `getUsage({ startDate, endDate, groupBy, userId })`

Calls Usage API with Basic auth and returns typed totals/by-user payload.

```ts
const usage = await client.getUsage({
  startDate: "2026-01-01T00:00:00.000Z",
  endDate: "2026-01-31T23:59:59.999Z",
  groupBy: "user",
});
```

## NaaP Option B Flow in Website

The website follows this contract:

1. Browser lands on `/api/auth/initiate-login` with `iss` and `target_link_uri`.
2. Website validates issuer and target link.
3. If user is not signed in, website stores a short-lived device-flow cookie and redirects to `/studio/login?flow=device`.
4. On login, website:
   - upserts app user,
   - mints user JWT via Builder API,
   - completes RFC 8693 device approval.
5. Browser is redirected to `/studio/device-approved` while the CLI continues polling.

## Error Taxonomy

`PmtHouseError` includes:

- `status`: HTTP status from the upstream failure surface
- `code`: normalized machine code (for example, `invalid_client`, `invalid_scope`, `invalid_grant`, `invalid_target`)
- `details`: original upstream response payload when available

Use route handlers to pass through these fields without leaking secrets.

## Security Boundaries

- Keep `m2m` secret server-side only; never expose in client bundles.
- Keep long-lived user JWTs in httpOnly signed session cookie (`lp_session`).
- Use short-lived browser JWT (`lp_browser_jwt`) for browser-readable claims.
- Validate `iss` and `target_link_uri` strictly for third-party initiate-login.
- Normalize and validate RFC 8628 `user_code` before token exchange.

## Key Design Decisions and Trade-offs

1. **Framework-agnostic core client**: easier extraction into a standalone package later.
2. **Discovery-first endpoints**: avoids hard-coded token endpoint drift.
3. **Session metadata for token list**: no remote list/revoke API requirement; supports current UI quickly.
4. **Gateway exchange fallback path**: maintains `pmth_` token UX even when user-JWT exchange is constrained by current server policy.
5. **BigInt-safe fee handling**: wire `wei` as strings until render-time formatting.

## Implementation Tasks

- Confirm all required env vars are present in deployment targets.
- Verify device flow end-to-end from `python-gateway` to `/studio/device-approved`.
- Validate that `/api/tokens` emits real `pmth_` values in your environment.
- Validate `/api/usage` values against known rows in PymtHouse for at least one date range.
- Add persistent token metadata storage (DB) if cross-device visibility is required.
