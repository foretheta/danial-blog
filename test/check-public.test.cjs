const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const { checkPublic, pageUrl, resolveReference } = require('../scripts/check-public.cjs');

function fixture(files) {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'check-public-'));
    for (const [name, content] of Object.entries(files)) {
        const file = path.join(directory, name);
        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.writeFileSync(file, content);
    }
    return directory;
}

test('pageUrl maps generated index pages to their served routes', () => {
    assert.equal(pageUrl('/site/public', '/site/public/index.html'), '/');
    assert.equal(pageUrl('/site/public', '/site/public/blog/index.html'), '/blog/');
    assert.equal(pageUrl('/site/public', '/site/public/404.html'), '/404.html');
});

test('resolveReference handles relative paths, queries, fragments, and external URLs', () => {
    assert.deepEqual(resolveReference('/blog/', '../images/photo%201.jpg?size=2#hero'), {
        pathname: '/images/photo 1.jpg',
        fragment: 'hero'
    });
    assert.deepEqual(resolveReference('/blog/', '?preview=1'), { pathname: '/blog/', fragment: '' });
    assert.deepEqual(resolveReference('/blog/', '#section%202'), {
        pathname: '/blog/',
        fragment: 'section 2'
    });
    assert.equal(resolveReference('/blog/', 'https://example.com/page'), null);
    assert.equal(resolveReference('/blog/', '//cdn.example.com/image.png'), null);
    assert.equal(resolveReference('/blog/', 'mailto:hello@example.com'), null);
});

test('checkPublic accepts valid root-relative and page-relative targets', t => {
    const directory = fixture({
        'index.html': '<a href="/blog/?from=home#intro">Blog</a><img src="/images/avatar.png">',
        'blog/index.html': '<main id="intro"><a href="../contact/">Contact</a></main>',
        'contact/index.html': '<a href="?sent=1">Contact</a>',
        'images/avatar.png': 'image'
    });
    t.after(() => fs.rmSync(directory, { recursive: true, force: true }));

    assert.deepEqual(checkPublic(directory), []);
});

test('checkPublic reports a broken internal target without changing the fixture', t => {
    const html = '<a href="../missing/?from=test#details">Missing page</a>';
    const directory = fixture({ 'blog/index.html': html });
    t.after(() => fs.rmSync(directory, { recursive: true, force: true }));

    const issues = checkPublic(directory);

    assert.equal(issues.length, 1);
    assert.match(issues[0], /blog\/index\.html: href="\.\.\/missing\/\?from=test#details"/);
    assert.match(issues[0], /resolves to missing "\/missing\/"/);

    const result = spawnSync(process.execPath, [path.join(__dirname, '../scripts/check-public.cjs'), directory], {
        encoding: 'utf8'
    });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /Public artifact check failed with 1 broken local reference/);
    assert.match(result.stderr, /blog\/index\.html/);
    assert.equal(fs.readFileSync(path.join(directory, 'blog/index.html'), 'utf8'), html);
});

test('checkPublic reports missing fragments separately from missing files', t => {
    const directory = fixture({
        'index.html': '<a href="/about/#missing">About</a>',
        'about/index.html': '<h1 id="present">About</h1>'
    });
    t.after(() => fs.rmSync(directory, { recursive: true, force: true }));

    assert.deepEqual(checkPublic(directory), [
        'index.html: href="/about/#missing" resolves to missing fragment "#missing" in about/index.html'
    ]);
});
