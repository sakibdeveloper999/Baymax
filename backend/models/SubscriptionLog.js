const { Schema, model } = require('mongoose');

const subscriptionLogSchema = new Schema(
    {
        tenantId: {
            type: Schema.Types.ObjectId,
            ref: 'Tenant',
            required: true,
            index: true,
        },
        plan: {
            type: String,
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        currency: {
            type: String,
            default: 'USD',
        },
        paidAt: {
            type: Date,
            default: Date.now,
        },
        periodStart: {
            type: Date,
            required: true,
        },
        periodEnd: {
            type: Date,
            required: true,
        },
        method: {
            type: String,
            enum: ['stripe', 'paypal', 'manual'],
            default: 'manual',
        },
        status: {
            type: String,
            enum: ['paid', 'failed', 'refunded'],
            default: 'paid',
        },
        transactionId: {
            type: String,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

subscriptionLogSchema.index({ tenantId: 1, createdAt: -1 });

module.exports = model('SubscriptionLog', subscriptionLogSchema);
