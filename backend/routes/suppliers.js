/**
 * Supplier Routes
 * CRUD operations for suppliers with payables tracking
 */

const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const { checkSubscription, checkFeature } = require('../middleware/subscription');
const { validate } = require('../middleware/validation');
const { supplierSchemas } = require('../utils/validationSchemas');
const Supplier = require('../models/Supplier');
const {
    asyncHandler,
    NotFoundError,
    ConflictError,
    ValidationError,
    // ═══════════════════════════════════════════════════════════════

    router.get('/',
        verifyToken,
        checkSubscription,
        checkFeature('suppliers'),
        asyncHandler(async (req, res) => {
            const { page = 1, limit = 10, search = '' } = req.query;

            const skip = (page - 1) * limit;
            const query = {
                tenantId: req.user.tenantId,
                storeId: req.storeId,
                isActive: true,
            };

            if (search) {
                query.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { company: { $regex: search, $options: 'i' } },
                    { phone: { $regex: search, $options: 'i' } },
                ];
            }

            const suppliers = await Supplier.find(query)
                .sort({ name: 1 })
                .skip(skip)
                .limit(parseInt(limit))
                .lean();

            const total = await Supplier.countDocuments(query);

            res.json({
                success: true,
                data: suppliers,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit),
                },
            });
        })
    );

// ═══════════════════════════════════════════════════════════════
// POST /api/suppliers — Create supplier
// ═══════════════════════════════════════════════════════════════

router.post('/',
    verifyToken,
    checkSubscription,
    checkFeature('suppliers'),
    requireRole(['owner', 'manager']),
    validate(supplierSchemas.create),
    asyncHandler(async (req, res) => {
        const { name, company, phone, email, openingBalance } = req.body;

        const supplier = new Supplier({
            name,
            company,
            phone,
            email,
            openingBalance: openingBalance || 0,
            currentBalance: openingBalance || 0,
            tenantId: req.user.tenantId,
            storeId: req.storeId,
        });

        await supplier.save();

        res.status(201).json({
            success: true,
            message: 'Supplier created successfully',
            data: supplier,
        });
    })
);

// ═══════════════════════════════════════════════════════════════
// GET /api/suppliers/:id — Get supplier details
// ═══════════════════════════════════════════════════════════════

router.get('/:id',
    verifyToken,
    checkSubscription,
    checkFeature('suppliers'),
    asyncHandler(async (req, res) => {
        const supplier = await Supplier.findOne({
            _id: req.params.id,
            tenantId: req.user.tenantId,
            storeId: req.storeId,
        });

        if (!supplier) {
            throw new NotFoundError('Supplier not found');
        }

        res.json({
            success: true,
            data: supplier,
        });
    })
);

// ═══════════════════════════════════════════════════════════════
// PUT /api/suppliers/:id — Update supplier
// ═══════════════════════════════════════════════════════════════

router.put('/:id',
    verifyToken,
    checkSubscription,
    checkFeature('suppliers'),
    requireRole(['owner', 'manager']),
    validate(supplierSchemas.update),
    asyncHandler(async (req, res) => {
        const { name, company, phone, email } = req.body;

        const supplier = await Supplier.findOne({
            _id: req.params.id,
            tenantId: req.user.tenantId,
            storeId: req.storeId,
        });

        if (!supplier) {
            throw new NotFoundError('Supplier not found');
        }

        if (name) supplier.name = name;
        if (company !== undefined) supplier.company = company;
        if (phone) supplier.phone = phone;
        if (email) supplier.email = email;

        await supplier.save();

        res.json({
            success: true,
            message: 'Supplier updated successfully',
            data: supplier,
        });
    })
);

// ═══════════════════════════════════════════════════════════════
// DELETE /api/suppliers/:id — Soft delete supplier
// ═══════════════════════════════════════════════════════════════

router.delete('/:id',
    verifyToken,
    checkSubscription,
    checkFeature('suppliers'),
    requireRole(['owner', 'manager']),
    asyncHandler(async (req, res) => {
        const supplier = await Supplier.findOne({
            _id: req.params.id,
            tenantId: req.user.tenantId,
            storeId: req.storeId,
        });

        if (!supplier) {
            throw new NotFoundError('Supplier not found');
        }

        supplier.isActive = false;
        await supplier.save();

        res.json({
            success: true,
            message: 'Supplier deleted successfully',
        });
    })
);

// ═══════════════════════════════════════════════════════════════
// GET /api/suppliers/:id/payables — Get payables/balance due
// ═══════════════════════════════════════════════════════════════

router.get('/:id/payables',
    verifyToken,
    checkSubscription,
    checkFeature('suppliers'),
    asyncHandler(async (req, res) => {
        const supplier = await Supplier.findOne({
            _id: req.params.id,
            tenantId: req.user.tenantId,
            storeId: req.storeId,
        });

        if (!supplier) {
            throw new NotFoundError('Supplier not found');
        }

        res.json({
            success: true,
            data: {
                supplierId: supplier._id,
                name: supplier.name,
                openingBalance: supplier.openingBalance,
                currentBalance: supplier.currentBalance,
                balanceDue: Math.max(supplier.currentBalance, 0),
                creditReceived: supplier.openingBalance - supplier.currentBalance,
            },
        });
    })
);

// ═══════════════════════════════════════════════════════════════
// PATCH /api/suppliers/:id/payables — Record payment to supplier
// ═══════════════════════════════════════════════════════════════

router.patch('/:id/payables',
    verifyToken,
    checkSubscription,
    checkFeature('suppliers'),
    requireRole(['owner', 'manager']),
    asyncHandler(async (req, res) => {
        const { amount, method, reference } = req.body;

        if (!amount || amount <= 0) {
            throw new ValidationError('Payment amount must be greater than 0');
        }

        const supplier = await Supplier.findOne({
            _id: req.params.id,
            tenantId: req.user.tenantId,
            storeId: req.storeId,
        });

        if (!supplier) {
            throw new NotFoundError('Supplier not found');
        }

        // Reduce balance (payment decreases what we owe)
        supplier.currentBalance -= amount;

        // Log payment in BankTransaction (optional, if banking module exists)
        // await BankTransaction.create({ ... })

        await supplier.save();

        res.json({
            success: true,
            message: `Payment of ${amount} recorded for ${supplier.name}`,
            data: {
                supplierId: supplier._id,
                amountPaid: amount,
                newBalance: supplier.currentBalance,
                method,
                reference,
            },
        });
    })
);

module.exports = router;
