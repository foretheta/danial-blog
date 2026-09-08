const test = require('node:test');
const assert = require('node:assert/strict');

const { getPage, getPages, safePrefix, toUrl } = require('../src/utils/routing.cjs');

const pages = [
    { relativePath: '', relativeDir: '', url: '/' },
    { relativePath: 'blog/index.md', relativeDir: 'blog', url: '/blog/' },
    { relativePath: 'posts/example.md', relativeDir: 'posts', url: '/posts/example/' },
    null,
    { relativePath: 'missing-url.md', relativeDir: 'posts' }
];

test('safePrefix preserves invalid, fragment, and external values', () => {
    for (const value of [null, undefined, false, 0, {}, '', '#section', '//cdn.example.com/a.png',
        'https://example.com/a', 'mailto:test@example.com', 'tel:+123']) {
        assert.strictEqual(safePrefix(value), value);
    }
});

test('safePrefix retains Gatsby local-path and path-prefix behavior', () => {
    global.__BASE_PATH__ = '/portfolio';
    try {
        assert.equal(safePrefix('/'), '/portfolio/');
        assert.equal(safePrefix('/blog/'), '/portfolio/blog/');
        assert.equal(safePrefix('assets/image.png'), '/portfolio/assets/image.png');
        assert.equal(safePrefix('/blog'), '/portfolio/blog');
    } finally {
        delete global.__BASE_PATH__;
    }
});

test('getPage finds exact repository-relative paths with one optional leading slash', () => {
    assert.strictEqual(getPage(pages, 'blog/index.md'), pages[1]);
    assert.strictEqual(getPage(pages, '/blog/index.md'), pages[1]);
    assert.strictEqual(getPage(pages, '/'), pages[0]);
    assert.equal(getPage(pages, 'blog/index.md/'), undefined);
    assert.equal(getPage(pages, '//blog/index.md'), undefined);
});

test('getPage safely handles invalid paths, page collections, and missing pages', () => {
    for (const value of [null, undefined, 1, {}, [], '']) {
        assert.equal(getPage(pages, value), undefined);
    }
    assert.equal(getPage(null, '/blog/index.md'), undefined);
    assert.equal(getPage({}, '/blog/index.md'), undefined);
    assert.equal(getPage(pages, '#section'), undefined);
    assert.equal(getPage(pages, 'https://example.com'), undefined);
});

test('getPages finds exact folders and safely handles invalid input', () => {
    assert.deepEqual(getPages(pages, 'posts'), [pages[2], pages[4]]);
    assert.deepEqual(getPages(pages, '/posts'), [pages[2], pages[4]]);
    assert.deepEqual(getPages(pages, '/'), [pages[0]]);
    assert.deepEqual(getPages(pages, 'posts/'), []);
    assert.deepEqual(getPages(pages, '//posts'), []);
    assert.deepEqual(getPages(null, '/posts'), []);
    assert.deepEqual(getPages(pages, null), []);
    assert.deepEqual(getPages(pages, ''), []);
    assert.deepEqual(getPages(pages, 'https://example.com'), []);
});

test('toUrl preserves fragments and resolves valid page paths', () => {
    assert.equal(toUrl(pages, '#section'), '#section');
    assert.equal(toUrl(pages, '/'), '/');
    assert.equal(toUrl(pages, 'blog/index.md'), '/blog/');
    assert.equal(toUrl(pages, '/blog/index.md'), '/blog/');
});

test('toUrl returns null rather than throwing for invalid or missing route data', () => {
    for (const value of [null, undefined, 1, {}, [], '', '/missing.md', 'blog/index.md/',
        '//example.com/path', 'https://example.com/path']) {
        assert.equal(toUrl(pages, value), null);
    }
    assert.equal(toUrl(null, '/blog/index.md'), null);
    assert.equal(toUrl(pages, '/missing-url.md'), null);
});
