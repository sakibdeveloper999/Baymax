const { Schema, model } = require('mongoose');

const voucherSchema = new Schema(
    {
        storeId: {
            type: Schema.Types.ObjectId,
            ref: 'Store',
            required: true,
            index: true,
        },
        code: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
        },
        type: {
            type: String,
            enum: ['flat', 'percent'],
            required: true,
        },
        value: {
            type: Number,
            required: true,
        },
        usageLimit: {
            type: Number,
            default: null, // null = unlimited
        },
        usageCount: {
            type: Number,
            default: 0,
        },
        validFrom: {
            type: Date,
            required: true,
        },
        validUntil: {
            type: Date,
            required: true,
        },
        minOrderValue: {
            type: Number,
            default: 0,
        },
        maxDiscount: {
            type: Number,
            default: null,
        },
        customerId: {
            type: Schema.Types.ObjectId,
            ref: 'Customer',
            default: null, // null = public
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

voucherSchema.index({ storeId: 1, code: 1 });

module.exports = model('Voucher', voucherSchema);
