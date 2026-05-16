/**
 * Customer Routes
 * CRUD operations for customers with credit/wallet/loyalty management
 */

const express = require('express');
const Joi = require('joi');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const { checkSubscription, checkFeature } = require('../middleware/subscription');
const { validate } = require('../middleware/validation');
const { customerSchemas, paginationSchema } = require('../utils/validationSchemas');
const Customer = require('../models/Customer');
const LoyaltyTransaction = require('../models/LoyaltyTransaction');
const {
    asyncHandler,
    NotFoundError,
    ValidationError,
} = require('../utils/errorHandler');

// ═══════════════════════════════════════════════════════════════
// GET /api/customers — List customers with pagination/search
// ═══════════════════════════════════════════════════════════════

router.get('/',
    verifyToken,
    checkSubscription,
    asyncHandler(async (req, res) => {
        const { page = 1, limit = 10, search = '', sortBy = 'name', sortOrder = 'asc' } = req.query;

        const skip = (page - 1) * limit;
        const query = {
            tenantId: req.user.tenantId,
            storeId: req.storeId,
            isActive: true,
        };

        // Add search filter
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
            ];
        }

        const customers = await Customer.find(query)
            .select('-__v')
            .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .lean();

        const total = await Customer.countDocuments(query);

        res.json({
            success: true,
            data: customers,
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
// POST /api/customers — Create customer
// ═══════════════════════════════════════════════════════════════

router.post('/',
    verifyToken,
    checkSubscription,
    checkFeature('customers'),
    requireRole(['owner', 'manager', 'cashier']),
    validate(customerSchemas.create),
    asyncHandler(async (req, res) => {
        const { name, phone, email, loyaltyCard, creditLimit, walletBalance } = req.body;

        const customer = new Customer({
            name,
            phone,
            email,
            loyaltyCard,
            creditLimit: creditLimit || 0,
            creditBalance: 0,
            walletBalance: walletBalance || 0,
            loyaltyPoints: 0,
            tenantId: req.user.tenantId,
            storeId: req.storeId,
        });

        await customer.save();

        res.status(201).json({
            success: true,
            message: 'Customer created successfully',
            data: customer,
        });
    })
);

// ═══════════════════════════════════════════════════════════════
// GET /api/customers/:id — Get customer details
// ═══════════════════════════════════════════════════════════════

router.get('/:id',
    verifyToken,
    checkSubscription,
    asyncHandler(async (req, res) => {
        const customer = await Customer.findOne({
            _id: req.params.id,
            tenantId: req.user.tenantId,
            storeId: req.storeId,
        });

        if (!customer) {
            throw new NotFoundError('Customer not found');
        }

        // Get recent loyalty transactions
        const loyaltyHistory = await LoyaltyTransaction.find({
            customerId: req.params.id,
        })
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();

        res.json({
            success: true,
            data: {
                ...customer.toObject(),
                loyaltyHistory,
            },
        });
    })
);

// ═══════════════════════════════════════════════════════════════
// PUT /api/customers/:id — Update customer
// ═══════════════════════════════════════════════════════════════

router.put('/:id',
    verifyToken,
    checkSubscription,
    requireRole(['owner', 'manager']),
    validate(customerSchemas.update),
    asyncHandler(async (req, res) => {
        const { name, phone, email, creditLimit } = req.body;

        const customer = await Customer.findOne({
            _id: req.params.id,
            tenantId: req.user.tenantId,
            storeId: req.storeId,
        });

        if (!customer) {
            throw new NotFoundError('Customer not found');
        }

        if (name) customer.name = name;
        if (phone) customer.phone = phone;
        if (email) customer.email = email;
        if (creditLimit !== undefined) customer.creditLimit = creditLimit;

        await customer.save();

        res.json({
            success: true,
            message: 'Customer updated successfully',
            data: customer,
        });
    })
);

// ═══════════════════════════════════════════════════════════════
// DELETE /api/customers/:id — Soft delete customer
// ═══════════════════════════════════════════════════════════════

router.delete('/:id',
    verifyToken,
    checkSubscription,
    requireRole(['owner', 'manager']),
    asyncHandler(async (req, res) => {
        const customer = await Customer.findOne({
            _id: req.params.id,
            tenantId: req.user.tenantId,
            storeId: req.storeId,
        });

        if (!customer) {
            throw new NotFoundError('Customer not found');
        }

        customer.isActive = false;
        await customer.save();

        res.json({
            success: true,
            message: 'Customer deleted successfully',
        });
    })
);

// ═══════════════════════════════════════════════════════════════
// GET /api/customers/:id/wallet — Get wallet balance
// ═══════════════════════════════════════════════════════════════

router.get('/:id/wallet',
    verifyToken,
    checkSubscription,
    asyncHandler(async (req, res) => {
        const customer = await Customer.findOne({
            _id: req.params.id,
            tenantId: req.user.tenantId,
            storeId: req.storeId,
        });

        if (!customer) {
            throw new NotFoundError('Customer not found');
        }

        res.json({
            success: true,
            data: {
                customerId: customer._id,
                walletBalance: customer.walletBalance,
                loyaltyPoints: customer.loyaltyPoints,
                creditBalance: customer.creditBalance,
                creditLimit: customer.creditLimit,
            },
        });
    })
);

// ═══════════════════════════════════════════════════════════════
// PATCH /api/customers/:id/wallet — Add funds to wallet
// ═══════════════════════════════════════════════════════════════

router.patch('/:id/wallet',
    verifyToken,
    checkSubscription,
    requireRole(['owner', 'manager']),
    validate(Joi.object({ amount: Joi.number().positive().required() })),
    asyncHandler(async (req, res) => {
        const { amount } = req.body;

        const customer = await Customer.findOne({
            _id: req.params.id,
            tenantId: req.user.tenantId,
            storeId: req.storeId,
        });

        if (!customer) {
            throw new NotFoundError('Customer not found');
        }

        customer.walletBalance += amount;
        await customer.save();

        res.json({
            success: true,
            message: `Added ${amount} to customer wallet`,
            data: {
                customerId: customer._id,
                newBalance: customer.walletBalance,
            },
        });
    })
);

// ═══════════════════════════════════════════════════════════════
// PATCH /api/customers/:id/loyalty/redeem — Redeem loyalty points
// ═══════════════════════════════════════════════════════════════

router.patch('/:id/loyalty/redeem',
    verifyToken,
    checkSubscription,
    checkFeature('loyalty'),
    requireRole(['owner', 'manager', 'cashier']),
    asyncHandler(async (req, res) => {
        const { points } = req.body;

        if (!points || points <= 0) {
            throw new ValidationError('Points must be greater than 0');
        }

        const customer = await Customer.findOne({
            _id: req.params.id,
            tenantId: req.user.tenantId,
            storeId: req.storeId,
        });

        if (!customer) {
            throw new NotFoundError('Customer not found');
        }

        if (customer.loyaltyPoints < points) {
            throw new ValidationError(`Insufficient loyalty points. Available: ${customer.loyaltyPoints}`);
        }

        // Redeem points (assuming 1 point = 1 unit of currency)
        const discount = points; // Configurable in settings
        customer.loyaltyPoints -= points;

        // Log transaction
        await LoyaltyTransaction.create({
            customerId: req.params.id,
            storeId: req.storeId,
            tenantId: req.user.tenantId,
            points: -points,
            type: 'redeem',
        });

        await customer.save();

        res.json({
            success: true,
            message: `Redeemed ${points} loyalty points`,
            data: {
                customerId: customer._id,
                pointsRedeemed: points,
                discountApplied: discount,
                remainingPoints: customer.loyaltyPoints,
            },
        });
    })
);

module.exports = router;
