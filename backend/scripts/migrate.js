require('dotenv').config({ path: require('node:path').join(__dirname, '../.env') });
const database = require('../db/pool');
const { migrate } = require('../db/migrate');
(async () => {
    try { await migrate(); console.log('PostgreSQL migrations applied. No business data imported.'); }
    catch (error) { console.error('Migration failed:', error.code || error.message); process.exitCode = 1; }
    finally { await database.close(); }
})();
