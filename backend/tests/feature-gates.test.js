process.env.DATABASE_URL = 'postgresql://test:test@localhost/feature_test';
process.env.JWT_SECRET = 'feature-test-access';
process.env.JWT_REFRESH_SECRET = 'feature-test-refresh';
process.env.QR_SECRET = 'feature-test-qr';
process.env.NODE_ENV = 'test';
const test = require('node:test');
const assert = require('node:assert/strict');
const { PGlite } = require('@electric-sql/pglite');
const { Pool } = require('pg');
const db = require('../db/pool');
const { migrate } = require('../db/migrate');
const { ensurePlans } = require('../utils/ensurePlans');
const Tenant = require('../models/Tenant');
const User = require('../models/User');
const Store = require('../models/Store');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Customer = require('../models/Customer');
const Order = require('../models/Order');
const StockLog = require('../models/StockLog');
const { generateAccessToken } = require('../utils/helpers');
const defaults = require('../config/plans');

test('configured feature gates protect mounted APIs and checkout effects', async t => {
    const pg = new PGlite();
    const query = async (sql, values) => {
        const result = values ? await pg.query(sql, values) : (await pg.exec(sql)).at(-1);
        return { rows: result?.rows || [], rowCount: result?.affectedRows || 0 };
    };
    t.mock.method(Pool.prototype, 'query', query);
    t.mock.method(Pool.prototype, 'connect', async () => ({ query, release() {} }));
    t.after(async () => { await db.close(); await pg.close(); });
    await migrate(); await ensurePlans();
    const tenant = await Tenant.create({ businessName: 'Feature Test', ownerEmail: 'owner@example.com', expireAt: new Date(Date.now() + 86400000) });
    const owner = await User.create({ tenantId: tenant._id, name: 'Owner', email: 'owner@example.com', password: 'test-password-123', role: 'owner' });
    const store = await Store.create({ tenantId: tenant._id, name: 'Main', taxRate: 0 });
    const category = await Category.create({ storeId: store._id, name: 'Category' });
    const product = await Product.create({ storeId: store._id, categoryId: category._id, name: 'Product', barcode: '123456789012', costPrice: 1, sellingPrice: 200, stock: 20 });
    const customer = await Customer.create({ storeId: store._id, name: 'Customer', walletBalance: 1000, loyaltyPoints: 10, loyaltyCard: 'CARD-1', creditLimit: 1000 });
    const full = defaults.find(p => p.name === 'standard').features;
    const setFeatures = features => query('UPDATE plans SET features = $1 WHERE name = $2', [JSON.stringify(features), 'basic']);
    const { app } = require('../server');
    const server = app.listen(0, '127.0.0.1');
    await new Promise(resolve => server.once('listening', resolve));
    t.after(() => new Promise(resolve => server.close(resolve)));
    let token = generateAccessToken(owner._id, tenant._id, 'owner');
    async function api(method, route, body) {
        const response = await fetch('http://127.0.0.1:' + server.address().port + route, {
            method, headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token, 'X-Store-ID': store._id },
            body: body === undefined || method === 'GET' ? undefined : JSON.stringify(body),
        });
        return { status: response.status, body: await response.json() };
    }
    const checkout = { items: [{ productId: product._id, quantity: 1, unitPrice: 200 }], paymentMethod: 'cash' };
    const denied = (result, feature) => {
        assert.equal(result.status, 403, JSON.stringify(result.body));
        assert.equal(result.body.code, 'FEATURE_NOT_AVAILABLE');
        assert.equal(result.body.requiredFeature, feature);
    };

    await t.test('Basic permits catalog/POS while customer and supplier methods are blocked', async () => {
        assert.equal((await api('GET', '/api/products')).status, 200);
        assert.equal((await api('GET', '/api/products/barcode/123456789012')).status, 200);
        assert.equal((await api('GET', '/api/categories')).status, 200);
        for (const [method, path, body] of [
            ['GET', '/api/customers'], ['POST', '/api/customers', { name: 'Blocked' }],
            ['GET', '/api/customers/' + customer._id], ['PUT', '/api/customers/' + customer._id, { name: 'Blocked' }],
            ['DELETE', '/api/customers/' + customer._id], ['GET', '/api/customers/' + customer._id + '/wallet'],
            ['PATCH', '/api/customers/' + customer._id + '/wallet', { amount: 10 }],
            ['PATCH', '/api/customers/' + customer._id + '/loyalty/redeem', { points: 1 }],
        ]) denied(await api(method, path, body), 'customers');
        for (const method of ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']) {
            const path = method === 'GET' || method === 'POST' ? '/api/suppliers' : '/api/suppliers/' + customer._id + (method === 'PATCH' ? '/payables' : '');
            denied(await api(method, path, {}), 'suppliers');
        }
        assert.equal((await Customer.findById(customer._id)).name, 'Customer');
    });

    await t.test('custom plans enforce catalog/category/POS gates independently on reads and writes', async () => {
        for (const [feature, requests] of [
            ['products', [['GET', '/api/products'], ['POST', '/api/products', {}], ['GET', '/api/products/' + product._id],
                ['PUT', '/api/products/' + product._id, {}], ['DELETE', '/api/products/' + product._id], ['PATCH', '/api/products/' + product._id + '/stock', {}]]],
            ['categories', [['GET', '/api/categories'], ['POST', '/api/categories', {}], ['PUT', '/api/categories/' + category._id, {}], ['DELETE', '/api/categories/' + category._id]]],
            ['pos', [['POST', '/api/orders', checkout], ['POST', '/api/orders/checkout', checkout], ['GET', '/api/orders'],
                ['GET', '/api/orders/' + product._id], ['GET', '/api/orders/' + product._id + '/receipt'], ['PATCH', '/api/orders/' + product._id + '/status', {}]]],
        ]) {
            await setFeatures(full.filter(value => value !== feature));
            for (const [method, path, body] of requests) denied(await api(method, path, body), feature);
        }
        await setFeatures(['products']);
        assert.equal((await api('POST', '/api/products', { categoryId: category._id, name: 'Catalog only', barcode: '111222333444', costPrice: 1, sellingPrice: 2, stock: 0 })).status, 201);
        assert.equal((await api('GET', '/api/stores')).status, 200);
    });

    await t.test('barcode entitlement is required for lookup while catalog search stays available', async () => {
        await setFeatures(full.filter(value => value !== 'barcodes'));
        denied(await api('GET', '/api/products/barcode/123456789012'), 'barcodes');
        assert.equal((await api('GET', '/api/products?search=Product')).status, 200);
    });

    await t.test('wallet and loyalty cannot be accessed through customer creation or generic responses', async () => {
        await setFeatures(full.filter(value => !['wallet', 'loyalty'].includes(value)));
        denied(await api('GET', '/api/customers/' + customer._id + '/wallet'), 'wallet');
        denied(await api('PATCH', '/api/customers/' + customer._id + '/wallet', { amount: 10 }), 'wallet');
        denied(await api('PATCH', '/api/customers/' + customer._id + '/loyalty/redeem', { points: 1 }), 'loyalty');
        denied(await api('POST', '/api/customers', { name: 'Wallet bypass', walletBalance: 1 }), 'wallet');
        denied(await api('POST', '/api/customers', { name: 'Loyalty bypass', loyaltyCard: 'CARD-2' }), 'loyalty');
        const list = await api('GET', '/api/customers');
        assert.equal(list.body.data[0].walletBalance, undefined);
        assert.equal(list.body.data[0].loyaltyPoints, undefined);
        const detail = await api('GET', '/api/customers/' + customer._id);
        assert.equal(detail.body.data.loyaltyHistory, undefined);
        const created = await api('POST', '/api/customers', { name: 'Allowed customer' });
        assert.equal(created.status, 201);
        assert.equal(created.body.data.walletBalance, undefined);
        const updated = await api('PUT', '/api/customers/' + customer._id, { name: 'Customer edited' });
        assert.equal(updated.body.data.loyaltyCard, undefined);
    });

    let receiptToken;
    await t.test('denied customer/wallet checkout has no stock, order, wallet or loyalty mutations', async () => {
        const before = { orders: await Order.countDocuments(), logs: await StockLog.countDocuments(), product: await Product.findById(product._id), customer: await Customer.findById(customer._id) };
        await setFeatures(full.filter(value => value !== 'customers'));
        for (const method of ['cash', 'credit', 'wallet']) {
            denied(await api('POST', '/api/orders', { ...checkout, customerId: customer._id, paymentMethod: method }), 'customers');
        }
        await setFeatures(full.filter(value => value !== 'wallet'));
        denied(await api('POST', '/api/orders/checkout', { ...checkout, customerId: customer._id, paymentMethod: 'wallet' }), 'wallet');
        assert.equal(await Order.countDocuments(), before.orders);
        assert.equal(await StockLog.countDocuments(), before.logs);
        assert.equal((await Product.findById(product._id)).stock, before.product.stock);
        assert.equal((await Customer.findById(customer._id)).walletBalance, before.customer.walletBalance);
        assert.equal((await Customer.findById(customer._id)).loyaltyPoints, before.customer.loyaltyPoints);
        await setFeatures(full.filter(value => value !== 'loyalty'));
        const allowed = await api('POST', '/api/orders', { ...checkout, customerId: customer._id, paymentMethod: 'wallet' });
        assert.equal(allowed.status, 201);
        receiptToken = allowed.body.data.qrToken;
        assert.equal((await Customer.findById(customer._id)).walletBalance, before.customer.walletBalance - 200);
        assert.equal((await Customer.findById(customer._id)).loyaltyPoints, before.customer.loyaltyPoints);
        await setFeatures(full);
        assert.equal((await api('POST', '/api/orders', { ...checkout, customerId: customer._id })).status, 201);
        assert.equal((await Customer.findById(customer._id)).loyaltyPoints, before.customer.loyaltyPoints + 2);
    });

    await t.test('role guards still reject cashier wallet top-up on an entitled plan', async () => {
        const cashier = await User.create({ tenantId: tenant._id, name: 'Cashier', email: 'cashier@example.com', password: 'test-password-123', role: 'cashier' });
        const saved = token; token = generateAccessToken(cashier._id, tenant._id, 'cashier');
        const result = await api('PATCH', '/api/customers/' + customer._id + '/wallet', { amount: 10 });
        assert.equal(result.status, 403);
        assert.match(result.body.error, /Access denied/);
        token = saved;
    });

    await t.test('malformed or missing features fail closed; profile agrees with UI; public receipts remain available', async () => {
        for (const features of [[123], ['']]) {
            await setFeatures(features);
            const result = await api('GET', '/api/products');
            assert.equal(result.status, 503);
            assert.equal(result.body.code, 'PLAN_NOT_CONFIGURED');
            const profile = await api('GET', '/api/auth/me');
            assert.equal(profile.body.data.planConfigured, false);
            assert.deepEqual(profile.body.data.features, []);
        }
        await setFeatures([]);
        denied(await api('GET', '/api/products'), 'products');
        assert.equal((await api('GET', '/api/stores')).status, 200);
        assert.equal((await api('GET', '/api/orders/receipt/' + receiptToken)).status, 200);
        await query('DELETE FROM plans WHERE name = $1', ['basic']);
        assert.equal((await api('GET', '/api/customers')).status, 503);
        assert.equal((await api('GET', '/api/auth/me')).body.data.planConfigured, false);
    });
});