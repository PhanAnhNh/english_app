const topicService = require('../service/topicService');

const getAllTopics = async (req, res) => {
    try {

        const userId = req.user ? req.user.id : null;

        if (!userId) {
            return res.status(400).json({ message: "User ID not found via Token" });
        }

        // GỌI HÀM MỚI BẠN VỪA VIẾT TRONG SERVICE
        const topics = await topicService.getTopicsWithProgress(userId);

        return res.status(200).json(topics);
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
    getAllTopics,
    getTopicById,
    createTopic,
    updateTopic,
    deleteTopic
};
