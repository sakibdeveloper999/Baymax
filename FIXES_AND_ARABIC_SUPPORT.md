# Localization and earlier fixes

Updated: 2026-09-30. Earlier notes in this file described a prototype with sample products and an offline fallback. Those claims do not describe the active application.

## Language implementation

[The i18n configuration](desktop/src/i18n/config.js) loads English (`en`), Bengali (`bn`), and Arabic (`ar`) resources and persists the selected language in localStorage. Navbar provides language buttons. App updates the document language and uses `dir="rtl"` only for Arabic; Bengali and English use `dir="ltr"`.

This provides language selection and direction switching, not complete translation coverage. Several current screens and forms still use hardcoded English labels. Check [the frontend guide](desktop/FRONTEND_GUIDE.md) before extending localization.

## Current connection behavior

The app signs into the Express API backed by Neon PostgreSQL. The active POS fetches products and submits checkout requests through Axios. Network failures display an error; the app does not substitute a demo product catalog or silently create an offline sale.

The cart and held carts persist locally by tenant/user/store. Legacy IndexedDB caching/sync code remains in the repository, but it is not a completed offline workflow. `desktop/src/db/sqlite.js` exports a deprecated stub; installing a native SQLite package is not a setup step.

## Changes already represented in the code

- PostgreSQL connections, relational constraints, and transactional checkout replace the former MongoDB persistence.
- Tenant/subscription checks reject invalid access and mismatched token claims.
- Suppliers has a frontend plan gate backed by server feature checks.
- Electron isolates and sandboxes the renderer and exposes receipt printing through a limited preload API.
- Receipt text is inserted/escaped as text in print flows, and public receipt responses exclude internal/customer-account fields.

These controls do not resolve the outstanding Socket.io, offline, analytics, or full accessibility work listed in [app-map progress](APP_MAP_PROGRESS.md).

## Manual language checks

- [ ] Switch EN, AR, and BN from Navbar; reload and verify the selection persists.
- [ ] Verify Arabic document direction and layout; return to LTR for English/Bengali.
- [ ] Check mixed-script names, numbers, long labels, and receipt content.
- [ ] Identify English literals in active screens before marking translation coverage complete.
- [ ] Check keyboard focus and table/form layout in each language.

Start the backend and UI using [README](README.md). No sample barcode or default account is created automatically.
