const topicService = require('../service/topicService');

const getAllTopics = async (req, res) => {
    try {
        const { page, limit } = req.query;
        const userId = req.user ? req.user.id : null;

        // TRƯỜNG HỢP 1: Mobile App với userId (có hoặc không có pagination)
        if (userId) {
            const result = await topicService.getTopicsWithProgress(userId, req.query);
            return res.status(200).json(result);
        }

        // TRƯỜNG HỢP 2: Admin hoặc không có userId
        const result = await topicService.getTopics(req.query);
        return res.status(200).json(result);

    } catch (e) {
        console.log(e);
        return res.status(500).json({ message: e.message });
    }
};
const getTopicById = async (req, res) => {
    try {
        const item = await topicService.getTopicById(req.params.id);
        res.json(item);
    } catch (e) {
        res.status(404).json({ message: e.message });
    }
};

const createTopic = async (req, res) => {
    try {
        const topic = await topicService.createTopic(req.body, req.files);
        res.json(topic);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

const updateTopic = async (req, res) => {
    try {
        const updated = await topicService.updateTopic(req.params.id, req.body, req.files);
        res.json(updated);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

const deleteTopic = async (req, res) => {
    try {
        const result = await topicService.deleteTopic(req.params.id);
        res.json(result);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

module.exports = {
    getAllTopics,
    getTopicById,
    createTopic,
    updateTopic,
    deleteTopic
};
