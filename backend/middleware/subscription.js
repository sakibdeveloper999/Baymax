const { tenantAccessError } = require('../utils/tenantAccess');
const { isFeatureList } = require('../utils/planFeatures');
const Plan = require('../models/Plan');
const planCache = Symbol('feature-plan');

const checkSubscription = async (req, res, next) => {
    try {
        if (!req.tenant) return res.status(401).json({ success: false, error: 'Tenant not found' });
        const denied = tenantAccessError(req.tenant);
        if (denied) return res.status(403).json(denied);
        next();
    } catch (error) { next(error); }
};

// Load once per request. Every new request reads the configured plan again.
const checkFeature = requiredFeature => async (req, res, next) => {
    try {
        if (!req.tenant) return res.status(401).json({ success: false, error: 'Tenant not found' });
        if (!req[planCache]) {
            const plan = await Plan.findOne({ name: req.tenant.plan });
            if (!plan || !isFeatureList(plan.features)) {
                return res.status(503).json({ success: false, code: 'PLAN_NOT_CONFIGURED',
                    error: 'Subscription plan configuration is unavailable. Contact the administrator.' });
            }
            req[planCache] = { features: [...plan.features] };
        }
        req.planFeatures = req[planCache].features;
        const required = Array.isArray(requiredFeature) ? requiredFeature : [requiredFeature];
        const missing = required.find(feature => !req.planFeatures.includes(feature));
        if (missing) return res.status(403).json({ success: false,
            error: "Feature '" + missing + "' not available in your plan",
            code: 'FEATURE_NOT_AVAILABLE', currentPlan: req.tenant.plan, requiredFeature: missing });
        next();
    } catch (error) { next(error); }
};

const checkRequestedFeatures = select => (req, res, next) => {
    const required = select(req);
    if (!required.length) return next();
    return checkFeature(required)(req, res, next);
};

// Capacity is enforced atomically by Product/Store/User save().
module.exports = { checkSubscription, checkFeature, checkRequestedFeatures };