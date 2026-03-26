const nodemailer = require('nodemailer');

const getSmtpUser = () => process.env.SMTP_USER || process.env.EMAIL_USER;
const getSmtpPass = () => process.env.SMTP_PASS || process.env.EMAIL_PASS || process.env.GMAIL_APP_PASSWORD;
const getFromAddress = () => process.env.SMTP_FROM || process.env.EMAIL_FROM || process.env.SMTP_USER || process.env.EMAIL_USER;

const canSendEmail = () => {
    return Boolean(getSmtpUser() && getSmtpPass() && getFromAddress());
};

const createTransporter = ({ host, port }) => {
    if (!canSendEmail()) return null;

    const smtpHost = host || process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpPort = Number(port || process.env.SMTP_PORT || 587);

    // Use explicit host/port instead of service: 'gmail' for more reliability
    return nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465, // true for 465, false for 587
        auth: {
            user: getSmtpUser(),
            pass: getSmtpPass(),
        },
        // Connection timeouts (increased)
        connectionTimeout: 15000,
        greetingTimeout: 15000,
        socketTimeout: 20000,
    });
};

const sendEmail = async ({ to, subject, text, html }) => {
    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const primaryPort = Number(process.env.SMTP_PORT || 587);
    const transporter = createTransporter({ host: smtpHost, port: primaryPort });
    if (!transporter) {
        throw new Error('Email service is not configured. Required: SMTP_USER/EMAIL_USER, SMTP_PASS/EMAIL_PASS/GMAIL_APP_PASSWORD, and SMTP_FROM/EMAIL_FROM.');
    }

    const sendTimeout = 20000; // 20 seconds
    const withTimeout = (promise, ms) =>
        new Promise((resolve, reject) => {
            const timer = setTimeout(() => reject(new Error(`Email delivery timed out after ${ms}ms`)), ms);
            promise
                .then((result) => {
                    clearTimeout(timer);
                    resolve(result);
                })
                .catch((error) => {
                    clearTimeout(timer);
                    reject(error);
                });
        });

    const mailPayload = {
        from: getFromAddress(),
        to,
        subject,
        text,
        html,
    };

    try {
        console.log(`[SMTP] Attempting delivery to ${to} via ${smtpHost}:${primaryPort}...`);
        await withTimeout(
            transporter.sendMail(mailPayload),
            sendTimeout
        );
        console.log(`[SMTP] Success! Email sent to ${to}`);
    } catch (err) {
        console.error(`[SMTP] Primary attempt failed: ${err.message}`);
        const isGmailHost = smtpHost.includes('gmail');

        // Try fallback port 465 if primary was 587, or 587 if primary was 465
        const fallbackPort = primaryPort === 587 ? 465 : 587;

        try {
            console.log(`[SMTP] Retrying via fallback port ${fallbackPort}...`);
            const fallbackTransporter = createTransporter({ host: smtpHost, port: fallbackPort });
            await withTimeout(fallbackTransporter.sendMail(mailPayload), 10000);
            console.log(`[SMTP] Success on fallback! Email sent to ${to}`);
        } catch (fallbackErr) {
            console.error(`[SMTP] Fallback attempt also failed: ${fallbackErr.message}`);
            const reason = fallbackErr?.message || err?.message || 'Unknown SMTP error';
            throw new Error(`Email delivery failed: ${reason}`);
        }
    }
};

const sendVerificationEmail = async ({ to, username, verificationUrl }) => {
    const subject = 'Verify your SnipShare account';
    const text = `Hi ${username},\n\nPlease verify your email by opening this link:\n${verificationUrl}\n\nThis link expires in 24 hours.`;
    const html = `
        <p>Hi <strong>${username}</strong>,</p>
        <p>Please verify your SnipShare account by clicking the link below:</p>
        <p><a href="${verificationUrl}">${verificationUrl}</a></p>
        <p>This link expires in 24 hours.</p>
    `;

    await sendEmail({ to, subject, text, html });
};

const sendLoginAlertEmail = async ({ to, username, ip, userAgent, dateTime }) => {
    const subject = 'New login detected on your SnipShare account';
    const text = `Hi ${username},\n\nA new login was detected:\nTime: ${dateTime}\nIP: ${ip}\nDevice: ${userAgent}\n\nIf this wasn't you, change your password immediately.`;
    const html = `
        <p>Hi <strong>${username}</strong>,</p>
        <p>A new login was detected on your SnipShare account:</p>
        <ul>
            <li><strong>Time:</strong> ${dateTime}</li>
            <li><strong>IP:</strong> ${ip}</li>
            <li><strong>Device:</strong> ${userAgent}</li>
        </ul>
        <p>If this wasn't you, change your password immediately.</p>
    `;

    await sendEmail({ to, subject, text, html });
};

module.exports = {
    canSendEmail,
    sendVerificationEmail,
    sendLoginAlertEmail,
};
