const Tenant = require('../models/Tenant');
const Plan = require('../models/Plan');

// Check subscription status and feature access
const checkSubscription = async (req, res, next) => {
    try {
        if (!req.tenant) {
            return res.status(401).json({ success: false, error: 'Tenant not found' });
        }

        // Check if tenant is active
        if (!req.tenant.isActive) {
            return res.status(403).json({
                success: false,
                error: 'Tenant account is suspended',
                code: 'ACCOUNT_SUSPENDED'
            });
        }

        // Check if subscription is expired
        if (new Date() > req.tenant.expireAt) {
            return res.status(403).json({
                success: false,
                error: 'Subscription expired. Please renew to continue.',
                code: 'SUBSCRIPTION_EXPIRED',
                renewalDate: req.tenant.expireAt
            });
        }

        next();
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Check if plan has required feature
const checkFeature = (requiredFeature) => {
    return async (req, res, next) => {
        try {
            if (!req.tenant) {
                return res.status(401).json({ success: false, error: 'Tenant not found' });
            }

            const plan = await Plan.findOne({ name: req.tenant.plan });

            if (!plan || !plan.features.includes(requiredFeature)) {
                return res.status(403).json({
                    success: false,
                    error: `Feature '${requiredFeature}' not available in your plan`,
                    code: 'FEATURE_NOT_AVAILABLE',
                    currentPlan: req.tenant.plan,
                    requiredFeature
                });
            }

            next();
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    };
};

// Check if tenant has reached usage limits
const checkLimit = (limitKey) => {
    return async (req, res, next) => {
        try {
            if (!req.tenant) {
                return res.status(401).json({ success: false, error: 'Tenant not found' });
            }

            const plan = await Plan.findOne({ name: req.tenant.plan });
            if (!plan || !plan.limits[limitKey]) {
                return next(); // No limit on this feature
            }

            // Get current usage - will be checked by route handler
            req.planLimit = plan.limits[limitKey];
            next();
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    };
};

module.exports = { checkSubscription, checkFeature, checkLimit };
