process.env.DATABASE_URL = 'postgresql://test:test@localhost/capacity_test';
process.env.JWT_SECRET = 'capacity-test-access';
process.env.JWT_REFRESH_SECRET = 'capacity-test-refresh';
process.env.QR_SECRET = 'capacity-test-receipt';
process.env.NODE_ENV = 'test';
const test = require('node:test');
const assert = require('node:assert/strict');
const { PGlite } = require('@electric-sql/pglite');
const { Pool } = require('pg');
const db = require('../db/pool');
const { migrate } = require('../db/migrate');
const { ensurePlans } = require('../utils/ensurePlans');
const Tenant = require('../models/Tenant');
const Plan = require('../models/Plan');
const Store = require('../models/Store');
const Product = require('../models/Product');
const User = require('../models/User');
const Category = require('../models/Category');
const StockLog = require('../models/StockLog');
const SubscriptionLog = require('../models/SubscriptionLog');
const { newId } = require('../db/ids');
const { generateAccessToken } = require('../utils/helpers');
const limitError = error => error.code === 'PLAN_LIMIT_REACHED' && error.statusCode === 403;
const configError = error => error.code === 'PLAN_NOT_CONFIGURED' && error.statusCode === 503;

test('capacity enforcement through PostgreSQL models and HTTP routes', async t => {
    const pg = new PGlite();
    const query = async (sql, values) => {
        const result = values ? await pg.query(sql, values) : (await pg.exec(sql)).at(-1);
        return { rows: result?.rows || [], rowCount: result?.affectedRows || 0 };
    };
    t.mock.method(Pool.prototype, 'query', query);
    t.mock.method(Pool.prototype, 'connect', async () => ({ query, release() {} }));
    t.after(async () => { await db.close(); await pg.close(); });
    await migrate();
    await ensurePlans();
    const plan = await Plan.findOne({ name: 'basic' });
    const defaults = structuredClone(plan.limits);
    const setLimits = async limits => { plan.limits = { ...defaults, ...limits }; await plan.save(); };
    const makeTenant = () => Tenant.create({ businessName: 'Capacity test', ownerEmail: newId() + '@example.com', expireAt: new Date(Date.now() + 86400000) });
    const makeStore = tenant => Store.create({ tenantId: tenant._id, name: newId() });
    const makeProduct = store => Product.create({ storeId: store._id, name: 'Product', barcode: newId(), costPrice: 1, sellingPrice: 2 });
    const makeUser = tenant => User.create({ tenantId: tenant._id, name: 'Staff', email: newId() + '@example.com', password: 'test-password-123' });

    await t.test('active branches count per tenant; deactivation frees capacity and reactivation checks it', async () => {
        await setLimits({ branches: 1 });
        const tenant = await makeTenant(), other = await makeTenant();
        const first = await makeStore(tenant);
        await assert.rejects(makeStore(tenant), limitError);
        await makeStore(other);
        const inactive = await Store.create({ tenantId: tenant._id, name: 'Inactive', isActive: false });
        inactive.isActive = true;
        await assert.rejects(inactive.save(), limitError);
        first.isActive = false; await first.save();
        await inactive.save();
        assert.equal(await Store.countDocuments({ tenantId: tenant._id, isActive: true }), 1);
    });

    await t.test('products count across branches, including disabled branches, without leaking tenant usage', async () => {
        await setLimits({ branches: 2, products: 2 });
        const tenant = await makeTenant(), other = await makeTenant();
        const first = await makeStore(tenant), second = await makeStore(tenant);
        const a = await makeProduct(first), b = await makeProduct(second);
        await assert.rejects(makeProduct(first), limitError);
        const foreign = await makeStore(other); await makeProduct(foreign);
        second.isActive = false; await second.save();
        await assert.rejects(makeProduct(first), limitError);
        a.isActive = false; await a.save();
        await makeProduct(first);
        a.isActive = true; await assert.rejects(a.save(), limitError);
        b.name = 'Edit at capacity'; await b.save();
        await setLimits({ products: 0, branches: 2 });
        b.name = 'Edit after downgrade'; await b.save();
        await assert.rejects(makeProduct(first), limitError);
    });

    await t.test('owner counts as a user; staff creation and reactivation respect the same limit', async () => {
        await setLimits({ users: 2 });
        const tenant = await makeTenant();
        const owner = await User.create({ tenantId: tenant._id, name: 'Owner', email: newId() + '@example.com', password: 'test-password-123', role: 'owner' });
        const staff = await makeUser(tenant);
        await assert.rejects(makeUser(tenant), limitError);
        staff.isActive = false; await staff.save();
        await makeUser(tenant);
        staff.isActive = true; await assert.rejects(staff.save(), limitError);
        assert.equal(await User.countDocuments({ tenantId: tenant._id, isActive: true }), 2);
        owner.lastLogin = new Date(); await owner.save();
    });

    await t.test('missing, malformed and zero limits fail closed; -1 is unlimited', async () => {
        await setLimits({});
        const tenant = await makeTenant(), store = await makeStore(tenant);
        for (const invalid of [undefined, null, '2', 1.5, -2, true]) {
            await setLimits({ products: invalid });
            await assert.rejects(makeProduct(store), configError);
        }
        await setLimits({ products: 0 });
        await assert.rejects(makeProduct(store), limitError);
        await setLimits({ products: -1 });
        for (let n = 0; n < 3; n++) await makeProduct(store);
        assert.equal(await Product.countDocuments({ storeId: store._id }), 3);
        tenant.plan = 'pro'; await tenant.save();
        await query('DELETE FROM plans WHERE name = $1', ['pro']);
        await assert.rejects(makeProduct(store), configError);
        await ensurePlans();
    });

    await t.test('failed writes roll back and do not consume capacity; limited upserts cannot bypass saves', async () => {
        await setLimits({ products: 1 });
        const tenant = await makeTenant(), store = await makeStore(tenant);
        await assert.rejects(db.transaction(async () => { await makeProduct(store); throw new Error('rollback capacity'); }), /rollback capacity/);
        assert.equal(await Product.countDocuments({ storeId: store._id }), 0);
        await makeProduct(store);
        await assert.rejects(Product.updateOne({}, { $setOnInsert: {} }, { upsert: true }), /capacity-limited/);
        const product = await Product.findOne({ storeId: store._id });
        product.storeId = newId();
        await assert.rejects(product.save(), /ownership/);
    });

    const { app } = require('../server');
    const server = app.listen(0, '127.0.0.1');
    await new Promise(resolve => server.once('listening', resolve));
    t.after(() => new Promise(resolve => server.close(resolve)));
    async function request(route, body, token, storeId) {
        const response = await fetch('http://127.0.0.1:' + server.address().port + route, {
            method: 'POST', headers: { 'Content-Type': 'application/json',
                ...(token ? { Authorization: 'Bearer ' + token } : {}), ...(storeId ? { 'X-Store-ID': storeId } : {}) },
            body: JSON.stringify(body),
        });
        return { status: response.status, body: await response.json() };
    }
    await t.test('HTTP returns actionable quota errors and initial stock failure rolls back the product', async sub => {
        await setLimits({ branches: 1, products: 1, users: 2 });
        const tenant = await makeTenant(), user = await makeUser(tenant), store = await makeStore(tenant);
        const token = generateAccessToken(user._id, tenant._id, 'owner');
        user.role = 'owner'; await user.save();
        const category = await Category.create({ storeId: store._id, name: 'Category' });
        const payload = { barcode: newId(), name: 'API product', categoryId: category._id, costPrice: 1, sellingPrice: 2, stock: 3 };
        const original = StockLog.create;
        const mock = sub.mock.method(StockLog, 'create', async () => { throw new Error('Stock log failed'); });
        assert.equal((await request('/api/products', payload, token, store._id)).status, 500);
        assert.equal(await Product.countDocuments({ storeId: store._id }), 0);
        mock.mock.restore();
        assert.equal(StockLog.create, original);
        assert.equal((await request('/api/products', payload, token, store._id)).status, 201);
        const denied = await request('/api/products', { ...payload, barcode: newId() }, token, store._id);
        assert.equal(denied.status, 403);
        assert.equal(denied.body.error.code, 'PLAN_LIMIT_REACHED');
        assert.deepEqual(denied.body.error.details, { resource: 'products', limit: 1, usage: 1, plan: 'basic' });
        const branch = await request('/api/stores', { name: 'Second', address: '123 Test Street', phone: '1234567890' }, token);
        assert.equal(branch.status, 403);
        assert.equal(branch.body.error.details.resource, 'branches');
    });

    await t.test('signup rolls back tenant, owner and subscription log when user capacity is unavailable', async () => {
        const before = { tenants: await Tenant.countDocuments(), users: await User.countDocuments(), logs: await SubscriptionLog.countDocuments() };
        for (const [limit, status, code] of [[0, 403, 'PLAN_LIMIT_REACHED'], [null, 503, 'PLAN_NOT_CONFIGURED']]) {
            await setLimits({ users: limit });
            const result = await request('/api/auth/signup', { businessName: 'Blocked signup', ownerEmail: newId() + '@example.com', password: 'test-password-123' });
            assert.equal(result.status, status);
            assert.equal(result.body.error.code, code);
            assert.equal(await Tenant.countDocuments(), before.tenants);
            assert.equal(await User.countDocuments(), before.users);
            assert.equal(await SubscriptionLog.countDocuments(), before.logs);
        }
    });
});