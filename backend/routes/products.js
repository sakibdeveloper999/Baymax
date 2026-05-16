/**
 * Product Routes
 * CRUD operations for products with inventory management
 */

const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../utils/errorHandler');
const { verifyToken, requireRole } = require('../middleware/auth');
const { checkSubscription, checkFeature } = require('../middleware/subscription');
const { validate } = require('../middleware/validation');
const { productSchemas } = require('../utils/validationSchemas');
const Product = require('../models/Product');
const Category = require('../models/Category');
const StockLog = require('../models/StockLog');
const { stockService } = require('../services/stockService');
const { sanitizeProduct } = require('../utils/helpers');
const {
    asyncHandler: handler,
    NotFoundError,
    ValidationError,
    ConflictError,
    checkResourceExists,
    checkTenantOwnsResource,
} = require('../utils/errorHandler');

// ═══════════════════════════════════════════════════════════════
// GET /api/products — List products with pagination/search/filters
// ═══════════════════════════════════════════════════════════════

router.get('/',
    verifyToken,
    checkSubscription,
    handler(async (req, res) => {
        const { page = 1, limit = 10, search = '', category = '', sortBy = 'name', sortOrder = 'asc' } = req.query;

        const skip = (page - 1) * limit;
        const query = {
            tenantId: req.user.tenantId,
            storeId: req.storeId,
            isActive: true,
        };

        // Add search filter (barcode or product name)
        if (search) {
            query.$or = [
                { barcode: { $regex: search, $options: 'i' } },
                { name: { $regex: search, $options: 'i' } },
            ];
        }

        // Add category filter
        if (category) {
            query.categoryId = category;
        }

        const products = await Product.find(query)
            .populate('categoryId', 'name')
            .populate('supplerId', 'name company')
            .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Product.countDocuments(query);

        // Sanitize products per user role
        const sanitized = products.map(p => sanitizeProduct(p, req.user.role));

        res.json({
            success: true,
            data: sanitized,
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
// GET /api/products/:id — Get single product with stock log
// ═══════════════════════════════════════════════════════════════

router.get('/:id',
    verifyToken,
    checkSubscription,
    handler(async (req, res) => {
        const product = await Product.findOne({
            _id: req.params.id,
            tenantId: req.user.tenantId,
            storeId: req.storeId,
        })
            .populate('categoryId', 'name description')
            .populate('supperId', 'name company phone email');

        if (!product) {
            throw new NotFoundError('Product not found');
        }

        // Get recent stock logs (audit trail)
        const stockLogs = await StockLog.find({
            productId: req.params.id,
            storeId: req.storeId,
        })
            .sort({ createdAt: -1 })
            .limit(20)
            .lean();

        const sanitized = sanitizeProduct(product, req.user.role);

        res.json({
            success: true,
            data: {
                ...sanitized.toObject(),
                recentStockLogs: stockLogs,
            },
        });
    })
);

// ═══════════════════════════════════════════════════════════════
// POST /api/products — Create product
// ═══════════════════════════════════════════════════════════════

router.post('/',
    verifyToken,
    checkSubscription,
    checkFeature('pos'),
    requireRole(['owner', 'manager']),
    validate(productSchemas.create),
    handler(async (req, res) => {
        const { barcode, name, categoryId, costPrice, sellingPrice, stock, lowStockAlert, unit, supplier, description } = req.body;

        // Verify category exists and belongs to store
        const category = await Category.findOne({
            _id: categoryId,
            tenantId: req.user.tenantId,
            storeId: req.storeId,
        });

        if (!category) {
            throw new NotFoundError('Category not found');
        }

        // Check for duplicate barcode within store (not globally)
        const existing = await Product.findOne({
            barcode,
            storeId: req.storeId,
            tenantId: req.user.tenantId,
        });

        if (existing) {
            throw new ConflictError('Product with this barcode already exists in your store');
        }

        // Create product
        const product = new Product({
            barcode,
            name,
            categoryId,
            costPrice,
            sellingPrice,
            stock: stock || 0,
            lowStockAlert,
            unit,
            supplierId: supplier || null,
            description,
            tenantId: req.user.tenantId,
            storeId: req.storeId,
        });

        await product.save();

        // Create initial stock log
        if (stock > 0) {
            await StockLog.create({
                productId: product._id,
                storeId: req.storeId,
                tenantId: req.user.tenantId,
                delta: stock,
                reason: 'restock',
                changedBy: req.user.id,
                newBalance: stock,
                note: 'Product created with initial stock',
            });
        }

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: sanitizeProduct(product, req.user.role),
        });
    })
);

// ═══════════════════════════════════════════════════════════════
// PUT /api/products/:id — Update product
// ═══════════════════════════════════════════════════════════════

router.put('/:id',
    verifyToken,
    checkSubscription,
    requireRole(['owner', 'manager']),
    validate(productSchemas.update),
    handler(async (req, res) => {
        const { name, categoryId, sellingPrice, lowStockAlert, unit, supplier, description } = req.body;

        const product = await Product.findOne({
            _id: req.params.id,
            tenantId: req.user.tenantId,
            storeId: req.storeId,
        });

        if (!product) {
            throw new NotFoundError('Product not found');
        }

        // If category is being updated, verify it exists
        if (categoryId) {
            const category = await Category.findOne({
                _id: categoryId,
                tenantId: req.user.tenantId,
                storeId: req.storeId,
            });

            if (!category) {
                throw new NotFoundError('Category not found');
            }

            product.categoryId = categoryId;
        }

        // Update allowed fields
        if (name) product.name = name;
        if (sellingPrice) product.sellingPrice = sellingPrice;
        if (lowStockAlert !== undefined) product.lowStockAlert = lowStockAlert;
        if (unit) product.unit = unit;
        if (supplier !== undefined) product.supplierId = supplier;
        if (description !== undefined) product.description = description;

        await product.save();

        res.json({
            success: true,
            message: 'Product updated successfully',
            data: sanitizeProduct(product, req.user.role),
        });
    })
);

// ═══════════════════════════════════════════════════════════════
// DELETE /api/products/:id — Soft delete product
// ═══════════════════════════════════════════════════════════════

router.delete('/:id',
    verifyToken,
    checkSubscription,
    requireRole(['owner', 'manager']),
    handler(async (req, res) => {
        const product = await Product.findOne({
            _id: req.params.id,
            tenantId: req.user.tenantId,
            storeId: req.storeId,
        });

        if (!product) {
            throw new NotFoundError('Product not found');
        }

        // Soft delete
        product.isActive = false;
        await product.save();

        res.json({
            success: true,
            message: 'Product deleted successfully',
        });
    })
);

// ═══════════════════════════════════════════════════════════════
// PATCH /api/products/:id/stock — Adjust stock manually
// ═══════════════════════════════════════════════════════════════

router.patch('/:id/stock',
    verifyToken,
    checkSubscription,
    requireRole(['owner', 'manager']),
    validate(productSchemas.adjustStock),
    handler(async (req, res) => {
        const { delta, reason, note } = req.body;

        const product = await Product.findOne({
            _id: req.params.id,
            tenantId: req.user.tenantId,
            storeId: req.storeId,
        });

        if (!product) {
            throw new NotFoundError('Product not found');
        }

        // Use stockService for atomic mutation
        await stockService.adjustStock(
            req.params.id,
            delta,
            reason,
            req.user.id,
            req.storeId,
            null, // orderId
            null, // purchaseId
            note
        );

        const updated = await Product.findById(req.params.id);

        res.json({
            success: true,
            message: `Stock adjusted by ${delta}`,
            data: {
                productId: req.params.id,
                newBalance: updated.stock,
            },
        });
    })
);

module.exports = router;
