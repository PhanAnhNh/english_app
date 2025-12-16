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
    await Topic.findByIdAndDelete(topicId);
    return { message: 'Đã xóa thành công' };
};
const getTopicsWithProgress = async (userId) => {
    // 1. Lấy danh sách Topic
    const topics = await Topic.find({}).lean();
    if (!topics.length) return [];

    const topicIds = topics.map(t => t._id);

    // 2. Đếm tổng từ vựng
    const vocabCounts = await Vocabulary.aggregate([
        { $match: { topic: { $in: topicIds } } },
        { $group: { _id: "$topic", total: { $sum: 1 } } }
    ]);
    const totalMap = {};
    vocabCounts.forEach(i => totalMap[i._id.toString()] = i.total);

    // 3. Đếm từ đã thuộc
    const learnedCounts = await UserVocabulary.aggregate([
        { $match: { user: new mongoose.Types.ObjectId(userId), status: 'memorized' } },
        {
            $lookup: {
                from: 'vocabularies', localField: 'vocabulary', foreignField: '_id', as: 'vocabData'
            }
        },
        { $unwind: '$vocabData' },
        { $match: { "vocabData.topic": { $in: topicIds } } },
        { $group: { _id: "$vocabData.topic", learned: { $sum: 1 } } }
    ]);
    const learnedMap = {};
    learnedCounts.forEach(i => learnedMap[i._id.toString()] = i.learned);

    // 4. Ghép data
    return topics.map(topic => {
        const tid = topic._id.toString();
        const total = totalMap[tid] || 0;
        const learned = learnedMap[tid] || 0;
        const percent = total > 0 ? Math.round((learned / total) * 100) : 0;

        return {
            ...topic,
            progress: percent, // Trả về tiến độ (0-100)
            learnedWords: learned,
            totalWords: total
        };
    });
};

module.exports = {
    getTopics,
    getTopicById,
    createTopic,
    updateTopic,
    getTopicsWithProgress,
    deleteTopic
};

