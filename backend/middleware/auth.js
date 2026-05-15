const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Tenant = require('../models/Tenant');

// Verify JWT Token and load user from DB
const verifyToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ success: false, error: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Load user from DB to ensure account is still active
        const user = await User.findById(decoded.userId).populate('tenantId');

        if (!user || !user.isActive) {
            return res.status(403).json({ success: false, error: 'User account is deactivated' });
        }

        // Attach user and tenant to request
        req.user = user;
        req.tenant = user.tenantId;

        // Update last login
        user.lastLogin = new Date();
        await user.save();

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

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: `Access denied. Required roles: ${allowedRoles.join(', ')}`
            });
        }

        next();
    };
};

module.exports = { verifyToken, requireRole };
