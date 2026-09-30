const db = require('./pool');
const schemas = require('./schema');
const { newId, isValidId } = require('./ids');
const { hash, compare } = require('bcryptjs');
const { ValidationError, ConflictError } = require('../utils/errorHandler');
const models = new Map();
const quote = name => '"' + name.replace(/"/g, '""') + '"';
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const scalar = value => value && typeof value === 'object' && value._id ? value._id : value;
const columns = schema => ({ _id: { type: 'id', required: true }, ...schema.fields,
    createdAt: { type: 'date' }, updatedAt: { type: 'date' } });

function normalize(value, field, name) {
    if (value == null) return value;
    if (field.type === 'id') {
        value = scalar(value);
        if (!isValidId(value)) throw new ValidationError(`Invalid ${name}`);
        return value;
    }
    if (field.type === 'text') {
        if (typeof value !== 'string') throw new ValidationError(`${name} must be text`);
        if (field.lowercase) value = value.toLowerCase();
        if (field.uppercase) value = value.toUpperCase();
    } else if (field.type === 'number') {
        if (typeof value !== 'number' || !Number.isFinite(value)) throw new ValidationError(`${name} must be a finite number`);
    } else if (field.type === 'boolean') {
        if (typeof value !== 'boolean') throw new ValidationError(`${name} must be a boolean`);
    } else if (field.type === 'date') {
        value = new Date(value);
        if (!Number.isFinite(value.getTime())) throw new ValidationError(`${name} must be a valid date`);
    } else if (field.type === 'json') {
        if (field.items) {
            if (!Array.isArray(value)) throw new ValidationError(`${name} must be an array`);
            value = value.map(item => normalizeFields(item, field.items, true));
        } else if (Array.isArray(field.default) && !Array.isArray(value)) {
            throw new ValidationError(`${name} must be an array`);
        }
    }
    if (field.enum && !field.enum.includes(value)) throw new ValidationError(`Invalid ${name}`);
    return value;
}
function normalizeFields(data, fields, required) {
    const result = {};
    for (const [name, field] of Object.entries(fields)) {
        let value = data[name];
        if (value === undefined && field.default !== undefined) value = field.default === 'now' ? new Date() : structuredClone(field.default);
        if (required && field.required && (value == null || value === '')) throw new ValidationError(`${name} is required`);
        if (value !== undefined) result[name] = normalize(value, field, name);
    }
    return result;
}
const encoded = (value, field) => field.type === 'json' && value != null ? JSON.stringify(value) : scalar(value);

function where(schema, filter, values) {
    const fields = columns(schema);
    const bind = value => { values.push(value); return '$' + values.length; };
    const entries = Object.entries(filter).map(([key, value]) => {
        if (key === '$or' || key === '$and') {
            if (!Array.isArray(value) || !value.length) throw new ValidationError('Invalid query group');
            return '(' + value.map(part => where(schema, part, values)).join(key === '$or' ? ' OR ' : ' AND ') + ')';
        }
        const field = fields[key];
        if (!field) throw new ValidationError(`Unknown query field: ${key}`);
        const column = quote(key);
        const val = input => encoded(normalize(input, field, key), field);
        if (value && typeof value === 'object' && !(value instanceof Date) && !value._id) {
            return '(' + Object.entries(value).filter(([op]) => op !== '$options').map(([op, input]) => {
                if (op === '$in') {
                    if (!Array.isArray(input)) throw new ValidationError('Invalid list filter');
                    return input.length ? `${column} IN (${input.map(v => bind(val(v))).join(', ')})` : 'FALSE';
                }
                if (op === '$regex') {
                    if (field.type !== 'text' || typeof input !== 'string') throw new ValidationError('Invalid search');
                    return `${column} ${value.$options === 'i' ? '~*' : '~'} ${bind(input)}`;
                }
                const operator = { $ne: 'IS DISTINCT FROM', $gte: '>=', $lte: '<=', $gt: '>', $lt: '<' }[op];
                if (!operator) throw new ValidationError(`Unsupported query operator: ${op}`);
                return `${column} ${operator} ${bind(val(input))}`;
            }).join(' AND ') + ')';
        }
        return value == null ? `${column} IS NULL` : `${column} = ${bind(val(value))}`;
    });
    return entries.join(' AND ') || 'TRUE';
}

class Query {
    constructor(Model, filter, single = false, count = false) {
        Object.assign(this, { Model, filter, single, count, joins: [], offset: 0 });
    }
    select(value) { this.selection = value; return this; }
    populate(path, selection) { this.joins.push({ path, selection }); return this; }
    sort(value) { this.order = value; return this; }
    skip(value) { this.offset = value; return this; }
    limit(value) { this.maximum = value; return this; }
    lean() { this.plain = true; return this; }
    session(value) { this.transaction = value; return this; }
    then(resolve, reject) { return this.exec().then(resolve, reject); }
    async exec() {
        const schema = this.Model.definition;
        const fields = columns(schema);
        let selected = Object.keys(fields).filter(key => fields[key].select !== false);
        if (this.selection) {
            const tokens = this.selection.split(/\s+/).filter(Boolean);
            const includes = tokens.filter(token => !/^[+-]/.test(token));
            if (includes.length) selected = ['_id', ...includes.filter(key => fields[key])];
            for (const token of tokens) {
                if (token.startsWith('+') && fields[token.slice(1)]) selected.push(token.slice(1));
                if (token.startsWith('-')) selected = selected.filter(key => key !== token.slice(1));
            }
        }
        selected = [...new Set(selected)];
        const values = [];
        let sql = `SELECT ${this.count ? 'count(*) AS count' : selected.map(quote).join(', ')} FROM ${quote(schema.table)} WHERE ${where(schema, this.filter, values)}`;
        const session = this.transaction || db.currentSession();
        if (!this.count) {
            const order = this.order || (session ? { _id: 1 } : {});
            const terms = Object.entries(order).map(([key, direction]) => {
                if (!fields[key]) throw new ValidationError('Invalid sort field');
                return `${quote(key)} ${direction === -1 ? 'DESC' : 'ASC'}`;
            });
            if (terms.length) sql += ' ORDER BY ' + terms.join(', ');
            const limit = this.single ? 1 : this.maximum;
            for (const [name, value] of [['LIMIT', limit], ['OFFSET', this.offset]]) {
                if (value !== undefined) {
                    if (!Number.isSafeInteger(value) || value < 0) throw new ValidationError(`Invalid ${name.toLowerCase()}`);
                    values.push(value); sql += ` ${name} $${values.length}`;
                }
            }
            if (session) sql += ' FOR UPDATE';
        }
        const result = await db.query(sql, values, session);
        if (this.count) return Number(result.rows[0].count);
        const docs = result.rows.map(row => this.Model.hydrate(row));
        for (const doc of docs) {
            for (const { path, selection } of this.joins) {
                const [root, child] = path.split('.');
                const field = child ? schema.fields[root]?.items?.[child] : schema.fields[root];
                if (!field?.ref) throw new ValidationError(`Unknown relation ${path}`);
                const Related = createModel(field.ref);
                const owners = child ? doc[root] || [] : [doc];
                const key = child || root;
                for (const owner of owners) {
                    if (owner[key]) owner[key] = await Related.findById(scalar(owner[key])).select(selection || '').session(session);
                }
            }
        }
        const output = this.plain ? docs.map(doc => doc.toObject()) : docs;
        return this.single ? output[0] || null : output;
    }
}

function createModel(name) {
    if (models.has(name)) return models.get(name);
    const schema = schemas[name];
    if (!schema) throw new Error(`Unknown model ${name}`);
    const fields = columns(schema);
    class Model {
        constructor(data = {}, hydrated = false) {
            Object.defineProperty(this, '_state', { value: { fresh: !hydrated, original: {} }, writable: true });
            if (hydrated) {
                for (const [key, value] of Object.entries(data)) {
                    this[key] = value != null && fields[key]?.type === 'number' ? Number(value) :
                        value != null && fields[key]?.type === 'date' ? new Date(value) : value;
                }
            } else {
                Object.assign(this, normalizeFields(data, schema.fields, false));
                this._id = data._id || newId();
            }
            if (hydrated) this._state.original = this._values();
        }
        static get definition() { return schema; }
        static hydrate(row) { return new Model(row, true); }
        static find(filter = {}) { return new Query(Model, filter); }
        static findOne(filter = {}) { return new Query(Model, filter, true); }
        static findById(id) { return Model.findOne({ _id: id }); }
        static countDocuments(filter = {}) { return new Query(Model, filter, false, true); }
        static async create(data, options = {}) {
            if (Array.isArray(data)) {
                const result = [];
                for (const item of data) result.push(await Model.create(item, options));
                return result;
            }
            const doc = new Model(data); await doc.save(options); return doc;
        }
        static insertMany(data, options) { return Model.create(data, options); }
        // Only insert-on-conflict is needed by the plan bootstrap; never overwrites existing plans.
        static async updateOne(filter, update, options) {
            if (!options?.upsert || !update.$setOnInsert || Object.keys(update).length !== 1) throw new Error('Unsupported update; use save()');
            const doc = new Model({ ...filter, ...update.$setOnInsert });
            await doc.validate();
            const data = doc._values();
            data.createdAt = data.updatedAt = new Date();
            const keys = Object.keys(data);
            const result = await db.query(`INSERT INTO ${quote(schema.table)} (${keys.map(quote)}) VALUES (${keys.map((_, i) => '$' + (i + 1))}) ON CONFLICT DO NOTHING`, keys.map(key => encoded(data[key], fields[key])));
            return { upsertedCount: result.rowCount };
        }
        get id() { return this._id; }
        _values() {
            const result = {};
            for (const [key, field] of Object.entries(fields)) {
                if (this[key] !== undefined) result[key] = normalize(this[key], field, key);
            }
            return structuredClone(result);
        }
        async validate() {
            if (schema.number && !this[schema.number[0]]) {
                this[schema.number[0]] = `${schema.number[1]}-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${this._id}`;
            }
            const data = this._values();
            for (const [key, field] of Object.entries(fields)) {
                if (field.required && (this._state.fresh || Object.hasOwn(data, key)) && (data[key] == null || data[key] === '')) throw new ValidationError(`${key} is required`);
            }
            return this;
        }
        async save({ session } = {}) {
            await this.validate();
            if (name === 'User' && this.password !== undefined && !same(this.password, this._state.original.password)) {
                this.password = await hash(this.password, 12);
            }
            let data = this._values();
            const now = new Date();
            let result;
            if (this._state.fresh) {
                data.createdAt = data.updatedAt = now;
                const keys = Object.keys(data);
                result = await db.query(`INSERT INTO ${quote(schema.table)} (${keys.map(quote)}) VALUES (${keys.map((_, i) => '$' + (i + 1))}) RETURNING "createdAt", "updatedAt"`, keys.map(key => encoded(data[key], fields[key])), session);
            } else {
                const keys = Object.keys(data).filter(key => !['_id', 'createdAt', 'updatedAt'].includes(key) && !same(data[key], this._state.original[key]));
                if (!keys.length) return this;
                const values = keys.map(key => encoded(data[key], fields[key]));
                values.push(now, this._id);
                let sql = `UPDATE ${quote(schema.table)} SET ${keys.map((key, i) => `${quote(key)} = $${i + 1}`).join(', ')}, "updatedAt" = $${keys.length + 1} WHERE "_id" = $${keys.length + 2}`;
                // Compare changed fields to prevent lost updates outside a locked transaction.
                for (const key of keys) {
                    if (!Object.hasOwn(this._state.original, key)) continue;
                    values.push(encoded(this._state.original[key], fields[key]));
                    sql += ` AND ${quote(key)} IS NOT DISTINCT FROM $${values.length}`;
                }
                result = await db.query(sql + ' RETURNING "createdAt", "updatedAt"', values, session);
                if (!result.rows.length) throw new ConflictError('Record changed or was removed; refresh and retry');
            }
            Object.assign(this, result.rows[0]);
            this._state.fresh = false;
            this._state.original = this._values();
            return this;
        }
        comparePassword(candidate) { return compare(candidate, this.password); }
        toObject() { return JSON.parse(JSON.stringify(Object.fromEntries(Object.entries(this)))); }
        toJSON() { return this.toObject(); }
    }
    models.set(name, Model);
    return Model;
}
module.exports = { createModel };
