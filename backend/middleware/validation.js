const Joi = require('joi');

// Validate request body against a Joi schema
const validate = (schema, source = 'body') => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req[source], {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            const messages = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }));
            return res.status(400).json({
                success: false,
                error: 'Validation error',
                details: messages
            });
        }

        req[source] = value;
        next();
    };
};

module.exports = { validate };
