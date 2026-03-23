const Analytics = require('../models/Analytics');

const trackView = async (pasteId, userId) => {
    try {
        await Analytics.create({
            pasteId,
            userId,
            action: 'view',
        });
    } catch (err) {
        console.error('Analytics tracking error:', err);
    }
};

const trackCreate = async (pasteId, userId) => {
    try {
        await Analytics.create({
            pasteId,
            userId,
            action: 'create',
        });
    } catch (err) {
        console.error('Analytics tracking error:', err);
    }
};

module.exports = {
    trackView,
    trackCreate,
};
