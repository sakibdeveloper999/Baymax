const mongoose = require('mongoose');
const Store = require('../models/Store');

// Resolve only stores owned by the authenticated tenant. Never trust a client ID alone.
async function requireStore(req, res, next) {
    try {
        const storeId = req.headers['x-store-id'];
        if (storeId && !mongoose.isValidObjectId(storeId)) {
            return res.status(400).json({ success: false, error: 'Invalid store ID' });
        }
        const query = { tenantId: req.tenant._id, isActive: true };
        if (storeId) query._id = storeId;
        const store = await Store.findOne(query).sort({ createdAt: 1 });
        if (!store) return res.status(404).json({ success: false, error: 'Create or select an active store first' });
        req.store = store;
        req.storeId = store._id;
        next();
    } catch (error) {
        next(error);
    }
}
module.exports = { requireStore };
