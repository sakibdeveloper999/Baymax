# Tenant scope and migration status

Updated: 2026-09-30. This file retains its historical migration-plan name but reflects the current PostgreSQL application.

## Database transition

The chosen transition was a fresh Neon PostgreSQL database. The initial SQL migration is implemented and was applied during the conversion. No MongoDB records were imported, backfilled, assigned to a tenant, or deleted. The former plan to backfill ambiguous legacy MongoDB ownership is not a prerequisite for this fresh installation.

Old observations about unowned MongoDB products are historical and do not describe current Neon records. A future legacy import would be a separate task requiring a verified ownership mapping and backup; never infer ownership merely because only one store exists.

## Current authorization boundary

- Tenant and User records carry tenant identity; Store references its Tenant.
- HTTP authentication reloads the current user/tenant, checks the token's tenant claim, and applies subscription policy.
- `requireStore` validates `X-Store-ID` or selects the oldest active store belonging to the authenticated tenant.
- Most business records use `storeId`, and route queries scope access to the resolved store.
- The SQL schema uses required store references and applicable composite foreign keys, such as a product's category belonging to the same store.
- Frontend cart keys include tenant, user, and store, but localStorage keys are not server authorization.

The v4 map's explicit `tenantId` field on every business record is not implemented. Store-based scoping and relational integrity do not replace the need to design that additional layer if the map requires it. No PostgreSQL row-level security policies are currently defined.

## Audit command and limits

```powershell
node backend/scripts/auditTenantScope.js
```

The script reads `backend/.env` and performs a read-only query counting stores whose tenant reference has no matching tenant. It does not audit every model, prove complete tenant isolation, detect every cross-tenant relationship, or backfill records. On the constrained current schema, the store foreign key should normally prevent such orphans.

Backend integration tests exercise unauthorized store selection and applicable cross-store reference failures. Real concurrent clients, offline queues, future route groups, and Socket.io authorization require additional coverage.

## Future scope changes

1. Define the intended tenant/store invariant for every entity, including stock transfers and embedded snapshots.
2. Add a new versioned SQL migration; do not edit an already-applied migration.
3. Update model metadata, create paths, filters, and constraints together.
4. If data already exists, inspect ownership and validate a non-destructive backfill before making fields required.
5. Test two tenants with overlapping identifiers, invalid references, signed receipts, and concurrent mutations.
6. Keep socket authentication, feature gates, and platform-admin authorization in the review scope.

See [PostgreSQL setup](POSTGRESQL_SETUP.md), [security policy](../SECURITY.md), and [app-map progress](../APP_MAP_PROGRESS.md).
