const Topic = require('../model/Topic');
const Vocabulary = require('../model/Vocabulary');          // <--- BẠN ĐANG THIẾU DÒNG NÀY
const UserVocabulary = require('../model/UserVocabulary');
const Exercise = require('../model/Exercise');
const mongoose = require('mongoose');

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
    await Vocabulary.deleteMany({ topic: topicId });
    await Exercise.deleteMany({ topicId: topicId });

    await Topic.findByIdAndDelete(topicId);
    return { message: 'Đã xóa chủ đề và toàn bộ dữ liệu liên quan thành công' };
};

const getTopicsWithProgress = async (userId) => {
    // 1. Lấy tất cả topic
    const topics = await Topic.find({}).lean();
    if (!topics.length) return [];

    const topicIds = topics.map(t => t._id);

    const topicsWithData = await Promise.all(topics.map(async (topic) => {
        const topicId = topic._id;

        // Đếm tổng từ trong Topic này
        const totalWords = await Vocabulary.countDocuments({ topic: topicId });

        const learnedDocs = await UserVocabulary.find({
            user: userId,
            status: 'memorized'
        }).populate({
            path: 'vocabulary',
            match: { topic: topicId } // Chỉ lấy những từ thuộc topic này
        });

        const learnedWords = learnedDocs.filter(doc => doc.vocabulary).length;

        // Tính %
        let progress = 0;
        if (totalWords > 0) {
            progress = Math.round((learnedWords / totalWords) * 100);
        }

        return {
            ...topic,
            totalWords,
            learnedWords,
            progress
        };
    }));

    return topicsWithData;
};

module.exports = {
    getTopics,
    getTopicById,
    createTopic,
    updateTopic,
    getTopicsWithProgress,
    deleteTopic
};

