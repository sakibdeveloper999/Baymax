# App map implementation progress

Updated: 2026-10-09. The local `omnipos_app_map_v4_saas.html` is a dated source-based map, not proof of production readiness. It is ignored by Git and may not exist in another checkout.

## Implemented foundation

- [x] Express API with authentication, role checks, tenant access policy, validation, rate limiting, and structured errors.
- [x] Neon PostgreSQL connection through `pg`; 25 application tables, versioned SQL migrations, foreign keys, and unique constraints.
- [x] Fresh-database setup without importing MongoDB data. `seed` initializes plans only.
- [x] Transactional signup; checkout commits orders, stock logs, and customer balance changes together. Manual stock adjustments are transactional.
- [x] Parameterized queries, default password/cost exclusions, relation loading, and conflicting-write detection.
- [x] Store ownership resolution and store-scoped HTTP queries; composite foreign keys for applicable same-store relationships.
- [x] Shared subscription policy for login, refresh, token verification, and protected requests. Invalid/missing expiry and mismatched tenant claims are denied.
- [x] Password hashing with bcrypt cost 12 and insert-only Basic/Standard/Pro initialization.
- [x] Mounted auth, products, categories, stores, orders, customers, and suppliers routes.
- [x] Signed receipt tokens with a 30-day lifetime and a restricted public receipt response.
- [x] Account/store onboarding and API-backed POS, catalog, customers, suppliers, orders, inventory, and settings screens.
- [x] Scoped cart/held-order persistence and configured feature gates for the mounted business screens.

- [x] Socket.IO access-token authentication, tenant/store room authorization, single-store switching, expiry timers and periodic user/tenant/store revocation (30-second checks, 5-second timeout). See [contract and validation](backend/SOCKET_IO.md).

- [x] Active product/branch/user limits and reactivation checks in model saves, with tenant-row locks and transactional writes. Product creation and initial stock logs commit together. See [limit rules and validation scope](backend/PLAN_LIMITS.md); real multi-connection validation is configured in CI but not run locally.

- [x] Configured feature gates across mounted business APIs and screens, including barcode lookup and conditional customer/wallet checkout. Customer responses hide excluded wallet/loyalty data. See [feature access](backend/FEATURE_ACCESS.md).

## Remaining work

- [ ] Connect frontend realtime consumers and authorized business-event publishers; the access-control foundation is implemented.
- [ ] Replace Dashboard and Reports sample previews with tenant/store-scoped analytics APIs.
- [ ] Implement route groups and UI for purchases, transfers, returns, shifts, quotations, expenses, payroll, banking, vouchers, and other map modules.
- [ ] Define separate platform-administrator authorization. Tenant owners are not platform administrators.
- [ ] Implement payment-provider integration, refund/return accounting, and complete mixed-payment behavior.
- [ ] Implement offline queues scoped to tenant/user/store, replay idempotency, and conflict handling. Current POS requires the API.
- [ ] Complete translations, keyboard/accessibility work, physical printer verification, and packaged Electron testing.
- [ ] Implement and verify mobile delivery.

The map's request for explicit `tenantId` on each business record is still separate from the implemented store-based boundary. See [tenant scope](backend/TENANT_MIGRATION_PLAN.md).

## Evidence and scope

On 2026-10-09, the backend suite passed 70 tests with zero failures and one optional real-PostgreSQL concurrency group skipped. All 34 frontend tests and the production React build passed. Feature tests cover custom plans, missing/malformed configuration, denied requests without business mutations, role checks, and screen access. No live Neon verification was performed.

On 2026-10-03, the full backend suite passed 60 tests with zero failures; one optional real-PostgreSQL concurrency test group was skipped because local Docker was unavailable. Coverage includes 22 Socket.IO tests/subtests and new PGlite capacity/API checks. CI now provisions PostgreSQL for multi-connection quota tests; no CI result is claimed. No live Neon or frontend realtime verification was performed. The older [system report](SYSTEM_TEST_REPORT.md) contains historical claims and must not be treated as current validation. Automated tests include both mocked policy checks and isolated PostgreSQL integration; they do not establish production readiness, real multi-client concurrency, hardware compatibility, or complete app-map delivery.

The Neon schema was applied during the database conversion. No MongoDB ownership backfill was performed. Business-record counts are time-specific observations, not a permanent invariant of the running app.
