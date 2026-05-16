/**
 * Custom Error Classes & Handling Middleware
 * Provides standardized error responses across the API
 */

// ═══════════════════════════════════════════════════════════════
// CUSTOM ERROR CLASSES
// ═══════════════════════════════════════════════════════════════

class AppError extends Error {
    constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.timestamp = new Date().toISOString();
        Error.captureStackTrace(this, this.constructor);
    }
}

class ValidationError extends AppError {
    constructor(message, details = {}) {
        super(message, 400, 'VALIDATION_ERROR');
        this.details = details;
    }
}

class AuthenticationError extends AppError {
    constructor(message = 'Authentication failed') {
        super(message, 401, 'AUTH_ERROR');
    }
}

class AuthorizationError extends AppError {
    constructor(message = 'Insufficient permissions') {
        super(message, 403, 'FORBIDDEN');
    }
}

class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super(message, 404, 'NOT_FOUND');
    }
}

class ConflictError extends AppError {
    constructor(message = 'Conflict') {
        super(message, 409, 'CONFLICT');
    }
}

class SubscriptionError extends AppError {
    constructor(message = 'Subscription expired or inactive') {
        super(message, 403, 'SUBSCRIPTION_ERROR');
    }
}

class FeatureGatingError extends AppError {
    constructor(featureName) {
        const message = `Feature '${featureName}' not available in your plan`;
        super(message, 403, 'FEATURE_NOT_AVAILABLE');
    }
}

class RateLimitError extends AppError {
    constructor(message = 'Too many requests. Please try again later.') {
        super(message, 429, 'RATE_LIMIT_EXCEEDED');
    }
}

class DatabaseError extends AppError {
    constructor(message = 'Database operation failed') {
        super(message, 500, 'DB_ERROR');
    }
}

// ═══════════════════════════════════════════════════════════════
// ERROR HANDLER MIDDLEWARE
// ═══════════════════════════════════════════════════════════════

const errorHandler = (err, req, res, next) => {
    // Default to 500 if no status code
    const statusCode = err.statusCode || 500;
    const code = err.code || 'INTERNAL_ERROR';

    // Build error response
    const errorResponse = {
        success: false,
        error: {
            code,
            message: err.message,
            timestamp: new Date().toISOString(),
        },
    };

    // Include validation details if present
    if (err.details) {
        errorResponse.error.details = err.details;
    }

    // Include stack trace in development
    if (process.env.NODE_ENV === 'development') {
        errorResponse.error.stack = err.stack;
    }

    // Log error
    const logLevel = statusCode >= 500 ? 'error' : 'warn';
    console[logLevel](`[${code}] ${err.message}`, {
        statusCode,
        path: req.path,
        method: req.method,
        userId: req.user?.id,
        tenantId: req.user?.tenantId,
    });

    return res.status(statusCode).json(errorResponse);
};

// ═══════════════════════════════════════════════════════════════
// ASYNC HANDLER WRAPPER
// ═══════════════════════════════════════════════════════════════

/**
 * Wraps async route handlers to catch errors and pass to error handler
 * Usage: router.get('/', asyncHandler(async (req, res) => { ... }))
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// ═══════════════════════════════════════════════════════════════
// COMMON ERROR CHECKS
// ═══════════════════════════════════════════════════════════════

const checkResourceExists = (resource, resourceName = 'Resource') => {
    if (!resource) {
        throw new NotFoundError(`${resourceName} not found`);
    }
};

const checkUserOwnsResource = (resourceOwnerId, userId) => {
    if (resourceOwnerId.toString() !== userId.toString()) {
        throw new AuthorizationError('You do not have permission to access this resource');
    }
};

const checkTenantOwnsResource = (resourceTenantId, userTenantId) => {
    if (resourceTenantId.toString() !== userTenantId.toString()) {
        throw new AuthorizationError('Cross-tenant access denied');
    }
};

const checkFieldUniqueness = (fieldValue, fieldName, existingCount) => {
    if (existingCount > 0) {
        throw new ConflictError(`${fieldName} already exists`);
    }
};

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

module.exports = {
    // Error classes
    AppError,
    ValidationError,
    AuthenticationError,
    AuthorizationError,
    NotFoundError,
    ConflictError,
    SubscriptionError,
    FeatureGatingError,
    RateLimitError,
    DatabaseError,

    // Middleware
    errorHandler,
    asyncHandler,

    // Helpers
    checkResourceExists,
    checkUserOwnsResource,
    checkTenantOwnsResource,
    checkFieldUniqueness,
};
