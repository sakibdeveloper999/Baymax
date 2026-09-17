const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const mongoose = require('mongoose');
const { requireRole } = require('../middleware/auth');
const { requireStore } = require('../middleware/store');
const Store = require('../models/Store');
const Order = require('../models/Order');
const { calculateBilling } = require('../utils/helpers');
const schemas = require('../utils/validationSchemas');

function response() {
    return { statusCode: 200, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } };
}
test('all backend models, routes, middleware and utilities load', () => {
    for (const dir of ['models', 'routes', 'middleware', 'utils']) {
        for (const file of fs.readdirSync(path.join(__dirname, '..', dir))) {
            if (file.endsWith('.js')) assert.doesNotThrow(() => require('../' + dir + '/' + file));
        }
    }
});
test('role checks accept both call styles and deny unauthorized users', () => {
    for (const roles of [['owner', 'manager'], [['owner', 'manager']]]) {
        let called = false;
        requireRole(...roles)({ user: { role: 'manager' } }, response(), () => { called = true; });
        assert.equal(called, true);
        const res = response();
        requireRole(...roles)({ user: { role: 'cashier' } }, res, () => assert.fail('unauthorized'));
        assert.equal(res.statusCode, 403);
    }
});
test('store selection enforces tenant ownership and rejects unknown stores', async (t) => {
    const tenantId = new mongoose.Types.ObjectId();
    const storeId = new mongoose.Types.ObjectId().toString();
    t.mock.method(Store, 'findOne', (query) => {
        assert.equal(query.tenantId, tenantId);
        assert.equal(query._id, storeId);
        assert.equal(query.isActive, true);
        return { sort: async () => null };
    });
    const req = { headers: { 'x-store-id': storeId }, tenant: { _id: tenantId } };
    const res = response();
    await requireStore(req, res, () => assert.fail('unknown store authorized'));
    assert.equal(res.statusCode, 404);
    assert.equal(req.storeId, undefined);
});
test('store selection rejects malformed IDs', async () => {
    const res = response();
    await requireStore({ headers: { 'x-store-id': 'invalid' }, tenant: {} }, res, () => assert.fail());
    assert.equal(res.statusCode, 400);
});
test('new orders generate numbers before required-field validation', async () => {
    const order = new Order({ storeId: new mongoose.Types.ObjectId(), cashierId: new mongoose.Types.ObjectId(),
        items: [{ productId: new mongoose.Types.ObjectId(), quantity: 1, unitPrice: 10, total: 10 }],
        subtotal: 10, discount: 2, discountType: 'flat', tax: 0, total: 8, profit: 3 });
    await order.validate();
    assert.match(order.orderNumber, /^ORD-/);
    assert.equal(order.discount, 2);
    assert.equal(order.profit, 3);
});
test('checkout accepts a zero discount and customer defaults validate', () => {
    const result = schemas.orderSchemas.checkout.validate({ items: [{ productId: 'abc', quantity: 1, unitPrice: 10 }],
        paymentMethod: 'cash', discount: { type: 'flat', value: 0 } });
    assert.equal(result.error, undefined);
    assert.equal(schemas.customerSchemas.create.validate({ name: 'Customer' }).error, undefined);
});
test('billing never becomes negative from excessive or negative discounts', () => {
    const items = [{ unitPrice: 10, quantity: 2 }];
    assert.equal(calculateBilling(items, 200, 'percent', 10).total, 0);
    assert.equal(calculateBilling(items, -10, 'flat', 0).total, 20);
});
