# System test procedure

Updated: 2026-09-30. This is a reproducible verification guide, not a record that every manual check passed. Actual results are recorded in [SYSTEM_TEST_REPORT.md](SYSTEM_TEST_REPORT.md).

## Automated checks

Run from the repository root:

```powershell
npm.cmd test --prefix backend
npm.cmd test --prefix desktop -- --runInBand
npm.cmd run react-build --prefix desktop
git diff --check
```

There is no standalone project `lint` script. A passing build or targeted check must not be described as a full lint audit. Backend tests run with Node's test runner; frontend tests use Jest through React Scripts.

The backend PostgreSQL integration test creates an isolated PGlite database, applies the actual migration twice, and tests idempotent plan initialization. It exercises HTTP signup/login/refresh/profile, store and catalog creation, search, stock adjustments, checkout, receipts, suppliers, soft deletion, foreign keys, tenant isolation, stale-write conflicts, and rollback. Other files cover policy checks, list-query validation, QR tokens, roles, and model loading. PGlite does not model independent concurrent network sessions.

Frontend tests cover the cart store, selected screen/API behaviors, and the Suppliers feature gate. They do not drive a packaged Electron binary or physical hardware.

## Live database checks

```powershell
npm.cmd run db:check --prefix backend
npm.cmd run db:smoke --prefix backend
```

`db:check` performs a connection query and lists public tables without changing records. `db:smoke` writes temporary tenant, user, store, catalog, customer, order, and stock-log records in one transaction and deliberately rolls it back. It verifies that its test tenant was not committed. Neither command imports old data or resets the database.

Migration and plan-setup commands are setup operations, not read-only checks. Review [PostgreSQL setup](backend/POSTGRESQL_SETUP.md) before running them.

## Manual acceptance checklist

Use test accounts and a development database. These checks are pending until someone records a result for the tested revision.

- [ ] Signup creates an owner and offers initial store setup; no demo credentials are needed.
- [ ] Login, logout, reload, invalid-password handling, and expired-subscription behavior work as expected.
- [ ] Store selection changes the API scope and restores only the matching local cart.
- [ ] A second tenant cannot read/update the first tenant's records by changing `X-Store-ID` or record IDs.
- [ ] Category/product CRUD, pagination, literal search punctuation, and empty results display correctly.
- [ ] POS barcode entry uses the current store and authoritative server prices.
- [ ] Discounts, tax, insufficient stock, and failed requests leave the cart usable.
- [ ] Successful checkout appears in Orders and reduces Inventory once.
- [ ] A failed wallet/credit checkout does not leave an order, stock decrement, or stock log behind.
- [ ] Public receipt links expose only receipt data, reject tampered/expired tokens, and do not require login.
- [ ] Store settings save only for allowed roles; cashier cost-price restrictions are maintained.
- [ ] Basic cannot open Suppliers; configured Standard/Pro access follows backend policy.
- [ ] Browser and Electron printing handle success, cancellation, and failure without resubmitting checkout.
- [ ] Held orders survive reload and remain scoped to tenant/user/store.
- [ ] Arabic switches document direction to RTL; English and Bengali use LTR.
- [ ] Keyboard focus, narrow layouts, long text, and loading/error states are usable.

The active POS does not queue offline sales. Do not mark disconnected checkout or automatic replay as passing based on legacy IndexedDB helper files.

## Evidence to record

Record revision, date, OS, Node version, browser/Electron version, database environment, command exit status, and relevant sanitized errors. Do not include secrets, access/refresh tokens, signed receipt tokens, or real customer data. Separate automated, live-database, browser, hardware, and packaging results.
