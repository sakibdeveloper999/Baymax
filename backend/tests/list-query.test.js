const test = require('node:test');
const assert = require('node:assert/strict');
const { parseListQuery } = require('../utils/listQuery');
test('search treats punctuation as literal text rather than regex syntax', () => {
    for (const search of ['[', 'Milk (1L)', 'a.*', 'a+b?', '$5', 'a\\b']) {
        const parsed = parseListQuery({ search }, ['name']);
        const regex = new RegExp('^' + parsed.search + '$', 'i');
        assert.equal(regex.test(search), true);
        assert.equal(regex.test('unrelated'), false);
    }
    assert.equal(new RegExp(parseListQuery({search: 'a.*'}, ['name']).search).test('anything'), false);
});
test('list query accepts UI values and applies numeric defaults', () => {
    assert.equal(parseListQuery({}, ['name']).limit, 10);
    const result = parseListQuery({page: '2', limit: '100', search: ''}, ['name']);
    assert.equal(result.page, 2);
    assert.equal(result.limit, 100);
});
test('invalid pagination, structured searches and category IDs return validation errors', () => {
    for (const query of [{page: 0}, {page: 'bad'}, {page: 1.5}, {limit: 0}, {limit: 101}, {search: {$ne: ''}}, {search: ['a','b']}, {category: 'bad'}, {sortBy: '$where'}]) {
        assert.throws(() => parseListQuery(query, ['name']), error => error.statusCode === 400);
    }
});
