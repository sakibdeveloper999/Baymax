const { Schema, model } = require('mongoose');

const bankAccountSchema = new Schema(
    {
        storeId: {
            type: Schema.Types.ObjectId,
            ref: 'Store',
            required: true,
            index: true,
        },
        bankName: {
            type: String,
            required: true,
        },
        accountNumber: {
            type: String,
            required: true,
        },
        accountHolder: {
            type: String,
            default: '',
        },
        openingBalance: {
            type: Number,
            default: 0,
        },
        currentBalance: {
            type: Number,
            default: 0,
        },
        accountType: {
            type: String,
            enum: ['checking', 'savings', 'business'],
            default: 'business',
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

bankAccountSchema.index({ storeId: 1 });

module.exports = model('BankAccount', bankAccountSchema);
