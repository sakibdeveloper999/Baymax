const { tenantAccessError } = require('../utils/tenantAccess');
const Plan = require('../models/Plan');

// Check subscription status and feature access
const checkSubscription = async (req, res, next) => {
    try {
        if (!req.tenant) {
            return res.status(401).json({ success: false, error: 'Tenant not found' });
        }

        const denied = tenantAccessError(req.tenant);
        if (denied) return res.status(403).json(denied);

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

            if (!plan) {
                return res.status(503).json({ success: false, code: 'PLAN_NOT_CONFIGURED', error: 'Subscription plan configuration is unavailable. Contact the administrator.' });
            }
            if (!plan.features.includes(requiredFeature)) {
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

// Capacity is enforced atomically by Product/Store/User save(), not request middleware.
module.exports = { checkSubscription, checkFeature };
