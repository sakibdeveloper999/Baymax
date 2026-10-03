const db = require('./pool');
const { AppError, ValidationError, NotFoundError } = require('../utils/errorHandler');
const { tenantAccessError } = require('../utils/tenantAccess');

const resources = {
    Product: { limit: 'products', owner: 'storeId' },
    Store: { limit: 'branches', owner: 'tenantId' },
    User: { limit: 'users', owner: 'tenantId' },
};

// Count active products even in disabled stores, so hiding a branch cannot hide usage.
const countSql = {
    products: 'SELECT count(*) AS usage FROM products p JOIN stores s ON s."_id" = p."storeId" WHERE s."tenantId" = $1 AND p."isActive" = true AND p."_id" <> $2',
    branches: 'SELECT count(*) AS usage FROM stores WHERE "tenantId" = $1 AND "isActive" = true AND "_id" <> $2',
    users: 'SELECT count(*) AS usage FROM users WHERE "tenantId" = $1 AND "isActive" = true AND "_id" <> $2',
};

function needsCapacity(name, data, state) {
    const resource = resources[name];
    if (!resource) return false;
    if (!state.fresh && Object.hasOwn(data, resource.owner) &&
        data[resource.owner] !== state.original[resource.owner]) {
        throw new ValidationError('Changing record ownership requires a dedicated migration');
    }
    return data.isActive === true && (state.fresh || state.original.isActive !== true);
}

async function withCapacity(name, data, write, session) {
    const resource = resources[name];
    if (!resource) throw new TypeError('Unknown capacity resource');
    const work = async tx => {
        let tenantId = data.tenantId;
        if (name === 'Product') {
            const result = await tx.query('SELECT "tenantId" FROM stores WHERE "_id" = $1', [data.storeId]);
            if (!result.rows[0]) throw new NotFoundError('Store not found');
            tenantId = result.rows[0].tenantId;
        }
        // One database lock serializes all capacity-increasing writes for this tenant,
        // across API processes. Count AFTER acquiring it, in the same transaction as INSERT.
        const tenantResult = await tx.query('SELECT * FROM tenants WHERE "_id" = $1 FOR NO KEY UPDATE', [tenantId]);
        const tenant = tenantResult.rows[0];
        if (!tenant) throw new NotFoundError('Tenant not found');
        const blocked = tenantAccessError(tenant);
        if (blocked) throw new AppError(blocked.error, 403, blocked.code);
        if (name === 'Product') {
            const store = await tx.query('SELECT "_id" FROM stores WHERE "_id" = $1 AND "tenantId" = $2 AND "isActive" = true FOR SHARE', [data.storeId, tenantId]);
            if (!store.rows.length) throw new NotFoundError('Active store not found');
        }
        const result = await tx.query('SELECT limits FROM plans WHERE name = $1 FOR SHARE', [tenant.plan]);
        const limit = result.rows[0]?.limits?.[resource.limit];
        if (!Number.isSafeInteger(limit) || limit < -1) {
            throw new AppError('Subscription limit configuration is unavailable. Contact the administrator.', 503, 'PLAN_NOT_CONFIGURED');
        }
        if (limit !== -1) {
            const counted = await tx.query(countSql[resource.limit], [tenantId, data._id]);
            const usage = Number(counted.rows[0].usage);
            if (usage >= limit) {
                const error = new AppError('Your plan allows ' + limit + ' active ' + resource.limit + '. Deactivate an existing record or upgrade your plan.', 403, 'PLAN_LIMIT_REACHED');
                error.details = { resource: resource.limit, limit, usage, plan: tenant.plan };
                throw error;
            }
        }
        return write(tx);
    };
    const current = session || db.currentSession();
    if (current) {
        if (!current.inTransaction()) throw new Error('Capacity checks require an active transaction');
        return work(current);
    }
    return db.transaction(work);
}

module.exports = { needsCapacity, withCapacity, resources };