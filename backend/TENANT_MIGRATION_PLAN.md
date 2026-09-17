# Tenant migration required by the v4 app map

The current active routes isolate records through `requireStore`, which selects an active store belonging to the authenticated tenant. Most store-owned models do not yet persist their own tenantId. The v4 map additionally requires explicit tenantId fields and query filters.

No database migration has been applied. The proposed bulk schema change was rejected by automatic approval review because making tenantId required immediately would invalidate legacy records.

## Staged change for approval

1. Restore MongoDB connectivity and run `node scripts/auditTenantScope.js` from backend. This tool is read-only, disables automatic indexes/collection creation, and prints counts rather than customer data.
2. Take a database backup. Add optional, indexed tenantId fields to store-owned models without changing existing query behavior.
3. Backfill tenantId from each record's store owner. Handle stock transfers using both source and destination stores; stop and report missing stores or different tenant owners. Never accept tenantId from request bodies. Do not delete or overwrite conflicting records.
4. Verify zero missing/conflicting tenant IDs. Test two tenants with overlapping barcodes and identifiers: reads, writes, receipts, stock logs, and aggregates must not cross the boundary.
5. Update create operations and queries together, require tenantId only after the backfill, and enforce subscription/plan limits with concurrency tests. Preserve the existing store-ownership check as a second boundary.
6. Deploy in stages; retain the backup and compatibility release for rollback.

Database connectivity currently fails with ENOTFOUND. Production migration execution remains pending connectivity, preflight results, and approval. No secrets or database contents are included here.
