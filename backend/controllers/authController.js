const User = require('../models/User');
const Tenant = require('../models/Tenant');
const Plan = require('../models/Plan');
const SubscriptionLog = require('../models/SubscriptionLog');
const { hashPassword, comparePassword, generateAccessToken, generateRefreshToken } = require('../utils/helpers');
const Joi = require('joi');

// ──── SIGN UP ────
exports.signup = async (req, res) => {
    try {
        const { businessName, ownerEmail, password, language = 'en', currency = 'USD' } = req.body;

        // Validate
        const schema = Joi.object({
            businessName: Joi.string().required().min(3),
            ownerEmail: Joi.string().email().required(),
            password: Joi.string().required().min(8),
            language: Joi.string().valid('en', 'ar', 'bn').default('en'),
            currency: Joi.string().default('USD'),
        });

        const { error, value } = schema.validate(req.body);
        if (error) return res.status(400).json({ success: false, error: error.message });

        // Check if tenant already exists
        const existingTenant = await Tenant.findOne({ ownerEmail: value.ownerEmail });
        if (existingTenant) {
            return res.status(409).json({ success: false, error: 'Email already registered' });
        }

        // Create tenant with basic plan and 7-day trial
        const trialEnd = new Date();
        trialEnd.setDate(trialEnd.getDate() + 7);

        const tenant = new Tenant({
            businessName: value.businessName,
            ownerEmail: value.ownerEmail,
            plan: 'basic',
            subscriptionStatus: 'active',
            expireAt: trialEnd,
            language: value.language,
            currency: value.currency,
        });
        await tenant.save();

        // Create owner user
        const hashedPassword = await hashPassword(value.password);
        const user = new User({
            name: value.businessName + ' Owner',
            email: value.ownerEmail,
            password: hashedPassword,
            role: 'owner',
            tenantId: tenant._id,
        });
        await user.save();

        // Log subscription (trial start)
        const plan = await Plan.findOne({ name: 'basic' });
        await SubscriptionLog.create({
            tenantId: tenant._id,
            plan: 'basic',
            amount: 0,
            currency: value.currency,
            paidAt: new Date(),
            periodStart: new Date(),
            periodEnd: trialEnd,
            method: 'trial',
            status: 'paid',
        });

        // Generate tokens
        const accessToken = generateAccessToken(user._id, tenant._id, user.role);
        const refreshToken = generateRefreshToken(user._id, tenant._id);

        res.status(201).json({
            success: true,
            data: {
                tenant: { _id: tenant._id, businessName, plan: 'basic' },
                user: { _id: user._id, name: user.name, email: user.email, role: user.role },
                accessToken,
                refreshToken,
                expiresIn: '8h',
                trialEnds: trialEnd,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// ──── LOGIN ────
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate
        const schema = Joi.object({
            email: Joi.string().email().required(),
            password: Joi.string().required(),
        });
        const { error, value } = schema.validate(req.body);
        if (error) return res.status(400).json({ success: false, error: error.message });

        // Find user and load tenant
        const user = await User.findOne({ email: value.email })
            .select('+password')
            .populate('tenantId');

        if (!user || !user.isActive) {
            return res.status(401).json({ success: false, error: 'Invalid email or password' });
        }

        // Check tenant
        if (!user.tenantId || !user.tenantId.isActive) {
            return res.status(403).json({ success: false, error: 'Tenant account is suspended' });
        }

        // Compare password
        const isValidPassword = await comparePassword(value.password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ success: false, error: 'Invalid email or password' });
        }

        // Check subscription status
        if (new Date() > user.tenantId.expireAt) {
            return res.status(403).json({
                success: false,
                error: 'Subscription expired',
                code: 'SUBSCRIPTION_EXPIRED',
                renewalLink: '/billing/renew',
            });
        }

        // Generate tokens
        const accessToken = generateAccessToken(user._id, user.tenantId._id, user.role);
        const refreshToken = generateRefreshToken(user._id, user.tenantId._id);

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        res.json({
            success: true,
            data: {
                tenant: { _id: user.tenantId._id, businessName: user.tenantId.businessName, plan: user.tenantId.plan },
                user: { _id: user._id, name: user.name, email: user.email, role: user.role },
                accessToken,
                refreshToken,
                expiresIn: '8h',
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// ──── REFRESH TOKEN ────
exports.refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({ success: false, error: 'Refresh token required' });
        }

        const decoded = require('jsonwebtoken').verify(refreshToken, process.env.JWT_REFRESH_SECRET);

        const user = await User.findById(decoded.userId).populate('tenantId');
        if (!user || !user.isActive || !user.tenantId?.isActive) {
            return res.status(403).json({ success: false, error: 'Invalid refresh token' });
        }

        const newAccessToken = generateAccessToken(user._id, user.tenantId._id, user.role);
        const newRefreshToken = generateRefreshToken(user._id, user.tenantId._id);

        res.json({
            success: true,
            data: { accessToken: newAccessToken, refreshToken: newRefreshToken, expiresIn: '8h' },
        });
    } catch (error) {
        res.status(401).json({ success: false, error: 'Invalid refresh token' });
    }
};

// ──── GET CURRENT USER ────
exports.getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('tenantId');
        res.json({
            success: true,
            data: {
                user: user,
                tenant: user.tenantId,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
