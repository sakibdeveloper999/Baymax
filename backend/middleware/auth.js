const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { tenantAccessError } = require('../utils/tenantAccess');

// Verify JWT Token and load user from DB
const verifyToken = async (req, res, next) => {
    if (req.user && req.tenant) return next();
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ success: false, error: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Load user from DB to ensure account is still active
        const user = await User.findById(decoded.userId).populate('tenantId');

        if (!user || !user.isActive || !user.tenantId) {
            return res.status(403).json({ success: false, error: 'User account is deactivated' });
        }

        if (!decoded.tenantId || String(decoded.tenantId) !== String(user.tenantId._id)) {
            return res.status(403).json({ success: false, error: 'Invalid token' });
        }
        const denied = tenantAccessError(user.tenantId);
        if (denied) return res.status(403).json(denied);

        // Attach user and tenant to request
        req.user = user;
        req.tenant = user.tenantId;

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, error: 'Token expired', code: 'TOKEN_EXPIRED' });
        }
        return res.status(403).json({ success: false, error: 'Invalid token' });
    }
};

// Check if user has required role
const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        if (!allowedRoles.flat().includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: `Access denied. Required roles: ${allowedRoles.join(', ')}`
            });
        }

        next();
    };
};

module.exports = { verifyToken, requireRole };
