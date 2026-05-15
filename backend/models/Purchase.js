const { Schema, model } = require('mongoose');

const purchaseItemSchema = new Schema({
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
    costPrice: {
        type: Number,
        required: true,
    },
    total: {
        type: Number,
        required: true,
    },
}, { _id: false });

const purchaseSchema = new Schema(
    {
        storeId: {
            type: Schema.Types.ObjectId,
            ref: 'Store',
            required: true,
            index: true,
        },
        purchaseNumber: {
            type: String,
            required: true,
            index: true,
        },
        supplierId: {
            type: Schema.Types.ObjectId,
            ref: 'Supplier',
            required: true,
        },
        items: [purchaseItemSchema],
        subtotal: {
            type: Number,
            required: true,
        },
        discount: {
            type: Number,
            default: 0,
        },
        tax: {
            type: Number,
            default: 0,
        },
        total: {
            type: Number,
            required: true,
        },
        balanceDue: {
            type: Number,
            required: true,
        },
        paidAmount: {
            type: Number,
            default: 0,
        },
        status: {
            type: String,
            enum: ['pending', 'partial', 'paid'],
            default: 'pending',
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

purchaseSchema.index({ storeId: 1, createdAt: -1 });
purchaseSchema.index({ supplierId: 1, status: 1 });

// Pre-save to generate purchase number
purchaseSchema.pre('save', async function (next) {
    if (!this.purchaseNumber) {
        const date = new Date();
        const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
        const count = await this.constructor.countDocuments({ storeId: this.storeId });
        this.purchaseNumber = `PUR-${dateStr}-${String(count + 1).padStart(4, '0')}`;
    }
    next();
});

module.exports = model('Purchase', purchaseSchema);
