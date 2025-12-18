const topicService = require('../service/topicService');

const getAllTopics = async (req, res) => {
    try {
        const { page, limit } = req.query;

        // Nếu có page hoặc limit (dấu hiệu từ Admin hoặc App muốn phân trang)
        // HOẶC nếu user là Admin (kiểm tra qua req.user.role nếu có, hoặc đơn giản phụ thuộc param)
        if (page || limit) {
            const result = await topicService.getTopics(req.query);
            return res.status(200).json(result);
        }

        // Logic cũ cho Mobile App (khi cần tiến độ học user)
        const userId = req.user ? req.user.id : null;
        if (!userId) {
            // Nếu không có user login mà cũng không phân trang -> vẫn trả về list topic thuần (ko progress)
            const result = await topicService.getTopics(req.query);
            return res.status(200).json(result);
        }

        // GỌI HÀM LẤY TIẾN ĐỘ CHO APP
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
