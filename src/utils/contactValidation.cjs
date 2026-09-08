'use strict';

const REQUIRED_MESSAGES = {
    name: 'Enter your name.',
    email: 'Enter your email address.',
    message: 'Enter a message.'
};

function getContactValidationMessage(name, validity) {
    if (!validity || validity.valid) return '';
    if (validity.valueMissing) return REQUIRED_MESSAGES[name] || 'Complete this field.';
    if (name === 'email' && validity.typeMismatch) return 'Enter a valid email address.';
    return 'Check this field.';
}

module.exports = { getContactValidationMessage };
