const Submission = require('../model/Submission');
const Progress = require('../model/Progress');
const Vocabulary = require('../model/Vocabulary');
const Exercise = require('../model/Exercise');
const Topic = require('../model/Topic');
const UserVocabulary = require('../model/UserVocabulary');
const User = require('../model/User');
const mongoose = require('mongoose');

const submitExercise = async (submissionData, userId) => {
    submissionData.userId = submissionData.userId || userId;
    const submission = new Submission(submissionData);
    await submission.save();
    return { message: 'Nộp bài thành công', id: submission._id };
};

const updateProgress = async (progressData, userId) => {
    const { topicId, lessonId, score } = progressData;
    const uid = userId;

    let progress = await Progress.findOne({ userId: uid, lessonId });
    if (!progress) {
        progress = new Progress({ userId: uid, topicId, lessonId, completed: true, score });
    } else {
        progress.score = score;
        progress.completed = true;
        progress.lastUpdated = new Date();
    }
    await progress.save();
    return progress;
};

const getLearningStats = async (userId) => {
    // Thống kê tổng quan
    const totalVocab = await Vocabulary.countDocuments();
    const learnedVocab = await Progress.countDocuments({
        userId, completed: true
    });

    const totalExercises = await Exercise.countDocuments();
    const completedExercises = await Submission.countDocuments({ userId });

    // Tiến độ theo level
    const levelProgress = await Progress.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId) } },
        { $lookup: { from: 'topics', localField: 'topicId', foreignField: '_id', as: 'topic' } },
        {
            $group: {
                _id: '$topic.level',
                completed: { $sum: { $cond: ['$completed', 1, 0] } },
                total: { $sum: 1 }
            }
        }
    ]);

    // Điểm số trung bình
    const averageScore = await Submission.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId) } },
        { $group: { _id: null, avgScore: { $avg: '$score' } } }
    ]);

    return {
        learnedVocab,
        totalVocab,
        completedExercises,
        totalExercises,
        levelProgress,
        averageScore: averageScore[0]?.avgScore || 0,
        completionRate: Math.round((learnedVocab / totalVocab) * 100) || 0
    };
};

const getDetailedProgress = async (userId, days = 30) => {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Thống kê học tập theo ngày
    const dailyProgress = await Submission.aggregate([
        {
            $match: {
                userId: new mongoose.Types.ObjectId(userId),
                submittedAt: { $gte: startDate }
            }
        },
        {
            $group: {
                _id: {
                    year: { $year: '$submittedAt' },
                    month: { $month: '$submittedAt' },
                    day: { $dayOfMonth: '$submittedAt' }
                },
                exercisesCompleted: { $sum: 1 },
                averageScore: { $avg: '$score' },
                totalXP: { $sum: '$score' }
            }
        },
        { $sort: { '_id.year': -1, '_id.month': -1, '_id.day': -1 } }
    ]);

    return { dailyProgress };
};

// Bản đồ Level: User Level (A, B, C) -> Các sub-level (A1, A2...)
const LEVEL_MAP = {
    'A': ['A1', 'A2'],
    'B': ['B1', 'B2'],
    'C': ['C1', 'C2'],
};
const ORDERED_LEVELS = ['A', 'B', 'C'];
const MAX_LEVEL_INDEX = ORDERED_LEVELS.length - 1;


const calculateUserProgress = async (userId) => {
    // 1. Lấy TẤT CẢ Topic đang hoạt động trong hệ thống
    // (Bỏ điều kiện { level: ... })
    const allTopics = await Topic.find({}).select('_id');
    const totalTopics = allTopics.length;
    const allTopicIds = allTopics.map(t => t._id);

    // Nếu hệ thống chưa có topic nào
    if (totalTopics === 0) {
        return {
            displayTitle: "Học từ vựng",
            percent: 0,
            completedTopics: 0,
            totalTopics: 0
        };
    }

    // 2. Thống kê: Tổng số từ vựng trong mỗi Topic
    const topicVocabCounts = await Vocabulary.aggregate([
        { $match: { topic: { $in: allTopicIds } } },
        { $group: { _id: "$topic", count: { $sum: 1 } } }
    ]);

    // Chuyển về Map: { "topicId_A": 20, "topicId_B": 15 ... }
    const topicTotalMap = topicVocabCounts.reduce((acc, curr) => {
        acc[curr._id.toString()] = curr.count;
        return acc;
    }, {});

    // 3. Thống kê: Số từ user đã thuộc (memorized) trong mỗi Topic
    const topicLearnedCounts = await UserVocabulary.aggregate([
        { $match: { user: new mongoose.Types.ObjectId(userId), status: 'memorized' } },
        {
            $lookup: {
                from: 'vocabularies',
                localField: 'vocabulary',
                foreignField: '_id',
                as: 'vocabData'
            }
        },
        { $unwind: '$vocabData' },
        { $match: { "vocabData.topic": { $in: allTopicIds } } },
        { $group: { _id: "$vocabData.topic", count: { $sum: 1 } } }
    ]);

    const topicLearnedMap = topicLearnedCounts.reduce((acc, curr) => {
        acc[curr._id.toString()] = curr.count;
        return acc;
    }, {});

    // 4. Tính toán số Topic đã hoàn thành
    let completedTopicsCount = 0;
    const TOPIC_COMPLETION_THRESHOLD = 0.9; // Hoàn thành 90% từ vựng thì tính là xong Topic đó

    for (const topicId of allTopicIds) {
        const tid = topicId.toString();
        const totalVocab = topicTotalMap[tid] || 0;
        const learnedVocab = topicLearnedMap[tid] || 0;

        // Chỉ tính hoàn thành nếu Topic có từ vựng và user đã học > 90%
        if (totalVocab > 0 && (learnedVocab / totalVocab) >= TOPIC_COMPLETION_THRESHOLD) {
            completedTopicsCount++;
        }
    }

    // 5. Tính phần trăm tổng thể
    const overallPercentage = (completedTopicsCount / totalTopics) * 100;

    return {
        displayTitle: "Tiến độ học tập", // Tiêu đề chung
        percent: parseFloat(overallPercentage.toFixed(2)), // VD: 15.5
        completedTopics: completedTopicsCount,
        totalTopics: totalTopics,
        // Các field cũ giữ lại để tránh lỗi frontend nếu chưa kịp sửa, nhưng set null hoặc false
        overallLevel: "All",
        canLevelUp: false
    };
};


/**
 * Chuyển Level (A -> B, B -> C)
 */
const levelUpUser = async (userId, currentLevel) => {
    const userIndex = ORDERED_LEVELS.indexOf(currentLevel);

    if (userIndex === MAX_LEVEL_INDEX) {
        return { message: "Bạn đã hoàn thành tất cả các Level." };
    }

    const nextLevel = ORDERED_LEVELS[userIndex + 1];

    // Cập nhật Level trong User Model
    const updatedUser = await User.findByIdAndUpdate(
        userId,
        { level: nextLevel },
        { new: true }
    );

    return {
        message: `Chúc mừng! Bạn đã lên Level ${nextLevel}!`,
        newLevel: nextLevel
    };
};

module.exports = {
    submitExercise,
    updateProgress,
    getLearningStats,
    getDetailedProgress,
    calculateUserProgress,
    levelUpUser
};

