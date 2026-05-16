const { Schema, model } = require('mongoose');

const quotationItemSchema = new Schema({
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
    unitPrice: {
        type: Number,
        required: true,
    },
    discount: {
        type: Number,
        default: 0,
    },
    total: {
        type: Number,
        required: true,
    },
}, { _id: false });

const quotationSchema = new Schema(
    {
        storeId: {
            type: Schema.Types.ObjectId,
            ref: 'Store',
            required: true,
            index: true,
        },
        quotationNumber: {
            type: String,
            required: true,
            index: true,
        },
        customerName: {
            type: String,
            required: true,
        },
        customerId: {
            type: Schema.Types.ObjectId,
            ref: 'Customer',
            default: null,
        },
        items: [quotationItemSchema],
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
        validUntil: {
            type: Date,
            required: true,
        },
        status: {
            type: String,
            enum: ['draft', 'sent', 'accepted', 'rejected', 'expired'],
            default: 'draft',
        },
        convertedToOrderId: {
            type: Schema.Types.ObjectId,
            ref: 'Order',
            default: null,
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

quotationSchema.index({ storeId: 1, status: 1 });

// Pre-save to generate quotation number
quotationSchema.pre('save', async function (next) {
    if (!this.quotationNumber) {
        const date = new Date();
        const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
        const count = await this.constructor.countDocuments({ storeId: this.storeId });
        this.quotationNumber = `QUO-${dateStr}-${String(count + 1).padStart(4, '0')}`;
    }
    next();
});

module.exports = model('Quotation', quotationSchema);
