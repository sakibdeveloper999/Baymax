# Configured feature access

Updated: 2026-10-09.

The configured Plan.features array is authoritative, including custom Basic/Standard/Pro definitions. Plan initialization preserves existing definitions. Each protected business request loads the current plan once; changes take effect on the next request.

Missing plans or malformed feature arrays fail closed with 503 PLAN_NOT_CONFIGURED. Empty arrays are valid and grant no features. Excluded features return 403 FEATURE_NOT_AVAILABLE. Database failures reach normal error handling without allowing the operation.

## Mounted API rules

- Products require products; barcode lookup also requires barcodes.
- Categories require categories; suppliers require suppliers.
- Orders require pos. Customer-linked checkout and credit/wallet payment also require customers; wallet payment additionally requires wallet.
- Customers require customers. Wallet reads/top-ups additionally require wallet; point redemption requires loyalty. Creating positive wallet balances or loyalty cards requires the corresponding feature.
- Generic customer responses omit wallet balances and loyalty fields/history when those features are excluded. Checkout earns loyalty points only when loyalty is enabled.

Role, active subscription, tenant/store ownership and capacity checks remain required. Denied feature requests do not reach business mutations. Historical order/receipt data remains part of sales access.

Auth, account/store onboarding and store management are foundational and have no feature gate. Public receipts retain their signed-token rules. These exceptions do not bypass their existing access controls.

## Screen rules

POS requires pos and products; Orders requires pos; Products and Inventory require products; Categories, Customers, Suppliers and Reports require their matching feature. Reports is still a sample preview. Dashboard and store Settings remain foundational. POS barcode scanning/search requires barcodes.

The UI uses features returned by auth/me. Missing or malformed access profiles block protected screens. Sign out and back in to refresh cached session features after plan changes; backend checks remain authoritative on each request.

Future APIs, screens, imports and event publishers must declare their feature policy. This change does not implement unmounted map modules, payment gateways, live reports or complete cashier wallet workflows.

## Validation

Backend: 70 passed, zero failed, one optional real-PostgreSQL concurrency group skipped locally. Frontend: 34 passed; production React build passed. Coverage includes actual HTTP/PGlite policy checks, custom configurations, rollback-free denial, role checks and screen mounting. No live Neon data was changed or inspected.
