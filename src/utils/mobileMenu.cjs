'use strict';

function getMenuFocusTarget(focusable, activeElement, shiftKey) {
    if (!focusable.length) return null;

    const activeIndex = focusable.indexOf(activeElement);
    if (shiftKey && activeIndex <= 0) return focusable[focusable.length - 1];
    if (!shiftKey && (activeIndex === -1 || activeIndex === focusable.length - 1)) return focusable[0];
    return null;
}

module.exports = { getMenuFocusTarget };
