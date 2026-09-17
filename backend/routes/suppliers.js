/**
 * Supplier Routes
 * CRUD operations for suppliers with payables tracking
 */

const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

const {
    verifyToken,
    requireRole,
} = require('../middleware/auth');

const {
    checkSubscription,
    checkFeature,
} = require('../middleware/subscription');

const { validate } = require('../middleware/validation');

const {
    supplierSchemas,
} = require('../utils/validationSchemas');

const Supplier = require('../models/Supplier');

const {
    asyncHandler,
    NotFoundError,
    ValidationError,
} = require('../utils/errors');

// ═══════════════════════════════════════════════════════════════
// Helper: Validate MongoDB ObjectId
// ═══════════════════════════════════════════════════════════════

const validateObjectId = (id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ValidationError('Invalid supplier ID');
    }
};

// ═══════════════════════════════════════════════════════════════
// GET /api/suppliers — Get all suppliers
// ═══════════════════════════════════════════════════════════════

router.get('/',
    verifyToken,
    checkSubscription,
    checkFeature('suppliers'),

    asyncHandler(async (req, res) => {

        const {
            page = 1,
            limit = 10,
            search = '',
        } = req.query;

        const pageNumber = Math.max(parseInt(page) || 1, 1);
        const limitNumber = Math.max(parseInt(limit) || 10, 1);

        const skip = (pageNumber - 1) * limitNumber;

        const query = {
            tenantId: req.user.tenantId,
            storeId: req.storeId,
            isActive: true,
        };

        if (search) {
            query.$or = [
                {
                    name: {
                        $regex: search,
                        $options: 'i',
                    },
                },
                {
                    company: {
                        $regex: search,
                        $options: 'i',
                    },
                },
                {
                    phone: {
                        $regex: search,
                        $options: 'i',
                    },
                },
            ];
        }

        const suppliers = await Supplier.find(query)
            .sort({ name: 1 })
            .skip(skip)
            .limit(limitNumber)
            .lean();

        const total = await Supplier.countDocuments(query);

        res.json({
            success: true,
            data: suppliers,

            pagination: {
                page: pageNumber,
                limit: limitNumber,
                total,
                pages: Math.ceil(total / limitNumber),
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

        const {
            name,
            company,
            phone,
            email,
            openingBalance,
        } = req.body;

        const balance = Number(openingBalance) || 0;

        const supplier = new Supplier({
            name,
            company,
            phone,
            email,

            openingBalance: balance,
            currentBalance: balance,

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

        validateObjectId(req.params.id);

        const supplier = await Supplier.findOne({
            _id: req.params.id,
            tenantId: req.user.tenantId,
            storeId: req.storeId,
            isActive: true,
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

        validateObjectId(req.params.id);

        const {
            name,
            company,
            phone,
            email,
        } = req.body;

        const supplier = await Supplier.findOne({
            _id: req.params.id,
            tenantId: req.user.tenantId,
            storeId: req.storeId,
            isActive: true,
        });

        if (!supplier) {
            throw new NotFoundError('Supplier not found');
        }

        if (name !== undefined) {
            supplier.name = name;
        }

        if (company !== undefined) {
            supplier.company = company;
        }

        if (phone !== undefined) {
            supplier.phone = phone;
        }

        if (email !== undefined) {
            supplier.email = email;
        }

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

        validateObjectId(req.params.id);

        const supplier = await Supplier.findOne({
            _id: req.params.id,
            tenantId: req.user.tenantId,
            storeId: req.storeId,
            isActive: true,
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
// GET /api/suppliers/:id/payables
// ═══════════════════════════════════════════════════════════════

router.get('/:id/payables',
    verifyToken,
    checkSubscription,
    checkFeature('suppliers'),

    asyncHandler(async (req, res) => {

        validateObjectId(req.params.id);

        const supplier = await Supplier.findOne({
            _id: req.params.id,
            tenantId: req.user.tenantId,
            storeId: req.storeId,
            isActive: true,
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

                balanceDue: Math.max(
                    supplier.currentBalance,
                    0
                ),

                creditReceived: Math.max(
                    supplier.openingBalance -
                    supplier.currentBalance,
                    0
                ),
            },
        });
    })
);

// ═══════════════════════════════════════════════════════════════
// PATCH /api/suppliers/:id/payables
// Record payment to supplier
// ═══════════════════════════════════════════════════════════════

router.patch('/:id/payables',
    verifyToken,
    checkSubscription,
    checkFeature('suppliers'),
    requireRole(['owner', 'manager']),

    asyncHandler(async (req, res) => {

        validateObjectId(req.params.id);

        const {
            amount,
            method,
            reference,
        } = req.body;

        const paymentAmount = Number(amount);

        if (
            isNaN(paymentAmount) ||
            paymentAmount <= 0
        ) {
            throw new ValidationError(
                'Payment amount must be greater than 0'
            );
        }

        const supplier = await Supplier.findOne({
            _id: req.params.id,
            tenantId: req.user.tenantId,
            storeId: req.storeId,
            isActive: true,
        });

        if (!supplier) {
            throw new NotFoundError('Supplier not found');
        }

        // Prevent overpayment
        if (paymentAmount > supplier.currentBalance) {
            throw new ValidationError(
                'Payment exceeds supplier balance'
            );
        }

        // Reduce balance
        supplier.currentBalance -= paymentAmount;

        await supplier.save();

        // Optional:
        // Save payment transaction history here

        res.json({
            success: true,

            message: `Payment of ${paymentAmount} recorded for ${supplier.name}`,

            data: {
                supplierId: supplier._id,

                amountPaid: paymentAmount,

                newBalance:
                    supplier.currentBalance,

                method,
                reference,
            },
        });
    })
);

module.exports = router;