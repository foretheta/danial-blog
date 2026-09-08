const test = require('node:test');
const assert = require('node:assert/strict');

const { getMenuFocusTarget } = require('../src/utils/mobileMenu.cjs');
const { getContactValidationMessage } = require('../src/utils/contactValidation.cjs');

test('mobile menu focus wraps at both ends', () => {
    const toggle = {};
    const firstLink = {};
    const lastLink = {};
    const focusable = [toggle, firstLink, lastLink];

    assert.equal(getMenuFocusTarget(focusable, lastLink, false), toggle);
    assert.equal(getMenuFocusTarget(focusable, toggle, true), lastLink);
    assert.equal(getMenuFocusTarget(focusable, firstLink, false), null);
    assert.equal(getMenuFocusTarget(focusable, {}, false), toggle);
});

test('mobile menu focus helper handles an empty menu', () => {
    assert.equal(getMenuFocusTarget([], null, false), null);
});

test('contact validation returns specific required and email messages', () => {
    assert.equal(getContactValidationMessage('name', {valid: false, valueMissing: true}), 'Enter your name.');
    assert.equal(getContactValidationMessage('email', {valid: false, valueMissing: true}), 'Enter your email address.');
    assert.equal(getContactValidationMessage('message', {valid: false, valueMissing: true}), 'Enter a message.');
    assert.equal(getContactValidationMessage('email', {valid: false, typeMismatch: true}), 'Enter a valid email address.');
    assert.equal(getContactValidationMessage('email', {valid: true}), '');
});
