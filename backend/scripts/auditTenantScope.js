require('dotenv').config({ path: require('node:path').join(__dirname, '../.env') });
const database = require('../db/pool');
(async () => {
    try {
        const { rows } = await database.query('SELECT count(*) AS stores_without_tenant FROM stores s LEFT JOIN tenants t ON t._id = s."tenantId" WHERE t._id IS NULL');
        console.log(rows[0]);
    } catch (error) { console.error('Audit failed:', error.code || error.message); process.exitCode = 1; }
    finally { await database.close(); }
})();
