const Plan = require('../models/Plan');
const defaults = require('../config/plans');
async function ensurePlans() {
    for (const plan of defaults) {
        await Plan.updateOne({ name: plan.name }, { $setOnInsert: plan }, { upsert: true, runValidators: true });
    }
}
module.exports = { ensurePlans };
