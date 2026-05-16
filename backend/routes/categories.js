/**
 * Category Routes
 * CRUD operations for product categories (store-scoped)
 */

const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const { checkSubscription } = require('../middleware/subscription');
const { validate } = require('../middleware/validation');
const { categorySchemas } = require('../utils/validationSchemas');
const Category = require('../models/Category');
const {
    asyncHandler,
    NotFoundError,
    ConflictError,
} = require('../utils/errorHandler');

// ═══════════════════════════════════════════════════════════════
// GET /api/categories — List all categories for store
// ═══════════════════════════════════════════════════════════════

router.get('/',
    verifyToken,
    checkSubscription,
    asyncHandler(async (req, res) => {
        const categories = await Category.find({
            tenantId: req.user.tenantId,
            storeId: req.storeId,
            isActive: true,
        })
            .sort({ name: 1 })
            .lean();

        res.json({
            success: true,
            data: categories,
            total: categories.length,
        });
    })
);

// ═══════════════════════════════════════════════════════════════
// POST /api/categories — Create category
// ═══════════════════════════════════════════════════════════════

router.post('/',
    verifyToken,
    checkSubscription,
    requireRole(['owner', 'manager']),
    validate(categorySchemas.create),
    asyncHandler(async (req, res) => {
        const { name, description } = req.body;

        // Check for duplicate name within store
        const existing = await Category.findOne({
            name,
            storeId: req.storeId,
            tenantId: req.user.tenantId,
        });

        if (existing) {
            throw new ConflictError('Category with this name already exists in your store');
        }

        const category = new Category({
            name,
            description,
            tenantId: req.user.tenantId,
            storeId: req.storeId,
        });

        await category.save();

        res.status(201).json({
            success: true,
            message: 'Category created successfully',
            data: category,
        });
    })
);

// ═══════════════════════════════════════════════════════════════
// PUT /api/categories/:id — Update category
// ═══════════════════════════════════════════════════════════════

router.put('/:id',
    verifyToken,
    checkSubscription,
    requireRole(['owner', 'manager']),
    validate(categorySchemas.update),
    asyncHandler(async (req, res) => {
        const { name, description } = req.body;

        const category = await Category.findOne({
            _id: req.params.id,
            tenantId: req.user.tenantId,
            storeId: req.storeId,
        });

        if (!category) {
            throw new NotFoundError('Category not found');
        }

        // Check if name is being updated and if it's unique
        if (name && name !== category.name) {
            const duplicate = await Category.findOne({
                name,
                storeId: req.storeId,
                tenantId: req.user.tenantId,
                _id: { $ne: req.params.id },
            });

            if (duplicate) {
                throw new ConflictError('Category with this name already exists');
            }

            category.name = name;
        }

        if (description !== undefined) {
            category.description = description;
        }

        await category.save();

        res.json({
            success: true,
            message: 'Category updated successfully',
            data: category,
        });
    })
);

// ═══════════════════════════════════════════════════════════════
// DELETE /api/categories/:id — Soft delete category
// ═══════════════════════════════════════════════════════════════

router.delete('/:id',
    verifyToken,
    checkSubscription,
    requireRole(['owner', 'manager']),
    asyncHandler(async (req, res) => {
        const category = await Category.findOne({
            _id: req.params.id,
            tenantId: req.user.tenantId,
            storeId: req.storeId,
        });

        if (!category) {
            throw new NotFoundError('Category not found');
        }

        category.isActive = false;
        await category.save();

        res.json({
            success: true,
            message: 'Category deleted successfully',
        });
    })
);

module.exports = router;
