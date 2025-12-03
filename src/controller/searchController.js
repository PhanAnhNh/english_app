const searchService = require('../service/searchService');

const search = async (req, res) => {
    try {
        const { q, type = 'all' } = req.query;
        const result = await searchService.search(q, type);
        res.json(result);
    } catch (e) {
        const statusCode = e.message.includes('Thiếu') ? 400 : 500;
        res.status(statusCode).json({ message: e.message });
    }
};

const sendReminder = async (req, res) => {
    try {
        const result = await searchService.sendReminder();
        res.json(result);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

const getLeaderboard = async (req, res) => {
    try {
        const { type = 'weekly', limit = 50 } = req.query;
        const result = await searchService.getLeaderboard(type, limit);
        res.json(result);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

module.exports = {
    search,
    sendReminder,
    getLeaderboard
};
