const { Schema, model } = require('mongoose');

const salesReturnItemSchema = new Schema({
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

const salesReturnSchema = new Schema(
    {
        storeId: {
            type: Schema.Types.ObjectId,
            ref: 'Store',
            required: true,
            index: true,
        },
        returnNumber: {
            type: String,
            required: true,
            index: true,
        },
        orderId: {
            type: Schema.Types.ObjectId,
            ref: 'Order',
            default: null,
        },
        customerId: {
            type: Schema.Types.ObjectId,
            ref: 'Customer',
            default: null,
        },
        items: [salesReturnItemSchema],
        totalAmount: {
            type: Number,
            required: true,
        },
        refundMethod: {
            type: String,
            enum: ['cash', 'wallet', 'loyalty_points'],
            default: 'cash',
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        notes: String,
    },
    {
        timestamps: true,
    }
);

salesReturnSchema.index({ storeId: 1, createdAt: -1 });

// Pre-save to generate return number
salesReturnSchema.pre('save', async function (next) {
    if (!this.returnNumber) {
        const date = new Date();
        const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
        const count = await this.constructor.countDocuments({ storeId: this.storeId });
        this.returnNumber = `SRN-${dateStr}-${String(count + 1).padStart(4, '0')}`;
    }
    next();
});

module.exports = model('SalesReturn', salesReturnSchema);
