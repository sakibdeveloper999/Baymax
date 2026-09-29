# App map implementation progress

Reference: `omnipos_app_map_v4_saas.html` (v4 SaaS map).
Updated: 2026-09-29.

## Completed in this continuation

- Shared tenant access policy for login, refresh, access-token authentication and subscription middleware.
- Explicit suspended and expired statuses block access even when the expiry date is in the future.
- Expiration is inclusive; missing or invalid expiry dates and unknown statuses fail closed.
- Access and refresh token tenant claims must match the user's current tenant.
- Login verifies the password before returning subscription details.
- New or changed passwords use bcrypt cost 12. Existing password hashes remain valid.
- Added regression coverage across login, refresh and protected access, including valid subscriptions and mismatched tenant claims.

Validation: backend `npm.cmd test` passes 29 tests; `git diff --check` passes.
Tests use mocked model access and do not verify a live MongoDB deployment.

## Remaining map gaps observed in this checkout

- Socket.io currently accepts unauthenticated connections and unchecked store-room joins. Authenticate connections, verify store ownership and revoke access when sessions/subscriptions expire or are suspended.
- Dashboard and Reports remain explicitly labeled sample previews. Implement scoped report APIs and connect these screens to real data with plan and role checks.
- Purchases, transfers, returns, shifts, accounting, payroll and other map modules have models but their route groups are not mounted in server.js.
- Global SaaS administration requires a separate platform-admin authorization design; tenant owners must not become global administrators.
- Offline sync and mobile delivery need implementation and verification against the map.

This is an incremental checklist, not a declaration that the full map is implemented.
No tenant ownership migration, plan changes or live database mutations were performed.
