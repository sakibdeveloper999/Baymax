/**
 * Orders Routes
 * Create, retrieve, and manage sales orders
 * Includes checkout with stock mutations and QR token generation
 */

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { verifyToken, requireRole } = require('../middleware/auth');
const { checkSubscription, checkFeature } = require('../middleware/subscription');
const { validate } = require('../middleware/validation');
const { orderSchemas, paginationSchema } = require('../utils/validationSchemas');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const { stockService } = require('../services/stockService');
const { qrService } = require('../services/qrService');
const { calculateBilling, formatResponse } = require('../utils/helpers');
const {
    asyncHandler,
    NotFoundError,
    ValidationError,
    DatabaseError,
} = require('../utils/errorHandler');

// ═══════════════════════════════════════════════════════════════
// POST /api/orders/checkout — Create order + deduct stock + generate QR
// ═══════════════════════════════════════════════════════════════

router.post('/checkout',
    verifyToken,
    checkSubscription,
    checkFeature('pos'),
    requireRole(['owner', 'manager', 'cashier']),
    validate(orderSchemas.checkout),
    asyncHandler(async (req, res) => {
        const { items, customerId, discount, paymentMethod, notes } = req.body;

        // Start MongoDB transaction
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // 1. Validate and fetch products with prices
            const productIds = items.map(i => i.productId);
            const products = await Product.find({
                _id: { $in: productIds },
                tenantId: req.user.tenantId,
                storeId: req.storeId,
                isActive: true,
            }).session(session);

            if (products.length !== items.length) {
                throw new NotFoundError('One or more products not found');
            }

            // 2. Build order items with validation
            const orderItems = items.map(item => {
                const product = products.find(p => p._id.toString() === item.productId);

                if (!product) {
                    throw new NotFoundError(`Product ${item.productId} not found`);
                }

                if (product.stock < item.quantity) {
                    throw new ValidationError(`Insufficient stock for ${product.name}. Available: ${product.stock}`);
                }

                return {
                    productId: product._id,
                    productName: product.name,
                    barcode: product.barcode,
                    quantity: item.quantity,
                    unitPrice: product.sellingPrice,
                    costPrice: product.costPrice,
                    total: product.sellingPrice * item.quantity,
                };
            });

            // 3. Calculate billing
            const subtotal = orderItems.reduce((sum, item) => sum + item.total, 0);
            const discountInfo = discount || { type: 'flat', value: 0 };
            const billing = calculateBilling(
                orderItems,
                discountInfo.value,
                discountInfo.type,
                0 // Tax handled at store level
            );

            const costTotal = orderItems.reduce((sum, item) => sum + (item.costPrice * item.quantity), 0);
            const profit = billing.total - costTotal;

            // 4. Create order document
            const order = new Order({
                storeId: req.storeId,
                tenantId: req.user.tenantId,
                cashierId: req.user.id,
                customerId: customerId || null,
                items: orderItems,
                subtotal: billing.subtotal,
                discount: {
                    type: discountInfo.type,
                    value: discountInfo.value,
                    amount: billing.discountAmount,
                },
                tax: billing.tax,
                costTotal,
                profit,
                total: billing.total,
                paymentMethod,
                status: 'completed',
                notes,
            });

            // Generate QR token for receipt verification
            const qrToken = qrService.generateQrToken(order._id.toString());
            order.qrToken = qrToken.token;
            order.qrExpiresAt = qrToken.expiresAt;

            await order.save({ session });

            // 5. Deduct stock via stockService (atomic per item)
            for (const item of orderItems) {
                await stockService.adjustStock(
                    item.productId,
                    -item.quantity,
                    'sale',
                    req.user.id,
                    req.storeId,
                    order._id.toString(),
                    null, // purchaseId
                    null, // note
                    session
                );
            }

            // 6. Update customer wallet/credit if applicable
            if (customerId) {
                const customer = await Customer.findOne({
                    _id: customerId,
                    tenantId: req.user.tenantId,
                    storeId: req.storeId,
                }).session(session);

                if (customer) {
                    if (paymentMethod === 'credit') {
                        // Add to customer's credit debt
                        if (customer.creditBalance >= customer.creditLimit) {
                            throw new ValidationError('Customer credit limit exceeded');
                        }
                        customer.creditBalance += billing.total;
                    } else if (paymentMethod === 'wallet') {
                        // Deduct from wallet
                        if (customer.walletBalance < billing.total) {
                            throw new ValidationError('Insufficient wallet balance');
                        }
                        customer.walletBalance -= billing.total;
                    }

                    // Earn loyalty points
                    const pointsEarned = Math.floor(billing.total / 100); // 1 point per 100 currency units
                    customer.loyaltyPoints += pointsEarned;

                    await customer.save({ session });
                }
            }

            await session.commitTransaction();

            // 7. Populate and return order
            const populated = await Order.findById(order._id)
                .populate('customerId', 'name phone email')
                .populate('items.productId', 'barcode name');

            res.status(201).json({
                success: true,
                message: 'Order created successfully',
                data: {
                    orderId: populated._id,
                    orderNumber: populated.orderNumber,
                    items: populated.items,
                    billing: {
                        subtotal: populated.subtotal,
                        discount: populated.discount,
                        tax: populated.tax,
                        total: populated.total,
                        profit: populated.profit,
                    },
                    paymentMethod: populated.paymentMethod,
                    qrToken: populated.qrToken,
                    timestamp: populated.createdAt,
                },
            });
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    })
);

// ═══════════════════════════════════════════════════════════════
// GET /api/orders — List orders with pagination/filters
// ═══════════════════════════════════════════════════════════════

router.get('/',
    verifyToken,
    checkSubscription,
    asyncHandler(async (req, res) => {
        const { page = 1, limit = 10, status = '', paymentMethod = '', startDate, endDate } = req.query;

        const skip = (page - 1) * limit;
        const query = {
            tenantId: req.user.tenantId,
            storeId: req.storeId,
        };

        // Add filters
        if (status) query.status = status;
        if (paymentMethod) query.paymentMethod = paymentMethod;

        // Date range filter
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        const orders = await Order.find(query)
            .populate('customerId', 'name phone email')
            .populate('cashierId', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .lean();

        const total = await Order.countDocuments(query);

        res.json({
            success: true,
            data: orders,
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
// GET /api/orders/:id — Get order details
// ═══════════════════════════════════════════════════════════════

router.get('/:id',
    verifyToken,
    checkSubscription,
    asyncHandler(async (req, res) => {
        const order = await Order.findOne({
            _id: req.params.id,
            tenantId: req.user.tenantId,
            storeId: req.storeId,
        })
            .populate('customerId')
            .populate('cashierId', 'name email')
            .populate('items.productId', 'barcode name category');

        if (!order) {
            throw new NotFoundError('Order not found');
        }

        res.json({
            success: true,
            data: order,
        });
    })
);

// ═══════════════════════════════════════════════════════════════
// GET /api/orders/:id/receipt — Verify QR token + return receipt
// ═══════════════════════════════════════════════════════════════

router.get('/:id/receipt',
    asyncHandler(async (req, res) => {
        const { token } = req.query;

        if (!token) {
            throw new ValidationError('QR token required');
        }

        // Verify QR token
        const verification = qrService.verifyQrToken(token);

        if (!verification.valid) {
            throw new ValidationError(`QR Token ${verification.status}`);
        }

        const order = await Order.findById(verification.orderId)
            .populate('customerId')
            .populate('storeId')
            .populate('items.productId', 'barcode name');

        if (!order) {
            throw new NotFoundError('Order not found');
        }

        // Format receipt
        const receipt = {
            storeName: order.storeId?.name || 'POS Store',
            orderNumber: order.orderNumber,
            timestamp: order.createdAt,
            cashier: order.cashierId,
            customer: order.customerId?.name || 'Walk-in',
            items: order.items,
            billing: {
                subtotal: order.subtotal,
                discount: order.discount,
                tax: order.tax,
                total: order.total,
            },
            paymentMethod: order.paymentMethod,
            status: order.status,
        };

        res.json({
            success: true,
            data: receipt,
        });
    })
);

// ═══════════════════════════════════════════════════════════════
// PATCH /api/orders/:id/status — Update order status
// ═══════════════════════════════════════════════════════════════

router.patch('/:id/status',
    verifyToken,
    checkSubscription,
    requireRole(['owner', 'manager']),
    validate(orderSchemas.updateStatus),
    asyncHandler(async (req, res) => {
        const { status } = req.body;

        const order = await Order.findOne({
            _id: req.params.id,
            tenantId: req.user.tenantId,
            storeId: req.storeId,
        });

        if (!order) {
            throw new NotFoundError('Order not found');
        }

        order.status = status;
        await order.save();

        res.json({
            success: true,
            message: `Order status updated to ${status}`,
            data: { orderId: order._id, status: order.status },
        });
    })
);

module.exports = router;
