require('dotenv').config({ path: require('node:path').join(__dirname, '../.env') });
const database = require('../db/pool');
(async () => {
    try {
        await database.query('SELECT 1');
        const { rows } = await database.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename");
        console.log('PostgreSQL connection verified. Public tables:', rows.map(row => row.tablename));
    } catch (error) { console.error('Database check failed:', error.code || error.message); process.exitCode = 1; }
    finally { await database.close(); }
})();
