# Security Policy

The Livepeer Foundation takes the security of the network and the services
it operates seriously. This document tells you where to report a
vulnerability and what to expect.

> Full disclosure policy, scope, eligibility, and safe harbor:
> **<https://livepeer.org/security>** (overview)
> **<https://livepeer.org/security/non-protocol/policy>** (binding Vulnerability Disclosure Policy for non-protocol issues)

## Reporting a vulnerability

Route your report based on **what is affected**:

### Smart contract / on-chain protocol issues

Use the Immunefi bug bounty program. Cash rewards are paid out per the
program's severity classification.

- <https://immunefi.com/bug-bounty/livepeer/>

Before submitting, review the program's **Scope & Impacts** page —
both the in-scope assets and the list of already-known issues live there.
Reports that match a known issue will be closed via Immunefi's
known-issue close flow.

- <https://immunefi.com/bug-bounty/livepeer/scope/#impacts>

### Websites, explorer, and other Foundation-operated apps

Email **<security@livepeer.foundation>**.

This covers livepeer.org, explorer.livepeer.org, and other public apps
operated by the Livepeer Foundation. This channel is an informal,
discretionary program; valid reports are acknowledged publicly with the
researcher's consent.

Please **do not** open public GitHub issues for suspected vulnerabilities.

## Scope and out-of-scope

See the scope sections on <https://livepeer.org/security/non-protocol>.

Out of scope for this program:

- Smart contracts and on-chain protocol — use Immunefi.
- Livepeer Inc-operated services (e.g., `livepeer.studio`) — contact
  <security@livepeer.org> (a separate entity).
- Findings from automated scanners or AI tools without manual validation
  and a working proof of concept.
- Social engineering, DoS / volumetric attacks, theoretical issues,
  hardening recommendations without demonstrated impact, and duplicates
  of already-reported issues.

## Safe harbor

The Foundation will not pursue legal action against good-faith security
research conducted within the scope and rules of this policy. Full safe
harbor language: <https://livepeer.org/security/non-protocol/policy>.

## Machine-readable disclosure

- RFC 9116: <https://livepeer.org/.well-known/security.txt>
