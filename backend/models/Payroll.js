const { Schema, model } = require('mongoose');

const payrollSchema = new Schema(
    {
        storeId: {
            type: Schema.Types.ObjectId,
            ref: 'Store',
            required: true,
            index: true,
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        month: {
            type: Number,
            required: true, // 1-12
        },
        year: {
            type: Number,
            required: true,
        },
        basicSalary: {
            type: Number,
            required: true,
        },
        bonus: {
            type: Number,
            default: 0,
        },
        deductions: {
            type: Number,
            default: 0,
        },
        netSalary: {
            type: Number,
            required: true,
        },
        paymentMethod: {
            type: String,
            enum: ['cash', 'bank', 'mobile'],
            default: 'cash',
        },
        status: {
            type: String,
            enum: ['draft', 'pending', 'paid'],
            default: 'draft',
        },
        paidDate: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

// Unique per user per month per year per store
payrollSchema.index({ userId: 1, month: 1, year: 1, storeId: 1 }, { unique: true });

module.exports = model('Payroll', payrollSchema);
