const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
    pasteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Paste',
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    action: {
        type: String,
        enum: ['view', 'create', 'edit', 'delete', 'share'],
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Index for efficient queries
analyticsSchema.index({ pasteId: 1, createdAt: -1 });
analyticsSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Analytics', analyticsSchema);
