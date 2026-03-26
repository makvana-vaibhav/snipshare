const nodemailer = require('nodemailer');

const canSendEmail = () => {
    return Boolean(
        process.env.SMTP_HOST
        && process.env.SMTP_PORT
        && process.env.SMTP_USER
        && process.env.SMTP_PASS
        && process.env.SMTP_FROM
    );
};

const createTransporter = () => {
    if (!canSendEmail()) return null;

    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
};

const sendEmail = async ({ to, subject, text, html }) => {
    const transporter = createTransporter();
    if (!transporter) {
        throw new Error('Email service is not configured. Missing SMTP environment variables.');
    }

    await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to,
        subject,
        text,
        html,
    });
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
