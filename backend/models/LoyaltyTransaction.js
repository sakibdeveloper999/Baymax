const { Schema, model } = require('mongoose');

const loyaltyTransactionSchema = new Schema(
    {
        storeId: {
            type: Schema.Types.ObjectId,
            ref: 'Store',
            required: true,
            index: true,
        },
        customerId: {
            type: Schema.Types.ObjectId,
            ref: 'Customer',
            required: true,
            index: true,
        },
        points: {
            type: Number,
            required: true,
        },
        type: {
            type: String,
            enum: ['earn', 'redeem', 'adjustment'],
            required: true,
        },
        orderId: {
            type: Schema.Types.ObjectId,
            ref: 'Order',
            default: null,
        },
        description: {
            type: String,
            default: '',
        },
    },
    {
        timestamps: true,
    }
);

loyaltyTransactionSchema.index({ customerId: 1, createdAt: -1 });

module.exports = model('LoyaltyTransaction', loyaltyTransactionSchema);
