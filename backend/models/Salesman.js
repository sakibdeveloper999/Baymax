const { Schema, model } = require('mongoose');

const salesmanSchema = new Schema(
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
        commissionRate: {
            type: Number,
            default: 5, // Percentage
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

salesmanSchema.index({ storeId: 1 });

module.exports = model('Salesman', salesmanSchema);
