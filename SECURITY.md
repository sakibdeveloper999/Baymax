# Security policy and current controls

Updated: 2026-09-30.

## Reporting a vulnerability

Do not post credentials, database URLs, access/refresh tokens, signed receipt tokens, or customer records in public issues. If GitHub private vulnerability reporting is enabled for this repository, use it. Otherwise ask a maintainer for a private reporting channel without disclosing exploit details publicly.

Include the affected revision, affected flow, prerequisites, sanitized reproduction steps, and expected/actual behavior. No dedicated security email, response-time commitment, or supported-release policy is configured in this checkout. The package version `1.0.0` is not a claim of a security-certified release.

## Implemented controls

- Passwords are hashed with bcrypt cost 12. Passwords are excluded from default model queries.
- Access/refresh JWTs carry user and tenant identity. Authentication reloads the user/tenant, verifies tenant claims, and rejects inactive, suspended, expired, or invalid subscription states.
- `requireStore` resolves an active store belonging to the authenticated tenant before store-scoped routes run. PostgreSQL adds foreign keys, applicable same-store composite references, and unique constraints.
- SQL values use bound parameters; identifiers are validated against model metadata. Unsupported query operations fail explicitly.
- Checkout and manual stock changes are transactional. Conflicting saved-field updates return a conflict rather than silently overwriting changed values.
- Helmet, request validation, rate limiting, role checks, and feature gates are present.
- Public receipts require a 30-day HMAC-SHA256 token, validate its signature/age, use a restricted response, and set `Cache-Control: no-store`.
- Neon connections enforce certificate verification. Secrets belong in the ignored backend environment file, not frontend bundles.
- Electron uses `nodeIntegration: false`, `contextIsolation: true`, and `sandbox: true`. The preload exposes receipt printing rather than general Node access. Print output is escaped/inserted as text.

## Known gaps and deployment considerations

- Socket.io currently permits unauthenticated connections and unchecked store-room joins. Do not treat realtime store rooms as an authorization boundary.
- Tenant owners are application users, not global platform administrators. Separate platform-admin authorization remains undesigned.
- Plan usage-limit enforcement is incomplete, and feature checks are not uniformly applied to all related operations/screens.
- Browser tokens are stored in localStorage; a successful script injection could expose them. Automatic refresh-token retry, refresh-token rotation/revocation storage, and a complete session lifecycle are not implemented.
- Offline replay/idempotency and cross-session local queue isolation are incomplete. The active POS requires the API.
- Payment-method labels do not constitute gateway integration, payment verification, or refund processing.
- Default query exclusions are not proof that every protected response has been audited for sensitive fields. Review role-specific response data when extending endpoints.
- CORS falls back to `*` when no origins are configured, and the renderer CSP allows HTTPS/WSS destinations. Review both policies for the actual deployment rather than assuming least-privilege settings.
- Styling components do not establish an accessibility certification, and automated tests do not cover physical printers or installers.

## Configuration and verification

Use separate random `JWT_SECRET`, `JWT_REFRESH_SECRET`, and `QR_SECRET` values. Rotate any exposed credential. Keep Neon credentials exclusively on the backend. Replacing the application database does not revoke credentials in an old database service.

See [PostgreSQL setup](backend/POSTGRESQL_SETUP.md), [system verification](SYSTEM_TEST_REPORT.md), and [app-map progress](APP_MAP_PROGRESS.md). This document is based on inspected implementation and existing tests, not an independent security audit or production approval.
