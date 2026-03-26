const express = require('express');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { validateSignup, validateLogin } = require('../middleware/validate');
const {
    canSendEmail,
    sendVerificationEmail,
    sendLoginAlertEmail,
} = require('../utils/emailService');

const router = express.Router();

const generateAccessToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1d' });

const generateRefreshToken = (id) =>
    jwt.sign({ id }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, { expiresIn: '7d' });

const buildVerificationUrl = (req, token) => {
    const baseUrl = process.env.API_PUBLIC_URL || process.env.APP_BASE_URL || `${req.protocol}://${req.get('host')}`;
    return `${baseUrl}/api/auth/verify-email?token=${token}`;
};

const createEmailVerificationToken = () => {
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    return { rawToken, hashedToken };
};

// POST /api/auth/signup
router.post('/signup', validateSignup, async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
    }

    try {
        const { username, email, password } = req.body;
        const existing = await User.findOne({ $or: [{ email }, { username }] });
        if (existing) {
            return res.status(409).json({
                message: existing.email === email ? 'Email already in use' : 'Username already taken',
            });
        }

        const { rawToken, hashedToken } = createEmailVerificationToken();
        const user = await User.create({
            username,
            email,
            password,
            isEmailVerified: false,
            emailVerificationToken: hashedToken,
            emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        });

        if (!canSendEmail()) {
            return res.status(201).json({
                message: 'Account created, but email service is not configured. Please contact support to verify your account.',
            });
        }

        const verificationUrl = buildVerificationUrl(req, rawToken);
        try {
            await sendVerificationEmail({
                to: user.email,
                username: user.username,
                verificationUrl,
            });
        } catch (emailErr) {
            return res.status(202).json({
                message: 'Account created, but verification email could not be sent. Please use resend verification after fixing SMTP credentials.',
                code: 'VERIFICATION_EMAIL_SEND_FAILED',
            });
        }

        await user.save();

        res.status(201).json({
            message: 'Signup successful. Please check your email and verify your account before login.',
        });
    } catch (err) {
        next(err);
    }
});

// GET /api/auth/verify-email
router.get('/verify-email', async (req, res, next) => {
    try {
        const { token } = req.query;
        if (!token) {
            return res.status(400).send('Invalid verification link.');
        }

        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        const user = await User.findOne({
            emailVerificationToken: hashedToken,
            emailVerificationExpires: { $gt: new Date() },
        });

        if (!user) {
            return res.status(400).send('Verification link is invalid or expired.');
        }

        user.isEmailVerified = true;
        user.emailVerificationToken = null;
        user.emailVerificationExpires = null;
        await user.save();

        const frontendUrl = process.env.FRONTEND_URL;
        if (frontendUrl) {
            return res.redirect(`${frontendUrl}/login?verified=1`);
        }

        return res.status(200).send('Email verified successfully. You can now log in.');
    } catch (err) {
        next(err);
    }
});

// POST /api/auth/resend-verification
router.post('/resend-verification', async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.isEmailVerified) {
            return res.status(400).json({ message: 'Email is already verified' });
        }

        if (!canSendEmail()) {
            return res.status(500).json({ message: 'Email service is not configured' });
        }

        const { rawToken, hashedToken } = createEmailVerificationToken();
        user.emailVerificationToken = hashedToken;
        user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await user.save();

        const verificationUrl = buildVerificationUrl(req, rawToken);
        try {
            await sendVerificationEmail({
                to: user.email,
                username: user.username,
                verificationUrl,
            });
        } catch (emailErr) {
            return res.status(502).json({
                message: 'Unable to send verification email. Check SMTP_USER/SMTP_PASS (Gmail app password) and try again.',
                code: 'VERIFICATION_EMAIL_SEND_FAILED',
            });
        }

        return res.json({ message: 'Verification email sent' });
    } catch (err) {
        next(err);
    }
});

// POST /api/auth/login
router.post('/login', validateLogin, async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
    }

    try {
        const { email, password, rememberMe } = req.body;
        const user = await User.findOne({ email });
        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        if (!user.isEmailVerified) {
            return res.status(403).json({
                message: 'Please verify your email before logging in.',
                code: 'EMAIL_NOT_VERIFIED',
            });
        }

        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);
        
        user.refreshToken = refreshToken;
        user.rememberMe = rememberMe || false;
        user.lastLoginAt = new Date();
        await user.save();

        if (canSendEmail()) {
            sendLoginAlertEmail({
                to: user.email,
                username: user.username,
                ip: req.ip,
                userAgent: req.headers['user-agent'] || 'Unknown device',
                dateTime: new Date().toLocaleString(),
            }).catch(() => {});
        }

        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            accessToken,
            refreshToken,
            rememberMe: user.rememberMe,
        });
    } catch (err) {
        next(err);
    }
});

// POST /api/auth/refresh — refresh access token
router.post('/refresh', async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(401).json({ message: 'Refresh token required' });
        }

        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user || user.refreshToken !== refreshToken) {
            return res.status(401).json({ message: 'Invalid refresh token' });
        }

        const newAccessToken = generateAccessToken(user._id);
        res.json({ accessToken: newAccessToken });
    } catch (err) {
        res.status(401).json({ message: 'Token validation failed' });
    }
});

// POST /api/auth/logout
router.post('/logout', protect, async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        if (user) {
            user.refreshToken = null;
            await user.save();
        }
        res.json({ message: 'Logged out successfully' });
    } catch (err) {
        next(err);
    }
});

// GET /api/auth/me
router.get('/me', protect, async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
