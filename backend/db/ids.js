const { randomBytes } = require('node:crypto');
// Preserve the API's existing 24-character ID format, independently of MongoDB.
const newId = () => randomBytes(12).toString('hex');
const isValidId = value => typeof value === 'string' && /^[a-f0-9]{24}$/i.test(value);
module.exports = { newId, isValidId };
