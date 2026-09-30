const { Pool } = require('pg');
const { AsyncLocalStorage } = require('node:async_hooks');
const context = new AsyncLocalStorage();
let pool;
function getPool() {
    if (!pool) {
        const connectionString = process.env.DATABASE_URL;
        if (!connectionString || !/^postgres(ql)?:\/\//.test(connectionString)) {
            throw new Error('Set DATABASE_URL to your Neon PostgreSQL connection string in backend/.env');
        }
        const url = new URL(connectionString);
        if (url.hostname.endsWith('.neon.tech')) url.searchParams.set('sslmode', 'verify-full');
        pool = new Pool({ connectionString: url.toString(), max: 10, connectionTimeoutMillis: 15000,
            idleTimeoutMillis: 30000, statement_timeout: 30000, idle_in_transaction_session_timeout: 30000 });
        pool.on('error', error => console.error('PostgreSQL pool error:', error.code || 'connection lost'));
    }
    return pool;
}
const query = (text, values, session) => (session || context.getStore() || getPool()).query(text, values);
async function startSession() {
    const client = await getPool().connect();
    let active = false;
    let released = false;
    return {
        query: (text, values) => client.query(text, values),
        async startTransaction() { await client.query('BEGIN'); active = true; },
        async commitTransaction() { await client.query('COMMIT'); active = false; },
        async abortTransaction() { await client.query('ROLLBACK'); active = false; },
        inTransaction: () => active,
        async endSession() {
            if (released) return;
            try { if (active) await client.query('ROLLBACK'); }
            finally { active = false; released = true; client.release(); }
        },
    };
}
async function transaction(work) {
    if (context.getStore()) return work(context.getStore());
    const session = await startSession();
    try {
        await session.startTransaction();
        const result = await context.run(session, () => work(session));
        await session.commitTransaction();
        return result;
    } catch (error) {
        if (session.inTransaction()) await session.abortTransaction();
        throw error;
    } finally { await session.endSession(); }
}
async function close() { if (pool) { const current = pool; pool = null; await current.end(); } }
module.exports = { getPool, query, startSession, transaction, close, currentSession: () => context.getStore() };
