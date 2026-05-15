const { Schema, model } = require('mongoose');

const bankTransactionSchema = new Schema(
    {
        storeId: {
            type: Schema.Types.ObjectId,
            ref: 'Store',
            required: true,
            index: true,
        },
        accountId: {
            type: Schema.Types.ObjectId,
            ref: 'BankAccount',
            required: true,
            index: true,
        },
        type: {
            type: String,
            enum: ['deposit', 'withdrawal', 'transfer_out', 'transfer_in'],
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        balanceAfter: {
            type: Number,
            required: true,
        },
        description: {
            type: String,
            default: '',
        },
        reference: {
            type: String,
            default: '',
        },
        date: {
            type: Date,
            required: true,
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

bankTransactionSchema.index({ accountId: 1, date: -1 });

module.exports = model('BankTransaction', bankTransactionSchema);
