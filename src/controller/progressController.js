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

module.exports = {
    submitExercise,
    updateProgress,
    getLearningStats,
    getDetailedProgress
};
