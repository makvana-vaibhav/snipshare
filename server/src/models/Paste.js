const mongoose = require('mongoose');
const { customAlphabet } = require('nanoid');
const generateCode = customAlphabet('0123456789', 6);

const pasteSchema = new mongoose.Schema({
    slug: {
        type: String,
        unique: true,
        default: () => generateCode(),
    },
    title: {
        type: String,
        trim: true,
        maxlength: 200,
        default: 'Untitled',
    },
    content: {
        type: String,
        required: [true, 'Content is required'],
        maxlength: 100000,
    },
    language: {
        type: String,
        default: 'plaintext',
        enum: [
            'plaintext', 'javascript', 'typescript', 'python', 'java', 'c',
            'cpp', 'csharp', 'go', 'rust', 'ruby', 'php', 'swift', 'kotlin',
            'html', 'css', 'json', 'yaml', 'sql', 'bash', 'markdown',
        ],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    expiresAt: {
        type: Date,
        default: null,
        index: { expireAfterSeconds: 0, sparse: true },
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
});

module.exports = mongoose.model('Paste', pasteSchema);
