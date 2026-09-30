# Implementation report

Updated: 2026-09-30.

Baymax's PostgreSQL conversion and core online POS flows are implemented. The application is not a complete implementation of the v4 SaaS map. This report replaces earlier blanket completion claims.

## Database and backend

The backend uses Neon PostgreSQL through `pg`; Mongoose is no longer a runtime dependency. The initial SQL migration creates 25 application tables, while `schema_migrations` tracks applied migrations. Typed columns, unique constraints, foreign keys, and JSONB snapshots preserve the existing API response format.

The model modules delegate to `backend/db/model.js`, a limited query layer supporting the calls currently used by Baymax. It is not a complete ODM compatibility library. Changes to model metadata must be accompanied by versioned SQL migrations when database structure changes.

Implemented request groups are authentication, products, categories, stores, orders, customers, and suppliers. Signup is transactional. Checkout and manual stock adjustments use transactions; checkout locks products and the relevant customer. Other saved-record updates compare changed fields to detect conflicts.

Authentication checks the live user's tenant and subscription, validates token tenant claims, and hashes passwords with bcrypt cost 12. Public receipt access uses signed, expiring tokens and a limited response. Roles, feature gates, and store ownership checks exist, with coverage gaps recorded in [app-map progress](APP_MAP_PROGRESS.md).

## Frontend and desktop

The React application provides signup/login, store selection/setup, online POS, catalog editing, customer/supplier management, order details, stock adjustments, and store settings. Dashboard and Reports remain sample previews. Electron adds an isolated preload bridge for printing; the browser uses a print-dialog fallback.

Cart/held-order storage is scoped locally to tenant, user, and store. This is separate from offline order synchronization, which is incomplete. Existing IndexedDB helpers are not the active POS checkout path. SQLite is a deprecated compatibility stub.

## Setup and verification

Use [PostgreSQL setup](backend/POSTGRESQL_SETUP.md) for migrations and plan initialization. No legacy data is imported, and no default account is created. Signup is required for a fresh installation.

See [system test report](SYSTEM_TEST_REPORT.md) for actual automated results and explicit validation limits. A passing test suite does not verify the planned modules, live analytics, payment gateways, physical printers, or packaged installers.

## Next work

The maintained backlog is [APP_MAP_PROGRESS.md](APP_MAP_PROGRESS.md). Prioritize Socket.io authorization, live reporting, usage-limit enforcement, and missing business workflows. Keep planned features visibly separate from working screens and APIs.
