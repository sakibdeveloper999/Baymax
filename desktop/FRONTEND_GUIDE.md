# Frontend developer guide

Updated: 2026-09-30.

The frontend is React 18 with Create React App, Tailwind CSS 3, Zustand, Axios, and i18next. Electron loads the React dev server in development and the built application when packaged. It does not bundle/start the Express backend automatically.

## Commands

Run from the repository root:

```powershell
npm.cmd ci --prefix desktop
npm.cmd run react-start --prefix desktop
```

Use `npm.cmd start --prefix desktop` instead for React plus Electron. Use `npm.cmd run react-build --prefix desktop` for a web build, and `npm.cmd run electron-build --prefix desktop` for React plus Windows portable/NSIS packaging. Packaging and printer verification are separate from a successful web build.

`REACT_APP_API_URL` defaults to `http://localhost:5000`. For a different API, set it in `desktop/.env` and restart/rebuild React. Configure backend CORS and review the renderer CSP for that endpoint. Database URLs and signing secrets belong exclusively to the backend.

## Entry points and screen flow

- [index.js](src/index.js) loads React, global CSS, and i18n.
- [App.jsx](src/App.jsx) selects screens with local state. It handles `#receipt/<token>` before protected onboarding.
- [SessionGate.jsx](src/components/SessionGate.jsx) signs users in/up, loads `/api/auth/me` and stores, selects/creates a store, and scopes carts.
- [MainLayout.jsx](src/layouts/MainLayout.jsx), Navbar, and Sidebar provide navigation and language controls.
- [ResourceManager.jsx](src/components/ResourceManager.jsx) provides reusable API-backed CRUD for products, categories, customers, and suppliers, including request-version protection for stale results.
- [FeatureAccess.jsx](src/components/FeatureAccess.jsx) prevents an excluded Suppliers screen from mounting and making its API calls.

See [frontend status](../FRONTEND_COMPLETION.md) for actual screen capabilities. Dashboard and Reports are visibly labeled sample previews. The presence of a screen or plan feature does not imply a completed backend workflow.

## API and session behavior

[config/api.js](src/config/api.js) attaches `Authorization` from `authToken` and `X-Store-ID` from `storeId`. It has a 10-second request timeout. On a 401, it clears the access token and dispatches `auth:expired`; SessionGate clears the session and asks the user to sign in again. There is no automatic token-refresh retry.

SessionGate stores access and refresh tokens in localStorage. New databases require new signup; stale tokens from the former database cannot create users automatically. All server authorization remains backend-owned: hidden controls and local store IDs are not security boundaries.

## POS and local state

[POSScreen.jsx](src/screens/POSScreen.jsx) uses the API for paginated products, barcode lookup, and checkout. The local search/category view filters the loaded page. The current UI supports cash/card/mobile method labels, without gateway processing. The server reloads prices and computes billing during checkout.

[cartSlice.js](src/store/cartSlice.js) persists active/held carts under `baymax-cart:<tenantId>:<userId>:<storeId>`. Guest state uses a separate key. Store selection changes the cart scope. Checkout coordinates its busy state with SessionGate so store changes/logout/navigation can be disabled during a transaction.

Legacy [localdb.js](src/db/localdb.js), [sync.js](src/utils/sync.js), and [orderSlice.js](src/store/orderSlice.js) contain IndexedDB/pending-order helpers. They do not make the mounted POS work offline. The SQLite module is a deprecated empty export. Do not wire legacy replay into production without tenant/store scoping, idempotency, conflict handling, and tests.

## Receipts and Electron

The receipt viewer requests the backend's signed public receipt endpoint. Receipt links use a hash path so they can work with the current state-based shell. A `file://` link from a packaged desktop app is not automatically an internet-hosted receipt URL.

[utils/printer.js](src/utils/printer.js) uses the Electron preload bridge when available and a popup print dialog in browsers. Electron main-process printing uses an escaped text receipt in a hidden window. A configured network printer address is not proof of a direct ESC/POS implementation. If printing fails after checkout, retry printing without repeating the sale.

## Localization and styling

[i18n/config.js](src/i18n/config.js) loads EN/BN/AR resources. Arabic is RTL; English/Bengali are LTR. Language selection persists, but hardcoded English text remains in active screens.

Use [the styling guide](src/STYLING_GUIDE.md) and [UI checklist](STYLING_CHECKLIST.md). Relative imports are supported; the repository does not configure the `@/` alias used by the unmounted styling example file. Update those imports before mounting the example.

## Validation

```powershell
npm.cmd test --prefix desktop -- --runInBand
npm.cmd run react-build --prefix desktop
```

See [dated results](../SYSTEM_TEST_REPORT.md). These checks do not substitute for browser/Electron interaction, RTL, accessibility, hardware, or installer tests. Use [the system test procedure](../TEST_SYSTEM.md) for manual acceptance work.
