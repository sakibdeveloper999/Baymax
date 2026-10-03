const test = require('node:test');
const assert = require('node:assert/strict');
const { randomBytes } = require('node:crypto');
const { Pool, Client } = require('pg');
const db = require('../db/pool');
const { migrate } = require('../db/migrate');
const { ensurePlans } = require('../utils/ensurePlans');
const { withCapacity } = require('../db/capacity');
const Tenant = require('../models/Tenant');
const Plan = require('../models/Plan');
const Store = require('../models/Store');
const Product = require('../models/Product');
const User = require('../models/User');
const { newId } = require('../db/ids');

const testUrl = process.env.CAPACITY_TEST_DATABASE_URL;
// Never infer this from the application's DATABASE_URL or load backend/.env.
test('real PostgreSQL serializes competing creates across independent connections', { skip: !testUrl }, async t => {
    const url = new URL(testUrl);
    assert(['localhost', '127.0.0.1', '[::1]'].includes(url.hostname), 'Use an isolated local PostgreSQL service');
    assert.equal(url.pathname, '/baymax_capacity_test', 'Use the dedicated test database');
    process.env.DATABASE_URL = testUrl;
    const schema = 'capacity_test_' + randomBytes(8).toString('hex');
    const admin = new Client({ connectionString: testUrl });
    await admin.connect();
    await admin.query('CREATE SCHEMA "' + schema + '"');
    const actualPool = new Pool({ connectionString: testUrl, max: 5, options: '-c search_path=' + schema });
    // Keep real pool methods before installing the application's test adapter.
    actualPool.connect = actualPool.connect.bind(actualPool);
    actualPool.query = actualPool.query.bind(actualPool);
    t.mock.method(Pool.prototype, 'connect', () => actualPool.connect());
    t.mock.method(Pool.prototype, 'query', (...args) => actualPool.query(...args));
    t.after(async () => {
        await db.close();
        await actualPool.end();
        await admin.query('DROP SCHEMA "' + schema + '" CASCADE');
        await admin.end();
    });
    await migrate();
    await ensurePlans();
    const plan = await Plan.findOne({ name: 'basic' });
    plan.limits = { products: 1, branches: 1, users: 1 }; await plan.save();
    const makeTenant = () => Tenant.create({ businessName: 'Race', ownerEmail: newId() + '@example.com', expireAt: new Date(Date.now() + 60000) });

    for (const name of ['Product', 'Store', 'User']) {
        await t.test(name + ': one final slot admits exactly one writer', async () => {
            const tenant = await makeTenant();
            const store = name === 'Product' ? await Store.create({ tenantId: tenant._id, name: 'Main' }) : null;
            const model = { Product, Store, User }[name];
            const data = () => name === 'Product'
                ? { _id: newId(), storeId: store._id, name: 'Product', barcode: newId(), costPrice: 1, sellingPrice: 2, isActive: true }
                : name === 'Store' ? { _id: newId(), tenantId: tenant._id, name: newId(), isActive: true }
                : { _id: newId(), tenantId: tenant._id, name: 'User', email: newId() + '@example.com', password: 'test-password-123', isActive: true };
            let release, entered;
            const hold = new Promise(resolve => { release = resolve; });
            const locked = new Promise(resolve => { entered = resolve; });
            const firstData = data();
            // Deliberately hold the tenant lock before insertion, while a second connection tries.
            const first = withCapacity(name, firstData, async tx => {
                entered();
                await hold;
                return model.create(firstData, { session: tx });
            });
            await locked;
            let secondFinished = false;
            const second = model.create(data()).then(
                value => { secondFinished = true; return { value }; },
                error => { secondFinished = true; return { error }; },
            );
            try {
                await new Promise(resolve => setTimeout(resolve, 100));
                assert.equal(secondFinished, false, 'second writer must wait for tenant lock');
            } finally { release(); }
            await first;
            const outcome = await second;
            assert.equal(outcome.error?.code, 'PLAN_LIMIT_REACHED');
            const filter = name === 'Product' ? { storeId: store._id } : { tenantId: tenant._id };
            assert.equal(await model.countDocuments(filter), 1);
        });
    }

    await t.test('a rolled-back writer releases its slot to a waiting connection', async () => {
        const tenant = await makeTenant();
        let release, entered;
        const hold = new Promise(resolve => { release = resolve; });
        const locked = new Promise(resolve => { entered = resolve; });
        const first = db.transaction(async () => {
            await Store.create({ tenantId: tenant._id, name: 'Rolled back' });
            entered(); await hold;
            throw new Error('rollback first writer');
        }).catch(error => error);
        await locked;
        const second = Store.create({ tenantId: tenant._id, name: 'Committed' });
        await new Promise(resolve => setTimeout(resolve, 100));
        release();
        assert.match((await first).message, /rollback first writer/);
        await second;
        assert.equal(await Store.countDocuments({ tenantId: tenant._id }), 1);
    });
});