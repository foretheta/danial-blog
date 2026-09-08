#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const ATTRIBUTE_PATTERN = /(?:^|\s)(href|src)\s*=\s*(["'])(.*?)\2/gis;
const ANCHOR_PATTERN = /(?:^|\s)(?:id|name)\s*=\s*(["'])(.*?)\1/gis;
const PROTOCOL_PATTERN = /^[a-z][a-z\d+.-]*:/i;
const LOCAL_ORIGIN = 'https://local.invalid';

function decodeHtml(value) {
    return value
        .replace(/&#(\d+);/g, (_, number) => String.fromCodePoint(Number(number)))
        .replace(/&#x([\da-f]+);/gi, (_, number) => String.fromCodePoint(parseInt(number, 16)))
        .replace(/&amp;/gi, '&')
        .replace(/&quot;/gi, '"')
        .replace(/&apos;|&#39;/gi, "'")
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>');
}

function findHtmlFiles(directory) {
    const files = [];
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
        const entryPath = path.join(directory, entry.name);
        if (entry.isDirectory()) {
            files.push(...findHtmlFiles(entryPath));
        } else if (entry.isFile() && entry.name.endsWith('.html')) {
            files.push(entryPath);
        }
    }
    return files.sort();
}

function pageUrl(publicDirectory, htmlFile) {
    const relative = path.relative(publicDirectory, htmlFile).split(path.sep).join('/');
    if (relative === 'index.html') return '/';
    if (relative.endsWith('/index.html')) return `/${relative.slice(0, -'index.html'.length)}`;
    return `/${relative}`;
}

function resolveReference(fromPageUrl, rawValue) {
    const value = decodeHtml(rawValue.trim());
    if (PROTOCOL_PATTERN.test(value) || value.startsWith('//')) return null;

    const url = new URL(value || fromPageUrl, `${LOCAL_ORIGIN}${fromPageUrl}`);
    if (url.origin !== LOCAL_ORIGIN) return null;

    let pathname;
    let fragment;
    try {
        pathname = decodeURIComponent(url.pathname);
        fragment = url.hash ? decodeURIComponent(url.hash.slice(1)) : '';
    } catch {
        throw new Error('contains invalid percent-encoding');
    }

    return { pathname, fragment };
}

function targetCandidates(publicDirectory, pathname) {
    const relativePath = pathname.replace(/^\/+/, '');
    const directPath = path.join(publicDirectory, ...relativePath.split('/'));
    const candidates = pathname.endsWith('/')
        ? [path.join(directPath, 'index.html')]
        : [directPath, path.join(directPath, 'index.html'), `${directPath}.html`];
    return [...new Set(candidates)];
}

function findTarget(publicDirectory, pathname) {
    return targetCandidates(publicDirectory, pathname).find(candidate => {
        try {
            return fs.statSync(candidate).isFile();
        } catch {
            return false;
        }
    });
}

function readAnchors(htmlFile, cache) {
    if (cache.has(htmlFile)) return cache.get(htmlFile);

    const anchors = new Set();
    const html = fs.readFileSync(htmlFile, 'utf8');
    for (const match of html.matchAll(ANCHOR_PATTERN)) {
        anchors.add(decodeHtml(match[2]));
    }
    cache.set(htmlFile, anchors);
    return anchors;
}

function checkPublic(publicDirectory) {
    const root = path.resolve(publicDirectory);
    if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) {
        return [`Generated artifact directory does not exist: ${root}`];
    }

    const htmlFiles = findHtmlFiles(root);
    if (htmlFiles.length === 0) {
        return [`No generated HTML pages found in: ${root}`];
    }

    const issues = [];
    const anchorCache = new Map();

    for (const htmlFile of htmlFiles) {
        const source = path.relative(root, htmlFile).split(path.sep).join('/');
        const fromUrl = pageUrl(root, htmlFile);
        const html = fs.readFileSync(htmlFile, 'utf8');

        for (const match of html.matchAll(ATTRIBUTE_PATTERN)) {
            const attribute = match[1].toLowerCase();
            const rawValue = match[3];
            let reference;
            try {
                reference = resolveReference(fromUrl, rawValue);
            } catch (error) {
                issues.push(`${source}: ${attribute}="${rawValue}" ${error.message}`);
                continue;
            }
            if (!reference) continue;

            const target = findTarget(root, reference.pathname);
            if (!target) {
                const expected = targetCandidates(root, reference.pathname)
                    .map(candidate => path.relative(root, candidate).split(path.sep).join('/'))
                    .join(', ');
                issues.push(
                    `${source}: ${attribute}="${rawValue}" resolves to missing ` +
                    `"${reference.pathname}" (checked: ${expected})`
                );
                continue;
            }

            if (reference.fragment && target.endsWith('.html')) {
                const anchors = readAnchors(target, anchorCache);
                if (!anchors.has(reference.fragment)) {
                    issues.push(
                        `${source}: ${attribute}="${rawValue}" resolves to missing fragment ` +
                        `"#${reference.fragment}" in ${path.relative(root, target).split(path.sep).join('/')}`
                    );
                }
            }
        }
    }

    return issues;
}

function main() {
    const publicDirectory = process.argv[2] || 'public';
    const issues = checkPublic(publicDirectory);
    if (issues.length > 0) {
        console.error(`Public artifact check failed with ${issues.length} broken local reference(s):`);
        for (const issue of issues) console.error(`- ${issue}`);
        process.exitCode = 1;
        return;
    }

    console.log(`Public artifact check passed: ${findHtmlFiles(path.resolve(publicDirectory)).length} HTML page(s).`);
}

if (require.main === module) main();

module.exports = { checkPublic, pageUrl, resolveReference, targetCandidates };
