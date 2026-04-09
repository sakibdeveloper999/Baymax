const { Schema, model } = require('mongoose');

const productSchema = new Schema(
    {
        barcode: {
            type: String,
            required: true,
            unique: true,
            index: true, // For fast barcode lookup
        },
        name: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            default: 'General',
        },
        costPrice: {
            type: Number,
            required: true, // Cost to business
        },
        sellingPrice: {
            type: Number,
            required: true, // MRP / Retail Price
        },
        stock: {
            type: Number,
            required: true,
            default: 0,
        },
        unit: {
            type: String,
            default: 'pcs', // pcs, kg, liter, etc.
        },
        description: {
            type: String,
            default: '',
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

// Profit calculation (virtual field)
productSchema.virtual('profit').get(function () {
    return this.sellingPrice - this.costPrice;
});

module.exports = model('Product', productSchema);
