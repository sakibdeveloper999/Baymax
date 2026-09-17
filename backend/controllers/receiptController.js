const Order = require('../models/Order');
const { verifyQrToken } = require('../utils/qrService');
const { ValidationError, NotFoundError } = require('../utils/errorHandler');

// The signed token grants access only to a deliberately limited receipt projection.
async function getPublicReceipt(req, res) {
    const token = req.params.token;
    const verification = verifyQrToken(token);
    if (!verification.valid) throw new ValidationError(`QR token ${verification.status}`);
    const order = await Order.findOne({ _id: verification.orderId, qrToken: token })
        .select('orderNumber storeId items subtotal discount discountType tax total paymentMethod status createdAt')
        .populate('storeId', 'name address phone currency taxLabel receiptFooter logo');
    if (!order) throw new NotFoundError('Receipt not found');
    res.set('Cache-Control', 'no-store');
    res.json({ success: true, data: {
        orderNumber: order.orderNumber,
        timestamp: order.createdAt,
        store: order.storeId ? {
            name: order.storeId.name, address: order.storeId.address, phone: order.storeId.phone,
            currency: order.storeId.currency, taxLabel: order.storeId.taxLabel,
            receiptFooter: order.storeId.receiptFooter, logo: order.storeId.logo,
        } : null,
        items: order.items.map(item => ({ productName: item.productName, quantity: item.quantity, unitPrice: item.unitPrice, total: item.total })),
        billing: { subtotal: order.subtotal, discount: order.discount, tax: order.tax, total: order.total },
        paymentMethod: order.paymentMethod, status: order.status,
    } });
}
module.exports = { getPublicReceipt };
