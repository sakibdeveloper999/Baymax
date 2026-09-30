# Neon PostgreSQL setup

Updated: 2026-09-30.

Baymax uses PostgreSQL through `pg`. MongoDB and Mongoose are no longer runtime dependencies. The selected setup starts with fresh business tables; it does not copy, reset, or delete an old MongoDB database.

## Configure a checkout

Use Node.js 20 or newer; CI covers Node 20 and 22. Run these PowerShell commands from the repository root:

```powershell
npm.cmd ci --prefix backend
if (!(Test-Path backend/.env)) { Copy-Item backend/.env.example backend/.env }
```

Set `DATABASE_URL` in `backend/.env` to the connection string supplied by Neon. Keep it private and use ordinary `.env` text, without Markdown links or escaped underscores. Configure separate random JWT access, JWT refresh, and QR signing secrets. The backend reads this file relative to its own directory, regardless of the shell's working directory.

The frontend connects to the Express API, not directly to Neon. Set `REACT_APP_API_URL` in `desktop/.env` only when overriding the default `http://localhost:5000`; never put a database password there.

```powershell
npm.cmd run db:check --prefix backend
npm.cmd run db:migrate --prefix backend
npm.cmd run setup:plans --prefix backend
npm.cmd run dev --prefix backend
```

On non-Windows platforms, use `npm` instead of `npm.cmd`.

## What each command does

- `db:check`: connects and lists public tables. Read-only; it can succeed even before migrations exist.
- `db:migrate`: creates missing migration history and applies unapplied SQL migrations inside a transaction protected by an advisory lock. It does not reset tables. A conflicting existing table causes rollback rather than destructive replacement.
- `setup:plans`: verifies schema readiness and inserts missing Basic, Standard, and Pro definitions. Existing definitions are preserved.
- `seed`: an alias in behavior for plan-only setup. It creates no users, products, orders, or demo passwords.
- `dev` / `start`: verifies connectivity and the initial migration record, ensures plans, then starts HTTP. Startup does not automatically apply SQL migrations.
- `db:smoke`: creates temporary records in a live transaction, checks CRUD/relations/stock behavior, and intentionally rolls back. This is a write-and-rollback check, not a read-only query.
- `node backend/scripts/auditTenantScope.js`: counts orphaned store/tenant references only; it is not a comprehensive ownership audit.

Use the intended database for every command. A successful historical check does not establish that a service is still running or that business tables remain empty after users start working.

## Schema and query layer

[001_initial.sql](db/migrations/001_initial.sql) creates 25 application tables. `schema_migrations` is an additional bookkeeping table. Re-running migration setup preserves existing data. Add a new SQL file for future structural changes rather than editing a migration already applied.

[Schema metadata](db/schema.js) defines application defaults, field validation, and references. [The model layer](db/model.js) maps the query calls currently used by the app to parameterized SQL. It is a deliberately limited application layer, not a general Mongoose replacement. Update metadata and versioned SQL together when changing the database structure.

Scalar fields use SQL columns. Embedded line-item snapshots and plan settings use JSONB. Unique constraints preserve identities such as per-store product barcodes; foreign keys and applicable composite references prevent invalid or cross-store links. Embedded JSONB references are not standalone relational foreign keys.

API IDs remain random 24-character hexadecimal strings exposed as `_id`. PostgreSQL stores them without a MongoDB driver. Numeric columns are read into JavaScript numbers by the model layer; this does not change the application's JavaScript billing arithmetic into arbitrary-precision accounting.

Checkout uses one checked-out PostgreSQL connection, locks product rows in ID order and then the customer, and commits order/stock/balance changes together. Manual stock changes are also transactional. Other saves compare changed fields to detect conflicts and return a retryable 409 instead of silently overwriting changed values.

Neon host connections are configured with certificate-verified TLS (`sslmode=verify-full`). The driver accepts pooled or direct PostgreSQL connection strings. Default queries exclude passwords and product costs; selected cost fields still require route-level role handling. User password hashing uses bcrypt cost 12.

## First account and store

Open the app, sign out of any old session, and choose **Create a business account**. Signup creates a new owner and a seven-day Basic trial. Create a store, then categories and products. Old MongoDB accounts do not exist in a fresh Neon database unless separately imported.

Plan feature names include roadmap features as well as implemented ones. Dashboard/Reports previews are not live database reports; see [current project status](../APP_MAP_PROGRESS.md).

## Verification

```powershell
npm.cmd test --prefix backend
npm.cmd test --prefix desktop -- --runInBand
npm.cmd run db:check --prefix backend
npm.cmd run db:smoke --prefix backend
```

Backend integration tests use isolated PGlite and do not read Neon credentials. They apply the actual SQL migration and cover HTTP authentication, catalog/stock operations, checkout, receipts, suppliers, relational constraints, tenant scoping, conflict handling, and rollback. PGlite does not simulate independent concurrent network clients. See [the dated test report](../SYSTEM_TEST_REPORT.md) for what was actually run.

## Troubleshooting

- Missing/invalid `DATABASE_URL`: fix the backend environment value; `MONGO_URI` is ignored by the runtime.
- Schema readiness error: run migrations against the same database configured for startup.
- Foreign-key validation error: check that referenced records exist and belong to the expected store.
- Conflict response: reload current data before retrying; do not blindly overwrite it.
- Missing plan: run plan setup and inspect configuration. Setup preserves existing definitions.
- Changed database but old browser session: sign out and create/sign into an account in the new database.

Related documents: [tenant scope](TENANT_MIGRATION_PLAN.md), [security policy](../SECURITY.md), and [README](../README.md).
