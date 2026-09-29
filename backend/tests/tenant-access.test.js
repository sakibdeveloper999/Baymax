const test = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { tenantAccessError } = require('../utils/tenantAccess');
const { checkSubscription } = require('../middleware/subscription');
const { verifyToken } = require('../middleware/auth');
const { login, refreshToken } = require('../controllers/authController');
process.env.JWT_SECRET = 'test-access-secret';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
const tenantId = '507f1f77bcf86cd799439011';
const active = () => ({ _id: tenantId, isActive: true, subscriptionStatus: 'active', expireAt: new Date(Date.now() + 60000) });
const response = () => ({ statusCode: 200, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } });
const cases = [
    ['suspended status', { subscriptionStatus: 'suspended' }, 'ACCOUNT_SUSPENDED'],
    ['inactive account', { isActive: false }, 'ACCOUNT_SUSPENDED'],
    ['expired status with future date', { subscriptionStatus: 'expired' }, 'SUBSCRIPTION_EXPIRED'],
    ['past expiration', { expireAt: new Date(0) }, 'SUBSCRIPTION_EXPIRED'],
    ['missing expiration', { expireAt: null }, 'SUBSCRIPTION_EXPIRED'],
    ['invalid expiration', { expireAt: 'invalid' }, 'SUBSCRIPTION_EXPIRED'],
    ['unknown status', { subscriptionStatus: 'unknown' }, 'SUBSCRIPTION_EXPIRED'],
];
for (const [name, overrides, code] of cases) {
    test(`all authentication paths reject ${name}`, async (t) => {
        const tenant = { ...active(), ...overrides };
        const user = { _id: 'user', isActive: true, tenantId: tenant, role: 'owner',
            password: await bcrypt.hash('correct-password', 4), save: () => assert.fail('denied login saved user') };
        t.mock.method(User, 'findById', () => ({ populate: async () => user }));
        t.mock.method(User, 'findOne', () => ({ select: () => ({ populate: async () => user }) }));
        const res = response();
        await checkSubscription({ tenant }, res, () => assert.fail('denied tenant reached route'));
        assert.equal(res.body.code, code);
        const accessRes = response();
        await verifyToken({ headers: { authorization: `Bearer ${jwt.sign({ userId: 'user', tenantId }, process.env.JWT_SECRET)}` } }, accessRes, () => assert.fail('denied access'));
        assert.equal(accessRes.statusCode, 403);
        assert.equal(accessRes.body.code, code);
        const refreshRes = response();
        await refreshToken({ body: { refreshToken: jwt.sign({ userId: 'user', tenantId }, process.env.JWT_REFRESH_SECRET) } }, refreshRes);
        assert.equal(refreshRes.body.code, code);
        assert.equal(refreshRes.body.data, undefined);
        const loginRes = response();
        await login({ body: { email: 'owner@example.com', password: 'correct-password' } }, loginRes);
        assert.equal(loginRes.body.code, code);
        assert.equal(loginRes.body.data, undefined);
    });
}
test('expiration is inclusive and a valid active subscription is allowed', () => {
    const tenant = active();
    assert.equal(tenantAccessError(tenant), null);
    assert.equal(tenantAccessError(tenant, tenant.expireAt.getTime()).code, 'SUBSCRIPTION_EXPIRED');
});
test('valid tenant can log in, refresh and access protected routes', async (t) => {
    const tenant = active();
    const user = { _id: 'user', isActive: true, tenantId: tenant, role: 'owner', password: await bcrypt.hash('password', 4), save: async () => {} };
    t.mock.method(User, 'findById', () => ({ populate: async () => user }));
    t.mock.method(User, 'findOne', () => ({ select: () => ({ populate: async () => user }) }));
    const loginRes = response();
    await login({ body: { email: 'owner@example.com', password: 'password' } }, loginRes);
    assert.ok(loginRes.body.data.accessToken);
    const refreshRes = response();
    await refreshToken({ body: { refreshToken: loginRes.body.data.refreshToken } }, refreshRes);
    assert.ok(refreshRes.body.data.accessToken);
    let allowed = false;
    await verifyToken({ headers: { authorization: `Bearer ${refreshRes.body.data.accessToken}` } }, response(), () => { allowed = true; });
    assert.equal(allowed, true);
    allowed = false;
    await checkSubscription({ tenant }, response(), () => { allowed = true; });
    assert.equal(allowed, true);
});
test('access and refresh reject a token belonging to a different tenant', async (t) => {
    t.mock.method(User, 'findById', () => ({ populate: async () => ({ isActive: true, tenantId: active() }) }));
    for (const claim of ['different-tenant', undefined]) {
        const res = response();
        await verifyToken({ headers: { authorization: `Bearer ${jwt.sign({ userId: 'user', tenantId: claim }, process.env.JWT_SECRET)}` } }, res, () => assert.fail('mismatched tenant allowed'));
        assert.equal(res.statusCode, 403);
        const refreshRes = response();
        await refreshToken({ body: { refreshToken: jwt.sign({ userId: 'user', tenantId: claim }, process.env.JWT_REFRESH_SECRET) } }, refreshRes);
        assert.equal(refreshRes.statusCode, 403);
        assert.equal(refreshRes.body.data, undefined);
    }
});
