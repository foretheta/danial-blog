const { withPrefix } = require('gatsby');

// Lookup paths are repository-relative and matched exactly after removing one
// optional leading slash. They are not resolved relative to the current page.
function normalizeLookupPath(path) {
    return typeof path === 'string' && path.length > 0
        ? path.replace(/^\//, '')
        : null;
}

/**
 * Return the page whose relativePath exactly matches pagePath after one optional
 * leading slash. Trailing/extra slashes are significant; '/' selects the root.
 * Invalid collections or paths and missing pages return undefined.
 */
function getPage(pages, pagePath) {
    const normalizedPath = normalizeLookupPath(pagePath);
    if (!Array.isArray(pages) || normalizedPath === null) {
        return undefined;
    }
    return pages.find((page) => page && page.relativePath === normalizedPath);
}

/**
 * Return pages whose relativeDir exactly matches folderPath under the same path
 * rules as getPage. Invalid input returns an empty array.
 */
function getPages(pages, folderPath) {
    const normalizedPath = normalizeLookupPath(folderPath);
    if (!Array.isArray(pages) || normalizedPath === null) {
        return [];
    }
    return pages.filter((page) => page && page.relativeDir === normalizedPath);
}

/**
 * Resolve a repository page path to its URL, or preserve a fragment. Invalid,
 * external, protocol-relative, missing, or URL-less page data returns null.
 */
function toUrl(pages, pagePath) {
    if (typeof pagePath !== 'string') {
        return null;
    }
    if (pagePath.startsWith('#')) {
        return pagePath;
    }
    const page = getPage(pages, pagePath);
    return page && typeof page.url === 'string' ? page.url : null;
}

/**
 * Delegate local string paths unchanged to Gatsby's withPrefix, preserving its
 * path-prefix and slash behavior. Invalid values, fragments, scheme URLs, and
 * protocol-relative URLs pass through unchanged.
 */
function safePrefix(url) {
    if (typeof url !== 'string' ||
        !url ||
        url.startsWith('#') ||
        url.startsWith('//') ||
        /^[a-z][a-z0-9+.-]*:/i.test(url)) {
        return url;
    }
    return withPrefix(url);
}

module.exports = { getPage, getPages, safePrefix, toUrl };
