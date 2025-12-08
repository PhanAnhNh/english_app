const achievementService = require('../service/achievementService');

const checkAchievements = async (req, res) => {
    try {
        const result = await achievementService.checkAchievements(req.user.id);
        res.json(result);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

module.exports = {
    checkAchievements
};
