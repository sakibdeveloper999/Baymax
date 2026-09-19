require('dotenv').config();
const mongoose = require('mongoose');
const { ensurePlans } = require('../utils/ensurePlans');
(async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, { autoIndex: false, autoCreate: false, serverSelectionTimeoutMS: 5000 });
        await ensurePlans();
        console.log('Plan definitions ready. Existing plans and tenant subscriptions were not changed.');
    } catch (error) { console.error('Plan setup failed:', error.code || error.name); process.exitCode = 1; }
    finally { await mongoose.disconnect(); }
})();
