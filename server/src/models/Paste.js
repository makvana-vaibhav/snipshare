const mongoose = require('mongoose');
const { customAlphabet } = require('nanoid');
const bcrypt = require('bcryptjs');
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
    isPublic: {
        type: Boolean,
        default: false,
    },
    viewCount: {
        type: Number,
        default: 0,
    },
    passwordHash: {
        type: String,
        default: null,
    },
    selfDestruct: {
        type: Boolean,
        default: false,
    },
});

// Hash password before saving if modified
pasteSchema.pre('save', async function () {
    if (!this.isModified('passwordHash') || !this.passwordHash) return;
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
});

// Compare password helper
pasteSchema.methods.matchPassword = async function (enteredPassword) {
    if (!this.passwordHash) return false;
    return bcrypt.compare(enteredPassword, this.passwordHash);
};

module.exports = mongoose.model('Paste', pasteSchema);
