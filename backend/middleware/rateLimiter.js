const rateLimit = require('express-rate-limit');

// Auth endpoints: 20 requests per 15 minutes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: 'Too many login attempts, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
});

// API endpoints: 300 requests per minute
const apiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 300,
    message: 'Rate limit exceeded',
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = { authLimiter, apiLimiter };
