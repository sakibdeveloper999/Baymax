const { Schema, model } = require('mongoose');

const storeSchema = new Schema(
    {
        tenantId: {
            type: Schema.Types.ObjectId,
            ref: 'Tenant',
            required: true,
            index: true,
        },
        name: {
            type: String,
            required: true,
        },
        address: {
            type: String,
            default: '',
        },
        phone: {
            type: String,
            default: '',
        },
        taxRate: {
            type: Number,
            default: 5, // Percentage
        },
        taxLabel: {
            type: String,
            default: 'VAT',
        },
        currency: {
            type: String,
            default: 'USD',
        },
        timezone: {
            type: String,
            default: 'UTC',
        },
        receiptFooter: {
            type: String,
            default: 'Thank you for your purchase!',
        },
        logo: {
            type: String,
            default: null,
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

storeSchema.index({ tenantId: 1 });

module.exports = model('Store', storeSchema);
