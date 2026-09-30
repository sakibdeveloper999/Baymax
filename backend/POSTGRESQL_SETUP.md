# Neon PostgreSQL setup

Baymax now uses PostgreSQL through `pg`. MongoDB and Mongoose are no longer required.
This setup starts with empty business tables. It does not copy, reset, or delete your old MongoDB database.

## First run

Use Node.js 20 or newer. From the repository root in PowerShell:

```powershell
npm.cmd install --prefix backend
# For a new checkout only: copy backend/.env.example to backend/.env.
# Set DATABASE_URL locally to the connection string from Neon > Connect.
npm.cmd run db:check --prefix backend
npm.cmd run db:migrate --prefix backend
npm.cmd run setup:plans --prefix backend
npm.cmd run dev --prefix backend
```

The migration creates 25 application tables, plus `schema_migrations`. It runs in a transaction with an advisory lock and records completed migrations. Re-running it does not reset tables. Existing unrelated tables are never dropped; name collisions cause the migration to roll back.

Plan setup inserts only Basic, Standard, and Pro definitions. Existing plan settings remain unchanged. `npm run seed` now performs the same plan-only setup: there are no demo passwords, users, products, or orders. Startup also ensures plan definitions exist, after checking database readiness, and only then listens for requests.

Create a new owner account using the app's signup screen, then create a store and categories before adding products. Old MongoDB accounts cannot log into this fresh database. Sign out of any old browser/desktop session first. Existing frontend demo dashboard/report views are unrelated to database records.

## Connection and schema

- `DATABASE_URL` replaces `MONGO_URI`. The backend reads `backend/.env` regardless of the launch directory. Never commit this file or share its connection string.
- Neon connections use certificate-verified TLS (`sslmode=verify-full`). The standard `pg` driver works with a Neon pooled or direct connection string. Transactions use one checked-out connection from start to finish.
- `db/migrations/001_initial.sql` is the versioned SQL schema. Add a new migration for future schema changes; do not edit a migration already applied to a database.
- `db/schema.js` describes application defaults, validation, and relationships. Keep metadata and new SQL migrations consistent.
- Each entity has its own table with typed columns, unique indexes and foreign keys. Store-scoped references use composite foreign keys to prevent linking records from different stores. Embedded line-item snapshots and plan settings use JSONB.
- IDs remain random 24-character hexadecimal strings and responses retain `_id`, avoiding a frontend and QR-token format change. No MongoDB driver is needed for these IDs.
- `db/model.js` supports the limited query methods already used by this application; it is not a general Mongoose implementation. Queries use bound values and schema-validated column names. Unsupported query operations fail explicitly.
- Checkout locks products in ID order, then the customer, and commits the order, stock logs and balance changes together. Manual stock changes are transactional. Other document updates detect conflicting writes and return a retryable 409 instead of silently overwriting changed values.
- Product costs and user passwords remain excluded from default queries. Password hashing still uses bcrypt cost 12.

## Verification

```powershell
npm.cmd test --prefix backend
npm.cmd test --prefix desktop -- --runInBand
npm.cmd run db:check --prefix backend
npm.cmd run db:smoke --prefix backend
```

Backend tests use an isolated in-memory PostgreSQL engine (PGlite); they never use your Neon credentials. Integration coverage applies the actual SQL migration twice, checks idempotent plan setup, and exercises HTTP signup/login, products, stock, checkout, receipts, tenant isolation, unique constraints, conflicting writes and rollback. PGlite does not simulate concurrent network clients; real Neon connectivity and transaction smoke checks are separate.

Driver references: https://node-postgres.com/features/queries and https://node-postgres.com/features/transactions.
