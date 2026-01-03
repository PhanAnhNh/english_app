// controller/exerciseController.js
const exerciseService = require('../service/exerciseService');

const getExercises = async (req, res) => {
    try {
        // Truyền toàn bộ query params (page, limit, skill, mode, topicId...) sang Service
        const result = await exerciseService.getExercises(req.query);
        res.json(result);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
};

const getUnifiedExercises = async (req, res) => {
    try {
        const result = await exerciseService.getUnifiedExercises(req.query);
        res.json(result);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
};

const getExerciseById = async (req, res) => {
    try {
        const item = await exerciseService.getExerciseById(req.params.id);
        res.json(item);
    } catch (e) {
        res.status(404).json({ message: e.message });
    }
};

const createExercise = async (req, res) => {
    try {
        // user.id lấy từ middleware auth
        const item = await exerciseService.createExercise(req.body, req.user ? req.user.id : null);
        res.json(item);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

const updateExercise = async (req, res) => {
    try {
        const updated = await exerciseService.updateExercise(req.params.id, req.body);
        res.json(updated);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

const deleteExercise = async (req, res) => {
    try {
        const result = await exerciseService.deleteExercise(req.params.id);
        res.json(result);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

const bulkDeleteExercises = async (req, res) => {
    try {
        const { ids } = req.body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ error: 'Danh sách IDs không hợp lệ' });
        }

        const result = await exerciseService.bulkDeleteExercises(ids);
        res.json(result);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};


module.exports = {
    getExercises,
    getExerciseById,
    createExercise,
    updateExercise,
    deleteExercise,
    deleteExercise,
    bulkDeleteExercises,
    getUnifiedExercises
};