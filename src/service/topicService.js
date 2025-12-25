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
    const totalTopics = await Topic.countDocuments();
    let requestedOrder = parseInt(topicData.order);

    // 1. Tự động gán order nếu thiếu hoặc vượt quá giới hạn
    if (isNaN(requestedOrder) || requestedOrder > totalTopics + 1 || requestedOrder < 1) {
        topicData.order = totalTopics + 1;
    } else {
        // 2. Dồn hàng: Tăng order của các topic đứng sau
        await Topic.updateMany(
            { order: { $gte: requestedOrder } },
            { $inc: { order: 1 } }
        );
        topicData.order = requestedOrder;
    }

    const topic = new Topic(topicData);
    await topic.save();
    return topic;
};

const updateTopic = async (topicId, topicData) => {
    const currentTopic = await Topic.findById(topicId);
    if (!currentTopic) throw new Error('Không tìm thấy chủ đề');

    if (topicData.order !== undefined) {
        const totalTopics = await Topic.countDocuments();
        let newOrder = parseInt(topicData.order);
        const oldOrder = currentTopic.order;

        // Giới hạn newOrder trong khoảng [1, totalTopics]
        if (newOrder < 1) newOrder = 1;
        if (newOrder > totalTopics) newOrder = totalTopics;

        if (newOrder !== oldOrder) {
            if (newOrder < oldOrder) {
                // Di chuyển lên trên: Tăng các topic ở giữa
                await Topic.updateMany(
                    { order: { $gte: newOrder, $lt: oldOrder } },
                    { $inc: { order: 1 } }
                );
            } else {
                // Di chuyển xuống dưới: Giảm các topic ở giữa
                await Topic.updateMany(
                    { order: { $gt: oldOrder, $lte: newOrder } },
                    { $inc: { order: -1 } }
                );
            }
            topicData.order = newOrder;
        }
    }

    const updated = await Topic.findByIdAndUpdate(topicId, topicData, { new: true });
    return updated;
};

const deleteTopic = async (topicId) => {
    const topic = await Topic.findById(topicId);
    if (!topic) {
        throw new Error('Không tìm thấy chủ đề');
    }

    const deletedOrder = topic.order;

    // XÓA LIÊN KẾT (CASCADING DELETE) 
    await Vocabulary.deleteMany({ topic: topicId });
    await Exercise.deleteMany({ topicId: topicId });

    await Topic.findByIdAndDelete(topicId);

    // DỒN HÀNG LÊN: Giảm order của các bài đứng sau
    await Topic.updateMany(
        { order: { $gt: deletedOrder } },
        { $inc: { order: -1 } }
    );

    return { message: 'Đã xóa chủ đề và toàn bộ dữ liệu liên quan thành công' };
};

const getTopicsWithProgress = async (userId, filters = {}) => {
    const { page, limit, sortBy = 'order', sortOrder = 'asc' } = filters;

    const sortOrderNum = sortOrder === 'asc' ? 1 : -1;

    // Đếm tổng số topics
    const total = await Topic.countDocuments({});

    // Build query
    let query = Topic.find({}).sort({ [sortBy]: sortOrderNum });

    // PAGINATION: Chỉ apply nếu có page hoặc limit
    let pageNum = 1;
    let limitNum = total; // Mặc định lấy tất cả

    if (page || limit) {
        pageNum = parseInt(page) || 1;
        limitNum = parseInt(limit) || 6;
        const skip = (pageNum - 1) * limitNum;
        query = query.skip(skip).limit(limitNum);
    }

    const topics = await query.lean();

    if (!topics.length) {
        // Nếu có pagination, trả về format có metadata
        if (page || limit) {
            return {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum),
                data: []
            };
        }
        return [];
    }

    // HELPER FUNCTION: Tính progress cho 1 topic
    const calculateTopicProgress = async (topic) => {
        const topicId = topic._id;

        // Đếm tổng từ trong Topic này
        const totalWords = await Vocabulary.countDocuments({ topic: topicId });

        const learnedDocs = await UserVocabulary.find({
            user: userId,
            status: 'memorized'
        }).populate({
            path: 'vocabulary',
            match: { topic: topicId }
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
    };

    // Tính progress cho tất cả topics
    const topicsWithData = await Promise.all(topics.map(calculateTopicProgress));

    // Nếu có pagination, trả về format có metadata
    if (page || limit) {
        return {
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum),
            data: topicsWithData
        };
    }

    // Không có pagination, trả về array thuần
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

