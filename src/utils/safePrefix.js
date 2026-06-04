const { withPrefix } = require("gatsby");
const _ = require('lodash');

export default function(url) {
    if (!url ||
        _.startsWith(url, '#') ||
        _.startsWith(url, '//') ||
        /^[a-z][a-z0-9+.-]*:/i.test(url)) {
        return url;
    }
    return withPrefix(url);
}
