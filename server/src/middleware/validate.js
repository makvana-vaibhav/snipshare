const { body } = require('express-validator');

exports.validatePaste = [
    body('content')
        .notEmpty().withMessage('Content is required')
        .isLength({ max: 100000 }).withMessage('Content must be under 100,000 characters'),
    body('title')
        .optional()
        .isLength({ max: 200 }).withMessage('Title must be under 200 characters'),
    body('language')
        .optional()
        .isIn([
            'plaintext', 'javascript', 'typescript', 'python', 'java', 'c',
            'cpp', 'csharp', 'go', 'rust', 'ruby', 'php', 'swift', 'kotlin',
            'html', 'css', 'json', 'yaml', 'sql', 'bash', 'markdown',
        ]).withMessage('Invalid language'),
    body('expiry')
        .optional()
        .isIn(['never', '1hour', '1day', '1week']).withMessage('Invalid expiry option'),
];

exports.validateSignup = [
    body('username')
        .trim()
        .notEmpty().withMessage('Username is required')
        .isLength({ min: 3, max: 30 }).withMessage('Username must be 3-30 characters')
        .isAlphanumeric().withMessage('Username must be alphanumeric'),
    body('email')
        .isEmail().withMessage('Valid email is required')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

exports.validateLogin = [
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
];
