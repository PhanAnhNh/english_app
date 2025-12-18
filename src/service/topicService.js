const Topic = require('../model/Topic');
const Vocabulary = require('../model/Vocabulary');
const Exercise = require('../model/Exercise');
const UserVocabulary = require('../model/UserVocabulary');
const mongoose = require('mongoose');

const getTopics = async (filters) => {
    const { page = 1, limit, sortBy = 'createdAt', sortOrder = 'asc', level } = filters;
    let filter = level ? { level } : {};

    const sortOrderNum = sortOrder === 'asc' ? 1 : -1;

    const total = await Topic.countDocuments(filter);
    let query = Topic.find(filter)
        .sort({ [sortBy]: sortOrderNum });

    if (limit && !isNaN(parseInt(limit))) {
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        query = query.skip(skip).limit(limitNum);
    }

    const data = await query;

    return {
        total,
        page: parseInt(page) || 1,
        limit: limit ? parseInt(limit) : total,
        totalPages: limit ? Math.ceil(total / parseInt(limit)) : 1,
        data
    };
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

    // XÓA LIÊN KẾT (CASCADING DELETE) 
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

