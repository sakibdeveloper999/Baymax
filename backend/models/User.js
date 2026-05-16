const { Schema, model } = require('mongoose');
const { genSalt, hash, compare } = require('bcryptjs');

const userSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            index: true,
        },
        password: {
            type: String,
            required: true,
            select: false, // Don't return password by default
        },
        role: {
            type: String,
            enum: ['owner', 'manager', 'cashier'],
            default: 'cashier',
        },
        tenantId: {
            type: Schema.Types.ObjectId,
            ref: 'Tenant',
            required: true,
            index: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        lastLogin: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

// Compound unique index: email unique per tenant
userSchema.index({ email: 1, tenantId: 1 }, { unique: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await genSalt(10);
    this.password = await hash(this.password, salt);
    next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await compare(candidatePassword, this.password);
};

module.exports = model('User', userSchema);
