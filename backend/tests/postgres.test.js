process.env.DATABASE_URL = 'postgresql://test:test@localhost/baymax_test';
process.env.JWT_SECRET = 'integration-test-access-secret';
process.env.JWT_REFRESH_SECRET = 'integration-test-refresh-secret';
process.env.QR_SECRET = 'integration-test-qr-secret';
process.env.NODE_ENV = 'test';
const test = require('node:test');
const assert = require('node:assert/strict');
const { PGlite } = require('@electric-sql/pglite');
const { Pool } = require('pg');
const database = require('../db/pool');
const { migrate } = require('../db/migrate');
const { ensurePlans } = require('../utils/ensurePlans');
const models = Object.fromEntries(Object.keys(require('../db/schema')).map(name => [name, require('../models/' + name)]));

test('PostgreSQL migration, API lifecycle, constraints and transaction rollback', async t => {
    const pg = new PGlite();
    const query = async (sql, values) => {
        const result = values ? await pg.query(sql, values) : (await pg.exec(sql)).at(-1);
        return { rows: result?.rows || [], rowCount: result?.affectedRows || 0 };
    };
    t.mock.method(Pool.prototype, 'query', query);
    t.mock.method(Pool.prototype, 'connect', async () => ({ query, release() {} }));
    t.after(async () => { await database.close(); await pg.close(); });
    await migrate();
    await migrate();
    await ensurePlans();
    await ensurePlans();
    assert.equal(await models.Plan.countDocuments(), 3);
    const tables = await pg.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public'");
    assert.equal(tables.rows.length, 26);

    const { app } = require('../server');
    const server = app.listen(0, '127.0.0.1');
    await new Promise(resolve => server.once('listening', resolve));
    t.after(() => new Promise(resolve => server.close(resolve)));
    let token, storeId;
    async function api(method, route, body, expected = 200, overrides = {}) {
        const response = await fetch(`http://127.0.0.1:${server.address().port}${route}`, {
            method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}),
                ...(storeId ? { 'x-store-id': storeId } : {}), ...overrides }, body: body ? JSON.stringify(body) : undefined,
        });
        const data = await response.json();
        assert.equal(response.status, expected, JSON.stringify(data));
        return data;
    }
    const signup = await api('POST', '/api/auth/signup', { businessName: 'Postgres Test Shop', ownerEmail: 'OWNER@example.com', password: 'test-password-123' }, 201);
    token = signup.data.accessToken;
    const userId = signup.data.user._id;
    assert.equal(signup.data.user.email, 'owner@example.com');
    assert.equal(await models.SubscriptionLog.countDocuments(), 1);
    const storedUser = await models.User.findById(userId).select('+password');
    assert.match(storedUser.password, /^\$2[aby]\$12\$/);
    assert.ok(await storedUser.comparePassword('test-password-123'));
    const login = await api('POST', '/api/auth/login', { email: 'OWNER@example.com', password: 'test-password-123' });
    token = login.data.accessToken;
    assert.equal((await models.User.findById(userId).select('+password')).password, storedUser.password);
    const me = await api('GET', '/api/auth/me');
    assert.equal(me.data.user.password, undefined);
    assert.equal(me.data.user.tenantId.businessName, 'Postgres Test Shop');
    await api('POST', '/api/auth/refresh-token', { refreshToken: login.data.refreshToken });
    await api('POST', '/api/auth/signup', { businessName: 'Duplicate', ownerEmail: 'owner@example.com', password: 'test-password-123' }, 409);

    const branch = await api('POST', '/api/stores', { name: 'Main Branch', address: '123 Test Street', phone: '1234567890', taxRate: 0 }, 201);
    storeId = branch.data._id;
    assert.ok(storeId);
    const category = await api('POST', '/api/categories', { name: 'Groceries' }, 201);
    const product = await api('POST', '/api/products', { name: 'Rice [premium]', barcode: '123456789012', categoryId: category.data._id,
        costPrice: 4, sellingPrice: 10, stock: 10 }, 201);
    const productId = product.data._id;
    assert.equal((await api('GET', '/api/products?search=%5B')).data.length, 1);
    assert.equal((await api('GET', '/api/products?search=%27%20OR%201%3D1--')).data.length, 0);
    assert.equal((await api('GET', '/api/products/' + productId)).data.categoryId.name, 'Groceries');
    await api('PUT', '/api/products/' + productId, { name: 'Rice updated' });
    assert.equal((await models.Product.findById(productId).select('+costPrice')).costPrice, 4);
    await api('PATCH', '/api/products/' + productId + '/stock', { delta: 2, reason: 'restock' });
    assert.equal((await models.Product.findById(productId)).stock, 12);
    assert.equal(await models.StockLog.countDocuments(), 2);

    const tenant = await models.Tenant.findById(signup.data.tenant._id);
    tenant.plan = 'standard'; await tenant.save();
    const customer = await api('POST', '/api/customers', { name: 'Test Customer', walletBalance: 100 }, 201);
    const customerId = customer.data._id;
    const checkout = { items: [{ productId, quantity: 2, unitPrice: 10 }], paymentMethod: 'wallet', customerId };
    const sale = await api('POST', '/api/orders/checkout', checkout, 201);
    assert.equal((await models.Product.findById(productId)).stock, 10);
    assert.equal((await models.Customer.findById(customerId)).walletBalance, 80);
    const receipt = await api('GET', '/api/orders/receipt/' + sale.data.qrToken);
    assert.equal(receipt.data.billing.total, 20);
    assert.equal(receipt.data.items[0].costPrice, undefined);
    assert.equal((await api('GET', '/api/orders')).data.length, 1);
    await api('GET', '/api/orders/' + sale.data.orderId);
    const beforeLogs = await models.StockLog.countDocuments();
    await api('POST', '/api/orders/checkout', { ...checkout, items: [{ productId, quantity: 9, unitPrice: 10 }] }, 400);
    assert.equal((await models.Product.findById(productId)).stock, 10, 'failed payment must restore stock');
    assert.equal(await models.Order.countDocuments(), 1, 'failed payment must roll back the order');
    assert.equal(await models.StockLog.countDocuments(), beforeLogs, 'failed payment must roll back stock logs');
    assert.equal((await models.Customer.findById(customerId)).walletBalance, 80);

    const otherTenant = await models.Tenant.create({ businessName: 'Other', ownerEmail: 'other@example.com', expireAt: new Date(Date.now() + 86400000) });
    const otherStore = await models.Store.create({ tenantId: otherTenant._id, name: 'Other' });
    const foreignCategory = await models.Category.create({ storeId: otherStore._id, name: 'Foreign' });
    await api('GET', '/api/products', undefined, 404, { 'x-store-id': otherStore._id });
    await assert.rejects(models.Product.create({ storeId, categoryId: foreignCategory._id, barcode: 'foreign', name: 'Foreign', costPrice: 1, sellingPrice: 2 }), { code: '23503' });
    await assert.rejects(models.Product.create({ storeId, barcode: '123456789012', name: 'Duplicate', costPrice: 1, sellingPrice: 2 }), { code: '23505' });
    const first = await models.Customer.findById(customerId);
    const stale = await models.Customer.findById(customerId);
    first.walletBalance += 1; await first.save();
    stale.walletBalance += 2;
    await assert.rejects(stale.save(), /Record changed/);
    await assert.rejects(database.transaction(async () => {
        await models.Customer.create({ storeId, name: 'Rollback me' });
        throw new Error('force rollback');
    }), /force rollback/);
    assert.equal(await models.Customer.countDocuments({ name: 'Rollback me' }), 0);
    const supplier = await api('POST', '/api/suppliers', { name: 'Supplier One', phone: '1234567890', openingBalance: 100 }, 201);
    await api('PUT', '/api/suppliers/' + supplier.data._id, { name: 'Supplier Updated' });
    await api('PATCH', '/api/suppliers/' + supplier.data._id + '/payables', { amount: 25 });
    assert.equal((await api('GET', '/api/suppliers/' + supplier.data._id + '/payables')).data.currentBalance, 75);
    await api('DELETE', '/api/suppliers/' + supplier.data._id);
    assert.equal((await api('GET', '/api/suppliers')).data.length, 0);
    await api('PUT', '/api/categories/' + category.data._id, { name: 'Pantry' });
    const dated = await api('GET', '/api/orders?startDate=2000-01-01&endDate=2100-01-01');
    assert.equal(dated.data.length, 1);
    await api('DELETE', '/api/products/' + productId);
    assert.equal((await api('GET', '/api/products')).data.length, 0);
});
