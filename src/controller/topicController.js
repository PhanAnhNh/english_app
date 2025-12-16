const topicService = require('../service/topicService');

const getTopics = async (req, res) => {
    try {
        // req.user.id lấy từ token sau khi đăng nhập
        const data = await topicService.getTopicsWithProgress(req.user.id);
        res.json({ success: true, data: data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getTopics };

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
        const topic = await topicService.createTopic(req.body);
        res.json(topic);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

const updateTopic = async (req, res) => {
    try {
        const updated = await topicService.updateTopic(req.params.id, req.body);
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
    getTopics,
    getTopicById,
    createTopic,
    updateTopic,
    deleteTopic
};
