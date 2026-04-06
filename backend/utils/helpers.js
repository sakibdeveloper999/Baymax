// Generate JWT Token
const jwt = require('jsonwebtoken');

const generateToken = (userId, role) => {
    return jwt.sign(
        { userId, role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
};

// Format response
const formatResponse = (success, data = null, error = null) => {
    return {
        success,
        data,
        error,
        timestamp: new Date(),
    };
};

// Validate required fields
const validateRequiredFields = (body, fields) => {
    const missing = fields.filter((field) => !body[field]);
    if (missing.length > 0) {
        return {
            valid: false,
            error: `Missing required fields: ${missing.join(', ')}`,
        };
    }
    return { valid: true };
};

module.exports = {
    generateToken,
    formatResponse,
    validateRequiredFields,
};
