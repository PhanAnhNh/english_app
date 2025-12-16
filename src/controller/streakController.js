const streakService = require('../service/streakService');

// controller/streakController.js
const getMyStreak = async (req, res) => {
    try {
        console.log("User Info in Request:", req.user); // <--- THÊM DÒNG NÀY

        // Kiểm tra xem nên dùng req.user.id hay req.user._id hay req.user.userId
        const userId = req.user.id || req.user._id || req.user.userId;

        const result = await streakService.getMyStreak(userId);
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
