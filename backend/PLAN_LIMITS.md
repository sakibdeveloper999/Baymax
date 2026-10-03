# Subscription capacity limits

Updated: 2026-10-03.

Product, Store and User saves now enforce the current tenant plan inside a PostgreSQL transaction. The old configuration-only checkLimit middleware has been removed.

## Counting rules

- products: active products across every store owned by the tenant, including disabled stores.
- branches: active stores owned by the tenant.
- users: active users in the tenant, including the owner created during signup.
- Deactivation frees capacity for that resource. Reactivation consumes capacity and is checked again.
- Ordinary edits remain available when a tenant is already over its limit after a downgrade. No records are deleted automatically.
- Zero permits no active records. Only the integer -1 means unlimited. Missing plans/keys, null, strings, fractions and other negative values fail closed.
- Model create, save and insertMany paths are covered. The insert-only updateOne shortcut is prohibited for these three models.
- Existing record ownership cannot be changed through generic saves. A dedicated, reviewed ownership migration is required; this task did not move records or change tenant ownership.

There is still no staff-management API/UI. The shared User save path protects signup and future model-based staff creation; adding an endpoint must still implement roles, feature access and input validation. Limits count active records, not stock quantities or lifetime orders.

## Transaction boundary

The guard resolves the owning tenant from the record (through Store for products), acquires a tenant-row FOR NO KEY UPDATE lock, reloads subscription status and locks the current plan for reading. It then counts usage and writes within the same transaction. Competing writers for that tenant wait before counting.

Application transactions explicitly use READ COMMITTED so a writer that waited sees earlier committed inserts in its subsequent count. The tenant lock applies across API processes, not just one Node process. Existing transactions are reused; supplied sessions must already be in a transaction.

Product creation and its initial StockLog now commit together. Failures roll back without consuming capacity. Signup also rolls back its tenant/owner/subscription-log transaction if the user limit or plan configuration rejects the owner.

Direct SQL and external tools do not execute application model guards. Future bulk imports, reactivation endpoints and ownership migrations must preserve this boundary. This change adds no database migration and did not modify a live database.

## API errors

Capacity exhaustion returns HTTP 403 with error.code PLAN_LIMIT_REACHED, a readable message and error.details containing resource, limit, usage and plan.

Invalid or absent limit configuration returns HTTP 503 with error.code PLAN_NOT_CONFIGURED. Existing frontend error handlers display the message. There is no implemented public upgrade checkout; an administrator must configure the subscription separately.

## Verification

Run npm.cmd test --prefix backend.

Local validation on 2026-10-03: 60 tests passed, zero failed and one real-PostgreSQL test group skipped. The new PGlite tests cover counts across tenants/stores, owner/staff limits, reactivation, downgrade behavior, invalid/unlimited settings, rollback and HTTP errors.

The optional capacity-concurrency.test.js uses independent PostgreSQL connections to verify that one remaining slot admits only one writer and that rollback releases the slot. CI now provides an isolated PostgreSQL 16 service for these tests on Node 20 and 22.

Local Docker was not running, so the multi-connection test was not executed locally and no CI result is claimed. PGlite validation is not proof of PostgreSQL multi-client locking.

For local multi-connection validation, explicitly set CAPACITY_TEST_DATABASE_URL to an isolated localhost database named baymax_capacity_test. The test creates and drops only a randomly named test schema there. It never infers its target from the application's DATABASE_URL or backend/.env.

Lock semantics: [PostgreSQL row locks](https://www.postgresql.org/docs/current/explicit-locking.html#LOCKING-ROWS) and [transaction isolation](https://www.postgresql.org/docs/current/transaction-iso.html).