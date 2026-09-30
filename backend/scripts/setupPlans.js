require('dotenv').config({ path: require('node:path').join(__dirname, '../.env') });
const database = require('../db/pool');
(async () => {
    try {
        await require('../config/db')();
        await require('../utils/ensurePlans').ensurePlans();
        console.log('Plan definitions ready. Existing plans preserved.');
    } catch (error) { console.error('Plan setup failed:', error.code || error.message); process.exitCode = 1; }
    finally { await database.close(); }
})();
