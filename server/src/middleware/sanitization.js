const sanitizeHtml = require('sanitize-html');

// Sanitize user input to prevent XSS
const sanitizeInput = (input) => {
    if (typeof input !== 'string') return input;
    return input.replace(/[<>\"']/g, (char) => ({
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
    }[char]));
};

const sanitizationMiddleware = (req, res, next) => {
    // Sanitize body fields
    if (req.body) {
        req.body.title = sanitizeInput(req.body.title || '');
        if (req.body.content && typeof req.body.content === 'string') {
            req.body.content = req.body.content.slice(0, 100000); // Prevent extremely large payloads
        }
    }
    next();
};

module.exports = {
    sanitizeInput,
    sanitizationMiddleware,
};
