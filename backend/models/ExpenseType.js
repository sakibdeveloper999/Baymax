const { Schema, model } = require('mongoose');

const expenseTypeSchema = new Schema(
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

expenseTypeSchema.index({ name: 1, storeId: 1 }, { unique: true });

module.exports = model('ExpenseType', expenseTypeSchema);
