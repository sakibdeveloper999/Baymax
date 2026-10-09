const test = require('node:test');
const assert = require('node:assert/strict');
const Plan = require('../models/Plan');
const defaults = require('../config/plans');
const { ensurePlans } = require('../utils/ensurePlans');
const { checkFeature } = require('../middleware/subscription');
test('initialization inserts missing plans without replacing configured plans', async (t) => {
    const existing = { name: 'basic', features: ['custom'], price: 7 };
    const records = new Map([['basic', existing]]);
    t.mock.method(Plan, 'updateOne', async (filter, update, options) => {
        assert.deepEqual(Object.keys(update), ['$setOnInsert']);
        assert.equal(options.upsert, true);
        if (!records.has(filter.name)) records.set(filter.name, update.$setOnInsert);
    });
    await ensurePlans();
    await ensurePlans();
    assert.equal(records.size, 3);
    assert.deepEqual(records.get('basic'), existing);
});
for (const [name, expected] of [['basic', 403], ['standard', 200], ['pro', 200], ['missing', 503]]) {
    test(`supplier access for ${name} returns ${expected}`, async (t) => {
        t.mock.method(Plan, 'findOne', async () => defaults.find(plan => plan.name === name));
        const res = { statusCode: 200, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } };
        let allowed = false;
        await checkFeature('suppliers')({ tenant: { plan: name } }, res, () => { allowed = true; });
        assert.equal(res.statusCode, expected);
        assert.equal(allowed, expected === 200);
        if (expected === 503) assert.equal(res.body.code, 'PLAN_NOT_CONFIGURED');
    });
}


test("malformed feature configuration denies access instead of throwing or matching strings", async t => {
    for (const features of [null, "suppliers", {}, [123], [""]]) {
        t.mock.method(Plan, "findOne", async () => ({ features }));
        const res = { status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } };
        await checkFeature("suppliers")({ tenant: { plan: "basic" } }, res, () => assert.fail("malformed features allowed access"));
        assert.equal(res.statusCode, 503);
        assert.equal(res.body.code, "PLAN_NOT_CONFIGURED");
    }
});

test("feature lookup failures reach error handling without allowing the operation", async t => {
    const failure = new Error("database unavailable");
    t.mock.method(Plan, "findOne", async () => { throw failure; });
    let seen;
    await checkFeature("suppliers")({ tenant: { plan: "basic" } }, {}, error => { seen = error; });
    assert.equal(seen, failure);
});
