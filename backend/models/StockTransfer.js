const { Schema, model } = require('mongoose');

const stockTransferItemSchema = new Schema({
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
}, { _id: false });

const stockTransferSchema = new Schema(
    {
        fromStoreId: {
            type: Schema.Types.ObjectId,
            ref: 'Store',
            required: true,
            index: true,
        },
        toStoreId: {
            type: Schema.Types.ObjectId,
            ref: 'Store',
            required: true,
            index: true,
        },
        transferNumber: {
            type: String,
            required: true,
            index: true,
        },
        items: [stockTransferItemSchema],
        status: {
            type: String,
            enum: ['pending', 'in_transit', 'received', 'cancelled'],
            default: 'pending',
        },
        initiatedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        receivedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        notes: {
            type: String,
            default: '',
        },
    },
    {
        timestamps: true,
    }
);

stockTransferSchema.index({ fromStoreId: 1, status: 1 });
stockTransferSchema.index({ toStoreId: 1, status: 1 });

// Pre-save to generate transfer number
stockTransferSchema.pre('save', async function (next) {
    if (!this.transferNumber) {
        const date = new Date();
        const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
        const count = await this.constructor.countDocuments();
        this.transferNumber = `STR-${dateStr}-${String(count + 1).padStart(4, '0')}`;
    }
    next();
});

module.exports = model('StockTransfer', stockTransferSchema);
