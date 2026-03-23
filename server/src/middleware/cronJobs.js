const cron = require('node-cron');
const Paste = require('../models/Paste');
const { logToFile } = require('./logging');

// Run every hour to check for expired pastes
const cronJobs = () => {
    cron.schedule('0 * * * *', async () => {
        try {
            const now = new Date();
            const result = await Paste.deleteMany({
                expiresAt: { $lt: now, $ne: null },
            });
            if (result.deletedCount > 0) {
                logToFile('cron.log', `Deleted ${result.deletedCount} expired pastes`);
            }
        } catch (err) {
            logToFile('cron.log', `Cron job error: ${err.message}`);
        }
    });
};

module.exports = cronJobs;
