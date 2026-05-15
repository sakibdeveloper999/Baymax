const { Schema, model } = require('mongoose');

const stockLogSchema = new Schema(
    {
        storeId: {
            type: Schema.Types.ObjectId,
            ref: 'Store',
            required: true,
            index: true,
        },
        productId: {
            type: Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
            index: true,
        },
        delta: {
            type: Number,
            required: true, // Positive or negative
        },
        reason: {
            type: String,
            enum: ['sale', 'restock', 'return', 'damage', 'manual_adjustment', 'transfer_out', 'transfer_in'],
            required: true,
        },
        changedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        orderId: {
            type: Schema.Types.ObjectId,
            ref: 'Order',
            default: null,
        },
        purchaseId: {
            type: Schema.Types.ObjectId,
            ref: 'Purchase',
            default: null,
        },
        note: {
            type: String,
            default: '',
        },
        newBalance: {
            type: Number,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

stockLogSchema.index({ createdAt: -1, storeId: 1 });
stockLogSchema.index({ productId: 1, storeId: 1 });

module.exports = model('StockLog', stockLogSchema);
