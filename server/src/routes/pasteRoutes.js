const express = require('express');
const { validationResult } = require('express-validator');
const Paste = require('../models/Paste');
const { protect, optionalAuth } = require('../middleware/auth');
const { validatePaste } = require('../middleware/validate');

const router = express.Router();

const EXPIRY_MAP = {
    '1hour': 60 * 60 * 1000,
    '1day': 24 * 60 * 60 * 1000,
    '1week': 7 * 24 * 60 * 60 * 1000,
    never: null,
};

// POST /api/paste — create paste (public or authenticated)
router.post('/', optionalAuth, validatePaste, async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
    }

    try {
        const { title, content, language, expiry, isPublic, password, selfDestruct } = req.body;
        let expiresAt = null;
        if (expiry && expiry !== 'never') {
            const ms = EXPIRY_MAP[expiry];
            if (ms) expiresAt = new Date(Date.now() + ms);
        }

        const paste = await Paste.create({
            title: title || 'Untitled',
            content,
            language: language || 'plaintext',
            expiresAt,
            userId: req.user ? req.user._id : null,
            isPublic: isPublic || false,
            passwordHash: password ? password : null,
            selfDestruct: selfDestruct || false,
        });

        res.status(201).json({
            _id: paste._id,
            slug: paste.slug,
            title: paste.title,
            language: paste.language,
            createdAt: paste.createdAt,
            expiresAt: paste.expiresAt,
            isPublic: paste.isPublic,
            isPasswordProtected: !!paste.passwordHash,
        });
    } catch (err) {
        next(err);
    }
});

// GET /api/paste — get logged-in user's pastes (auth required)
router.get('/', protect, async (req, res, next) => {
    try {
        const pastes = await Paste.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .select('slug title language createdAt expiresAt isPublic viewCount');
        res.json(pastes);
    } catch (err) {
        next(err);
    }
});

// GET /api/paste/:id — get paste by slug (public, with password support)
router.get('/:id', async (req, res, next) => {
    try {
        const { password } = req.query;
        const paste = await Paste.findOne({ slug: req.params.id });

        if (!paste) {
            return res.status(404).json({ message: 'Paste not found' });
        }

        // Check if expired
        if (paste.expiresAt && paste.expiresAt < new Date()) {
            await paste.deleteOne();
            return res.status(410).json({ message: 'Paste has expired' });
        }

        // Check password if set
        if (paste.passwordHash) {
            if (!password || !(await paste.matchPassword(password))) {
                return res.status(401).json({ message: 'Password required or incorrect' });
            }
        }

        // Increment view count
        paste.viewCount += 1;

        // Self-destruct on view
        if (paste.selfDestruct) {
            await paste.deleteOne();
        } else {
            await paste.save();
        }

        res.json(paste);
    } catch (err) {
        next(err);
    }
});

// PUT /api/paste/:id — update paste (auth required, owner only)
router.put('/:id', protect, async (req, res, next) => {
    try {
        const { title, content, language, isPublic, password } = req.body;
        const paste = await Paste.findOne({ slug: req.params.id });

        if (!paste) {
            return res.status(404).json({ message: 'Paste not found' });
        }

        if (!paste.userId || paste.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to edit this paste' });
        }

        if (title !== undefined) paste.title = title;
        if (content !== undefined) paste.content = content;
        if (language !== undefined) paste.language = language;
        if (isPublic !== undefined) paste.isPublic = isPublic;
        if (password !== undefined) paste.passwordHash = password || null;

        await paste.save();

        res.json({
            slug: paste.slug,
            title: paste.title,
            language: paste.language,
            isPublic: paste.isPublic,
            message: 'Paste updated',
        });
    } catch (err) {
        next(err);
    }
});

// DELETE /api/paste/:id — delete paste (auth required, owner only)
router.delete('/:id', protect, async (req, res, next) => {
    try {
        const paste = await Paste.findOne({ slug: req.params.id });
        if (!paste) {
            return res.status(404).json({ message: 'Paste not found' });
        }
        if (!paste.userId || paste.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this paste' });
        }
        await paste.deleteOne();
        res.json({ message: 'Paste deleted' });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
