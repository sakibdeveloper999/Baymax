const Joi = require('joi');
const { ValidationError } = require('./errorHandler');

function parseListQuery(query, sortFields) {
    const schema = Joi.object({
        page: Joi.number().integer().min(1).max(1000000).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10),
        search: Joi.string().allow('').max(200).default(''),
        sortBy: Joi.string().valid(...sortFields).default('name'),
        sortOrder: Joi.string().valid('asc', 'desc').default('asc'),
        category: Joi.string().pattern(/^[a-fA-F0-9]{24}$/).allow('').default(''),
    });
    const { value, error } = schema.validate(query, { stripUnknown: true });
    if (error) throw new ValidationError(error.details[0].message);
    return { ...value, search: value.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') };
}
module.exports = { parseListQuery };
