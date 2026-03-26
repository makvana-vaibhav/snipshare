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
    const isGmail = smtpHost.includes('gmail');

    const commonConfig = {
        connectionTimeout: Number(process.env.SMTP_CONNECTION_TIMEOUT || 7000),
        greetingTimeout: Number(process.env.SMTP_GREETING_TIMEOUT || 7000),
        socketTimeout: Number(process.env.SMTP_SOCKET_TIMEOUT || 10000),
        auth: {
            user: getSmtpUser(),
            pass: getSmtpPass(),
        },
    };

    if (isGmail) {
        return nodemailer.createTransport({
            service: 'gmail',
            ...commonConfig,
        });
    }

    return nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        ...commonConfig,
    });
};

const sendEmail = async ({ to, subject, text, html }) => {
    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const primaryPort = Number(process.env.SMTP_PORT || 587);
    const transporter = createTransporter({ host: smtpHost, port: primaryPort });
    if (!transporter) {
        throw new Error('Email service is not configured. Required: SMTP_USER/EMAIL_USER, SMTP_PASS/EMAIL_PASS/GMAIL_APP_PASSWORD, and SMTP_FROM/EMAIL_FROM.');
    }

    const sendTimeout = Number(process.env.SMTP_SEND_TIMEOUT || 12000);
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
        await withTimeout(
            transporter.sendMail(mailPayload),
            sendTimeout
        );
    } catch (err) {
        const isGmailHost = smtpHost.includes('gmail');
        const canRetryOn465 = isGmailHost && primaryPort !== 465;

        if (canRetryOn465) {
            try {
                const fallbackTransporter = createTransporter({ host: smtpHost, port: 465 });
                await withTimeout(fallbackTransporter.sendMail(mailPayload), Math.min(sendTimeout, 6000));
                return;
            } catch (fallbackErr) {
                const reason = fallbackErr?.message || err?.message || 'Unknown SMTP error';
                throw new Error(`Email delivery failed: ${reason}`);
            }
        }

        const reason = err?.message || 'Unknown SMTP error';
        throw new Error(`Email delivery failed: ${reason}`);
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
