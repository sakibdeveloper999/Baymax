# Current project summary

Updated: 2026-09-30.

Baymax combines a React 18/Create React App frontend, Electron 39 desktop shell, Express API, and Neon PostgreSQL database. Core online POS and store-management flows are implemented; the broader SaaS roadmap remains partial.

## Current outcome

- All 25 entity modules use the PostgreSQL model layer. A versioned SQL migration creates their tables and constraints.
- Existing API `_id` fields and 24-character IDs are preserved.
- Signup, checkout, stock updates, authentication, and signed receipts have automated coverage.
- Database setup creates subscription plan definitions only. There are no demo users or seeded products.
- The frontend supports new-account and store onboarding, online sales, catalog management, order history, inventory, and settings.
- Dashboard and Reports are sample previews. Offline synchronization and several planned business modules remain incomplete.

## Where to continue

- Start the application using [README](README.md) or [PostgreSQL setup](backend/POSTGRESQL_SETUP.md).
- Review measured checks in [SYSTEM_TEST_REPORT.md](SYSTEM_TEST_REPORT.md).
- Resume implementation from [APP_MAP_PROGRESS.md](APP_MAP_PROGRESS.md).
- Use [FRONTEND_COMPLETION.md](FRONTEND_COMPLETION.md) for the screen inventory.
- Read [SECURITY.md](SECURITY.md) before deployment work.

The former MongoDB conversion decision was to start fresh. The old database was not deleted or imported. This summary makes no claim about the current count of user-created Neon records or whether local services are running.
