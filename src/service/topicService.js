const Topic = require('../model/Topic');

const getTopics = async (filters) => {
    const { page = 1, limit = 100, sortBy = 'createdAt', sortOrder = 'asc', level } = filters;
    let filter = level ? { level } : {};

    const skip = (page - 1) * limit;
    const sortOrderNum = sortOrder === 'asc' ? 1 : -1;

    const total = await Topic.countDocuments(filter);
    const data = await Topic.find(filter)
        .sort({ [sortBy]: sortOrderNum })
        .skip(skip)
        .limit(limit);

    return { total, page, limit, totalPages: Math.ceil(total / limit), data };
};

const getTopicById = async (topicId) => {
    const item = await Topic.findById(topicId);
    if (!item) {
        throw new Error('Không tìm thấy chủ đề');
    }
    return item;
};

const createTopic = async (topicData) => {
    const topic = new Topic(topicData);
    await topic.save();
    return topic;
};

const updateTopic = async (topicId, topicData) => {
    const updated = await Topic.findByIdAndUpdate(topicId, topicData, { new: true });
    return updated;
};

const deleteTopic = async (topicId) => {
    const topic = await Topic.findById(topicId);
    if (!topic) {
        throw new Error('Không tìm thấy chủ đề');
    }

    // Xóa image trên Cloudinary


    await Topic.findByIdAndDelete(topicId);
    return { message: 'Đã xóa thành công' };
};

module.exports = {
    getTopics,
    getTopicById,
    createTopic,
    updateTopic,
    deleteTopic
};

