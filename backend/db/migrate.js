const fs = require('node:fs/promises');
const path = require('node:path');
const db = require('./pool');
async function migrate() {
    return db.transaction(async session => {
        // Serialize migrations across API instances.
        await session.query('SELECT pg_advisory_xact_lock(724091103)');
        await session.query('CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())');
        const directory = path.join(__dirname, 'migrations');
        for (const name of (await fs.readdir(directory)).filter(name => name.endsWith('.sql')).sort()) {
            const existing = await session.query('SELECT name FROM schema_migrations WHERE name = $1', [name]);
            if (existing.rows.length) continue;
            await session.query(await fs.readFile(path.join(directory, name), 'utf8'));
            await session.query('INSERT INTO schema_migrations (name) VALUES ($1)', [name]);
        }
    });
}
module.exports = { migrate };
