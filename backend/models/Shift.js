const { Schema, model } = require('mongoose');

const shiftSchema = new Schema(
    {
        storeId: {
            type: Schema.Types.ObjectId,
            ref: 'Store',
            required: true,
            index: true,
        },
        cashierId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        openedAt: {
            type: Date,
            required: true,
        },
        closedAt: {
            type: Date,
            default: null,
        },
        openingCash: {
            type: Number,
            required: true,
        },
        closingCash: {
            type: Number,
            default: null,
        },
        expectedCash: {
            type: Number,
            default: null,
        },
        cashDifference: {
            type: Number,
            default: null,
        },
        status: {
            type: String,
            enum: ['open', 'closed'],
            default: 'open',
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

shiftSchema.index({ cashierId: 1, status: 1 });
shiftSchema.index({ createdAt: -1, storeId: 1 });

module.exports = model('Shift', shiftSchema);
