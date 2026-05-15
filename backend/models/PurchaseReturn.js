const { Schema, model } = require('mongoose');

const purchaseReturnItemSchema = new Schema({
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

const purchaseReturnSchema = new Schema(
    {
        storeId: {
            type: Schema.Types.ObjectId,
            ref: 'Store',
            required: true,
            index: true,
        },
        returnNumber: {
            type: String,
            required: true,
            index: true,
        },
        purchaseId: {
            type: Schema.Types.ObjectId,
            ref: 'Purchase',
            required: true,
        },
        supplierId: {
            type: Schema.Types.ObjectId,
            ref: 'Supplier',
            required: true,
        },
        items: [purchaseReturnItemSchema],
        totalAmount: {
            type: Number,
            required: true,
        },
        reason: {
            type: String,
            default: '',
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    {
        timestamps: true,
    }
);

purchaseReturnSchema.index({ storeId: 1, createdAt: -1 });

// Pre-save to generate return number
purchaseReturnSchema.pre('save', async function (next) {
    if (!this.returnNumber) {
        const date = new Date();
        const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
        const count = await this.constructor.countDocuments({ storeId: this.storeId });
        this.returnNumber = `PRN-${dateStr}-${String(count + 1).padStart(4, '0')}`;
    }
    next();
});

module.exports = model('PurchaseReturn', purchaseReturnSchema);
