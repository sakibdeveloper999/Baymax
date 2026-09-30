# Quick start testing

Updated: 2026-09-30. These steps use the current Neon PostgreSQL backend and online POS. They create real records in the database you configure; use a development database for manual testing.

## Prepare the application

From the repository root in PowerShell:

```powershell
npm.cmd ci --prefix backend
npm.cmd ci --prefix desktop
if (!(Test-Path backend/.env)) { Copy-Item backend/.env.example backend/.env }
```

Set `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, and `QR_SECRET` privately in `backend/.env`. See [database setup](backend/POSTGRESQL_SETUP.md) for details.

```powershell
npm.cmd run db:check --prefix backend
npm.cmd run db:migrate --prefix backend
npm.cmd run setup:plans --prefix backend
npm.cmd run dev --prefix backend
```

In a second terminal:

```powershell
npm.cmd run react-start --prefix desktop
```

Use `npm.cmd start --prefix desktop` instead to start React and Electron together. Do not start a second React process on port 3000.

## First sale

1. Verify `Invoke-RestMethod http://localhost:5000/health` succeeds.
2. Open `http://localhost:3000`. Sign out of any old session, then create a business account.
3. Set up the store. New accounts start on a seven-day Basic trial.
4. Create a category and a product. Example test data: barcode `123456789012`, name `Test Rice`, cost price `4`, selling price `10`, initial stock `10`. These are suggested inputs, not seeded records.
5. In POS, type the barcode and press Enter, or click its product card. Add two units and choose cash.
6. Complete payment. Confirm the success message, order number, and receipt link.
7. Check Orders and Inventory. Stock should decrease by two. The total uses the configured store tax and any discount.
8. Hold a new cart, reload, and resume it under the same account/store. Sign out or switch stores and confirm cart separation.

Basic does not include Suppliers; a plan-unavailable message is expected. Customer creation and loyalty operations have their own backend feature checks. Do not change plan definitions merely to hide expected authorization errors.

## Automated verification

```powershell
npm.cmd test --prefix backend
npm.cmd test --prefix desktop -- --runInBand
npm.cmd run react-build --prefix desktop
```

See [current results](SYSTEM_TEST_REPORT.md). Backend integration tests use isolated PGlite, not Neon. For a live transaction check, `npm.cmd run db:smoke --prefix backend` creates temporary records and rolls back the transaction.

## Common problems

- Database readiness fails: verify `DATABASE_URL`, run `db:check`, and apply migrations. Do not switch back to `MONGO_URI`.
- No products: this is expected on a fresh database. Plan setup does not create products or users.
- Cannot reach server: verify the backend process, `REACT_APP_API_URL`, allowed CORS origins, and browser console errors.
- Expired/suspended account: review tenant subscription state. It is not a missing-product error.
- `PLAN_NOT_CONFIGURED`: run plan setup against the intended database and investigate configuration.
- Backend stops during checkout: expect an error, not a successful offline sale. Cart persistence is separate from checkout.
- Receipt printing fails after payment: the sale may already be saved. Retry printing from the receipt action rather than submitting the sale again.

These steps do not verify payment gateways, physical barcode scanners/printers, installers, complete translations, or responsive/accessibility behavior on every device. Use [the detailed test procedure](TEST_SYSTEM.md) for further checks.
