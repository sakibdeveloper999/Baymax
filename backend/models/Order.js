const { Schema, model } = require('mongoose');

const orderItemSchema = new Schema({
    productId: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    productName: String,
    quantity: {
        type: Number,
        required: true,
    },
    unitPrice: {
        type: Number,
        required: true,
    },
    total: {
        type: Number,
        required: true,
    },
}, { _id: false });

const orderSchema = new Schema(
    {
        orderNumber: {
            type: String,
            required: true,
            index: true,
        },
        storeId: {
            type: Schema.Types.ObjectId,
            ref: 'Store',
            required: true,
            index: true,
        },
        cashierId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        customerId: {
            type: Schema.Types.ObjectId,
            ref: 'Customer',
            default: null,
        },
        items: [orderItemSchema],
        subtotal: {
            type: Number,
            required: true,
        },
        discount: {
            type: Number,
            default: 0,
        },
        discountType: {
            type: String,
            enum: ['flat', 'percent'],
            default: 'flat',
        },
        tax: {
            type: Number,
            default: 0,
        },
        costTotal: {
            type: Number,
            default: 0, // Sum of cost prices
        },
        total: {
            type: Number,
            required: true,
        },
        paymentMethod: {
            type: String,
            enum: ['cash', 'card', 'mobile', 'credit', 'wallet', 'mixed'],
            default: 'cash',
        },
        status: {
            type: String,
            enum: ['completed', 'pending', 'cancelled'],
            default: 'completed',
        },
        qrToken: {
            type: String,
            default: null,
        },
        voucherId: {
            type: Schema.Types.ObjectId,
            ref: 'Voucher',
            default: null,
        },
        shiftId: {
            type: Schema.Types.ObjectId,
            ref: 'Shift',
            default: null,
        },
        notes: String,
    },
    {
        timestamps: true,
    }
);

// Compound index for store and date
orderSchema.index({ createdAt: -1, storeId: 1 });
orderSchema.index({ cashierId: 1, createdAt: -1 });

// Pre-save hook to generate order number if not exists
orderSchema.pre('save', async function (next) {
    if (!this.orderNumber) {
        const date = new Date();
        const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
        const count = await this.constructor.countDocuments({ storeId: this.storeId, createdAt: { $gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()) } });
        this.orderNumber = `ORD-${dateStr}-${String(count + 1).padStart(4, '0')}`;
    }
    next();
});

module.exports = model('Order', orderSchema);
