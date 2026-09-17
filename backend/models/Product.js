const { Schema, model } = require('mongoose');

const productSchema = new Schema(
    {
        categoryId: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
        supplierId: { type: Schema.Types.ObjectId, ref: 'Supplier', default: null },
        barcode: {
            type: String,
            required: true,
            index: true,
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
            required: true,
            select: false, // Don't return to cashier role
        },
        sellingPrice: {
            type: Number,
            required: true,
        },
        stock: {
            type: Number,
            required: true,
            default: 0,
        },
        lowStockAlert: {
            type: Number,
            default: 10, // Alert when stock <= this
        },
        unit: {
            type: String,
            enum: ['pcs', 'kg', 'liter', 'ltr', 'dozen', 'pack', 'meter', 'box', 'carton'],
            default: 'pcs',
        },
        storeId: {
            type: Schema.Types.ObjectId,
            ref: 'Store',
            required: true,
            index: true,
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

// Compound unique index: barcode unique per store
productSchema.index({ barcode: 1, storeId: 1 }, { unique: true });
// Text index for full-text search
productSchema.index({ name: 'text', category: 'text' });

module.exports = model('Product', productSchema);
