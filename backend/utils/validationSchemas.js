/**
 * Joi Validation Schemas for API Routes
 * Centralized validation for all endpoints
 */

const Joi = require('joi');

// ═══════════════════════════════════════════════════════════════
// AUTH SCHEMAS
// ═══════════════════════════════════════════════════════════════

const authSchemas = {
    signup: Joi.object({
        businessName: Joi.string().min(3).max(100).required(),
        ownerEmail: Joi.string().email().required(),
        password: Joi.string().min(8).max(100).required(),
        language: Joi.string().valid('en', 'bn').default('en'),
        currency: Joi.string().length(3).default('USD'),
    }).required(),

    login: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required(),
    }).required(),

    refreshToken: Joi.object({
        refreshToken: Joi.string().required(),
    }).required(),
};

// ═══════════════════════════════════════════════════════════════
// PRODUCT SCHEMAS
// ═══════════════════════════════════════════════════════════════

const productSchemas = {
    create: Joi.object({
        barcode: Joi.string().min(8).max(50).required(),
        name: Joi.string().min(2).max(200).required(),
        categoryId: Joi.string().required(),
        costPrice: Joi.number().positive().required(),
        sellingPrice: Joi.number().positive().required(),
        stock: Joi.number().integer().default(0),
        lowStockAlert: Joi.number().integer().positive().default(10),
        unit: Joi.string().valid('pcs', 'kg', 'ltr', 'meter', 'box', 'carton').default('pcs'),
        supplier: Joi.string().optional(),
        description: Joi.string().max(500).optional(),
    }).required(),

    update: Joi.object({
        name: Joi.string().min(2).max(200).optional(),
        categoryId: Joi.string().optional(),
        sellingPrice: Joi.number().positive().optional(),
        lowStockAlert: Joi.number().integer().positive().optional(),
        unit: Joi.string().valid('pcs', 'kg', 'ltr', 'meter', 'box', 'carton').optional(),
        supplier: Joi.string().optional(),
        description: Joi.string().max(500).optional(),
    }).min(1),

    adjustStock: Joi.object({
        delta: Joi.number().integer().required(),
        reason: Joi.string().valid('sale', 'restock', 'return', 'damage', 'manual_adjustment', 'transfer_out', 'transfer_in').required(),
        note: Joi.string().max(500).optional(),
    }).required(),
};

// ═══════════════════════════════════════════════════════════════
// CATEGORY SCHEMAS
// ═══════════════════════════════════════════════════════════════

const categorySchemas = {
    create: Joi.object({
        name: Joi.string().min(2).max(100).required(),
        description: Joi.string().max(500).optional(),
    }).required(),

    update: Joi.object({
        name: Joi.string().min(2).max(100).optional(),
        description: Joi.string().max(500).optional(),
    }).min(1),
};

// ═══════════════════════════════════════════════════════════════
// STORE SCHEMAS
// ═══════════════════════════════════════════════════════════════

const storeSchemas = {
    create: Joi.object({
        name: Joi.string().min(2).max(100).required(),
        address: Joi.string().max(500).required(),
        phone: Joi.string().regex(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/).required(),
        taxRate: Joi.number().min(0).max(100).default(0),
        taxLabel: Joi.string().max(50).default('GST'),
        currency: Joi.string().length(3).default('USD'),
        timezone: Joi.string().default('UTC'),
        receiptFooter: Joi.string().max(500).optional(),
        logo: Joi.string().optional(),
    }).required(),

    update: Joi.object({
        name: Joi.string().min(2).max(100).optional(),
        address: Joi.string().max(500).optional(),
        phone: Joi.string().regex(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/).optional(),
        taxRate: Joi.number().min(0).max(100).optional(),
        taxLabel: Joi.string().max(50).optional(),
        currency: Joi.string().length(3).optional(),
        timezone: Joi.string().optional(),
        receiptFooter: Joi.string().max(500).optional(),
        logo: Joi.string().optional(),
    }).min(1),
};

// ═══════════════════════════════════════════════════════════════
// CUSTOMER SCHEMAS
// ═══════════════════════════════════════════════════════════════

const customerSchemas = {
    create: Joi.object({
        name: Joi.string().min(2).max(100).required(),
        phone: Joi.string().regex(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/).optional(),
        email: Joi.string().email().optional(),
        loyaltyCard: Joi.string().max(50).optional(),
        creditLimit: Joi.number().nonnegative().default(0),
        walletBalance: Joi.number().nonnegative().default(0),
    }).required(),

    update: Joi.object({
        name: Joi.string().min(2).max(100).optional(),
        phone: Joi.string().regex(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/).optional(),
        email: Joi.string().email().optional(),
        creditLimit: Joi.number().nonnegative().optional(),
    }).min(1),
};

// ═══════════════════════════════════════════════════════════════
// ORDER SCHEMAS
// ═══════════════════════════════════════════════════════════════

const orderSchemas = {
    checkout: Joi.object({
        items: Joi.array().items(
            Joi.object({
                productId: Joi.string().required(),
                quantity: Joi.number().integer().positive().required(),
                unitPrice: Joi.number().positive().required(),
            })
        ).min(1).required(),
        customerId: Joi.string().optional(),
        discount: Joi.object({
            type: Joi.string().valid('flat', 'percent').required(),
            value: Joi.number().positive().required(),
        }).optional(),
        paymentMethod: Joi.string().valid('cash', 'card', 'mobile', 'credit', 'wallet', 'mixed').required(),
        notes: Joi.string().max(500).optional(),
    }).required(),

    updateStatus: Joi.object({
        status: Joi.string().valid('completed', 'pending', 'cancelled').required(),
    }).required(),
};

// ═══════════════════════════════════════════════════════════════
// SUPPLIER SCHEMAS
// ═══════════════════════════════════════════════════════════════

const supplierSchemas = {
    create: Joi.object({
        name: Joi.string().min(2).max(100).required(),
        company: Joi.string().max(100).optional(),
        phone: Joi.string().regex(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/).required(),
        email: Joi.string().email().optional(),
        openingBalance: Joi.number().integer().default(0),
    }).required(),

    update: Joi.object({
        name: Joi.string().min(2).max(100).optional(),
        company: Joi.string().max(100).optional(),
        phone: Joi.string().regex(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/).optional(),
        email: Joi.string().email().optional(),
    }).min(1),
};

// ═══════════════════════════════════════════════════════════════
// PURCHASE SCHEMAS
// ═══════════════════════════════════════════════════════════════

const purchaseSchemas = {
    create: Joi.object({
        supplierId: Joi.string().required(),
        items: Joi.array().items(
            Joi.object({
                productId: Joi.string().required(),
                quantity: Joi.number().integer().positive().required(),
                unitPrice: Joi.number().positive().required(),
            })
        ).min(1).required(),
        discount: Joi.object({
            type: Joi.string().valid('flat', 'percent').optional(),
            value: Joi.number().nonnegative().optional(),
        }).optional(),
        taxRate: Joi.number().nonnegative().optional(),
    }).required(),

    markPaid: Joi.object({
        amount: Joi.number().positive().required(),
        method: Joi.string().valid('cash', 'cheque', 'bank_transfer', 'card').required(),
        reference: Joi.string().max(100).optional(),
    }).required(),
};

// ═══════════════════════════════════════════════════════════════
// VOUCHER SCHEMAS
// ═══════════════════════════════════════════════════════════════

const voucherSchemas = {
    create: Joi.object({
        code: Joi.string().min(3).max(20).uppercase().required(),
        type: Joi.string().valid('flat', 'percent').required(),
        value: Joi.number().positive().required(),
        usageLimit: Joi.number().integer().positive().optional(),
        validFrom: Joi.date().iso().required(),
        validUntil: Joi.date().iso().required(),
        minOrderValue: Joi.number().nonnegative().default(0),
        maxDiscount: Joi.number().nonnegative().optional(),
        customerId: Joi.string().optional(),
    }).required(),

    update: Joi.object({
        usageLimit: Joi.number().integer().positive().optional(),
        validUntil: Joi.date().iso().optional(),
        maxDiscount: Joi.number().nonnegative().optional(),
    }).min(1),
};

// ═══════════════════════════════════════════════════════════════
// PAGINATION & FILTERING
// ═══════════════════════════════════════════════════════════════

const paginationSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sortBy: Joi.string().optional(),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
});

const searchSchema = Joi.object({
    q: Joi.string().min(1).max(100).optional(),
    category: Joi.string().optional(),
    status: Joi.string().optional(),
}).concat(paginationSchema);

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

module.exports = {
    authSchemas,
    productSchemas,
    categorySchemas,
    storeSchemas,
    customerSchemas,
    orderSchemas,
    supplierSchemas,
    purchaseSchemas,
    voucherSchemas,
    paginationSchema,
    searchSchema,
};
