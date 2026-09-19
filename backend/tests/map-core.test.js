process.env.QR_SECRET = 'test-only-qr-secret-not-for-production';
const test = require('node:test');
const assert = require('node:assert/strict');
const Order = require('../models/Order');
const { generateQrToken, verifyQrToken } = require('../utils/qrService');
const { getPublicReceipt } = require('../controllers/receiptController');

test('public receipt rejects invalid tokens before querying orders', async (t) => {
    t.mock.method(Order, 'findOne', () => assert.fail('invalid token reached database'));
    await assert.rejects(getPublicReceipt({ params: { token: 'bad-token' } }, {}), /QR token/);
});
test('public receipt exposes only customer-facing data without requiring login', async (t) => {
    const id = '507f1f77bcf86cd799439011';
    const { token } = generateQrToken(id);
    t.mock.method(Order, 'findOne', (query) => {
        assert.deepEqual(query, { _id: id, qrToken: token });
        return { select: () => ({ populate: async () => ({
            orderNumber: 'ORD-1', tenantId: 'private-tenant', cashierId: 'private-user',
            customerId: { name: 'Private customer', email: 'private@example.com' }, profit: 5,
            storeId: { name: 'Store', currency: 'USD', tenantId: 'private-tenant' },
            items: [{ productName: 'Rice', quantity: 1, unitPrice: 10, total: 10, costPrice: 5 }],
            subtotal: 10, discount: 0, tax: 0, total: 10, paymentMethod: 'cash', status: 'completed',
        }) }) };
    });
    let result;
    await getPublicReceipt({ params: { token } }, { set() {}, json(body) { result = body; } });
    assert.equal(result.data.billing.total, 10);
    assert.equal(result.data.items[0].productName, 'Rice');
    for (const field of ['costPrice', 'profit', 'tenantId', 'cashierId', 'customerId']) assert.equal(JSON.stringify(result).includes(field), false);
});
test('QR tokens reject tampering and expire after 30 days', (t) => {
    const now = Date.now();
    const { token } = generateQrToken('507f1f77bcf86cd799439011');
    assert.equal(verifyQrToken(token).valid, true);
    assert.equal(verifyQrToken('invalid').valid, false);
    t.mock.method(Date, 'now', () => now + 31 * 86400000);
    assert.equal(verifyQrToken(token).status, 'expired');
});

test('QR tokens reject extra segments and future timestamps', (t) => {
    const now = Date.now();
    const { token } = generateQrToken('507f1f77bcf86cd799439011');
    const extra = Buffer.from(Buffer.from(token, 'base64url').toString('utf8') + ':extra').toString('base64url');
    assert.equal(verifyQrToken(extra).valid, false);
    t.mock.method(Date, 'now', () => now - 60000);
    assert.equal(verifyQrToken(token).valid, false);
});
