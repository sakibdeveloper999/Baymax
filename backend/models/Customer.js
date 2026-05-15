const { Schema, model } = require('mongoose');

const customerSchema = new Schema(
    {
        storeId: {
            type: Schema.Types.ObjectId,
            ref: 'Store',
            required: true,
            index: true,
        },
        name: {
            type: String,
            required: true,
        },
        phone: {
            type: String,
            default: '',
        },
        email: {
            type: String,
            default: '',
        },
        loyaltyCard: {
            type: String,
            default: null,
        },
        creditLimit: {
            type: Number,
            default: 0,
        },
        creditBalance: {
            type: Number,
            default: 0,
        },
        walletBalance: {
            type: Number,
            default: 0,
        },
        loyaltyPoints: {
            type: Number,
            default: 0,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

customerSchema.index({ storeId: 1 });
customerSchema.index({ phone: 1, storeId: 1 });
customerSchema.index({ loyaltyCard: 1 });

module.exports = model('Customer', customerSchema);
