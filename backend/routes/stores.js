/**
 * Store Routes
 * Multi-branch/store management for tenants
 */

const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const { checkSubscription, checkLimit } = require('../middleware/subscription');
const { validate } = require('../middleware/validation');
const { storeSchemas } = require('../utils/validationSchemas');
const Store = require('../models/Store');
const {
    asyncHandler,
    NotFoundError,
    ConflictError,
} = require('../utils/errorHandler');

// ═══════════════════════════════════════════════════════════════
// GET /api/stores — List all stores for tenant
// ═══════════════════════════════════════════════════════════════

router.get('/',
    verifyToken,
    checkSubscription,
    asyncHandler(async (req, res) => {
        const stores = await Store.find({
            tenantId: req.user.tenantId,
            isActive: true,
        })
            .select('-__v')
            .lean();

        res.json({
            success: true,
            data: stores,
            total: stores.length,
        });
    })
);

// ═══════════════════════════════════════════════════════════════
// POST /api/stores — Create new store (with limit check)
// ═══════════════════════════════════════════════════════════════

router.post('/',
    verifyToken,
    checkSubscription,
    checkLimit('branches'),
    requireRole(['owner']),
    validate(storeSchemas.create),
    asyncHandler(async (req, res) => {
        const { name, address, phone, taxRate, taxLabel, currency, timezone, receiptFooter, logo } = req.body;

        // Check for duplicate store name within tenant
        const existing = await Store.findOne({
            name,
            tenantId: req.user.tenantId,
        });

        if (existing) {
            throw new ConflictError('Store with this name already exists');
        }

        const store = new Store({
            name,
            address,
            phone,
            taxRate: taxRate || 0,
            taxLabel: taxLabel || 'GST',
            currency: currency || 'USD',
            timezone: timezone || 'UTC',
            receiptFooter,
            logo,
            tenantId: req.user.tenantId,
        });

        await store.save();

        res.status(201).json({
            success: true,
            message: 'Store created successfully',
            data: store,
        });
    })
);

// ═══════════════════════════════════════════════════════════════
// GET /api/stores/:id — Get store details
// ═══════════════════════════════════════════════════════════════

router.get('/:id',
    verifyToken,
    checkSubscription,
    asyncHandler(async (req, res) => {
        const store = await Store.findOne({
            _id: req.params.id,
            tenantId: req.user.tenantId,
            isActive: true,
        });

        if (!store) {
            throw new NotFoundError('Store not found');
        }

        res.json({
            success: true,
            data: store,
        });
    })
);

// ═══════════════════════════════════════════════════════════════
// PUT /api/stores/:id — Update store configuration
// ═══════════════════════════════════════════════════════════════

router.put('/:id',
    verifyToken,
    checkSubscription,
    requireRole(['owner', 'manager']),
    validate(storeSchemas.update),
    asyncHandler(async (req, res) => {
        const { name, address, phone, taxRate, taxLabel, currency, timezone, receiptFooter, logo } = req.body;

        const store = await Store.findOne({
            _id: req.params.id,
            tenantId: req.user.tenantId,
        });

        if (!store) {
            throw new NotFoundError('Store not found');
        }

        // Check for duplicate name if being changed
        if (name && name !== store.name) {
            const duplicate = await Store.findOne({
                name,
                tenantId: req.user.tenantId,
                _id: { $ne: req.params.id },
            });

            if (duplicate) {
                throw new ConflictError('Store with this name already exists');
            }

            store.name = name;
        }

        if (address) store.address = address;
        if (phone) store.phone = phone;
        if (taxRate !== undefined) store.taxRate = taxRate;
        if (taxLabel) store.taxLabel = taxLabel;
        if (currency) store.currency = currency;
        if (timezone) store.timezone = timezone;
        if (receiptFooter !== undefined) store.receiptFooter = receiptFooter;
        if (logo !== undefined) store.logo = logo;

        await store.save();

        res.json({
            success: true,
            message: 'Store updated successfully',
            data: store,
        });
    })
);

// ═══════════════════════════════════════════════════════════════
// DELETE /api/stores/:id — Soft delete store
// ═══════════════════════════════════════════════════════════════

router.delete('/:id',
    verifyToken,
    checkSubscription,
    requireRole(['owner']),
    asyncHandler(async (req, res) => {
        const store = await Store.findOne({
            _id: req.params.id,
            tenantId: req.user.tenantId,
        });

        if (!store) {
            throw new NotFoundError('Store not found');
        }

        if (store.isActive === false) {
            throw new ConflictError('Store is already deleted');
        }

        store.isActive = false;
        await store.save();

        res.json({
            success: true,
            message: 'Store deleted successfully',
        });
    })
);

module.exports = router;
