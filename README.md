# Baymax OmniPOS

Updated: 2026-10-03.

Baymax is a React web and Electron desktop point-of-sale application backed by Express and Neon PostgreSQL. The active application supports account and store setup, catalog management, online checkout, stock adjustments, order history, and signed receipts. The full SaaS app map is still in progress.

## Current stack

- Backend: Node.js, Express 4, PostgreSQL through `pg`, Joi, bcryptjs, JWT, Helmet, and Socket.io.
- Frontend: React 18, Create React App (`react-scripts` 5), Zustand, Axios, i18next, and Tailwind CSS 3.
- Desktop: Electron 39 with an isolated, sandboxed renderer and a receipt-printing preload bridge.
- Tests: Node's test runner and PGlite for backend tests; Jest through React Scripts for frontend tests.

Dependency ranges are recorded in [backend/package.json](backend/package.json) and [desktop/package.json](desktop/package.json); lockfiles pin installations. CI tests Node.js 20 and 22. This is not a Vite application.

## Start locally

Use PowerShell from the repository root. `npm.cmd` avoids Windows execution-policy problems with `npm.ps1`. On other platforms use `npm`.

```powershell
npm.cmd ci --prefix backend
npm.cmd ci --prefix desktop

# Copy only if backend/.env does not already exist.
if (!(Test-Path backend/.env)) { Copy-Item backend/.env.example backend/.env }
```

Edit `backend/.env` locally. Set `DATABASE_URL` to your Neon connection string and configure separate random `JWT_SECRET`, `JWT_REFRESH_SECRET`, and `QR_SECRET` values. Never put database credentials into frontend environment variables.

```powershell
npm.cmd run db:check --prefix backend
npm.cmd run db:migrate --prefix backend
npm.cmd run setup:plans --prefix backend
npm.cmd run dev --prefix backend
```

In another terminal, start the browser UI:

```powershell
npm.cmd run react-start --prefix desktop
```

Or start React and Electron together with `npm.cmd start --prefix desktop` instead. Default URLs are `http://localhost:5000` for the backend and `http://localhost:3000` for React. These commands start the services; their presence in this guide does not mean they are already running.

The frontend defaults to the backend at `http://localhost:5000`. For another endpoint, create `desktop/.env` with `REACT_APP_API_URL=https://your-api-host` and restart/rebuild React. Set the backend `ALLOWED_ORIGINS` to the intended client origins.

Check readiness with `Invoke-RestMethod http://localhost:5000/health`. The listener starts after database/schema checks and plan initialization; `/health` itself does not perform a fresh database query.

## Fresh-database onboarding

1. Open the app and select **Create a business account**. Signup creates a tenant, owner, and seven-day Basic trial.
2. Create the initial store with its name, address, phone, currency, and tax rate.
3. Add a category, then a product with an 8-character-or-longer barcode, positive cost/selling prices, and initial stock.
4. Open POS, add the product, and complete a sale. Check Orders, Inventory, and the receipt.

There are no built-in demo accounts or sample products. `seed` initializes subscription plans only. Old MongoDB users and records were not imported into Neon. Sign out of old sessions before using the new database. The cart and held orders persist locally under tenant/user/store-specific keys; this persistence does not enable offline checkout.

## Implemented and pending behavior

The active UI includes POS, Products, Categories, Customers, Suppliers, Orders, Inventory, and store Settings. Features and mutations remain subject to backend roles and subscription checks. Suppliers has an explicit frontend plan gate. Some customer operations also require plan features; the UI does not gate every feature consistently yet.

Dashboard and Reports are labeled sample previews. They are not connected to live analytics APIs. Purchases, transfers, returns, shifts, payroll, accounting, banking, vouchers, and other planned modules have database models but no mounted route groups. The POS UI offers cash, card, and mobile payment labels; it does not process card or mobile payments through a gateway. The checkout API additionally understands credit, wallet, and mixed labels, but these do not imply complete payment-provider or split-tender workflows.

Offline helpers exist in IndexedDB-related files, but the active POS loads products and submits sales through the API. SQLite is a deprecated stub. Full offline replay, idempotent sync, and mobile delivery remain pending.

Socket.io now authenticates access tokens, authorizes tenant/store rooms, and disconnects expired or revoked sessions. Idle access is rechecked every 30 seconds with a 5-second lookup timeout. The active UI and business-event publishers are not yet connected; see the [Socket.IO contract](backend/SOCKET_IO.md). Plan definitions include usage limits; the existing `checkLimit` middleware exposes a limit to handlers and does not implement complete usage counting/enforcement. See [app-map progress](APP_MAP_PROGRESS.md) and [security notes](SECURITY.md).

## Backend layout

- [server.js](backend/server.js): middleware, mounted routes, Socket.io, readiness and shutdown.
- [db/pool.js](backend/db/pool.js): Neon connections and transactions.
- [db/migrations/001_initial.sql](backend/db/migrations/001_initial.sql): 25 application tables and relational constraints; migration history uses an additional table.
- [db/schema.js](backend/db/schema.js) and [db/model.js](backend/db/model.js): defaults, validation, relation loading, and parameterized SQL persistence.
- `backend/models/`: entity modules using the PostgreSQL model layer.
- `backend/routes/`, `controllers/`, `middleware/`, and `utils/`: request handling and business behavior.
- `backend/scripts/`: migrations, plan setup, connection checks, rollback smoke checks, and a limited store/tenant audit.

The database preserves the API's `_id` field and 24-character hexadecimal IDs. Each entity has typed SQL columns; embedded line-item snapshots and plan settings use JSONB. Checkout and manual stock changes use PostgreSQL transactions. For configuration, schema evolution, and command side effects, read [PostgreSQL setup](backend/POSTGRESQL_SETUP.md).

## Mounted API routes

All paths below are relative to the backend origin. Protected requests use `Authorization: Bearer <access-token>`. Store-scoped requests may supply `X-Store-ID`; the server validates ownership or selects the tenant's oldest active store when the header is absent.

- Public: `GET /health`, `POST /api/auth/signup`, `POST /api/auth/login`, `POST /api/auth/refresh-token`, `GET /api/orders/receipt/:token`.
- Profile: `GET /api/auth/me`.
- Products: `GET|POST /api/products`, `GET /api/products/barcode/:code`, `GET|PUT|DELETE /api/products/:id`, `PATCH /api/products/:id/stock`.
- Categories: `GET|POST /api/categories`, `PUT|DELETE /api/categories/:id`.
- Stores: `GET|POST /api/stores`, `GET|PUT|DELETE /api/stores/:id`.
- Orders: `POST /api/orders` or `POST /api/orders/checkout`, `GET /api/orders`, `GET /api/orders/:id`, `GET /api/orders/:id/receipt`, `PATCH /api/orders/:id/status`.
- Customers: `GET|POST /api/customers`, `GET|PUT|DELETE /api/customers/:id`, `GET|PATCH /api/customers/:id/wallet`, `PATCH /api/customers/:id/loyalty/redeem`.
- Suppliers: `GET|POST /api/suppliers`, `GET|PUT|DELETE /api/suppliers/:id`, `GET|PATCH /api/suppliers/:id/payables`.

`GET /api/orders/:id/receipt` is the protected receipt route and requires a signed `token` query parameter. The public receipt route validates the signed token without login. Catalog/store/customer/supplier delete handlers mark records inactive. Changing an order's status is not a refund or stock-return workflow.

Request fields and permissions are defined by [validation schemas](backend/utils/validationSchemas.js) and the route modules. A route listed here may still have unfinished business behavior; see the progress checklist.

## Subscription defaults

[Plan configuration](backend/config/plans.js) defines Basic, Standard, and Pro. Plan setup inserts missing definitions and preserves configured ones. Basic includes POS, products, categories, and barcodes; Standard adds features including suppliers, customers, wallet, and loyalty; Pro includes further planned features. A feature name in a plan is not evidence that its API/UI exists.

Missing plan configuration returns `503 PLAN_NOT_CONFIGURED` from feature checks. Excluded features return `403 FEATURE_NOT_AVAILABLE`. Inactive, suspended, expired, or invalid tenant subscriptions are rejected. No subscription billing or public plan-upgrade workflow is implemented.

## Validate and build

```powershell
npm.cmd test --prefix backend
npm.cmd test --prefix desktop -- --runInBand
npm.cmd run react-build --prefix desktop
```

Backend tests include isolated PostgreSQL integration coverage and do not use Neon credentials. `db:check` is a read-only live connectivity/schema inventory check. `db:smoke` performs live writes inside a transaction and rolls them back. Run database checks only against the intended configured database.

For Windows packaging, `npm.cmd run electron-build --prefix desktop` builds React and invokes Electron Builder for portable/NSIS targets. Packaging and physical printer behavior require separate verification.

## Documentation

- [Quick start testing](QUICK_START_TESTING.md)
- [System verification results](SYSTEM_TEST_REPORT.md) and [test procedure](TEST_SYSTEM.md)
- [Implementation report](COMPLETION_REPORT.md), [summary](FINAL_SUMMARY.md), and [app-map progress](APP_MAP_PROGRESS.md)
- [Frontend status](FRONTEND_COMPLETION.md), [frontend guide](desktop/FRONTEND_GUIDE.md), and [POS behavior](PHASE3_IMPLEMENTATION.md)
- [Localization and earlier fixes](FIXES_AND_ARABIC_SUPPORT.md)
- [Styling implementation](desktop/STYLING_IMPLEMENTATION.md), [styling guide](desktop/src/STYLING_GUIDE.md), and [UI checklist](desktop/STYLING_CHECKLIST.md)
- [Tenant scope](backend/TENANT_MIGRATION_PLAN.md) and [security policy](SECURITY.md)

These documents describe the current checkout. Historical completion percentages, demo credentials, fabricated performance figures, and unimplemented endpoint lists have been removed. Package manifests declare MIT; no separate license document is present in this checkout.
