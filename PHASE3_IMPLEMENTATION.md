# POS implementation notes

Updated: 2026-09-30. This file retains its historical Phase 3 filename but describes the current active POS, not an earlier prototype.

## Active flow

[POSScreen.jsx](desktop/src/screens/POSScreen.jsx) receives the selected store and user from SessionGate. It loads `/api/products` in pages of 100. Its text/category controls filter the loaded page; pressing Enter in the search field performs an exact barcode lookup through `/api/products/barcode/:code`.

Product cards add items to the Zustand cart. Quantity controls, removal, percentage/flat discounts, and store-provided tax feed the displayed total. The UI maps its `percentage`/`fixed` discount names to the API's `percent`/`flat` names. Backend checkout reloads product prices and calculates the authoritative total.

The payment selector exposes cash, card, and mobile labels. These choices record a method; they do not charge a payment provider. The UI submits to `POST /api/orders`, an alias of `/api/orders/checkout`.

Checkout disables overlapping transactions and asks SessionGate to block store/navigation changes while busy. On success it clears the cart, displays the returned order, updates visible stock, and offers printing and a public receipt link. A printing failure after checkout does not undo the sale.

## Held carts and persistence

[cartSlice.js](desktop/src/store/cartSlice.js) stores active/held carts in localStorage under a tenant/user/store key. Holding saves the current cart and clears the active one. Resuming a held cart preserves any current nonempty cart as another held order. These are local draft carts, not server orders or offline sales.

## Reusable and legacy components

DiscountInput, TaxSelector, PaymentMethodSelector, HoldOrderButton, Cart, ScanInput, and StatusIndicator remain in the component directory. The active POS screen implements its main controls directly; component existence does not prove it is mounted. The older ScanInput/StatusIndicator path references IndexedDB/sync helpers.

Do not document F-key shortcuts, automatic offline checkout, SQLite synchronization, or a tax-preset dropdown as current POS features. Barcode Enter handling and ordinary keyboard navigation are present; verify any new shortcut in the mounted screen before advertising it.

## Verification

Follow [quick-start testing](QUICK_START_TESTING.md) and [the test procedure](TEST_SYSTEM.md). Include discount bounds, held-cart scope, stock changes, double-click protection, failed requests, and receipt retry behavior. Physical scanner/printer checks remain manual.
