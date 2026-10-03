const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');
const { io: connect } = require('socket.io-client');
const User = require('../models/User');
const Store = require('../models/Store');
const { installSocketAccess, storeRoom } = require('../middleware/socketAccess');

process.env.JWT_SECRET = 'socket-test-access-secret';
const A = 'aaaaaaaaaaaaaaaaaaaaaaaa';
const B = 'bbbbbbbbbbbbbbbbbbbbbbbb';
const U = '111111111111111111111111';
const V = '222222222222222222222222';
const S = '333333333333333333333333';
const T = '444444444444444444444444';
const OTHER = '555555555555555555555555';
const activeTenant = id => ({ _id: id, isActive: true, subscriptionStatus: 'active', expireAt: new Date(Date.now() + 60000) });
const token = (userId = U, tenantId = A, options = { expiresIn: '1h' }, secret = process.env.JWT_SECRET) =>
    jwt.sign({ userId, tenantId }, secret, options);
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
function event(socket, name) {
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            socket.off(name, handler);
            reject(new Error('Timed out waiting for ' + name));
        }, 4000);
        function handler(...args) { clearTimeout(timeout); resolve(args); }
        socket.once(name, handler);
    });
}
const join = (socket, id) => new Promise((resolve, reject) => {
    socket.timeout(2000).emit('join:store', id, (error, response) => error ? reject(error) : resolve(response));
});

async function setup(t, options = {}) {
    const users = new Map([
        [U, { _id: U, isActive: true, tenantId: activeTenant(A) }],
        [V, { _id: V, isActive: true, tenantId: activeTenant(B) }],
    ]);
    const stores = new Map([
        [S, { _id: S, tenantId: A, isActive: true }],
        [T, { _id: T, tenantId: A, isActive: true }],
        [OTHER, { _id: OTHER, tenantId: B, isActive: true }],
    ]);
    t.mock.method(User, 'findById', id => ({ populate: async () => structuredClone(users.get(id)) }));
    t.mock.method(Store, 'findOne', async query => {
        const store = stores.get(query._id);
        return store && store.tenantId === query.tenantId && store.isActive === query.isActive ? structuredClone(store) : null;
    });
    const server = http.createServer();
    const io = new Server(server);
    installSocketAccess(io, { recheckMs: 80, lookupTimeoutMs: 150, ...options });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const clients = [];
    const client = (authToken = token(), extra = {}) => {
        const socket = connect('http://127.0.0.1:' + server.address().port, {
            transports: ['websocket'], reconnection: false, forceNew: true,
            auth: authToken === null ? {} : { token: authToken }, ...extra,
        });
        clients.push(socket);
        return socket;
    };
    t.after(async () => {
        clients.forEach(socket => socket.disconnect());
        await new Promise(resolve => io.close(resolve));
    });
    return { io, users, stores, client };
}

test('socket handshakes reject invalid access credentials', async t => {
    const ctx = await setup(t);
    const cases = [
        ['missing', null, 'AUTH_REQUIRED'],
        ['malformed', 'bad-token', 'INVALID_TOKEN'],
        ['wrong signing key / refresh token', token(U, A, { expiresIn: '1h' }, 'refresh-secret'), 'INVALID_TOKEN'],
        ['expired', token(U, A, { expiresIn: -1 }), 'TOKEN_EXPIRED'],
        ['missing expiry', token(U, A, {}), 'INVALID_TOKEN'],
        ['missing tenant', jwt.sign({ userId: U }, process.env.JWT_SECRET, { expiresIn: '1h' }), 'INVALID_TOKEN'],
        ['malformed user ID', token('bad-id'), 'INVALID_TOKEN'],
        ['tenant mismatch', token(U, B), 'INVALID_TOKEN'],
        ['non-string', { token: 'bad' }, 'AUTH_REQUIRED'],
    ];
    for (const [name, value, code] of cases) {
        const socket = ctx.client(value);
        const [error] = await event(socket, 'connect_error');
        assert.equal(error.data.code, code, name);
        assert.equal(socket.connected, false);
        socket.close();
    }
    const queryOnly = ctx.client(null, { query: { token: token() } });
    assert.equal((await event(queryOnly, 'connect_error'))[0].data.code, 'AUTH_REQUIRED');
    assert.equal(ctx.io.of('/').sockets.size, 0);
});

test('socket handshake uses current user and tenant policy', async t => {
    const { users, client } = await setup(t);
    for (const [name, override, code] of [
        ['inactive tenant', { isActive: false }, 'ACCOUNT_SUSPENDED'],
        ['suspended', { subscriptionStatus: 'suspended' }, 'ACCOUNT_SUSPENDED'],
        ['expired status', { subscriptionStatus: 'expired' }, 'SUBSCRIPTION_EXPIRED'],
        ['past expiry', { expireAt: new Date(0) }, 'SUBSCRIPTION_EXPIRED'],
        ['missing expiry', { expireAt: null }, 'SUBSCRIPTION_EXPIRED'],
        ['invalid expiry', { expireAt: 'invalid' }, 'SUBSCRIPTION_EXPIRED'],
        ['unknown status', { subscriptionStatus: 'other' }, 'SUBSCRIPTION_EXPIRED'],
    ]) {
        users.get(U).tenantId = { ...activeTenant(A), ...override };
        const socket = client();
        assert.equal((await event(socket, 'connect_error'))[0].data.code, code, name);
        socket.close();
    }
    users.get(U).tenantId = activeTenant(A);
    users.get(U).isActive = false;
    assert.equal((await event(client(), 'connect_error'))[0].data.code, 'ACCOUNT_SUSPENDED');
    users.delete(U);
    assert.equal((await event(client(), 'connect_error'))[0].data.code, 'ACCOUNT_SUSPENDED');
});

test('store joins enforce ownership, reject invalid input and switch a single scoped room', async t => {
    const { client, io, stores } = await setup(t);
    const a = client();
    const b = client(token(V, B));
    await Promise.all([event(a, 'connect'), event(b, 'connect')]);
    assert.equal((await join(a, S)).success, true);
    assert.equal((await join(b, OTHER)).success, true);
    const serverA = io.of('/').sockets.get(a.id);
    assert(serverA.rooms.has(storeRoom(A, S)));
    assert(!serverA.rooms.has('store:' + S));
    for (const input of [null, {}, [S], 'bad-id']) {
        assert.equal((await join(a, input)).code, 'INVALID_STORE_ID');
    }
    assert.equal((await join(a, OTHER)).code, 'STORE_ACCESS_DENIED');
    assert.equal((await join(a, '666666666666666666666666')).code, 'STORE_ACCESS_DENIED');
    stores.get(T).isActive = false;
    assert.equal((await join(a, T)).code, 'STORE_ACCESS_DENIED');
    stores.get(T).isActive = true;
    assert(serverA.rooms.has(storeRoom(A, S)));
    const receivedA = [], receivedB = [];
    a.on('inventory:test', value => receivedA.push(value));
    b.on('inventory:test', value => receivedB.push(value));
    const delivered = event(a, 'inventory:test');
    io.to(storeRoom(A, S)).emit('inventory:test', 'tenant A only');
    await delivered;
    await delay(20);
    assert.deepEqual(receivedA, ['tenant A only']);
    assert.deepEqual(receivedB, []);
    await Promise.all([join(a, S), join(a, T)]);
    assert(!serverA.rooms.has(storeRoom(A, S)));
    assert(serverA.rooms.has(storeRoom(A, T)));
    assert.equal([...serverA.rooms].filter(room => room.startsWith('tenant:')).length, 1);
    assert.equal((await join(a, T)).success, true);
});

test('Bearer header credentials work without auth/query tokens', async t => {
    const { client } = await setup(t);
    const socket = client(null, { extraHeaders: { Authorization: 'Bearer ' + token() } });
    await event(socket, 'connect');
    assert.equal((await join(socket, S)).success, true);
});

test('idle sockets lose rooms after user, tenant or store revocation', async t => {
    for (const scenario of [
        ['user disabled', c => { c.users.get(U).isActive = false; }],
        ['user removed', c => c.users.delete(U)],
        ['tenant suspended', c => { c.users.get(U).tenantId.subscriptionStatus = 'suspended'; }],
        ['tenant disabled', c => { c.users.get(U).tenantId.isActive = false; }],
        ['tenant changed', c => { c.users.get(U).tenantId = activeTenant(B); }],
        ['tenant expiry removed', c => { c.users.get(U).tenantId.expireAt = null; }],
        ['store disabled', c => { c.stores.get(S).isActive = false; }],
        ['store transferred', c => { c.stores.get(S).tenantId = B; }],
    ]) {
        await t.test(scenario[0], async sub => {
            const ctx = await setup(sub);
            const socket = ctx.client();
            await event(socket, 'connect');
            await join(socket, S);
            const revoked = event(socket, 'access:revoked');
            const disconnected = event(socket, 'disconnect');
            scenario[1](ctx);
            assert.equal((await revoked)[0].success, false);
            assert.equal((await disconnected)[0], 'io server disconnect');
            assert.equal(ctx.io.of('/').adapter.rooms.has(storeRoom(A, S)), false);
        });
    }
});

test('incoming events recheck access before a new join even before the idle timer', async t => {
    const { client, users, io } = await setup(t, { recheckMs: 60000 });
    const socket = client();
    await event(socket, 'connect');
    await join(socket, S);
    users.get(U).tenantId.subscriptionStatus = 'suspended';
    const disconnected = event(socket, 'disconnect');
    socket.emit('join:store', T);
    await disconnected;
    assert.equal(io.of('/').adapter.rooms.has(storeRoom(A, T)), false);
    assert.equal(io.of('/').adapter.rooms.has(storeRoom(A, S)), false);
});

test('expiry timers disconnect idle sockets at tenant or token expiry', async t => {
    await t.test('tenant expiry', async sub => {
        const { client, users } = await setup(sub, { recheckMs: 60000 });
        users.get(U).tenantId.expireAt = new Date(Date.now() + 1000);
        const socket = client();
        await event(socket, 'connect');
        const [reason] = await event(socket, 'disconnect');
        assert.equal(reason, 'io server disconnect');
    });
    await t.test('JWT expiry', async sub => {
        const { client } = await setup(sub, { recheckMs: 60000 });
        const short = jwt.sign({ userId: U, tenantId: A, exp: Math.ceil(Date.now() / 1000) + 1 }, process.env.JWT_SECRET);
        const socket = client(short);
        await event(socket, 'connect');
        assert.equal((await event(socket, 'disconnect'))[0], 'io server disconnect');
    });
});

test('database failures fail closed and do not expose internal errors', async t => {
    const { client } = await setup(t);
    t.mock.method(User, 'findById', () => { throw new Error('sensitive-database-detail'); });
    const [error] = await event(client(), 'connect_error');
    assert.equal(error.data.code, 'ACCESS_CHECK_FAILED');
    assert(!error.message.includes('sensitive'));
});

test('stalled lookups time out on connection and on idle revalidation', async t => {
    const ctx = await setup(t);
    const socket = ctx.client();
    await event(socket, 'connect');
    await join(socket, S);
    t.mock.method(User, 'findById', () => ({ populate: () => new Promise(() => {}) }));
    const disconnected = event(socket, 'disconnect');
    const [error] = await event(ctx.client(), 'connect_error');
    assert.equal(error.data.code, 'ACCESS_CHECK_FAILED');
    await disconnected;
    assert.equal(ctx.io.of('/').adapter.rooms.has(storeRoom(A, S)), false);
});

test('a delayed join cannot restore rooms after disconnection', async t => {
    const { client, io } = await setup(t, { recheckMs: 60000, lookupTimeoutMs: 1000 });
    const socket = client();
    await event(socket, 'connect');
    const serverSocket = io.of('/').sockets.get(socket.id);
    let release, started;
    const pending = new Promise(resolve => { release = resolve; });
    const lookupStarted = new Promise(resolve => { started = resolve; });
    t.mock.method(Store, 'findOne', () => { started(); return pending; });
    socket.emit('join:store', S);
    await lookupStarted;
    const disconnected = event(socket, 'disconnect');
    serverSocket.disconnect(true);
    await disconnected;
    release({ _id: S, tenantId: A, isActive: true });
    await delay(30);
    assert.equal(io.of('/').adapter.rooms.has(storeRoom(A, S)), false);
});

test('application server wires the socket authentication middleware', async t => {
    const { app, server } = require('../server');
    const io = app.get('io');
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const socket = connect('http://127.0.0.1:' + server.address().port, { transports: ['websocket'], reconnection: false });
    t.after(async () => {
        socket.close();
        await new Promise(resolve => io.close(resolve));
    });
    assert.equal((await event(socket, 'connect_error'))[0].data.code, 'AUTH_REQUIRED');
});

test("default polling transport also authenticates and authorizes joins", async t => {
    const { client } = await setup(t);
    const socket = client(token(), { transports: ["polling"] });
    await event(socket, "connect");
    assert.equal((await join(socket, S)).success, true);
});
