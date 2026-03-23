const fs = require('fs');
const path = require('path');

const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

const logToFile = (filename, message) => {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}\n`;
    const filepath = path.join(logsDir, filename);
    fs.appendFileSync(filepath, logEntry);
};

const requestLogger = (req, res, next) => {
    const { method, url, headers } = req;
    const userAgent = headers['user-agent'] || 'Unknown';
    const message = `${method} ${url} - ${req.ip || 'Unknown IP'} - ${userAgent}`;
    logToFile('requests.log', message);
    next();
};

const errorLogger = (err, message = '') => {
    const timestamp = new Date().toISOString();
    const errorMessage = `[${timestamp}] ${err.name}: ${err.message} ${message}`;
    logToFile('errors.log', errorMessage);
};

module.exports = {
    requestLogger,
    errorLogger,
    logToFile,
};
