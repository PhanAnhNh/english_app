const streakService = require('../service/streakService');

const getMyStreak = async (req, res) => {
    try {
        const result = await streakService.getMyStreak(req.user.id);
        res.json(result);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

const updateStreak = async (req, res) => {
    try {
        const userId = req.body.userId || req.user.id;
        const result = await streakService.updateStreak(userId);
        res.json(result);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

module.exports = {
    getMyStreak,
    updateStreak
};
