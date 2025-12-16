const progressService = require('../service/progressService');

const submitExercise = async (req, res) => {
    try {
        const result = await progressService.submitExercise(req.body, req.user.id);
        res.json(result);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

const updateProgress = async (req, res) => {
    try {
        const result = await progressService.updateProgress(req.body, req.user.id);
        res.json(result);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

const getLearningStats = async (req, res) => {
    try {
        const result = await progressService.getLearningStats(req.user.id);
        res.json(result);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

const getDetailedProgress = async (req, res) => {
    try {
        const { days = 30 } = req.query;
        const result = await progressService.getDetailedProgress(req.user.id, days);
        res.json(result);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

// 1. Endpoint lấy tiến trình
const getUserProgress = async (req, res) => {
    try {
        const progress = await progressService.calculateUserProgress(req.user.id);
        res.json({ success: true, data: progress });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

// 2. Endpoint lên Level (A -> B, B -> C)
const levelUp = async (req, res) => {
    try {
        const progress = await progressService.calculateUserProgress(req.user.id);

        if (progress.canLevelUp) {
            const result = await progressService.levelUpUser(req.user.id, progress.overallLevel);
            // Gửi lại tiến trình mới sau khi lên level
            const newProgress = await progressService.calculateUserProgress(req.user.id);
            return res.json({ success: true, message: result.message, data: newProgress });
        } else {
            return res.status(400).json({ success: false, message: "Vui lòng hoàn thành tất cả chủ đề trong Level hiện tại." });
        }

    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

module.exports = {
    submitExercise,
    updateProgress,
    getLearningStats,
    getDetailedProgress,
    getUserProgress,
    levelUp
};
