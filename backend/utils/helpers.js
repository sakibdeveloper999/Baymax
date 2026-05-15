const jwt = require('jsonwebtoken');
const { genSalt, hash, compare } = require('bcryptjs');

/**
 * Generate JWT Token (access token)
 * Expires in 8 hours
 */
const generateAccessToken = (userId, tenantId, role) => {
    return jwt.sign(
        { userId, tenantId, role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );
};

/**
 * Generate Refresh Token
 * Expires in 30 days
 */
const generateRefreshToken = (userId, tenantId) => {
    return jwt.sign(
        { userId, tenantId },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
    );
};

/**
 * Hash password using bcryptjs
 */
const hashPassword = async (password) => {
    const salt = await genSalt(12);
    return await hash(password, salt);
};

/**
 * Compare passwords
 */
const comparePassword = async (password, hashedPassword) => {
    return await compare(password, hashedPassword);
};

/**
 * Format API response
 */
const formatResponse = (success, data = null, error = null, code = null) => {
    return {
        success,
        data,
        error,
        code,
        timestamp: new Date(),
    };
};

/**
 * Generate document number with date and sequence
 */
const generateDocumentNumber = (prefix, date = new Date()) => {
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}-${dateStr}-${random}`;
};

/**
 * Calculate profit from cost and selling price
 */
const calculateProfit = (sellingPrice, costPrice) => {
    return sellingPrice - costPrice;
};

/**
 * Calculate billing totals
 */
const calculateBilling = (items, discount = 0, discountType = 'flat', taxRate = 5) => {
    const subtotal = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);

    let discountAmount = 0;
    if (discountType === 'flat') {
        discountAmount = Math.min(discount, subtotal);
    } else if (discountType === 'percent') {
        discountAmount = subtotal * (discount / 100);
    }

    const taxableAmount = subtotal - discountAmount;
    const tax = taxableAmount * (taxRate / 100);
    const total = taxableAmount + tax;

    return {
        subtotal: parseFloat(subtotal.toFixed(2)),
        discountAmount: parseFloat(discountAmount.toFixed(2)),
        tax: parseFloat(tax.toFixed(2)),
        total: parseFloat(total.toFixed(2))
    };
};

/**
 * Sanitize product data (hide costPrice from cashier)
 */
const sanitizeProduct = (product, userRole) => {
    const obj = typeof product.toObject === 'function' ? product.toObject() : product;
    if (userRole === 'cashier') {
        delete obj.costPrice;
    }
    return obj;
};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    hashPassword,
    comparePassword,
    formatResponse,
    generateDocumentNumber,
    calculateProfit,
    calculateBilling,
    sanitizeProduct,
};
