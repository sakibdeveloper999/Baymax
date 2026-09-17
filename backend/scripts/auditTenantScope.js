// Read-only preflight. Does not update data, create indexes, or start a migration.
require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('node:fs');
const path = require('node:path');

async function audit() {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS:5000, autoIndex: false, autoCreate: false });
    try {
        const models = fs.readdirSync(path.join(__dirname, '../models')).filter(file => file.endsWith('.js')).map(file => require('../models/' + file));
        for (const Model of models) {
            if (['Tenant', 'Plan'].includes(Model.modelName)) continue;
            const collection = Model.collection;
            const total = await collection.countDocuments({});
            const missing = await collection.countDocuments({ $or: [{ tenantId: { $exists: false } }, { tenantId: null }] });
            console.log(JSON.stringify({ model: Model.modelName, total, missingTenantId: missing, schemaHasTenantId: Boolean(Model.schema.path('tenantId')) }));
        }
    } finally { await mongoose.disconnect(); }
}
audit().catch(error => { console.error('Tenant audit failed:', error.code || error.name); process.exitCode = 1; });
