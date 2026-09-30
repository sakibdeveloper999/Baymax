# App map implementation progress

Updated: 2026-09-30. The local `omnipos_app_map_v4_saas.html` is a design reference, not proof of implementation. It is ignored by Git and may not exist in another checkout.

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
- [x] Scoped cart/held-order persistence and a frontend Suppliers plan gate.

## Remaining work

- [ ] Authenticate Socket.io connections, authorize room joins, and revoke expired/suspended access.
- [ ] Replace Dashboard and Reports sample previews with tenant/store-scoped analytics APIs.
- [ ] Implement route groups and UI for purchases, transfers, returns, shifts, quotations, expenses, payroll, banking, vouchers, and other map modules.
- [ ] Implement actual plan usage counting/enforcement, including concurrent creates. `checkLimit` currently only supplies configuration.
- [ ] Apply consistent feature gates across all relevant API operations and screens.
- [ ] Define separate platform-administrator authorization. Tenant owners are not platform administrators.
- [ ] Implement payment-provider integration, refund/return accounting, and complete mixed-payment behavior.
- [ ] Implement offline queues scoped to tenant/user/store, replay idempotency, and conflict handling. Current POS requires the API.
- [ ] Complete translations, keyboard/accessibility work, physical printer verification, and packaged Electron testing.
- [ ] Implement and verify mobile delivery.

The map's request for explicit `tenantId` on each business record is still separate from the implemented store-based boundary. See [tenant scope](backend/TENANT_MIGRATION_PLAN.md).

## Evidence and scope

See [system verification](SYSTEM_TEST_REPORT.md) for dated test/build results. Automated tests include both mocked policy checks and isolated PostgreSQL integration; they do not establish production readiness, real multi-client concurrency, hardware compatibility, or complete app-map delivery.

The Neon schema was applied during the database conversion. No MongoDB ownership backfill was performed. Business-record counts are time-specific observations, not a permanent invariant of the running app.
