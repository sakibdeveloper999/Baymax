const { Schema, model } = require('mongoose');

const planSchema = new Schema(
    {
        name: {
            type: String,
            enum: ['basic', 'standard', 'pro'],
            unique: true,
        },
        features: {
            type: [String],
            default: [],
        },
        limits: {
            users: { type: Number, default: 2 },
            products: { type: Number, default: 500 },
            branches: { type: Number, default: 1 },
        },
        price: {
            type: Number,
            default: 0, // USD per month
        },
        trialDays: {
            type: Number,
            default: 7,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = model('Plan', planSchema);
