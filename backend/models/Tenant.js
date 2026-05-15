const { Schema, model } = require('mongoose');

const tenantSchema = new Schema(
    {
        businessName: {
            type: String,
            required: true,
        },
        ownerEmail: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },
        plan: {
            type: String,
            enum: ['basic', 'standard', 'pro'],
            default: 'basic',
        },
        subscriptionStatus: {
            type: String,
            enum: ['active', 'expired', 'suspended'],
            default: 'active',
        },
        expireAt: {
            type: Date,
            required: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        isSetupComplete: {
            type: Boolean,
            default: false,
        },
        language: {
            type: String,
            enum: ['en', 'ar', 'bn'],
            default: 'en',
        },
        currency: {
            type: String,
            default: 'USD',
        },
    },
    {
        timestamps: true,
    }
);

tenantSchema.index({ ownerEmail: 1 });
tenantSchema.index({ subscriptionStatus: 1 });

module.exports = model('Tenant', tenantSchema);
