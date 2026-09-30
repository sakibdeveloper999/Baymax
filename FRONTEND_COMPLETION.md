# Frontend implementation status

Updated: 2026-09-30. The frontend contains working API-backed screens and explicit sample previews. This document replaces the earlier claim that all screens and workflows were complete.

## Application shell and onboarding

[App.jsx](desktop/src/App.jsx) selects screens using local state. [SessionGate](desktop/src/components/SessionGate.jsx) handles signup/login, profile loading, store creation/selection, logout, and cart scoping. There is no React Router dependency; public receipt viewing uses `#receipt/<token>` before the session gate.

The shell comprises MainLayout, Navbar, and Sidebar. Navbar currently exposes navigation and language controls, not a notification center or profile-menu system.

## Active screens

- **POS:** paginated API product loading, filtering within the loaded page, barcode lookup on Enter, cart quantity changes, discounts, store tax, cash/card/mobile labels, online checkout, held carts, and receipt actions.
- **Products:** API-backed CRUD with category selection. Barcode, cost price, and initial stock are create-only fields in the current form; selling price/name and other exposed update fields can be edited.
- **Categories:** API-backed category management.
- **Customers:** basic CRUD for name, phone, email, and credit limit. Backend wallet and loyalty routes exist, but the current manager does not expose full wallet/loyalty workflows.
- **Suppliers:** plan-gated basic CRUD with company/contact fields and an opening balance. Backend payables endpoints exist; the current manager is not a complete payment ledger UI.
- **Orders:** paginated lists, status filtering, and order details. This is not a refund/return workflow.
- **Inventory:** paginated search, stock/threshold display, and role-restricted stock adjustments.
- **Settings:** active-store settings with persistence and role restrictions.
- **ReceiptViewer:** public signed receipt lookup through the API.

Dashboard and Reports render sample data and display a sample-preview notice. There are no live report APIs mounted in the backend.

## Persistence and integration limits

The Axios client attaches the access token and selected store ID. A 401 clears the access token and triggers reauthentication; automatic refresh-token retry is not implemented. SessionGate stores a refresh token, but storage alone is not refresh automation.

Zustand cart state and held orders use tenant/user/store-scoped localStorage. Product lookup and checkout require the backend. Legacy IndexedDB and sync helpers are not the active POS transaction path; SQLite is a stub.

English, Arabic, and Bengali translation resources exist. Arabic sets RTL; English/Bengali set LTR. Many active screens still contain English literals, so translation coverage is incomplete.

Electron exposes receipt printing through a sandboxed preload bridge. Browser printing uses a popup print dialog. A physical printer, signed installer, mobile application, and gateway payment processing are not covered by the current automated tests.

## Validation and next work

Read [system results](SYSTEM_TEST_REPORT.md), [frontend developer guide](desktop/FRONTEND_GUIDE.md), and [app-map progress](APP_MAP_PROGRESS.md). Remaining frontend work includes live analytics, broader feature gating, additional workflows, translation coverage, offline design, accessibility, and packaged/hardware verification.
