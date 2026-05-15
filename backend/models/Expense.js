const { Schema, model } = require('mongoose');

const expenseSchema = new Schema(
    {
        storeId: {
            type: Schema.Types.ObjectId,
            ref: 'Store',
            required: true,
            index: true,
        },
        expenseTypeId: {
            type: Schema.Types.ObjectId,
            ref: 'ExpenseType',
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        description: {
            type: String,
            default: '',
        },
        date: {
            type: Date,
            required: true,
        },
        paymentMethod: {
            type: String,
            enum: ['cash', 'bank', 'mobile'],
            default: 'cash',
        },
        reference: {
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

expenseSchema.index({ storeId: 1, date: -1 });
expenseSchema.index({ expenseTypeId: 1 });

module.exports = model('Expense', expenseSchema);
