const { Schema, model } = require('mongoose');

const supplierSchema = new Schema(
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
        company: {
            type: String,
            default: '',
        },
        phone: {
            type: String,
            default: '',
        },
        email: {
            type: String,
            default: '',
        },
        address: {
            type: String,
            default: '',
        },
        openingBalance: {
            type: Number,
            default: 0,
        },
        currentBalance: {
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

supplierSchema.index({ storeId: 1 });
supplierSchema.index({ phone: 1, storeId: 1 });

module.exports = model('Supplier', supplierSchema);
