const lessonService = require('../service/lessonService');

const getLessonsByTopic = async (req, res) => {
    try {
        const result = await lessonService.getLessonsByTopic(req.params.topicId);
        res.json(result);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

const getLessonById = async (req, res) => {
    try {
        const item = await lessonService.getLessonById(req.params.id);
        res.json(item);
    } catch (e) {
        res.status(404).json({ message: e.message });
    }
};

const createLesson = async (req, res) => {
    try {
        const lesson = await lessonService.createLesson(req.body);
        res.json(lesson);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

const updateLesson = async (req, res) => {
    try {
        const updated = await lessonService.updateLesson(req.params.id, req.body);
        res.json(updated);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

const deleteLesson = async (req, res) => {
    try {
        const result = await lessonService.deleteLesson(req.params.id);
        res.json(result);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

module.exports = {
    getLessonsByTopic,
    getLessonById,
    createLesson,
    updateLesson,
    deleteLesson
};
